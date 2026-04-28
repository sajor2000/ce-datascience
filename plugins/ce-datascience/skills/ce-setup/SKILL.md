---
name: ce-setup
description: "Configure data science stack profile and diagnose environment. Prompts for language (R/Python/both), IDE, data libraries, statistical packages, and reporting framework. Detects existing config and offers modification. Use when setting up a new project, switching tools, or troubleshooting environment."
disable-model-invocation: true
---

# Data Science Environment Setup

## Interaction Method

Ask the user each question below using the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini, `ask_user` in Pi (requires the `pi-ask-user` extension). Fall back to presenting each question as a numbered list in chat only when no blocking tool exists in the harness or the call errors (e.g., Codex edit modes) -- not because a schema load is required. Never silently skip or auto-configure. For multiSelect questions, accept comma-separated numbers (e.g. `1, 3`).

Interactive setup for ce-datascience -- configures the stack profile for R/Python data science workflows, diagnoses environment health, and bootstraps project-local config.

## Phase 0: Detect Existing Config

**Config detection (pre-resolved):** !`(top=$(git rev-parse --show-toplevel 2>/dev/null); [ -n "$top" ] && cat "$top/.ce-datascience/config.local.yaml" 2>/dev/null) || (common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); [ -n "$common" ] && cat "$(dirname "$common")/.ce-datascience/config.local.yaml" 2>/dev/null) || echo '__NO_CONFIG__'`

If the line above resolved to valid YAML (not `__NO_CONFIG__`), an existing config was found. Parse the current `stack_profile` values and display them:

```
Existing stack profile detected:
  Language:   python
  IDE:        vscode
  Libraries:  pandas
  Data layer: parquet
  Stats:      scipy, statsmodels
  Reporting:  jupyter

What would you like to do?

1. Modify this profile
2. Start fresh (reconfigure from scratch)
3. Skip profile setup -- run environment check only
```

If the user selects "Modify this profile", proceed to Phase 1 but pre-fill each question with the current value as the default. If "Start fresh", proceed to Phase 1 with no defaults. If "Skip", jump to Phase 2.

If `__NO_CONFIG__`, this is a first-time setup. Display: "No stack profile found. Let's configure your data science environment." Proceed to Phase 1.

## Phase 1: Stack Profile Configuration

Walk through each question in sequence. The answer to each question determines the options shown for subsequent questions.

### Step 1: Language

```
What is your primary analysis language?

1. R
2. Python
3. Both (polyglot projects)
```

Store the selection as `stack_profile.language`.

### Step 2: IDE

Present IDE options relevant to the selected language.

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

### Step 3: Data Libraries

Present library options based on the selected language. Use a multiSelect question.

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

```
What is your primary data storage layer?

1. Parquet files (local or cloud)
2. SQL database (PostgreSQL, SQLite, DuckDB, etc.)
3. Microsoft Fabric / Spark
```

Store the selection as `stack_profile.data_layer`.

### Step 5: Statistical Packages

Present package options based on the selected language. Use a multiSelect question.

For R:
```
Which statistical packages do you use? (select all that apply)

1. stats (base R)
2. survival
3. lme4 (mixed models)
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

### Step 6: Reporting Framework

Present options based on the selected language.

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

### Step 7: Golden Path Check

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

### Step 8: Reporting Checklist (Optional)

```
Enable a reporting guideline checklist in generated outputs?

1. No (skip)
2. STROBE (observational studies)
3. CONSORT (randomized trials)
```

Store the selection as `reporting_checklist.enabled` and `reporting_checklist.guideline`.

### Step 9: Save Config

Resolve the repository root (`git rev-parse --show-toplevel`). All paths are relative to the repo root.

Build the YAML content from the collected answers. Only include non-null values. Write to `<repo-root>/.ce-datascience/config.local.yaml`, creating the directory if needed.

If `.ce-datascience/config.local.yaml` is not already covered by `.gitignore`, offer to add the entry:

```text
.ce-datascience/*.local.yaml
```

Display the saved config summary:

```
Stack profile saved to .ce-datascience/config.local.yaml

  Language:   python
  IDE:        vscode
  Libraries:  pandas
  Data layer: parquet
  Stats:      scipy, statsmodels
  Reporting:  jupyter
  Checklist:  none

Run /ce-setup anytime to modify.
```

## Phase 2: Environment Health Check

### Step 10: Run Diagnostics

Display: "ce-datascience -- checking your environment..."

Run the bundled health check script:

```bash
bash scripts/check-health
```

Script reference: `scripts/check-health`

Display the script's output to the user.

### Step 11: Evaluate Results

**Platform detection (pre-resolved):** !`[ -n "${CLAUDE_PLUGIN_ROOT}" ] && echo "CLAUDE_CODE" || echo "OTHER"`

After the diagnostic report, check whether:

- any tools are missing (reported as yellow in the output)
- `.ce-datascience/config.local.yaml` does not exist or is not safely gitignored

If everything is installed and config is present:

```
 ✅ ce-datascience setup complete

    Language:  python
    IDE:       vscode
    Reporting: jupyter
    Config:    ✅

    Run /ce-setup anytime to reconfigure.
```

If this is a Claude Code session (resolved to `CLAUDE_CODE`), append: "Run /ce-update to grab the latest plugin version."

If issues were found, proceed to Phase 3.

## Phase 3: Fix Missing Dependencies

### Step 12: Offer Installation

Present missing tools using a multiSelect question with all items pre-selected. Use the install commands from the script's diagnostic output.

```
The following tools are missing. Select which to install:
(All items are pre-selected)

  [x] R - R language runtime
  [x] python3 - Python 3 runtime
  [x] quarto - Quarto CLI for literate programming
  [x] jq - JSON processor
```

Only show items that are actually missing.

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

    Run /ce-setup anytime to re-check.
```

If this is a Claude Code session, append: "Run /ce-update to grab the latest plugin version."
