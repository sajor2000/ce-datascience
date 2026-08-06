---
name: ce-effect-size
description: "Extract, compute, or pool effect-size evidence to ground power, SAP assumptions, and study justification."
argument-hint: "<path/to/methods.csv>, optional: --metric or|hr|rr|md|smd"
---

# Effect-Size Anchor for Power Calculations


## Skill Value

- **Problem it solves:** SAPs often choose effect assumptions without traceable prior evidence.
- **Use when:** The user needs effect-size assumptions, pilot estimates, pooled estimates, or literature-derived values.
- **Output:** Effect-size summary with sources, assumptions, uncertainty, and downstream SAP/power handoff.
- **Ask only if:** Only when outcome scale, comparison, estimand, or source set is ambiguous.
- **Do not do:** Do not overstate causal interpretation or replace formal meta-analysis when one is required.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Bridges `ce-method-extract` (which collects what prior studies REPORTED) and `ce-power` (which needs a single number to plug in). Without this skill, analysts pick the most favorable prior estimate and over-power; with it, they get a defensible pooled estimate with explicit uncertainty.

## When this skill activates

- After `ce-method-extract` has produced `analysis/pubmed/<query>-methods.csv`
- Before `ce-power` so the effect-size assumption is anchored
- Manual: `ce-effect-size analysis/pubmed/sepsis-bundle-methods.csv --metric hr`

## Prerequisites

- A methods CSV with at minimum: pmid, year, sample_size, effect_size_reported (and ideally lo / hi 95% CI)
- The metric is consistent across studies (all OR, or all HR, etc.) -- if mixed, the skill will subset to the modal metric and report on the rest narratively

## Core workflow

### Step 0: Context inputs (scan chat first)

If no `<path/to/methods.csv>` was passed, scan the most recent ~50 chat turns for `__CE_METHOD_EXTRACT__ csv=<path> n=<int> modal_method=<...>`. If found, use that CSV as the input. Print `[method-extract] using methods table from <path> (n=<N>, modal=<modal_method>)`.

If neither an explicit path nor the signal is present, ask the user to load the `ce-method-extract` skill first or pass a CSV path explicitly.

### Step 1: Load and parse

Read the methods CSV. Parse the `effect_size_reported` field: extract metric type (OR/HR/RR/MD/SMD), point, lo, hi. Use `references/effect-parser.md` patterns. Drop rows where parsing fails; report count of dropped rows.

### Step 2: Filter to comparable studies

Filter:
- `metric` matches `--metric` (or modal-metric if not specified)
- Sample size present and ≥ 50 (smaller studies dominate noise)
- Year within last `--years` window if passed
- Optional: study type filter (e.g., RCTs only)

Report N studies in the meta-analysis vs N in the input.

### Step 3: Pool

If N ≥ 3:
- For OR / HR / RR: log-transform → random-effects REML (use R `meta::metagen` or Python `pymeta`-style direct computation)
- For MD: random-effects REML on the raw scale
- For SMD: Hedges g + REML
- Report: pooled estimate, 95% CI, prediction interval, I^2 heterogeneity, tau^2

If N < 3:
- Report narrative range (min, median, max) -- DO NOT pool
- Highlight the highest-quality study (largest N, most recent, RCT > observational) as the anchor
- Caveat the user: "single-study or two-study power calc is fragile; consider running with sensitivity sweep"

### Step 4: Write the output

`analysis/effect-size/<query>-pooled.md`:

```
# Pooled effect-size: <metric> for <outcome> in <population>

Source: 14 studies extracted via `ce-pubmed` and `ce-method-extract` on <date>
Filtered to: <metric>, sample size >=50, last 10 years -> 9 studies pooled

## Pooled estimate

<metric> = 0.78 (95% CI 0.65-0.93; 95% PI 0.52-1.17)
I^2 = 42% (moderate heterogeneity)
tau^2 = 0.04

## Forest plot

See `analysis/effect-size/<query>-forest.png`

## For `ce-power`

Use point estimate 0.78 with sensitivity sweep across PI bounds (0.52 to 1.17).
Power calc anchor: detect HR <= 0.78 with alpha=0.05, power=0.80.
```

Also save a CSV: `analysis/effect-size/<query>-included.csv` (which studies, why included).

### Step 5: Generate forest plot

Use R `meta::forest()` or Python `matplotlib`. Each study's point and CI; pooled point and CI at the bottom.

### Step 6: Emit signal

The bundled `scripts/pool_effects.R` prints the canonical envelope. REML (k>=3) form:

```
__CE_EFFECT_SIZE__ metric=<m> n_studies=<n> point=<v> ci=<lo,hi> i2=<pct> mode=reml
```

Narrative form (k<3, no pooling):

```
__CE_EFFECT_SIZE__ metric=<m> n_studies=<n> point=null ci=null i2=null mode=narrative
```

Both forms share the same key set so `ce-power` can scan one regex. When `mode=narrative`, `ce-power` should fall back to the user-supplied effect size or stop and ask, rather than try to read `point=null` as a number.

## What this skill does NOT do

- Does not do a full systematic-review meta-analysis (no risk-of-bias scoring, no PRISMA flow); that's a separate study type, use the `ce-checklist-match` skill to register it as PRISMA
- Does not impute missing CIs (drops studies with missing CI rather than guessing)
- Does not handle network meta-analysis (use `netmeta` package directly)
- Does not compute power (that's `ce-power`)

## References

@./references/effect-parser.md

@./references/pooling-formulas.md
