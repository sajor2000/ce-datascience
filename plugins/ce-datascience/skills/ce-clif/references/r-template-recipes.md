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

Source: `code/templates/R/03_outlier_handling_template.R`. Always **after** QC and **before** analysis. Use `utils/outlier_handler.R` rather than ad-hoc `case_when` clipping; the helper enforces the consortium thresholds in `outlier-thresholds/<table>.csv`.

```r
source("utils/outlier_handler.R")
vitals_clean <- apply_outlier_thresholds(vitals, "vitals")
labs_clean   <- apply_outlier_thresholds(labs,   "labs")
```

Out-of-range values become `NA` and a per-row reason code is appended to a sidecar frame for audit. The contracts say: **never** silently clip to a min/max — propagate `NA` so downstream models can decide.

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

## 10. Where to read more

- CLIF-Project-Template (R): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template
- R templates directory: https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template/tree/main/code/templates/R
- CLIF data dictionary v2.1.1: https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/releases/tag/v2.1.1
- clifpy (when an R analysis needs to call into clifpy via `reticulate`): https://github.com/Common-Longitudinal-ICU-data-Format/clifpy
