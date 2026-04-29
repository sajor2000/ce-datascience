# Lifecycle Paths

Ordered skill sequences for each project type. Steps marked with language-specific notes where they differ.

---

## Path 1: Observational Study

Full biomedical lifecycle — 14 steps. Most common path for EHR, OMOP, CLIF, and administrative claims data.

| # | Skill | Purpose | Python Jupyter | Python Marimo | R |
|---|---|---|---|---|---|
| 1 | `/ce-research-question` | PICO + FINER hardening | YAML output | YAML output | YAML output |
| 2 | `/ce-pubmed` | Literature search | — | — | — |
| 3 | `/ce-method-extract` | Extract stats methods from literature | — | — | — |
| 4 | `/ce-checklist-match` | Select reporting checklist | STROBE | STROBE | STROBE |
| 5 | `/ce-effect-size` | Pool effect sizes from literature | Python script | Python script | R script |
| 6 | `/ce-power` | Sample size + sensitivity sweep | Python script | Python script | R script (`pmsampsize`) |
| 7 | `/ce-cohort-build` | Define study cohort | OMOP SQL + JSON | OMOP SQL + JSON | CAPR + SQL |
| 8 | `/ce-data-qa` | Data quality gate (GO/NO-GO) | pandas checks | polars checks | tidyverse checks |
| 9 | `/ce-phenotype-validate` | Chart-review gold standard | Python script | Python script | R script |
| 10 | `/ce-plan` (SAP mode) | Write Statistical Analysis Plan | — | — | — |
| 11 | `/ce-sap-tabular` | Tabular SAP companion for programmers | — | — | — |
| 12 | `/ce-sprint` | Open bounded analysis sprint | — | — | — |
| 13 | `/ce-work` | Execute analysis | `.ipynb` notebook | Marimo `.py` | Quarto `.qmd` |
| 14 | `/ce-code-review` | Statistical + methodological review | Python reviewers | Python reviewers | R reviewers |

### Optional bookends

- `/ce-ideate` before step 1 — when the research question is still fuzzy
- `/ce-prereg` after step 11 — pre-register on OSF, ClinicalTrials.gov, PROSPERO, or AsPredicted
- `/ce-compound` after step 14 — document validated analytical approaches and learnings

### Data-layer overlays

**OMOP CDM:**
- Step 4: routes to STROBE + RECORD (EHR extension)
- Step 7: `ce-cohort-build` generates OMOP SQL + JSON concept sets with vocabulary version pinning
- Step 14: auto-dispatches `ce-omop-mapping-reviewer` (CDM correctness) and `ce-concept-drift-reviewer` (ICD-9-to-10, CPT yearly updates)

**CLIF (Common Longitudinal ICU Format):**
- `ce-clif` activates automatically — emits `__CE_CLIF__ active=true`
- Step 4: routes to STROBE + RECORD (default)
- Step 7: cohort follows three-script architecture (`code/01_qc_*`, `code/02_cohort_*`, `code/03_analysis_*`)
- Step 9: skip — mCIDE vocabulary handles phenotype definitions; no chart-review needed
- Step 13: Python uses `clifpy` (`ClifOrchestrator`); R uses `CLIF-Project-Template` layout
- Protected paths (`mCIDE/`, `ddl/`, `WORKFLOW.md`) require POC sign-off for edits

**Administrative claims:**
- Step 4: routes to STROBE + RECORD-PE (pharmacy/claims extension)
- Step 9: optional — claims data typically lacks chart-review gold standard
- Step 14: auto-dispatches `ce-administrative-data-reviewer` (enrollment gaps, look-back, NDC-to-RxNorm)

### SAP emphasis by question type

When writing the SAP at step 10, these sections and reviewers are emphasized:

| Question type | SAP sections emphasized | Reviewers auto-dispatched at step 14 |
|---|---|---|
| Causal / treatment effect | Estimand, PS/IPTW/matching, sensitivity analyses | `ce-causal-inference-reviewer` |
| Descriptive (population characterization) | Table 1 spec, missingness handling, standardized differences | `ce-methods-reviewer` |
| Diagnostic accuracy | STARD elements: index test, reference standard, blinding | `ce-methods-reviewer` |
| Time-to-event / survival | KM curves, log-rank, Cox PH assumption checks | `ce-methods-reviewer` |
| Federated / multi-site | Site as random effect, heterogeneity, harmonization | `ce-omop-mapping-reviewer` or `ce-clif` |

---

## Path 2: Clinical Trial Analysis

Condensed path — the trial protocol already defines population, intervention, and comparator. Skip literature search and cohort definition.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `/ce-checklist-match` | Select checklist | CONSORT (or CONSORT-AI if model-as-intervention, SPIRIT-AI if protocol) |
| 2 | `/ce-plan` (SAP mode) | Write CONSORT SAP | ITT/PP populations, imputation, stratification, safety endpoints |
| 3 | `/ce-sap-tabular` | Tabular SAP companion | — |
| 4 | `/ce-sprint` | Open sprint | — |
| 5 | `/ce-work` | Execute analysis | Language per stack profile |
| 6 | `/ce-code-review` | Review | Blinding-aware: blocks inferential code when `blinding_state: blinded` |

### Optional additions
- `/ce-power` before step 2 — if the protocol's sample size needs independent verification
- `/ce-prereg` after step 3 — update ClinicalTrials.gov SAP
- `/ce-compound` after step 6 — document learnings

---

## Path 3: Prediction / ML Model

Includes ML-specific skills for experiment tracking, model cards, and fairness review.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `/ce-research-question` | PICO with prediction framing | Comparator slot may be `null` |
| 2 | `/ce-pubmed` | Literature search | Prior models, feature sets, calibration benchmarks |
| 3 | `/ce-checklist-match` | Select checklist | Routes to TRIPOD+AI (or CLAIM if imaging) |
| 4 | `/ce-cohort-build` | Define cohort | Dev/val/test split boundaries defined here |
| 5 | `/ce-data-qa` | Data quality gate | — |
| 6 | `/ce-plan` (SAP mode) | Prediction SAP | Calibration plan, fairness subgroups, TRIPOD+AI sections |
| 7 | `/ce-ml-experiment-track` | Wire up tracking | mlflow / wandb / dvc / offline-YAML |
| 8 | `/ce-work` | Execute analysis | Language per stack profile |
| 9 | `/ce-model-card` | Mitchell-style model card | Overall + subgroup performance, ethical considerations |
| 10 | `/ce-code-review` | Review | Auto-dispatches `ce-data-leakage-reviewer`, `ce-fairness-reviewer`, `ce-calibration-reviewer` |

### Optional additions
- `/ce-effect-size` before step 6 — pool discrimination/calibration from prior literature
- `/ce-compound` after step 10 — document learnings

---

## Path 4: Bioinformatics / Omics

For genomics, transcriptomics, proteomics, and methylation analyses.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `/ce-bioinfo-qc` | Sequencing/omics QA | FastQC, MultiQC, sample swap detection, batch-effect screen |
| 2 | `/ce-genome-build` | Pin genome build | GRCh37 / GRCh38 / T2T + GENCODE/Ensembl annotation |
| 3 | `/ce-plan` | Plan | Implementation plan, or SAP if differential expression / EWAS study |
| 4 | `/ce-work` | Execute analysis | — |
| 5 | `/ce-code-review` | Review | Auto-dispatches `ce-bioinfo-pipeline-reviewer`, `ce-omics-batch-reviewer` |

**Language note:** R dominates (Bioconductor, DESeq2, limma, edgeR). Python for Snakemake/Nextflow pipeline orchestration.

### Optional additions
- `/ce-research-question` + `/ce-pubmed` before step 1 — if the biological question needs hardening
- `/ce-compound` after step 5 — document learnings

---

## Path 5: Technical / Software Implementation

Default path when no biomedical signals are present. No SAP, no biomedical lifecycle skills.

| # | Skill | Purpose | Notes |
|---|---|---|---|
| 1 | `/ce-brainstorm` | Requirements exploration | Interactive study of the problem space |
| 2 | `/ce-plan` (implementation mode) | Software implementation plan | Architecture, dependencies, test scenarios |
| 3 | `/ce-work` | Execute | — |
| 4 | `/ce-code-review` | Review | Standard code quality reviewers |

### Optional additions
- `/ce-ideate` before step 1 — when the problem space is wide open
- `/ce-compound` after step 4 — document learnings
