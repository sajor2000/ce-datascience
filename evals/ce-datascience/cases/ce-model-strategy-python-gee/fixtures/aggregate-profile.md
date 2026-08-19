# Synthetic aggregate design profile

- Aim: estimate the population-average association between an outreach program and 30-day follow-up.
- Estimand: marginal adjusted risk difference and risk ratio for follow-up under outreach versus usual care.
- Outcome: binary 30-day follow-up indicator.
- Unit and grain: one eligible encounter row; clinic is the independent cluster.
- Dependence: 4,800 encounters nested within 60 clinics; no repeated patient identifiers.
- Usable counts: 4,800 observations, 1,470 events, 60 clusters, median 78 encounters per clinic.
- Exposure varies within 57 of 60 clinics.
- Prespecified adjustment set and approved columns: baseline follow-up risk (`baseline_followup_risk`), centered age (`age_centered`), and sex (`sex`), all measured before outreach.
- Missingness: multiple imputation with clinic and outcome predictors, performed compatibly with clustered analysis.
- Stack: Python with locked `statsmodels`.

## Frozen evidence map

| Decision | Identifier | Verification | Query provenance |
|---|---|---|---|
| Continuous clustered-outcome GEE versus LMM comparison | PMID 35838059 | abstract | PubMed query `GEE LMM marginal association clustered continuous`, 2026-08-19 |
| Marginal longitudinal binary risk-ratio modeling with GEE | PMID 36919082 | abstract | PubMed query `GEE marginal risk ratio longitudinal binary`, 2026-08-19 |
| GLMM implementation context | PMID 19185386 | abstract | PubMed query `generalized linear mixed models practical guide`, 2026-08-19 |
