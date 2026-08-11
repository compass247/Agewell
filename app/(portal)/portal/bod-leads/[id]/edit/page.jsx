import { notFound, redirect } from "next/navigation";
import { requireSession } from "../../../../../../src/lib/phi/session.js";
import { canEditBodLead } from "../../../../../../src/lib/phi/rbac.js";
import { getBodLead } from "../../../../../../src/lib/phi/bod-leads.repo.js";
import { formatUsDate } from "../../../../../../src/lib/phi/bod-lead-map.js";
import { formatLeadCode } from "../../../../../../src/lib/phi/bod-leads.options.js";
import { updateBodLead } from "../../../_actions/bod-leads.js";
import BodLeadForm from "../../../_components/BodLeadForm.jsx";
import "../../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditBodLeadPage({ params }) {
  const actor = await requireSession();
  const lead = await getBodLead(params.id);
  if (!lead) notFound();

  // Record-level gate for the UI (the action re-checks authoritatively).
  if (!canEditBodLead(actor, lead)) redirect(`/portal/bod-leads/${lead.id}`);

  const action = updateBodLead.bind(null, lead.id);

  return (
    <div>
      <h1 className="pf-h1">
        Edit · {formatLeadCode(lead.leadNo)} · {lead.customerName}
      </h1>
      <div className="pf-card">
        {/* Referrer is fixed at creation, so it renders read-only for everyone
            here — attribution is not something an edit may rewrite. */}
        <BodLeadForm
          action={action}
          lead={{
            ...lead,
            consentDateInput: formatUsDate(lead.consentDate),
            dateReceivedInput: formatUsDate(lead.dateReceived),
          }}
          lockedReferrer={{
            id: lead.referrerUserId,
            name: lead.referrer,
            hint: "Attribution is fixed when the lead is created.",
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
