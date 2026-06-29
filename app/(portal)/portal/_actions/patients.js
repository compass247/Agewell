"use server";
/* ============================================================
   Patient mutation actions. Each: requireSession() -> RBAC -> DB transaction
   (read-before -> authorize record-level -> mutate -> writeAudit) so the action
   and its audit row commit atomically.
   ============================================================ */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../../../../src/lib/phi/db.js";
import { patients } from "../../../../src/lib/phi/schema.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import {
  requireCan,
  assertCanEditPatient,
} from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { encryptField } from "../../../../src/lib/phi/crypto.js";
import { diffFields } from "../../../../src/lib/phi/diff.js";
import {
  patientInputSchema,
  statusSchema,
} from "../../../../src/lib/phi/validation.js";

// Fields compared for the audit diff on update (sensitive ones auto-redacted).
const AUDITED_FIELDS = [
  "patientExternalId",
  "firstName",
  "lastName",
  "dob",
  "primaryPhone",
  "secondaryPhone",
  "email",
  "address1",
  "address2",
  "city",
  "state",
  "zip",
  "medicareMbi",
  "insurancePlan",
  "insuranceMemberId",
  "emergencyName",
  "emergencyRelationship",
  "emergencyPhone",
  "referralSource",
  "preferredLanguage",
  "notes",
  "status",
];

function parseForm(formData) {
  const obj = {};
  for (const [k, v] of formData.entries()) obj[k] = v;
  return obj;
}

/** CREATE — BD/CS/Admin. New record starts at status NEW. */
export async function createPatient(_prev, formData) {
  const actor = await requireSession();
  requireCan(actor, "create");

  const parsed = patientInputSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const d = parsed.data;

  let newId;
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(patients)
      .values({
        patientExternalId: d.patientExternalId,
        firstName: d.firstName,
        lastName: d.lastName,
        dobEnc: encryptField(d.dob),
        primaryPhone: d.primaryPhone,
        secondaryPhone: d.secondaryPhone,
        email: d.email,
        address1: d.address1,
        address2: d.address2,
        city: d.city,
        state: d.state,
        zip: d.zip,
        medicareMbiEnc: encryptField(d.medicareMbi),
        insurancePlan: d.insurancePlan,
        insuranceMemberId: d.insuranceMemberId,
        emergencyName: d.emergencyName,
        emergencyRelationship: d.emergencyRelationship,
        emergencyPhone: d.emergencyPhone,
        referralSource: d.referralSource,
        preferredLanguage: d.preferredLanguage,
        notes: d.notes,
        status: "NEW",
        createdBy: actor.id,
      })
      .returning({ id: patients.id });
    newId = row.id;

    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "CREATE",
      entity: "patient",
      entityId: newId,
      // Log non-sensitive identity only; MBI/DOB never in plaintext.
      changes: [
        { field: "firstName", old: null, new: d.firstName },
        { field: "lastName", old: null, new: d.lastName },
        { field: "status", old: null, new: "NEW" },
      ],
    });
  });

  revalidatePath("/portal/patients");
  redirect(`/portal/patients/${newId}`);
}

/** UPDATE — Admin/CS any; BD only own records. */
export async function updatePatient(patientId, _prev, formData) {
  const actor = await requireSession();
  requireCan(actor, "update");

  const parsed = patientInputSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const d = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);
      if (!before) throw new Error("Patient not found.");
      assertCanEditPatient(actor, before);

      // Decrypted "before" view for diffing sensitive fields by redacted marker.
      const beforeView = {
        ...before,
        dob: "«enc»",
        medicareMbi: "«enc»",
      };
      const afterView = { ...d };

      await tx
        .update(patients)
        .set({
          patientExternalId: d.patientExternalId,
          firstName: d.firstName,
          lastName: d.lastName,
          dobEnc: encryptField(d.dob),
          primaryPhone: d.primaryPhone,
          secondaryPhone: d.secondaryPhone,
          email: d.email,
          street: d.street,
          city: d.city,
          state: d.state,
          zip: d.zip,
          medicareMbiEnc: encryptField(d.medicareMbi),
          insurancePlan: d.insurancePlan,
          insuranceMemberId: d.insuranceMemberId,
          emergencyName: d.emergencyName,
          emergencyRelationship: d.emergencyRelationship,
          emergencyPhone: d.emergencyPhone,
          referralSource: d.referralSource,
          preferredLanguage: d.preferredLanguage,
          notes: d.notes,
          lastModifiedBy: actor.id,
          lastModifiedAt: new Date(),
        })
        .where(eq(patients.id, patientId));

      const changes = diffFields(beforeView, afterView, AUDITED_FIELDS);
      await writeAudit(tx, {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "UPDATE",
        entity: "patient",
        entityId: patientId,
        changes,
      });
    });
  } catch (err) {
    if (err.code === "FORBIDDEN") return { error: err.message };
    return { error: err.message || "Update failed." };
  }

  revalidatePath(`/portal/patients/${patientId}`);
  redirect(`/portal/patients/${patientId}`);
}

/** STATUS change — Admin/CS any; BD own. */
export async function changeStatus(patientId, formData) {
  const actor = await requireSession();
  requireCan(actor, "status");

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return { error: "Invalid status." };
  const next = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);
      if (!before) throw new Error("Patient not found.");
      assertCanEditPatient(actor, before);
      if (before.status === next) return;

      await tx
        .update(patients)
        .set({
          status: next,
          lastModifiedBy: actor.id,
          lastModifiedAt: new Date(),
        })
        .where(eq(patients.id, patientId));

      await writeAudit(tx, {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "STATUS_CHANGE",
        entity: "patient",
        entityId: patientId,
        changes: [{ field: "status", old: before.status, new: next }],
      });
    });
  } catch (err) {
    if (err.code === "FORBIDDEN") return { error: err.message };
    return { error: err.message || "Status change failed." };
  }

  revalidatePath(`/portal/patients/${patientId}`);
  revalidatePath("/portal/patients");
  return { ok: true };
}

/** SOFT DELETE — Admin only. Record retained (6-yr HIPAA), never destroyed. */
export async function softDeletePatient(patientId) {
  const actor = await requireSession();
  requireCan(actor, "delete"); // ADMIN only

  await db.transaction(async (tx) => {
    const [before] = await tx
      .select({ id: patients.id, deletedAt: patients.deletedAt })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);
    if (!before || before.deletedAt) return;

    await tx
      .update(patients)
      .set({ deletedAt: new Date(), deletedBy: actor.id })
      .where(eq(patients.id, patientId));

    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "DELETE",
      entity: "patient",
      entityId: patientId,
      meta: { softDelete: true },
    });
  });

  revalidatePath("/portal/patients");
  redirect("/portal/patients");
}
