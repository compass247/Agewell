"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import SubmitButton from "./SubmitButton.jsx";
import {
  LEAD_SOURCES,
  TIERS,
  CONTACT_CHANNELS,
  CONSENT_OPTIONS,
  SERVICES_INTERESTED,
  US_STATES,
} from "../../../../src/lib/phi/bod-leads.options.js";

function Field({ label, name, defaultValue, type = "text", required, hint, ...rest }) {
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
      {hint ? <span className="pf-muted">{hint}</span> : null}
    </div>
  );
}

function Select({ label, name, defaultValue, options, required, placeholder }) {
  return (
    <div className="pf-field">
      <label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      <select id={name} name={name} defaultValue={defaultValue ?? ""} required={required}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * @param action          bound server action (create or update)
 * @param lead            optional record for edit mode (with decrypted dob)
 * @param lockedReferrer  {id, name} when the author is a BOD — shown read-only
 * @param referrerOptions [[userId, name]] for BD/ADMIN entering on behalf
 * @param submitLabel
 */
export default function BodLeadForm({
  action,
  lead,
  lockedReferrer,
  referrerOptions = [],
  submitLabel = "Save",
}) {
  const [state, formAction] = useFormState(action, {});
  const l = lead || {};
  // Consent date only applies once consent is "yes"; mirror that in the UI so
  // the server-side pairing rule never surprises anyone.
  const [consent, setConsent] = useState(
    l.consentToContact === false ? "no" : l.consentToContact ? "yes" : ""
  );

  return (
    <form action={formAction}>
      {state?.error ? <div className="pf-error">{state.error}</div> : null}

      <h2 className="pf-h2">Referral</h2>
      <div className="pf-grid2">
        <Select
          label="Lead source"
          name="leadSource"
          defaultValue={l.leadSource}
          options={LEAD_SOURCES}
          required
          placeholder="— Select —"
        />
        {lockedReferrer ? (
          <div className="pf-field">
            <label htmlFor="referrerDisplay">Referrer *</label>
            {/* Read-only for a BOD. The server ignores any posted value and
                attributes the lead to the signed-in account regardless. */}
            <input id="referrerDisplay" value={lockedReferrer.name} readOnly disabled />
            <span className="pf-muted">
              {lockedReferrer.hint || "Attributed to your account."}
            </span>
          </div>
        ) : (
          <Select
            label="Referrer"
            name="referrerUserId"
            defaultValue={l.referrerUserId}
            options={referrerOptions}
            required
            placeholder="— Select BOD member —"
          />
        )}
      </div>

      <h2 className="pf-h2">Customer</h2>
      <div className="pf-grid3">
        <Field label="Customer name" name="customerName" defaultValue={l.customerName} required />
        <Field label="Phone" name="phone" defaultValue={l.phone} required />
        <Select
          label="State"
          name="state"
          defaultValue={l.state}
          options={US_STATES}
          required
          placeholder="— Select —"
        />
      </div>
      <div className="pf-grid2">
        <Field
          label="DOB (MM/DD/YYYY)"
          name="dob"
          defaultValue={l.dob}
          placeholder="MM/DD/YYYY"
        />
        <Select
          label="Tier"
          name="tier"
          defaultValue={l.tier}
          options={TIERS}
          required
          placeholder="— Select —"
        />
      </div>

      <h2 className="pf-h2">Contact & consent</h2>
      <div className="pf-grid3">
        <Select
          label="Preferred contact channel"
          name="preferredContactChannel"
          defaultValue={l.preferredContactChannel}
          options={CONTACT_CHANNELS}
          required
          placeholder="— Select —"
        />
        <div className="pf-field">
          <label htmlFor="consentToContact">Consent to contact *</label>
          <select
            id="consentToContact"
            name="consentToContact"
            value={consent}
            onChange={(e) => setConsent(e.target.value)}
            required
          >
            <option value="">— Select —</option>
            {CONSENT_OPTIONS.map(([v, text]) => (
              <option key={v} value={v}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Consent date (MM/DD/YYYY)"
          name="consentDate"
          defaultValue={l.consentDateInput}
          required={consent === "yes"}
          placeholder="MM/DD/YYYY"
        />
      </div>

      <h2 className="pf-h2">Interest</h2>
      <div className="pf-grid2">
        <Select
          label="Service interested"
          name="serviceInterested"
          defaultValue={l.serviceInterested}
          options={SERVICES_INTERESTED}
          placeholder="— Not specified —"
        />
        <Field
          label="Date received (MM/DD/YYYY)"
          name="dateReceived"
          defaultValue={l.dateReceivedInput}
          placeholder="Defaults to today"
        />
      </div>
      <div className="pf-field">
        <label htmlFor="founderNote">Founder note</label>
        <textarea id="founderNote" name="founderNote" rows={4} defaultValue={l.founderNote || ""} />
      </div>

      <SubmitButton className="pf-btn" pendingLabel="Saving…">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
