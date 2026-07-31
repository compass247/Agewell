"use client";
/* ============================================================
   COMPASS AGEWELL — ROI partner tool (UI shell)

   All arithmetic lives in src/lib/roi.js; this file only renders it. Copy
   comes from src/roi-content.js as the `R` prop — no hardcoded strings.

   ZERO PERSISTENCE, on purpose (brief 6.7): React state only. No
   localStorage / sessionStorage / cookies, no analytics, no fetch. That is
   also why the language switch below is a plain <a> rather than the shared
   LangToggle — next-intl's client router writes a NEXT_LOCALE cookie
   (next-intl/dist/.../syncLocaleCookie.js) when the locale changes, and this
   page must not write anything.

   Live recalculation on every keystroke — there is no "Calculate" button
   (brief 6.1); calcBlock() runs on each render, which is cheap.
   ============================================================ */
import { useState } from "react";
import {
  EMPTY_CCM,
  EMPTY_MTM,
  FEE_FIXED,
  FEE_SHARE,
  BILLER_PCP,
  BILLER_AGEWELL,
  sanitizeNumberInput,
  calcBlock,
  calcCombined,
  formatMoney,
  formatMoneyPrecise,
  formatCount,
} from "../lib/roi.js";
import { fillTemplate, ROI_PATH } from "../roi-content.js";

/* ---------- small building blocks ---------- */

function Alert({ text, inline }) {
  return (
    <div
      className={"roi-alert" + (inline ? " roi-alert-inline" : " roi-alert-page")}
      role="note"
    >
      <span className="roi-alert-mark" aria-hidden="true">
        !
      </span>
      <p>{text}</p>
    </div>
  );
}

function Segmented({ label, options, value, onChange, name }) {
  return (
    <div className="roi-field roi-field-choice">
      <span className="roi-label" id={`${name}-label`}>
        {label}
      </span>
      <div className="roi-seg" role="group" aria-labelledby={`${name}-label`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Every numeric field: label + unit hint + bare number input. No sliders
// (brief 6.2) and no default value (brief 7) — each starts empty.
function NumberField({ id, label, hint, placeholder, value, onChange, prefix, suffix, max, requiredLabel }) {
  return (
    <div className="roi-field">
      <label className="roi-label" htmlFor={id}>
        {label}{" "}
        <span className="roi-req" title={requiredLabel} aria-label={requiredLabel}>
          *
        </span>
      </label>
      <span className="roi-hint" id={`${id}-hint`}>
        {hint}
      </span>
      <div className="roi-input-wrap">
        {prefix ? (
          <span className="roi-affix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          className="roi-input"
          type="number"
          inputMode="decimal"
          min="0"
          {...(max != null ? { max: String(max) } : {})}
          step="any"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          aria-describedby={`${id}-hint`}
          onChange={(e) => onChange(sanitizeNumberInput(e.target.value, max))}
        />
        {suffix ? (
          <span className="roi-affix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- results column ---------- */

function BlockResults({ R, result, netEyebrow, revRowLabel, promptPatients, promptRevenue }) {
  // Brief 6.5 — patient count or Medicare revenue empty: hide the output
  // entirely and prompt for the missing field instead of showing zeros.
  if (result.blocked) {
    return (
      <div className="roi-results">
        <div className="roi-prompt">
          <p>{result.hasPatients ? promptRevenue : promptPatients}</p>
        </div>
      </div>
    );
  }

  // Brief 6.4 — fee not confirmed: dim every fee-dependent figure and say why.
  const dim = result.feeMissing ? " roi-dim" : "";

  return (
    <div className="roi-results">
      <div className="roi-rows">
        <div className="roi-row">
          <span className="roi-row-label">
            {revRowLabel}
            <em className="roi-row-sub">{R.results.groupSub}</em>
          </span>
          <span className="roi-row-value">
            <span className="roi-num-sm">{formatMoney(result.revenueMonth)}</span>
            <em className="roi-unit">{R.results.unitMonth}</em>
          </span>
        </div>

        <div className={"roi-row" + dim}>
          <span className="roi-row-label">
            {R.results.costLabel}
            <em className="roi-row-sub">{R.results.groupSub}</em>
          </span>
          <span className="roi-row-value">
            <span className="roi-num-sm roi-num-sm-neutral">{formatMoney(result.costMonth)}</span>
            <em className="roi-unit">{R.results.unitMonth}</em>
            {/* Revenue-share only: the same fee expressed per patient per
                month, so it can be compared to a fixed fee at a glance. */}
            {result.isShare ? (
              <em className="roi-equiv">
                ≈ {formatMoneyPrecise(result.equivFeePerPatient)} {R.results.equivUnit}
              </em>
            ) : null}
          </span>
        </div>
      </div>

      <div className={"roi-net" + dim}>
        <span className="roi-eyebrow">{netEyebrow}</span>
        <span className="roi-net-num">{formatMoney(result.netMonth)}</span>
        <span className="roi-net-unit">{R.results.netUnit}</span>

        <div className="roi-net-year">
          <span className="roi-row-label">{R.results.netYearLabel}</span>
          <span className="roi-row-value">
            <span className="roi-num-year">{formatMoney(result.netYear)}</span>
            <em className="roi-unit">{R.results.netYearUnit}</em>
          </span>
        </div>
        {/* Annual figure carries the live patient count in its assumption. */}
        <p className="roi-year-note">
          {fillTemplate(R.results.yearNote, { count: formatCount(result.patients) })}
        </p>
      </div>

      {result.feeMissing ? (
        <p className="roi-fee-missing">{R.results.feeMissing}</p>
      ) : null}
    </div>
  );
}

/* ---------- page ---------- */

export default function RoiCalculatorClient({ R, lang }) {
  const [ccm, setCcm] = useState(EMPTY_CCM);
  const [mtm, setMtm] = useState(EMPTY_MTM);

  const ccmResult = calcBlock(ccm);
  const mtmResult = calcBlock(mtm);
  const combined = calcCombined(ccmResult, mtmResult);

  const setC = (key) => (v) => setCcm((s) => ({ ...s, [key]: v }));
  const setM = (key) => (v) => setMtm((s) => ({ ...s, [key]: v }));

  // "Xóa hết, nhập lại" — a clear, not a restore-defaults, because there are
  // no defaults to restore (brief 6.6).
  const reset = () => {
    setCcm(EMPTY_CCM);
    setMtm(EMPTY_MTM);
  };

  const feeModeOptions = [
    { value: FEE_FIXED, label: R.feeMode.fixed },
    { value: FEE_SHARE, label: R.feeMode.share },
  ];

  const otherLang = lang === "vi" ? "en" : "vi";

  return (
    <div className="roi-page">
      <div className="roi-head">
        <div className="roi-head-left">
          <img
            className="roi-logo"
            src="/assets/logo-horizontal-primary.png"
            alt="Compass AgeWell"
          />
          <h1 className="roi-title">{R.page.title}</h1>
          <p className="roi-sub">{R.page.sub}</p>
        </div>
        <div className="roi-head-actions">
          {/* Plain anchor: a full navigation writes no locale cookie. */}
          <a
            className="roi-lang"
            href={`/${otherLang}${ROI_PATH}`}
            hrefLang={otherLang}
            aria-label={R.page.langSwitchLabel}
          >
            {R.page.langSwitch}
          </a>
          <button type="button" className="roi-btn" onClick={reset}>
            {R.page.reset}
          </button>
        </div>
      </div>

      {/* Brief 6.3 — permanent, non-dismissible. There is no close control. */}
      <Alert text={R.disclaimer} />

      {/* ---------------- CCM ---------------- */}
      <section className="roi-section" aria-labelledby="roi-ccm-title">
        <div className="roi-section-head">
          <h2 className="roi-section-title" id="roi-ccm-title">
            {R.ccm.title}
          </h2>
          <span className="roi-section-note">{R.ccm.note}</span>
        </div>

        <div className="roi-grid">
          <div className="roi-card">
            <div className="roi-fields">
              <Segmented
                name="ccm-fee-mode"
                label={R.feeMode.label}
                options={feeModeOptions}
                value={ccm.feeMode}
                onChange={setC("feeMode")}
              />

              {/* Anti-Kickback banner, in whichever block has revenue share on. */}
              {ccm.feeMode === FEE_SHARE ? (
                <Alert inline text={fillTemplate(R.aks, { service: "CCM" })} />
              ) : null}

              <NumberField
                id="ccm-patients"
                label={R.ccm.patientsLabel}
                hint={R.ccm.patientsHint}
                placeholder={R.fields.patientsPlaceholder}
                value={ccm.patients}
                onChange={setC("patients")}
                requiredLabel={R.fields.requiredLabel}
              />

              <NumberField
                id="ccm-revenue"
                label={R.ccm.revLabel}
                hint={R.ccm.revHint}
                placeholder={R.fields.revPlaceholder}
                value={ccm.revenuePerPatient}
                onChange={setC("revenuePerPatient")}
                prefix="$"
                requiredLabel={R.fields.requiredLabel}
              />

              {/* Brief 6.12 — switching fee mode swaps ONLY the fee input;
                  patient count and revenue keep their values. */}
              {ccm.feeMode === FEE_FIXED ? (
                <NumberField
                  id="ccm-fee"
                  label={R.fields.feeLabel}
                  hint={R.fields.feeHint}
                  placeholder={R.fields.feePlaceholder}
                  value={ccm.fixedFee}
                  onChange={setC("fixedFee")}
                  prefix="$"
                  requiredLabel={R.fields.requiredLabel}
                />
              ) : (
                <NumberField
                  id="ccm-pct"
                  label={R.fields.pctLabel}
                  hint={R.ccm.pctHint}
                  placeholder={R.fields.pctPlaceholder}
                  value={ccm.sharePct}
                  onChange={setC("sharePct")}
                  suffix="%"
                  max={100}
                  requiredLabel={R.fields.requiredLabel}
                />
              )}
            </div>
          </div>

          <BlockResults
            R={R}
            result={ccmResult}
            netEyebrow={R.ccm.netEyebrow}
            revRowLabel={R.ccm.revRowLabel}
            promptPatients={R.ccm.promptPatients}
            promptRevenue={R.ccm.promptRevenue}
          />
        </div>
      </section>

      {/* ---------------- MTM ---------------- */}
      <section className="roi-section" aria-labelledby="roi-mtm-title">
        <div className="roi-section-head">
          <h2 className="roi-section-title" id="roi-mtm-title">
            {R.mtm.title}
          </h2>
          <span className="roi-section-note">{R.mtm.note}</span>
        </div>

        <div className="roi-grid">
          <div className="roi-card roi-card-mtm">
            <div className="roi-fields">
              {/* Layer A — who bills. Its own row, never merged into the fee
                  selector (brief 6.11). Narration only: no figure changes. */}
              <div className="roi-stack">
                <Segmented
                  name="mtm-biller"
                  label={R.biller.label}
                  options={[
                    { value: BILLER_PCP, label: R.biller.pcp },
                    { value: BILLER_AGEWELL, label: R.biller.agewell },
                  ]}
                  value={mtm.biller}
                  onChange={setM("biller")}
                />
                <div className="roi-flow">
                  <span className="roi-flow-label">{R.biller.flowLabel}</span>
                  <span className="roi-flow-text">
                    {mtm.biller === BILLER_PCP ? R.biller.flowPcp : R.biller.flowAgewell}
                  </span>
                  <span className="roi-flow-note">{R.biller.flowNote}</span>
                </div>
              </div>

              <div className="roi-divider" />

              {/* Layer B — fee mode, on its own separate row. */}
              <Segmented
                name="mtm-fee-mode"
                label={R.feeMode.label}
                options={feeModeOptions}
                value={mtm.feeMode}
                onChange={setM("feeMode")}
              />

              {mtm.feeMode === FEE_SHARE ? (
                <Alert inline text={fillTemplate(R.aks, { service: "MTM" })} />
              ) : null}

              <NumberField
                id="mtm-patients"
                label={R.mtm.patientsLabel}
                hint={R.mtm.patientsHint}
                placeholder={R.fields.patientsPlaceholder}
                value={mtm.patients}
                onChange={setM("patients")}
                requiredLabel={R.fields.requiredLabel}
              />

              <NumberField
                id="mtm-revenue"
                label={R.mtm.revLabel}
                hint={R.mtm.revHint}
                placeholder={R.fields.revPlaceholder}
                value={mtm.revenuePerPatient}
                onChange={setM("revenuePerPatient")}
                prefix="$"
                requiredLabel={R.fields.requiredLabel}
              />

              {mtm.feeMode === FEE_FIXED ? (
                <NumberField
                  id="mtm-fee"
                  label={R.fields.feeLabel}
                  hint={R.fields.feeHint}
                  placeholder={R.fields.feePlaceholder}
                  value={mtm.fixedFee}
                  onChange={setM("fixedFee")}
                  prefix="$"
                  requiredLabel={R.fields.requiredLabel}
                />
              ) : (
                <NumberField
                  id="mtm-pct"
                  label={R.fields.pctLabel}
                  hint={R.mtm.pctHint}
                  placeholder={R.fields.pctPlaceholder}
                  value={mtm.sharePct}
                  onChange={setM("sharePct")}
                  suffix="%"
                  max={100}
                  requiredLabel={R.fields.requiredLabel}
                />
              )}
            </div>
          </div>

          <BlockResults
            R={R}
            result={mtmResult}
            netEyebrow={R.mtm.netEyebrow}
            revRowLabel={R.mtm.revRowLabel}
            promptPatients={R.mtm.promptPatients}
            promptRevenue={R.mtm.promptRevenue}
          />
        </div>
      </section>

      {/* ---------------- combined (brief 5) ----------------
          Appears only once BOTH blocks are complete. */}
      {combined.available ? (
        <section className="roi-combined" aria-label={R.combined.eyebrow}>
          <div className="roi-combined-copy">
            <span className="roi-combined-eyebrow">{R.combined.eyebrow}</span>
            <p className="roi-combined-note">{R.combined.note}</p>
          </div>
          <div className="roi-combined-figure">
            <span className="roi-combined-label">{R.combined.label}</span>
            <span className="roi-combined-num">{formatMoney(combined.netYear)}</span>
            <span className="roi-combined-unit">{R.combined.unit}</span>
            <span className="roi-combined-month">
              {formatMoney(combined.netMonth)} {R.combined.monthlyUnit}
            </span>
          </div>
        </section>
      ) : null}

      <p className="roi-foot">{R.footer}</p>
    </div>
  );
}
