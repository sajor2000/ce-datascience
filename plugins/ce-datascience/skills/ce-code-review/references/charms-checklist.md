# CHARMS Checklist for Systematic Reviews of Prediction Modelling Studies

CHecklist for critical Appraisal and data extraction for systematic Reviews of prediction Modelling Studies (CHARMS).
11-domain framework for data extraction and critical appraisal of studies reporting development, validation, or updating of clinical prediction models in systematic reviews.

**Primary reference:** Moons KGM, de Groot JAH, Bouwmeester W, et al. Critical appraisal and data extraction for systematic reviews of prediction modelling studies: the CHARMS checklist. PLoS Med. 2014;11(10):e1001744. doi:10.1371/journal.pmed.1001744. PMID: 25314315.

CHARMS is used alongside PRISMA when conducting systematic reviews of studies that develop, validate, or update prediction models. It guides both data extraction and critical appraisal. Each domain below describes the information to extract and appraise, and what to look for in analysis code and outputs when evaluating compliance during a code or analytic review of a prediction modelling systematic review.

---

## Domain 1: Source of Data

### Source of Data

**Description:** Extract details about the data source used to develop or validate the prediction model, including study design, data collection method, and whether the data were collected prospectively or retrospectively.

**What to look for in code/outputs:**
- Data extraction fields recording the data source type (randomized trial, prospective cohort, retrospective cohort, registry, electronic health record database, administrative claims)
- Code or notes distinguishing prospective data collection from retrospective use of existing data
- Documentation of the geographic setting, number of centers, and care setting (primary care, secondary care, emergency) for each included study
- Summary statistics describing the distribution of study designs across the systematic review's included studies
- Extraction of the time period over which data were collected for each study

---

## Domain 2: Participants

### Participants

**Description:** Extract the participant eligibility criteria, recruitment method, and key baseline characteristics of the study population, and assess whether the study population is appropriate for the prediction model's intended use setting.

**What to look for in code/outputs:**
- Inclusion and exclusion criteria for participants extracted and coded per study
- Code or notes documenting the setting and moment of intended model use (e.g., patients presenting to the emergency department with suspected sepsis)
- Baseline characteristic summaries extracted: age, sex, key clinical variables relevant to the prediction problem
- Assessment of whether the study population matches the target population in the review question
- Documentation of spectrum of disease severity and case mix in each included study

---

## Domain 3: Outcome to be Predicted

### Outcome to be Predicted

**Description:** Extract the outcome variable being predicted, including its definition, measurement method, time horizon, and the handling of competing events.

**What to look for in code/outputs:**
- Outcome variable definition extracted per study: clinical event, diagnosis, composite endpoint, or continuous measure
- Time horizon for prediction extracted (e.g., 30-day mortality, 5-year recurrence, in-hospital readmission)
- Measurement method for the outcome documented (administrative coding, clinical adjudication, registry linkage, laboratory confirmation)
- Competing events identified and their handling documented (e.g., censoring, cause-specific modeling, subdistribution hazard approach for competing risk outcomes)
- Assessment of whether the outcome definition is consistent with the review's target outcome and clinically meaningful
- Proportion of outcomes verified by blinded adjudication extracted and flagged when outcome verification was not blinded

---

## Domain 4: Candidate Predictors

### Candidate Predictors

**Description:** Extract the candidate predictor variables considered during model development, including how they were measured, whether they were pre-specified or selected from the data, and any transformations applied.

**What to look for in code/outputs:**
- Full list of candidate predictors considered during development extracted and coded per study
- Measurement method and timing of predictor assessment documented (e.g., vital signs at hospital admission, lab values from first blood draw)
- Documentation of whether candidate predictors were pre-specified based on clinical knowledge or identified by data-driven variable selection
- Continuous predictor handling extracted: categorization (and cut-points), linear assumption, spline or polynomial transformation
- Assessment of predictor availability at the intended moment of model use (some predictors may require results not available at decision time)
- Inter-predictor correlation or multicollinearity assessment documented when reported

---

## Domain 5: Sample Size

### Sample Size

**Description:** Extract and critically appraise the number of participants and outcome events in each study, and assess whether the sample size was adequate for the number of predictors included in the model.

**What to look for in code/outputs:**
- Number of participants, number of events, and events-per-variable (EPV) ratio extracted per study
- Code or notes flagging studies with EPV below commonly used thresholds (EPV < 10 for binary outcomes is a commonly cited concern; note that current guidance recommends events-per-parameter calculations over EPV thresholds)
- For validation studies: number of participants and events in the validation sample extracted separately from development sample
- Assessment of whether the sample size section provides a formal justification or power calculation
- Summary statistics describing the distribution of sample sizes and event counts across included studies

---

## Domain 6: Missing Data

### Missing Data

**Description:** Extract how missing data were handled in each included study and assess whether the approach is appropriate given the extent and likely mechanism of missingness.

**What to look for in code/outputs:**
- Missing data handling method extracted per study: complete case analysis, single imputation, multiple imputation (and number of imputations), missing indicator method
- Proportion of missing data for key predictors and the outcome extracted when reported
- Assessment of whether the missing data mechanism was considered (missing completely at random, missing at random, missing not at random)
- Code or notes flagging studies that performed complete case analysis with >5-10% missing data as potentially biased
- Documentation of whether imputation was done separately for the development and validation samples in internal validation studies

---

## Domain 7: Model Development

### Model Development

**Description:** Extract and appraise the statistical method used to develop the prediction model, including predictor selection strategy, shrinkage or penalization, and the final model specification.

**What to look for in code/outputs:**
- Modeling method extracted: logistic regression, Cox proportional hazards, Fine-Gray subdistribution hazard, random forest, gradient boosting, neural network, or other machine learning approach
- Predictor selection method extracted and appraised: all pre-specified predictors included, backward/forward/stepwise selection, LASSO, elastic net, or other penalization
- Stepwise selection based solely on statistical significance without clinical pre-specification flagged as a concern for overfitting
- Shrinkage or penalization applied (ridge, LASSO, elastic net, global shrinkage factor) extracted and documented
- Interaction terms included in the final model extracted and their clinical justification documented
- Final model presented as a score, nomogram, regression equation, or software tool extracted

---

## Domain 8: Model Performance

### Model Performance

**Description:** Extract performance metrics reported for the prediction model, including discrimination, calibration, and overall performance, and assess whether the reported measures are appropriate and correctly computed.

**What to look for in code/outputs:**
- Discrimination metrics extracted per study: C-statistic (AUC for binary outcomes, Harrell's C for survival), sensitivity and specificity at a reported threshold, D-statistic
- Calibration metrics extracted: calibration plot (visual), Hosmer-Lemeshow test, calibration slope, calibration-in-the-large (O/E ratio)
- Reliance on Hosmer-Lemeshow test alone as evidence of good calibration flagged (test has low power and is sensitive to sample size)
- Overall performance metrics extracted: Brier score, Nagelkerke R-squared, scaled Brier score
- Confidence intervals for performance metrics extracted when reported
- Code or notes documenting whether performance metrics were computed on the same data used for development (optimistic) vs. a held-out validation set (less biased)

---

## Domain 9: Model Evaluation

### Model Evaluation

**Description:** Extract and appraise the type of validation performed, including internal validation (bootstrap, cross-validation), temporal validation, geographic validation, or independent external validation, and the extent of optimism correction applied.

**What to look for in code/outputs:**
- Validation type extracted per study: apparent performance only, internal validation (bootstrap or cross-validation), internal-external cross-validation, temporal external validation, geographic external validation, independent external validation
- Studies reporting only apparent performance without any validation flagged as high risk of optimism
- Internal validation method extracted: bootstrap resampling with optimism correction, k-fold cross-validation, leave-one-out cross-validation
- Optimism-corrected performance estimates extracted separately from apparent estimates
- For external validation studies: the development study being validated identified and the degree of overlap in population and setting described
- Heterogeneity in external validation performance across geographic settings or time periods documented and analyzed

---

## Domain 10: Results

### Results

**Description:** Extract the final model equation or scoring algorithm, reported predictor effects, and performance statistics in a format that enables inclusion in a meta-analysis of discrimination or calibration.

**What to look for in code/outputs:**
- Final model equation, regression coefficients, or score weights extracted per study (enables model reproduction and meta-analysis of effects)
- Predictor-specific effect estimates (odds ratios, hazard ratios, regression coefficients) with confidence intervals extracted
- Meta-analysis code pooling C-statistics or calibration metrics across studies using appropriate variance-stabilizing transformations (logit transformation for C-statistics)
- Heterogeneity statistics (I-squared, tau-squared) reported for meta-analyzed performance metrics
- Forest plots of C-statistics or calibration slopes across included studies generated
- Studies reporting only graphical results without numerical estimates flagged as limiting meta-analysis inclusion

---

## Domain 11: Interpretation and Discussion

### Interpretation and Discussion

**Description:** Extract and appraise whether the study authors' conclusions are appropriately qualified by the validation evidence, whether clinical utility was assessed, and whether model limitations are addressed.

**What to look for in code/outputs:**
- Documentation of whether the included studies assessed clinical utility: decision curve analysis, net reclassification improvement (NRI), integrated discrimination improvement (IDI)
- Extraction of net benefit or decision curve analysis results when reported
- Assessment of whether authors' conclusions are proportionate to the strength of validation evidence (development-only studies should not claim external validity)
- Recommendations for intended clinical application qualified by the available validation evidence
- Limitations sections addressing overfitting, missing data handling, outcome definition, and generalizability extracted and summarized across included studies
- Recommendations for future validation or model updating identified as knowledge gaps in the systematic review discussion

---

## Presentation and Summary for Systematic Reviews

### Risk of Bias Assessment Across Domains*

**Description:** Summarize critical appraisal findings across CHARMS domains for all included studies, identifying the prevalence of methodological concerns and their likely direction of bias on reported model performance.

**What to look for in code/outputs:**
- Risk of bias or methodological concern coded per domain per study using a structured appraisal table (commonly using PROBAST alongside CHARMS for formal bias ratings)
- Code generating a summary visualization of methodological quality across included studies
- Sensitivity analyses in the meta-analysis restricting to studies with adequate sample size, external validation, or no stepwise selection
- Meta-regression examining the association between methodological quality indicators and reported discrimination or calibration
- Narrative synthesis discussing the overall quality of the prediction model literature for the target condition and how it limits confidence in pooled estimates
