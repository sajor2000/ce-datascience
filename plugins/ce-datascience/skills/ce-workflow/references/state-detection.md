# State Detection

File-system signals to determine which lifecycle steps have been completed. Use the native file-search/glob tool (e.g., Glob in Claude Code) to check for these artifacts. Resolve all paths relative to the repo root (`git rev-parse --show-toplevel`).

## Detection Table

| Skill | Done signal | In-progress signal |
|---|---|---|
| `/ce-research-question` | `analysis/research-question.yaml` exists and contains `pico:` block | File exists but `pico:` has empty slots |
| `/ce-pubmed` | `analysis/literature/` directory exists with `.md` or `.json` result files | Directory exists but is empty |
| `/ce-method-extract` | `analysis/literature/` contains `methods-comparison.*` or `method-extract.*` | — |
| `/ce-checklist-match` | `analysis/checklist.yaml` exists | — |
| `/ce-effect-size` | `analysis/effect-size.*` exists (`.R`, `.py`, or `.md`) | — |
| `/ce-power` | `analysis/power/` directory or `analysis/power-analysis.*` file exists | — |
| `/ce-cohort-build` | `analysis/cohort/` contains `.sql` or `.json` concept-set files | Directory exists but no SQL/JSON |
| `/ce-data-qa` | `analysis/data-qa-report.md` exists and contains `GO` verdict | Report exists but contains `NO-GO` or no verdict |
| `/ce-phenotype-validate` | `analysis/phenotype-validation.*` exists with PPV/sensitivity results | — |
| `/ce-plan` (SAP) | `docs/plans/` contains a file with `sap_version` in YAML frontmatter | Plan file exists without `sap_version` (implementation plan, not SAP) |
| `/ce-plan` (implementation) | `docs/plans/` contains a file with `status: active` or `status: completed` | — |
| `/ce-sap-tabular` | `analysis/sap-tables/` directory exists with CSV files | — |
| `/ce-sprint` (open) | `analysis/sprint-log.yaml` exists and contains `status: open` | — |
| `/ce-sprint` (closed) | `analysis/sprint-log.yaml` exists and all sprints have `status: closed` | — |
| `/ce-work` | Implementation files exist matching the plan's unit file lists | — |
| `/ce-code-review` | PR exists on the current branch, or `/tmp/ce-datascience/ce-code-review/` contains a run artifact | — |
| `/ce-compound` | `docs/solutions/` contains a new learning file dated within the last 7 days | — |
| `/ce-bioinfo-qc` | `analysis/qc/` directory exists with QC reports | — |
| `/ce-genome-build` | `.ce-datascience/config.local.yaml` contains `genome_build` key | — |
| `/ce-ml-experiment-track` | `mlruns/`, `wandb/`, or `dvc.yaml` exists at repo root | — |
| `/ce-model-card` | `analysis/model-card.md` or `docs/model-card.md` exists | — |

## Rendering Rules

- **Done**: artifact exists and appears complete per the "Done signal" column
- **In progress**: artifact exists but matches the "In-progress signal" column, or the artifact is ambiguous (e.g., data-qa report exists but has no GO/NO-GO verdict)
- **Not started**: no artifact found

When multiple signals are ambiguous, prefer "not started" over "in progress" to avoid false progress.

## Stack Profile Detection

If `.ce-datascience/config.local.yaml` exists, read `stack_profile.language` and `stack_profile.reporting` to determine language-specific annotations for the lifecycle card.

If no config exists, run `ce-language-detect` detection rules (check for `renv.lock`, `requirements.txt`, `pyproject.toml`, `.R` files, `.py` files) to infer the primary language.

Reporting framework inference:
- `language: python` + no Marimo signals → default to Jupyter
- `language: python` + `marimo` in `pyproject.toml` or `requirements.txt` → Marimo
- `language: r` + `_quarto.yml` or `.qmd` files → Quarto
- `language: r` + `.Rmd` files → R Markdown
