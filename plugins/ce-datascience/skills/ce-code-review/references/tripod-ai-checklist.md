# TRIPOD+AI Checklist for Prediction Model Studies Using Regression or AI/ML

## Contents

- Title (item 1)
- Abstract (item 2)
- Introduction (items 3a-4)
- Methods (items 5a-17)
- Open Science (items 18a-18f)
- Patient and Public Involvement (item 19)
- Results (items 20a-24)
- Discussion (items 25-27c)

Current primary checklist for transparent reporting of studies developing or evaluating (validating) a clinical prediction model, regardless of whether regression or machine learning methods were used: 27 numbered items (52 rows counting lettered sub-items) in eight sections. Item numbers, section headings, D/E markers, and paraphrased item wording below follow Table 2 of the statement.

**Base guideline:** TRIPOD (Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis)

**Primary reference (TRIPOD+AI):** Collins GS, Moons KGM, Dhiman P, Riley RD, Beam AL, Van Calster B, Ghassemi M, Liu X, Reitsma JB, van Smeden M, et al. TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. BMJ. 2024;385:e078378. doi:10.1136/bmj-2023-078378. PMID: 38626948. PMCID: PMC11019967.

**Verified against:** TRIPOD+AI Table 2 in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC11019967/. The 13-item TRIPOD+AI for Abstracts checklist is Table 3 of the same article.

**Original TRIPOD reference:** Moons KGM, Altman DG, Reitsma JB, Ioannidis JPA, Macaskill P, Steyerberg EW, Vickers AJ, Ransohoff DF, Collins GS. Transparent Reporting of a multivariable prediction model for Individual Prognosis or Diagnosis (TRIPOD): explanation and elaboration. Ann Intern Med. 2015;162(1):W1-73. doi:10.7326/M14-0698. PMID: 25560730.

TRIPOD+AI supersedes TRIPOD 2015 for all prediction-model studies; its item numbers do not map one-to-one onto the 2015 numbers, so cite TRIPOD+AI numbers in findings. Markers: D = development only; E = evaluation only; D;E = both. A study that both develops and evaluates a model must report every item. The checklist describes reporting, not study quality; use PROBAST (or PROBAST+AI) for risk-of-bias appraisal.

Each item lists the sub-items with their markers, then what to look for in analysis code and outputs when evaluating compliance.

---

## Title

### Item 1 -- Title (D;E)

**Description:** Identify the study as developing or evaluating a multivariable prediction model, and name the target population and the outcome to be predicted.

**What to look for in code/outputs:**
- Report title or header naming the prediction target and population (e.g., 30-day mortality after cardiac surgery)
- Title stating whether the study develops, evaluates (validates), or both
- Keywords or document metadata consistent with the stated design and clinical domain

---

## Abstract

### Item 2 -- Abstract (D;E)

**Description:** Report the abstract according to the TRIPOD+AI for Abstracts checklist (13 items).

**What to look for in code/outputs:**
- Structured abstract separating objectives, data source, participants, outcome, predictors, model type, and performance
- Sample sizes and numbers of outcome events for development and evaluation data
- Discrimination and calibration estimates with confidence intervals, not point estimates alone
- Statement of model availability and funding or registration where the abstract format allows

---

## Introduction

### Item 3 -- Background (D;E)

**Description:** (3a) Healthcare context, including whether the model is diagnostic or prognostic, and the rationale for developing or evaluating it, with references to existing models. (3b) Target population, intended purpose within the care pathway, and intended users. (3c) Known health inequalities between sociodemographic groups.

**What to look for in code/outputs:**
- Literature review or comparison table of existing models for the same prediction task
- Documentation of the clinical need or gap, where in the pathway the model is used, and who uses it (clinicians, patients, public)
- Justification for the modelling approach over simpler alternatives, including the ML-over-regression choice
- Background notes on known disparities in the outcome or in access to care that the model could widen or narrow

### Item 4 -- Objectives (D;E)

**Description:** Specify the study objectives, including whether the study describes development, validation, or both.

**What to look for in code/outputs:**
- Objectives stated in the SAP or protocol and matched by the analysis entry point
- Study design classification (development with internal validation, external validation, development plus external validation)
- Consistency between stated objectives and the analyses actually run

---

## Methods

### Item 5 -- Data (D;E)

**Description:** (5a) Sources of data, separately for development and evaluation datasets (e.g., randomised trial, cohort, routine care, registry), the rationale for using them, and their representativeness. (5b) Dates of participant accrual and, if applicable, end of follow-up.

**What to look for in code/outputs:**
- Data source documentation (EHR system, registry, cohort, claims) per dataset, with the reason each was chosen
- Date range filters in extraction code (accrual window, follow-up cutoff) and the dates reported in outputs
- Multi-site documentation with site identifiers and per-site contribution counts
- Statement on how well each dataset represents the target population from item 3b

### Item 6 -- Participants (D;E)

**Description:** (6a) Study setting (e.g., primary care, secondary care, general population), including the number and location of centres. (6b) Eligibility criteria. (6c) Treatments received and how they were handled during development or evaluation, if relevant.

**What to look for in code/outputs:**
- Inclusion and exclusion criteria implemented in filtering code and matching the written criteria
- Cohort construction queries with index-date definitions and temporal eligibility windows
- Setting and centre counts recorded alongside the cohort
- Treatment variables and a documented decision on whether treatment is a predictor, an exclusion, or ignored

### Item 7 -- Data preparation (D;E)

**Description:** Describe data pre-processing and quality checking, including whether it was similar across relevant sociodemographic groups.

**What to look for in code/outputs:**
- Normalisation, encoding, outlier, and quality-check code with the thresholds used
- Preprocessing fit on development data only and applied unchanged to evaluation data (pipeline objects, no refitting on test data)
- Quality-check summaries (implausible values, duplicate records) stratified by sociodemographic group
- Record of data excluded or corrected during cleaning

### Item 8 -- Outcome (D;E)

**Description:** (8a) Outcome definition and time horizon, how and when assessed, rationale for the outcome, and whether assessment is consistent across sociodemographic groups. (8b) Qualifications and demographics of outcome assessors when assessment is subjective. (8c) Actions to blind outcome assessment.

**What to look for in code/outputs:**
- Outcome derivation code with ICD/CPT/LOINC or phenotype definitions and the ascertainment window relative to the index date
- Prediction horizon specification (in-hospital, 30-day, 1-year) matching the written outcome
- Label-source consistency checks across groups (e.g., outcome capture rates by site or demographic group)
- Adjudication or labelling protocol, assessor details, and blinding to predictors when labels are human-assigned

### Item 9 -- Predictors (9a D; 9b-9c D;E)

**Description:** (9a) Choice of initial predictors (literature, previous models, all available variables) and any pre-selection before model building. (9b) Definition of all predictors, how and when they were measured, and any blinding of predictor assessment. (9c) Qualifications and demographics of predictor assessors when measurement is subjective.

**What to look for in code/outputs:**
- Candidate predictor list with data types, units, source tables, and the rationale for inclusion
- Feature engineering code with derivation logic and look-back windows for time-varying predictors
- Temporal checks that every predictor is available before the prediction time point (no future information)
- Pre-selection steps (univariable screening, clinical shortlist) documented separately from model-building selection in item 12c

### Item 10 -- Sample size (D;E)

**Description:** Explain how the study size was arrived at, separately for development and evaluation, and justify that it is sufficient, including any sample size calculation.

**What to look for in code/outputs:**
- Sample size or minimum-events calculation (e.g., `pmsampsize`-style criteria for development, precision targets for evaluation)
- Events per candidate predictor or parameter and the achieved numbers in each dataset
- Cross-reference to the `ce-power` skill output or the SAP sample-size section

### Item 11 -- Missing data (D;E)

**Description:** Describe how missing data were handled and give reasons for omitting any data.

**What to look for in code/outputs:**
- Missing data summary (count and percentage per predictor and outcome) for each dataset
- Imputation code (multiple imputation, model-based, indicator) with the imputation model fit on development data
- Complete-case exclusions documented with counts and reasons
- Assessment of the missingness mechanism and how missing values will be handled at prediction time (see item 27a)

### Item 12 -- Analytical methods (12a-12c D; 12d-12e D;E; 12f-12g E)

**Description:** (12a) How the data were used in the analysis, including any partitioning, considering sample size requirements. (12b) How predictors were handled (functional form, rescaling, transformation, standardisation). (12c) Type of model, rationale, all model-building steps including hyperparameter tuning, and the internal validation method. (12d) Handling and quantification of heterogeneity in parameters and performance across clusters (see TRIPOD-Cluster). (12e) All measures and plots used to evaluate performance (discrimination, calibration, clinical utility) and to compare models. (12f) Any model updating (e.g., recalibration) arising from evaluation, overall or for particular groups or settings. (12g) How predictions were calculated for evaluation (formula, code, object, API).

**What to look for in code/outputs:**
- Train/validation/test split or cross-validation code with ratios, seeds, stratification, and grouping by patient or site; temporal splits preserving order
- Predictor handling code (splines, log transforms, scaling, one-hot encoding) and feature selection steps (LASSO, recursive elimination) with their criteria
- Model class instantiation, architecture details, optimiser settings, regularisation, early stopping, and hyperparameter search ranges and selection criterion, with the final configuration saved
- Internal validation implementation (bootstrap optimism correction, nested cross-validation) separate from any hyperparameter tuning data
- Mixed-effects or per-cluster performance code when data come from multiple centres
- Performance code covering discrimination (AUC/C-statistic), calibration (plot, slope, intercept, Brier), and clinical utility (decision curve, net benefit), with the same measures applied to every compared model
- Recalibration or refitting code applied after evaluation, and the exact artefact (model object, formula, API call) used to generate evaluation predictions

### Item 13 -- Class imbalance (D;E)

**Description:** If class imbalance methods were used, state why and how, and any subsequent recalibration of the model or its predictions.

**What to look for in code/outputs:**
- Resampling, reweighting, or synthetic oversampling code (e.g., SMOTE, class weights) and the rationale
- Recalibration step applied after imbalance handling so predicted probabilities match observed event rates
- Calibration-in-the-large reported on the natural prevalence, not the resampled data

### Item 14 -- Fairness (D;E)

**Description:** Describe any approaches used to address model fairness and their rationale.

**What to look for in code/outputs:**
- Fairness strategy stated before modelling (group definitions, metrics, mitigation such as reweighting or threshold adjustment)
- Fairness metric calculations (calibration by group, error-rate parity) and disparity quantification between groups
- Subgroup sample sizes reported alongside subgroup performance
- Proxy-variable review for predictors that encode protected attributes

### Item 15 -- Model output (D)

**Description:** Specify the model output (probabilities, classification) and the details and rationale for any classification thresholds.

**What to look for in code/outputs:**
- Output type of the final model artefact (probability, risk score, class label)
- Threshold selection code and criterion (clinical trade-off, pre-specified sensitivity, decision-curve range), fixed before evaluation
- Sensitivity, specificity, PPV, and NPV at each reported threshold

### Item 16 -- Training versus evaluation (D;E)

**Description:** Identify differences between development and evaluation data in healthcare setting, eligibility criteria, outcome, and predictors.

**What to look for in code/outputs:**
- Side-by-side documentation of setting, eligibility, outcome definition, and predictor definitions across datasets
- Temporal, geographic, or institutional separation between development and evaluation data
- Dataset shift checks (covariate distribution comparison, case-mix differences) and the `ce-concept-drift-reviewer` findings

### Item 17 -- Ethical approval (D;E)

**Description:** Name the research ethics board or committee that approved the study and describe participant consent or the waiver of consent.

**What to look for in code/outputs:**
- IRB or ethics approval reference recorded in the protocol or project documentation
- Consent or waiver statement consistent with the data source (e.g., routine-care data under waiver)
- Data-use agreement constraints reflected in the data access code

---

## Open Science

### Item 18 -- Open science (D;E)

**Description:** (18a) Source of funding and role of funders. (18b) Conflicts of interest and financial disclosures for all authors. (18c) Where the study protocol can be accessed, or that none was prepared. (18d) Registration details (register name and number), or that the study was not registered. (18e) Availability of the study data. (18f) Availability of the analytical code, covering data cleaning, feature engineering, model building, and evaluation.

**What to look for in code/outputs:**
- Funding and conflict-of-interest statements, including industry roles in data or algorithm provision
- Link to the protocol or the `ce-plan` SAP, with an amendment log for changes after data access
- Registration identifier from the `ce-prereg` skill output, or an explicit not-registered statement
- Data availability statement with access route for de-identified data
- Code repository with a tagged release, environment specification (requirements or lock file), and scripts covering cleaning through evaluation

---

## Patient and Public Involvement

### Item 19 -- Patient and public involvement (D;E)

**Description:** Describe any patient and public involvement during design, conduct, reporting, interpretation, or dissemination, or state that there was none.

**What to look for in code/outputs:**
- PPI section in the protocol or manuscript naming the stage(s) of involvement
- Documentation of how patient input shaped outcome choice, predictors, thresholds, or communication of results
- Explicit "no patient or public involvement" statement when none occurred

---

## Results

### Item 20 -- Participants (20a-20b D;E; 20c E)

**Description:** (20a) Flow of participants through the study, including numbers with and without the outcome and a summary of follow-up time; a diagram may help. (20b) Characteristics overall and per data source or setting, including key dates, key predictors and demographics, treatments, sample size, outcome events, follow-up, and amount of missing data; report differences across key demographic groups. (20c) For evaluation, a comparison with the development data of the distribution of important predictors, demographics, and outcome.

**What to look for in code/outputs:**
- Participant flow with counts at each exclusion step, generated from the cohort-construction code (e.g., the `ce-cohort-build` waterfall)
- Table 1 per dataset with demographics, predictors, treatments, events, follow-up, and missingness, stratified by demographic group
- Development-versus-evaluation comparison table or standardised mean differences

### Item 21 -- Model development (D;E)

**Description:** Specify the number of participants and outcome events in each analysis (e.g., model development, hyperparameter tuning, model evaluation).

**What to look for in code/outputs:**
- Logged sample size and event count for every data partition, fold, and bootstrap resample set
- Numbers reported in outputs that reconcile with the flow diagram in item 20a

### Item 22 -- Model specification (D)

**Description:** Provide the full prediction model (formula, code, object, or API) so that predictions can be made in new individuals and third parties can evaluate and implement it, including any access or reuse restrictions.

**What to look for in code/outputs:**
- Serialised model object or published formula with coefficients, plus the preprocessing pipeline needed to reproduce predictions
- Framework and library versions pinned so the artefact loads reproducibly
- Model card from the `ce-model-card` skill describing inputs, outputs, intended use, and licence or access restrictions
- Worked example or test case showing a prediction for a new individual

### Item 23 -- Model performance (D;E)

**Description:** (23a) Performance estimates with confidence intervals, including for key subgroups (e.g., sociodemographic); consider plots. (23b) If examined, heterogeneity in performance across clusters (see TRIPOD-Cluster).

**What to look for in code/outputs:**
- Performance tables with bootstrap or analytic confidence intervals for every dataset and subgroup
- ROC or discrimination plots, calibration plots (observed versus predicted), and decision curves saved as outputs
- Subgroup-specific calibration intercept and slope, not discrimination alone
- Per-centre or per-cluster performance estimates with a heterogeneity summary when multi-site data are used

### Item 24 -- Model updating (E)

**Description:** Report the results of any model updating, including the updated model and its subsequent performance.

**What to look for in code/outputs:**
- Updated coefficients, recalibration parameters, or refitted artefact alongside the original
- Post-update performance evaluated on data not used for the update
- Clear labelling of which performance estimates refer to the original and which to the updated model

---

## Discussion

### Item 25 -- Interpretation (D;E)

**Description:** Give an overall interpretation of the main results, including issues of fairness, in the context of the objectives and previous studies.

**What to look for in code/outputs:**
- Interpretation that matches the reported estimates and uncertainty, without spin on discrimination alone
- Fairness findings from item 23a discussed, not only reported
- Comparison against existing models identified in item 3a
- Interpretability outputs (feature importance, SHAP, partial dependence), if produced, used to support the interpretation; these are not a separate TRIPOD+AI item

### Item 26 -- Limitations (D;E)

**Description:** Discuss limitations such as a non-representative sample, sample size, overfitting, and missing data, and their effects on bias, statistical uncertainty, and generalisability.

**What to look for in code/outputs:**
- Comparison of development population to the intended deployment population from item 3b
- Optimism or overfitting evidence (apparent versus internally validated performance)
- Comparison of included versus excluded participants and the effect of missing-data handling
- Known failure modes, label-quality concerns, and temporal stability of performance

### Item 27 -- Usability of the model in the context of current care (27a-27b D; 27c D;E)

**Description:** (27a) How poor-quality or unavailable input data should be assessed and handled when the model is implemented. (27b) Whether users must interact in handling input data or using the model, and the expertise required. (27c) Next steps for future research, with a view to the model's applicability and generalisability.

**What to look for in code/outputs:**
- Input validation and missing-input behaviour in the prediction code (defaults, imputation at prediction time, refusal to predict)
- Documentation of the human-in-the-loop role: who reviews predictions, what training is needed, and what the model does not decide
- Deployment readiness notes and recommended next steps (external or prospective validation, impact study) before clinical use
