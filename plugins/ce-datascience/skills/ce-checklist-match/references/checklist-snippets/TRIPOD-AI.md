# TRIPOD+AI Checklist (Prediction Models, AI extension)

For prediction-model studies, including ML/AI-based models. The 2024 TRIPOD+AI extension covers items the original TRIPOD did not address (algorithmic fairness, calibration on subgroups, dataset shift, model card).

| # | Section | Item | Status | Note |
|---|---------|------|--------|------|
| 1 | Title/Abstract | Identify the study as a prediction-model study; state model type | ☐ | |
| 2 | Background | Background, rationale; type of model and intended use | ☐ | |
| 3 | Source of data | Source of data, eligibility criteria, study dates | ☐ | |
| 4 | Participants | Setting, eligibility, treatment received | ☐ | Use `/ce-cohort-build` |
| 5 | Outcome | Outcome to be predicted, including how/when assessed | ☐ | |
| 6 | Predictors | Predictors used, how/when measured | ☐ | |
| 7 | Sample size | How the study size was determined | ☐ | Use `/ce-power` |
| 8 | Missing data | How missing data were handled | ☐ | |
| 9 | Statistical methods | All steps: feature selection, hyperparameter tuning, validation strategy | ☐ | |
| 10 | Risk groups | If applicable, definition of risk groups | ☐ | |
| 11 | Development vs validation | Internal / external validation strategy | ☐ | |
| 12 | Algorithmic fairness | Performance by sex, race, age, hospital, payer | ☐ | Use `ce-fairness-reviewer` |
| 13 | Calibration | Calibration plot, Brier score, ICI | ☐ | Use `ce-calibration-reviewer` |
| 14 | Dataset shift | Plan for monitoring or detecting concept drift | ☐ | Use `ce-concept-drift-reviewer` |
| 15 | Discrimination | C-statistic, AUC with CI; comparison to existing models | ☐ | |
| 16 | Model card | Mitchell-style model card published with the study | ☐ | Use `/ce-model-card` |
| 17 | Code and data | Reproducibility: where the code and (de-identified) data live | ☐ | |
| 18 | Funding | Sources of funding and role of funders | ☐ | |
| 19 | Conflicts of interest | Including industry partnerships in dataset/algorithm provision | ☐ | |
| 20 | Ethics | IRB / ethics approval, consent or waiver | ☐ | |
| 21 | Decision-curve analysis | Net benefit at clinically relevant thresholds | ☐ | |
| 22 | Subgroup performance | Performance reported by clinically relevant subgroups | ☐ | |
| 23 | Data leakage check | Statement that no train-test contamination occurred | ☐ | Use `ce-data-leakage-reviewer` |
| 24 | Human-in-the-loop | If clinical deployment, who reviews predictions | ☐ | |
| 25 | Update plan | When and how the model will be re-validated | ☐ | |
