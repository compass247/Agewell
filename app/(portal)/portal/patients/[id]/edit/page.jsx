import { notFound, redirect } from "next/navigation";
import { requireSession } from "../../../../../../src/lib/phi/session.js";
import { getPatient } from "../../../../../../src/lib/phi/patients.repo.js";
import { updatePatient } from "../../../_actions/patients.js";
import PatientForm from "../../../_components/PatientForm.jsx";
import "../../../portal.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditPatientPage({ params }) {
  const actor = await requireSession();
  const patient = await getPatient(params.id);
  if (!patient) notFound();

  // Record-level gate for the UI (the action re-checks authoritatively).
  const canEdit =
    actor.role === "ADMIN" ||
    actor.role === "CS" ||
    (actor.role === "BD" && patient.createdBy === actor.id);
  if (!canEdit) redirect(`/portal/patients/${patient.id}`);

  const action = updatePatient.bind(null, patient.id);

  return (
    <div>
      <h1 className="pf-h1">
        Edit · {patient.lastName}, {patient.firstName}
      </h1>
      <div className="pf-card">
        <PatientForm action={action} patient={patient} submitLabel="Save changes" />
      </div>
    </div>
  );
}
