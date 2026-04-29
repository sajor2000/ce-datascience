# STARD 2015 Checklist for Diagnostic Accuracy Studies

Standards for Reporting Diagnostic Accuracy Studies (STARD 2015).
30-item checklist applicable to diagnostic accuracy studies.

**Primary reference:** Bossuyt PM, Reitsma JB, Bruns DE, et al; STARD Group. STARD 2015: an updated list of essential items for reporting diagnostic accuracy studies. BMJ. 2015;351:h5527. doi:10.1136/bmj.h5527. PMID: 26511519.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title/Abstract

### Item 1 -- Identification as diagnostic accuracy study

**Description:** Identification as a study of diagnostic accuracy using at least one measure of accuracy (such as sensitivity, specificity, predictive values, or AUC).

**What to look for in code/outputs:**
- Report title or rendered document header identifying the study as a diagnostic accuracy evaluation
- Abstract or summary output that includes at least one accuracy metric (sensitivity, specificity, AUC, PPV, NPV)
- Manuscript template or report preamble explicitly naming the diagnostic accuracy study design

### Item 2 -- Structured abstract

**Description:** Structured abstract with identification of study as diagnostic accuracy, study objectives, methods (participants, index test, reference standard), results (estimates of diagnostic accuracy, including precision), and general conclusions.

**What to look for in code/outputs:**
- Abstract generation code or template with structured sections covering objectives, methods, results, conclusions
- Key accuracy estimates with confidence intervals included in abstract output
- Index test and reference standard identified in the abstract or summary section
- Study population described in the abstract output

---

## Introduction

### Item 3 -- Scientific background and objectives

**Description:** Scientific and clinical background, including the intended use and clinical role of the index test. Study objectives and hypotheses.

**What to look for in code/outputs:**
- Introductory sections documenting the clinical context and intended use of the diagnostic test
- Prior literature citations or knowledge gaps motivating the study
- Explicit hypotheses or objectives stated in protocol, report preamble, or documentation
- Intended role of the index test (triage, replacement, add-on) documented

---

## Methods -- Participants

### Item 4 -- Study design

**Description:** Whether data collection was planned before the index test and reference standard were performed (prospective study) or after (retrospective study).

**What to look for in code/outputs:**
- Study design documented as prospective or retrospective in code comments or report metadata
- Data collection timeline evident from date fields and query logic
- Cross-sectional vs. cohort design for diagnostic accuracy clearly specified
- Temporal relationship between index test and reference standard data evident in the data structure

### Item 5 -- Eligibility criteria

**Description:** Eligibility criteria for participants.

**What to look for in code/outputs:**
- Inclusion/exclusion filter logic applied to the source population in data processing code
- Eligibility criteria documented in protocol, config files, or code comments
- Age, sex, clinical presentation, or symptom-based criteria used for participant selection
- Exclusion counts and reasons tracked at each filtering step

### Item 6 -- Sampling method

**Description:** On what basis potentially eligible participants were identified (such as symptoms, results from previous tests, inclusion in registry).

**What to look for in code/outputs:**
- Sampling strategy documented (consecutive, random, convenience)
- Code that identifies the source population (symptom-based cohort, registry, referral population)
- Patient identification queries referencing specific clinical criteria or previous test results
- Documentation of recruitment pathway from source population to study sample

### Item 7 -- Data collection

**Description:** Whether participants formed a consecutive, random, or convenience series.

**What to look for in code/outputs:**
- Enrollment method documented in metadata or protocol files
- Date-ordered patient selection code indicating consecutive enrollment
- Random sampling code or stratified sampling procedures documented
- Documentation of any non-consecutive enrollment and potential selection biases

---

## Methods -- Test methods

### Item 8 -- Reference standard and rationale

**Description:** Reference standard and its rationale.

**What to look for in code/outputs:**
- Reference standard definition documented (gold standard test, clinical diagnosis, composite reference)
- Rationale for reference standard choice cited in protocol or documentation
- Reference standard variable clearly labeled and defined in data dictionary
- Code that constructs the reference standard outcome (single test, composite, adjudicated diagnosis)

### Item 9 -- Index test and rationale

**Description:** Definition and rationale for index test, including how and when it was performed, in sufficient detail to allow replication.

**What to look for in code/outputs:**
- Index test variable defined with measurement specifications (threshold, units, timing)
- Test execution protocol or standard operating procedure referenced
- Code that processes or derives index test results from raw measurements
- Technical specifications of the assay, device, or algorithm used as the index test

### Item 10 -- Rationale for test positivity cut-offs

**Description:** Rationale for choosing the index test cut-off or result categories, including whether they were pre-specified or data-driven.

**What to look for in code/outputs:**
- Threshold or cut-point selection code with documented rationale (clinical guidelines, ROC optimization, Youden index)
- Pre-specified vs. data-driven cut-off designation in protocol or analysis plan
- ROC curve analysis code that evaluates performance across multiple thresholds
- Sensitivity analyses exploring alternative cut-off values

### Item 11 -- Blinding

**Description:** Whether clinical information and reference standard results were available to the performers/readers of the index test, and whether clinical information and index test results were available to the assessors of the reference standard.

**What to look for in code/outputs:**
- Documentation of blinding procedures for index test and reference standard assessment
- Data processing code that maintains separation between index test and reference standard data
- Temporal ordering of assessments documented to demonstrate blinding feasibility
- Comments noting unblinded components and potential incorporation bias

---

## Methods -- Analysis

### Item 12 -- Methods for estimating diagnostic accuracy

**Description:** Methods for estimating or comparing measures of diagnostic accuracy.

**What to look for in code/outputs:**
- Accuracy metric calculation code (sensitivity, specificity, PPV, NPV, likelihood ratios, AUC)
- Confidence interval computation methods (exact binomial, bootstrap, DeLong for AUC comparison)
- Statistical packages used for diagnostic accuracy analysis (pROC, epiR, DiagnosticTest, caret)
- Comparison methods when evaluating multiple tests (McNemar, DeLong test for AUC comparison)

### Item 13 -- Methods for handling indeterminate results

**Description:** How indeterminate index test or reference standard results were handled.

**What to look for in code/outputs:**
- Code handling indeterminate, inconclusive, or equivocal test results
- Documentation of whether indeterminate results were excluded, classified as positive/negative, or analyzed separately
- Sensitivity analyses comparing results with and without indeterminate cases
- Counts of indeterminate results reported in data processing logs

### Item 14 -- Methods for handling missing data

**Description:** How missing data on the index test and reference standard were handled.

**What to look for in code/outputs:**
- Missing data counts for index test and reference standard variables
- Complete case analysis or imputation strategy documented and implemented
- Comparison of participants with and without missing data (selection bias assessment)
- Verification bias analysis when reference standard is not performed on all participants

### Item 15 -- Intended sample size and how determined

**Description:** Any analyses of variability in diagnostic accuracy, distinguishing pre-specified from exploratory.

**What to look for in code/outputs:**
- Sample size or power calculation code for diagnostic accuracy (precision-based or hypothesis-based)
- Target sensitivity/specificity and margin of error specified
- Justification for sample size if no formal calculation performed
- Pre-specified vs. exploratory subgroup analyses clearly designated

### Item 16 -- Statistical methods for subgroups

**Description:** Intended sample size and how it was determined.

**What to look for in code/outputs:**
- Subgroup analysis code stratified by clinical characteristics (age, sex, disease severity, setting)
- Pre-specified subgroup analyses documented in protocol or SAP
- Accuracy estimates with confidence intervals reported per subgroup
- Heterogeneity in diagnostic accuracy across subgroups assessed

---

## Results -- Participants

### Item 17 -- Flow of participants

**Description:** Flow of participants, using a diagram.

**What to look for in code/outputs:**
- STARD flow diagram generation code or rendered flow diagram
- Counts at each stage: eligible, enrolled, received index test, received reference standard, analyzed
- Reasons for exclusion at each step documented
- Participant flow from identification through final analysis tracked programmatically

### Item 18 -- Baseline demographics

**Description:** Baseline demographic and clinical characteristics of participants.

**What to look for in code/outputs:**
- Table 1 generation code with demographic and clinical characteristics
- Participant characteristics summarized by disease status (target condition present/absent)
- Clinical features, comorbidities, and disease severity distributions reported
- Missing data counts per baseline variable

### Item 19 -- Time interval between tests

**Description:** Time interval and any clinical interventions between index test and reference standard.

**What to look for in code/outputs:**
- Time difference calculation between index test and reference standard dates
- Summary statistics of the time interval (median, range)
- Documentation of any clinical interventions occurring between tests
- Exclusion criteria based on maximum allowable time interval between tests

---

## Results -- Test results

### Item 20 -- Distribution of test results

**Description:** Distribution of severity of disease in those with the target condition; other diagnoses in those without the target condition.

**What to look for in code/outputs:**
- Disease severity distribution tables or histograms for target-condition-positive participants
- Alternative diagnoses tabulated for target-condition-negative participants
- Spectrum of disease documented (mild, moderate, severe; early vs. late stage)
- Case-mix description informing generalizability of accuracy estimates

### Item 21 -- Cross-tabulation of results

**Description:** Cross tabulation of the index test results (or their distribution) by the results of the reference standard.

**What to look for in code/outputs:**
- 2x2 contingency table (or NxN for multi-level tests) generated in code
- Confusion matrix output from classification analysis
- Cross-tabulation of index test categories against reference standard categories
- True positive, false positive, true negative, false negative counts clearly presented

### Item 22 -- Estimates of diagnostic accuracy

**Description:** Estimates of diagnostic accuracy and their precision (such as 95% confidence intervals).

**What to look for in code/outputs:**
- Sensitivity, specificity, PPV, NPV calculated with 95% confidence intervals
- AUC (area under ROC curve) with confidence interval
- Likelihood ratios (positive and negative) with confidence intervals
- Diagnostic odds ratio or other summary accuracy measures reported

### Item 23 -- Adverse events

**Description:** Any adverse events from performing the index test or the reference standard.

**What to look for in code/outputs:**
- Adverse event tracking variables in the dataset
- Safety outcome tables or counts of test-related complications
- Documentation of whether adverse events were systematically collected
- Adverse event rates reported for both index test and reference standard procedures

---

## Results -- Estimates

### Item 24 -- Indeterminate results

**Description:** Estimates of diagnostic accuracy distinguishing pre-specified from exploratory analyses.

**What to look for in code/outputs:**
- Indeterminate result counts and their handling documented in results
- Sensitivity analyses with and without indeterminate results
- Accuracy estimates reported separately for the intention-to-diagnose population and per-protocol population
- Impact of indeterminate results on overall diagnostic accuracy quantified

---

## Discussion

### Item 25 -- Study limitations

**Description:** Discuss the clinical applicability of the study findings.

**What to look for in code/outputs:**
- Limitation sections addressing spectrum bias, verification bias, incorporation bias
- Discussion of reference standard imperfections and their impact on accuracy estimates
- Generalizability assessment based on participant characteristics and setting
- Sensitivity analysis results informing limitation discussion

---

## Other Information

### Item 26 -- Registration

**Description:** Registration number and name of registry.

**What to look for in code/outputs:**
- Study registration number (PROSPERO, ClinicalTrials.gov, or other registry) in documentation
- Registry URL or DOI referenced in report metadata
- Protocol registration date documented relative to study start

### Item 27 -- Protocol

**Description:** Where the full study protocol can be accessed.

**What to look for in code/outputs:**
- Protocol document referenced or linked in the project repository
- Protocol DOI or URL included in report output
- Version-controlled protocol in the analysis repository

### Item 28 -- Sources of funding

**Description:** Sources of funding and other support; role of funders.

**What to look for in code/outputs:**
- Funding acknowledgment sections in report templates
- Grant numbers or funding source documentation
- Statement describing the role of funders in study design, conduct, and reporting
- Conflict of interest disclosures for study investigators

### Item 29 -- Conflicts of interest

**Description:** Conflicts of interest of authors.

**What to look for in code/outputs:**
- Conflict of interest disclosure sections in report output
- Financial and non-financial conflicts documented per author
- Industry funding or in-kind support relationships disclosed

### Item 30 -- Data sharing

**Description:** Availability of study data and other documents.

**What to look for in code/outputs:**
- Data availability statement in report output
- Code repository or data repository references (GitHub, Zenodo, Dryad)
- De-identified dataset sharing plan documented
- Supplementary materials or appendices referenced and accessible
