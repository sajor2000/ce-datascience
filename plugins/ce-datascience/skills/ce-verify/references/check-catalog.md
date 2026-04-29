# Verification Check Catalog

Each check runs independently. Skip checks that don't apply to the current analysis.

## 1. Sample Size Check

**What:** Does the analysis N match expectations?

**Sources to cross-reference:**
- `analysis/data-qa-report.md` — expected N from data QA gate
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

**Pass:** No leakage signals detected.
**Warn:** Ambiguous pattern found (e.g., scaling code exists but split location is unclear).
**Fail:** Clear leakage detected (e.g., `StandardScaler().fit(X)` before `train_test_split()`).

**When to skip:** No train/test split exists (single-cohort observational study with no prediction model).

## 3. Effect Direction Check

**What:** Does the observed effect direction match the hypothesis?

**Source:** `analysis/research-question.yaml` — `pico.outcome` and the study hypothesis.

**Pass:** Effect direction matches hypothesis, or study is descriptive (no directional hypothesis).
**Warn:** Effect direction is opposite to hypothesis — not necessarily wrong (null findings are valid), but requires acknowledgment.
**Fail:** N/A — a reversed effect is never a structural error, only a scientific finding.

**When to skip:** No `analysis/research-question.yaml` exists, or the study is purely descriptive.

## 4. Missing Data Audit

**What:** Are key variables missing at acceptable rates? Does the imputation strategy match the SAP?

**Checks:**
- Missingness rate per key variable (exposure, outcome, primary covariates)
- Imputation method matches SAP specification (e.g., SAP says "multiple imputation with m=20" — verify)
- Complete-case analysis is documented if used (and SAP allows it)

**Pass:** All key variables below threshold (default 5%, or SAP-specified threshold). Imputation method matches SAP.
**Warn:** One or more key variables between threshold and 20%. Or imputation method differs from SAP.
**Fail:** Key variable missing >20%, or outcome variable has missingness not addressed in SAP.

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

**CLIF-specific:** When `__CE_CLIF__ active=true`, additionally verify that `output/` contains no patient-level rows (CLIF rule: only aggregate/summary data in output).

## 6. Figure Quality

**What:** Do generated figures meet JAMA style requirements?

**Checks:**
- Font: Arial (or Helvetica), minimum 8pt for ALL text
- No text overlap: titles, legends, footnotes, axis labels, annotations don't collide
- Legends don't block data: placed outside the plot area
- Axis labels: sentence case, JAMA format
- Title: 10-12pt bold, axis labels: 9-10pt, tick labels: 8-9pt, annotations: 8pt minimum

**Pass:** All figures meet style requirements.
**Warn:** Minor issue detected (e.g., one label at 7pt, or legend partially overlapping non-critical area).
**Fail:** Major issue (text fully unreadable, legend blocking data, no axis labels).

**How to check:** Read each figure file (PNG, PDF, SVG) and visually inspect. For Matplotlib/ggplot2 source code, check font size parameters.

**When to skip:** No figure files found in output or analysis directories.

## 7. Reproducibility Check

**What:** Can this analysis be reproduced from the code and data?

**Checks:**
- Random seeds set in analysis scripts (`set.seed()`, `np.random.seed()`, `random_state=`)
- Package versions locked: `renv.lock` (R) or `requirements.txt` / `pyproject.toml` / `conda.lock` (Python)
- Data path references are absolute or config-driven (not hardcoded relative paths that break on other machines)
- No interactive/manual steps required (all steps scriptable)

**Pass:** Seeds set, package versions locked, data paths configurable.
**Warn:** Seeds set but no lockfile, or lockfile exists but some packages are unpinned.
**Fail:** No random seeds in scripts that use randomization (bootstrap, imputation, cross-validation, train/test split).
