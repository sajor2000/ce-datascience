# Verification Check Catalog

## Contents

- 1. Sample Size Check
- 2. Data Leakage Scan
- 3. Effect Direction Check
- 4. Missing Data Audit
- 5. PHI Scan
- 6. Figure Quality
- 7. Reproducibility Check
- 8. Number Registry Check

Each check runs independently. Skip checks that don't apply to the current analysis.

## 1. Sample Size Check

**What:** Does the analysis N match expectations?

**Sources to cross-reference:**
- `reports/data-qa/<extract_id>.md` (canonical `ce-data-qa` output; fall back to legacy `analysis/data-qa-report.md`) — expected N from data QA gate
- `analysis/power/` — minimum N from power calculation
- SAP file — stated sample size or inclusion/exclusion criteria

**Pass:** N within 10% of expected N from data QA, and N meets minimum from power calculation.
**Warn:** N differs from expected by 10-25%, or no power calculation found to compare against.
**Fail:** N is less than 75% of expected, or N is below the minimum from power calculation.

**How to check:** Search analysis scripts and output files for cohort counts, `nrow()`, `len()`, `.shape[0]`, CONSORT flow numbers. Compare against the reference sources.

## 2. Data Leakage Scan

**What:** Are train/test/validation splits respected? Is information from the future used to predict the past?

**Checks:**
- Normalization (StandardScaler, center/scale) fit on training data only, not full dataset
- No feature engineering using outcome variable
- Temporal splits honor time ordering (no future data in training set)
- Subject-level splits: same patient/subject not in both train and test
- No target encoding or frequency encoding computed on full dataset before splitting
- Feature selection, univariable screening, and oversampling (e.g., SMOTE) happen only after the split, inside training folds
- Hyperparameters and decision thresholds are chosen without touching the test set
- No duplicate or near-duplicate encounters across splits; repeated encounters are grouped by patient
- Every predictor is available at the prediction time point (no post-index codes, discharge diagnoses, or future labs)

Leakage taxonomy: Kapoor & Narayanan, Patterns 2023 (PMID 37720327).

**Pass:** No leakage signals detected.
**Warn:** Ambiguous pattern found (e.g., scaling code exists but split location is unclear).
**Fail:** Clear leakage detected (e.g., `StandardScaler().fit(X)` before `train_test_split()`).

**When to skip:** No train/test split exists (single-cohort observational study with no prediction model).

## 3. Effect Direction Check

**What:** Does the observed effect direction match the hypothesis?

**Source:** `analysis/research-question.yaml` — `pico.outcome` and the study hypothesis.

**Pass:** Effect direction matches hypothesis, or study is descriptive (no directional hypothesis).
**Warn:** Estimated direction is opposite to the hypothesis. First verify the exposure reference level, outcome event coding (e.g., Cox `event` 1 = event), and effect-measure orientation (e.g., OR for exposed vs unexposed) in the code; if coding is correct, report the reversal as a finding, not a defect. A CI spanning the null is an imprecise result, not a reversal.
**Fail:** N/A — a reversed effect is never a structural error, only a scientific finding.

**When to skip:** No `analysis/research-question.yaml` exists, or the study is purely descriptive.

## 4. Missing Data Audit

**What:** Is missingness reported, and is its handling valid under a stated mechanism and consistent with the SAP?

**Checks:**
- Missingness per key variable (exposure, outcome, primary covariates), reported for context
- Assumed mechanism (MCAR, MAR, MNAR) stated, and the handling method matches the SAP (e.g., SAP says "multiple imputation with m=20" — verify)
- With multiple imputation: the imputation model includes the outcome and all analysis-model variables, and m is at least the percentage of incomplete cases (White, Royston & Wood, Stat Med 2011, PMID 21225900)
- Complete-case analysis is justified (MCAR, or missingness depending only on covariates) and allowed by the SAP

**Pass:** Missingness is reported; the mechanism is stated; handling matches the SAP; MI (if used) meets the checks above.
**Warn:** Imputation method or m differs from the SAP; complete-case analysis is used without a stated justification; no MNAR sensitivity analysis (e.g., delta adjustment) is planned for a missing outcome.
**Fail:** Missing outcome or exposure data with no handling stated in the SAP, or MI that omits the outcome from the imputation model.

Never pass or fail on percent missing alone: bias depends on the mechanism and the method, not the proportion (Madley-Dowd et al., J Clin Epidemiol 2019, PMID 30878639).

## 5. PHI Scan

**What:** Do output files contain patient-level identifiers?

**Checks:**
- Files in `output/`, `analysis/`, and any `data_root` path
- Look for: MRN, SSN, date of birth, full name, address, phone, email, medical record number
- Check column names: `mrn`, `ssn`, `dob`, `name`, `address`, `phone`, `email`, `patient_name`
- Check for patient-level rows (individual-level data) in output files

**Pass:** No PHI signals detected.
**Warn:** Column names suggestive of PHI but values appear de-identified (e.g., hashed IDs).
**Fail:** Clear PHI detected (dates of birth, names, addresses in output files).

**CLIF-specific:** When `__CE_CLIF__ active=true`, permit patient-level working data only in gitignored `output/intermediate_phi/`; verify it is never shared or committed. Require `output/final_no_phi/` to contain aggregate-only artifacts with no identifiers, raw data files, or reported cells below the CLIF project floor of n>=10 (a stricter site or DUA rule wins).

## 6. Figure Quality

**What:** Do generated figures meet the project's style profile (`ce-figure`; target-journal rules only when a journal is declared)?

**Checks:**
- All text legible at final print size (default minimum 8pt unless the profile says otherwise)
- No text overlap: titles, legends, footnotes, axis labels, annotations don't collide
- Legends don't obscure data
- Axes labelled, with units

**Pass:** All figures meet style requirements.
**Warn:** Minor issue detected (e.g., one label at 7pt, or legend partially overlapping non-critical area).
**Fail:** Major issue (text fully unreadable, legend blocking data, no axis labels).

**How to check:** Read each figure file (PNG, PDF, SVG) and visually inspect. For Matplotlib/ggplot2 source code, check font size parameters.

If `analysis/publication/figures/figure-manifest.json` exists, validate it with `ce-figure` before marking figures manuscript-ready. The manifest must link each figure to source data, source code, caption, alt text, SAP section, and style profile.

**When to skip:** No figure files found in output or analysis directories.

## 7. Reproducibility Check

**What:** Can this analysis be reproduced from the code and data?

**Checks:**
- Random seeds set and recorded in output metadata: R `set.seed()` (parallel R: `RNGkind("L'Ecuyer-CMRG")` or `future.seed = TRUE`); Python `np.random.default_rng(seed)` (preferred over legacy `np.random.seed()`) and `random_state=`
- Package versions locked: `renv.lock` (R) or `requirements.txt` / `pyproject.toml` / `conda.lock` (Python)
- Data paths are project-root-relative (e.g., `here::here()`, `pathlib` relative to the repo root) or read from config; no hardcoded absolute or user-specific paths
- No interactive/manual steps required (all steps scriptable)

**Pass:** Seeds set, package versions locked, data paths configurable.
**Warn:** Seeds set but no lockfile, or lockfile exists but some packages are unpinned.
**Fail:** No random seeds in scripts that use randomization (bootstrap, imputation, cross-validation, train/test split).

## 8. Number Registry Check

**What:** Does every reported number trace to the analysis that produced it?

**Checks:** Load the `ce-numbers` skill and run its `check` on the manuscript sources, rendered copies, and tables. The gate reads `analysis/numbers/registry.json` and fails on untraced numbers, inline computed values, unknown placeholder ids, stale entries (a source file or script changed), untraceable entries (no sources, no SAP output, or an uncommitted script), unsuppressed counts from 1 to 10, unknown SAP output IDs, and when it found nothing to check.

**Pass:** The gate exits 0 and prints `PASS`.
**Warn:** Never; a number either traces or it does not.
**Fail:** The gate exits 1, or it could not run. List its `file:line: reason: token` lines as printed.

**When to skip:** No registry exists and the outputs do not yet feed a manuscript, table, caption, or model card.
