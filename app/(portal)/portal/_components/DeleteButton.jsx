"use client";
/* Admin-only soft delete with a confirm prompt. */
import { softDeletePatient } from "../_actions/patients.js";

export default function DeleteButton({ patientId }) {
  const action = softDeletePatient.bind(null, patientId);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Soft-delete this patient? The record is hidden but retained for 6 years (HIPAA). This is logged."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="pf-btn pf-btn--danger">
        Delete
      </button>
    </form>
  );
}
