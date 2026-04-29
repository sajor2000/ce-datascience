---
name: ce-clif
description: 'Activates a CLIF-safe profile for Common Longitudinal ICU data Format consortium repos and CLIF-derived projects. Enforces Parquet-only storage, UTC datetimes, mCIDE vocabulary validation, three-script architecture, and no-PHI output rules. Use when the repo has CLIF_CLAUDE.md, a mCIDE/ directory, clif_*.parquet files, or a clif-consortium/clif-icu git remote. Does NOT activate for generic EHR, OMOP, or claims projects — those use ce-cohort-build without the CLIF profile.'
argument-hint: "[optional: --version 2.1.1|2.2.0|3.0.0, --strict, --off]"
---

# CLIF-Safe Profile

Loads the CLIF (Common Longitudinal ICU data Format) ruleset whenever a session is operating against a CLIF consortium repo or a CLIF-derived project. The goal is simple: when a user is doing CLIF work, the rest of the `ce-*` lifecycle should automatically respect CLIF schema, vocabularies, project layout, and PHI rules instead of treating CLIF like a generic Parquet dataset.

## When this skill activates

Auto-activate when **two or more** of the following signals are present (single signals are too generic to distinguish CLIF from other EHR projects):

**Strong signals (any ONE of these alone is sufficient):**
- A file named `CLIF_CLAUDE.md` exists at the repo root or `~/CLIF_CLAUDE.md`
- Git remote URL contains `clif-consortium`, `Common-Longitudinal-ICU-data-Format`, or `clif-icu`
- The user explicitly says "CLIF", "mCIDE", "clif-icu", or "common longitudinal icu data format"
- Manual: `/ce-clif` (forces activation)

**Weak signals (require 2+ to activate — individually these appear in non-CLIF projects):**
- A `mCIDE/` directory exists
- `WORKFLOW.md` exists at the repo root
- Files named `clif_*.parquet` exist (e.g., `clif_vitals.parquet`, `clif_respiratory_support.parquet`)
- Code references CLIF-specific table names: `respiratory_support`, `medication_admin_continuous`, `patient_assessments`, `intake_output`
- `config/config.json` contains a `tables_path` field pointing to parquet files

**NOT activation signals (too generic — appear in OMOP, custom EHR, and non-CLIF projects):**
- `patient.parquet` alone (OMOP has `person`, but custom EHR may use `patient`)
- `hospitalization` alone (generic term)
- `vitals` or `labs` alone (generic terms)
- `renv.lock` alone (any R project)
- `WORKFLOW.md` alone (any project with a workflow doc)
- `adt` alone (ADT feeds exist outside CLIF)

When signals are ambiguous (only weak signals, or the user mentions a CLIF table name in a non-CLIF context), ask one question before activating:

> "Detected possible CLIF signals but this may not be a CLIF project. Is this a CLIF consortium or CLIF-derived project?"

`/ce-clif --off` forces deactivation for the session.

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
