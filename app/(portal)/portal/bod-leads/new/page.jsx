import { requireSession } from "../../../../../src/lib/phi/session.js";
import { requireCanBodLead } from "../../../../../src/lib/phi/rbac.js";
import {
  listBodReferrers,
  getUserName,
} from "../../../../../src/lib/phi/bod-leads.repo.js";
import { createBodLead } from "../../_actions/bod-leads.js";
import BodLeadForm from "../../_components/BodLeadForm.jsx";
import "../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewBodLeadPage() {
  const actor = await requireSession();
  requireCanBodLead(actor, "create");

  // A BOD is always the referrer of what they enter; BD/ADMIN pick one.
  const isBod = actor.role === "BOD";
  const [self, referrers] = await Promise.all([
    isBod ? getUserName(actor.id) : null,
    isBod ? [] : listBodReferrers(),
  ]);

  return (
    <div>
      <h1 className="pf-h1">New BOD lead</h1>
      <div className="pf-card">
        <BodLeadForm
          action={createBodLead}
          lockedReferrer={isBod ? { id: actor.id, name: self?.name || actor.email } : null}
          referrerOptions={referrers.map((r) => [r.id, r.name])}
          submitLabel="Create lead"
        />
      </div>
    </div>
  );
}
