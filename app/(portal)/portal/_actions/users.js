"use server";
/* Admin-only user management: create, set role, activate/deactivate.
   Each: requireSession -> requireCan(manageUsers) -> transaction + audit. */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash as argonHash } from "@node-rs/argon2";
import { z } from "zod";
import { db } from "../../../../src/lib/phi/db.js";
import { users } from "../../../../src/lib/phi/schema.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";

const argonOpts = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

const createSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(10, "Password must be at least 10 characters").max(200),
  role: z.enum(["ADMIN", "BD", "CS"]),
});

export async function createUser(_prev, formData) {
  const actor = await requireSession();
  requireCan(actor, "manageUsers");

  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const email = parsed.data.email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return { error: "A user with that email already exists." };

  const passwordHash = await argonHash(parsed.data.password, argonOpts);

  let newId;
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(users)
      .values({
        email,
        passwordHash,
        role: parsed.data.role,
        createdBy: actor.id,
      })
      .returning({ id: users.id });
    newId = row.id;
    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "CREATE",
      entity: "user",
      entityId: newId,
      changes: [
        { field: "email", old: null, new: email },
        { field: "role", old: null, new: parsed.data.role },
      ],
    });
  });

  revalidatePath("/portal/admin/users");
  redirect("/portal/admin/users");
}

export async function setRole(userId, formData) {
  const actor = await requireSession();
  requireCan(actor, "manageUsers");
  const role = String(formData.get("role") || "");
  if (!["ADMIN", "BD", "CS"].includes(role)) return { error: "Invalid role." };

  await db.transaction(async (tx) => {
    const [before] = await tx
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!before || before.role === role) return;
    await tx
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "UPDATE",
      entity: "user",
      entityId: userId,
      changes: [{ field: "role", old: before.role, new: role }],
    });
  });

  revalidatePath("/portal/admin/users");
  return { ok: true };
}

export async function setActive(userId, isActive) {
  const actor = await requireSession();
  requireCan(actor, "manageUsers");

  // Guard: an admin cannot deactivate themselves (avoid lockout).
  if (userId === actor.id && !isActive) {
    return { error: "You cannot deactivate your own account." };
  }

  await db.transaction(async (tx) => {
    const [before] = await tx
      .select({ isActive: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!before || before.isActive === isActive) return;
    await tx
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId));
    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "UPDATE",
      entity: "user",
      entityId: userId,
      changes: [{ field: "isActive", old: before.isActive, new: isActive }],
    });
  });

  revalidatePath("/portal/admin/users");
  return { ok: true };
}
