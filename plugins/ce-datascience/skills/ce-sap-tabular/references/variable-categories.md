# Variable categories

The `category` column in `03-variables.csv` is a controlled vocabulary. Use the canonical labels below; a free-form `notes` column is available for everything else.

## Canonical categories

### `Outcome`

Endpoints. Primary, secondary, exploratory, competing-risk -- all live here.

Examples: `extubation_flag`, `time_to_extubation`, `death_flag`, `days_to_death`, `VFD_28`, `ICU_LOS`, `mortality_30d`.

### `Exposure`

The variable(s) the study is testing. Includes derived exposure variants and sensitivity definitions.

Examples: `SAT_delivered_primary`, `SAT_delivered_modified`, `SBT_delivered_2min`, `SBT_delivered_5min`, `treatment_assignment`, `dose_received`, `intervention_period`.

### `Patient Characteristic`

Stable patient-level variables; do not change within an episode. Demographic + comorbidity.

Examples: `age`, `sex`, `race`, `ethnicity`, `BMI_admit`, `CCI`, `Elixhauser_score`, `insurance_type`.

### `Clinical Characteristic`

Time-varying clinical state; lagged or daily-resolved variables. Often used as covariates in longitudinal models.

Examples: `SOFA_prior`, `SOFA_mean`, `FiO2_prior`, `FiO2_mean`, `PEEP_prior`, `NEE_prior`, `sedation_prior`, `lactate_max_prior`.

Convention: append `_prior` for lagged values, `_mean` for episode-summary, `_max` / `_min` for episode extremes, `_first` / `_last` for first/last observed.

### `Cluster`

Variables that index the clustering / random-effect structure. Typically not modeled as predictors.

Examples: `hospital_id`, `site_id`, `region`, `provider_id`, `cluster`, `study_period`.

### `ID`

Identifiers used for joins, indexing, or coordinated-center pooling. Never used as predictors.

Examples: `subject_id`, `study_id`, `participant_id`, `hospitalization_id`, `episode_id`, `vent_episode_id`.

ID variables MUST NOT be PHI. If the EHR's MRN is used as the join key, replace it with a study-generated id before any artifact is committed. (`ce-phi-leak-reviewer` enforces this.)

### `Derivation Helper`

Intermediate variables computed during data preparation that are NOT directly modeled but are required to derive other variables.

Examples: `vent_start`, `vent_day`, `eligibility_window_start`, `eligibility_window_end`, `prior_day_present_flag`.

These belong in the catalog so reviewers can trace how primary variables are constructed, and so a re-extract that omits them is detected.

## Type column values

- `Fixed` -- one value per patient / episode / cluster
- `Time-varying` -- one value per row in the long-format file (typically per-day, per-encounter, per-observation)

## Levels column hints

For categoricals, list the expected level set: `{M, F}`, `{placebo, drug}`, `{0, 1}`. For continuous variables, give the expected range or unit: `Numeric (kg/m^2)`, `Integer 0-28`, `Numeric (mg/dL)`. For dates, write `Date (YYYY-MM-DD)` or `Datetime (UTC)`.

The `levels` column is what `ce-data-qa` (QA-4 categorical check) and `ce-data-mapping-reviewer` (level-set drift check) consult. Be specific.

## File column

Values: `File 1`, `File 2`, `File 3`, ..., or `Both` when a variable appears in multiple files (e.g., subject IDs, hospital IDs).

## Per-analysis flag columns

One column per analysis from `01-overview.csv`. Use:

- `✓` if the variable is used in that analysis
- (blank) if not used

The flag captures any role: predictor, outcome, stratifier, cluster, ID. The `notes` column distinguishes role when needed.

## Notes column

Free-form. Reserved for:

- TBD operationalization decisions ("TBD: confirm binary vs. norepinephrine-equivalent dose with PIs")
- Derivation formulas ("Lagged 1 day from raw `SOFA`")
- Unit/scale notes ("In kg/m^2; if data arrive in lbf/in^2, convert at load time")
- PHI flags ("Source EHR MRN; replace with study-generated id before commit")
