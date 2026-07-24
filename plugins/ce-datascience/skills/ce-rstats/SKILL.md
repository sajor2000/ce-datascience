---
name: ce-rstats
description: "Route R programming and statistical-analysis tasks to CE R workflows for analysis, tidyverse, event studies, package development, testing, CRAN, performance, and targets pipelines. Use when a project is R-first or the user asks for R-specific guidance."
argument-hint: "[analysis|review|tidyverse|event-studies|package|testing|cran|performance|targets]"
---

# R Statistics Router

## Skill Value

- **Problem it solves:** R projects need language-specific workflow guidance without bypassing CE design, data-QA, and reporting gates.
- **Use when:** The project uses R, RStudio, `.R`, `.Rmd`, `.qmd`, `renv`, `DESCRIPTION`, or `_targets.R`.
- **Output:** A selected R workflow with the relevant analytical contract and validation plan.
- **Ask only if:** The task could reasonably belong to more than one R workflow.
- **Do not do:** Do not change package dependencies, publish to CRAN, or replace failed data with synthetic examples without explicit authorization.

## Route

| Task | Skill |
|---|---|
| R analysis design, base R, modeling, sensitivity analysis | `/ce-rstats` |
| Read-only R code review | `/ce-r-review` |
| dplyr, tidyr, ggplot2, purrr, joins | `/ce-r-tidyverse` |
| Event-study or staggered adoption design | `/ce-r-event-studies` |
| Package API, documentation, release structure | `/ce-r-package-development` |
| testthat fixtures, snapshots, mocks | `/ce-r-package-testing` |
| CRAN readiness and submission preparation | `/ce-r-cran` |
| Profiling and performance improvement | `/ce-r-performance` |
| `targets` pipeline authoring and validation | `/ce-r-targets` |

## Shared R workflow

1. Inspect `renv.lock`, `DESCRIPTION`, `_targets.R`, Quarto/R Markdown files, and existing project conventions before proposing packages or file layout.
2. For research analysis, lock the estimand, grain, time zero, keys, missing-data handling, and success criteria with `/ce-plan` or `/ce-statistical-analysis-plan`.
3. Use `/ce-data-qa` before model code and keep R transformations fail-loud at schema, join, and type boundaries.
4. Preserve lockfiles and record `sessionInfo()` or the project-equivalent environment evidence with any reproducible result.
5. Use `/ce-code-review` for causal, survival, or reporting claims; language-specific R syntax does not validate methodology by itself.
