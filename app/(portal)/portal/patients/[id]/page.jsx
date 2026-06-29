import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "../../../../../src/lib/phi/session.js";
import { can } from "../../../../../src/lib/phi/rbac.js";
import { getPatient } from "../../../../../src/lib/phi/patients.repo.js";
import { logPatientRead } from "../../../../../src/lib/phi/read-audit.js";
import {
  getPatientAudit,
  getPatientNotes,
} from "../../../../../src/lib/phi/detail.repo.js";
import { maskTail } from "../../../../../src/lib/phi/crypto.js";
import StatusBadge from "../../_components/StatusBadge.jsx";
import StatusUpdate from "../../_components/StatusUpdate.jsx";
import DeleteButton from "../../_components/DeleteButton.jsx";
import AuditTrail from "../../_components/AuditTrail.jsx";
import NotesThread from "../../_components/NotesThread.jsx";
import "../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0" }}>
      <div style={{ width: 180, color: "#5a6b78", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{children || "—"}</div>
    </div>
  );
}

export default async function PatientDetailPage({ params }) {
  const actor = await requireSession();
  const patient = await getPatient(params.id);
  if (!patient) notFound();

  // One READ audit row per detail disclosure.
  await logPatientRead(actor, patient.id);

  const [audit, notes] = await Promise.all([
    getPatientAudit(patient.id),
    getPatientNotes(patient.id),
  ]);

  const canEdit =
    actor.role === "ADMIN" ||
    actor.role === "CS" ||
    (actor.role === "BD" && patient.createdBy === actor.id);
  const canDelete = can(actor, "delete");
  const canStatus =
    actor.role === "ADMIN" ||
    actor.role === "CS" ||
    (actor.role === "BD" && patient.createdBy === actor.id);

  return (
    <div>
      <div className="pf-toolbar" style={{ justifyContent: "space-between", marginTop: 20 }}>
        <h1 className="pf-h1" style={{ margin: 0 }}>
          {patient.lastName}, {patient.firstName} <StatusBadge status={patient.status} />
          {patient.deletedAt ? <span className="pf-muted"> (deleted)</span> : null}
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="pf-btn pf-btn--ghost" href="/portal/patients">← Back</Link>
          {canEdit ? (
            <Link className="pf-btn" href={`/portal/patients/${patient.id}/edit`}>Edit</Link>
          ) : null}
          {canDelete && !patient.deletedAt ? <DeleteButton patientId={patient.id} /> : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div>
          <div className="pf-card">
            <h2 className="pf-h2">Record</h2>
            <Row label="Date of birth">{patient.dob}</Row>
            <Row label="Primary phone">{patient.primaryPhone}</Row>
            <Row label="Secondary phone">{patient.secondaryPhone}</Row>
            <Row label="Email">{patient.email}</Row>
            <Row label="Address">
              {[patient.street, patient.city, patient.state, patient.zip].filter(Boolean).join(", ")}
            </Row>
            <Row label="Medicare MBI">{patient.medicareMbi ? maskTail(patient.medicareMbi) : "—"}</Row>
            <Row label="Insurance plan">{patient.insurancePlan}</Row>
            <Row label="Member ID">{patient.insuranceMemberId}</Row>
            <Row label="Emergency contact">
              {[patient.emergencyName, patient.emergencyRelationship, patient.emergencyPhone]
                .filter(Boolean)
                .join(" · ")}
            </Row>
            <Row label="Referral source">{patient.referralSource}</Row>
            <Row label="Preferred language">{patient.preferredLanguage}</Row>
            <Row label="Notes">{patient.notes}</Row>
          </div>

          <div className="pf-card">
            <h2 className="pf-h2">Notes thread</h2>
            <NotesThread patientId={patient.id} notes={notes} />
          </div>
        </div>

        <div>
          <div className="pf-card">
            <h2 className="pf-h2">Workflow</h2>
            {canStatus && !patient.deletedAt ? (
              <StatusUpdate patientId={patient.id} current={patient.status} />
            ) : (
              <StatusBadge status={patient.status} />
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
