# Stack-Profile-Aware Scaffolding

This reference defines how `/ce-work` generates analysis code scaffolding adapted to the user's stack profile. Load it when creating new analysis files during execution.

---

## Stack Profile Resolution

The stack profile is read from `.ce-datascience/config.local.yaml` via pre-resolution at skill load time. The relevant fields are:

```yaml
language: R | python          # Primary analysis language
ide: rstudio | vscode | other # Development environment
libraries:                     # Key libraries in the stack
  - tidyverse                  # or: pandas, numpy, scipy, etc.
  - broom
notebook_format: qmd | rmd | ipynb | marimo | script  # Preferred output format
```

If the config resolves to `__NO_CONFIG__` or is missing fields, fall through to defaults:
- **No `language`:** infer from existing files in the project (`.R`/`.qmd` files -> R, `.py` files -> Python). If no signal, default to Python.
- **No `notebook_format`:** infer from `language` (R -> `qmd`, Python -> `script`).
- **No `libraries`:** use the golden path defaults for the detected language.

---

## Tiered Notebook Support

| Tier | Formats | Support Level |
|------|---------|---------------|
| **First-class** | `.qmd`, `.Rmd`, `.R`, `.py` | Full scaffolding with correct headers, imports, and output patterns. Text-native formats the agent can read and write without structural risk. |
| **Best-effort** | `.ipynb`, marimo (`.py` with marimo markers) | Scaffold as the equivalent first-class format, then note the conversion step. For `.ipynb`: generate a `.py` file with cell markers (`# %%`) that the user can convert, or generate the JSON cell structure if the agent is confident in the output. For marimo: generate a standard `.py` file with `# %%` cell markers and `import marimo as mo` preamble. |

First-class formats are preferred because the agent can reliably read, write, and diff them. Binary or structured formats (.ipynb JSON) carry risk of malformed output that silently breaks the notebook.

---

## Golden Path: R + tidyverse + Quarto

When `language: R` and `libraries` includes `tidyverse`, scaffold `.qmd` files with this structure:

```qmd
---
title: "[Analysis Title]"
author: "[from git config or config.local.yaml]"
date: today
format:
  html:
    toc: true
    code-fold: true
    embed-resources: true
execute:
  echo: true
  warning: false
---

## Setup

```{r}
#| label: setup
# SAP-N.M: [section reference, if applicable]

library(tidyverse)
library(broom)

# Source shared utilities if they exist
# source("R/utils.R")
```

## Data

```{r}
#| label: load-data

# Load and prepare analysis dataset
# df <- read_csv("data/analysis-dataset.csv")
```

## Analysis

```{r}
#| label: primary-analysis

# Primary analysis
# model <- glm(outcome ~ exposure + covariate1 + covariate2,
#              data = df,
#              family = binomial())
#
# tidy(model, conf.int = TRUE, exponentiate = TRUE)
```

## Results

```{r}
#| label: results-table

# Format results for reporting
# model |>
#   tidy(conf.int = TRUE, exponentiate = TRUE) |>
#   select(term, estimate, conf.low, conf.high, p.value) |>
#   knitr::kable(digits = 3)
```
```

Key patterns for this golden path:
- Use `glm()` for logistic regression, not sklearn
- Use `broom::tidy()` for model output formatting, with `conf.int = TRUE` and `exponentiate = TRUE` for odds ratios
- Use `knitr::kable()` or `gt::gt()` for table output
- Use Quarto chunk options (`#| label:`, `#| echo:`) not knitr-style chunk headers
- Pipe operator: `|>` (base R pipe) unless the project uses `%>%` (magrittr)

---

## Golden Path: Python + pandas

When `language: python` and `libraries` includes `pandas`, scaffold `.py` files with this structure:

```python
# ---
# title: "[Analysis Title]"
# date: "[today's date]"
# SAP-N.M: [section reference, if applicable]
# ---

# %% [markdown]
# ## Setup

# %%
import pandas as pd
import numpy as np
from pathlib import Path

# Optional: statsmodels for regression
# import statsmodels.api as sm
# import statsmodels.formula.api as smf

# %% [markdown]
# ## Data

# %%
# Load and prepare analysis dataset
# df = pd.read_csv("data/analysis-dataset.csv")

# %% [markdown]
# ## Analysis

# %%
# Primary analysis
# model = smf.logit("outcome ~ exposure + covariate1 + covariate2", data=df).fit()
# print(model.summary2())

# %% [markdown]
# ## Results

# %%
# Format results for reporting
# results = pd.DataFrame({
#     "term": model.params.index,
#     "OR": np.exp(model.params),
#     "CI_lower": np.exp(model.conf_int()[0]),
#     "CI_upper": np.exp(model.conf_int()[1]),
#     "p_value": model.pvalues
# })
# print(results.round(3).to_markdown(index=False))
```

Key patterns for this golden path:
- Use `statsmodels` for regression, not sklearn (unless the task is prediction/ML, not inference)
- Use `smf.logit()` or `smf.glm()` for logistic regression with formula interface
- Use `pd.DataFrame` for results formatting
- Use `# %%` cell markers for notebook-like structure in plain `.py` files
- Include `Path` from pathlib for file handling

---

## Other Combinations

For stacks not matching either golden path, adapt the scaffolding pragmatically:

| Stack | Adaptation |
|-------|------------|
| R + base (no tidyverse) | Use `read.csv()`, `summary(glm(...))`, base pipe `|>`. Omit `library(tidyverse)` and `broom` |
| R + data.table | Use `fread()`, `data.table` syntax. Keep `broom::tidy()` for model output |
| Python + polars | Use `polars.read_csv()`, polars expression syntax. Keep `statsmodels` for inference |
| Python + marimo | Scaffold as `.py` with `import marimo as mo` and `mo.md()` for markdown cells |
| Julia | Best-effort: `.jl` files with `using DataFrames, GLM` patterns |

When uncertain about the stack, match the patterns visible in the existing codebase rather than imposing a golden path.

---

## SAP Section Headers

When scaffolding analysis files that correspond to a SAP section, include the SAP identifier in a comment near the top of the file:

**R/Quarto:**
```r
# SAP-5.1: Primary Analysis
```

**Python:**
```python
# SAP-5.1: Primary Analysis
```

This enables the SAP tracking overlay (see `references/sap-tracking.md`) to detect coverage via comment scanning.

When scaffolding analysis files that do not correspond to any SAP section, include the exploratory header instead:

**R/Quarto:**
```r
# Exploratory -- not in SAP
# Description: [brief description]
```

**Python:**
```python
# Exploratory -- not in SAP
# Description: [brief description]
```
