/* ============================================================
   BOD-lead read-side query helpers.

   Mirrors patients.repo.js: one query path shared by the list screen, the
   detail view and the CSV export. Rows come back with DOB DECRYPTED for
   display — callers are already past requireSession()/RBAC. Soft-deleted rows
   are excluded unless includeDeleted is set.
   ============================================================ */
import {
  and,
  or,
  eq,
  ilike,
  isNull,
  desc,
  asc,
  count,
  sql,
} from "drizzle-orm";
import { db } from "./db.js";
import { bodLeads, users } from "./schema.js";
import { decryptField } from "./crypto.js";

const SORTABLE = {
  dateReceived: bodLeads.dateReceived,
  customerName: bodLeads.customerName,
  leadStatus: bodLeads.leadStatus,
  leadNo: bodLeads.leadNo,
};

const PAGE_SIZE = 25;

function buildWhere({ search, status, source, tier, referrerUserId, includeDeleted }) {
  const clauses = [];
  if (!includeDeleted) clauses.push(isNull(bodLeads.deletedAt));
  if (status) clauses.push(eq(bodLeads.leadStatus, status));
  if (source) clauses.push(eq(bodLeads.leadSource, source));
  if (tier) clauses.push(eq(bodLeads.tier, tier));
  if (referrerUserId) clauses.push(eq(bodLeads.referrerUserId, referrerUserId));
  if (search) {
    const like = `%${search}%`;
    // Name, phone and referrer are plaintext/indexed. DOB is encrypted →
    // not searchable. Lead ID is matched on its digits (BOD-000123 → 123).
    const digits = String(search).replace(/\D/g, "");
    const clause = [
      ilike(bodLeads.customerName, like),
      ilike(bodLeads.phone, like),
      ilike(bodLeads.referrer, like),
    ];
    if (digits) clause.push(sql`${bodLeads.leadNo}::text = ${String(Number(digits))}`);
    clauses.push(or(...clause));
  }
  return clauses.length ? and(...clauses) : undefined;
}

/** Paginated list for the dashboard. Returns { rows, total, page, pageSize }. */
export async function listBodLeads(opts = {}) {
  const page = Math.max(1, Number(opts.page) || 1);
  const pageSize = Number(opts.pageSize) || PAGE_SIZE;
  const where = buildWhere(opts);

  const sortCol = SORTABLE[opts.sort] || bodLeads.dateReceived;
  const orderBy = opts.dir === "asc" ? asc(sortCol) : desc(sortCol);

  const rows = await db
    .select({
      id: bodLeads.id,
      leadNo: bodLeads.leadNo,
      leadSource: bodLeads.leadSource,
      referrer: bodLeads.referrer,
      referrerUserId: bodLeads.referrerUserId,
      customerName: bodLeads.customerName,
      phone: bodLeads.phone,
      state: bodLeads.state,
      dobEnc: bodLeads.dobEnc,
      tier: bodLeads.tier,
      preferredContactChannel: bodLeads.preferredContactChannel,
      consentToContact: bodLeads.consentToContact,
      serviceInterested: bodLeads.serviceInterested,
      leadStatus: bodLeads.leadStatus,
      dateReceived: bodLeads.dateReceived,
      deletedAt: bodLeads.deletedAt,
    })
    .from(bodLeads)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(bodLeads)
    .where(where);

  return {
    rows: rows.map((r) => ({ ...r, dob: safeDecrypt(r.dobEnc), dobEnc: undefined })),
    total,
    page,
    pageSize,
  };
}

/** Full single lead with DOB decrypted. Null if not found. */
export async function getBodLead(id, { includeDeleted = true } = {}) {
  const where = includeDeleted
    ? eq(bodLeads.id, id)
    : and(eq(bodLeads.id, id), isNull(bodLeads.deletedAt));

  const [row] = await db.select().from(bodLeads).where(where).limit(1);
  if (!row) return null;
  return { ...row, dob: safeDecrypt(row.dobEnc) };
}

/**
 * BOD accounts that can be credited with a referral — the Referrer dropdown BD
 * sees. There is no static list of referrers: adding a board member is just
 * creating their portal account.
 */
export async function listBodReferrers() {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.role, "BOD"), eq(users.isActive, true)))
    .orderBy(asc(users.name));
}

/** Display name of a user, or null. Used to snapshot bod_leads.referrer. */
export async function getUserName(userId) {
  if (!userId) return null;
  const [row] = await db
    .select({ name: users.name, role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row || null;
}

function safeDecrypt(value) {
  try {
    return decryptField(value);
  } catch {
    // Tampered/unreadable ciphertext: never crash a list render over one row.
    return null;
  }
}

export { PAGE_SIZE };
