"use server";
/* Add a timestamped note to a patient (append-only thread, BD+CS+Admin). */
import { revalidatePath } from "next/cache";
import { db } from "../../../../src/lib/phi/db.js";
import { patientNotes } from "../../../../src/lib/phi/schema.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { noteSchema } from "../../../../src/lib/phi/validation.js";

export async function addNote(patientId, _prev, formData) {
  const actor = await requireSession();
  requireCan(actor, "read"); // any authenticated staff may add a note

  const parsed = noteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid note." };
  }

  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(patientNotes)
      .values({ patientId, body: parsed.data.body, authorId: actor.id })
      .returning({ id: patientNotes.id });

    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "CREATE",
      entity: "note",
      entityId: row.id,
      meta: { patientId },
    });
  });

  revalidatePath(`/portal/patients/${patientId}`);
  return { ok: true };
}
