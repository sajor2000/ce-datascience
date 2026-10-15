# Missingness pattern guide

A short reference for classifying observed missingness and its implications for SAP-aligned analysis.

## Classifying patterns

Missingness mechanisms are assumptions, not patterns the data can reveal: MAR and MNAR cannot be distinguished from the observed data, and the values that are missing cannot be seen. Classify the observed pattern, then state the assumed mechanism and its justification from design knowledge.

| Pattern / mechanism | What the data can show | Analysis implication |
|---|---|---|
| **MCAR** (assumption) | Cannot be confirmed; Little's test can only reject it | Complete-case unbiased but inefficient. Single mean/median imputation is NOT acceptable: it underestimates variance and distorts associations even under MCAR (van Buuren, *Flexible Imputation of Missing Data*, 2nd ed., §1.3.3) |
| **MAR** (assumption) | Missingness associated with observed variables (supports, never proves, MAR) | Multiple imputation or likelihood-based methods that include the outcome and auxiliary variables. Complete-case regression stays unbiased when missingness depends on covariates only, not on the outcome |
| **MNAR** (assumption) | Not identifiable from observed data | Pre-specify delta-adjusted / pattern-mixture or selection-model sensitivity analyses (tipping point) |
| **Monotone** (pattern) | Once missing, stays missing across visits | Likelihood-based mixed model/MMRM or MI under MAR, plus MNAR sensitivity. Do not use LOCF: it can be biased even under MCAR (van Buuren §1.3.3), and trial guidance rejects single imputation as the primary approach (Little et al., NEJM 2012, PMID 23034025) |
| **Block** (pattern) | Whole form or visit missing for a subset | Document the cause; treat it as a MAR/MNAR question for the affected variables |

## Quick code

R:
```r
# Visualize
naniar::vis_miss(data)
# Pattern matrix
mice::md.pattern(data, plot = FALSE)
# Little's MCAR test: a non-rejection does not establish MCAR
naniar::mcar_test(data)
```

Python:
```python
import missingno as msno
msno.matrix(df)
msno.heatmap(df)  # column co-missingness correlation
# Little's MCAR test (via statsmodels patch or pyampute)
```

## When to STOP and re-extract

- **PHI in extract** (any patient identifier other than de-identified study ID)
- **Block missingness > 20% of rows** (project default) when block is on a primary outcome
- **Distribution shift > 1 SD** vs prior wave (project default; suggests upstream data pipeline change)
- **Plausible MNAR mechanism** (for example, sickest patients drop out; judged from design knowledge, not pattern detection) without a SAP-declared sensitivity strategy

## When to PROCEED with sign-off

- **Single column > SAP threshold** when the variable is secondary, with imputation plan written
- **MAR with conditioning variables observed**, multiple imputation pre-specified
- **Monotone dropout** with documented attrition flow
