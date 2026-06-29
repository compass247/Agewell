import { requireSession } from "../../../../../src/lib/phi/session.js";
import { requireCan } from "../../../../../src/lib/phi/rbac.js";
import { createPatient } from "../../_actions/patients.js";
import PatientForm from "../../_components/PatientForm.jsx";
import "../../portal.css";

export const runtime = "nodejs";

export default async function NewPatientPage() {
  const actor = await requireSession();
  requireCan(actor, "create");

  return (
    <div>
      <h1 className="pf-h1">New patient</h1>
      <div className="pf-card">
        <PatientForm action={createPatient} submitLabel="Create patient" />
      </div>
    </div>
  );
}
