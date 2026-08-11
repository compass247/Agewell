import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "../../../../../src/lib/phi/session.js";
import {
  canBodLead,
  canEditBodLead,
  homePathFor,
} from "../../../../../src/lib/phi/rbac.js";
import { getBodLead } from "../../../../../src/lib/phi/bod-leads.repo.js";
import { logBodLeadRead } from "../../../../../src/lib/phi/read-audit.js";
import { getBodLeadAudit } from "../../../../../src/lib/phi/detail.repo.js";
import {
  LEAD_SOURCES,
  TIERS,
  CONTACT_CHANNELS,
  SERVICES_INTERESTED,
  US_STATES,
  formatLeadCode,
  labelOf,
} from "../../../../../src/lib/phi/bod-leads.options.js";
import BodLeadStatusBadge from "../../_components/BodLeadStatusBadge.jsx";
import BodLeadStatusUpdate from "../../_components/BodLeadStatusUpdate.jsx";
import BodLeadDeleteButton from "../../_components/BodLeadDeleteButton.jsx";
import AuditTrail from "../../_components/AuditTrail.jsx";
import "../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0" }}>
      <div style={{ width: 190, color: "#5a6b78", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{children || "—"}</div>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US");
}

export default async function BodLeadDetailPage({ params }) {
  const actor = await requireSession();
  if (!canBodLead(actor, "read")) redirect(homePathFor(actor.role));

  const lead = await getBodLead(params.id);
  if (!lead) notFound();

  // One READ audit row per detail disclosure.
  await logBodLeadRead(actor, lead.id);

  const audit = await getBodLeadAudit(lead.id);
  const canEdit = canEditBodLead(actor, lead);
  const canStatus = canBodLead(actor, "status") && !lead.deletedAt;
  const canDelete = canBodLead(actor, "delete");

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>
          {formatLeadCode(lead.leadNo)} · {lead.customerName}{" "}
          <BodLeadStatusBadge status={lead.leadStatus} />
          {lead.deletedAt ? <span className="pf-muted"> (deleted)</span> : null}
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="pf-btn pf-btn--ghost" href="/portal/bod-leads">← Back</Link>
          {canEdit ? (
            <Link className="pf-btn" href={`/portal/bod-leads/${lead.id}/edit`}>Edit</Link>
          ) : null}
          {canDelete && !lead.deletedAt ? <BodLeadDeleteButton leadId={lead.id} /> : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div>
          <div className="pf-card">
            <h2 className="pf-h2">Lead</h2>
            <Row label="Lead ID">{formatLeadCode(lead.leadNo)}</Row>
            <Row label="Lead source">{labelOf(LEAD_SOURCES, lead.leadSource)}</Row>
            <Row label="Referrer">{lead.referrer}</Row>
            <Row label="Customer name">{lead.customerName}</Row>
            <Row label="Phone">{lead.phone}</Row>
            <Row label="State">{labelOf(US_STATES, lead.state)}</Row>
            <Row label="Date of birth">{lead.dob}</Row>
            <Row label="Tier">{labelOf(TIERS, lead.tier)}</Row>
            <Row label="Preferred contact channel">
              {labelOf(CONTACT_CHANNELS, lead.preferredContactChannel)}
            </Row>
            <Row label="Consent to contact">
              {lead.consentToContact ? "Yes – consent obtained" : "No – do not contact"}
            </Row>
            <Row label="Consent date">{fmtDate(lead.consentDate)}</Row>
            <Row label="Service interested">
              {lead.serviceInterested ? labelOf(SERVICES_INTERESTED, lead.serviceInterested) : null}
            </Row>
            <Row label="Founder note">{lead.founderNote}</Row>
            <Row label="Date received">{fmtDate(lead.dateReceived)}</Row>
          </div>
        </div>

        <div>
          <div className="pf-card">
            <h2 className="pf-h2">Workflow</h2>
            {canStatus ? (
              <BodLeadStatusUpdate leadId={lead.id} current={lead.leadStatus} />
            ) : (
              <BodLeadStatusBadge status={lead.leadStatus} />
            )}
          </div>
          <div className="pf-card">
            <h2 className="pf-h2">Audit history</h2>
            <AuditTrail entries={audit} />
          </div>
        </div>
      </div>
    </div>
  );
}
