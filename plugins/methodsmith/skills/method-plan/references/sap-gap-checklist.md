# SAP Gap Checklist

Run this checklist against every SAP produced in SAP mode. Each item is a common gap that weakens a statistical analysis plan. Report gaps to the user after writing the SAP, grouped by severity.

## Critical Gaps (block finalization)

These gaps make the SAP unexecutable or scientifically incomplete. A SAP with any critical gap should remain in `status: draft`.

- [ ] **Primary endpoint not clearly defined (SAP-3.1)** -- The primary endpoint must name the specific outcome measure, how it is measured, and the time point. "Clinical outcome" or "patient improvement" without operationalization is insufficient.
- [ ] **No estimand for the primary objective (SAP-1.4)** -- For RCTs and any causal question, the primary objective must state all five ICH E9(R1) estimand attributes (population, treatment conditions, endpoint with time point, each anticipated intercurrent event with its strategy, population-level summary). "ITT analysis" alone is an analysis set, not an estimand.
- [ ] **Analysis population not specified (SAP-4.1)** -- The primary analysis population must be explicitly defined (ITT, per-protocol, as-treated, or other). Without this, the denominator is ambiguous.
- [ ] **No primary statistical method specified (SAP-5.1)** -- The primary analysis must name the statistical model (e.g., logistic regression, Cox PH, linear mixed model), not just "we will compare groups."
- [ ] **No sample size or power assessment (SAP-6)** -- A design-appropriate justification is required: prospective power or a retrospective minimum detectable effect for hypothesis tests, Riley et al. criteria for prediction models, or confidence-interval width for estimation and accuracy studies. "We will use all available data" without one is a gap; post-hoc power from the observed effect does not count.
- [ ] **No data profile or QA gate before SAP variables/models** -- The SAP must be anchored to an observed data profile (`__CE_DATA_PROFILE__`) or QA report (`__CE_DATA_QA__`) before finalization. Missing actual columns, candidate grain, key/date fields, or QA status makes variable and model sections provisional.
- [ ] **Unresolved causal/observational analysis assumptions** -- For observational studies or causal claims, state the estimand, causal assumptions, unit/grain, key fields, time zero, and success criteria. Choices that would change the estimand or interpretation must be resolved or documented as analyst-approved assumptions before finalization.
- [ ] **No tabular SAP workbook contract** -- Every new SAP must include or explicitly require the biostatistics-style tabular companion (`analysis/sap-tables/01-overview.csv`, `02-outputs.csv`, `03-variables.csv`, and `<slug>-tabular-sap.xlsx` when available). If data QA is missing, the SAP may remain draft, but it must name `method-data-qa` then `method-sap-workbook <slug>` as required next steps before sprint/work.

## Important Gaps (should resolve before finalization)

These gaps reduce rigor but do not block execution. A SAP can proceed to `status: final` with these gaps only if each is acknowledged with documented rationale.

- [ ] **No missing data handling plan (SAP-8)** -- Every analysis plan should state the assumed missing mechanism and primary approach. Real-world data always has missingness; ignoring it is a design choice that should be explicit.
- [ ] **No pre-specified subgroups (SAP-5.3)** -- If no subgroup analyses are planned, state that explicitly. If subgroups are mentioned informally (e.g., "we may look at age groups"), formalize them or explicitly defer to exploratory analysis.
- [ ] **No multiplicity adjustment plan (SAP-7)** -- When there are multiple comparisons (multiple endpoints, multiple subgroups, interim analyses), state the adjustment method or document why none is needed.
- [ ] **No sensitivity analyses specified (SAP-9)** -- At minimum, one sensitivity analysis should test the robustness of the primary estimate to a changed assumption for the same estimand (e.g., MNAR missing-data assumption or alternative model). An alternative population or outcome definition (e.g., per-protocol) is a supplementary analysis, not a sensitivity analysis.
- [ ] **RCT minimum content missing (SAP-5.4 to SAP-5.6)** -- For RCTs: interim analyses and stopping guidance (or "none"), timing of final analysis relative to unblinding, protocol-deviation and adherence handling mapped to SAP-1.4 strategies, harms summaries, confidence level and sidedness, and software versions (Gamble et al. JAMA 2017, 55 items).

## Advisory Gaps (flag for awareness)

These are not strictly required but represent best-practice elements that strengthen the SAP.

- [ ] **No MCID or effect size justification (SAP-3.1, SAP-6)** -- The minimum clinically important difference should be justified from prior literature or clinical judgment, not assumed.
- [ ] **No TFL shell layouts (SAP-10)** -- Shell tables help align expectations with collaborators and catch output problems before analysis begins.
- [ ] **Vague covariate specification (SAP-5.1)** -- Covariates in adjusted models should be named explicitly, with justification for inclusion (confounder, precision variable, or effect modifier).
- [ ] **No automated data-quality follow-up plan** -- After the initial data profile/QA gate, stable rules such as key uniqueness, required not-null fields, accepted values, freshness thresholds, and referential integrity should be candidates for automated checks before recurring analyses.
- [ ] **Exploratory objectives not clearly separated (SAP-1.3)** -- Exploratory analyses should be explicitly labeled as hypothesis-generating to prevent inflation of confirmatory claims.

## How to Report Gaps

After writing the SAP, scan it against this checklist and report findings in this format:

```
### SAP Gap Report

**Critical gaps (must resolve before finalization):**
- [Gap name]: [specific description of what is missing in this SAP]

**Important gaps (resolve or document rationale):**
- [Gap name]: [specific description]

**Advisory (consider addressing):**
- [Gap name]: [specific description]

**No gaps found in:** [list sections that passed all checks]
```

If no critical or important gaps are found, report: "SAP passes gap checklist. [N] advisory items noted for consideration."
