# Persona Catalog

The `method-review` skill uses this catalog to dispatch reviewers. The Roster table in `references/select-reviewers.md` is the authoritative source for spawn conditions; this file describes what each reviewer focuses on.

## Always-on (every review)

| Agent | Focus |
|-------|-------|
| `method-correctness-reviewer` | Logic errors, edge cases, state bugs, error propagation, intent compliance |
| `method-testing-reviewer` | Coverage gaps, weak assertions, brittle tests, missing edge case tests |
| `method-maintainability-reviewer` | Coupling, complexity, naming, dead code, premature abstraction |
| `method-project-standards-reviewer` | Compliance with the project's designated criteria, cited rule by rule |
| `method-learnings-researcher` | Search docs/solutions/ for past issues related to this PR (unstructured output) |

## Conditional — spawn when the diff hits the trigger

| Agent | Spawn when... |
|-------|---------------|
| `method-r-code-reviewer` | `.R` / `.Rmd` / `.qmd` files in diff |
| `method-r-pipeline-reviewer` | `.R` / `.Rmd` / `.qmd` files in diff |
| `method-python-ds-reviewer` | `.py` / `.ipynb` files with DS imports (pandas, numpy, scipy, sklearn, statsmodels) in diff |
| `method-kieran-python-reviewer` | `.py` files in diff |
| `method-methods-reviewer` | inferential/model-fitting code, or `analysis/model-strategy/*-model-strategy.md` / its `.R` or `.py` scaffold in diff |
| `method-multiplicity-reviewer` | multiple comparisons, subgroup, or repeated-testing code in diff |
| `method-reproducibility-reviewer` | analysis scripts, notebooks, or env lock files in diff |
| `method-sap-drift-detector` | `analysis/sap.md` (or any markdown with `sap_version` frontmatter) exists in project |
| `method-data-mapping-reviewer` | codebook, SAP variable list, or `analysis/sap-tables/03-variables.csv` in diff |
| `method-phi-leak-reviewer` | data files, codebooks, notebooks, manuscripts, figure files in diff, OR `stack_profile.data_root` is inside the repo |
| `method-targets-pipeline-reviewer` | `_targets.R`, `_targets.yaml`, or `tar_target(` in diff |
| `method-quarto-render-reviewer` | `.qmd`, `_quarto.yml`, `_publish.yml`, or `_book/` / `_site/` in diff |
| `method-reporting-checklist-reviewer` | `stack_profile.reporting_checklist` is set to a non-null guideline string AND a SAP exists. Pass that primary guideline plus `stack_profile.reporting_checklist_extensions`; use `references/guideline-registry.yaml` for the supported guideline files. |
| `method-data-leakage-reviewer` | ML training / evaluation code in diff -- target leakage, train-test contamination, look-ahead bias, normalization fit on test set, subject-in-both-splits |
| `method-fairness-reviewer` | prediction-model code AND data has subgroup variables (sex / race / age / site / payer) -- subgroup performance, demographic parity, equalized odds, mitigation plan |
| `method-calibration-reviewer` | prediction-model eval code that produces predicted probabilities -- calibration plot, intercept/slope, Brier, ICI, decision-curve analysis, and decision-aligned censoring-aware time-dependent AUC for survival models |
| `method-omop-mapping-reviewer` | OMOP CDM tables, `concept_id` columns, or concept-set YAMLs -- vocabulary version pinning, valid-window honoring, descendant inclusion, era vs occurrence, observation_period |
| `method-administrative-data-reviewer` | claims / billing / payer data -- continuous enrollment, look-back, claims truncation, payer mix, place of service, NDC-to-RxNorm, claims-vs-clinical disconnect |
| `method-concept-drift-reviewer` | concept sets / code lists used across multiple data waves or years -- ICD-9-to-10 transition, CPT yearly updates, SNOMED concept_id deprecation, vocab refresh drift |
| `method-causal-inference-reviewer` | causal-inference code (IPTW, matching, MSM, g-computation, DR, IV, RDD, DiD, target trial) -- DAG, confounder set, time-zero alignment, positivity, estimand, sensitivity analyses |
| `method-bioinfo-pipeline-reviewer` | Snakemake / Nextflow / CWL / Bioconductor pipelines -- env pinning, reference pinning, sample-sheet validation, output checksums, caching traps, version traceability |
| `method-omics-batch-reviewer` | omics count or beta matrices + downstream differential / clustering / ML -- batch screening, batch-condition confound, blind ComBat, method-data-type mismatch, sample-sheet hygiene |
| `method-sprint-audit-reviewer` | dispatched only by `method-sprint close`; not selected by code-review directly. Audits planned-vs-actual sprint outputs, scope discipline, reproducibility re-run |
| `method-security-reviewer` | auth, public endpoints, user input, permissions in diff |
| `method-performance-reviewer` | DB queries, loop-heavy transforms, caching, async, large-data operations in diff |
| `method-reliability-reviewer` | error handling, retries, timeouts, background jobs in diff |
| `method-adversarial-reviewer` | >=50 changed non-test/non-generated lines, OR data mutations, external APIs, high-risk domains |
| `method-previous-comments-reviewer` | reviewing a PR with existing review comments |

## Selection notes

- Always spawn the always-on set unless the Stage 3c lite-roster gate in `references/select-reviewers.md` applies.
- For each conditional, check the trigger; spawn when it matches. The reviewer's own frontmatter `description:` reinforces the trigger so the dispatch stays consistent.
- Announce the team before spawning with a one-line justification per conditional reviewer selected.
