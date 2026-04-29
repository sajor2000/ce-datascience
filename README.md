# CE DataScience

Compound engineering for computational scientists. 40 skills, 55 agents, and 35 reporting checklists for the full biomedical research lifecycle — from PICO to publication — across R and Python.

Built on [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) by [Kieran Klaassen](https://github.com/kieranklaassen) at [Every](https://every.to).

![CE DataScience Workflow — From PICO to Publication](docs/workflow-diagram.png)

---

## Install (5 minutes)

### 1. Install Bun (if you don't have it)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone the plugin

```bash
git clone https://github.com/sajor2000/ce-datascience.git
cd ce-datascience
bun install
```

### 3. Start Claude Code with the plugin

```bash
claude --plugin-dir ~/ce-datascience/plugins/ce-datascience
```

**Save yourself typing** — add this alias to `~/.zshrc` or `~/.bashrc`:

```bash
echo 'alias claude-ds="claude --plugin-dir ~/ce-datascience/plugins/ce-datascience"' >> ~/.zshrc
source ~/.zshrc
```

Now use `claude-ds` instead of `claude` in any project.

### 4. Verify it works

Inside Claude Code, run:

```
/ce-setup
```

You should see prompts for language (R/Python), IDE, and libraries. If you see "unknown command", restart Claude Code — the plugin loads at session start.

### 5. See your workflow

```
/ce-workflow
```

This shows the full lifecycle for your project type and tells you what to do next.

---

## Other platforms

| Platform | Install command |
|---|---|
| Codex | `bun run src/index.ts install ./plugins/ce-datascience --to codex` |
| Pi | `bun run src/index.ts install ./plugins/ce-datascience --to pi` |
| Gemini CLI | `bun run src/index.ts install ./plugins/ce-datascience --to gemini` |
| OpenCode | `bun run src/index.ts install ./plugins/ce-datascience --to opencode` |
| Kiro | `bun run src/index.ts install ./plugins/ce-datascience --to kiro` |
| All at once | `bun run src/index.ts install ./plugins/ce-datascience --to all` |

Run these from `~/ce-datascience`. Pi also needs `pi install npm:pi-subagents` first.

---

## Updating

```bash
cd ~/ce-datascience && git pull && bun install
```

Then restart your coding agent.

---

## What you can do

### Observational study (EHR / OMOP / claims)

```
/ce-research-question "sepsis bundles and 30-day mortality in ICU"
/ce-pubmed
/ce-method-extract
/ce-checklist-match
/ce-effect-size
/ce-power
/ce-cohort-build
/ce-data-qa
/ce-plan
/ce-sap-tabular
/ce-sprint
/ce-work
/ce-verify
/ce-code-review
/ce-compound
```

### Prediction model (ML / AI)

```
/ce-research-question
/ce-checklist-match
/ce-cohort-build
/ce-plan
/ce-ml-experiment-track
/ce-optimize
/ce-work
/ce-model-card
/ce-code-review
```

### CLIF consortium (ICU federated)

```
# ce-clif activates automatically when it detects your CLIF project
/ce-workflow
/ce-work
```

### Bioinformatics

```
/ce-bioinfo-qc
/ce-genome-build
/ce-plan
/ce-work
/ce-code-review
```

### Software / technical task

```
/ce-brainstorm
/ce-plan
/ce-work
/ce-code-review
```

---

## Language support

| Stack | IDE | Output | Libraries |
|---|---|---|---|
| **Python + Jupyter** | JupyterLab, VS Code | `.ipynb` | pandas, polars, scipy, statsmodels, scikit-learn |
| **Python + Marimo** | Marimo, VS Code | reactive `.py` | pandas, polars, scipy, statsmodels, scikit-learn |
| **R** | RStudio, VS Code | Quarto `.qmd`, `.Rmd` | tidyverse, data.table, survival, lme4, gt, tidymodels |

## Data layer support

| Data layer | What activates it | What it does |
|---|---|---|
| **OMOP CDM** | SQL with `cdm_source`, `concept`, `person` | OMOP SQL + concept sets, vocabulary version pinning |
| **CLIF** | `CLIF_CLAUDE.md`, `clif-consortium` remote | Parquet-only, mCIDE vocab, three-script architecture, POC sign-off |
| **Admin claims** | Medicare/Medicaid/MarketScan in code | Claims-specific reviewer (enrollment gaps, NDC-to-RxNorm) |
| **Custom EHR** | Default for EHR data | PHI leak scanning, generic cohort building |
| **Bioinformatics** | `.fastq`, `.bam`, `Snakefile` | FastQC/MultiQC, genome build pinning, batch-effect screening |

## 35 reporting checklists

| Study type | Primary | Extensions |
|---|---|---|
| Observational cohort | STROBE | RECORD, RECORD-PE, STROBE-MR, STREGA |
| Randomized trial | CONSORT | CONSORT-AI, SPIRIT-AI, Cluster, Adaptive, N-of-1 |
| Prediction model | TRIPOD, TRIPOD+AI | CHARMS |
| Diagnostic accuracy | STARD, STARD-AI | CLAIM, QUADAS-2 |
| Systematic review | PRISMA | DTA, NMA, IPD, ScR |
| Target trial emulation | TARGET | |
| Quality improvement | SQUIRE | |
| Mixed methods | GRAMMS | |
| Real-world evidence | STaRT-RWE | |
| Other | ARRIVE, CARE, CHART, CHEERS, COREQ, DEAL, PDSQI, REFORMS | |

---

## Components

| | Count |
|---|---|
| Skills | 40 |
| Agents | 55 |
| Reporting checklists | 35 |

See the [full skill and agent list](plugins/ce-datascience/README.md).

---

## Troubleshooting

**"Unknown command" when running /ce-setup:**
Restart Claude Code. The plugin loads at session start — if you cloned after starting, it won't be loaded yet.

**`bun install` fails:**
Make sure Bun is installed (`bun --version`). If not, run `curl -fsSL https://bun.sh/install | bash` and restart your terminal.

**Plugin loads but skills seem wrong:**
Run `git pull && bun install` in `~/ce-datascience` to get the latest version, then restart Claude Code.

**CLIF profile activating on a non-CLIF project:**
Run `/ce-clif --off` to disable it for the session. CLIF only auto-activates on strong signals (`CLIF_CLAUDE.md`, `clif-consortium` git remote).

---

## Development

```bash
bun test                      # 773 tests
bun run release:validate      # check manifests
```

## Attribution

Fork of [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) by [Kieran Klaassen](https://github.com/kieranklaassen) at [Every](https://every.to). Also influenced by [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) and [Superpowers](https://github.com/obra/superpowers).

## License

[MIT](LICENSE) — Copyright (c) 2026 Juan Carlos Rojas. Original compound-engineering plugin Copyright (c) 2025 Every (Kieran Klaassen).
