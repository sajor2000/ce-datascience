---
name: ce-verify
description: "Run a lightweight mid-workflow verification gate for sample size, leakage, effect direction, missingness, PHI, figures, and reproducibility."
argument-hint: "[optional: path to specific output file or directory to verify]"
---

# Analysis Verification Gate


## Skill Value

- **Problem it solves:** Analysis errors are cheaper to catch between steps than at final manuscript or code review.
- **Use when:** The user finishes an analysis step or wants a quick sanity check before marking work done.
- **Output:** Pass/fail verification notes with blockers and recommended fixes.
- **Ask only if:** Only when target output, SAP section, or expected direction cannot be inferred.
- **Do not do:** Do not replace full code review, reporting-checklist review, or data QA.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Quick mid-workflow sanity check on analysis outputs. Distinct from the reporting checklist (`ce-checklist-match` + `ce-reporting-checklist-reviewer`) which fires at manuscript time — this skill catches errors during analysis execution.

## Stack Profile

The repository root is pre-resolved at skill load:
!`git rev-parse --show-toplevel 2>/dev/null || true`

Use the resolved absolute path or resolve it at runtime, then read `.ce-datascience/config.local.yaml` with the native file-read tool. In a linked worktree, fall back to the main checkout when the machine-local file is absent. Parse `language`, `data_root`, and `reporting`; if no config can be read, infer them from project files.

## Input

<verify_input> #$ARGUMENTS </verify_input>

If empty, verify all analysis outputs found under `output/`, `analysis/`, and any `data_root` from the stack profile.

## Verification Checks

Run each check from the catalog in `references/check-catalog.md`. Each check produces one of:

- **PASS** — check passed, no action needed
- **WARN** — potential issue, surfaces for human review but does not block
- **FAIL** — definite problem, blocks task completion when invoked by `ce-work`

## Core Workflow

### Step 1: Gather context

Read the stack profile for language and data paths. Check for:
- `analysis/research-question.yaml` — for hypothesis direction check
- `docs/plans/` for a SAP file (file with `sap_version` in frontmatter) — for sample size and imputation checks
- `analysis/data-qa-report.md` — for expected N from the data QA gate
- `analysis/power/` — for minimum sample size from power calculation
- `analysis/signoff/signoff-ledger.json` — for unresolved human signoffs surfaced by `ce-review-pack`
- `__CE_CLIF__ active=true` in context — for CLIF-specific checks

### Step 2: Run check catalog

Execute each applicable check from `references/check-catalog.md`. Skip checks that don't apply (e.g., skip leakage scan if no train/test split exists; skip figure quality if no figures found).

### Step 3: Emit verification report

```
## Verification Report

 1. [PASS] Sample size: N=8,234 matches cohort definition (data-qa reported N=8,234)
 2. [PASS] No data leakage signals detected
 3. [WARN] Effect direction: OR=0.72 (protective) — hypothesis predicted harmful exposure
 4. [PASS] Missing data: max 3.2% (BMI), within SAP threshold of 5%
 5. [PASS] No PHI detected in output/
 6. [WARN] Figure analysis/figures/fig1.png: legend overlaps data region
 7. [PASS] Seeds set, renv.lock present

Result: 5 PASS, 2 WARN, 0 FAIL
```

### Step 4: Emit signal

```
__CE_VERIFY__ pass=5 warn=2 fail=0 blocking=<true|false>
```

`blocking=true` when any FAIL exists. `ce-work` reads this signal to gate task completion.

## What this skill does NOT do

- Does not replace `ce-data-qa` — that skill runs pre-modeling as a GO/NO-GO gate between extraction and analysis
- Does not replace `ce-checklist-match` or `ce-reporting-checklist-reviewer` — those verify reporting guideline compliance at manuscript time
- Does not replace `ce-review-pack` — that skill builds PI-facing review packets and validates the signoff ledger
- Does not modify analysis files — read-only verification
- Does not run statistical tests — it checks structural properties (sample size, leakage, direction), not analytical correctness

## References

`references/check-catalog.md` — Full catalog of verification checks with pass/warn/fail criteria
