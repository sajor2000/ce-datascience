---
name: ce-effect-size
description: 'Pools effect-size estimates from prior literature into a single defensible assumption for /ce-power. Runs random-effects meta-analysis (REML) when 3+ studies report a comparable metric; produces a narrative range when fewer. Outputs a pooled point estimate + 95% CI + 95% prediction interval + I^2 + tau^2 + forest plot, ready to drop into SAP-2.5 as the power-calc anchor. Use whenever the user mentions effect size pooling, meta-analysis for power calculation, random-effects REML, pooled HR/OR/RR, prior-literature effect size, "what effect size should I assume", forest plot for prior studies, or finishes /ce-method-extract and is heading to /ce-power. Wraps R meta::metagen conventions; not a full systematic-review meta-analysis (no risk-of-bias scoring) -- use PRISMA workflow for that.'
argument-hint: "<path/to/methods.csv>, optional: --metric or|hr|rr|md|smd"
---

# Effect-Size Anchor for Power Calculations

Bridges `/ce-method-extract` (which collects what prior studies REPORTED) and `/ce-power` (which needs a single number to plug in). Without this skill, analysts pick the most favorable prior estimate and over-power; with it, they get a defensible pooled estimate with explicit uncertainty.

## When this skill activates

- After `/ce-method-extract` has produced `analysis/pubmed/<query>-methods.csv`
- Before `/ce-power` so the effect-size assumption is anchored
- Manual: `/ce-effect-size analysis/pubmed/sepsis-bundle-methods.csv --metric hr`

## Prerequisites

- A methods CSV with at minimum: pmid, year, sample_size, effect_size_reported (and ideally lo / hi 95% CI)
- The metric is consistent across studies (all OR, or all HR, etc.) -- if mixed, the skill will subset to the modal metric and report on the rest narratively

## Core workflow

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

Source: 14 studies extracted via /ce-pubmed and /ce-method-extract on <date>
Filtered to: <metric>, sample size >=50, last 10 years -> 9 studies pooled

## Pooled estimate

<metric> = 0.78 (95% CI 0.65-0.93; 95% PI 0.52-1.17)
I^2 = 42% (moderate heterogeneity)
tau^2 = 0.04

## Forest plot

See `analysis/effect-size/<query>-forest.png`

## For /ce-power

Use point estimate 0.78 with sensitivity sweep across PI bounds (0.52 to 1.17).
Power calc anchor: detect HR <= 0.78 with alpha=0.05, power=0.80.
```

Also save a CSV: `analysis/effect-size/<query>-included.csv` (which studies, why included).

### Step 5: Generate forest plot

Use R `meta::forest()` or Python `matplotlib`. Each study's point and CI; pooled point and CI at the bottom.

### Step 6: Emit signal

`__CE_EFFECT_SIZE__ metric=<m> point=<v> ci=<lo,hi> n_studies=<n>` so `/ce-power` can pick up the value.

## What this skill does NOT do

- Does not do a full systematic-review meta-analysis (no risk-of-bias scoring, no PRISMA flow); that's a separate study type, use `/ce-checklist-match` to register it as PRISMA
- Does not impute missing CIs (drops studies with missing CI rather than guessing)
- Does not handle network meta-analysis (use `netmeta` package directly)
- Does not compute power (that's `/ce-power`)

## References

@./references/effect-parser.md

@./references/pooling-formulas.md
