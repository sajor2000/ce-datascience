---
name: ce-data-qa
description: 'Runs a structured data-quality gate on a freshly extracted dataset BEFORE any modeling code runs and emits a GO/NO-GO verdict. Produces row-counts vs the CONSORT-flow waterfall, missingness pattern vs the SAP rule, range checks, duplicate-key checks, date sanity, and category-value validation. Use whenever the user mentions data quality, data QA, GO/NO-GO, "is the data clean", "check the dataset before modeling", missingness check, range check, duplicate IDs, CONSORT flow vs raw rows, SAP-vs-data shape drift, "the data looks off", a fresh data extract / re-extract / data wave, or unblinding readiness for confirmatory analysis. Required gate after /ce-cohort-build and before any /ce-work modeling task; refuses to run on a locked data wave without --force.'
argument-hint: "[data file path or extract_id, optional --sap path/to/sap.md]"
---

# Data Quality Assessment Gate

This skill formalizes the data-QA gate (workflow step 5) that exists between data extraction and any modeling. **No modeling code runs until this gate passes.** A "fail" outcome blocks the pipeline; a "warn" outcome requires PI sign-off; a "pass" outcome unlocks the data lock + modeling phase.

## When This Skill Activates

- A new data wave was just registered via `data_wave_register` (MCP) and downstream code expects to model it
- The SAP shape may have drifted from the data shape (analyst noticed column rename, type change, or value-set expansion)
- Before unblinding for confirmatory analysis (final QA pass against the locked SAP)
- After a re-extract following an EHR query fix
- Manual invocation via `/ce-data-qa` to spot-check a dataset

## Prerequisites

1. A SAP exists at `analysis/sap.md` (or specified via `--sap`). The SAP is the source of truth for what the data should look like.
2. A stack profile has been written via `/ce-setup` so `data_root` is known.
3. The data extract is registered as a data wave (run `data_wave_register` MCP tool first if not).
4. If the dataset is a research cohort built from EHR or claims data, run `/ce-cohort-build` first — the CONSORT waterfall it produces is the starting point for the row-count check in step 3 below. When `__CE_COHORT__` appears in chat context or `analysis/cohort/<name>-waterfall.csv` exists, use it as the expected-N source instead of re-deriving from the SAP.

## Core Workflow

### Step 1: Resolve the data wave

Read `.ce-datascience/data-state.yaml`. If a specific `extract_id` was passed, use it; otherwise use the most recently registered, unlocked wave. Refuse to QA a `locked` wave unless `--force` is passed (locked waves are immutable; QA already passed).

### Step 2: Parse the SAP for shape expectations

Extract from the SAP:
- **Population size**: expected N from inclusion/exclusion criteria
- **Required variables**: from SAP-2 (Variables) section
- **Variable types**: continuous / categorical / time-to-event
- **Value sets for categoricals**: e.g., `sex: {M, F}`, `treatment: {placebo, drug}`
- **Date variables**: enrollment, randomization, event, censor
- **Missingness rule**: e.g., "≤ 5% missing per primary outcome variable"

If the SAP doesn't specify these, output a `WARN: SAP under-specified` finding and proceed with looser defaults.

### Step 3: Run the QA checks

**CLIF profile**: when chat context contains `__CE_CLIF__ active=true`, additionally run the CLIF-specific gate before the generic checks:

- **Storage check**: refuse to QA non-Parquet inputs for CLIF tables; emit a `block` finding if asked to QA CSV/Feather data declared as CLIF.
- **ID type check**: `patient_id` and `hospitalization_id` are VARCHAR — `block` if cast to int.
- **Datetime check**: every `*_dttm` column is timezone-aware UTC — `block` if any tz-naive timestamps exist.
- **mCIDE vocabulary check**: every `*_category` column conforms to `ce-clif/references/mcide-vocab.md`. Each violation is a `block` (or `warn` when `strict=false` was set on `__CE_CLIF__`).
- **Outlier-handling check**: physiologic ranges follow `outlier-handling/` thresholds when present; `warn` on out-of-range, never silently clip.
- **PHI guard**: free-text columns (`*_name`, `clinical_notes_text`, raw `discharge_name`) are not echoed in the report — replace with a count + sample-of-distinct-after-mask.
- **Canonical implementation**: prefer the upstream DQA implementation when available. `__CE_LANG__ primary=python` -> use `clifpy`'s `ClifOrchestrator.run_dqa()` (see `ce-clif/references/clifpy-recipes.md` §6). `__CE_LANG__ primary=r` -> use the QC and outlier-handler templates in `ce-clif/references/r-template-recipes.md` §6-7. Roll your own only when neither applies.

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
2. **Wave provenance**: extract_id, source, hash, row count, ingestion date
3. **CONSORT flow**: enrollment → eligibility → analysis populations
4. **Missingness map**: heatmap (or fallback table), per-variable %
5. **Findings table**: bucket × check × variable × details
6. **Sign-off block**: empty, for PI to fill if `warn` bucket non-empty

### Step 5: Emit GO/NO-GO and update data state

Always emit a unified handoff signal that `/ce-plan` SAP mode reads (and a legacy GO/NO-GO line for backward compatibility):

```
__CE_DATA_QA__ wave=<id> pass=<true|false> blockers=<n> warns=<n> report=<path>
```

If GO (`pass=true`): also emit `__CE_DATA_QA_PASS__ extract_id=<id>` and prompt the user to run `data_lock` (MCP) to seal the wave. If NO-GO (`pass=false`): also emit `__CE_DATA_QA_FAIL__ extract_id=<id> blockers=<count>` and stop. Print the path to the report.

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
