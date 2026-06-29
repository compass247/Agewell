/* ============================================================
   Patient read-side query helpers.

   Centralizes list/search/get so the dashboard (RSC) and detail view share one
   query path. Returns rows with sensitive fields DECRYPTED for display; callers
   are already past requireSession()/RBAC. Soft-deleted rows are excluded unless
   includeDeleted is set (admin views).
   ============================================================ */
import {
  and,
  or,
  eq,
  ilike,
  gte,
  lte,
  isNull,
  desc,
  asc,
  count,
} from "drizzle-orm";
import { db } from "./db.js";
import { patients, users } from "./schema.js";
import { decryptField } from "./crypto.js";

const SORTABLE = {
  lastName: patients.lastName,
  createdAt: patients.createdAt,
  status: patients.status,
  referralSource: patients.referralSource,
};

const PAGE_SIZE = 25;

function buildWhere({ search, status, bdRepId, csId, from, to, includeDeleted }) {
  const clauses = [];
  if (!includeDeleted) clauses.push(isNull(patients.deletedAt));
  if (status) clauses.push(eq(patients.status, status));
  if (bdRepId) clauses.push(eq(patients.createdBy, bdRepId));
  if (csId) clauses.push(eq(patients.assignedCsId, csId));
  if (from) clauses.push(gte(patients.createdAt, from));
  if (to) clauses.push(lte(patients.createdAt, to));
  if (search) {
    const like = `%${search}%`;
    // Name + phone are plaintext/indexed. DOB/MBI are encrypted → not searchable.
    clauses.push(
      or(
        ilike(patients.firstName, like),
        ilike(patients.lastName, like),
        ilike(patients.primaryPhone, like),
        ilike(patients.secondaryPhone, like)
      )
    );
  }
  return clauses.length ? and(...clauses) : undefined;
}

/**
 * Paginated list for the dashboard. Returns { rows, total, page, pageSize }.
 * rows include the assigned CS email and decrypted DOB for display.
 */
export async function listPatients(opts = {}) {
  const page = Math.max(1, Number(opts.page) || 1);
  const pageSize = Number(opts.pageSize) || PAGE_SIZE;
  const where = buildWhere(opts);

  const sortCol = SORTABLE[opts.sort] || patients.createdAt;
  const orderBy = opts.dir === "asc" ? asc(sortCol) : desc(sortCol);

  const cs = users; // alias for assigned CS join

  const rows = await db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      dobEnc: patients.dobEnc,
      primaryPhone: patients.primaryPhone,
      status: patients.status,
      referralSource: patients.referralSource,
      createdAt: patients.createdAt,
      assignedCsId: patients.assignedCsId,
      assignedCsEmail: cs.email,
    })
    .from(patients)
    .leftJoin(cs, eq(patients.assignedCsId, cs.id))
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(patients)
    .where(where);

  return {
    rows: rows.map((r) => ({ ...r, dob: safeDecrypt(r.dobEnc), dobEnc: undefined })),
    total,
    page,
    pageSize,
  };
}

/** Full single record with all sensitive fields decrypted. Null if not found. */
export async function getPatient(id, { includeDeleted = true } = {}) {
  const where = includeDeleted
    ? eq(patients.id, id)
    : and(eq(patients.id, id), isNull(patients.deletedAt));

  const [row] = await db.select().from(patients).where(where).limit(1);
  if (!row) return null;

  return {
    ...row,
    dob: safeDecrypt(row.dobEnc),
    medicareMbi: safeDecrypt(row.medicareMbiEnc),
  };
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
