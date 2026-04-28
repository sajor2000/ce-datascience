# SAP Gap Checklist

Run this checklist against every SAP produced in SAP mode. Each item is a common gap that weakens a statistical analysis plan. Report gaps to the user after writing the SAP, grouped by severity.

## Critical Gaps (block finalization)

These gaps make the SAP unexecutable or scientifically incomplete. A SAP with any critical gap should remain in `status: draft`.

- [ ] **Primary endpoint not clearly defined (SAP-3.1)** -- The primary endpoint must name the specific outcome measure, how it is measured, and the time point. "Clinical outcome" or "patient improvement" without operationalization is insufficient.
- [ ] **Analysis population not specified (SAP-4.1)** -- The primary analysis population must be explicitly defined (ITT, per-protocol, as-treated, or other). Without this, the denominator is ambiguous.
- [ ] **No primary statistical method specified (SAP-5.1)** -- The primary analysis must name the statistical model (e.g., logistic regression, Cox PH, linear mixed model), not just "we will compare groups."
- [ ] **No sample size or power assessment (SAP-6)** -- Either a prospective power calculation or a retrospective minimum detectable effect statement is required. "We will use all available data" without a power assessment is a gap.

## Important Gaps (should resolve before finalization)

These gaps reduce rigor but do not block execution. A SAP can proceed to `status: final` with these gaps only if each is acknowledged with documented rationale.

- [ ] **No missing data handling plan (SAP-8)** -- Every analysis plan should state the assumed missing mechanism and primary approach. Real-world data always has missingness; ignoring it is a design choice that should be explicit.
- [ ] **No pre-specified subgroups (SAP-5.3)** -- If no subgroup analyses are planned, state that explicitly. If subgroups are mentioned informally (e.g., "we may look at age groups"), formalize them or explicitly defer to exploratory analysis.
- [ ] **No multiplicity adjustment plan (SAP-7)** -- When there are multiple comparisons (multiple endpoints, multiple subgroups, interim analyses), state the adjustment method or document why none is needed.
- [ ] **No sensitivity analyses specified (SAP-9)** -- At minimum, one sensitivity analysis should test the robustness of the primary finding (alternative population, alternative model, or alternative missing data approach).

## Advisory Gaps (flag for awareness)

These are not strictly required but represent best-practice elements that strengthen the SAP.

- [ ] **No MCID or effect size justification (SAP-3.1, SAP-6)** -- The minimum clinically important difference should be justified from prior literature or clinical judgment, not assumed.
- [ ] **No TFL shell layouts (SAP-10)** -- Shell tables help align expectations with collaborators and catch output problems before analysis begins.
- [ ] **Vague covariate specification (SAP-5.1)** -- Covariates in adjusted models should be named explicitly, with justification for inclusion (confounder, precision variable, or effect modifier).
- [ ] **No data quality or validation plan** -- For administrative or EHR data, data quality checks (missingness rates, implausible values, temporal consistency) should be specified before analysis.
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
