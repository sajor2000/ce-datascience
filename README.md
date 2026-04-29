# CE DataScience

Compound engineering for computational scientists. 40 skills, 55 agents, and 35 reporting checklists for the full biomedical research lifecycle — from PICO to publication — across R and Python.

Built on the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin by [Kieran Klaassen](https://github.com/kieranklaassen) at [Every](https://every.to).

## What it does

Frame your research question. Search the literature. Build a cohort. Write a Statistical Analysis Plan. Execute with SAP tracking. Review against 35 reporting checklists. Document what you learned so the next study is easier.

![CE DataScience Workflow — From PICO to Publication](docs/workflow-diagram.png)

Run `/ce-workflow` to see which path applies to your project and where you are in it.

## Quick start

```bash
git clone https://github.com/sajor2000/ce-datascience.git
cd ce-datascience && bun install
```

Then start Claude Code with the plugin loaded:

```bash
claude --plugin-dir ~/ce-datascience/plugins/ce-datascience
```

First commands in any project:

```
/ce-setup       # configure language, IDE, libraries
/ce-workflow    # see the lifecycle for your project type
```

**Tip:** Add an alias to `~/.zshrc` so you don't have to type the path every time:

```bash
alias claude-ds='claude --plugin-dir ~/ce-datascience/plugins/ce-datascience'
```

## Install on other platforms

```bash
cd ~/ce-datascience
bun run src/index.ts install ./plugins/ce-datascience --to codex    # Codex
bun run src/index.ts install ./plugins/ce-datascience --to pi       # Pi
bun run src/index.ts install ./plugins/ce-datascience --to gemini   # Gemini CLI
bun run src/index.ts install ./plugins/ce-datascience --to opencode # OpenCode
bun run src/index.ts install ./plugins/ce-datascience --to kiro     # Kiro
bun run src/index.ts install ./plugins/ce-datascience --to all      # all at once
```

Pi needs two extensions first: `pi install npm:pi-subagents` (required) and `pi install npm:pi-ask-user` (recommended).

## Updating

```bash
cd ~/ce-datascience && git pull && bun install
```

## Workflow by project type

### Observational study (EHR / OMOP / claims)

```
/ce-research-question "sepsis bundles and 30-day mortality in ICU"
/ce-pubmed              /ce-method-extract        /ce-checklist-match
/ce-effect-size         /ce-power                 /ce-cohort-build
/ce-data-qa             /ce-plan                  /ce-sap-tabular
/ce-sprint              /ce-work                  /ce-verify
/ce-code-review         /ce-compound
```

### Prediction model (ML / AI)

```
/ce-research-question   /ce-checklist-match       /ce-cohort-build
/ce-plan                /ce-ml-experiment-track    /ce-optimize
/ce-work                /ce-model-card            /ce-code-review
```

### CLIF consortium (ICU federated)

```
# ce-clif activates automatically
/ce-workflow            /ce-work
```

### Bioinformatics / omics

```
/ce-bioinfo-qc          /ce-genome-build          /ce-plan
/ce-work                /ce-code-review
```

### Software / technical

```
/ce-brainstorm          /ce-plan                  /ce-work
/ce-code-review
```

## Language support

| Stack | IDE | Output | Key libraries |
|---|---|---|---|
| **Python + Jupyter** | JupyterLab, VS Code | `.ipynb` | pandas, polars, scipy, statsmodels, scikit-learn |
| **Python + Marimo** | Marimo, VS Code | reactive `.py` | pandas, polars, scipy, statsmodels, scikit-learn |
| **R** | RStudio, VS Code | Quarto `.qmd`, `.Rmd` | tidyverse, data.table, survival, lme4, gt, tidymodels |

## Data layer support

| Data layer | Skills | Review agents |
|---|---|---|
| **OMOP CDM** | `ce-cohort-build`, `ce-phenotype-validate` | `ce-omop-mapping-reviewer`, `ce-concept-drift-reviewer` |
| **CLIF** | `ce-clif` (auto-profile), `ce-cohort-build` | mCIDE vocab, protected paths, three-script arch |
| **Admin claims** | `ce-cohort-build`, `ce-phenotype-validate` | `ce-administrative-data-reviewer` |
| **Custom EHR** | `ce-cohort-build`, `ce-data-qa` | `ce-phi-leak-reviewer` |
| **Bioinformatics** | `ce-bioinfo-qc`, `ce-genome-build` | `ce-bioinfo-pipeline-reviewer`, `ce-omics-batch-reviewer` |

## Reporting guidelines (35 checklists)

| Study type | Primary | Extensions |
|---|---|---|
| Observational cohort | STROBE | RECORD, RECORD-PE, STROBE-MR, STREGA |
| Randomized trial | CONSORT | CONSORT-AI, SPIRIT-AI, Cluster, Adaptive, N-of-1 |
| Prediction model | TRIPOD, TRIPOD+AI | CHARMS (SR) |
| Diagnostic accuracy | STARD, STARD-AI | CLAIM, QUADAS-2 (SR) |
| Systematic review | PRISMA | DTA, NMA, IPD, ScR |
| Target trial emulation | TARGET | |
| Quality improvement | SQUIRE | |
| Mixed methods | GRAMMS | |
| Real-world evidence | STaRT-RWE | |
| Other | ARRIVE, CARE, CHART, CHEERS, COREQ, DEAL, PDSQI, REFORMS | |

## Components

| Component | Count |
|-----------|-------|
| Skills | 40 |
| Agents | 55 |
| Reporting checklists | 35 |

See the [full component reference](plugins/ce-datascience/README.md) for every skill and agent.

## Development

```bash
bun test                      # 773 tests
bun run release:validate      # manifests (55 agents, 40 skills)
```

## Attribution

Fork of [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) by [Kieran Klaassen](https://github.com/kieranklaassen) at [Every](https://every.to). Core workflow, multi-agent review architecture, and CLI converter from upstream. Also influenced by [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) and [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent.

## License

[MIT](LICENSE) — Copyright (c) 2026 Juan Carlos Rojas. Original compound-engineering plugin Copyright (c) 2025 Every (Kieran Klaassen).
