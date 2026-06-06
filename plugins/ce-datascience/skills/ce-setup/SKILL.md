---
name: ce-setup
description: "Configure data science stack profile and diagnose environment. Auto-detects language (R/Python/both) from repository signals, then prompts for IDE, data libraries, statistical packages, and reporting framework. Detects existing config and offers modification. Use when setting up a new project, switching tools, or troubleshooting environment."
argument-hint: "[--locked-down|--no-install]"
disable-model-invocation: true
---

# Data Science Environment Setup

## Interaction Method

Ask the user each question below using the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini, `ask_user` in Pi (requires the `pi-ask-user` extension). Fall back to presenting each question as a numbered list in chat only when no blocking tool exists in the harness or the call errors (e.g., Codex edit modes) -- not because a schema load is required. Never silently skip or auto-configure user-facing questions (except the explicit repo-signal language auto-detect in Phase 0.5). For multiSelect questions, accept comma-separated numbers (e.g. `1, 3`).

Interactive setup for ce-datascience -- configures the stack profile for R/Python data science workflows, diagnoses environment health, and bootstraps project-local config.

## Input Arguments

Read the user arguments from `$ARGUMENTS`.

- `--locked-down` and `--no-install` mean corporate/no-package-manager mode.
- In corporate mode, report missing tools and approved-workaround guidance, but do not offer or run Homebrew, pip, npm, GitHub CLI, or Quarto install commands.
- Quarto is optional unless the user selected Quarto manuscript/render output in Step 6.

## Phase 0: Detect Existing Config

**Config detection (pre-resolved):** !`(top=$(git rev-parse --show-toplevel 2>/dev/null); [ -n "$top" ] && cat "$top/.ce-datascience/config.local.yaml" 2>/dev/null) || (common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); [ -n "$common" ] && cat "$(dirname "$common")/.ce-datascience/config.local.yaml" 2>/dev/null) || echo '__NO_CONFIG__'`

If the line above resolved to valid YAML (not `__NO_CONFIG__`), an existing config was found. Parse the current `stack_profile` values and display them:

```
Existing stack profile detected:
  Language:   python
  IDE:        vscode
  Libraries:  pandas
  Data layer: parquet
  Connection: n/a
  Stats:      scipy, statsmodels
  Reporting:  jupyter

What would you like to do?

1. Modify this profile
2. Start fresh (reconfigure from scratch)
3. Skip profile setup -- run environment check only
```

If the user selects "Modify this profile", proceed to Phase 1 but pre-fill each question with the current value as the default. If "Start fresh", proceed to Phase 1 with no defaults. If "Skip", jump to Phase 2.

If `__NO_CONFIG__`, this is a first-time setup. Display: "No stack profile found. Let's configure your data science environment." Proceed to Phase 1.

## Phase 0.5: Auto-detect language from repo signals (no question)

Before asking any Phase 1 questions, run `/ce-language-detect` (or apply its rules from `ce-language-detect/references/detection-rules.md`) and capture:

```
__CE_LANG__ primary=<python|r|both|unknown> secondary=<python|r|null> source=<auto|cached|manual>
```

Rules:

- Do not ask the user what language they use in this phase.
- If `primary=unknown` and an existing config has `stack_profile.language`, reuse that value and set `source=cached`.
- If `primary=unknown` and no prior config exists, default to `both`.

## Phase 0.6: Detect CLIF profile handoff

Before asking stack questions, scan recent chat and repo signals for CLIF mode:

```
__CE_CLIF__ active=true version=<dd-version> strict=<true|false> rules=<path-to-clif-rules.md>
```

If the active signal is present, set `clif_profile_active=true` and store:

```yaml
stack_profile:
  profile: clif
  clif:
    data_dictionary_version: "2.1.0"
```

If no signal is present, apply `/ce-clif` activation rules exactly:

- Strong signals activate CLIF mode: `CLIF_CLAUDE.md`, a git remote containing
  `clif-consortium`, `clif-icu`, or `Common-Longitudinal-ICU-data-Format`,
  explicit user text saying CLIF/mCIDE, or direct `/ce-clif` use.
- Weak CLIF signals require two or more matches, or one confirmation question
  before activation: `mCIDE/`, `WORKFLOW.md`, `clif_*.parquet`, CLIF-specific
  table names, or `config/config.json` with `tables_path`.

When CLIF mode activates from repo signals, store the same profile block:

```yaml
stack_profile:
  profile: clif
  clif:
    data_dictionary_version: "2.1.0"
```

When CLIF mode is active, bias setup prompts toward the packages used in current
CLIF consortium repositories: `uv`, `clifpy`, `duckdb`, `pyarrow`, `polars`,
`marimo`, `tableone`, and the R `renv` template package set. Do not pin Python
package versions unless the user's project already has a lockfile.

## Phase 0.75: Detect verified connection handoff

Before asking data-layer questions, scan the recent chat context for a verified connection signal:

```
__CE_CONNECTION__ name=<connection-name> type=<postgres|sqlite|duckdb|other> database=<db-name> auth=<auth-mode> status=verified
```

If present with `status=verified`, store it as `detected_connection` and print:

```
[ce-setup] verified data connection detected: <name> (<type>, database=<db-name>)
```

The signal is generic. `healthmap-connection` is one possible producer, but `ce-setup` must not depend on Health Map-specific behavior.

## Phase 1: Stack Profile Configuration

Walk through each question in sequence. The answer to each question determines the options shown for subsequent questions.

### Step 1: Language (from auto-detection)

Set a tentative `detected_language` from `__CE_LANG__.primary` captured in Phase 0.5 (`r`, `python`, or `both`).

- If `primary=unknown`, use fallback rules from Phase 0.5.
- Store the detection metadata as `language_detect.primary`, `language_detect.secondary`, and `language_detect.source`.
- Print one line so the user can see what happened:

```
[ce-setup] language auto-detected: <primary> (source=<auto|cached|manual>)
```

Do not treat `language_detect.primary=both` as a final user preference. It means the repository has both R and Python signals. The selected IDE in Step 2 refines `stack_profile.language` for all follow-up questions.

### Step 2: IDE

Present IDE options relevant to `detected_language`.

For R or both:
```
What is your primary development environment?

1. RStudio
2. VS Code
3. Quarto (VS Code or RStudio)
```

For Python or both:
```
What is your primary development environment?

1. JupyterLab / Jupyter Notebook
2. VS Code
3. Marimo
4. Quarto
```

For "both", combine all unique options (RStudio, JupyterLab, VS Code, Marimo, Quarto) and present as a numbered list in chat since the list exceeds 4 items. Include a hint: "Pick a number or describe what you want."

Store the selection as `stack_profile.ide`.

Then refine `stack_profile.language` from the selected IDE:

- If `detected_language=both` and the user selects Marimo or JupyterLab / Jupyter Notebook, set `stack_profile.language=python`.
- If `detected_language=both` and the user selects RStudio, set `stack_profile.language=r`.
- If `detected_language=both` and the user selects VS Code or Quarto, keep `stack_profile.language=both`.
- If `detected_language` is `r` or `python`, keep that value unless the user explicitly typed a conflicting free-text IDE/language preference.

This refinement is required before Step 3. Do not ask R data-library, R statistical-package, R environment-manager, or R project-type questions after a Python-only IDE choice such as Marimo or Jupyter. Do not ask Python package questions after an RStudio-only choice. Keep the original `language_detect` block unchanged so future runs can see what was auto-detected.

### Step 3: Data Libraries

Present library options based on the refined `stack_profile.language`, not the raw auto-detected language. Use a multiSelect question.

If `clif_profile_active=true`, use CLIF-aware package prompts.

For R under CLIF:
```
Which R data/workflow packages do you use? (select all that apply)

1. tidyverse (dplyr, ggplot2, tidyr, readr, purrr, etc.)
2. data.table
3. arrow (recommended for CLIF Parquet)
4. here
5. jsonlite
6. knitr
```

For Python under CLIF:
```
Which Python data/workflow packages do you use? (select all that apply)

1. clifpy (recommended official CLIF client)
2. polars (recommended for large CLIF tables)
3. pandas
4. duckdb
5. pyarrow
6. pandera (schema validation; used in CLIF-MIMIC)
7. sf-hamilton (pipeline DAGs; used in CLIF-MIMIC)
```

For "both" under CLIF, ask the CLIF R question first, then the CLIF Python question.

For R:
```
Which data libraries do you use? (select all that apply)

1. tidyverse (dplyr, ggplot2, tidyr, readr, purrr, etc.)
2. data.table
```

For Python:
```
Which data libraries do you use? (select all that apply)

1. pandas
2. polars
```

For "both", ask the R question first, then the Python question.

Store selections as `stack_profile.data_libraries`.

### Step 4: Data Layer

If `detected_connection.status=verified`, show the SQL database option as the default/recommended choice and include the connection name in the prompt:

```
Verified database connection detected: healthmap-connection (postgres, database=healthmap_dev, auth=entra).

What is your primary data storage layer?

1. SQL database (recommended: use verified healthmap-connection)
2. Parquet files (local or cloud)
3. Microsoft Fabric / Spark
```

If the user selects the verified database option, set `stack_profile.data_layer=database` and store:

```yaml
stack_profile:
  data_connection:
    name: healthmap-connection
    type: postgres
    database: healthmap_dev
    auth: entra
    status: verified
```

If no verified connection signal is present and `clif_profile_active=true`, use the CLIF prompt:

```
What is your primary data storage layer?

1. CLIF Parquet files (recommended)
2. SQL database (only for upstream extracts before materializing CLIF Parquet)
3. Microsoft Fabric / Spark
```

If no verified connection signal is present and CLIF mode is not active, use the standard prompt:

```
What is your primary data storage layer?

1. Parquet files (local or cloud)
2. SQL database (PostgreSQL, SQLite, DuckDB, etc.)
3. Microsoft Fabric / Spark
```

Store the selection as `stack_profile.data_layer`.

### Step 5: Statistical Packages

Present package options based on the refined `stack_profile.language`, not the raw auto-detected language. Use a multiSelect question.

If `clif_profile_active=true`, use CLIF-aware statistical/package prompts.

For R under CLIF:
```
Which R statistical/reporting packages do you use? (select all that apply)

1. stats (base R)
2. survival
3. gtsummary (Table 1 and summaries; CLIF template)
4. gt (table rendering)
5. cmprsk (competing risks; used in CLIF mobilization analyses)
6. writexl (site summary exports)
7. tidymodels (ML framework)
8. glmnet (regularized regression)
9. arrow (Parquet)
10. haven (SAS/SPSS/Stata)
```

For Python under CLIF:
```
Which Python analysis packages do you use? (select all that apply)

1. tableone (Table 1; used in CLIF project repos)
2. statsmodels
3. scipy
4. lifelines
5. scikit-learn
6. plotly
7. upsetplot
```

For "both" under CLIF, ask the CLIF R question first, then the CLIF Python question.

For R:
```
Which statistical packages do you use? (select all that apply)

1. stats (base R)
2. survival
3. lme4 (mixed models)
4. gt (tables)
5. tidymodels (ML framework)
6. glmnet (regularized regression)
7. survminer (survival plots)
8. brms (Bayesian models)
9. arrow (parquet)
10. haven (SAS/SPSS/Stata)
```

For Python:
```
Which statistical packages do you use? (select all that apply)

1. scipy
2. statsmodels
3. scikit-learn
```

For "both", ask the R question first, then the Python question.

Store selections as `stack_profile.statistical_packages`.

### Step 5.5: Environment Manager (R-only follow-up)

When the refined `stack_profile.language` includes R, ask:

```
How do you manage R package environments?

1. renv (recommended -- renv.lock for reproducible installs)
2. None (manual package management)
```

Store the selection as `stack_profile.environment_manager.r`.

When the refined `stack_profile.language` includes Python, ask the equivalent:
```
How do you manage Python environments?

1. uv (recommended for current CLIF Python repos and reproducible uv.lock files)
2. venv (built-in virtual environments)
3. conda (Anaconda/Miniconda)
4. poetry (pyproject.toml-based)
5. pixi (conda-based with pixi.toml)
6. None
```

Store the selection as `stack_profile.environment_manager.python`.

### Step 6: Reporting Framework

Present options based on the refined `stack_profile.language`.

If `clif_profile_active=true` and the refined language includes Python, list
Marimo first because current CLIF Python repos and clifpy examples use `uv` +
Marimo workflows:

```
What reporting framework do you prefer?

1. Marimo (recommended for current CLIF Python examples)
2. Jupyter notebooks (.ipynb)
3. Quarto (.qmd)
```

For R:
```
What reporting framework do you prefer?

1. Quarto (.qmd)
2. R Markdown (.Rmd)
```

For Python:
```
What reporting framework do you prefer?

1. Jupyter notebooks (.ipynb)
2. Quarto (.qmd)
3. Marimo
```

For "both":
```
What reporting framework do you prefer?

1. Quarto (.qmd) -- works with both R and Python
2. R Markdown (.Rmd)
3. Jupyter notebooks (.ipynb)
4. Marimo
```

Store the selection as `stack_profile.reporting`.

If Marimo is selected, display: "Marimo selected. `/ce-work` will scaffold reactive `.py` notebooks. Quarto export (`quarto render`) is available for manuscript output."

### Step 7: R Project Type (R-only)

When the refined `stack_profile.language` is R or both, ask:

```
What type of R project are you building?

1. Analysis scripts (standalone .R files)
2. R package (DESCRIPTION, NAMESPACE, man/)
3. Shiny application
4. Plumber API
5. targets pipeline (_targets.R)
```

Store the selection as `stack_profile.r_project_type`.

### Step 7b: Data root or extract cache

If `stack_profile.data_layer=database`, do not require `data_root` and do not treat the database connection as a filesystem path. Ask only whether the user wants a local extract/cache folder:

```
This project uses a database connection. `data_root` is optional and should only point to a local folder for materialized extracts or cached QA files.

Where should local data extracts/cache live?

1. No local data root for now (recommended for database-first projects)
2. Off-repo absolute path
3. ~/Box Sync, ~/Dropbox, or other cloud-mounted folder
4. Inside the repo at data/ (only valid for SYNTHETIC or fully de-identified public data)
```

If option 1, set `stack_profile.data_root: null` and tell the user: "Register concrete database extracts, tables, or query outputs with `data_wave_register(location=...)` before `/ce-data-qa`." If option 2 or 3, ask for the absolute path. If option 4, set `data_root: data/` and warn about PHI.

For non-database data layers, use the standard data-root prompt:

```
Where will the analysis dataset live?

1. Off-repo absolute path (recommended for any real subject data)
2. ~/Box Sync, ~/Dropbox, or other cloud-mounted folder
3. Inside the repo at data/ (only valid for SYNTHETIC or fully de-identified public data)
```

If option 1 or 2, ask the user to type the absolute path (`AskUserQuestion` with text input). If option 3, set `data_root: data/` and warn: "PHI must NEVER live inside this tree. The QA gate will block any column matching PHI patterns."

Store the resolved path as `stack_profile.data_root`.

### Step 7c: Blinding state

```
What is the blinding state for this analysis?

1. Blinded -- group labels are masked; only descriptive code allowed until unblinding
2. Unblinded -- confirmatory analysis allowed against the locked SAP
3. Not applicable -- observational, single-arm, or no blinding by design
```

Store the selection as `stack_profile.blinding_state`. The `ce-code-review` skill consults this when `--phase` is not passed and refuses inferential code while blinded.

### Step 8: Golden Path Check

After collecting all answers, check whether the combination matches a golden path:

- **Golden path 1:** R + tidyverse + Quarto
- **Golden path 2:** Python + pandas + Jupyter

If the combination matches a golden path, display:

```
Your stack matches a golden path configuration -- all skills will generate
optimized code for this combination.
```

If the combination does NOT match a golden path, display a warning (do not block):

```
Note: Your configuration is supported but is not a golden path combination.
Golden paths (R+tidyverse+Quarto and Python+pandas+Jupyter) have the most
optimized templates. Skills will still generate code for your setup, but
some templates may require minor adjustments.
```

### Step 9: Reporting Checklist (Optional)

```
Enable a reporting guideline checklist in generated outputs?

1. No (skip)
2. STROBE (observational studies)
3. CONSORT (randomized trials)
4. PRISMA (systematic reviews)
5. TRIPOD+AI (prediction models)
```

Store the selection as `stack_profile.reporting_checklist` when a guideline is selected. Leave it absent when the user selects "No". Store any layered guideline extensions as `stack_profile.reporting_checklist_extensions`.

### Step 10: Save Config

Resolve the repository root (`git rev-parse --show-toplevel`). All paths are relative to the repo root.

Build the YAML content from the collected answers. Only include non-null values. Write to `<repo-root>/.ce-datascience/config.local.yaml`, creating the directory if needed.

If a verified `detected_connection` was accepted in Step 4, include it under `stack_profile.data_connection`. Do not write the connection into `data_root`.

If `clif_profile_active=true`, include:

```yaml
stack_profile:
  profile: clif
  clif:
    data_dictionary_version: "2.1.0"
```

Persist the language-detection block gathered in Phase 0.5:

```yaml
language_detect:
  primary: <python|r|both|unknown>
  secondary: <python|r|null>
  source: <auto|cached|manual>
```

If `.ce-datascience/config.local.yaml` is not already covered by `.gitignore`, offer to add the entry:

```text
.ce-datascience/*.local.yaml
```

Display the saved config summary:

```
Stack profile saved to .ce-datascience/config.local.yaml

  Language:    python
  IDE:         vscode
  Libraries:   pandas
  Data layer:  parquet
  Connection:  n/a
  Stats:       scipy, statsmodels
  Env manager: venv
  R project:   n/a
  Reporting:   jupyter
  Checklist:   STROBE

Run this setup skill anytime to modify.
```

After saving, emit:

```
__CE_LANG__ primary=<python|r|both|unknown> secondary=<python|r|null> source=<auto|cached|manual>
```

## Phase 2: Environment Health Check

### Step 10: Run Diagnostics

Display: "ce-datascience -- checking your environment..."

Run the bundled health check script:

```bash
bash scripts/check-health
```

Script reference: `scripts/check-health`

If `$ARGUMENTS` contains `--locked-down` or `--no-install`, run:

```bash
bash scripts/check-health --locked-down
```

Display the script's output to the user.

### Step 11: Evaluate Results

**Platform detection (pre-resolved):** !`[ -n "${CLAUDE_PLUGIN_ROOT}" ] && echo "CLAUDE_CODE" || echo "OTHER"`

After the diagnostic report, check whether:

- recommended tools or project checks are reported in the bottom-line issue count
- optional tools are reported as yellow but do not require Phase 3 unless the chosen workflow needs them
- `.ce-datascience/config.local.yaml` does not exist or is not safely gitignored

If everything is installed and config is present:

```
 ✅ ce-datascience setup complete

    Language:    python
    IDE:         vscode
    Reporting:   jupyter
    Env manager: venv
    Config:      ✅

    Run setup anytime to reconfigure.
```

If this is a Claude Code session (resolved to `CLAUDE_CODE`), append: "Run /ce-update to grab the latest plugin version."

If issues were found, proceed to Phase 3.

## Phase 3: Fix Missing Dependencies

### Step 12: Offer Installation

If `$ARGUMENTS` contains `--locked-down` or `--no-install`, do not offer
installation. Instead, show:

```
Corporate/no-install mode is active. I will not run package-manager commands.

Required for basic setup:
  - Python 3 only if you want MCP tools or Python analysis helpers
  - R only if this project uses R workflows

Optional:
  - Quarto only for Quarto manuscript/render output
  - gh only for GitHub issue/PR helpers
  - Bun and Git only for contributing to or rebuilding the plugin from source

Use an approved local plugin folder or ZIP for Claude Code:
  claude --plugin-dir /approved/path/ce-datascience
  claude --plugin-dir /approved/path/ce-datascience.zip

Use the namespaced plugin commands in Claude Code:
  /ce-datascience:ce-setup
  /ce-datascience:ce-workflow

If your team installed optional local aliases, bare commands such as /ce-setup
also work, but they are local .claude/commands files rather than native plugin
commands.
```

Then jump to Step 14. Do not present install choices and do not execute
installer commands.

Present missing recommended tools using a multiSelect question with all items pre-selected. Use the install commands from the script's diagnostic output. Include Quarto only when the user selected Quarto manuscript/render output.

```
The following tools are missing. Select which to install:
(All items are pre-selected)

  [x] R - R language runtime
  [x] python3 - Python 3 runtime
  [x] quarto - Quarto CLI for literate programming
  [x] jq - JSON processor
```

Only show recommended items that are actually missing, plus Quarto when the selected workflow requires Quarto output.

### Step 13: Install Selected Dependencies

For each selected dependency:

1. Show the install command and ask for approval:

   ```
   Install quarto?
   Command: NONINTERACTIVE=1 HOMEBREW_NO_AUTO_UPDATE=1 brew install -q quarto

   1. Run this command
   2. Skip -- install manually later
   ```

2. If approved, run the command. After completion, verify with `command -v <tool>`.

3. If verification succeeds, report success. If it fails or errors, display the project URL as fallback and continue.

### Step 14: Summary

```
 ✅ ce-datascience setup complete

    Installed: quarto, jq
    Skipped:   R

    Run setup anytime to re-check.
```

If this is a Claude Code session, append: "Run /ce-update to grab the latest plugin version."
