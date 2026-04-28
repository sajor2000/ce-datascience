# Missingness pattern guide

A short reference for classifying observed missingness and its implications for SAP-aligned analysis.

## Classifying patterns

| Pattern | Visual signature | Likely cause | Imputation safety |
|---------|-----------------|--------------|-------------------|
| **MCAR** (missing completely at random) | salt-and-pepper, no row/column structure | unbiased dropouts, sensor glitches | complete-case OK; mean/median imputation OK |
| **MAR** (missing at random, conditional on observed) | column blocks correlated with another variable | conditional dropout (e.g., follow-up correlates with severity) | multiple imputation OK; complete-case biased |
| **MNAR** (missing not at random) | block missingness in tail of distribution | self-selection (e.g., sickest dropouts) | requires sensitivity analysis with assumed missingness model |
| **Monotone** | once a row goes missing it stays missing across visits | dropout from longitudinal study | LOCF acceptable if attrition is documented; better: pattern-mixture model |
| **Block** | rectangular block — entire form missing for a subset of subjects | data-collection break | document and exclude from primary analysis if scope is form-dependent |

## Quick code

R:
```r
# Visualize
naniar::vis_miss(data)
# Pattern matrix
mice::md.pattern(data, plot = FALSE)
# Test MCAR
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
- **Block missingness > 20% of rows** when block is on a primary outcome
- **Distribution shift > 1 SD** vs prior wave (suggests upstream data pipeline change)
- **MNAR pattern detected** without a SAP-declared sensitivity strategy

## When to PROCEED with sign-off

- **Single column > SAP threshold** when the variable is secondary, with imputation plan written
- **MAR with conditioning variables observed**, multiple imputation pre-specified
- **Monotone dropout** with documented attrition flow
