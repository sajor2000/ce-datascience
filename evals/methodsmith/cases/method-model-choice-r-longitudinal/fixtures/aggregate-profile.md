# Synthetic aggregate design profile

- Aim: estimate the adjusted mean difference in 12-month symptom trajectory by treatment.
- Estimand: conditional treatment-by-time difference in mean score at months 3, 6, and 12.
- Outcome: continuous symptom score, range 0-40.
- Unit and grain: one subject-visit row; subject is the independent sampling unit.
- Dependence: repeated visits within 180 subjects at 4 planned visits.
- Usable counts: 684 observations, 180 subjects, 4 visits; 168 subjects have at least 3 visits.
- Aggregate QA: subject-visit keys are unique; treatment has 90 intervention and 90 reference subjects; visit values are 0, 3, 6, and 12 months.
- Within-subject predictor: months since baseline varies within every subject.
- Scientific heterogeneity: subject-specific baseline and change rates are plausible.
- Prespecified adjustment set: baseline symptom score, centered age, and sex, all measured before treatment; no post-treatment covariates.
- Contrasts and multiplicity: intervention minus reference at months 3, 6, and 12; two-sided alpha 0.05 with Holm adjustment.
- Missingness: likelihood analysis under MAR with an approved delta-adjusted pattern-mixture sensitivity using deltas -2, -1, 0, 1, and 2 symptom points.
- Stack: R with locked `lme4` 1.1-37, `emmeans` 1.11.2, and `mice` 3.18.0; package installation is prohibited.

## Frozen evidence map

| Decision | Identifier | Verification | Query provenance |
|---|---|---|---|
| Longitudinal LMM workflow | PMID 35521689 | abstract | PubMed query `longitudinal linear mixed model tutorial`, 2026-08-19 |
| Random-slope omission | PMCID PMC2657178 | full_text | PubMed seed plus Paperclip PMC verification, 2026-08-19 |
| Random-intercept/slope power assumptions | PMCID PMC9156336 | full_text | PubMed seed plus Paperclip PMC verification, 2026-08-19 |
