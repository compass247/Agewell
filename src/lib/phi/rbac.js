/* ============================================================
   RBAC — the central authorization matrix (defined ONCE).

   Every server action and RSC fetch calls these AFTER requireSession(), so a
   forged URL can never bypass authorization: the check lives in the action,
   not the route. Middleware only does coarse gating.

   Roles: ADMIN (full), BD (create/edit OWN records), CS (review/update all).
   ============================================================ */

export const ROLES = Object.freeze({ ADMIN: "ADMIN", BD: "BD", CS: "CS" });

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
 * Coarse capability check for an action on a resource type.
 * Record-level rules (BD-owns-own) are enforced by assertCanEditPatient.
 *
 * actions: create | read | update | status | delete | export | manageUsers
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
 * Record-level edit rule: ADMIN and CS may edit/status any patient; BD may only
 * edit patients they created. Throws otherwise.
 */
export function assertCanEditPatient(actor, patient) {
  if (!actor || !patient) throw forbidden();
  if (actor.role === ROLES.ADMIN || actor.role === ROLES.CS) return;
  if (actor.role === ROLES.BD && patient.createdBy === actor.id) return;
  throw forbidden("BD may only edit records they created.");
}
