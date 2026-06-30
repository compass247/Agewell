"use client";
import { useFormState } from "react-dom";
import SubmitButton from "./SubmitButton.jsx";

const LANGS = [
  ["ENGLISH", "English"],
  ["VIETNAMESE", "Vietnamese"],
  ["SPANISH", "Spanish"],
  ["OTHER", "Other"],
];

const GENDERS = [
  ["MALE", "Male"],
  ["FEMALE", "Female"],
  ["OTHER", "Other"],
];

function Field({ label, name, defaultValue, type = "text", required, ...rest }) {
  return (
    <div className="pf-field">
      <label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        {...rest}
      />
    </div>
  );
}

/**
 * @param action  bound server action (create or update)
 * @param patient optional record for edit mode (with decrypted dob/medicareMbi)
 * @param submitLabel
 */
export default function PatientForm({ action, patient, submitLabel = "Save" }) {
  const [state, formAction] = useFormState(action, {});
  const p = patient || {};
  return (
    <form action={formAction}>
      {state?.error ? <div className="pf-error">{state.error}</div> : null}

      <h2 className="pf-h2">Identity</h2>
      <Field
        label="Patient ID"
        name="patientExternalId"
        defaultValue={p.patientExternalId}
        placeholder="External ID (e.g. EMR)"
      />
      <div className="pf-grid3">
        <Field label="First name" name="firstName" defaultValue={p.firstName} required />
        <Field label="Last name" name="lastName" defaultValue={p.lastName} required />
        <Field
          label="DOB (MM/DD/YYYY)"
          name="dob"
          defaultValue={p.dob}
          required
          placeholder="MM/DD/YYYY"
        />
      </div>
      <div className="pf-field">
        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" defaultValue={p.gender || ""}>
          <option value="">— Not specified —</option>
          {GENDERS.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <h2 className="pf-h2">Contact</h2>
      <div className="pf-grid2">
        <Field label="Primary phone" name="primaryPhone" defaultValue={p.primaryPhone} required />
        <Field label="Secondary phone" name="secondaryPhone" defaultValue={p.secondaryPhone} />
      </div>
      <Field label="Email" name="email" type="email" defaultValue={p.email} />
      <Field label="Address 1" name="address1" defaultValue={p.address1} />
      <Field label="Address 2" name="address2" defaultValue={p.address2} />
      <div className="pf-grid3">
        <Field label="City" name="city" defaultValue={p.city} />
        <Field label="State" name="state" defaultValue={p.state} />
        <Field label="ZIP" name="zip" defaultValue={p.zip} />
      </div>

      <h2 className="pf-h2">Insurance</h2>
      <div className="pf-grid3">
        <Field label="Medicare MBI" name="medicareMbi" defaultValue={p.medicareMbi} />
        <Field label="Insurance plan" name="insurancePlan" defaultValue={p.insurancePlan} />
        <Field label="Member ID" name="insuranceMemberId" defaultValue={p.insuranceMemberId} />
      </div>

      <h2 className="pf-h2">Emergency contact</h2>
      <div className="pf-grid3">
        <Field label="Name" name="emergencyName" defaultValue={p.emergencyName} />
        <Field label="Relationship" name="emergencyRelationship" defaultValue={p.emergencyRelationship} />
        <Field label="Phone" name="emergencyPhone" defaultValue={p.emergencyPhone} />
      </div>

      <h2 className="pf-h2">Intake</h2>
      <Field label="Referral source" name="referralSource" defaultValue={p.referralSource} />
      <div className="pf-field">
        <label htmlFor="preferredLanguage">Primary language</label>
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          defaultValue={p.preferredLanguage || "ENGLISH"}
        >
          {LANGS.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="pf-field">
        <label htmlFor="notes">Notes (context for CS)</label>
        <textarea id="notes" name="notes" rows={4} defaultValue={p.notes || ""} />
      </div>

      <SubmitButton className="pf-btn" pendingLabel="Saving…">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
