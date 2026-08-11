/* ============================================================
   RBAC — the central authorization matrix (defined ONCE).

   Every server action and RSC fetch calls these AFTER requireSession(), so a
   forged URL can never bypass authorization: the check lives in the action,
   not the route. Middleware only does coarse gating.

   Roles: ADMIN (full), BD (create/edit OWN records), CS (review/update all),
   BOD (board member — BOD-leads module ONLY, zero access to patients).
   ============================================================ */

export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  BD: "BD",
  CS: "CS",
  BOD: "BOD",
});

/** Throw a 403-style error. */
export function forbidden(message = "Forbidden") {
  const err = new Error(message);
  err.code = "FORBIDDEN";
  err.status = 403;
  return err;
}

/** Assert the actor has one of the allowed roles. */
export function requireRole(actor, ...allowed) {
  if (!actor || !allowed.includes(actor.role)) {
    throw forbidden(`Requires role: ${allowed.join(" or ")}`);
  }
}

/**
 * Coarse capability check on PATIENT records.
 * Record-level rules (BD-owns-own) are enforced by assertCanEditPatient.
 *
 * actions: create | read | update | status | delete | export | manageUsers
 *
 * Every case lists its roles explicitly, so BOD falls through to false on all
 * of them — board members must never reach PHI. Keep it that way.
 */
export function can(actor, action) {
  if (!actor) return false;
  const { role } = actor;
  switch (action) {
    case "read": // all roles can view patients/list
      return role === ROLES.ADMIN || role === ROLES.BD || role === ROLES.CS;
    case "create": // BD/CS/Admin create patients
      return role === ROLES.ADMIN || role === ROLES.BD || role === ROLES.CS;
    case "update": // coarse: BD allowed here; record-level narrows to own
    case "status":
      return role === ROLES.ADMIN || role === ROLES.CS || role === ROLES.BD;
    case "export": // CSV export of PHI
      return role === ROLES.ADMIN || role === ROLES.CS;
    case "delete": // soft delete
    case "manageUsers":
      return role === ROLES.ADMIN;
    default:
      return false;
  }
}

/** can() but throws instead of returning false. */
export function requireCan(actor, action) {
  if (!can(actor, action)) {
    throw forbidden(`Not permitted: ${action}`);
  }
}

/**
 * Record-level edit rule (defined ONCE — pages must not re-derive it inline):
 * ADMIN and CS may edit/status any patient; BD may only edit patients they
 * created. Boolean form for UI gating.
 */
export function canEditPatient(actor, patient) {
  if (!actor || !patient) return false;
  if (actor.role === ROLES.ADMIN || actor.role === ROLES.CS) return true;
  return actor.role === ROLES.BD && patient.createdBy === actor.id;
}

/** canEditPatient() but throws — used by the server actions. */
export function assertCanEditPatient(actor, patient) {
  if (!canEditPatient(actor, patient)) {
    throw forbidden("BD may only edit records they created.");
  }
}

/* ---------------- BOD leads (separate matrix on purpose) ----------------
   Kept apart from can() so widening one module can never silently widen the
   other: CS has no business in BOD leads, and BOD has none in patients. */

/**
 * Coarse capability check on BOD-LEAD records.
 * actions: create | read | update | status | delete | export
 */
export function canBodLead(actor, action) {
  if (!actor) return false;
  const { role } = actor;
  switch (action) {
    case "read": // BOD members see every lead, not just their own (BD's call)
      return role === ROLES.ADMIN || role === ROLES.BD || role === ROLES.BOD;
    case "create":
      return role === ROLES.ADMIN || role === ROLES.BD || role === ROLES.BOD;
    case "update": // coarse: BOD allowed here; record-level narrows to own+NEW
      return role === ROLES.ADMIN || role === ROLES.BD || role === ROLES.BOD;
    case "status": // moving a lead through the pipeline is BD's job
    case "export":
      return role === ROLES.ADMIN || role === ROLES.BD;
    case "delete": // soft delete
      return role === ROLES.ADMIN;
    default:
      return false;
  }
}

/** canBodLead() but throws instead of returning false. */
export function requireCanBodLead(actor, action) {
  if (!canBodLead(actor, action)) {
    throw forbidden(`Not permitted: ${action}`);
  }
}

/**
 * Record-level edit rule for BOD leads (defined ONCE):
 * ADMIN/BD may edit any lead; a BOD may correct only their OWN lead and only
 * while it is still NEW — once BD picks it up (ASSIGNED onward) the referrer
 * can no longer change the data under them.
 */
export function canEditBodLead(actor, lead) {
  if (!actor || !lead) return false;
  if (lead.deletedAt) return false;
  if (actor.role === ROLES.ADMIN || actor.role === ROLES.BD) return true;
  return (
    actor.role === ROLES.BOD &&
    lead.referrerUserId === actor.id &&
    lead.leadStatus === "NEW"
  );
}

/** canEditBodLead() but throws — used by the server actions. */
export function assertCanEditBodLead(actor, lead) {
  if (!canEditBodLead(actor, lead)) {
    throw forbidden(
      "BOD members may only edit their own leads while still New."
    );
  }
}

/**
 * Landing page per role — the ONE place that answers "where does this user
 * belong?". BOD has no access to /portal/patients, so the old hardcoded
 * redirect to it would have bounced them into a redirect loop.
 */
export function homePathFor(role) {
  return role === ROLES.BOD ? "/portal/bod-leads" : "/portal/patients";
}
