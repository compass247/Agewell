"use server";
/* ============================================================
   Patient bulk-import server actions (Node).

   previewImport(formData): parse + validate an uploaded .xlsx/.csv → return the
     will-import vs skipped summary (skipped = invalid OR duplicate Patient ID,
     checked against the DB and within the file). Read-only (no writes, no audit).
   commitImport(rows): insert the confirmed valid rows in one transaction; one
     CREATE audit row per patient + one IMPORT summary row.

   Both gated by requireSession() + requireCan(actor, "create"). PHI from the
   file (DOB/MBI) is encrypted on insert exactly like manual entry. The file is
   parsed in memory and never written to disk or sent outside this DB.
   ============================================================ */
import { isNotNull } from "drizzle-orm";
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

/** Set of Patient IDs (patient_external_id) currently in the DB, including
    soft-deleted rows — an external ID stays "taken" even if hidden. */
async function loadExistingExternalIds() {
  const rows = await db
    .select({ id: patients.patientExternalId })
    .from(patients)
    .where(isNotNull(patients.patientExternalId));
  return new Set(rows.map((r) => r.id));
}

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
    const existingIds = await loadExistingExternalIds();
    result = await parsePatientWorkbook(buffer, name, existingIds);
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
    // Only the valid rows' data is sent back for commit; invalid rows (incl.
    // duplicate Patient IDs) are shown with their reason but cannot be imported.
    valid: result.valid.map((v) => ({
      rowNumber: v.rowNumber,
      data: v.data,
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

  // Re-check duplicate Patient IDs server-side (defense in depth against a
  // tampered payload or a concurrent import). Drop dups against the DB and
  // within this batch; blank IDs are never dups.
  const existingIds = await loadExistingExternalIds();
  const batchIds = new Set();
  const toInsert = [];
  let skippedDuplicates = 0;
  for (const d of clean) {
    if (d.patientExternalId) {
      if (existingIds.has(d.patientExternalId) || batchIds.has(d.patientExternalId)) {
        skippedDuplicates += 1;
        continue;
      }
      batchIds.add(d.patientExternalId);
    }
    toInsert.push(d);
  }
  if (!toInsert.length) {
    return { error: "All rows were duplicate Patient IDs — nothing imported." };
  }

  let imported = 0;
  await db.transaction(async (tx) => {
    for (const d of toInsert) {
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
          gender: d.gender,
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
      meta: {
        fileName,
        submitted: incoming.length,
        imported,
        skippedDuplicates,
      },
    });
  });

  revalidatePath("/portal/patients");
  return { ok: true, imported, skippedDuplicates };
}
