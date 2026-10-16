# TRIPOD Checklist for Prediction Model Studies

## Contents

- Title and Abstract
- Introduction
- Methods -- Source of Data and Participants
- Methods -- Outcome and Predictors
- Methods -- Sample Size
- Methods -- Missing Data
- Methods -- Statistical Analysis
- Results
- Discussion
- Other Information

Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis (TRIPOD) 2015.
22 numbered items (37 rows counting lettered sub-items) for studies developing, validating, or updating multivariable prediction models.

**Primary reference:** Collins GS, Reitsma JB, Altman DG, Moons KGM. Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis (TRIPOD): the TRIPOD statement. Ann Intern Med. 2015;162(1):55-63. doi:10.7326/M14-0697. PMID: 25560714. Erratum: Ann Intern Med. 2015;162(8):600. PMID: 25894039.

**Explanation and elaboration:** Moons KGM, Altman DG, Reitsma JB, Ioannidis JPA, Macaskill P, Steyerberg EW, Vickers AJ, Ransohoff DF, Collins GS. Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis (TRIPOD): explanation and elaboration. Ann Intern Med. 2015;162(1):W1-73. doi:10.7326/M14-0698. PMID: 25560730.

**Verified against:** Table 1 of the simultaneous BMC Medicine publication (BMC Med. 2015;13:1. doi:10.1186/s12916-014-0241-z. PMID: 25563062. PMCID: PMC4284921), https://pmc.ncbi.nlm.nih.gov/articles/PMC4284921/, checked 2026-10-15.

**Licence and wording:** Item descriptions are copied verbatim from that table, which is published under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/); © Collins et al. The "What to look for" cues are added by this plugin.

**Superseded:** TRIPOD 2015 is superseded by TRIPOD+AI (Collins GS, et al. BMJ. 2024;385:e078378. PMID: 38626948) for all prediction-model studies, whether regression or machine learning. Use `tripod-ai-checklist.md` and cite TRIPOD+AI item numbers; use this file only when a journal or legacy protocol explicitly requires TRIPOD 2015 numbering. Markers: D = development only; V = validation only; D;V = both.

---

## Title and Abstract

### Item 1 -- Title

**Description:** Identify the study as developing and/or validating a multivariable prediction model, the target population, and the outcome to be predicted. (D;V)

**What to look for in code/outputs:**
- Report title or header that names the prediction target (e.g., 30-day mortality, 5-year cardiovascular event)
- Title that identifies whether the study is developing, validating, or updating a model
- Keywords in document metadata that include the model type and clinical domain

### Item 2 -- Abstract

**Description:** Provide a summary of objectives, study design, setting, participants, sample size, predictors, outcome, statistical analysis, results, and conclusions. (D;V)

**What to look for in code/outputs:**
- Sample sizes for development and validation datasets stated in the abstract
- Key performance metrics (AUC/C-statistic, calibration measure) reported in the abstract
- Event rates or outcome frequencies summarized in the abstract

---

## Introduction

### Item 3a -- Background and objectives (context)

**Description:** Explain the medical context (including whether diagnostic or prognostic) and rationale for developing or validating the multivariable prediction model, including references to existing models. (D;V)

**What to look for in code/outputs:**
- Documentation of the clinical question (diagnostic vs. prognostic prediction)
- Literature review referencing existing models for the same clinical question

### Item 3b -- Background and objectives (objectives)

**Description:** Specify the objectives, including whether the study describes the development or validation of the model, or both. (D;V)

**What to look for in code/outputs:**
- Primary objectives defined in the analysis header, SAP, or documentation
- Consistency between stated objectives and the analyses actually run

---

## Methods -- Source of Data and Participants

### Item 4a -- Source of data

**Description:** Describe the study design or source of data (e.g., randomized trial, cohort, or registry data), separately for the development and validation data sets, if applicable. (D;V)

**What to look for in code/outputs:**
- Data source documentation (clinical trial, prospective cohort, registry, EHR extract, claims)
- Separate description of development and validation data sources when both are used

### Item 4b -- Source of data (dates)

**Description:** Specify the key study dates, including start of accrual; end of accrual; and, if applicable, end of follow-up. (D;V)

**What to look for in code/outputs:**
- Date range filters in data extraction code (accrual window, follow-up cutoff) matching the reported dates

### Item 5a -- Participants (setting)

**Description:** Specify key elements of the study setting (e.g., primary care, secondary care, general population) including number and location of centres. (D;V)

**What to look for in code/outputs:**
- Care setting and institutional context documented
- Number of centers or sites with contribution counts

### Item 5b -- Participants (eligibility)

**Description:** Describe eligibility criteria for participants. (D;V)

**What to look for in code/outputs:**
- Inclusion/exclusion criteria implemented in cohort construction code and matching the written criteria

### Item 5c -- Participants (treatments)

**Description:** Give details of treatments received, if relevant. (D;V)

**What to look for in code/outputs:**
- Treatment variables extracted and a documented decision on how treatment was handled (predictor, exclusion, or ignored)

---

## Methods -- Outcome and Predictors

### Item 6a -- Outcome

**Description:** Clearly define the outcome that is predicted by the prediction model, including how and when assessed. (D;V)

**What to look for in code/outputs:**
- Outcome variable derivation code with ICD/CPT/LOINC code definitions
- Prediction horizon specification (e.g., in-hospital, 30-day, 1-year) and ascertainment window relative to the index date

### Item 6b -- Outcome (blinding)

**Description:** Report any actions to blind assessment of the outcome to be predicted. (D;V)

**What to look for in code/outputs:**
- Adjudication protocol stating whether outcome assessors saw predictor values

### Item 7a -- Predictors

**Description:** Clearly define all predictors used in developing the multivariable prediction model, including how and when they were measured. (D;V)

**What to look for in code/outputs:**
- Complete predictor list with variable derivation code, source tables, units, and coding schema
- Temporal relationship documented (all predictors available before the prediction time)
- Look-back window definitions for time-varying predictors

### Item 7b -- Predictors (blinding)

**Description:** Report any actions to blind assessment of predictors for the outcome and other predictors. (D;V)

**What to look for in code/outputs:**
- Statement of whether predictor measurement (e.g., imaging reads) was done without knowledge of the outcome

---

## Methods -- Sample Size

### Item 8 -- Sample size

**Description:** Explain how the study size was arrived at. (D;V)

**What to look for in code/outputs:**
- Development sample size justified with the Riley et al. criteria (BMJ 2020;368:m441, PMID 32188600; R/Stata `pmsampsize`): shrinkage >= 0.9, optimism in Nagelkerke R-squared <= 0.05, and precise overall risk, counted in candidate predictor parameters (degrees of freedom), not variables
- Events-per-variable rules of thumb (e.g., 10-20) flagged as insufficient justification on their own
- Validation sample size justified by the precision of calibration (O/E, calibration slope), C-statistic, and net benefit (Riley et al. Stat Med 2021, PMID 34031906; `pmvalsampsize`), not hypothesis-test power

---

## Methods -- Missing Data

### Item 9 -- Missing data

**Description:** Describe how missing data were handled (e.g., complete-case analysis, single imputation, multiple imputation) with details of any imputation method. (D;V)

**What to look for in code/outputs:**
- Missing data summary table showing count and percentage missing per variable
- Imputation method implemented in code, with the imputation model and predictors of missingness

---

## Methods -- Statistical Analysis

### Item 10a -- Statistical analysis methods (predictor handling)

**Description:** Describe how predictors were handled in the analyses. (D)

**What to look for in code/outputs:**
- Continuous predictor handling (linearity checks, splines, fractional polynomials, categorization with cut-point rationale)
- Interaction term specification and clinical rationale

### Item 10b -- Statistical analysis methods (model type)

**Description:** Specify type of model, all model-building procedures (including any predictor selection), and method for internal validation. (D)

**What to look for in code/outputs:**
- Model family and link function specified (logistic, Cox, competing risks, multinomial)
- Predictor selection method documented (full model, backward elimination, LASSO, clinical prespecification)
- Internal validation coded (bootstrap or cross-validation), with optimism correction covering any selection steps

### Item 10c -- Statistical analysis methods (validation predictions)

**Description:** For validation, describe how the predictions were calculated. (V)

**What to look for in code/outputs:**
- Prediction code applying the original model formula or object to the validation data
- No re-estimation of predictor effects in the validation dataset

### Item 10d -- Statistical analysis methods (performance measures)

**Description:** Specify all measures used to assess model performance and, if relevant, to compare multiple models. (D;V)

**What to look for in code/outputs:**
- Discrimination (C-statistic/AUC), calibration (calibration-in-the-large, slope, plot), and overall performance (Brier score)
- Decision curve analysis or net benefit if clinical utility is assessed

### Item 10e -- Statistical analysis methods (model updating)

**Description:** Describe any model updating (e.g., recalibration) arising from the validation, if done. (V)

**What to look for in code/outputs:**
- Recalibration method specified (intercept update, slope recalibration, refitting) and its trigger

### Item 11 -- Risk groups

**Description:** Provide details on how risk groups were created, if done. (D;V)

**What to look for in code/outputs:**
- Risk group definitions (low/medium/high) with cut-points and their clinical or statistical basis
- Distribution of participants across risk groups

### Item 12 -- Development vs. validation

**Description:** For validation, identify any differences from the development data in setting, eligibility criteria, outcome, and predictors. (V)

**What to look for in code/outputs:**
- Side-by-side documentation of setting, eligibility, outcome, and predictor definitions across datasets

---

## Results

### Item 13a -- Participants (flow)

**Description:** Describe the flow of participants through the study, including the number of participants with and without the outcome and, if applicable, a summary of the follow-up time. A diagram may be helpful. (D;V)

**What to look for in code/outputs:**
- Participant flow from eligible population to final analytic sample with counts, generated in code
- Event count and follow-up summary (median, IQR, person-years) for each cohort

### Item 13b -- Participants (characteristics)

**Description:** Describe the characteristics of the participants (basic demographics, clinical features, available predictors), including the number of participants with missing data for predictors and outcome. (D;V)

**What to look for in code/outputs:**
- Table 1 code with descriptive statistics for predictors and outcome, including missing-data counts per variable

### Item 13c -- Participants (validation comparison)

**Description:** For validation, show a comparison with the development data of the distribution of important variables (demographics, predictors and outcome). (V)

**What to look for in code/outputs:**
- Development-versus-validation comparison table or standardised mean differences

### Item 14a -- Model development (numbers)

**Description:** Specify the number of participants and outcome events in each analysis. (D)

**What to look for in code/outputs:**
- Logged sample size and event count for every analysis, including bootstrap or cross-validation runs

### Item 14b -- Model development (unadjusted associations)

**Description:** If done, report the unadjusted association between each candidate predictor and outcome. (D)

**What to look for in code/outputs:**
- Univariable association table, kept separate from any predictor-selection step

### Item 15a -- Model specification (full model)

**Description:** Present the full prediction model to allow predictions for individuals (i.e., all regression coefficients, and model intercept or baseline survival at a given time point). (D)

**What to look for in code/outputs:**
- Final coefficients, intercept or baseline survival, reference categories, and coding scheme reported
- Sufficient information to reproduce predictions without the original dataset

### Item 15b -- Model specification (how to use)

**Description:** Explain how to use the prediction model. (D)

**What to look for in code/outputs:**
- Worked example, nomogram, score chart, or web calculator showing a prediction for a new individual

### Item 16 -- Model performance

**Description:** Report performance measures (with CIs) for the prediction model. (D;V)

**What to look for in code/outputs:**
- Discrimination statistics with bootstrap or analytic confidence intervals
- Calibration plot and calibration metrics reported numerically
- Apparent and optimism-corrected performance reported separately for development

### Item 17 -- Model updating

**Description:** If done, report the results from any model updating (i.e., model specification, model performance). (V)

**What to look for in code/outputs:**
- Updated intercept, slope, or coefficients reported, with performance before and after updating

---

## Discussion

### Item 18 -- Limitations

**Description:** Discuss any limitations of the study (such as nonrepresentative sample, few events per predictor, missing data). (D;V)

**What to look for in code/outputs:**
- Sample size relative to the Riley et al. criteria (or events per candidate predictor parameter) reported
- Missing data mechanism and overfitting risk discussed relative to the internal validation method

### Item 19a -- Interpretation (validation)

**Description:** For validation, discuss the results with reference to performance in the development data, and any other validation data. (V)

**What to look for in code/outputs:**
- Validation performance placed next to the published development performance

### Item 19b -- Interpretation (overall)

**Description:** Give an overall interpretation of the results, considering objectives, limitations, results from similar studies, and other relevant evidence. (D;V)

**What to look for in code/outputs:**
- Comparison with other published models for the same prediction task

### Item 20 -- Implications

**Description:** Discuss the potential clinical use of the model and implications for future research. (D;V)

**What to look for in code/outputs:**
- Intended clinical application and recommended next steps (external validation, impact study)

---

## Other Information

### Item 21 -- Supplementary information

**Description:** Provide information about the availability of supplementary resources, such as study protocol, Web calculator, and data sets. (D;V)

**What to look for in code/outputs:**
- Data availability statement, analysis code location, protocol reference, and any web calculator

### Item 22 -- Funding

**Description:** Give the source of funding and the role of the funders for the present study. (D;V)

**What to look for in code/outputs:**
- Funding acknowledgment with grant numbers and the funder's role in design, analysis, or reporting
