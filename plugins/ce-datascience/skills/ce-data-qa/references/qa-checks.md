# Data QA Check Catalog

Each check has: id, applies_when, bucket, language-agnostic intent, R/Python recipes, what to put in findings table.

## Structural checks (always run)

### QA-1: Row count vs SAP target N

- **Bucket**: `block` if `actual_n < 0.5 * sap_target_n`; `warn` if `actual_n < 0.8 * sap_target_n`; `pass` otherwise
- **Why**: under-enrollment makes the SAP power calculation invalid
- **R**: `nrow(data)`
- **Python**: `len(df)`
- **Finding format**: "Expected N≥X (per SAP-2.1 power), got N=Y"

### QA-2: Required variable presence

- **Bucket**: `block` if any SAP-required variable is missing
- **Why**: cannot fit primary model without primary outcome / exposure
- **R**: `setdiff(required_vars, names(data))`
- **Python**: `set(required_vars) - set(df.columns)`
- **Finding format**: "Missing required variables: [list]. SAP-2.1 lists them as required."

### QA-3: Variable type matches SAP type spec

- **Bucket**: `block` if continuous variable arrived as character (typo bug); `warn` if categorical arrived as integer (factor levels lost)
- **Why**: silent type coercion produces wrong models
- **R**: `class(data[[var]])` vs SAP spec
- **Python**: `df[var].dtype` vs SAP spec
- **Finding format**: "Variable `age` expected continuous, got character. Likely an extraction bug."

### QA-4: Categorical value set matches SAP

- **Bucket**: `block` if unexpected category present (e.g., `treatment` should be `{placebo, drug}` but data has `unknown`); `warn` if expected category missing
- **Why**: regression treats unknowns as their own factor level, breaking interpretation
- **R**: `setdiff(unique(data[[var]]), sap_values)`
- **Python**: `set(df[var].unique()) - set(sap_values)`
- **Finding format**: "Variable `treatment`: SAP expects {placebo, drug}; data also contains: {unknown, NA-string}"

## Key-and-uniqueness checks

### QA-5: Primary key uniqueness

- **Bucket**: `block` if duplicates exist in SAP-declared primary key
- **Why**: duplicate subject IDs corrupt every downstream join
- **R**: `data |> count(subject_id) |> filter(n > 1)`
- **Python**: `df.duplicated(subset=['subject_id']).sum()`
- **Finding format**: "Primary key `subject_id` has X duplicates"

### QA-6: Required not-null per primary outcome

- **Bucket**: `block` if NA-rate > SAP-declared tolerance for primary outcome; `warn` if > 0.5 × tolerance
- **Why**: complete-case primary analysis is undermined by excessive missing
- **R**: `sum(is.na(data$primary_outcome)) / nrow(data)`
- **Python**: `df['primary_outcome'].isna().mean()`
- **Finding format**: "Primary outcome `OUTCOME_NAME` is X% missing; SAP allows ≤ Y%"

## Range and distribution checks

### QA-7: Continuous variable in plausible range

- **Bucket**: `block` if value violates physical/biological plausibility (negative age, birth year before 1900, lab value beyond instrument range)
- **Why**: catches encoding bugs (NA-as-99, missing-as-99999, unit confusion)
- **R**: `range(data[[var]], na.rm = TRUE)` vs SAP-declared bounds
- **Python**: `df[var].agg(['min', 'max'])`
- **Finding format**: "Variable `age` has values outside [0, 120]: min=-5, max=999"

### QA-8: Distribution shift vs prior wave

- **Bucket**: `warn` if mean shifts > 1 SD from prior wave; KS-test p < 0.01 vs prior
- **Why**: a re-extract that changes data shape silently is a SAP-amendment trigger
- **R**: KS test, `ks.test(current, prior)`
- **Python**: `scipy.stats.kstest(current, prior)`
- **Finding format**: "Variable `bmi` distribution shifted vs wave_001 (KS p=0.003)"

## Date sanity checks

### QA-9: Date order consistency

- **Bucket**: `block` if event_date < enrollment_date for any subject
- **Why**: temporal impossibilities indicate data corruption or merge bugs
- **R**: `sum(data$event_date < data$enrollment_date, na.rm = TRUE)`
- **Python**: `(df['event_date'] < df['enrollment_date']).sum()`
- **Finding format**: "X subjects have event_date before enrollment_date"

### QA-10: Date in study window

- **Bucket**: `block` if dates fall outside study enrollment window declared in SAP
- **Why**: out-of-window subjects shouldn't be in the extract
- **R**: `sum(data$enrollment_date < sap_window_start | data$enrollment_date > sap_window_end)`
- **Python**: same in pandas
- **Finding format**: "X subjects enrolled outside [STUDY_START, STUDY_END]"

## Missingness pattern checks

### QA-11: MAR/MCAR/MNAR pattern

- **Bucket**: `info` always; flag for review if monotone or block-missingness pattern detected
- **Why**: pattern dictates allowable imputation strategy in modeling
- **R**: `naniar::vis_miss(data)` or `mice::md.pattern(data)`
- **Python**: `missingno.matrix(df)`
- **Finding format**: "Missingness pattern: [monotone | block | scattered]. Imputation strategy implication: [text]"

### QA-12: Missingness clusters

- **Bucket**: `warn` if > 20% of variables share the same missing-row set
- **Why**: indicates a data-collection break (e.g., one form not administered)
- **Finding format**: "Variables [list] share missingness pattern in N subjects. Likely cause: missing form/visit."

## CONSORT flow (RCT only) / STROBE flow (observational)

### QA-13: CONSORT enrollment → analysis flow

- **Bucket**: `block` if implied flow doesn't add up (e.g., randomized > eligible)
- **Why**: required for reporting, exposes screening errors
- **Finding format**: "Eligible: X, Randomized: Y, Allocated: Z, Analyzed: W. Y > X is impossible."

### QA-14: STROBE eligibility flow

- **Bucket**: `info`; emit the numbers for the manuscript
- **Finding format**: "Source population: X, Eligible: Y, Included: Z, Analyzed: W"

## Provenance checks

### QA-15: Extract hash recorded

- **Bucket**: `block` if no hash recorded for this extract
- **Why**: cannot prove which data the analysis ran on
- **Finding format**: "No hash registered for extract_id. Re-run data_wave_register."

### QA-16: PHI columns flagged

- **Bucket**: `block` if columns matching PHI patterns (MRN, DOB-full, name, address, SSN) appear in a wave whose data_root is the repo
- **Why**: PHI must never enter the git tree
- **Finding format**: "Column `MRN` matches PHI pattern; data_root is inside repo. STOP and re-extract de-identified."

## Causal workflow integrity checks (Python/Pandas/Polars/DuckDB)

Run QA-17 through QA-23 when Python/Pandas/Polars/DuckDB prepares a dataset for a causal analysis. A confirmed integrity violation is a `block`; an absent contract or a library-specific risk that cannot be confirmed from the available artifacts is a `warn` for analyst resolution.

### QA-17: Join cardinality and row-count reconciliation

- **Bucket**: `block` when an observed join cardinality conflicts with the declared relationship, or when post-join rows cannot reconcile to the declared input counts, cohort waterfall, or expected analysis population; `warn` when the relationship or expected count was not declared.
- **Why**: accidental many-to-many joins duplicate people or person-time and can change a causal estimate without an error.
- **Python**: in Pandas use `merge(..., validate="one_to_one" | "one_to_many" | "many_to_one")` and compare pre/post row counts; in Polars or DuckDB group by join keys and reconcile source, matched, unmatched, and output counts.
- **Finding format**: "Join `exposure -> outcome` declared many-to-one; observed many-to-many and output N=Y cannot reconcile to input N=X."

### QA-18: Key uniqueness before joins

- **Bucket**: `block` if a declared entity or person-time key is duplicated in a relation asserted to be unique; `warn` if the intended key or grain was not declared.
- **Why**: key duplication makes join cardinality and the unit of analysis unreliable.
- **Python**: Pandas `df.duplicated(subset=key_columns).sum()`; Polars `df.group_by(key_columns).len().filter(pl.col("len") > 1)`; DuckDB `SELECT key_columns, count(*) FROM relation GROUP BY ALL HAVING count(*) > 1`.
- **Finding format**: "Declared key `patient_id, index_date` has X duplicate rows before the outcome join."

### QA-19: Type stability across inputs

- **Bucket**: `block` if a declared schema contract is violated or a confirmed type change changes key, date, exposure, outcome, or covariate interpretation; `warn` when no stable type contract exists.
- **Why**: a string/numeric identifier mismatch, timezone loss, or categorical-to-numeric coercion can silently alter matching, ordering, or model inputs.
- **Python**: compare Pandas `df.dtypes`, Polars `df.schema`, or DuckDB `DESCRIBE relation` to the prior approved extract or declared schema; report changed columns and nulls introduced by coercion.
- **Finding format**: "`index_date` changed from timezone-aware timestamp to string; declared schema violated."

### QA-20: Pandas index alignment

- **Bucket**: `block` when observed label-based alignment creates unmatched rows, unexpected nulls, or row-count changes in a declared paired operation; `warn` when intent (positional versus label alignment) cannot be established.
- **Why**: Pandas aligns Series and DataFrames on index labels, so arithmetic or assignment can pair different subjects while preserving plausible values.
- **Python**: assert `left.index.equals(right.index)` before paired operations, or reset/reindex explicitly and reconcile unmatched labels; record the before/after null count.
- **Finding format**: "Exposure assignment aligned on nonmatching indexes and introduced X unmatched rows."

### QA-21: Declared missing-data handling

- **Bucket**: `block` when prepared analysis data violates the SAP-declared missing-data rule or a required missingness indicator/imputation input is absent; `warn` when the SAP has no declared handling rule.
- **Why**: silently switching between complete-case, imputation, weighting, or a fallback fill value changes the target analysis.
- **Python**: compare missingness indicators, retained rows, and imputation inputs with the SAP rule; never replace missing values with a default without recording it.
- **Finding format**: "SAP declares multiple imputation for `income`; prepared data drops X missing records and supplies no imputation input."

### QA-22: Synthetic or fallback data detection

- **Bucket**: `block` when provenance, a file marker, or the pipeline confirms that a required real extract was replaced by synthetic, mock, sample, or fallback data; `warn` when provenance cannot establish which input was used.
- **Why**: a plausible synthetic fallback can produce a credible-looking but invalid analysis result.
- **Python**: verify registered extract hash/path and inspect configured fallback branches or dataset markers before analysis; fail loudly instead of continuing with a substitute.
- **Finding format**: "Expected registered extract `wave_004`; pipeline used `sample_data.csv` after source read failure."

### QA-23: Polars, DuckDB, and large eager-load risks

- **Bucket**: `warn` for unverified eager collection/materialization, DuckDB-to-memory transfer, or Polars execution-plan concerns; escalate to `block` only for a confirmed integrity violation such as truncation, dropped rows, failed predicate application, or an unreconciled output count.
- **Why**: these patterns can be expensive or fragile, but their presence alone does not prove the analysis data are wrong.
- **Python**: inspect Polars `collect()`/`fetch()` and DuckDB `.df()`/`.fetchdf()` boundaries, record row counts before and after materialization, and prefer lazy/SQL profiling when practical.
- **Finding format**: "WARN: DuckDB result materialized eagerly; output count is not yet reconciled to the source query."

## Adding a new check

Each check is a row in this table. To add: pick a unique QA-N id, declare bucket, write the language-agnostic intent + R + Python recipes, and document the finding format. Then add the check to `step 3` of SKILL.md.
