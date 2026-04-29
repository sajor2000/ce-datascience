---
name: ce-power
description: 'Computes sample size / power for the planned study design with a sensitivity sweep across plausible effect sizes. Supports two-sample t, two-proportion, log-rank/Cox (survival), mixed-effects (cluster RCT, repeated measures), TOST equivalence/non-inferiority, and Riley 2018 four-criterion sample size for prediction-model development (uses the pmsampsize R package, not naive EPV ≥ 10). Use whenever the user mentions sample size, power calculation, "how many participants do I need", "is this study powered", a priori power, sensitivity to effect size, EPV, Riley criteria, pmsampsize, sample size for external validation, or any /ce-plan step needing a SAP-2.5 paragraph. Generates a runnable R or Python script + a sensitivity sweep table + a one-page write-up. Reads /ce-effect-size pooled estimates as the effect-size anchor when available.'
argument-hint: "<design>, optional: --effect-size <value> --alpha 0.05 --power 0.80 --side two"
---

# Power and Sample Size

Wraps the standard power calculations behind a single command. Produces a script (so the calculation is reproducible), a sensitivity sweep (so the answer doesn't pretend to be more precise than it is), and a SAP-ready write-up.

## When this skill activates

- During `/ce-plan` SAP drafting after primary outcome is fixed
- After `/ce-method-extract` produces a prior-effect-size estimate
- When a reviewer (peer-review or `ce-methods-reviewer`) flags missing power
- Manual: `/ce-power two-sample-t --effect-size 0.4 --alpha 0.05 --power 0.80`

## Prerequisites

- Primary outcome and outcome type are decided (continuous / binary / time-to-event)
- An effect-size assumption (point estimate; ranges acceptable -- the sweep handles uncertainty)
- For survival: event rate in control arm, follow-up time, anticipated dropout
- For cluster RCT: ICC estimate, expected cluster size

## Core workflow

### Step 1: Pick the formula

| Design | Formula | R | Python |
|--------|---------|---|--------|
| Two-sample t (continuous) | Cohen's d | `pwr::pwr.t.test` | `statsmodels.stats.power.TTestIndPower` |
| Two-proportion (binary) | Chi-square / arcsine | `pwr::pwr.2p.test` | `statsmodels.stats.power.NormalIndPower` |
| Paired t / pre-post | within-subject d | `pwr::pwr.t.test(type="paired")` | `statsmodels.stats.power.TTestPower` |
| Log-rank (survival) | Schoenfeld | `gsDesign::nEvents` or hand-roll | `lifelines.statistics.logrank_test` (post-hoc only) -- use formula directly |
| Cox regression | Hsieh + ANOVA-style | `powerSurvEpi::ssizeCT.default` | manual |
| Cluster RCT | design-effect adjustment | `clusterPower` | manual |
| Mixed-effects (longitudinal) | Liu/Liang | `longpower` | manual |
| Prediction model (development) | EPV >= 10 (or Riley criteria) | `pmsampsize::pmsampsize` | manual |
| Diagnostic accuracy | exact binomial CI on sens/spec | `MKmisc` or hand-roll | `statsmodels.stats.proportion.proportion_confint` |
| Equivalence / NI | TOST | `TOSTER::powerTOSTtwo` | `statsmodels` |
| Multi-arm | Bonferroni-adjusted alpha | as above with α/(k-1) | as above |

### Step 2: Generate the script

Write to `analysis/power/<design>-<date>.R` or `.py`. Include:

- Input parameters as a named list (so they're easy to tweak)
- Single-point calculation with the user-supplied values
- A sensitivity sweep: iterate over a grid of `effect_size`, `power`, `alpha` and tabulate required N for each combination
- A plot (`ggplot2` / `matplotlib`) showing N as a function of effect size for the chosen power

### Step 3: Run and capture

Execute the script (or print it for manual run). Capture stdout to `analysis/power/<design>-<date>.log`. Save the sweep table to `analysis/power/<design>-<date>-sweep.csv` and the plot to `<design>-<date>.png`.

### Step 4: Write the SAP-2.5 paragraph

Generate a 1-paragraph summary at `analysis/power/<design>-<date>-summary.md`:

```
With α = 0.05 (two-sided), power = 0.80, and an assumed effect size of d = 0.40
(based on N comparable studies extracted via /ce-method-extract; range 0.28-0.52),
a two-sample t-test requires 100 participants per arm (200 total). Allowing for
15% loss to follow-up, we will enrol 235 participants. A sensitivity analysis
across d = 0.30 to d = 0.50 yields required total N from 128 to 351; we will
re-evaluate at the 100-enrollee mark via interim conditional power.
```

Reference the prior literature explicitly so the assumption is auditable.

### Step 5: Emit signal

`__CE_POWER__ design=<name> n_per_arm=<n> total=<n> with_dropout=<n>` so `/ce-plan` can drop the value into SAP-2.5 automatically.

## What this skill does NOT do

- Does not run a "post-hoc power" calculation -- that's a statistical anti-pattern
- Does not pick the effect-size assumption for you -- you supply it (or `/ce-method-extract` does)
- Does not guarantee enrollability -- recruitability is a separate concern
- Does not handle complex adaptive designs (group-sequential, Bayesian-decision); for those, hand-roll using `gsDesign` / `rpact` / `BayesianTools` and use this skill only for the write-up

## References

@./references/formula-cheatsheet.md

@./references/sensitivity-sweep-template.R

@./references/sensitivity-sweep-template.py
