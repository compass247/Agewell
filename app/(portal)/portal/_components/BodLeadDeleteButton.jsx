"use client";
/* Admin-only soft delete with a confirm prompt. */
import { softDeleteBodLead } from "../_actions/bod-leads.js";

export default function BodLeadDeleteButton({ leadId }) {
  const action = softDeleteBodLead.bind(null, leadId);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Soft-delete this lead? The record is hidden but retained. This is logged."
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
