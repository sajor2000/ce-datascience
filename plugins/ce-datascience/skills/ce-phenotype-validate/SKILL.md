---
name: ce-phenotype-validate
description: 'Validates an EHR-derived phenotype algorithm against a chart-review gold standard. Computes PPV, NPV, sensitivity, specificity, F1, and Cohen kappa with Wilson 95% confidence intervals (better small-sample behavior than Wald) overall and stratified by sex/age/race/site. Use whenever the user mentions phenotype validation, algorithm validation, chart review, gold standard, PPV/NPV/sensitivity/specificity for a phenotype, eMERGE phenotype, PheKB phenotype, computable phenotype, "is my cohort definition accurate", "validate the case definition", or RECORD/RECORD-PE reporting requirement for phenotype performance. Required by RECORD-PE for any pharmacoepi study using an EHR-derived case definition. Emits a report and updates the concept-set provenance YAML.'
argument-hint: "<phenotype name>, <chart-review CSV path>, optional --algorithm-output csv"
---

# Phenotype Algorithm Validation

EHR phenotypes are algorithmic case definitions (e.g., "T2DM = 2+ ICD codes within 12 months OR HbA1c ≥ 6.5% OR T2DM medication"). They drift, they have built-in PPV/sensitivity tradeoffs, and they need explicit validation. This skill runs the validation against a chart-review gold standard.

## When this skill activates

- A new phenotype is defined and used as inclusion / outcome
- A previously-validated phenotype is being applied to a new dataset (re-validate, don't trust)
- Reviewer (`ce-administrative-data-reviewer`) flagged unvalidated phenotype
- Manual: `/ce-phenotype-validate T2DM analysis/cohort/chart-review-T2DM.csv`

## Prerequisites

- A chart-review file (`chart-review-<phenotype>.csv`) with columns: `subject_id`, `chart_label` (0/1 = absent/present per chart adjudication)
- An algorithm output file: same `subject_id`s, with `algo_label` (0/1 = phenotype-not-met / phenotype-met)
- Optional: subgroup columns (`sex`, `age_band`, `race`)

Typical chart-review N: 100-300 patients, sampled in a stratified way (50% algo-positive, 50% algo-negative).

## Core workflow

### Step 1: Load and merge

Inner-join chart-review on `subject_id`. Any subject in one but not the other → flag and drop. Report N matched, N dropped.

### Step 2: Compute the 2x2

| | Chart positive | Chart negative |
|--|----------------|----------------|
| Algo positive | TP | FP |
| Algo negative | FN | TN |

### Step 3: Compute metrics with Wilson 95% CI

- **PPV** = TP / (TP + FP) -- "of those flagged by the algorithm, what fraction are real cases?"
- **NPV** = TN / (TN + FN) -- "of those NOT flagged, what fraction are truly negative?"
- **Sensitivity** = TP / (TP + FN) -- "of the real cases, what fraction does the algorithm catch?" (NOTE: sampled-stratified chart review may bias this; report design)
- **Specificity** = TN / (TN + FP)
- **F1** = 2 * (PPV * Sens) / (PPV + Sens)
- **Cohen's kappa** = agreement-beyond-chance

For each, use Wilson score interval (better small-sample behavior than Wald):

```
p = TP / (TP + FP)
n = TP + FP
z = 1.96
center = (p + z^2 / (2*n)) / (1 + z^2 / n)
half_width = z * sqrt(p*(1-p)/n + z^2 / (4*n^2)) / (1 + z^2/n)
ci = (center - half_width, center + half_width)
```

### Step 4: Per-subgroup validation

Repeat all metrics by subgroup (sex, age band, race, site) when subgroup data is in the chart-review file. Phenotypes often perform very differently across subgroups (e.g., diabetes phenotypes have lower PPV in pediatric populations).

### Step 5: Sample-size-aware reporting

If chart-review N is too small for stable estimates:
- N < 50 in any cell → report estimate but mark "wide CI; consider expanding chart review"
- N < 30 in any subgroup → warn and either pool or omit

### Step 6: Write the report

`reports/phenotype-validation/<phenotype>-<date>.md`:

```
# Phenotype validation: T2DM

## Algorithm
"2+ ICD-10 E11.x within 12 months OR HbA1c >= 6.5% OR T2DM-specific medication"
Source: analysis/cohort/concept-sets/T2DM.yaml (vocab v2024-Q1)

## Chart review
N = 200 (100 algo-positive, 100 algo-negative)
Adjudicators: 2 (with consensus); kappa = 0.91
Sampling: stratified random within algo strata

## Performance overall

| Metric | Estimate | 95% CI |
| PPV | 0.94 | (0.88, 0.97) |
| Sens | 0.86 | (0.78, 0.91) |
| Spec | 0.93 | (0.86, 0.97) |
| NPV | 0.85 | (0.77, 0.91) |
| F1 | 0.90 | -- |

## Performance by subgroup

| Subgroup | N | PPV | Sens |
| Female | 105 | 0.95 | 0.88 |
| Male | 95 | 0.93 | 0.83 |
| 18-44 | 40 | 0.85 | 0.75 |  # narrower CI; flag
| 45-64 | 80 | 0.96 | 0.88 |
| 65+ | 80 | 0.95 | 0.87 |

## Implications for the study

PPV >= 0.90 → bias from misclassified cases is small.
Sensitivity in 18-44 is lower; if the cohort skews young, expect under-ascertainment.
```

Save `reports/phenotype-validation/<phenotype>-<date>.csv` for the cell counts and confusion matrix.

### Step 7: Update the concept set provenance

Add to `analysis/cohort/concept-sets/<phenotype>.yaml`:

```yaml
validation:
  against: <chart-review file>
  date: <ISO>
  ppv: 0.94
  ppv_ci: [0.88, 0.97]
  sens: 0.86
  spec: 0.93
  npv: 0.85
  by_subgroup:
    sex: ...
    age_band: ...
```

### Step 8: Emit signal

`__CE_PHENOTYPE_VALIDATE__ phenotype=<name> ppv=<v> sens=<v> n=<n>`

## What this skill does NOT do

- Does not adjudicate the chart review (that's a human task; this skill assumes the gold-standard labels are given)
- Does not adjust for chart-review sampling design beyond noting stratified sampling
- Does not make the phenotype better -- only measures it
- Does not handle continuous-outcome phenotypes (e.g., HbA1c-as-continuous); restricted to binary phenotype labels

## References

@./references/wilson-ci.md

@./references/sampling-strategies.md
