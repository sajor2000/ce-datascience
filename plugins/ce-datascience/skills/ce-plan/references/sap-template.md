# SAP Template

Use this template when producing a Statistical Analysis Plan in SAP mode. The YAML frontmatter and `SAP-N.M` section identifiers are load-bearing -- downstream skills (`ce-work` SAP tracking, SAP-drift detector) parse them by ID. Do not renumber or restructure section IDs without updating consumers.

## YAML Frontmatter

```yaml
---
sap_version: 1
study_type: observational | rct | exploratory | other
date_created: YYYY-MM-DD
date_amended: YYYY-MM-DD
status: draft | final | amended
---
```

- `sap_version` starts at `1` and increments on substantive amendments (not typo fixes)
- `study_type` must be one of the four values shown; pick the closest fit
- `date_amended` and `status: amended` are set only when revising a finalized SAP
- A SAP in `draft` status may be edited freely; `final` signals the analysis plan is locked

## Section Template

```markdown
---
sap_version: 1
study_type: observational | rct | exploratory | other
date_created: YYYY-MM-DD
date_amended: YYYY-MM-DD
status: draft | final | amended
---

# Statistical Analysis Plan: [Study Title]

## SAP-1: Study Objectives

### SAP-1.1: Primary Objective

[State the primary research question in one sentence. Frame as testable hypothesis when possible.]

### SAP-1.2: Secondary Objectives

[List secondary objectives. Each should be independently testable.]

### SAP-1.3: Exploratory Objectives

[List exploratory analyses. Mark clearly as hypothesis-generating, not confirmatory.]

---

## SAP-2: Study Design

### SAP-2.1: Study Type

[Observational (cohort, case-control, cross-sectional), RCT (parallel, crossover, cluster), or other. Include temporal direction (retrospective, prospective, ambispective).]

### SAP-2.2: Study Population

[Define inclusion and exclusion criteria. Specify the source population and sampling frame.]

### SAP-2.3: Exposure / Intervention

[Define the exposure (observational) or intervention (RCT). Include timing, dosing, or measurement details.]

### SAP-2.4: Comparator

[Define the comparison group. For observational studies, specify how unexposed subjects are identified.]

---

## SAP-3: Endpoints

### SAP-3.1: Primary Endpoint(s)

[Define the primary outcome measure. Include how it is measured, at what time point, and the minimum clinically important difference (MCID) if applicable.]

### SAP-3.2: Secondary Endpoint(s)

[List secondary outcomes with measurement definitions.]

### SAP-3.3: Exploratory Endpoint(s)

[List exploratory outcomes. These do not drive power calculations.]

---

## SAP-4: Analysis Populations

### SAP-4.1: Primary Analysis Population

[Define the primary analysis population (e.g., intention-to-treat, per-protocol, as-treated). Specify how subjects are assigned to the analysis population.]

### SAP-4.2: Sensitivity Populations

[Define alternative analysis populations used in sensitivity analyses (e.g., complete-case, per-protocol if primary is ITT).]

---

## SAP-5: Statistical Methods

### SAP-5.1: Primary Analysis

[Specify the statistical model, estimation method, and inference approach for the primary endpoint. Include covariates, effect measure (OR, HR, RR, mean difference), confidence interval method, and significance threshold.]

### SAP-5.2: Secondary Analyses

[Specify methods for each secondary endpoint. May reference SAP-5.1 if methods are identical.]

### SAP-5.3: Subgroup Analyses

[List pre-specified subgroups with justification. State whether subgroup analyses are exploratory or confirmatory. Specify the interaction test used.]

---

## SAP-6: Sample Size and Power

[State the target sample size, the assumptions behind the power calculation (effect size, variance, alpha, power, dropout rate), and the software or formula used. For retrospective studies using existing data, state the available sample size and the minimum detectable effect at 80% power.]

---

## SAP-7: Multiplicity Adjustments

[Specify the multiplicity adjustment method (Bonferroni, Holm, Hochberg, FDR, gatekeeping, hierarchical testing) and which comparisons it covers. If no adjustment is applied, state the rationale (e.g., single primary endpoint, all secondary analyses are exploratory).]

---

## SAP-8: Missing Data Handling

[Describe the assumed missing data mechanism (MCAR, MAR, MNAR). Specify the primary approach (complete-case, multiple imputation, MMRM, inverse probability weighting) and any sensitivity analyses for alternative assumptions.]

---

## SAP-9: Sensitivity Analyses

[List each planned sensitivity analysis with its purpose and how it differs from the primary analysis. Common categories: alternative populations, alternative outcome definitions, alternative missing data approaches, alternative model specifications, and robustness checks for key assumptions.]

---

## SAP-10: Tables, Figures, and Listings

[Provide a numbered list of planned tables, figures, and listings (TFLs). Each entry should reference the SAP section it supports. Include shell table layouts for key outputs when useful.]

- Table 1: Baseline characteristics (SAP-2.2, SAP-4.1)
- Table 2: Primary analysis results (SAP-5.1)
- Figure 1: Study flow diagram / CONSORT (SAP-4.1)
```

## Writing Guidance

When filling in this template from a study design brainstorm:

1. Carry forward all study design decisions from the origin document -- do not re-litigate design choices made during brainstorming
2. Fill every section; if a section is not applicable, write "Not applicable: [reason]" rather than leaving it blank
3. Flag incomplete sections with `<!-- GAP: [description of what is needed] -->` so the gap checklist can detect them
4. Use precise statistical language -- name specific tests, models, and adjustment methods rather than vague descriptions like "appropriate statistical methods"
5. Cross-reference between sections using SAP-N.M identifiers (e.g., "using the population defined in SAP-4.1")
6. Keep the document self-contained -- a statistician should be able to execute the analysis plan without referring to the brainstorm document
