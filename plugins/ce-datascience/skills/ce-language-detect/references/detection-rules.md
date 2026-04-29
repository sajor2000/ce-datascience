# Language Detection Rules (Repo Signals Only)

Use only repository signals. Do not ask the user.

## Table of contents

1. Signal classes and weights
2. Scoring
3. Classification thresholds
4. Tie-breaks
5. Examples

---

## 1. Signal classes and weights

### Python signals

- `pyproject.toml`, `requirements.txt`, `Pipfile`, `environment.yml` with Python deps: **+3**
- Python env markers (`.venv/`, `poetry.lock`, `uv.lock`, `pixi.toml`): **+2**
- Python source files (`**/*.py`) or notebooks (`**/*.ipynb`) in active code paths (`code/`, `src/`, `analysis/`): **+2**
- Python-specific imports (`pandas`, `polars`, `numpy`, `scipy`, `statsmodels`, `sklearn`, `clifpy`): **+1**

### R signals

- `renv.lock`, `.Rprofile`, `.Rproj`, `DESCRIPTION` with `Depends: R`: **+3**
- R project markers (`renv/`, `NAMESPACE`, `man/`): **+2**
- R source files (`**/*.R`, `**/*.Rmd`, `**/*.qmd`) in active code paths (`code/`, `R/`, `analysis/`): **+2**
- R-specific imports (`tidyverse`, `dplyr`, `data.table`, `arrow`, `survival`, `lme4`, `targets`, `brms`): **+1**

## 2. Scoring

- Sum Python and R scores independently.
- Ignore generated/vendor directories (`.git/`, `node_modules/`, `dist/`, `build/`, `.venv/` contents, `renv/library/`).
- Prefer signals inside project workflow directories (`code/`, `analysis/`, `src/`, `R/`) over docs-only mentions.

## 3. Classification thresholds

- `python` when Python score >= 4 and R score <= 2
- `r` when R score >= 4 and Python score <= 2
- `both` when Python score >= 4 and R score >= 4
- `unknown` otherwise

`secondary` is:

- `r` when `primary=python` and R score >= 3
- `python` when `primary=r` and Python score >= 3
- `python` (or `r`) when `primary=both` using whichever score is smaller as secondary
- `null` for `unknown`

## 4. Tie-breaks

When both languages have medium evidence but one is slightly stronger:

1. Prefer the language with executable scripts under `code/` / `analysis/`.
2. If still tied, prefer the language used in CI/test commands (`Rscript`, `pytest`, etc.).
3. If still tied, classify as `both`.

For CLIF repos:

- Presence of `renv.lock` + `code/templates/R/` is a strong R signal.
- Presence of `clifpy` usage is a strong Python signal.
- If both exist, classify as `both`.

## 5. Examples

- `renv.lock` + many `*.R` + no Python files -> `primary=r secondary=null source=auto`
- `pyproject.toml` + `src/*.py` + no R markers -> `primary=python secondary=null source=auto`
- `renv.lock` + `pyproject.toml` + active `code/*.R` and `code/*.py` -> `primary=both secondary=r|python source=auto`
- Only docs, no code markers -> `primary=unknown secondary=null source=auto` (or `source=cached` if cache exists)
