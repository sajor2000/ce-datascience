# STROBE Checklist for Observational Studies

Strengthening the Reporting of Observational Studies in Epidemiology (STROBE).
22-item checklist applicable to cohort, case-control, and cross-sectional studies.

**Primary reference:** von Elm E, Altman DG, Egger M, Pocock SJ, Gotzsche PC, Vandenbroucke JP; STROBE Initiative. Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) statement: guidelines for reporting observational studies. Ann Intern Med. 2007;147(8):573-577. doi:10.7326/0003-4819-147-8-200710160-00010. PMID: 17938396.

**Explanation and elaboration:** Vandenbroucke JP, von Elm E, Altman DG, et al. Strengthening the Reporting of Observational Studies in Epidemiology (STROBE): explanation and elaboration. PLoS Med. 2007;4(10):e297. doi:10.1371/journal.pmed.0040297. PMID: 17941715.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title and Abstract

### Item 1 -- Title and abstract

**Description:** Indicate the study's design with a commonly used term in the title or abstract. Provide an informative and balanced summary including what was done and what was found.

**What to look for in code/outputs:**
- Output documents, report templates, or manuscript drafts that include a title referencing the study design (cohort, case-control, cross-sectional)
- Abstract generation code or templates that summarize objectives, methods, results, and conclusions
- Rendered reports (R Markdown, Jupyter) whose title/header section names the study design

---

## Introduction

### Item 2 -- Background/rationale

**Description:** Explain the scientific background and rationale for the investigation being reported.

**What to look for in code/outputs:**
- Introductory markdown cells or report sections citing prior literature or knowledge gaps
- Comments or documentation linking the analysis to a specific research question or hypothesis
- References to a protocol, SAP, or study registration that establish rationale

### Item 3 -- Objectives

**Description:** State specific objectives, including any prespecified hypotheses.

**What to look for in code/outputs:**
- Explicit hypothesis statements in documentation, comments, or report preamble
- Primary and secondary objectives defined in a config file, SAP, or analysis header
- Outcome variables and exposure variables named consistently with stated objectives

---

## Methods

### Item 4 -- Study design

**Description:** Present key elements of study design early in the paper.

**What to look for in code/outputs:**
- Code comments or config specifying study type (prospective cohort, retrospective cohort, nested case-control, cross-sectional)
- Data structure that matches the stated design (longitudinal records for cohort, matched pairs for case-control, single time-point for cross-sectional)
- Temporal direction of data collection documented or inferable from date variables

### Item 5 -- Setting

**Description:** Describe the setting, locations, and relevant dates including periods of recruitment, exposure, follow-up, and data collection.

**What to look for in code/outputs:**
- Date filters in data loading or cohort definition code (index dates, enrollment windows, follow-up cutoffs)
- Site or location variables used in filtering or stratification
- Comments documenting calendar periods for recruitment, exposure assessment, and outcome ascertainment
- Data dictionary entries for date and site fields

### Item 6 -- Participants

**Description:** (a) Give the eligibility criteria and the sources and methods of selection of participants. Describe methods of follow-up. (b) For matched studies, give matching criteria and number of exposed and unexposed. (c) For case-control, give case and control definitions and selection rationale.

**What to look for in code/outputs:**
- Inclusion/exclusion filter logic applied to the source population
- Code that constructs the analytic cohort from a larger dataset with documented criteria
- Matching algorithms (propensity score matching, exact matching, caliper matching) with documented criteria
- Case and control definitions in case-control designs
- Follow-up time calculation and censoring rules
- Flowchart or participant counts at each filtering step

### Item 7 -- Variables

**Description:** Clearly define all outcomes, exposures, predictors, potential confounders, and effect modifiers. Give diagnostic criteria when applicable.

**What to look for in code/outputs:**
- Variable derivation code with clear naming (outcome, exposure, covariate labels)
- Data dictionary or codebook defining each variable
- ICD/CPT/LOINC code lists used for outcome or exposure definitions
- Composite endpoint construction logic
- Confounder and effect modifier lists in model specifications

### Item 8 -- Data sources/measurement

**Description:** For each variable of interest, give sources of data and details of methods of assessment (measurement). Describe comparability of assessment methods if there is more than one group.

**What to look for in code/outputs:**
- Data source documentation (EHR system, registry, survey instrument, claims database)
- Variable extraction queries referencing specific tables or fields
- Measurement validation or calibration code
- Comments noting differences in data collection across sites or time periods
- Linkage methods when combining multiple data sources

### Item 9 -- Bias

**Description:** Describe any efforts to address potential sources of bias.

**What to look for in code/outputs:**
- Sensitivity analyses for misclassification, unmeasured confounding, or selection bias
- E-value calculations or bias analysis code
- Propensity score methods, instrumental variable approaches, or regression discontinuity designs
- Documentation of potential biases and mitigation strategies
- Negative control outcome or exposure analyses

### Item 10 -- Study size

**Description:** Explain how the study size was arrived at.

**What to look for in code/outputs:**
- Power analysis or sample size calculation code
- Documentation of minimum detectable effect size, alpha, and power parameters
- Justification for the available sample size if no formal power calculation was performed
- Comments noting the study used all available data (convenience sample) vs. calculated requirement

### Item 11 -- Quantitative variables

**Description:** Explain how quantitative variables were handled in the analyses. If applicable, describe which groupings were chosen and why.

**What to look for in code/outputs:**
- Categorization or binning of continuous variables (age groups, BMI categories, lab value thresholds)
- Documentation of cut-point selection rationale (clinical thresholds, distribution-based, literature-based)
- Spline or polynomial transformations for non-linear relationships
- Standardization or normalization applied to continuous predictors
- Handling of zero-inflated or skewed distributions

### Item 12 -- Statistical methods

**Description:** (a) Describe all statistical methods including those for confounders. (b) Describe methods for subgroups and interactions. (c) Explain handling of missing data. (d) Describe methods for loss to follow-up (cohort). (e) Describe any sensitivity analyses.

**What to look for in code/outputs:**
- Model specification code: regression family, link function, random effects, robust standard errors
- Confounder adjustment strategy: which variables included and why
- Subgroup analysis code: interaction terms, stratified models
- Missing data handling: complete case analysis, multiple imputation (mice, MICE, Amelia), single imputation, indicator method
- Loss to follow-up: inverse probability of censoring weights, competing risks models, sensitivity analyses for informative censoring
- Sensitivity analysis code: alternative model specifications, different confounder sets, different outcome definitions
- Pre-specified vs. post-hoc analysis designation

---

## Results

### Item 13 -- Participants

**Description:** (a) Report numbers of individuals at each stage of study -- numbers potentially eligible, examined for eligibility, confirmed eligible, included in the study, completing follow-up, and analyzed. (b) Give reasons for non-participation at each stage. (c) Consider use of a flow diagram.

**What to look for in code/outputs:**
- Cohort attrition tables or flowchart generation code (consort-style diagrams)
- Row counts printed or logged at each filtering step
- Participant flow from source population through final analytic sample
- Counts of exclusions by reason
- Comparison of included vs. excluded participants

### Item 14 -- Descriptive data

**Description:** (a) Give characteristics of study participants and information on exposures and potential confounders. (b) Indicate number of participants with missing data for each variable. (c) Summarize follow-up time (cohort).

**What to look for in code/outputs:**
- Table 1 generation code (tableone, gtsummary, CreateTableOne)
- Baseline characteristics stratified by exposure or outcome group
- Missing data counts or percentages per variable
- Follow-up time summaries: median, IQR, person-years
- Standardized mean differences for covariate balance assessment

### Item 15 -- Outcome data

**Description:** Report numbers of outcome events or summary measures over time (cohort), numbers in each exposure category (case-control), or numbers of outcome events or summary measures (cross-sectional).

**What to look for in code/outputs:**
- Event counts, incidence rates, or prevalence calculations
- Outcome frequency tables by exposure group
- Kaplan-Meier curves or cumulative incidence plots
- Person-time denominators for rate calculations
- Outcome counts stratified by key variables

### Item 16 -- Main results

**Description:** (a) Give unadjusted estimates and, if applicable, confounder-adjusted estimates and their precision (e.g., 95% CI). Make clear which confounders were adjusted for and why. (b) Report category boundaries when continuous variables were categorized. (c) If relevant, consider translating relative measures into absolute risk.

**What to look for in code/outputs:**
- Both crude and adjusted effect estimates (OR, RR, HR, RD) with confidence intervals
- Model output summaries showing coefficient estimates, standard errors, p-values, CIs
- Clear documentation of which covariates appear in adjusted models
- Absolute risk or risk difference calculations alongside relative measures
- Forest plots or coefficient plots displaying estimates with CIs

### Item 17 -- Other analyses

**Description:** Report other analyses done -- e.g., analyses of subgroups and interactions, and sensitivity analyses.

**What to look for in code/outputs:**
- Subgroup analysis code and output tables
- Interaction term results
- Sensitivity analysis results: different model specifications, different populations, different outcome definitions
- E-value or quantitative bias analysis results
- Results from alternative analytical approaches (e.g., propensity score vs. multivariable regression)

---

## Discussion

### Item 18 -- Key results

**Description:** Summarize key results with reference to study objectives.

**What to look for in code/outputs:**
- Summary sections in rendered reports that reference stated objectives
- Key finding statements that map to the primary and secondary objectives
- Results interpretation consistent with the pre-specified analysis plan

### Item 19 -- Limitations

**Description:** Discuss limitations of the study, taking into account sources of potential bias or imprecision. Discuss both direction and magnitude of any potential bias.

**What to look for in code/outputs:**
- Limitation sections in report templates
- Sensitivity analysis results that inform limitation discussion
- Documentation of known data quality issues, selection mechanisms, or measurement error
- Quantitative bias analysis results cited in limitations

### Item 20 -- Interpretation

**Description:** Give a cautious overall interpretation considering objectives, limitations, multiplicity of analyses, results from similar studies, and other relevant evidence.

**What to look for in code/outputs:**
- Conclusion statements in reports that appropriately qualify findings
- Language distinguishing association from causation
- References to effect sizes and clinical significance alongside statistical significance
- Acknowledgment of multiple comparisons when applicable

### Item 21 -- Generalizability

**Description:** Discuss the generalizability (external validity) of the study results.

**What to look for in code/outputs:**
- Description of the source population and how it compares to the target population
- Demographic or clinical profile summaries enabling generalizability assessment
- Comments on single-center vs. multi-center design implications
- Documentation of inclusion/exclusion criteria that may limit generalizability

---

## Other Information

### Item 22 -- Funding

**Description:** Give the source of funding and the role of the funders for the present study and, if applicable, for the original study on which the present article is based.

**What to look for in code/outputs:**
- Funding acknowledgment sections in report templates
- Grant numbers or funding source documentation
- Conflict of interest disclosures
- Data use agreement references
