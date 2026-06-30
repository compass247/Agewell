"use client";
import { useFormState } from "react-dom";
import { addNote } from "../_actions/notes.js";
import SubmitButton from "./SubmitButton.jsx";

function fmt(at) {
  const d = at instanceof Date ? at : new Date(at);
  return d.toLocaleString("en-US");
}

export default function NotesThread({ patientId, notes }) {
  const action = addNote.bind(null, patientId);
  const [state, formAction] = useFormState(action, {});
  return (
    <div>
      {notes?.length ? (
        notes.map((n) => (
          <div key={n.id} className="pf-note">
            <div>{n.body}</div>
            <div className="pf-note-meta">
              {n.authorEmail || "unknown"} · {fmt(n.createdAt)}
            </div>
          </div>
        ))
      ) : (
        <p className="pf-muted">No notes yet.</p>
      )}

      <form action={formAction} style={{ marginTop: 12 }}>
        {state?.error ? <div className="pf-error">{state.error}</div> : null}
        <div className="pf-field">
          <label htmlFor="body">Add a note (visible to BD &amp; CS)</label>
          <textarea id="body" name="body" rows={3} required />
        </div>
        <SubmitButton className="pf-btn pf-btn--ghost" pendingLabel="Adding…">
          Add note
        </SubmitButton>
      </form>
    </div>
  );
}
