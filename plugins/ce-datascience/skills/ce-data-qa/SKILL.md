---
name: ce-data-qa
description: "Run a pre-SAP column profile or GO/NO-GO data quality gate before SAP finalization, modeling, or unblinding."
argument-hint: "[data file path or extract_id, optional --sap path/to/sap.md]"
---

# Data Quality Assessment Gate


## Skill Value

- **Problem it solves:** Analysis can start before grain, keys, missingness, duplicates, dates, and extract validity are understood.
- **Use when:** The user asks to inspect columns, validate a fresh extract, compare data to cohort/SAP expectations, or check readiness.
- **Output:** A data profile or GO/NO-GO QA report plus __CE_DATA_PROFILE__ or data-wave handoff signal.
- **Ask only if:** Only for file paths, intended grain, key fields, or SAP/cohort links that cannot be inferred.
- **Do not do:** Do not certify SAP correctness or run modeling.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

This skill formalizes the data-QA gate that exists between data extraction and SAP/modeling work. **No SAP finalization, coding, or modeling runs until the available data columns and QA status are documented.** A "fail" outcome blocks the pipeline; a "warn" outcome requires PI sign-off; a "pass" outcome unlocks the data lock + modeling phase. When the SAP does not exist yet, run in pre-SAP column profile mode and emit a data profile that `/ce-plan` uses to draft the SAP without inventing variables.

## When This Skill Activates

- A new data wave was just registered via `data_wave_register` (MCP) and downstream code expects to model it
- The SAP shape may have drifted from the data shape (analyst noticed column rename, type change, or value-set expansion)
- Before unblinding for confirmatory analysis (final QA pass against the locked SAP)
- After a re-extract following an EHR query fix
- Manual invocation via `/ce-data-qa` to spot-check a dataset

## Prerequisites

1. A SAP exists at `analysis/sap.md` (or specified via `--sap`) for full SAP-aligned QA. If no SAP exists yet, run pre-SAP column profile mode instead of stopping.
2. A stack profile has been written via the `ce-setup` skill so `data_root` is known.
3. The data extract is registered as a data wave (run `data_wave_register` MCP tool first if not).
4. If the dataset is a research cohort built from EHR or claims data, run `/ce-cohort-build` first — the CONSORT waterfall it produces is the starting point for the row-count check in step 3 below. When `__CE_COHORT__` appears in chat context or `analysis/cohort/<name>-waterfall.csv` exists, use it as the expected-N source instead of re-deriving from the SAP.

## Core Workflow

### Step 0: Choose QA mode

If a SAP is available, run **SAP-aligned QA mode** and compare the data to SAP-declared variables, populations, missingness rules, and analysis windows.

If no SAP is available, run **pre-SAP column profile mode**:

- Inspect the dataset or table schema before `/ce-plan` writes SAP variable/model sections.
- Produce row count, column count, column names and types, candidate grain, primary or candidate keys, important date columns, timezone assumptions, null rates, duplicate rates, distinct counts for categorical columns, and basic numeric summaries.
- Flag obvious validity issues such as impossible dates, negative counts where not plausible, sentinel missing values, mixed-grain rows, and PHI-suspect columns.
- Do not invent study variables or analysis models. Mark SAP-dependent checks as "deferred until SAP exists."
- Emit `__CE_DATA_PROFILE__` so `/ce-plan` can use the actual columns and state which variables remain provisional.

### Step 1: Resolve the data wave

Read `.ce-datascience/data-state.yaml`. If a specific `extract_id` was passed, use it; otherwise use the most recently registered, unlocked wave. Refuse to QA a `locked` wave unless `--force` is passed (locked waves are immutable; QA already passed).

### Step 2: Parse the SAP for shape expectations

Skip SAP parsing in pre-SAP column profile mode. Instead, treat the observed column profile as planning evidence and label all SAP-dependent thresholds as pending.

Extract from the SAP:
- **Population size**: expected N from inclusion/exclusion criteria
- **Required variables**: from SAP-2 (Variables) section
- **Variable types**: continuous / categorical / time-to-event
- **Value sets for categoricals**: e.g., `sex: {M, F}`, `treatment: {placebo, drug}`
- **Date variables**: enrollment, randomization, event, censor
- **Missingness rule**: e.g., "≤ 5% missing per primary outcome variable"

If the SAP doesn't specify these, output a `WARN: SAP under-specified` finding and proceed with looser defaults.

### Step 3: Run the QA checks

**CLIF profile**: when chat context contains `__CE_CLIF__ active=true`, additionally run the CLIF-specific gate before the generic checks. Treat `https://clif-icu.com/` and the `version=` value in the CLIF handoff as the authoritative data dictionary source.

- **Storage check**: refuse to QA non-Parquet inputs for CLIF tables; emit a `block` finding if asked to QA CSV/Feather data declared as CLIF.
- **ID type check**: `patient_id` and `hospitalization_id` are VARCHAR — `block` if cast to int.
- **Datetime check**: every `*_dttm` column is timezone-aware UTC — `block` if any tz-naive timestamps exist.
- **mCIDE vocabulary check**: every `*_category` column conforms to the declared CLIF data dictionary and mCIDE allow-list. Each violation is a `block` (or `warn` when `strict=false` was set on `__CE_CLIF__`).
- **Outlier-handling check**: physiologic ranges follow `outlier-handling/` thresholds when present; `warn` on out-of-range, never silently clip.
- **PHI guard**: free-text columns (`*_name`, `clinical_notes_text`, raw `discharge_name`) are not echoed in the report — replace with a count + sample-of-distinct-after-mask.
- **Canonical implementation**: prefer upstream CLIF tooling when available. `__CE_LANG__ primary=python` -> use `clifpy`'s `ClifOrchestrator` DQA path. `__CE_LANG__ primary=r` -> use the CLIF project-template QC and outlier-handler pattern. If `__CE_LANG__` is absent, run `/ce-language-detect`; if still `unknown`, surface both implementations. Roll your own only when neither applies.

### Causal workflow integrity checks (Python data stacks)

For Python/Pandas/Polars/DuckDB workflows that prepare a causal analysis dataset, run QA-17 through QA-23 in addition to the generic checks. Preserve the risk-based gate: confirmed integrity failures are `block`; ambiguous methodological or stack-specific risks are `warn` and require analyst resolution. Never substitute synthetic or fallback data silently. Treat Polars, DuckDB, and large eager-load concerns as warnings unless the run confirms an integrity violation.

Apply each check from `references/qa-checks.md` against the data. Generate findings into one of these buckets:

| Bucket | Meaning | Effect on gate |
|--------|---------|----------------|
| `block` | Row count, key, type, or value-set violation that makes modeling impossible or unsafe | NO-GO |
| `warn` | Missingness above expected threshold, distribution shift, suspected outlier cluster | Require PI sign-off |
| `info` | Cosmetic (column order, label drift) | No effect |
| `pass` | Check ran cleanly | No effect |

### Step 4: Generate the report

Write to `reports/data-qa/<extract_id>.md` (markdown) and `reports/data-qa/<extract_id>.html` (rendered Quarto / RMarkdown). Use `references/report-template.md`. Sections:

1. **Summary banner** (GO / NO-GO / GO with PI sign-off)
2. **Column profile**: row count, column count, names/types, candidate grain, candidate keys, date columns, null rates, duplicate rates
3. **Wave provenance**: extract_id, source, hash, row count, ingestion date
4. **CONSORT/STROBE flow**: enrollment → eligibility → analysis populations, when available
5. **Missingness map**: heatmap (or fallback table), per-variable %
6. **Findings table**: bucket × check × variable × details
7. **Sign-off block**: empty, for PI to fill if `warn` bucket non-empty

If any `warn` finding requires PI approval, add the report path and finding summary to the project signoff ledger used by `/ce-review-pack`. Data-QA approval must remain separate from the data lock; the ledger records human acceptance of warnings, not permission to mutate locked data.

### Step 5: Emit GO/NO-GO and update data state

Always emit a unified handoff signal that `/ce-plan` SAP mode reads (and a legacy GO/NO-GO line for backward compatibility):

```
__CE_DATA_PROFILE__ dataset=<path-or-wave> rows=<n> columns=<n> grain=<candidate-grain-or-unknown> report=<path>
__CE_DATA_QA__ wave=<id> pass=<true|false> blockers=<n> warns=<n> report=<path>
```

In pre-SAP column profile mode, `pass=true` means no structural blockers were found in the profile; it does not mean SAP-specific checks have passed. If GO (`pass=true`): also emit `__CE_DATA_QA_PASS__ extract_id=<id>` and prompt the user to run `data_lock` (MCP) only after SAP-aligned QA is complete. If NO-GO (`pass=false`): also emit `__CE_DATA_QA_FAIL__ extract_id=<id> blockers=<count>` and stop. Print the path to the report.

### Step 6: Compound learning hook

If any `block` or `warn` finding fires AND the same finding pattern appeared on a prior extract (lookup via `ce-learnings-researcher` for `problem_type: data_quality_issue`), suggest `/ce-compound` to capture the pattern. Use the heuristic: same variable + same check + ≥ 2 occurrences across studies = compound-worthy.

## Pipeline mode

When invoked from an automated workflow (LFG-style, headless `ce-work`, or any `disable-model-invocation` context), skip the user prompts and emit only the structured signals. The report file is still written.

## What This Skill Does NOT Do

- **It does not modify the data.** This is a read-only assessment. Cleaning is a separate `ce-work` task.
- **It does not lock the data.** Locking requires explicit user confirmation via the `data_lock` MCP tool.
- **It does not check SAP correctness.** That's `ce-sap-drift-detector` (which now also covers amendments). We check data-vs-SAP shape consistency only.
- **It does not run statistical models.** No fits, no tests, no inferential output. Descriptive only.

## References

@./references/qa-checks.md

@./references/report-template.md

@./references/missingness-patterns.md
