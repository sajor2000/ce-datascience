# CE DataScience — Guide for R Biostatisticians

*Written for Ashley and anyone doing ICU/EHR research in R with the CLIF consortium.*

## What this plugin does for you

You write R code for observational studies. This plugin gives your coding agent (Claude Code, Codex, Pi) the full biomedical research lifecycle as slash commands — from framing the PICO to reviewing your manuscript against STROBE. It knows CLIF's coding conventions, mCIDE vocabularies, and the three-script architecture your consortium uses.

When it detects you're in a CLIF project, it automatically:
- Enforces Parquet-only I/O (no CSV for CLIF tables)
- Validates `_category` columns against mCIDE vocabularies
- Blocks edits to protected paths (`mCIDE/`, `ddl/`, `WORKFLOW.md`) without POC sign-off
- Routes you to `CLIF-Project-Template` R recipes instead of generic code
- Defaults your reporting checklist to STROBE + RECORD

## Install (5 minutes)

### Prerequisites
- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- [Claude Code](https://claude.ai/code) — your AI coding agent
- R, RStudio or VS Code, renv

### Steps

```bash
git clone https://github.com/sajor2000/ce-datascience.git
cd ce-datascience && bun install
```

Add this alias to your `~/.zshrc` (or `~/.bashrc`):

```bash
alias claude-ds='claude --plugin-dir ~/ce-datascience/plugins/ce-datascience'
```

Then restart your terminal. From now on, use `claude-ds` instead of `claude`.

### First time in any project

```
claude-ds
/ce-setup
```

It will ask you a few questions. For a typical CLIF R project, answer:
- Language: **R** (auto-detected from `renv.lock`)
- IDE: **RStudio** or **VS Code**
- Libraries: **tidyverse**
- Data layer: **Parquet files**
- Stats packages: pick what you use (survival, lme4, etc.)
- Environment: **renv**
- Reporting: **Quarto** or **R Markdown**

This creates `.ce-datascience/config.local.yaml` in your project — gitignored, machine-local.

## Your daily workflow

### Starting a new study

```
/ce-workflow                    # shows where you are in the lifecycle
/ce-research-question "prone positioning incidence in severe ARF across CLIF sites"
```

The plugin hardens your one-liner into a structured PICO:
- **P**opulation: Adult ICU patients with severe ARF (P/F < 150)
- **I**ntervention: Prone positioning
- **C**omparator: Not proned
- **O**utcome: Incidence, 28-day mortality

Then suggests a PubMed query and a reporting checklist (STROBE + RECORD for multi-site EHR).

### Literature + power

```
/ce-pubmed                      # runs the PubMed search from your PICO
/ce-method-extract              # extracts stats methods from the top papers
/ce-effect-size                 # pools effect sizes from prior literature (R script)
/ce-power                       # sample size with sensitivity sweep (R script using pmsampsize)
```

Each generates an R script you can run in RStudio.

### Building the cohort

```
/ce-cohort-build
```

For CLIF projects, this generates R code that follows your consortium's conventions:

```r
# What the plugin generates (CLIF-aware)
library(arrow)
library(dplyr)

config <- yaml::read_yaml("config/config.yaml")

respiratory <- open_dataset(file.path(config$data_path, "clif_respiratory_support")) |>
  cast_large_utf8_to_utf8() |>       # CLIF convention: normalize Arrow schema
  left_join(cohort_ids, by = "hospitalization_id") |>
  filter(in_cohort == 1) |>
  collect()
```

It knows to:
- Use `arrow::open_dataset()` with `cast_large_utf8_to_utf8()` (CLIF convention for cross-site schema drift)
- Join on `hospitalization_id` (VARCHAR, never integer)
- Filter with `in_cohort` flag before `collect()` (lazy evaluation)
- Read config from `config/config.yaml` (site name, data path, timezone)
- Force all `*_dttm` columns to UTC via `lubridate::with_tz()`

### Data QA gate

```
/ce-data-qa
```

Runs 16 checks on your data. You get a GO / NO-GO verdict. If NO-GO, it tells you exactly what to fix before modeling. Your PI signs off on the report.

### Writing the SAP

```
/ce-plan
```

The plugin detects study-design keywords and enters **SAP mode** — it writes a Statistical Analysis Plan, not a software plan. For CLIF, it automatically:
- Uses STROBE + RECORD as the default checklist
- Structures the SAP with stable section IDs (SAP-1.1, SAP-2.3, etc.)
- Includes the three-script architecture in the implementation plan

### Running the analysis

```
/ce-sprint                      # scope a bounded sprint (e.g., "SAP sections 3.1-3.4")
/ce-work                        # execute with SAP tracking
```

`/ce-work` generates R Markdown (`.Rmd`) or Quarto (`.qmd`) files following the CLIF three-script architecture:

| Script | Purpose | What goes here |
|---|---|---|
| `code/00_cohort_ids.Rmd` | Define the cohort | Inclusion/exclusion, encounter_block grouping, cohort_ids tibble |
| `code/01_analysis.Rmd` | Local analysis | Run at each site on patient-level data; outputs aggregate CSVs |
| `code/02_risk_adjustment.Rmd` | Risk adjustment | Propensity scores with globally-fixed coefficients |
| `code/03_eda_summary.Rmd` | Multi-site EDA | Runs centrally on pooled aggregate CSVs |
| `code/04_meta_analysis.Rmd` | Meta-analysis | `metafor::rma()` + `meta::metagen()` for forest plots |

### Mid-workflow checks

```
/ce-verify
```

Quick sanity check between analysis steps:
- Does N match the cohort definition?
- Are random seeds set?
- Is `renv.lock` present?
- Do figures follow JAMA style (Arial, 8pt min, no overlap)?

### Code review

```
/ce-code-review
```

The plugin dispatches 55 specialized review agents. For your R CLIF project, these fire automatically:
- `ce-r-code-reviewer` — tidyverse patterns, dplyr logic, ggplot2 accessibility
- `ce-r-pipeline-reviewer` — survival analysis, mixed models, convergence
- `ce-methods-reviewer` — statistical test selection and assumptions
- `ce-reporting-checklist-reviewer` — STROBE + RECORD compliance (35 checklists available)
- `ce-sap-drift-detector` — checks your code matches the locked SAP
- `ce-phi-leak-reviewer` — scans for patient identifiers in output files

### Document learnings

```
/ce-compound
```

After the study, document what you learned — the exposure definition that worked, the outlier threshold that was too aggressive, the join pattern that handled cross-hospital transfers. Next time you (or anyone on the team) works on a similar study, the plugin surfaces these learnings automatically.

## CLIF-specific conventions the plugin enforces

| Convention | What the plugin does |
|---|---|
| **Parquet only** | Refuses CSV/Feather for CLIF tables; generates `arrow::open_dataset()` code |
| **`cast_large_utf8_to_utf8()`** | Always applied after `open_dataset()` — prevents cross-site schema drift |
| **VARCHAR IDs** | `patient_id` and `hospitalization_id` are always character, never numeric |
| **UTC datetimes** | All `*_dttm` columns converted to UTC via `lubridate::with_tz()` |
| **mCIDE vocabularies** | Validates `_category` column values against the allow-listed mCIDE CSVs |
| **Protected paths** | Blocks edits to `mCIDE/`, `ddl/`, `outlier-handling/`, `WORKFLOW.md` without POC sign-off |
| **Three-script architecture** | Generates code in `code/00_*`, `code/01_*`, `code/02_*` numbered files |
| **Config-driven** | Reads `config/config.yaml` for site name, data path, timezone, file type |
| **Output conventions** | Figures to `output/graphs/` as PDF; tables as CSV; no patient-level rows in `output/` |

## Meta-analysis support

For multi-site CLIF studies (like the proning incidence study), the plugin knows the federated analysis pattern:

**Local scripts (run at each site):**
```r
# Site-level aggregate output — NO patient-level data leaves the site
site_summary <- cohort |>
  group_by(stratum) |>
  summarise(
    n_patients = n(),
    n_events = sum(outcome == 1),
    rate = n_events / n_patients
  )

write_csv(site_summary, file.path(config$project_location, "output",
  paste0(config$site, "_global_aggregate_proning.csv")))
```

**Summary scripts (run centrally on pooled CSVs):**
```r
library(metafor)
library(meta)

# Pool across sites
pooled <- rma(yi = log_or, sei = se_log_or, method = "REML", data = site_data)

# Forest plot
forest_plot <- metagen(
  TE = log_or, seTE = se_log_or,
  studlab = site, data = site_data,
  sm = "OR", backtransf = TRUE
)
forest(forest_plot)

ggsave("summary_output/graphs/forest_proning_mortality.pdf", width = 10, height = 6)
```

The plugin generates this pattern when it detects multi-site analysis. It uses:
- `metafor::rma(method = "REML")` for random-effects pooling
- `meta::metagen(sm = "OR", backtransf = TRUE)` for forest plots
- `theme_classic() + scale_fill_viridis_d()` for figure styling
- Site CSVs named `[SITE]_global_aggregate_[descriptor].csv`

## R packages the plugin knows

These are the packages used across CLIF consortium projects. The plugin generates code using them correctly:

| Category | Packages |
|---|---|
| **Data I/O** | arrow (17.0+), data.table (1.16+), yaml, rprojroot |
| **Wrangling** | dplyr, tidyr, stringr, lubridate, forcats, purrr |
| **Statistics** | survival, lme4, sandwich, lmtest, marginaleffects |
| **Meta-analysis** | metafor, meta |
| **Tables** | gtsummary (2.0+), tableone, gt |
| **Figures** | ggplot2 (3.5+), viridis, patchwork, ggforestplot |
| **Reproducibility** | renv, quarto |

## Quick reference: slash commands for your workflow

| When you want to... | Run this |
|---|---|
| See where you are in the lifecycle | `/ce-workflow` |
| Frame your research question | `/ce-research-question "your study idea"` |
| Search PubMed | `/ce-pubmed` |
| Pick the right reporting checklist | `/ce-checklist-match` |
| Calculate sample size | `/ce-power` |
| Build a cohort | `/ce-cohort-build` |
| Check data quality | `/ce-data-qa` |
| Write a SAP | `/ce-plan` |
| Scope a sprint | `/ce-sprint` |
| Execute analysis | `/ce-work` |
| Mid-workflow sanity check | `/ce-verify` |
| Code review | `/ce-code-review` |
| Document what you learned | `/ce-compound` |

## Getting help

- `/ce-workflow` anytime to see what's next
- `/ce-setup` to reconfigure your stack
- Repository: https://github.com/sajor2000/ce-datascience
