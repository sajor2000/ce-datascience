---
name: ce-power
description: "Plan sample size or power assumptions for clinical, observational, survival, and prediction-model studies. Use when the user asks for power, sample size, detectable effect, feasibility, or SAP power section support."
argument-hint: "<design>, optional: --effect-size <value> --alpha 0.05 --power 0.80 --side two"
---

# Power and Sample Size


## Skill Value

- **Problem it solves:** Studies often proceed without transparent detectable-effect, alpha, power, attrition, or endpoint assumptions.
- **Use when:** The user asks for power, sample size, detectable effect, feasibility, or SAP power section support.
- **Output:** Power assumptions and calculation summary with inputs, limitations, and SAP handoff.
- **Ask only if:** Only when design, endpoint type, effect scale, allocation, variance, or event rate is missing.
- **Do not do:** Do not guarantee feasibility when data availability or assumptions are uncertain.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Wraps the standard power calculations behind a single command. Produces a script (so the calculation is reproducible), a sensitivity sweep (so the answer doesn't pretend to be more precise than it is), and a SAP-ready write-up.

## When this skill activates

- During `ce-plan` SAP drafting after primary outcome is fixed
- After `ce-method-extract` produces a prior-effect-size estimate
- When a reviewer (peer-review or `ce-methods-reviewer`) flags missing power
- Manual: `ce-power two-sample-t --effect-size 0.4 --alpha 0.05 --power 0.80`

## Prerequisites

- Primary outcome and outcome type are decided (continuous / binary / time-to-event)
- An effect-size assumption (point estimate; ranges acceptable -- the sweep handles uncertainty)
- For survival: event rate in control arm, follow-up time, anticipated dropout
- For cluster RCT: ICC estimate, expected cluster size
- Each numeric input carries its source: `__CE_EFFECT_SIZE__`, a PMID read through the tools below, or an explicit user assumption

## Evidence access

Read `references/evidence-access.md` before the first literature lookup (PubMed and Paperclip MCP tool names, fallbacks, and evidence rules); never invent a citation, effect size, or guideline item.

- **Look up here:** effect sizes, control-arm event rates, SDs, and ICCs for the anchor come from `__CE_EFFECT_SIZE__` or from a source searched, read, and cited here with its PMID and level read, never from a default; any numeric default that remains (dropout, ICC, allocation) is written as an assumption to replace.

## Core workflow

### Step 0: Context inputs (scan chat first)

If no `--effect-size` argument was passed, scan the most recent ~50 chat turns for `__CE_EFFECT_SIZE__ metric=<m> n_studies=<n> point=<v|null> ci=<lo,hi|null> pi=<lo,hi|NA> i2=<pct|null> mode=<reml|narrative>`.

- If `mode=reml` and `point` is a number, use `point` as the default `--effect-size`. Sweep range: use `pi=lo,hi` (95% prediction interval, the plausible range for a new study) when both bounds are finite numbers; otherwise (`pi=NA`, missing, or non-finite) fall back to `ci=lo,hi`. Print this exact line in the response before any calculation: `[effect-size] anchor from ce-effect-size: point=<v> (n_studies=<n>, I^2=<i2>%); sweep over <PI|CI> <lo>-<hi>; other interval <CI|PI> <lo>-<hi|not available>`.
- The signal carries numbers only. The PMIDs/DOIs behind it are in `analysis/effect-size/<query>-included.csv` (written by `ce-effect-size` next to `<query>-pooled.md`); read that file for the SAP-6 citation, and write `PMIDs: see <path>` only when it is absent, never a guessed list.
- If the sweep interval crosses the null (HR/OR/RR = 1, MD/SMD = 0), required N is unbounded near it: sweep only the side containing `point`, stop short of the null, and state the truncation.
- If `mode=narrative` (or `point=null`), do NOT silently fall back to a single anchor. Surface the narrative range to the user and ask for an explicit effect-size assumption, or stop and recommend the user load the `ce-effect-size` skill again with more studies.

When `__CE_EFFECT_SIZE__` is absent and `--effect-size` is also absent, ask the user for the effect-size assumption, recommend `ce-method-extract` + `ce-effect-size` first, or look up a comparable prior study with the Evidence access tools, read it, and cite its PMID at the level read. Never substitute a conventional default such as d = 0.5 or a control rate from memory; the same applies to event rates and SDs.

### Step 1: Pick the formula

| Design | Formula | R | Python |
|--------|---------|---|--------|
| Two-sample t (continuous) | Cohen's d | `pwr::pwr.t.test` | `statsmodels.stats.power.TTestIndPower` |
| ANCOVA on a baseline covariate | t-test N × (1 - ρ²) | `pwr::pwr.t.test`, then deflate | as t-test, then deflate |
| Two-proportion (binary) | Chi-square / arcsine | `pwr::pwr.2p.test` | `statsmodels.stats.power.NormalIndPower` |
| Paired t / pre-post | within-subject d | `pwr::pwr.t.test(type="paired")` | `statsmodels.stats.power.TTestPower` |
| Log-rank (survival) | Schoenfeld events (then events -> N) | `gsDesign::nEvents(hr, alpha = 0.025, beta = 0.2, sided = 1)` (defaults are one-sided 0.025, power 0.90); `gsDesign::nSurv` for N with accrual and dropout | `lifelines.statistics.sample_size_necessary_under_cph` / `power_under_cph` |
| Cox regression, non-binary covariate | Hsieh-Lavori (events / (1 - R²)) | `powerSurvEpi::ssizeEpiCont.default` | manual (formula in cheatsheet) |
| Cluster RCT (parallel) | design effect, unequal-size correction | `clusterPower` | manual (formula in cheatsheet) |
| Stepped-wedge cluster RCT | Hussey-Hughes | `swCRTdesign::swPwr` | manual |
| Mixed-effects (longitudinal) | Liu/Liang | `longpower` | manual |
| Prediction model (development) | Riley criteria (EPV >= 10 alone is too lenient) | `pmsampsize::pmsampsize` | manual |
| Diagnostic accuracy | exact binomial CI on sens/spec | `MKmisc` or hand-roll | `statsmodels.stats.proportion.proportion_confint` |
| Non-inferiority | one one-sided test against margin M, one-sided α = 0.025 | `pwr::pwr.t.test(d = (M + true_diff)/sd, sig.level = 0.025, alternative = "greater")` | `TTestIndPower(..., alternative="larger")` |
| Equivalence | TOST, one-sided α = 0.025 at each margin | `TOSTER::power_t_TOST` (replaces deprecated `powerTOSTtwo`) | manual (formula in cheatsheet); statsmodels `ttost_ind` analyses but has no TOST power solver |
| Multi-arm vs shared control | Bonferroni α/(k-1) (conservative) or Dunnett | as above with α/(k-1); simulation for Dunnett | as above |

### Step 2: Generate the script

Write to `analysis/power/<design>-<date>.R` or `.py`. Include:

- Input parameters as a named list (so they're easy to tweak)
- Single-point calculation with the user-supplied values
- A sensitivity sweep: iterate over a grid of `effect_size`, `power`, `alpha` and tabulate required N for each combination
- A plot (`ggplot2` / `matplotlib`) showing N as a function of effect size for the chosen power

### Step 3: Run and capture

Execute the script (or print it for manual run). Capture stdout to `analysis/power/<design>-<date>.log`. Save the sweep table to `analysis/power/<design>-<date>-sweep.csv` and the plot to `<design>-<date>.png`.

Completion check: recompute the point estimate with the closed-form formula in `references/formula-cheatsheet.md`. Script and formula must agree within 2% (t vs z); otherwise stop and report the discrepancy. Round every N up (`ceiling`) at each step: per arm, then total, then dropout inflation.

### Step 4: Write the SAP-6 paragraph

Generate a 1-paragraph summary at `analysis/power/<design>-<date>-summary.md`. When the anchor came from `ce-effect-size`, name the interval swept (PI or CI) and report the other one:

```
With α = 0.05 (two-sided), power = 0.80, and an assumed effect size of d = 0.40
(based on N comparable studies extracted via `ce-method-extract`, PMIDs ...; range 0.28-0.52),
a two-sample t-test requires 100 participants per arm (200 total). Allowing for
15% loss to follow-up (assumption; replace with the site's observed rate), we will enrol 236 participants. A sensitivity analysis
across d = 0.30 to d = 0.50 yields required total N from 128 to 352 before attrition.
No interim efficacy or sample-size re-estimation analysis is planned.
```

Reference the prior literature explicitly by PMID/DOI with the level read so the assumption is auditable, and label every remaining default (dropout, ICC, allocation) as an assumption. Choose the target difference as both clinically important and realistic (DELTA2 guidance, Cook et al. BMJ 2018;363:k3750, PMID 30560792); a pooled literature estimate is an upper bound on a realistic target because published effects are selected. Do not promise an interim look or sample-size re-estimation: any adaptation needs a prespecified, type-I-error-controlling design (route to `ce-trial-design` for two-arm group-sequential designs).

### Step 5: Emit signal

Print one line so `ce-plan` SAP mode can drop the value into SAP-6 (Sample Size and Power) automatically. Required keys: `design`, `total`, `file`. Optional keys for specific designs: `n_per_arm` (two-arm), `with_dropout` (any), `epv` (prediction-model).

```
__CE_POWER__ design=<name> total=<n> file=<path-to-summary.md> n_per_arm=<n> with_dropout=<n>
```

The bundled `scripts/pmsampsize_runner.R` (prediction-model development path; needs R with CRAN `pmsampsize`) emits the same envelope when `--out` is passed with `design=prediction-model` and `n_per_arm=null`, plus the `epv=<n>` field. Both forms parse against the canonical contract in `ce-plan` SAP mode. Binary example (`--type s` and `--type c` inputs are in the script header):

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
Rscript "$SKILL_DIR/scripts/pmsampsize_runner.R" --type b --csrsquared 0.15 --parameters 30 --prevalence 0.18 --out analysis/power/prediction-model-sample-size.md
```

The sweep templates listed under References are starting points: copy one to `analysis/power/`, edit `params`, and run it from the project root. Neither installs anything: the R template stops if `pwr` or `ggplot2` is missing, and the Python one stops if `matplotlib numpy pandas statsmodels` are missing. Install only with the user's approval.

## What this skill does NOT do

- Does not run a "post-hoc power" calculation -- that's a statistical anti-pattern
- Does not pick the effect-size assumption for you -- you supply it (or `ce-method-extract` does)
- Does not guarantee enrollability -- recruitability is a separate concern
- Does not handle Bayesian-decision, platform, enrichment, or response-adaptive designs
- For two-arm group-sequential superiority designs, route to `ce-trial-design`, which wraps version-pinned `rpact` or `gsDesign` output in an auditable scenario/frontier workflow without reimplementing the engine mathematics

## References

@./references/formula-cheatsheet.md

Sweep templates (copy, edit `params`, run from the project root): `references/sensitivity-sweep-template.R`, `references/sensitivity-sweep-template.py`.
