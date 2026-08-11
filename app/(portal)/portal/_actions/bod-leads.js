"use server";
/* ============================================================
   BOD-lead mutation actions. Each: requireSession() -> RBAC -> DB transaction
   (read-before -> authorize record-level -> mutate -> writeAudit) so the action
   and its audit row commit atomically. Same shape as _actions/patients.js.
   ============================================================ */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../../../../src/lib/phi/db.js";
import { bodLeads } from "../../../../src/lib/phi/schema.js";
import { requireSession } from "../../../../src/lib/phi/session.js";
import {
  requireCanBodLead,
  assertCanEditBodLead,
} from "../../../../src/lib/phi/rbac.js";
import { writeAudit } from "../../../../src/lib/phi/audit.js";
import { getUserName } from "../../../../src/lib/phi/bod-leads.repo.js";
import { toBodLeadRow, parseUsDate } from "../../../../src/lib/phi/bod-lead-map.js";
import { pickReferrerUserId } from "../../../../src/lib/phi/bod-leads.options.js";
import { diffFields } from "../../../../src/lib/phi/diff.js";
import {
  bodLeadInputSchema,
  bodLeadStatusSchema,
} from "../../../../src/lib/phi/validation.js";

// Fields compared for the audit diff on update. `dob` is in diff.js's
// REDACTED_FIELDS, so its plaintext never reaches the audit log.
const AUDITED_FIELDS = [
  "leadSource",
  "customerName",
  "phone",
  "state",
  "dob",
  "tier",
  "preferredContactChannel",
  "consentToContact",
  "consentDate",
  "serviceInterested",
  "founderNote",
  "dateReceived",
];

function parseForm(formData) {
  const obj = {};
  for (const [k, v] of formData.entries()) obj[k] = v;
  return obj;
}

/** CREATE — ADMIN/BD/BOD. New lead starts at status NEW. */
export async function createBodLead(_prev, formData) {
  const actor = await requireSession();
  requireCanBodLead(actor, "create");

  const parsed = bodLeadInputSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const d = parsed.data;

  // Attribution comes from the session for a BOD — a disabled input in the
  // browser proves nothing, so the submitted value is discarded here.
  let referrerUserId;
  try {
    referrerUserId = pickReferrerUserId({ actor, formValue: d.referrerUserId });
  } catch (err) {
    return { error: err.message };
  }

  const referrerUser = await getUserName(referrerUserId);
  if (!referrerUser) return { error: "Referrer account not found." };
  if (referrerUser.role !== "BOD") {
    return { error: "Referrer must be a BOD account." };
  }

  let newId;
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(bodLeads)
      .values({
        ...toBodLeadRow(d),
        referrerUserId,
        referrer: referrerUser.name, // snapshot: renames must not rewrite history
        leadStatus: "NEW",
        dateReceived: parseUsDate(d.dateReceived) || new Date(),
        createdBy: actor.id,
      })
      .returning({ id: bodLeads.id, leadNo: bodLeads.leadNo });
    newId = row.id;

    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "CREATE",
      entity: "bod_lead",
      entityId: newId,
      // Non-sensitive identity only; DOB never in plaintext.
      changes: [
        { field: "leadNo", old: null, new: row.leadNo },
        { field: "customerName", old: null, new: d.customerName },
        { field: "referrer", old: null, new: referrerUser.name },
        { field: "leadStatus", old: null, new: "NEW" },
      ],
    });
  });

  revalidatePath("/portal/bod-leads");
  redirect(`/portal/bod-leads/${newId}`);
}

/** UPDATE — ADMIN/BD any; BOD only their own lead while still NEW. */
export async function updateBodLead(leadId, _prev, formData) {
  const actor = await requireSession();
  requireCanBodLead(actor, "update");

  const parsed = bodLeadInputSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const d = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(bodLeads)
        .where(eq(bodLeads.id, leadId))
        .limit(1);
      if (!before) throw new Error("Lead not found.");
      assertCanEditBodLead(actor, before);

      // Decrypted "before" view for diffing; the sensitive field is compared
      // by redacted marker only.
      // Blank "date received" keeps the original rather than resetting to now.
      const dateReceived = parseUsDate(d.dateReceived) || before.dateReceived;

      const beforeView = { ...before, dob: "«enc»" };
      const afterView = {
        ...d,
        dob: "«enc»",
        consentDate: parseUsDate(d.consentDate),
        dateReceived,
      };

      // referrerUserId / referrer are deliberately absent: attribution is set
      // once at creation and is not editable by anyone.
      await tx
        .update(bodLeads)
        .set({
          ...toBodLeadRow(d),
          dateReceived,
          lastModifiedBy: actor.id,
          lastModifiedAt: new Date(),
        })
        .where(eq(bodLeads.id, leadId));

      const changes = diffFields(beforeView, afterView, AUDITED_FIELDS);
      await writeAudit(tx, {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "UPDATE",
        entity: "bod_lead",
        entityId: leadId,
        changes,
      });
    });
  } catch (err) {
    if (err.code === "FORBIDDEN") return { error: err.message };
    return { error: err.message || "Update failed." };
  }

  revalidatePath(`/portal/bod-leads/${leadId}`);
  redirect(`/portal/bod-leads/${leadId}`);
}

/** STATUS change — ADMIN/BD only. BOD members watch, they don't move the pipeline. */
export async function changeBodLeadStatus(leadId, formData) {
  const actor = await requireSession();
  requireCanBodLead(actor, "status");

  const parsed = bodLeadStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return { error: "Invalid status." };
  const next = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [before] = await tx
        .select({ leadStatus: bodLeads.leadStatus, deletedAt: bodLeads.deletedAt })
        .from(bodLeads)
        .where(eq(bodLeads.id, leadId))
        .limit(1);
      if (!before) throw new Error("Lead not found.");
      if (before.deletedAt) throw new Error("Lead has been deleted.");
      if (before.leadStatus === next) return;

      await tx
        .update(bodLeads)
        .set({
          leadStatus: next,
          lastModifiedBy: actor.id,
          lastModifiedAt: new Date(),
        })
        .where(eq(bodLeads.id, leadId));

      await writeAudit(tx, {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "STATUS_CHANGE",
        entity: "bod_lead",
        entityId: leadId,
        changes: [{ field: "leadStatus", old: before.leadStatus, new: next }],
      });
    });
  } catch (err) {
    if (err.code === "FORBIDDEN") return { error: err.message };
    return { error: err.message || "Status change failed." };
  }

  revalidatePath(`/portal/bod-leads/${leadId}`);
  revalidatePath("/portal/bod-leads");
  return { ok: true };
}

/** SOFT DELETE — Admin only. Record retained, never destroyed. */
export async function softDeleteBodLead(leadId) {
  const actor = await requireSession();
  requireCanBodLead(actor, "delete"); // ADMIN only

  await db.transaction(async (tx) => {
    const [before] = await tx
      .select({ id: bodLeads.id, deletedAt: bodLeads.deletedAt })
      .from(bodLeads)
      .where(eq(bodLeads.id, leadId))
      .limit(1);
    if (!before || before.deletedAt) return;

    await tx
      .update(bodLeads)
      .set({ deletedAt: new Date(), deletedBy: actor.id })
      .where(eq(bodLeads.id, leadId));

    await writeAudit(tx, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "DELETE",
      entity: "bod_lead",
      entityId: leadId,
      meta: { softDelete: true },
    });
  });

  revalidatePath("/portal/bod-leads");
  redirect("/portal/bod-leads");
}
