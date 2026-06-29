"use server";
/* ============================================================
   Patient bulk-import server actions (Node).

   previewImport(formData): parse + validate an uploaded .xlsx/.csv → return the
     valid/invalid/duplicate summary. Read-only (no DB writes, no audit).
   commitImport(rows): insert the confirmed valid rows in one transaction; one
     CREATE audit row per patient + one IMPORT summary row.

   Both gated by requireSession() + requireCan(actor, "create"). PHI from the
   file (DOB/MBI) is encrypted on insert exactly like manual entry. The file is
   parsed in memory and never written to disk or sent outside this DB.
   ============================================================ */
import { revalidatePath } from "next/cache";
import { db } from "../../../../src/lib/phi/db.js";
import { patients } from "../../../../src/lib/phi/schema.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { encryptField } from "../../../../src/lib/phi/crypto.js";
import { patientInputSchema } from "../../../../src/lib/phi/validation.js";
import { parsePatientWorkbook } from "../../../../src/lib/phi/import.js";

const MAX_ROWS = 2000;

export async function previewImport(_prev, formData) {
  const actor = await requireSession();
  requireCan(actor, "create");

  const file = formData.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return { error: "Please choose a .xlsx or .csv file." };
  }
  const name = file.name || "";
  if (!/\.(xlsx|csv)$/i.test(name)) {
    return { error: "Unsupported file type. Use .xlsx or .csv." };
  }

  let result;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    result = await parsePatientWorkbook(buffer, name);
  } catch (err) {
    return { error: `Could not read the file: ${err.message}` };
  }

  if (result.valid.length + result.invalid.length === 0) {
    return { error: "No data rows found. Check the header row matches the template." };
  }
  if (result.valid.length + result.invalid.length > MAX_ROWS) {
    return { error: `Too many rows (max ${MAX_ROWS} per import).` };
  }

  return {
    ok: true,
    fileName: name,
    headers: result.headers,
    // Only the valid rows' data is sent back for commit; invalid rows are shown
    // with their errors but cannot be imported.
    valid: result.valid.map((v) => ({
      rowNumber: v.rowNumber,
      data: v.data,
      duplicate: result.duplicates.has(v.rowNumber),
    })),
    invalid: result.invalid.map((iv) => ({
      rowNumber: iv.rowNumber,
      errors: iv.errors,
    })),
  };
}

export async function commitImport(payload) {
  const actor = await requireSession();
  requireCan(actor, "create");

  const fileName = payload?.fileName || "(unknown)";
  const incoming = Array.isArray(payload?.rows) ? payload.rows : [];
  if (!incoming.length) return { error: "Nothing to import." };
  if (incoming.length > MAX_ROWS) return { error: `Too many rows (max ${MAX_ROWS}).` };

  // Re-validate server-side — never trust the client-submitted rows.
  const clean = [];
  for (const d of incoming) {
    const parsed = patientInputSchema.safeParse(d);
    if (parsed.success) clean.push(parsed.data);
  }
  if (!clean.length) return { error: "No valid rows to import after re-validation." };

  let imported = 0;
  await db.transaction(async (tx) => {
    for (const d of clean) {
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

      await writeAudit(tx, {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "CREATE",
        entity: "patient",
        entityId: row.id,
        meta: { via: "import" },
        changes: [
          { field: "firstName", old: null, new: d.firstName },
          { field: "lastName", old: null, new: d.lastName },
          { field: "status", old: null, new: "NEW" },
        ],
      });
      imported += 1;
    }

    // One bulk-disclosure/import summary row.
    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "IMPORT",
      entity: "patient",
      meta: { fileName, submitted: incoming.length, imported },
    });
  });

  revalidatePath("/portal/patients");
  return { ok: true, imported };
}
