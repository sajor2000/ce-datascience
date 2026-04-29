# CE DataScience

Compound engineering for computational scientists. Agentic coding workflows adapted for data science, statistical review, and reporting compliance across R and Python.

Built on the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) foundation by [Kieran Klaassen](https://github.com/kieranklaassen) at [Every](https://every.to), with domain-specific skills for the biomedical research lifecycle: SAP management, OMOP/CLIF/EHR cohort building, reporting guideline compliance (CONSORT, STROBE, TRIPOD+AI, and 13 more), phenotype validation, power analysis, and publication-ready outputs.

## Philosophy

**Each analysis should make the next one easier, not harder.**

Traditional research computing accumulates hidden decisions. Every cohort definition, exposure logic, and model specification carries local knowledge that someone has to rediscover for the next study. Compound engineering inverts this:

- Frame the question with `/ce-research-question` (PICO + FINER)
- Search the literature with `/ce-pubmed` and `/ce-method-extract`
- Plan the analysis with `/ce-plan` (generates a Statistical Analysis Plan)
- Execute with `/ce-work` (tracks SAP coverage, flags exploratory analyses)
- Review with `/ce-code-review` (statistical, methodological, and reporting checklist)
- Document with `/ce-compound` (validated analytical approaches compound across studies)

## Components

| Component | Count |
|-----------|-------|
| Skills | 40 |
| Agents | 55 |

See the [full component reference](plugins/ce-datascience/README.md) for the complete skill and agent inventory.

## Workflow

### For a typical observational study

```text
/ce-workflow                            # see the full lifecycle for your project type
/ce-research-question "sepsis bundles and 30-day mortality in ICU"
/ce-pubmed                              # literature search from the hardened PICO
/ce-method-extract                      # extract stats methods from results
/ce-checklist-match                     # routes to STROBE + RECORD
/ce-effect-size                         # pool effect sizes from prior literature
/ce-power                               # sample size with sensitivity sweep
/ce-cohort-build                        # OMOP SQL + concept sets (or CAPR for R)
/ce-data-qa                             # GO/NO-GO gate with 16 checks
/ce-plan                                # generates a Statistical Analysis Plan
/ce-sap-tabular                         # tabular SAP companion for programmers
/ce-sprint                              # scope a bounded analysis sprint
/ce-work                                # execute with SAP tracking
/ce-verify                              # mid-workflow sanity checks
/ce-code-review                         # statistical + reporting checklist review
/ce-compound                            # document learnings
```

### For a prediction model

```text
/ce-workflow                            # auto-routes to prediction/ML path
/ce-research-question                   # PICO with prediction framing
/ce-checklist-match                     # routes to TRIPOD+AI
/ce-cohort-build                        # dev/val/test split
/ce-plan                                # prediction SAP: calibration, fairness
/ce-ml-experiment-track                 # wire up mlflow/wandb
/ce-optimize                            # metric-driven hyperparameter tuning
/ce-work                                # execute
/ce-model-card                          # Mitchell-style model card
/ce-code-review                         # leakage, fairness, calibration reviewers
```

### For CLIF consortium work

```text
# ce-clif activates automatically when it detects CLIF signals
/ce-workflow                            # shows CLIF-specific three-script path
/ce-work                                # enforces Parquet-only, mCIDE vocab, POC sign-off
```

### For a quick bug fix or software task

```text
/ce-brainstorm "make the data pipeline more robust"
/ce-plan                                # implementation plan (not SAP)
/ce-work
/ce-code-review
```

## Language Support

| Stack | IDE | Reporting | Libraries |
|---|---|---|---|
| **Python + Jupyter** | JupyterLab, VS Code | `.ipynb` notebooks | pandas, polars, scipy, statsmodels, scikit-learn |
| **Python + Marimo** | Marimo, VS Code | Reactive `.py` notebooks | pandas, polars, scipy, statsmodels, scikit-learn |
| **R** | RStudio, VS Code | Quarto `.qmd`, R Markdown `.Rmd` | tidyverse, data.table, survival, lme4, gt, tidymodels |

Run `/ce-setup` to configure your stack profile. Skills generate language-appropriate code, notebooks, and scripts based on your configuration.

## Data Layer Support

| Data Layer | Skills | Reviewers |
|---|---|---|
| **OMOP CDM** | `ce-cohort-build` (SQL + JSON concept sets), `ce-phenotype-validate` | `ce-omop-mapping-reviewer`, `ce-concept-drift-reviewer` |
| **CLIF** | `ce-clif` (auto-profile), `ce-cohort-build` | Protected paths, mCIDE vocab, three-script architecture |
| **Admin claims** | `ce-cohort-build`, `ce-phenotype-validate` | `ce-administrative-data-reviewer` |
| **Custom EHR** | `ce-cohort-build`, `ce-data-qa` | `ce-phi-leak-reviewer` |
| **Bioinformatics** | `ce-bioinfo-qc`, `ce-genome-build` | `ce-bioinfo-pipeline-reviewer`, `ce-omics-batch-reviewer` |

## Reporting Guidelines

The code review skill auto-routes to the correct reporting checklist:

| Study type | Primary checklist | Extensions |
|---|---|---|
| Observational cohort | STROBE | RECORD, RECORD-PE |
| RCT | CONSORT | CONSORT-AI, SPIRIT-AI |
| Prediction model | TRIPOD+AI | CLAIM (imaging) |
| Diagnostic accuracy | STARD | STARD-AI |
| Systematic review | PRISMA | — |
| Target trial emulation | STROBE + TARGET | — |
| Qualitative | COREQ | — |

Plus: ARRIVE, CARE, CHART, CHEERS, DEAL, PDSQI, REFORMS.

## Install

### Prerequisites

- [Bun](https://bun.sh) (required for install and converter CLI)
- [Git](https://git-scm.com)

### Step 1: Clone and install dependencies

```bash
git clone https://github.com/sajor2000/ce-datascience.git
cd ce-datascience
bun install
```

### Step 2: Use with your coding agent

#### Claude Code

Start Claude Code in any project with `--plugin-dir` pointing to your clone:

```bash
claude --plugin-dir ~/ce-datascience/plugins/ce-datascience
```

Or add an alias to your `~/.zshrc` / `~/.bashrc` so it loads automatically:

```bash
alias claude-ds='claude --plugin-dir ~/ce-datascience/plugins/ce-datascience'
```

Then just run `claude-ds` instead of `claude` in any project.

#### Codex

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to codex
```

This copies skills and agents to Codex's local config. Restart Codex after install.

#### Pi

Pi needs two extensions first:

```bash
pi install npm:pi-subagents              # required -- parallel agent dispatch
pi install npm:pi-ask-user               # recommended -- blocking question tool
```

Then install the plugin:

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to pi
```

#### Gemini CLI

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to gemini
```

#### OpenCode

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to opencode
```

#### Kiro

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to kiro
```

#### All targets at once

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to all
```

### Step 3: First run

Once loaded, run these two commands in any project:

```text
/ce-setup                               # configure language, IDE, libraries
/ce-workflow                            # see the lifecycle for your project type
```

### Updating

Pull the latest changes and reinstall:

```bash
cd ~/ce-datascience
git pull
bun install
# Then restart your agent, or re-run the install command for non-Claude targets
```

## Development

```bash
bun test                                # 773 tests
bun run release:validate                # check manifests (55 agents, 40 skills)
```

## Attribution

This project is a domain-specific fork of the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin by [Kieran Klaassen](https://github.com/kieranklaassen) at [Every](https://every.to). The core engineering workflow (brainstorm, plan, work, review, compound) and the multi-agent code review architecture were designed by Kieran and the Every team.

### What came from upstream

- **Core workflow skills:** ce-brainstorm, ce-plan, ce-work, ce-code-review, ce-debug, ce-compound, ce-compound-refresh, ce-doc-review, ce-ideate, ce-sessions, ce-setup, ce-update, ce-commit, ce-commit-push-pr, ce-clean-gone-branches, ce-worktree
- **Ported with DS adaptations:** ce-optimize (added cross-validation guardrails, leakage detection, mlflow integration, SAP alignment), ce-resolve-pr-feedback (added methodology review triggers)
- **Review agent architecture:** The tiered persona model (always-on + conditional + stack-specific) with confidence-gated findings, the merge/dedup pipeline, and the structured JSON output contract
- **CLI and converter infrastructure:** The Bun/TypeScript CLI that converts plugins across agent platforms

### What is new in this fork

- **20+ biomedical skills:** ce-research-question, ce-pubmed, ce-method-extract, ce-checklist-match, ce-effect-size, ce-power, ce-cohort-build, ce-data-qa, ce-phenotype-validate, ce-clif, ce-bioinfo-qc, ce-genome-build, ce-ml-experiment-track, ce-model-card, ce-prereg, ce-sap-tabular, ce-sprint, ce-literature-search, ce-verify, ce-workflow
- **20+ domain-specific review agents:** ce-methods-reviewer, ce-causal-inference-reviewer, ce-data-leakage-reviewer, ce-fairness-reviewer, ce-calibration-reviewer, ce-omop-mapping-reviewer, ce-administrative-data-reviewer, ce-concept-drift-reviewer, ce-bioinfo-pipeline-reviewer, ce-omics-batch-reviewer, ce-phi-leak-reviewer, ce-sap-drift-detector, ce-data-mapping-reviewer, ce-reporting-checklist-reviewer, ce-reproducibility-reviewer, ce-multiplicity-reviewer, ce-r-code-reviewer, ce-r-pipeline-reviewer, ce-python-ds-reviewer, ce-quarto-render-reviewer, ce-targets-pipeline-reviewer, ce-sprint-audit-reviewer
- **16 reporting checklists:** CONSORT, CONSORT-AI, STROBE, STARD, TRIPOD+AI, PRISMA, SPIRIT-AI, CLAIM, ARRIVE, CARE, CHART, CHEERS, COREQ, DEAL, PDSQI, REFORMS
- **CLIF consortium profile:** Auto-detection, mCIDE vocabulary enforcement, POC sign-off, three-script architecture
- **SAP dual-mode:** ce-plan auto-detects study designs and generates Statistical Analysis Plans with stable SAP-N.M identifiers

### Also influenced by

- **[BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD)** — scale-adaptive planning depth (reflected in ce-plan's Lightweight/Standard/Deep classification)
- **[Superpowers](https://github.com/obra/superpowers)** by Jesse Vincent — verification-before-completion pattern (inspired ce-verify's mid-workflow analysis gate)
- **Anthropic's [skill authoring best practices](https://docs.anthropic.com)** — YAML frontmatter, cross-platform interaction tools, reference file extraction, conditional loading

## License

[MIT](LICENSE) — Copyright (c) 2026 Juan Carlos Rojas. Original compound-engineering plugin Copyright (c) 2025 Every (Kieran Klaassen).
