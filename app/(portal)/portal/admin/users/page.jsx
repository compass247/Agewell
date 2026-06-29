import Link from "next/link";
import { desc } from "drizzle-orm";
import { requireSession } from "../../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../../src/lib/phi/rbac.js";
import { db } from "../../../../../src/lib/phi/db.js";
import { users } from "../../../../../src/lib/phi/schema.js";
import UserRow from "../../_components/UserRow.jsx";
import "../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const actor = await requireSession();
  requireCan(actor, "manageUsers");

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      mfaEnrolledAt: users.mfaEnrolledAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>Users</h1>
        <Link className="pf-btn" href="/portal/admin/users/new">+ New user</Link>
      </div>
      <div className="pf-card">
        <table className="pf-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>MFA</th>
              <th>Active</th>
              <th>Last login</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <UserRow key={u.id} user={u} selfId={actor.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
