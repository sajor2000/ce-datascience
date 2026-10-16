# TRIPOD+AI Checklist (Prediction Models Using Regression or Machine Learning)

Current primary checklist for studies developing or evaluating (validating) a clinical prediction model, whether built with regression or machine learning methods: 27 numbered items (52 rows counting lettered sub-items) in eight sections, including the new Open science and Patient and public involvement sections. Item numbers, section headings, and the D/E markers mirror the TRIPOD+AI checklist that `method-review` validates against at review time. Fill each row as the SAP and manuscript develop. TRIPOD+AI supersedes TRIPOD 2015 (22 items) for all prediction-model studies; do not reuse the old item numbers.

**Primary reference:** Collins GS, Moons KGM, Dhiman P, et al. TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. BMJ. 2024;385:e078378. doi:10.1136/bmj-2023-078378. PMID: 38626948. PMCID: PMC11019967.

**Source table:** TRIPOD+AI Table 2, PMC11019967 (read as `full_text`), https://pmc.ncbi.nlm.nih.gov/articles/PMC11019967/. The 13-item TRIPOD+AI for Abstracts checklist (Table 3) covers item 2.

**D/E column:** D = development only; E = evaluation (validation) only; D;E = both. A study that both develops and evaluates a model reports every row.

| # | Section | D/E | Item | Status | Note |
|---|---------|-----|------|--------|------|
| 1 | Title | D;E | Identify the study as developing or evaluating the performance of a multivariable prediction model, the target population, and the outcome to be predicted | ☐ | |
| 2 | Abstract | D;E | Follow the TRIPOD+AI for Abstracts checklist (13 items) | ☐ | |
| 3a | Introduction | D;E | Healthcare context (diagnostic or prognostic) and rationale, with references to existing models | ☐ | |
| 3b | Introduction | D;E | Target population, intended purpose in the care pathway, and intended users | ☐ | |
| 3c | Introduction | D;E | Known health inequalities between sociodemographic groups | ☐ | |
| 4 | Introduction | D;E | Study objectives, including whether the study is development, validation, or both | ☐ | SAP-1 |
| 5a | Methods | D;E | Data sources for development and evaluation data separately, rationale, and representativeness | ☐ | |
| 5b | Methods | D;E | Dates of participant accrual and, if applicable, end of follow-up | ☐ | |
| 6a | Methods | D;E | Study setting, including number and location of centres | ☐ | |
| 6b | Methods | D;E | Eligibility criteria for participants | ☐ | use the `method-cohort` skill output |
| 6c | Methods | D;E | Treatments received and how they were handled, if relevant | ☐ | |
| 7 | Methods | D;E | Data pre-processing and quality checks, and whether these were similar across sociodemographic groups | ☐ | |
| 8a | Methods | D;E | Outcome definition and time horizon, how and when assessed, rationale, and consistency of assessment across groups | ☐ | SAP-2 |
| 8b | Methods | D;E | Qualifications and demographics of outcome assessors when assessment is subjective | ☐ | |
| 8c | Methods | D;E | Actions taken to blind outcome assessment | ☐ | |
| 9a | Methods | D | Choice of initial predictors and any pre-selection before model building | ☐ | |
| 9b | Methods | D;E | Definition of all predictors, how and when measured, and any blinding of predictor assessment | ☐ | |
| 9c | Methods | D;E | Qualifications and demographics of predictor assessors when measurement is subjective | ☐ | |
| 10 | Methods | D;E | How the study size was arrived at (development and evaluation separately) and why it is sufficient, with any calculation | ☐ | use the `method-power` skill output |
| 11 | Methods | D;E | Handling of missing data and reasons for omitting any data | ☐ | |
| 12a | Methods | D | How the data were used in the analysis, including any partitioning | ☐ | use the `method-data-leakage-reviewer` agent |
| 12b | Methods | D | Handling of predictors in the analysis (functional form, rescaling, transformation, standardisation) | ☐ | |
| 12c | Methods | D | Type of model, rationale, all model-building steps including hyperparameter tuning, and internal validation method | ☐ | |
| 12d | Methods | D;E | Handling and quantification of heterogeneity across clusters (see TRIPOD-Cluster) | ☐ | |
| 12e | Methods | D;E | All performance measures and plots (discrimination, calibration, clinical utility) and any model comparison | ☐ | use the `method-calibration-reviewer` agent |
| 12f | Methods | E | Any model updating (e.g., recalibration) arising from the evaluation, overall or for subgroups or settings | ☐ | |
| 12g | Methods | E | How model predictions were calculated for evaluation (formula, code, object, API) | ☐ | |
| 13 | Methods | D;E | Class imbalance methods, if used: why, how, and any subsequent recalibration | ☐ | |
| 14 | Methods | D;E | Approaches used to address model fairness and their rationale | ☐ | use the `method-fairness-reviewer` agent |
| 15 | Methods | D | Model output (probabilities, classification) and how any thresholds were identified | ☐ | |
| 16 | Methods | D;E | Differences between development and evaluation data in setting, eligibility, outcome, and predictors | ☐ | use the `method-concept-drift-reviewer` agent |
| 17 | Methods | D;E | Ethics approval body and participant consent or waiver | ☐ | |
| 18a | Open science | D;E | Source of funding and role of funders | ☐ | |
| 18b | Open science | D;E | Conflicts of interest and financial disclosures for all authors | ☐ | |
| 18c | Open science | D;E | Where the study protocol can be accessed, or that none was prepared | ☐ | link the `method-plan` SAP |
| 18d | Open science | D;E | Registration details, or that the study was not registered | ☐ | use the `method-prereg` skill |
| 18e | Open science | D;E | Availability of the study data | ☐ | |
| 18f | Open science | D;E | Availability of the analytical code (cleaning, feature engineering, model building, evaluation) | ☐ | |
| 19 | Patient and public involvement | D;E | Patient and public involvement in design, conduct, reporting, interpretation, or dissemination, or a statement of none | ☐ | |
| 20a | Results | D;E | Flow of participants, numbers with and without the outcome, and follow-up summary (diagram helpful) | ☐ | waterfall from `method-cohort` |
| 20b | Results | D;E | Participant characteristics overall and per data source or setting, including missing data and differences across demographic groups | ☐ | Table 1 row in `analysis/sap-tables/02-outputs.csv` |
| 20c | Results | E | Comparison of predictor, demographic, and outcome distributions between evaluation and development data | ☐ | |
| 21 | Results | D;E | Number of participants and outcome events in each analysis (development, tuning, evaluation) | ☐ | |
| 22 | Results | D | Full model specification (formula, code, object, API) to allow prediction in new individuals, with any access restrictions | ☐ | use the `method-model-card` skill |
| 23a | Results | D;E | Performance estimates with confidence intervals, including key subgroups; plots to aid presentation | ☐ | `method-calibration-reviewer` and `method-fairness-reviewer` agents |
| 23b | Results | D;E | Heterogeneity in performance across clusters, if examined | ☐ | |
| 24 | Results | E | Results of any model updating, including the updated model and its performance | ☐ | |
| 25 | Discussion | D;E | Overall interpretation of the main results, including fairness, in the context of objectives and previous studies | ☐ | |
| 26 | Discussion | D;E | Limitations (representativeness, sample size, overfitting, missing data) and their effects on bias, uncertainty, and generalisability | ☐ | |
| 27a | Discussion | D | How poor-quality or unavailable input data should be assessed and handled at implementation | ☐ | |
| 27b | Discussion | D | Whether users must interact with input handling or model use, and the expertise required | ☐ | |
| 27c | Discussion | D;E | Next steps for future research, with a view to applicability and generalisability | ☐ | |
