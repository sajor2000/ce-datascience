# Lifecycle Paths

## Contents

- Data-First Planning Invariant
- Path 1: Observational Study
- Path 2: Clinical Trial Analysis
- Path 3: Prediction / ML Model
- Path 4: Bioinformatics / Omics
- Path 5: Technical / Software Implementation

Ordered skill sequences for each project type. Steps marked with language-specific notes where they differ.

---

## Data-First Planning Invariant

For any project with inspectable data, actual columns and QA evidence come before SAP finalization, coding, or modeling. Load the `method-data-qa` skill in pre-SAP column profile mode as the first data-touching planning step for tabular data, or `method-omics-qc` first for omics data. Use `method-model-choice` after that gate and before SAP finalization whenever the model choice is nontrivial. If no dataset exists yet, `method-plan` must keep variable/model sections provisional and list `method-data-qa` then `method-model-choice` as required next steps before `method-sap-workbook`, `method-sprint`, or `method-work`. Every new SAP must then get the biostatistics-style tabular workbook contract (`Overview`, `Outputs`, `Master Variables`) through `method-sap-workbook` before sprint/work.

---

## Path 1: Observational Study

Full biomedical lifecycle — 15 steps. Most common path for EHR, OMOP, CLIF, and administrative claims data.

| # | Skill | Purpose | Python Jupyter | Python Marimo | R |
|---|---|---|---|---|---|
| 1 | `method-question` | PICO + FINER hardening | YAML output | YAML output | YAML output |
| 2 | `method-pubmed` | Literature search | — | — | — |
| 3 | `method-extract` | Extract stats methods from literature | — | — | — |
| 4 | `method-checklist` | Select reporting checklist | STROBE | STROBE | STROBE |
| 5 | `method-meta-analysis` | Pool effect sizes from literature | Python script | Python script | R script |
| 6 | `method-power` | Sample size + sensitivity sweep | Python script | Python script | R script |
| 7 | `method-cohort` | Define study cohort | OMOP SQL + JSON | OMOP SQL + JSON | CAPR + SQL |
| 8 | `method-data-qa` | Column profile + data quality gate (GO/NO-GO) before SAP | pandas checks | polars checks | tidyverse checks |
| 9 | `method-phenotype` | Chart-review gold standard | Python script | Python script | R script |
| 10 | `method-model-choice` | Evidence-ground model family, dependence structure, diagnostics, and scaffold | Python scaffold | Python scaffold | R scaffold |
| 11 | `method-plan` (SAP mode) | Write Statistical Analysis Plan | — | — | — |
| 12 | `method-sap-workbook` | Required biostatistics tabular SAP workbook for programmers | — | — | — |
| 13 | `method-sprint` | Open bounded analysis sprint | — | — | — |
| 14 | `method-work` | Execute analysis | `.ipynb` notebook | Marimo `.py` | Quarto `.qmd` |
| 15 | `method-review` | Statistical + methodological review | Python reviewers | Python reviewers | R reviewers |

### Optional bookends

- `method-ideate` before step 1 — when the research question is still fuzzy
- `method-grill` before step 1 or step 11 — stress-test goal, hypothesis, data, analysis, target journal, and audience one question at a time
- `method-prereg` before step 8 when possible (register before data access); otherwise after step 12, declaring "Registration prior to analysis of the data" and what the QA examined — pre-register on OSF, ClinicalTrials.gov, PROSPERO, or AsPredicted
- `method-compound` after step 15 — document validated analytical approaches and learnings

### Data-layer overlays

**OMOP CDM:**
- Step 4: routes to STROBE + RECORD (EHR extension)
- Step 7: `method-cohort` generates OMOP SQL + JSON concept sets with vocabulary version pinning
- Step 15: auto-dispatches `method-omop-mapping-reviewer` (CDM correctness) and `method-concept-drift-reviewer` (ICD-9-to-10, CPT yearly updates)

**CLIF (Common Longitudinal ICU Format):**
- `method-clif` activates automatically — emits `__CE_CLIF__ active=true`
- Core source is `https://clif-icu.com/`; GitHub repos provide implementation details after the data dictionary version is known.
- Step 4: routes to STROBE + RECORD (default)
- Step 7: template projects follow cohort → quality checks → outlier handling → analysis (`code/01_*`, `code/02_*`, `code/03_*`, `code/04_*`)
- Step 9: skip — mCIDE vocabulary handles phenotype definitions; no chart-review needed
- Step 14: Python uses `clifpy` (`ClifOrchestrator`); R uses `CLIF-Project-Template` layout
- Protected paths (`mCIDE/`, `ddl/`, `WORKFLOW.md`) require POC sign-off for edits

**Administrative claims:**
- Step 4: routes to STROBE + RECORD-PE (pharmacy/claims extension)
- Step 9: optional — claims data typically lacks chart-review gold standard
- Step 15: auto-dispatches `method-administrative-data-reviewer` (enrollment gaps, look-back, NDC-to-RxNorm)

### SAP emphasis by question type

When writing the SAP at step 11, these sections and reviewers are emphasized:

| Question type | SAP sections emphasized | Reviewers auto-dispatched at step 15 |
|---|---|---|
| Causal / treatment effect | Estimand, PS/IPTW/matching, sensitivity analyses | `method-causal-inference-reviewer` |
| Descriptive (population characterization) | Table 1 spec, missingness handling, standardized differences | `method-methods-reviewer` |
| Diagnostic accuracy | STARD elements: index test, reference standard, blinding | `method-methods-reviewer` |
| Time-to-event / survival | KM or Aalen-Johansen cumulative incidence (competing risks), Cox PH assumption checks, RMST when hazards are non-proportional | `method-methods-reviewer` |
| Federated / multi-site | Site as random effect, heterogeneity, harmonization | `method-omop-mapping-reviewer` or `method-clif` |

---

## Path 2: Clinical Trial Analysis

Condensed path — the trial protocol already defines population, intervention, and comparator. Skip literature search and cohort definition. Still run a dataset/column QA profile before writing or finalizing the SAP when trial data or extracts are available.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `method-data-qa` | Trial data column profile + QA gate | Required before SAP finalization when any extract exists |
| 2 | `method-model-choice` | Resolve primary model and dependence structure | Remains provisional while blinded inputs or data structure are unresolved |
| 3 | `method-checklist` | Select checklist | CONSORT 2025 (+ CONSORT-AI if AI intervention); protocol: SPIRIT 2025 (+ SPIRIT-AI) |
| 4 | `method-plan` (SAP mode) | Write CONSORT SAP | Estimands (ICH E9(R1): intercurrent events and strategies), analysis sets, missing-data and sensitivity analyses, prespecified covariate adjustment incl. stratification factors (FDA 2023), multiplicity, interim analyses, safety endpoints; check against Gamble et al. 2017 |
| 5 | `method-sap-workbook` | Required biostatistics tabular SAP workbook | — |
| 6 | `method-sprint` | Open sprint | — |
| 7 | `method-work` | Execute analysis | Language per stack profile |
| 8 | `method-review` | Review | Blinding-aware: blocks inferential code when `blinding_state: blinded` |

### Optional additions
- `method-power` before step 3 — if the protocol's sample size needs independent verification
- `method-prereg` after step 4 — update ClinicalTrials.gov SAP
- `method-compound` after step 8 — document learnings

---

## Path 3: Prediction / ML Model

Includes ML-specific skills for experiment tracking, model cards, and fairness review.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `method-question` | PICO with prediction framing | Comparator slot may be `null` |
| 2 | `method-pubmed` | Literature search | Prior models, feature sets, calibration benchmarks |
| 3 | `method-checklist` | Select checklist | Routes to TRIPOD+AI (+ CLAIM if imaging) |
| 4 | `method-cohort` | Define cohort | Internal-validation strategy defined here (bootstrap optimism correction or internal-external cross-validation by site/period; no random split sample unless n is very large; Collins et al., BMJ 2024, PMID 38191193) |
| 5 | `method-data-qa` | Column profile + data quality gate before SAP/modeling | — |
| 6 | `method-model-choice` | Select baseline/candidate models and validation strategy | Calibration, leakage boundary, stack-matched scaffold |
| 7 | `method-plan` (SAP mode) | Prediction SAP | Calibration plan, fairness subgroups, TRIPOD+AI sections |
| 8 | `method-ml-track` | Wire up tracking | mlflow / wandb / dvc / offline-YAML |
| 9 | `method-work` | Execute analysis | Language per stack profile |
| 10 | `method-model-card` | Mitchell-style model card | Overall + subgroup performance, ethical considerations |
| 11 | `method-review` | Review | Auto-dispatches `method-data-leakage-reviewer`, `method-fairness-reviewer`, `method-calibration-reviewer` |

### Optional additions
- `method-power` before step 4 — minimum sample size for model development by the Riley et al. criteria (R `pmsampsize`)
- `method-clif-meta-analysis` before step 6 — plan a performance-specific synthesis of discrimination/calibration from prior literature, with compatible horizons, validation designs, transformations and uncertainty. Its scalar-effect helper is not a ready-made performance-meta-analysis engine; do not send AUC/calibration values to the OR/HR/RR/MD/SMD power-anchor parser
- `method-compound` after step 11 — document learnings

---

## Path 4: Bioinformatics / Omics

For genomics, transcriptomics, proteomics, and methylation analyses.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `method-omics-qc` | Sequencing/omics data profile + QA before planning | FastQC, MultiQC, sample swap detection, batch-effect screen |
| 2 | `method-genome-build` | Pin genome build | GRCh37 / GRCh38 / T2T + GENCODE/Ensembl annotation |
| 3 | `method-model-choice` | Select statistical model after QC | Count/beta family, batch structure, repeated measures, multiplicity handoff |
| 4 | `method-plan` | Plan | Implementation plan, or SAP if differential expression / EWAS study |
| 5 | `method-work` | Execute analysis | — |
| 6 | `method-review` | Review | Auto-dispatches `method-bioinfo-pipeline-reviewer`, `method-omics-batch-reviewer` |

**Language note:** R dominates (Bioconductor, DESeq2, limma, edgeR). Python for Snakemake/Nextflow pipeline orchestration.

### Optional additions
- `method-question` + `method-pubmed` before step 1 — if the biological question needs hardening
- `method-compound` after step 6 — document learnings

---

## Path 5: Technical / Software Implementation

Default path when no biomedical signals are present. No SAP, no biomedical lifecycle skills.

If the software task reads, writes, transforms, models, or dashboards data tables, carry the same data-first invariant into `method-plan` implementation mode: inspect columns/schema and load the `method-data-qa` skill before coding data logic.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `method-brainstorm` | Requirements exploration | Interactive study of the problem space |
| 2 | `method-plan` (implementation mode) | Software implementation plan | Architecture, dependencies, test scenarios |
| 3 | `method-work` | Execute | — |
| 4 | `method-review` | Review | Standard code quality reviewers |

### Optional additions
- `method-ideate` before step 1 — when the problem space is wide open
- `method-compound` after step 4 — document learnings
