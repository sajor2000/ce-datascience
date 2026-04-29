# TRIPOD Checklist for Prediction Model Studies

Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis (TRIPOD).
22-item checklist for studies developing, validating, or updating multivariable prediction models using regression methods.

**Primary reference:** Moons KGM, Altman DG, Reitsma JB, Ioannidis JPA, Macaskill P, Steyerberg EW, Vickers AJ, Ransohoff DF, Collins GS. Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis (TRIPOD): explanation and elaboration. Ann Intern Med. 2015;162(1):W1-73. doi:10.7326/M14-0698. PMID: 25560730.

**Companion statement:** Collins GS, Reitsma JB, Altman DG, Moons KGM. Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis (TRIPOD): the TRIPOD statement. Ann Intern Med. 2015;162(1):55-63. doi:10.7326/M14-0697. PMID: 25560714.

This checklist applies to regression-based prediction models. For studies using machine learning or AI methods, apply the TRIPOD+AI extension instead. Items marked D apply to model development, V to validation, and D+V to both.

---

## Title and Abstract

### Item 1 -- Title

**Description:** Identify the study as developing and/or validating a multivariable prediction model, the target population, and the outcome to be predicted. (D+V)

**What to look for in code/outputs:**
- Report title or header that names the prediction target (e.g., 30-day mortality, 5-year cardiovascular event)
- Title that identifies whether the study is developing, validating, or updating a model
- Keywords in document metadata that include the model type and clinical domain
- Structured abstract or summary section consistent with the stated title

### Item 2 -- Abstract

**Description:** Provide a summary of objectives, study design, setting, participants, sample size, predictors, outcome, statistical analysis, results, and conclusions. (D+V)

**What to look for in code/outputs:**
- Abstract sections reporting model development or validation objectives
- Sample sizes for development and validation datasets stated in abstract
- Key performance metrics (AUC/C-statistic, calibration measure) reported in abstract
- Event rates or outcome frequencies summarized in abstract

---

## Introduction

### Item 3 -- Background and objectives

**Description:** Explain the medical context (including whether diagnostic or prognostic) and rationale for developing or validating the multivariable prediction model, including references to existing models. State the objectives, including whether the study describes the development or validation of the model or both. (D+V)

**What to look for in code/outputs:**
- Documentation of the clinical question (diagnostic vs. prognostic prediction)
- Literature review referencing existing models for the same clinical question
- Stated rationale for developing a new model or validating an existing one
- Primary objectives defined in analysis header, SAP, or documentation

---

## Methods -- Source of Data

### Item 4 -- Source of data

**Description:** Describe the study design or data source (such as a randomized trial, a cohort, or registry data), separately for the development and validation data sets, if applicable. (D+V)

**What to look for in code/outputs:**
- Data source documentation (clinical trial, prospective cohort, registry, EHR extract, claims)
- Study design classification (prospective vs. retrospective data collection)
- Separate description of development and validation data sources when both are used
- Date range filters in data extraction code (enrollment period, follow-up cutoff)

### Item 5 -- Participants

**Description:** Specify the key elements of the study setting (e.g., primary, secondary, tertiary care, community) including number and location of centers. Describe the eligibility criteria for participants. (D+V)

**What to look for in code/outputs:**
- Inclusion/exclusion criteria implemented in cohort construction code
- Care setting and institutional context documented
- Number of centers or sites with contribution counts
- Participant flow from source population through final analytic sample

---

## Methods -- Outcome and Predictors

### Item 6 -- Outcome

**Description:** Clearly define the outcome that is predicted by the prediction model, including how and when the outcome was measured. (D+V)

**What to look for in code/outputs:**
- Outcome variable derivation code with ICD/CPT/LOINC code definitions
- Prediction horizon specification (e.g., in-hospital, 30-day, 1-year)
- Outcome ascertainment window defined relative to index date in code
- Binary, time-to-event, or ordinal outcome type specified with appropriate model family

### Item 7 -- Predictors

**Description:** Clearly define all predictors used in developing or validating the multivariable prediction model, including how and when they were measured. (D+V)

**What to look for in code/outputs:**
- Complete predictor list with variable derivation code and source tables
- Temporal relationship documented (all predictors available before the prediction time)
- Measurement units, reference ranges, and coding schema specified
- Look-back window definitions for time-varying predictors

---

## Methods -- Sample Size

### Item 8 -- Sample size

**Description:** Explain how the study size was arrived at. (D+V)

**What to look for in code/outputs:**
- Sample size justification based on events-per-variable (EPV) rule or simulation
- Documentation of minimum EPV threshold applied (e.g., 10-20 events per predictor)
- Power calculations for validation studies
- Comments when sample size is limited by available data

---

## Methods -- Missing Data

### Item 9 -- Missing data

**Description:** Describe how missing data were handled (e.g., complete-case analysis, single imputation, multiple imputation) with details of any imputation method. (D+V)

**What to look for in code/outputs:**
- Missing data summary table showing count and percentage missing per variable
- Imputation method implemented in code (multiple imputation, single imputation, indicator)
- Imputation model specified with predictors of missingness
- Comparison of complete cases vs. full sample to assess potential bias

---

## Methods -- Statistical Analysis

### Item 10a -- Statistical analysis methods (development)

**Description:** Describe how predictors were handled in the analyses. (D)

**What to look for in code/outputs:**
- Continuous predictor handling (linear assumption testing, splines, categorization)
- Cut-point selection rationale if continuous variables were categorized
- Interaction term specification and clinical rationale
- Non-linear transformation code (fractional polynomials, restricted cubic splines)

### Item 10b -- Statistical analysis methods (model type)

**Description:** Specify the type of model, all model-building procedures (including any predictor selection), and method for internal validation. (D)

**What to look for in code/outputs:**
- Model family and link function specified (logistic, Cox, competing risks, multinomial)
- Predictor selection method documented (full model, backward elimination, LASSO, clinical prespecification)
- Internal validation method coded (bootstrap, cross-validation, apparent vs. optimism-corrected)
- Optimism correction applied if predictor selection was performed

### Item 10c -- Statistical analysis methods (validation)

**Description:** For validation, describe how the predictions were calculated. (V)

**What to look for in code/outputs:**
- Prediction calculation code applying the original model formula or intercept/slope recalibration
- Coefficient values or model object from development dataset applied to validation data
- Recalibration method specified if applied (intercept update, slope recalibration)
- No re-estimation of predictor effects in the validation dataset

### Item 10d -- Statistical analysis methods (performance measures)

**Description:** Specify all measures used to assess model performance and, if relevant, to compare multiple models. (D+V)

**What to look for in code/outputs:**
- Discrimination measures coded (C-statistic/AUC with confidence intervals)
- Calibration measures coded (calibration-in-the-large, calibration slope, calibration plot)
- Overall performance measures (Brier score, R-squared equivalents)
- Decision curve analysis or net benefit calculations if clinical utility is assessed

### Item 10e -- Statistical analysis methods (risk groups)

**Description:** Describe any model updating (e.g., recalibration) arising from the validation, if done. (V)

**What to look for in code/outputs:**
- Risk group definitions applied (low/medium/high) with cut-points specified
- Clinical or statistical basis for cut-point selection documented
- Distribution of participants across risk groups reported
- Sensitivity and specificity at each threshold calculated

---

## Results

### Item 11 -- Participants

**Description:** Describe the flow of participants through the study, including the number of participants with and without the outcome and, if applicable, a summary of the follow-up time. A diagram may be helpful. (D+V)

**What to look for in code/outputs:**
- Participant flow from eligible population to final analytic sample with counts
- Event count and event rate in development and validation cohorts
- Follow-up time summary (median, IQR, person-years) for time-to-event outcomes
- Flowchart or attrition table generated in code

### Item 12 -- Model development

**Description:** Describe the characteristics (e.g., demographic, clinical, predictor values) of the participants in the development and any validation data sets. (D+V)

**What to look for in code/outputs:**
- Table 1 generation code with descriptive statistics for predictor and outcome variables
- Stratification by development vs. validation cohort where applicable
- Missing data counts per variable in the descriptive table
- Continuous variables summarized as mean/SD or median/IQR as appropriate

### Item 13 -- Model specification

**Description:** Present the full prediction model to allow predictions for individuals (i.e., all regression coefficients, and model intercept or baseline survival at a given time point). (D)

**What to look for in code/outputs:**
- Final model coefficients or hazard ratios reported with confidence intervals
- Model intercept or baseline hazard/survival function reported
- Predictor reference categories and coding scheme documented
- Sufficient information to reproduce predictions without the original dataset

### Item 14 -- Model performance

**Description:** Report performance measures (with confidence intervals) for the prediction model. (D+V)

**What to look for in code/outputs:**
- Discrimination statistics (C-statistic/AUC) with bootstrap or cross-validated confidence intervals
- Calibration plot (observed vs. predicted probabilities) generated as figure
- Calibration metrics (calibration slope, calibration-in-the-large) reported numerically
- Apparent and optimism-corrected performance reported separately for development

### Item 15 -- Model updating

**Description:** Report the results from any model updating (i.e., model specification, model performance after updating). (V)

**What to look for in code/outputs:**
- Updated intercept or recalibration slope applied and reported
- Performance before and after updating compared in results tables
- Reason for updating documented (poor calibration, different outcome rate)
- Updated model coefficients or recalibrated predictions saved and reported

---

## Discussion

### Item 16 -- Limitations

**Description:** Discuss any limitations of the study (such as non-representative sample, few events per predictor, missing data). (D+V)

**What to look for in code/outputs:**
- Limitation section referencing sample representativeness and generalizability
- EPV ratio or events-per-predictor calculation reported
- Missing data mechanism and potential impact discussed
- Overfitting risk discussed relative to internal validation method used

### Item 17 -- Interpretation

**Description:** Give an overall interpretation of the results, considering objectives, limitations, results from similar studies, and other relevant evidence. (D+V)

**What to look for in code/outputs:**
- Conclusion section contextualizing model performance relative to existing models
- Clinical relevance of discrimination and calibration metrics discussed
- Comparison with other published models for the same prediction task
- Risk group cut-points justified in clinical terms

### Item 18 -- Implications

**Description:** Discuss the potential clinical use of the model and implications for future research. (D+V)

**What to look for in code/outputs:**
- Intended clinical application described (triage, treatment selection, shared decision-making)
- Recommended next steps articulated (external validation, prospective evaluation, impact study)
- Net benefit or decision curve analysis interpretation in clinical context
- Generalizability of findings to target deployment population discussed

---

## Other Information

### Item 19 -- Supplementary information

**Description:** Provide information about the availability of supplementary resources, such as study protocol, Web calculator, and datasets. (D+V)

**What to look for in code/outputs:**
- Data availability statement in report
- Web calculator or online implementation referenced or provided
- Analysis code availability (GitHub, supplementary materials, OSF)
- Protocol or pre-registration reference

### Item 20 -- Funding

**Description:** Give the source of funding and the role of the funders for the present study. (D+V)

**What to look for in code/outputs:**
- Funding acknowledgment in report template
- Grant numbers or sponsor documentation
- Conflict of interest disclosures
- Role of funder in study design, analysis, or reporting stated
