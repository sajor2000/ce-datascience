# CE DataScience

Compound engineering for computational scientists. SAP management, statistical review, and evidence-backed reporting-guideline review for R and Python workflows — covering 39 standards across all study types and AI extensions. The registry distinguishes reporting guidelines from appraisal tools, planning templates, data-quality tools, and provisional candidates.

## How It Works

![CE DataScience package workflow: install, set up a project, run skills, and create research artifacts](../../docs/ce-datascience-package-workflow.png)

![Steps for using CE DataScience setup, workflow, and task-specific slash commands](../../docs/ce-datascience-skill-commands.png)

[Watch the workflow overview](https://sajor2000.github.io/ce-datascience/media/ce-datascience-overview.mp4)

## Getting Started

For complete copy-paste setup across Claude Code, Codex, OpenCode, Gemini CLI,
Kiro, Pi, and Qwen Code, see [`../../docs/setup.md`](../../docs/setup.md).

From a source checkout, run `bash install.sh doctor` (or
`.\install.ps1 doctor` in PowerShell) for a read-only check of the standard and
locked-down routes. It detects the local agent CLIs and optional Bun bridge,
then prints the appropriate next command. Corporate users can use approved
offline artifacts without Git, Bun, GitHub CLI, or Quarto.

Fastest normal Claude Code setup, with no checkout (Claude Code 2.1.275 or
later):

```text
/plugin install ce-datascience --marketplace sajor2000/ce-datascience
```

Or from a terminal:

```bash
claude plugin install ce-datascience --marketplace sajor2000/ce-datascience
```

From a source checkout, with optional bare `/ce-*` aliases, on macOS, Linux,
WSL, or Git Bash:

```bash
git clone https://github.com/sajor2000/ce-datascience.git ~/ce-datascience
cd ~/ce-datascience
bash install.sh claude --aliases
claude
```

Windows PowerShell:

```powershell
git clone https://github.com/sajor2000/ce-datascience.git "$HOME\ce-datascience"
cd "$HOME\ce-datascience"
.\install.ps1 claude -Aliases
claude
```

Then open the target project and run `/ce-datascience:ce-setup`. The alias flag
is optional and gives you the same bare-command feel as the original Compound
Engineering plugin; the namespaced form is the reliable default.

Fastest normal Codex setup:

macOS, Linux, WSL, or Git Bash:

```bash
git clone https://github.com/sajor2000/ce-datascience.git ~/ce-datascience
cd ~/ce-datascience
bash install.sh codex
codex
```

Windows PowerShell:

```powershell
git clone https://github.com/sajor2000/ce-datascience.git "$HOME\ce-datascience"
cd "$HOME\ce-datascience"
.\install.ps1 codex
codex
```

Inside Codex, open `/plugins`, install **CE DataScience**, restart, then ask
Codex to use CE DataScience for setup.

Pi uses generated files rather than a native marketplace:

```bash
pi install npm:pi-subagents
pi install npm:pi-ask-user
bun run src/index.ts install ./plugins/ce-datascience --to pi --pi-home "$HOME/.pi/agent"
```

Restart Pi, open the target project, and invoke `ce-setup` using Pi's skill
interface. `pi-subagents` is required for CE delegation; `pi-ask-user` enables
the compact confirmation interaction.

### Use the plugin after installation

1. Restart Claude Code or Codex after installing the plugin.
2. Open the project or study directory where the work should happen.
3. Run setup once for that project.
4. Run workflow to see the lifecycle and next recommended skill.

Claude Code's native plugin commands are namespaced:

```text
/ce-datascience:ce-setup
/ce-datascience:ce-workflow
```

If the installer was run with `--aliases` or `-Aliases`, `/ce-setup` and
`/ce-workflow` are equivalent convenience aliases. In Codex, start a new task
and say:

```text
Use the CE DataScience ce-setup skill for this project.
Then use the CE DataScience ce-workflow skill and recommend the next step.
```

Setup records project-local stack and data-layer choices; it is not a global
one-time configuration for every study. Once workflow recommends a step, ask
the agent to use the named skill, such as `ce-research-question`, `ce-data-qa`,
`ce-plan`, or `ce-code-review`, and include the scientific or engineering goal.

Locked-down laptops can use approved local artifacts without Bun, Git, GitHub
CLI, or Quarto:

```bash
claude --plugin-dir /approved/path/ce-datascience
claude --plugin-dir /approved/path/ce-datascience.zip
```

In native Claude plugin installs, commands are namespaced:

```text
/ce-datascience:ce-setup --locked-down
/ce-datascience:ce-workflow
```

Bare commands such as `/ce-setup` require optional local alias files in
`.claude/commands`; they are not guaranteed by plugin loading itself.

After installing, run `/ce-datascience:ce-setup` in any project. It configures your stack
profile (language, IDE, libraries, reporting framework) and bootstraps project
config. Then run `/ce-datascience:ce-workflow` to see the ordered next steps
for the project. If optional aliases are installed, `/ce-setup` and
`/ce-workflow` work too.

Setup and workflow inspect available project evidence before asking. Each public
skill starts with a `Skill Value` block naming the problem it solves, when to use
it, expected output, question boundary, and non-goal so demos and first projects
route to the right command quickly.

The normal setup path is a one-screen detected profile: continue with evidence,
adjust one field, or choose the full survey. It infers language, environment,
reporting, storage, and data domain from project files and leaves optional
preferences unset instead of forcing a long questionnaire.

### Safety gates in current workflows

CE DataScience keeps method decisions explicit rather than filling gaps with
defaults. `ce-data-qa` checks row-count reconciliation, key uniqueness, join
cardinality, type stability, index alignment, and declared missing-data
handling before it emits GO, WARN, or NO-GO. Confirmed corruption or undeclared
synthetic/fallback data is a NO-GO.

For observational or causal work, `ce-plan` and
`ce-statistical-analysis-plan` require an estimand, intended grain, keys, time
zero, assumptions, and success criteria before finalization. `ce-work` fails
loudly at missing, corrupt, or incompatible inputs. `ce-code-review` separates
demonstrated integrity defects (blocking) from methodological questions that
need analyst resolution, including causal timing and dynamic survival-model
evaluation.

For dynamic survival decisions, the calibration reviewer requires a stated
decision time and horizon, a case/control definition, censoring-aware
time-dependent AUC with confidence intervals, and calibration at the matching
horizon. A generic binary AUC or Harrell C-index does not answer that question.

Statistical methods were audited against primary sources: ICH E9(R1)
estimands in the SAP path, corrected power, non-inferiority, two-proportion,
and `pmsampsize` methods, REML with Hartung-Knapp pooling and a k-1 df
prediction interval, non-binding futility type I error, design-aware Table 1
(SMD column, no RCT baseline p-values), verification-bias reweighting for
phenotype validation, and TRIPOD+AI routing for every prediction model. The
skill and agent tables below describe the current behavior; the root README's
"Statistical correctness" section summarizes it.

Connection skills can hand setup a verified database default by emitting
`__CE_CONNECTION__ name=<name> type=<postgres|sqlite|duckdb|other> database=<db> auth=<auth> status=verified`.
For database-backed projects, `data_root` stays optional and is used only for
local extracts or cache files.

### Recommended research add-ons

The plugin's bundled `/ce-pubmed` workflow remains the portable baseline.
Optionally connect the PubMed MCP server,
[cyanheads/pubmed-mcp-server](https://github.com/cyanheads/pubmed-mcp-server)
for agent-native PubMed/Europe PMC, MeSH, citation, and related-article tools.
Add the
[Paperclip CLI and its official Paperclip skill, or its MCP server](https://paperclip.gxl.ai/docs)
when a study needs deeper full-text synthesis, claim verification, figures,
trials, regulatory documents, preprints, or biological databases. The skill is
fetched and maintained by Paperclip; CE DataScience does not bundle or fork it.
CE workflows currently auto-detect the Paperclip CLI only; external MCP or
provider-skill results are direct agent capabilities, not automatic CE artifact
handoffs.

Neither add-on is required or installed automatically. Review institutional
privacy and network policy before connecting hosted services. The canonical
configuration examples and selection guidance are in
[`../../docs/setup.md`](../../docs/setup.md#8-optional-research-add-ons).

## Sensitive-data boundary

Before setup looks at any data, `ce-setup` asks one question and saves the
answer as `phi_environment.mode` in the gitignored, machine-local
`.ce-datascience/config.local.yaml`:

| Answer | Saved as | What happens |
|---|---|---|
| **Approved endpoint: full access** (HIPAA-compliant with a BAA, or institution-approved) | `mode: approved` | No restrictions on the model for the rest of the session. The agent never raises the boundary again. You are responsible for that approval. |
| **Not approved or unsure: schema-only** (also used when no answer is saved, or the saved value cannot be read) | `mode: schema-only` | The agent sees column headings, types, row counts, and % missing, never data values such as names, MRNs, or claim numbers. It writes scripts that print only aggregates, with counts under 11 suppressed. It cannot inspect example rows, debug value-level parsing or join mismatches by example, read free text, or spot individual entry errors. |
| **No sensitive data: public or synthetic** | `mode: no-sensitive-data` | No restrictions, never raised again. |

Older configs keep working: `compliant: true` reads as `approved`,
`compliant: false` as `schema-only`, and `sensitive_data: false` as
`no-sensitive-data`. If the keys disagree, any schema-only signal wins.

**What enforces it.** In Claude Code, a plugin `PreToolUse` hook
(`hooks/data-boundary-guard.py`) runs only inside projects that have a
`.ce-datascience/` directory, in the working tree or the main checkout of a
linked worktree. It is silent unless it blocks a call. In schema-only mode it
denies:

- `Read`, `NotebookRead`, and content-mode `Grep` on data files. Data files are
  `.csv`, `.tsv`, `.parquet`, `.xlsx`, `.sas7bdat`, `.dta`, `.rds`, `.sqlite`,
  `.jsonl`, and similar, including compressed or backup copies (`.csv.gz`,
  `.csv.bak`), plus anything under the configured `data_root` and the safe
  runner's logs. A notebook with saved outputs also counts; clear its outputs
  first.
- Any shell command (`Bash`, `Monitor`, `PowerShell`) whose text names a data
  path, an extension glob, or `data_root`, whatever the program, unless it only
  lists metadata (`ls`, `wc`, `du`, `find`, `git status`/`log`) or runs the
  schema helper. Inline code (`python -c`, `Rscript -e`, heredocs) that opens
  data or globs a data directory, writing a script and running it in the same
  command, copying a data file to a non-data name, and recursive `grep`/`rg`
  without an `--include`/`-g`/`-t` limited to code are denied too.
- Running a script file (`python`, `Rscript`, `bash`/`sh`, `quarto render`,
  `jupyter nbconvert --execute`) whose code names a data path or `data_root`,
  or calls a reader (`read_csv`, `read_parquet`, `read_excel`, `read_sas`,
  `read_stata`, `fread`, `readRDS`, `arrow::`, DuckDB, SQLite) on a path held
  in a variable, unless the command runs through the safe runner. The hook
  reads the script itself, up to 1 MB. Scripts that do not touch data, or that
  only read aggregate tables that pass the check below, run as before.

**Safe runner.** `scripts/ce-safe-run -- <command>` runs the command and writes
its full stdout and stderr to `.ce-datascience/runs/<UTC-timestamp>-<pid>.log`
(gitignored). It prints only the exit code, the duration, the files created or
modified under the project (path, size, and row count for tabular files), and
the last 30 lines of stderr with quoted literals, digit runs of 4 or more,
emails, phone numbers, SSNs, and identifier-index values masked. Traceback file
and line frames stay readable. It never prints stdout: open the log yourself.
The hook's deny message gives the runner's full path. It accepts only the
plugin's own runner (or a byte-identical copy) and still checks uploads inside
it.

**Aggregate reads.** `Read`, `cat`, `head`, and `tail` of `.csv`, `.tsv`, and
`.md` files under the aggregate directories are allowed in schema-only mode
when the table passes the aggregate check: no identifier-like column headings,
no cell in the identifier index or shaped like an identifier, no integer count
from 1 to 10 (the small-cell rule; 0 is fine), and at most 500 rows. Otherwise
the deny reason names the rule that failed, never the value. The directories
default to `output`, `results`, `analysis/publication`, and
`analysis/sap-tables`; set `phi_environment.aggregate_dirs` to change them.
`data_root` always wins: nothing under it is readable.

The schema helper `scripts/schema-peek.py` prints headings, types, counts, and
% missing, never a cell value. It prints `col_1..col_n` when a file has no
header row, and `col_<k> [masked header]` for a heading that is itself an
identifier (an identifier shape, or a value in the identifier index).

### What MCP tools receive

PubMed, Paperclip, and every other MCP tool receive search terms, MeSH terms,
PMIDs, DOIs, and paper titles. They never receive data values, identifiers,
row text, or data files. This holds in **every mode, including after you
approve the endpoint**: approving the model endpoint does not cover
third-party services such as NCBI or Paperclip.

The same hook enforces this for every `mcp__*` call, for shell uploads, and for
shell calls to NCBI E-utilities (`curl` or `wget` to
`eutils.ncbi.nlm.nih.gov`, and the `ce-pubmed` search script). It denies
arguments that contain an SSN, an email address, a US phone number, a
keyword-anchored record number (MRN, medical record, patient ID, member ID,
claim number), a keyword-anchored date of birth, or a value in the identifier
index. It also denies Paperclip upload, import, or share calls that name a
local data file, and `curl`, `wget`, `scp`, or `rsync` uploads of data files.
PMIDs, DOIs, PMCIDs, author surnames, and ordinary research queries pass
silently. The skills carry the same rule.

**Identifier index.** Whenever `data_root` is set, in every mode, `ce-setup`
builds and `ce-data-qa` refreshes the identifier index with
`scripts/ce-identifier-index`. It reads identifier-like columns under
`data_root` (names; MRN, patient, member, subscriber, and record IDs; claim
numbers; SSN; date of birth; address; phone; email) and stores only salted
hashes in `.ce-datascience/identifier-index.local.json`: local, gitignored,
with a random per-project salt and no plaintext. It prints counts only. Each
full value is stored, plus first+last name pairs, plus single tokens that
contain a digit for ID columns only, so a lone surname or common word never
matches. The hook hashes every one- to three-word run of each argument, denies
on a match without echoing it, and is silent when no index exists. With a
200,000-entry index the lookup adds a few milliseconds.

**Limits.** The hook is defense in depth, not a sandbox. Enforcement is Claude
Code only: Codex and OpenCode installs carry the hook entry but it exits
immediately there, and Gemini, Kiro, Copilot, and Pi skip hooks, so those
harnesses rely on the skill instructions alone. The script check is heuristic
static analysis: a script that builds a data path at run time, or reads data
through a function the hook does not recognize, can still print values, and
programs it cannot parse (deliberate obfuscation) are out of scope. Values
that are not in identifier columns, such as free-text notes, are not indexed,
and the identifier patterns catch common shapes, not every one. A patient who
shares a full name with an author you search for blocks that name. A config
problem resolves to schema-only. An unexpected internal error blocks only
calls that mention a data file or an upload; anything else is allowed with a
one-line warning, so a hook bug never blocks unrelated work.

**Changing the answer.** Re-run `ce-setup`, or edit or delete the
`phi_environment` block in `.ce-datascience/config.local.yaml`.

## Components

| Component | Count |
|-----------|-------|
| Agents | 55 |
| Skills | 65 |

Publication workflows use shared artifact registries and publication profiles so tables, figures, manuscript packages, registry exports, review packs, and signoff ledgers stay consistent. The initial publication profiles are JAMA and generic biomedical.

## Platform Support

The plugin is authored once and distributed across Claude Code, Codex, Pi, Gemini CLI, OpenCode, Kiro, and Qwen Code.

- Claude Code loads the plugin directly from `plugins/ce-datascience`.
- Claude Code plugin commands and skills are namespaced as `/ce-datascience:ce-*`; install optional local aliases for bare `/ce-*` demo UX.
- Codex should use native plugin install for skills plus the Bun `--to codex` agent bridge for generated agents. Set `CODEX_HOME` and pass the same value to `--codex-home` when installing into a non-default Codex profile.
- Codex locked-down installs can use `ce-datascience-codex-local.zip` plus `install-codex-offline.sh` to copy local marketplace metadata, the native plugin under `.codex/plugins/ce-datascience`, and bridge agents without Bun.
- Full standalone Codex installs are supported with `--include-skills`; this mode writes generated skills and agents, plus managed `.codex/hooks.json` entries for plugins that declare hooks (CE DataScience declares only the Claude Code data-boundary guard, which exits immediately under Codex), without deleting manual or other-plugin hooks.
- Pi, Gemini CLI, OpenCode, and Kiro are generated by the shared converter. Use `--output /path/to/workspace` for workspace-based targets, and avoid naming an OpenCode workspace output directory literally `opencode` unless a flat global-style layout is intended.
- Qwen Code uses its native extension installer, which can consume Claude marketplace plugins directly; it is not a generated `--to qwen` converter target.

Common generated install commands, run from the repo root:

```bash
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME"
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME" --include-skills
bun run src/index.ts install ./plugins/ce-datascience --to opencode --output /path/to/workspace
bun run src/index.ts install ./plugins/ce-datascience --to gemini --output /path/to/gemini-workspace
bun run src/index.ts install ./plugins/ce-datascience --to kiro --output /path/to/kiro-workspace
bun run src/index.ts install ./plugins/ce-datascience --to pi --pi-home "$HOME/.pi/agent"
```

## Upstream CE Feature Ports

The current plugin selectively ports useful features from the original compound-engineering plugin and adapts them to health data science:

| Upstream area | ce-datascience behavior |
|---------------|-------------------------|
| Planning and brainstorming | `/ce-plan` keeps SAP mode and implementation-plan mode while starting summaries with an implementation-independent objective, preserving format on resume, and strengthening output handling, research routing, and synthesis. `/ce-brainstorm` keeps PICO/PECO and study-design framing while adding grouped requirements, visual communication behavior, and output-mode handling. |
| Work and optimization | `/ce-work` verifies tracked snapshots before parallel worktree execution and keeps tasks with uncommitted dependencies inline. `/ce-optimize` isolates parallel Codex experiments by directory and requires a recorded baseline and measurable outcome. |
| Debugging | `/ce-debug` supports correctness and performance investigations, redacts secrets from evidence, and repeats the original measurement after a fix. |
| PR feedback resolution | `ce-resolve-pr-feedback` carries GraphQL pagination and split-reference handling, then frames replies around statistical methodology, SAP drift, reproducibility, reporting checklists, and clinical/health data review threads. |
| Sessions | `/ce-sessions` searches Claude Code, Codex, and Cursor histories with repo-root pre-resolution, session discovery, skeleton extraction, metadata extraction, and error extraction helpers. |
| Git and review workflow | `ce-code-review` applies path-scoped `CODING_STANDARDS.md` alongside binding repo instructions. `ce-commit` and `ce-commit-push-pr` use an isolated temporary Git index for named-file commits, preserving unrelated staged and working-tree changes while honoring publishing gates. |
| Setup health | `/ce-setup` detects obsolete Codex tool-map blocks and offers approved cleanup guidance without silently rewriting user configuration. |
| Public support | `/ce-release-notes` and `/ce-report-bug` are included so users can answer version-specific questions and file structured bug reports from the public plugin surface. |
| Target compatibility | Agent sources use current `ce-*.md` filenames; legacy `*.agent.md` parsing remains supported. Codex installs respect `CODEX_HOME`, support native-plugin agent bridge and standalone modes, and preserve manual/other-plugin hooks during managed hook writes. |

The curated upstream refresh includes portable continuity as `/ce-handoff`. PR monitoring (`ce-babysit-pr`) and maintainer corpus retuning (`ce-retune`) were removed as outside the data-science scope. Deferred upstream-only skills remain intentionally out of scope: Rails, frontend, browser/Xcode, Slack command workflows, product-pulse, dogfood, LFG, agent-native architecture/audit, demo-reel, Proof, simplify-code, strategy, promotion, and polish workflows. The upstream multi-provider cross-model runner and `/ce-pov` remain deferred until CE has a trusted serving-route attestation contract.

### Coexisting with compound-engineering

Fifteen skills share names with the upstream compound-engineering plugin (`ce-brainstorm`, `ce-plan`, `ce-work`, `ce-debug`, `ce-code-review`, `ce-doc-review`, `ce-commit`, `ce-commit-push-pr`, `ce-compound`, `ce-compound-refresh`, `ce-ideate`, `ce-optimize`, `ce-resolve-pr-feedback`, `ce-worktree`, `ce-handoff`). Plugin namespacing prevents a slash-command clash, but when both plugins are enabled the model sees two descriptions for requests like "plan this". The ce-datascience descriptions name their data-science scope (SAPs, analysis code, PHI) to help selection. To make routing deterministic, invoke the namespaced command (`/ce-datascience:ce-plan`) or disable the plugin you do not need for the project with `/plugin`. Claude Code's `skillOverrides` setting does not apply to plugin skills.

### Migration from earlier versions

These commands no longer exist. Installs made with the CLI remove the stale copies on upgrade; marketplace installs drop them when the plugin updates.

| Removed | Use instead |
|---|---|
| `/ce-r-review`, `/ce-r-tidyverse`, `/ce-r-targets`, `/ce-r-package-development`, `/ce-r-package-testing`, `/ce-r-cran`, `/ce-r-performance`, `/ce-r-event-studies` | `/ce-rstats` (routes to the same guidance under `references/`) |
| `/ce-fabric-coding`, `/ce-fabric-kql`, `/ce-fabric-ml`, `/ce-fabric-pipelines`, `/ce-fabric-semantic-models` | `/ce-fabric` |
| `/ce-retune` | The upstream compound-engineering plugin's retune workflow (maintainer tooling) |
| `/ce-babysit-pr` | Your agent's own PR watching, or the upstream compound-engineering plugin |

Figure manifests that set `style_profile: jama` still validate; the default profile is now `clinical-standard`.

## Skills

### Core Workflow

The compound engineering loop adapted for data science: hypothesize, design study, execute analysis, review methods, document learnings.

| Skill | Description |
|-------|-------------|
| `/ce-ideate` | Big-picture ideation: generate and evaluate research ideas, then route into brainstorming |
| `/ce-brainstorm` | Interactive study design exploration with PICO/PECO probes, grouped requirements, visual communication, and Markdown/HTML output modes before planning |
| `/ce-grill` | Stress-test a research project one question at a time (goal, hypothesis, data, proposed analysis, target journal, audience) with a recommended answer for each, saving decisions and ranked risks to `docs/brainstorms/` |
| `/ce-research-question` | Harden a fuzzy study idea into structured PICO + FINER + PubMed query at `analysis/research-question.yaml` |
| `/ce-plan` | Create the canonical versioned SAP or technical implementation plan with an implementation-independent objective, ICH E9(R1) estimands (SAP-1.4) and RCT minimum content in SAP mode, Markdown/HTML output modes, and format-preserving resume |
| `/ce-statistical-analysis-plan` | Deepen complex clinical or observational SAPs with a claim-to-dataset schema, ICH E9(R1) estimands, diagnostics, and decision evidence without creating a competing plan or workbook |
| `/ce-model-strategy` | Choose, evidence-ground, and scaffold the primary statistical model—including mixed/random effects, causal, prediction, Bayesian, survival, and meta-analysis branches—in the detected R or Python stack |
| `/ce-code-review` | Statistical and methodological review with confidence-calibrated integrity/causal findings, reporting checklist compliance, and blinding-state awareness (auto-detected from stack profile) |
| `/ce-adversarial-review` | Independent adversarial code or plan review with quick/auto/deep, a read-only Claude Code/Codex peer pass, bounded evidence-based rebuttal, and explicit local-only or unresolved coverage when a peer cannot validate |
| `/ce-work` | Execute analysis tasks with SAP tracking and verified parallel snapshots while failing loudly at missing, corrupt, or uncommitted dependencies |
| `/ce-notebook-standards` | Set the master-notebook or multi-file decision and the documented, small-cell contract for Marimo, Jupyter, R Markdown, and Quarto work |
| `/ce-notebook-edit` | Safely insert reviewed cells into existing Jupyter notebooks using unique metadata tags, backups, and structural validation |
| `/ce-debug` | Find correctness or performance root causes with secret-safe evidence, a recorded baseline, and repeated post-fix measurement |
| `/ce-handoff` | Create or resume a portable continuity record with verified state, constraints, and next safe action |
| `/ce-compound` | Document validated analytical approaches, statistical decisions, and domain methods (with deterministic dedup fingerprints across studies) |
| `/ce-compound-refresh` | Refresh stale learnings and decide whether to keep, update, replace, or archive |
| `/ce-sap-tabular` | Generate the biostatistics-style tabular companion to the prose SAP -- Overview, Outputs, Master Variables, and optional long/wide sample sheets that statisticians hand to programmers |
| `/ce-data-qa` | Data QA gate for row counts, joins, keys, types, missingness, and stack-specific integrity risks; emits GO/WARN/NO-GO, a missingness catalog, and PI sign-off block. Recommends principled missing-data methods (no mean imputation or LOCF) and does not claim MNAR is detectable from the data. Runs between data extraction and modeling |
| `/ce-verify` | Mid-workflow analysis verification gate -- checks sample size, data leakage, effect direction, missing data (judged by assumed mechanism, not a percentage cutoff), PHI, figure quality, and reproducibility between analysis steps |
| `/ce-sprint` | Open or close an auditable sprint with declared scope (subset of SAP sections), planned outputs, and a named human reviewer. Closing dispatches `ce-sprint-audit-reviewer` |

The planning scopes are deliberate: start with `/ce-plan`; add
`/ce-statistical-analysis-plan` only for complex claim-level clinical methods;
use `/ce-model-strategy` after data QA for nontrivial model decisions; render
the workbook with `/ce-sap-tabular`; and use the manuscript skills for final
prose and citations.

### Biomedical Lifecycle

For the academic paper lifecycle: literature → checklist → cohort → power → SAP → manuscript artifacts.

| Skill | Description |
|-------|-------------|
| `/ce-pubmed` | PubMed/MEDLINE search via NCBI E-utilities with MeSH expansion and structured result tables; by default keeps not-yet-indexed and non-English records (`--english-only` opts in to a language limit) |
| `/ce-evidence-map` | Build a source-backed evidence map from PubMed, with optional Paperclip full-text, grep, map, SQL, and figure deepening when available |
| `/ce-method-extract` | Extract structured statistical methods from a PubMed result set into a comparison table for SAP justification, without treating the most common method or raw published effects as SAP and power defaults |
| `/ce-checklist-match` | Pick the right reporting checklist at PLAN time, before SAP drafting: TRIPOD+AI for every prediction model, standalone TARGET for target trial emulation, SPIRIT 2025 and PRISMA-P for protocols, and DECIDE-AI or TRIPOD-LLM for early clinical AI and LLM studies |
| `/ce-power` | Compute sample size with sensitivity sweep across plausible effect sizes (two-sample, two-proportion, non-inferiority at one-sided 0.025, survival, cluster, and Riley-criteria `pmsampsize` for prediction models); produces an R or Python script and a SAP-ready paragraph |
| `/ce-trial-design` | Build an auditable feasible/Pareto frontier for two-arm group-sequential designs from version-pinned `rpact` or `gsDesign` results (type I error under non-binding futility computed ignoring the futility bound), with a provenance receipt and SAP handoff |
| `/ce-effect-size` | Pool effect-size estimates from prior literature (random-effects REML with a Hartung-Knapp CI and a k-1 df prediction interval) into a defensible assumption for `/ce-power` |
| `/ce-prereg` | Generate a pre-registration form for OSF, ClinicalTrials.gov, PROSPERO, or AsPredicted from the locked SAP; its validator blocks a draft SAP, unblinded data, and a PROSPERO registration at or past data extraction |
| `/ce-table1` | Generate a publication-ready Table 1 shell, spec, and validation report from the SAP variables catalog; `--design rct\|observational\|descriptive` sets the comparison columns (SMD column for observational comparisons, no baseline p-values for randomized trials) |
| `/ce-figure` | Create publication figures in R (ggplot2) or Python (matplotlib, Jupyter/Marimo) in a journal-neutral clinical figure style (calibration-in-the-large via an offset model, cumulative incidence under competing risks), and validate figure manifests for source data, code, outputs, captions, alt text, and checklist traceability |
| `/ce-manuscript-package` | Build a manuscript package manifest and Quarto-ready shell from SAP, Table 1, figure, checklist, and registry artifacts |
| `/ce-manuscript-citations` | Resolve PubMed/Paperclip evidence and deliver a Word manuscript with editable Zotero citation fields |
| `/ce-scientific-writing` | Draft, revise, or audit evidence-bound scientific manuscripts without imposing one journal's style |
| `/ce-clinical-research-voice` | Apply a precise, clinically detached house style to narrative clinical AI research prose |
| `/ce-manuscript-section-discipline` | Keep Methods and Results factual while preserving rationale required by reporting guidelines, protocols, regulations, or reproducibility standards |
| `/ce-scientific-anti-slop` | Detect and remove generic AI-writing tells from scientific and clinical manuscript prose |
| `/ce-pre-submission-audit` | Run the combined voice, section-discipline, and anti-slop gate before manuscript handoff |
| `/ce-review-pack` | Create PI-facing review packs and validate named signoff ledgers for manuscript, registry, sprint, and data-lock approvals |
| `/ce-model-card` | Generate a Mitchell-style model card for a clinical prediction model, with overall + subgroup performance (CIs, event counts, validation type), equalized odds kept distinct from equal opportunity, and ethical considerations |

### EHR & Administrative Data

| Skill | Description |
|-------|-------------|
| `/ce-clif` | Activate CLIF-safe profile for ICU consortium repos -- `/ce-clif --version 2.1.0` selects CLIF/mCIDE 2.1 and `--version 3.0.0` selects the matching 3.0 family; honors the saved sensitive-data boundary (asks once only if none is saved), keeps patient-level intermediates in the approved restricted data root, and enforces Parquet-only, version-correct mCIDE vocab, and POC sign-off; IPTW examples use stabilized weights with balance checks |
| `/ce-clif-project-template` | Initialize or audit a CLIF project against the official Project Template, with explicit version selection, site-local configuration, and aggregate-only final-output safeguards |
| `/ce-cohort-build` | Define a study cohort using OMOP concept sets / ICD / CPT / LOINC code lists with vocabulary version pinning; outputs SQL, JSON spec, and CONSORT-flow waterfall |
| `/ce-phenotype-validate` | Validate an EHR-derived phenotype algorithm against a chart-review gold standard; PPV / NPV / sensitivity / specificity overall and by subgroup, reweighting sensitivity and specificity for verification bias under algorithm-stratified sampling |

### Bioinformatics

| Skill | Description |
|-------|-------------|
| `/ce-bioinfo-qc` | Sequencing / omics data QA gate: FastQC / MultiQC / sample swap detection / batch-effect and batch-condition confound screen for FASTQ, BAM, count matrices, methylation arrays |
| `/ce-genome-build` | Pin the genome build (GRCh37 / GRCh38 / T2T) and annotation version (GENCODE / Ensembl); audit every output for build consistency |

### ML / AI

| Skill | Description |
|-------|-------------|
| `/ce-ml-experiment-track` | Wire up ML experiment tracking (mlflow / wandb / dvc / offline-YAML); generate boilerplate, configure backend, define required-log schema, and keep the test set out of model selection |
| `/ce-optimize` | Run metric-driven optimization with isolated experiment directories, recorded baselines, cross-validation awareness, leakage guards, and a flag on selection-biased CV scores |

### Microsoft Fabric & Marimo

| Skill | Description |
|-------|-------------|
| `/ce-fabric` | Microsoft Fabric workflows in one skill: Lakehouse/OneLake and Warehouse code, Data Factory pipelines, Direct Lake semantic models, Fabric ML, and Eventhouse/KQL, each in its own reference file, with CE data and method gates in place |
| `/ce-marimo` | Create and review text-native reactive Marimo notebooks with explicit dependencies, validation, and fail-loud data boundaries |

The Fabric workflows are an original CE DataScience adaptation of the routing areas
documented in [sajor2000/fabric-skills](https://github.com/sajor2000/fabric-skills);
it keeps those platform surfaces inside CE's research-design, data-QA, and
evidence gates rather than copying upstream prompts.

### R Statistics

| Skill | Description |
|-------|-------------|
| `/ce-rstats` | R workflows in one skill: analysis design, read-only R review, tidyverse, event studies, package development, testthat, CRAN readiness, performance, and `targets` pipelines, each in its own reference file, preserving CE study-design, QA, and review gates |

The R workflows are evidence-first: they begin with the project's pinned environment, use Ref MCP for exact package documentation when available, and use Tavily MCP only to discover primary current sources. If a research integration is unavailable, the workflow surfaces the verification gap rather than guessing current APIs or CRAN policy.

The R family is an original CE DataScience adaptation of the categories curated
by [awesome-rstats-skills](https://github.com/christopherkenny/awesome-rstats-skills);
it does not copy third-party skill text and preserves CE's methodological
guardrails.

### Git Workflow

| Skill | Description |
|-------|-------------|
| `ce-clean-gone-branches` | Clean up local branches whose remote tracking branch is gone |
| `ce-commit` | Create a value-communicating commit while isolating named files from unrelated staged and working-tree changes |
| `ce-commit-push-pr` | Commit through an isolated temporary index, push, and open or update a PR with an adaptive value-first description and optional evidence routing |
| `ce-resolve-pr-feedback` | Resolve PR review feedback in parallel -- evaluates validity, fixes issues, handles paginated/split GitHub threads, and replies to statistical methodology feedback |
| `ce-worktree` | Manage Git worktrees for parallel development |

### Review & Quality

| Skill | Description |
|-------|-------------|
| `ce-doc-review` | Review documents using parallel persona agents for role-specific feedback |
| `/ce-sas-stata-assess` | Inventory SAS/Stata analysis files and model procedures for review or bounded migration without claiming first-class scaffolding support; flags cross-software default differences |

### Literature & Evidence

| Skill | Description |
|-------|-------------|
| `/ce-literature-search` | Route evidence requests to PubMed metadata, claim-focused lawful full-text mapping, methods extraction, effect-size synthesis, citation delivery, or authoritative web sources |

### IDE & Deployment

| Skill | Description |
|-------|-------------|
| External MCP add-ons | Connect optional PubMed MCP or Paperclip integrations directly in the target agent; CE DataScience does not bundle an MCP server |

### Workflow Utilities

| Skill | Description |
|-------|-------------|
| `/ce-language-detect` | Detect Python, R, both, or unknown from repository evidence and emit the canonical language handoff used by setup and workflow routing |
| `/ce-sessions` | Ask questions about session history across Claude Code, Codex, and Cursor, with repo-root session discovery and structured metadata/error extraction |
| `/ce-release-notes` | Summarize recent ce-datascience releases or answer version-specific release questions |
| `/ce-report-bug` | Gather structured environment details and open a GitHub issue for ce-datascience plugin bugs |
| `/ce-setup` | Configure the stack profile, diagnose the environment including obsolete Codex tool maps, and bootstrap project config |
| `/ce-update` | Check plugin version and fix stale cache (Claude Code only) |
| `/ce-workflow` | Lifecycle navigator -- shows ordered skill sequence for your project type, data layer, and language; detects progress and recommends next step |

## Scripts

Plain shell utilities for things that don't need a skill:

| Script | Purpose |
|--------|---------|
| `scripts/schema-peek.py <file>` | Print a data file's column headings, inferred types, row count, non-null count, and % missing, never a cell value; small counts are suppressed and headerless files show `col_1..col_n`. Used in schema-only mode. |
| `scripts/freeze-submission.sh <tag>` | Tag the current commit as a submission freeze. Refuses on a dirty tree; writes `submissions/<tag>/manifest.yaml` with commit sha, SAP version, locked-wave hash, and env-lock-file hashes. Does not push the tag and does not copy data. |

## Agents

Agents are specialized subagents invoked by skills.

### Statistical Review

| Agent | Description |
|-------|-------------|
| `ce-methods-reviewer` | Statistical test selection and assumption verification, preferring model diagnostics over normality pre-tests |
| `ce-multiplicity-reviewer` | Multiple comparisons, p-hacking, and selective reporting; co-primary endpoints that must all succeed need no alpha correction |
| `ce-reproducibility-reviewer` | Seeds, package versions, paths, and environment specs |
| `ce-reporting-checklist-reviewer` | Reporting guideline compliance across 39 guidelines — auto-routes by study type to the newest version of each guideline (old names such as TRIPOD 2015 and QUADAS-2 resolve to the successor that replaced them), covers protocol-stage guidelines (SPIRIT 2025, PRISMA-P), layers AI extensions, writes append-only compliance report (opt-in) |
| `ce-sap-drift-detector` | Structural and semantic drift between SAP and analysis code, including estimand, missing-data, and inference-method drift; also flags blinding-state violations, missing amendment log entries, primary-endpoint changes after data lock, and code drift after amendments |
| `ce-data-mapping-reviewer` | Codebook / SAP / extract column-mapping correctness — name drift, unit mismatches, level-set drift, derived-variable formulae, PHI in codebook |
| `ce-phi-leak-reviewer` | HIPAA Safe Harbor identifier scan across data files, codebooks, notebooks, manuscripts, figure captions, and rendered output after the saved sensitive-data boundary (or a one-time confirmation) allows it |
| `ce-targets-pipeline-reviewer` | targets pipeline correctness — hidden file deps, format hints, branch-count drift, disabled automatic seeding, superseded launchers |
| `ce-quarto-render-reviewer` | Quarto / RMarkdown render-time correctness — committed output, cache traps, params drift, bibliography paths, accessibility |
| `ce-r-code-reviewer` | R code quality — tidyverse, dplyr, ggplot2, data.table patterns |
| `ce-r-pipeline-reviewer` | R analysis pipeline correctness — dplyr logic errors, ggplot2 accessibility, survival analysis, mixed model convergence |
| `ce-python-ds-reviewer` | Python DS quality — pandas, vectorization, sklearn, data leakage |
| `ce-kieran-python-reviewer` | General Python code review with strict conventions |
| `ce-causal-inference-reviewer` | Causal-inference correctness — DAG specification (including M-bias), confounder set, time-zero alignment, positivity, estimand, sensitivity analyses for IPTW / matching / MSM / g-computation / DR / IV / RDD / DiD (staggered-adoption diagnostics) / target-trial emulation |

### ML / AI Review

| Agent | Description |
|-------|-------------|
| `ce-data-leakage-reviewer` | Target leakage, train-test contamination, look-ahead bias in time-series, normalization fit on test set, subject-in-both-splits; a random split is not leakage by itself |
| `ce-fairness-reviewer` | Subgroup performance auditing (sex / race / age / hospital / payer / language) for clinical prediction models, against TRIPOD+AI and FDA AI/ML guidance; requires a justified fairness criterion |
| `ce-calibration-reviewer` | Calibration hierarchy (calibration-in-the-large, slope, flexible calibration curve), Brier, ICI, decision-curve analysis, and censoring-aware time-dependent AUC for dynamic survival decisions -- catches the AUC-only TRIPOD+AI gap |

### EHR & Administrative Data Review

| Agent | Description |
|-------|-------------|
| `ce-omop-mapping-reviewer` | OMOP CDM correctness -- vocabulary version pinning, valid_start/valid_end honoring, descendant inclusion, standard vs source concepts, era vs occurrence, observation_period |
| `ce-administrative-data-reviewer` | Claims-data idiosyncrasies -- baseline enrollment and look-back, disenrollment as censoring, claims truncation, payer mix, NDC-to-RxNorm, claims-vs-clinical disconnect |
| `ce-concept-drift-reviewer` | Vocabulary drift across time -- ICD-9-to-10 transition, CPT yearly updates, SNOMED concept_id deprecation, vocab refresh drift |

### Bioinformatics Review

| Agent | Description |
|-------|-------------|
| `ce-bioinfo-pipeline-reviewer` | Snakemake / Nextflow / CWL / Bioconductor pipelines -- env pinning, reference pinning, sample-sheet validation, output checksums, caching traps, version traceability |
| `ce-omics-batch-reviewer` | Batch-condition confound detection in differential expression / methylation / proteomics; flags blind ComBat / RUV / SVA application, ComBat without the biological covariates in `mod`, and `removeBatchEffect` output used for inference |

### Workflow

| Agent | Description |
|-------|-------------|
| `ce-sprint-audit-reviewer` | Audits a sprint's planned-vs-actual outputs, scope discipline, and reproducibility re-run; dispatched by `/ce-sprint close` |

### Code Quality Review

| Agent | Description |
|-------|-------------|
| `ce-correctness-reviewer` | Logic errors, edge cases, state bugs |
| `ce-maintainability-reviewer` | Coupling, complexity, naming, dead code |
| `ce-performance-oracle` | Performance analysis and optimization |
| `ce-performance-reviewer` | Runtime performance with confidence calibration |
| `ce-testing-reviewer` | Test coverage gaps, weak assertions |
| `ce-project-standards-reviewer` | AGENTS.md compliance |
| `ce-adversarial-reviewer` | Construct failure scenarios to break implementations |
| `ce-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `ce-reliability-reviewer` | Production reliability and failure modes |
| `ce-security-reviewer` | Security vulnerabilities with confidence calibration |
| `ce-security-sentinel` | Security audits and vulnerability assessments |
| `ce-previous-comments-reviewer` | Check whether prior review feedback has been addressed |

### Document Review

| Agent | Description |
|-------|-------------|
| `ce-coherence-reviewer` | Review documents for internal consistency and terminology drift |
| `ce-feasibility-reviewer` | Evaluate whether proposed approaches will survive contact with reality |
| `ce-product-lens-reviewer` | Challenge problem framing, evaluate scope decisions |
| `ce-scope-guardian-reviewer` | Challenge unjustified complexity and scope creep |
| `ce-security-lens-reviewer` | Evaluate plans for security gaps (auth, data, APIs) |
| `ce-adversarial-document-reviewer` | Challenge premises and stress-test decisions |
| `ce-design-lens-reviewer` | Review plans for missing design decisions |

### Research

| Agent | Description |
|-------|-------------|
| `ce-best-practices-researcher` | Gather external best practices and examples |
| `ce-framework-docs-researcher` | Research framework documentation and best practices |
| `ce-git-history-analyzer` | Analyze git history and code evolution |
| `ce-issue-intelligence-analyst` | Analyze GitHub issues for recurring themes |
| `ce-learnings-researcher` | Search institutional learnings for relevant past solutions |
| `ce-repo-research-analyst` | Research repository structure and conventions |
| `ce-session-historian` | Search prior sessions for related investigation context |
| `ce-slack-researcher` | Search Slack for organizational context |
| `ce-web-researcher` | Iterative web research for prior art and best practices |

### Workflow

| Agent | Description |
|-------|-------------|
| `ce-architecture-strategist` | Analyze architectural decisions and compliance |
| `ce-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `ce-pr-comment-resolver` | Address PR comments and implement fixes |
| `ce-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

## License

MIT
