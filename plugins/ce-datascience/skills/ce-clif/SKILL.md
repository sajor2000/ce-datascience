---
name: ce-clif
description: 'Activates a CLIF-safe profile for Common Longitudinal ICU data Format repos (CLIF, mCIDE, clif-icu.com, project-template-derived projects). Enforces Parquet-only storage, timezone-aware UTC datetimes, mCIDE allow-listed category vocabularies, canonical layout (code/, config/, outlier-thresholds/, output/, renv/, utils/), QC -> cohort -> analysis script split, and no-PHI output rules. Treats mCIDE/, ddl/, outlier-handling/, reference_ranges/, WORKFLOW.md as protected paths requiring POC sign-off. Use when the user mentions CLIF/mCIDE/clif-icu or CLIF tables (patient, hospitalization, adt, vitals, labs, respiratory_support, medication_admin_continuous), or when the repo has CLIF_CLAUDE.md / mCIDE/ / WORKFLOW.md. Auto-activates and emits __CE_CLIF__ active=true, and ensures __CE_LANG__ is available via ce-language-detect for language-specific recipe routing.'
argument-hint: "[optional: --version 2.1.1|2.2.0|3.0.0, --strict, --off]"
---

# CLIF-Safe Profile

Loads the CLIF (Common Longitudinal ICU data Format) ruleset whenever a session is operating against a CLIF consortium repo or a CLIF-derived project. The goal is simple: when a user is doing CLIF work, the rest of the `ce-*` lifecycle should automatically respect CLIF schema, vocabularies, project layout, and PHI rules instead of treating CLIF like a generic Parquet dataset.

## When this skill activates

Auto-activate when **any one** of the following signals is present:

- A file named `CLIF_CLAUDE.md` exists at the repo root or `~/CLIF_CLAUDE.md`
- The working directory contains both `WORKFLOW.md` and a `mCIDE/` directory
- The working directory contains a `renv.lock` plus references to CLIF tables (`clif_*` parquet files, `read_parquet("patient.parquet")`, etc.)
- Git remote URL contains `clif-consortium`, `Common-Longitudinal-ICU-data-Format`, or `clif-icu`
- The user mentions CLIF, mCIDE, clif-icu, "common longitudinal icu data format", or a CLIF table by name (`hospitalization`, `respiratory_support`, `medication_admin_continuous`, etc.)
- Manual: `/ce-clif` (forces activation), `/ce-clif --off` (forces deactivation for the session)

When activated, print one acknowledgment line and emit the handoff signal:

```
[ce-clif] CLIF profile active (data dictionary v2.1.1); protected paths read-only without POC sign-off.
__CE_CLIF__ active=true version=2.1.1 strict=<true|false> rules=plugins/ce-datascience/skills/ce-clif/references/clif-rules.md
```

Default `version=2.1.1` (latest stable release of `Common-Longitudinal-ICU-data-Format/CLIF`, January 2026). Override per project via `clif.data_dictionary_version` in `.ce-datascience/config.local.yaml`. Tag `v2.2.0` is obsolete (replaced by v3.0.0). Tag `v3.0.0` is a pre-release (March 2026, multimodal); opt in explicitly if you need it.

When `--off` is passed, emit `__CE_CLIF__ active=false` so downstream skills resume default behavior.

## Prerequisites

None. The skill is a guardrail layer; it reads context but does not require a stack profile.

## Core workflow

### Step 1: Detect or confirm

If auto-detection signals are present, activate silently and print the acknowledgment line. If signals are ambiguous (e.g., user mentions CLIF but is in an unrelated repo), ask one question:

> "Detected CLIF references but the working directory is `<dir>`. Activate CLIF profile for this session?"

### Step 2: Load the rule set and language envelope

Load `references/clif-rules.md` (always), `references/mcide-vocab.md` (when the session touches `_category` columns or vocabulary checks), and `references/poc-table.md` (when an edit or PR is proposed against a protected path).

Then ensure `__CE_LANG__` exists:

- If `__CE_LANG__` is already present in chat context, consume it as-is.
- Otherwise invoke `/ce-language-detect` and use its emitted envelope.
- If detection returns `primary=unknown`, route CLIF code guidance to both recipe files.

### Step 3: Read the project's local override (optional)

If `.ce-datascience/config.local.yaml` contains a `clif:` block, merge it over the defaults. Recognized keys:

```yaml
profile: clif
clif:
  data_dictionary_version: "2.1.1"   # default; latest tagged release (Jan 2026)
  parquet_only: true                  # refuse CSV/Feather for CLIF tables
  protected_paths:                    # in addition to the built-in list
    - mCIDE/**
    - ddl/**
    - outlier-handling/**
    - reference_ranges/**
    - WORKFLOW.md
  poc_table_path: ./CLIF_POCs.md      # optional override; defaults to references/poc-table.md
  strict: true                        # block on any rule violation rather than warn
```

### Step 4: Emit the signal

Other `ce-*` skills check chat context for `__CE_CLIF__ active=true` and `__CE_LANG__ ...` in their step-0 context scan and switch behavior accordingly. This skill never directly modifies the user's repo — it only loads rules and emits the signal(s).

### Step 5: On protected-path edits

When the session is about to edit any `protected_paths` entry, the skill's guardrail runs **before** the edit:

1. Resolve the responsible POC by matching the file path against `references/poc-table.md` (e.g., `mCIDE/respiratory_support/**` -> Nicholas Ingraham, `@ingra107`).
2. Refuse the edit unless the prompt contains a phrase indicating POC authorization, e.g., `POC: @ingra107 approved` or `--poc-approved`.
3. If the user insists without authorization, write the proposed change to `analysis/clif-protected-edits/<timestamp>-<file>.diff` and surface a single-line warning:

   ```
   [ce-clif] BLOCKED: edit to mCIDE/respiratory_support/respiratory_support_mode_categories.csv requires POC sign-off (Nicholas Ingraham, @ingra107). Diff staged at analysis/clif-protected-edits/2026-04-29T18-00-00-respiratory_support_mode_categories.diff
   ```

## What this skill does NOT do

- Does not edit files in the upstream CLIF repo on the user's behalf
- Does not contact POCs (it only cites the right person)
- Does not replace `/ce-data-qa`, `/ce-cohort-build`, etc. — it just changes how those skills behave when CLIF mode is active
- Does not de-identify data or run PHI scans (use `ce-phi-leak-reviewer`)

## Handoff signal (canonical envelope)

```
__CE_CLIF__ active=<true|false> version=<dd-version> strict=<true|false> rules=<path-to-clif-rules.md>
```

Consumers (other `ce-*` skills) parse `active=true` to switch to CLIF behavior; they parse `version=` to know which data dictionary applies; they parse `strict=true` to escalate warnings into refusals.

## Code recipes (drawn from the upstream CLIF org)

When the user is writing CLIF analysis code, surface canonical recipes from the upstream code-of-record packages:

- **Python users** (`__CE_LANG__ primary=python`): load `references/clifpy-recipes.md` — recipes drawn directly from `Common-Longitudinal-ICU-data-Format/clifpy` (`pip install clifpy`). Covers `ClifOrchestrator` setup, `validate_all()`, `compute_sofa_scores()`, `create_wide_dataset()` (hourly resolution), encounter stitching, vitals outlier handling, unit conversion for medications, and the data-quality assessment (DQA) pattern.
- **R users** (`__CE_LANG__ primary=r`): load `references/r-template-recipes.md` — recipes drawn from `Common-Longitudinal-ICU-data-Format/CLIF-Project-Template` (R) and the canonical `code/templates/R/` layout. Covers `renv` bootstrap, `arrow::open_dataset()` reads, the QC → cohort → analysis script split, and `output/` write conventions.
- **`__CE_LANG__ primary=both`** or `unknown`: surface both files so the agent can choose.

## References

@./references/clif-rules.md — Core rules (Parquet-only, UTC datetimes, mCIDE vocab, project layout, PHI rules, three-script architecture)

@./references/mcide-vocab.md — Allow-listed values for every `_category` column across the 16 beta tables, plus pointers to mCIDE CSV sources

@./references/poc-table.md — Mapping from CLIF table / mCIDE subdirectory to its responsible POC (name, email, GitHub handle), used by the protected-path guardrail

`references/clifpy-recipes.md` — Python recipes (ClifOrchestrator, SOFA, wide dataset, validation). Load when generating Python CLIF code.

`references/r-template-recipes.md` — R recipes (arrow, cohort, QC, meta-analysis, propensity, federated). Load when generating R CLIF code.
