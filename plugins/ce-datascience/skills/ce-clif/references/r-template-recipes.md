# CLIF Project-Template Recipes (R)

Canonical R patterns for working with CLIF data, drawn directly from `Common-Longitudinal-ICU-data-Format/CLIF-Project-Template` (`code/templates/R/`, `config/`, `utils/`, `outlier-thresholds/`, `output/`). New CLIF analyses in R should start by cloning this template — never roll your own folder structure. The template enforces the federated-portability rules from `WORKFLOW.md`: site-specific paths only in `config/config.json`, package versions pinned with `renv`, scripts numbered for execution order.

## Table of contents

1. Repository layout (canonical R structure).
2. `renv` bootstrap (`00_renv_restore.R`).
3. `config/config.json` shape (site_name, tables_path, file_type).
4. `utils/config.R` and `utils/outlier_handler.R` pattern.
5. Cohort identification (`01_cohort_identification_template.R`).
6. Quality checks (`02_project_quality_checks_template.R`).
7. Outlier handling (`03_outlier_handling_template.R`).
8. Analysis (`04_project_analysis_template.R`).
9. Reading Parquet via `arrow::open_dataset()`.
10. Where to read more.

---

## 1. Repository layout

Clone `CLIF-Project-Template` and keep its structure:

```
project-root/
  code/
    templates/R/         # numbered scripts, executed in order
    cohort_id_app/       # optional Shiny app
  config/
    config_template.json # commit this (no PHI)
    config.json          # do NOT commit (gitignored)
  outlier-thresholds/    # consortium-agreed clinical thresholds (CSV)
  output/                # all derived files land here (gitignored)
  utils/
    config.R
    config.py            # Python sibling (kept for federated parity)
    outlier_handler.R
  renv.lock              # pinned package versions
  renv/
  README.md
```

Three rules from `WORKFLOW.md`:
- Site path lives **only** in `config/config.json`. Never hard-code paths in scripts.
- All derived files write to `output/` (gitignored).
- `renv.lock` is committed; `renv/` library is gitignored.

## 2. `renv` bootstrap

Source: `code/templates/R/00_renv_restore.R`. Always the first script in any session:

```r
# 00_renv_restore.R
if (!requireNamespace("renv", quietly = TRUE)) {
  install.packages("renv")
}
renv::activate()
renv::restore()
```

For first-time project initialization, the template ships `initialize_renv_template.R`, which seeds `renv.lock` from a base set: `tidyverse`, `arrow`, `here`, `gtsummary`, `knitr`, `jsonlite`. Run it once when starting a new project, then commit the resulting `renv.lock`.

## 3. `config/config.json` shape

Source: `config/config_template.json`. Commit `config_template.json`, copy it to `config.json`, and add `config/config.json` to `.gitignore`.

```json
{
    "site_name": "Your_Site_Name",
    "tables_path": "/path/to/tables/",
    "file_type": "csv/parquet/fst"
}
```

Rules:
- `site_name` is used in output filenames (federated runs ship results back as `<site>_<artifact>.parquet`).
- `tables_path` is the absolute path to CLIF Parquet files at this site.
- `file_type` is `parquet` for production CLIF (CLIF-safe rules forbid `csv`/`fst` for the official tables; the template keeps `csv` only for legacy compatibility).

## 4. `utils/config.R`

Source: `utils/config.R`. Single helper that every script `source()`s before reading data:

```r
# utils/config.R
library(jsonlite)

load_config <- function() {
  json_path <- "config/config.json"
  if (file.exists(json_path)) {
    config <- fromJSON(json_path)
    message("Loaded configuration from config.json")
  } else {
    stop("Configuration file not found. Please create config.json based on the config_template.")
  }
  return(config)
}

config <- load_config()
```

Then in any analysis script:

```r
source("utils/config.R")
site_name <- config$site_name
tables_path <- config$tables_path
```

`utils/outlier_handler.R` provides `apply_outlier_thresholds(df, table_name)` which reads the matching CSV from `outlier-thresholds/` and sets out-of-range values to `NA` (never silently clipped).

## 5. Cohort identification

Source: `code/templates/R/01_cohort_identification_template.R`. Pattern: declare which CLIF tables this project needs as boolean flags, load them, derive a `hospitalization_id` cohort, write filtered tables to `output/`.

```r
library(knitr)
library(here)
library(tidyverse)
library(arrow)
library(gtsummary)

source("utils/config.R")

# Cohort parameters (move to config if site-specific)
start_date <- "2020-01-01"
end_date   <- "2021-12-31"
include_pediatric <- FALSE
include_er_deaths <- TRUE

# Declare required tables (TRUE = needed for this project)
tables <- c("patient", "hospitalization", "vitals", "labs",
            "medication_admin_continuous", "adt", "patient_assessments",
            "respiratory_support", "position", "dialysis", "intake_output",
            "procedures", "admission_diagnosis",
            "microbiology_culture",
            "medication_admin_intermittent")
true_tables <- c("patient", "hospitalization", "adt", "vitals", "labs",
                 "medication_admin_continuous", "respiratory_support",
                 "microbiology_culture")
table_flags <- setNames(tables %in% true_tables, tables)

# Load each TRUE-flagged table from tables_path
load_clif_table <- function(name) {
  arrow::open_dataset(file.path(config$tables_path, paste0("clif_", name, ".parquet")))
}

clif <- lapply(tables[table_flags], load_clif_table)
names(clif) <- tables[table_flags]
```

## 5b. Arrow schema normalization (CRITICAL for multi-site)

Arrow's `large_utf8` type varies across site ETL implementations. Joins between `large_utf8` and `utf8` columns fail silently or produce empty results. Always cast immediately after `open_dataset()`:

```r
cast_large_utf8_to_utf8 <- function(dataset) {
  schema <- dataset$schema
  new_fields <- lapply(schema$fields, function(f) {
    if (inherits(f$type, "LargeUtf8") || f$type$ToString() == "large_string") {
      arrow::field(f$name, arrow::utf8())
    } else {
      f
    }
  })
  dataset$cast(do.call(arrow::schema, new_fields))
}

# Apply to EVERY open_dataset() call before filtering or joining:
table_data <- open_dataset(file.path(config$tables_path, "clif_table_name")) |>
  cast_large_utf8_to_utf8() |>
  left_join(cohort_ids, by = "hospitalization_id") |>
  filter(in_cohort == 1) |>
  collect()
```

## 5c. Encounter block grouping (cross-hospital transfers)

When patients transfer between hospitals within a system, separate `hospitalization_id` values represent what is clinically one ICU stay. Group linked admissions by time gap:

```r
create_encounter_blocks <- function(hospitalizations, gap_hours = 6) {
  hospitalizations |>
    arrange(patient_id, admission_dttm) |>
    group_by(patient_id) |>
    mutate(
      prev_discharge = lag(discharge_dttm),
      gap = as.numeric(difftime(admission_dttm, prev_discharge, units = "hours")),
      new_block = is.na(gap) | gap > !!gap_hours,
      encounter_block = cumsum(new_block)
    ) |>
    ungroup()
}
```

## 5d. Namespace collision guard

Arrow and dplyr both export `filter` and `select`. Declare explicitly at the top of every script:

```r
select <- dplyr::select
filter <- dplyr::filter
```

## 5e. Conditional assignment

Base R `ifelse()` drops attributes and mishandles NA. Use `data.table::fifelse()` or `dplyr::if_else()`:

```r
data <- data |>
  mutate(flag = fifelse(value < threshold, TRUE, FALSE, na = NA))
```

## 6. Quality checks

Source: `code/templates/R/02_project_quality_checks_template.R`. Mirrors clifpy's DQA: schema, missingness, mCIDE category violations, range violations, datetime timezone, ID typing.

```r
source("utils/config.R")
library(arrow); library(dplyr); library(janitor)

vitals <- arrow::open_dataset(file.path(config$tables_path, "clif_vitals.parquet")) |>
  collect()

# 1. mCIDE check: vital_category must be in the allow list
allowed <- c("temp_c", "heart_rate", "sbp", "dbp", "spo2",
             "respiratory_rate", "map", "height_cm", "weight_kg")
mcide_violations <- vitals |>
  filter(!vital_category %in% allowed) |>
  count(vital_category, sort = TRUE)

# 2. Datetime timezone: every datetime must be UTC tz-aware
stopifnot(attr(vitals$recorded_dttm, "tzone") == "UTC")

# 3. Range check via outlier-thresholds/vitals.csv
source("utils/outlier_handler.R")
vitals_clean <- apply_outlier_thresholds(vitals, "vitals")
```

Write the QC report to `output/qc/` so federated leads can inspect every site's report side-by-side.

## 7. Outlier handling

Outlier thresholds are managed by the project template's `utils/outlier_handler.R` (R) or by clifpy (Python). Do not hardcode thresholds in analysis scripts — call the shared handler:

```r
source("utils/outlier_handler.R")
vitals_clean <- apply_outlier_thresholds(vitals, "vitals")
labs_clean   <- apply_outlier_thresholds(labs,   "labs")
```

## 7b. Wide dataset construction

The wide dataset merges all narrow CLIF tables into one row per (hospitalization_id, timestamp). The time grid is every unique timestamp across all joined tables — not a fixed interval.

```r
# Pattern: build the time grid, then left-join each table
time_grid <- bind_rows(
  vitals |> select(hospitalization_id, event_dttm = recorded_dttm),
  labs |> select(hospitalization_id, event_dttm = lab_result_dttm),
  respiratory |> select(hospitalization_id, event_dttm = recorded_dttm)
) |> distinct()

wide <- time_grid |>
  left_join(vitals_wide, by = c("hospitalization_id", "event_dttm")) |>
  left_join(labs_wide, by = c("hospitalization_id", "event_dttm")) |>
  left_join(respiratory_wide, by = c("hospitalization_id", "event_dttm")) |>
  group_by(hospitalization_id) |>
  arrange(event_dttm) |>
  fill(everything(), .direction = "down") |>
  ungroup()
```

Forward-fill within hospitalization handles gaps in categorical variables. Always `group_by(hospitalization_id)` before `fill()`.

## 7c. Time-varying exposure windows

For MSM or decision-point analyses, define explicit time windows rather than using continuous time:

```r
# Define decision points (e.g., every 12 hours from ICU admission)
decision_points <- cohort |>
  mutate(
    t0 = icu_admission_dttm,
    t1 = t0 + hours(12),
    t2 = t0 + hours(24)
  )

# Measure covariates at each decision point using the wide dataset
covariates_at_t <- wide |>
  inner_join(decision_points, by = "hospitalization_id") |>
  filter(event_dttm <= t1, event_dttm > t0) |>
  group_by(hospitalization_id) |>
  summarise(across(where(is.numeric), ~ last(na.omit(.x))))
```

## 7d. CONSORT flow tracking

Track exclusion counts as a running list — update at every filtering step:

```r
flow <- list()
flow$eligible <- nrow(hospitalizations)

cohort <- hospitalizations |> filter(age >= 18)
flow$adult <- nrow(cohort)

cohort <- cohort |> filter(icu_los_hours >= 24)
flow$icu_24h <- nrow(cohort)

# Save as CSV alongside the analysis
flow_df <- tibble(step = names(flow), n = unlist(flow))
write_csv(flow_df, file.path("output", "cohort_flow.csv"))
```

## 8. Analysis

Source: `code/templates/R/04_project_analysis_template.R`. Reads filtered, cleaned tables from `output/cohort/`, computes the analytic frame, writes `output/<site>_<artifact>.parquet`.

```r
source("utils/config.R")
library(arrow); library(dplyr); library(gtsummary)

cohort <- arrow::read_parquet("output/cohort/cohort_hospitalizations.parquet")

# Example: SOFA-like derived features. For full SOFA, prefer clifpy's
# compute_sofa_scores via reticulate; the R template keeps a simplified
# subset for sites that are R-only.

results <- cohort |>
  mutate(los_days = as.numeric(difftime(discharge_dttm, admission_dttm, units = "days"))) |>
  group_by(site = config$site_name) |>
  summarise(
    n        = n(),
    los_med  = median(los_days, na.rm = TRUE),
    mort_30d = mean(died_within_30d, na.rm = TRUE),
  )

arrow::write_parquet(results, file.path("output", paste0(config$site_name, "_results.parquet")))
```

## 9. Reading Parquet via `arrow::open_dataset()`

Always prefer `arrow::open_dataset()` over `arrow::read_parquet()` for CLIF tables — it lazily plans the read and pushes filters down to the file, which matters for `vitals` and `labs` (often >50M rows).

```r
library(arrow); library(dplyr)
ds <- arrow::open_dataset(file.path(config$tables_path, "clif_vitals.parquet"))

vitals_2021 <- ds |>
  filter(recorded_dttm >= as.POSIXct("2021-01-01", tz = "UTC"),
         recorded_dttm <  as.POSIXct("2022-01-01", tz = "UTC"),
         vital_category %in% c("heart_rate", "map")) |>
  collect()
```

## 9b. Propensity score and causal inference patterns

CLIF studies commonly use IPTW with stabilized weights for observational causal inference:

```r
library(WeightIt)
library(survey)
library(survival)

# IPTW — exclude SOFA if its components are already covariates
w <- weightit(
  treatment ~ age + sex + bmi + charlson + apache,
  data = cohort,
  method = "ps",
  estimand = "ATE"
)

# Stabilized weights reduce variance
cohort$sw <- w$weights

# Weighted outcome model
design <- svydesign(ids = ~1, weights = ~sw, data = cohort)
fit <- svyglm(outcome ~ treatment, design = design, family = binomial())
```

For competing risks (common in ICU — death competes with discharge):

```r
library(cmprsk)
library(survminer)

# Fine-Gray model with IPTW weights
fg <- crr(
  ftime = cohort$time_to_event,
  fstatus = cohort$event_type,  # 1=event, 2=competing, 0=censor
  cov1 = model.matrix(~ treatment + age + sex, data = cohort)[, -1],
  failcode = 1
)
```

Variables with fewer than 2 unique values at a site should be excluded from propensity models dynamically:

```r
# Drop zero-variance covariates before fitting
keep <- sapply(covariate_df, function(x) length(unique(na.omit(x))) >= 2)
covariate_df <- covariate_df[, keep]
```

## 10. Federated meta-analysis patterns

CLIF studies use a local-then-summary architecture: local scripts run at each site on patient-level data and emit aggregate CSVs; summary scripts run centrally on the pooled aggregates.

### 10a. Collating site results

```r
library(data.table)

# Load each site's aggregate CSV into a named list, then bind
site_files <- list.files("site_results", pattern = "_global_aggregate_.*\\.csv$", full.names = TRUE)
site_data <- lapply(site_files, function(f) {
  dt <- fread(f)
  dt$site <- tools::file_path_sans_ext(basename(f)) |> sub("_global_aggregate_.*", "", x = _)
  dt
})
pooled <- rbindlist(site_data)
```

### 10b. Random-effects meta-analysis

```r
library(metafor)
library(meta)

# Pool site-level estimates — REML is the consortium standard
fit <- rma(yi = log_estimate, sei = se_estimate, method = "REML", data = pooled)

# Forest plot
forest_obj <- metagen(
  TE = log_estimate, seTE = se_estimate,
  studlab = site, data = pooled,
  sm = "OR", backtransf = TRUE,
  common = FALSE, random = TRUE
)
forest(forest_obj)
```

### 10c. Bayesian hierarchical complement

Some CLIF studies run a Bayesian model alongside the frequentist meta-analysis for robustness:

```r
library(brms)

fit_bayes <- brm(
  outcome | trials(n) ~ 1 + (1 | site),
  data = pooled,
  family = binomial(),
  prior = c(prior(normal(0, 2), class = Intercept),
            prior(cauchy(0, 1), class = sd)),
  chains = 4, iter = 4000, warmup = 2000
)
```

### 10d. Figure conventions

```r
library(ggplot2)

# Consortium figure style: classic theme, legend below, PDF output
theme_clif <- theme_classic(base_size = 12, base_family = "Arial") +
  theme(legend.position = "bottom", strip.background = element_blank())

ggsave(file.path("output", "graphs", "figure_name.pdf"), width = 10, height = 6)
```

### 10e. Config with timezone

Some projects use `config.yaml` instead of `config.json`. Either works — the pattern is the same:

```r
library(yaml); library(lubridate)
config <- yaml::read_yaml("config/config.yaml")

# Convert site-local timestamps to UTC at load time
data <- data |>
  mutate(recorded_dttm = with_tz(
    as.POSIXct(recorded_dttm, tz = config$timezone), tzone = "UTC"
  ))
```

## 11. Where to read more

- CLIF-Project-Template (R): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template
- R templates directory: https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template/tree/main/code/templates/R
- CLIF data dictionary v2.1.1: https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/releases/tag/v2.1.1
- clifpy (Python client, also callable from R via `reticulate`): https://github.com/Common-Longitudinal-ICU-data-Format/clifpy
- CLIF consortium repos: https://github.com/orgs/Common-Longitudinal-ICU-data-Format/repositories
