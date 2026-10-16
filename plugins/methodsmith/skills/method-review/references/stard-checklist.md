# STARD 2015 Checklist for Diagnostic Accuracy Studies

## Contents

- Title or abstract
- Abstract
- Introduction
- Methods -- Study design
- Methods -- Participants
- Methods -- Test methods
- Methods -- Analysis
- Results -- Participants
- Results -- Test results
- Discussion
- Other information

Standards for Reporting Diagnostic Accuracy Studies (STARD 2015).
30-item checklist (34 rows counting sub-items 10a/b, 12a/b, 13a/b, 21a/b) applicable to diagnostic accuracy studies.

**Primary reference:** Bossuyt PM, Reitsma JB, Bruns DE, et al; STARD Group. STARD 2015: an updated list of essential items for reporting diagnostic accuracy studies. BMJ. 2015;351:h5527. doi:10.1136/bmj.h5527. PMID: 26511519.

**Explanation and elaboration:** Cohen JF, Korevaar DA, Altman DG, et al. STARD 2015 guidelines for reporting diagnostic accuracy studies: explanation and elaboration. BMJ Open. 2016;6(11):e012799. doi:10.1136/bmjopen-2016-012799. PMID: 28137831.

**Source and licence:** Item numbers and descriptions are reproduced verbatim from Table 1 of the STARD 2015 statement (BMJ 2015;351:h5527, PMC4623764), published under CC BY 4.0. Official checklist: https://www.equator-network.org/wp-content/uploads/2015/03/STARD-2015-checklist.pdf. Abstracts follow STARD for Abstracts (Cohen et al. BMJ 2017;358:j3751, PMID 28819063). AI index tests also use STARD-AI. The "What to look for" cues are added by this plugin.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title or abstract

### Item 1 -- Identification as diagnostic accuracy study

**Description:** Identification as a study of diagnostic accuracy using at least one measure of accuracy (such as sensitivity, specificity, predictive values, or AUC).

**What to look for in code/outputs:**
- Report title or rendered document header identifying the study as a diagnostic accuracy evaluation
- Abstract or summary output that includes at least one accuracy metric (sensitivity, specificity, AUC, PPV, NPV)

---

## Abstract

### Item 2 -- Structured abstract

**Description:** Structured summary of study design, methods, results, and conclusions (for specific guidance, see STARD for Abstracts).

**What to look for in code/outputs:**
- Abstract template with structured sections covering design, methods, results, and conclusions
- Key accuracy estimates with confidence intervals included in the abstract output
- Index test, reference standard, and participants identified in the abstract

---

## Introduction

### Item 3 -- Scientific and clinical background

**Description:** Scientific and clinical background, including the intended use and clinical role of the index test.

**What to look for in code/outputs:**
- Introductory sections documenting the clinical context and intended use of the test (diagnosis, screening, staging, monitoring)
- Intended role of the index test (triage, replacement, add-on) documented

### Item 4 -- Study objectives and hypotheses

**Description:** Study objectives and hypotheses.

**What to look for in code/outputs:**
- Explicit objectives and hypotheses (e.g., a minimally acceptable sensitivity/specificity) stated in the protocol or report preamble

---

## Methods -- Study design

### Item 5 -- Prospective or retrospective data collection

**Description:** Whether data collection was planned before the index test and reference standard were performed (prospective study) or after (retrospective study).

**What to look for in code/outputs:**
- Study design documentation stating prospective or retrospective collection
- Data provenance notes (e.g., registry or EHR extract dates relative to test dates)

---

## Methods -- Participants

### Item 6 -- Eligibility criteria

**Description:** Eligibility criteria.

**What to look for in code/outputs:**
- Inclusion/exclusion criteria implemented as filter logic in cohort-building code
- Counts excluded at each criterion

### Item 7 -- Basis for identifying participants

**Description:** On what basis potentially eligible participants were identified (such as symptoms, results from previous tests, inclusion in registry).

**What to look for in code/outputs:**
- Code or documentation showing how candidates were identified (symptom codes, prior test results, registry membership)

### Item 8 -- Setting, location, and dates

**Description:** Where and when potentially eligible participants were identified (setting, location, and dates).

**What to look for in code/outputs:**
- Site identifiers, care setting, and recruitment date range recorded in the data or report

### Item 9 -- Sampling

**Description:** Whether participants formed a consecutive, random, or convenience series.

**What to look for in code/outputs:**
- Sampling method documented; random-sampling code with a recorded seed where applicable
- Flags for case-control (two-gate) sampling, which inflates accuracy estimates

---

## Methods -- Test methods

### Item 10a -- Index test

**Description:** Index test, in sufficient detail to allow replication.

**What to look for in code/outputs:**
- Index test protocol, device or assay version, and interpretation procedure documented
- For algorithmic tests, the model version, code, and preprocessing pipeline

### Item 10b -- Reference standard

**Description:** Reference standard, in sufficient detail to allow replication.

**What to look for in code/outputs:**
- Reference standard procedure and its derivation (e.g., adjudication rules, composite definitions) documented

### Item 11 -- Rationale for the reference standard

**Description:** Rationale for choosing the reference standard (if alternatives exist).

**What to look for in code/outputs:**
- Documented justification for the chosen reference standard over alternatives

### Item 12a -- Index test positivity cut-offs

**Description:** Definition of and rationale for test positivity cut-offs or result categories of the index test, distinguishing pre-specified from exploratory.

**What to look for in code/outputs:**
- Index test threshold defined in config or protocol before analysis, or flagged as data-driven (e.g., Youden-optimized)
- Threshold selection code separated from the evaluation data when cut-offs are derived

### Item 12b -- Reference standard positivity cut-offs

**Description:** Definition of and rationale for test positivity cut-offs or result categories of the reference standard, distinguishing pre-specified from exploratory.

**What to look for in code/outputs:**
- Reference standard categories or thresholds defined and labelled as pre-specified or exploratory

### Item 13a -- Information available to index test readers

**Description:** Whether clinical information and reference standard results were available to the performers or readers of the index test.

**What to look for in code/outputs:**
- Documentation of blinding of index test readers to reference results and clinical data
- For algorithmic tests, evidence that reference-derived features are excluded from model inputs (no label leakage)

### Item 13b -- Information available to reference standard assessors

**Description:** Whether clinical information and index test results were available to the assessors of the reference standard.

**What to look for in code/outputs:**
- Documentation of blinding of reference standard assessors to index test results

---

## Methods -- Analysis

### Item 14 -- Methods for estimating accuracy

**Description:** Methods for estimating or comparing measures of diagnostic accuracy.

**What to look for in code/outputs:**
- Accuracy calculation code (sensitivity, specificity, predictive values, likelihood ratios, AUC) with the CI method stated (e.g., Wilson, Clopper-Pearson, DeLong, bootstrap)
- Paired comparison methods when tests are compared (e.g., McNemar, DeLong for correlated ROC curves)

### Item 15 -- Indeterminate results

**Description:** How indeterminate index test or reference standard results were handled.

**What to look for in code/outputs:**
- Explicit handling rules for indeterminate, invalid, or uninterpretable results, with counts

### Item 16 -- Missing data

**Description:** How missing data on the index test and reference standard were handled.

**What to look for in code/outputs:**
- Missing-data handling for both tests (complete-case, imputation, verification bias correction) documented with counts

### Item 17 -- Analyses of variability

**Description:** Any analyses of variability in diagnostic accuracy, distinguishing pre-specified from exploratory.

**What to look for in code/outputs:**
- Subgroup accuracy analyses (by site, severity, demographics) labelled as pre-specified or exploratory

### Item 18 -- Intended sample size

**Description:** Intended sample size and how it was determined.

**What to look for in code/outputs:**
- Sample size calculation code or documentation targeting precision of sensitivity/specificity, with the assumed prevalence

---

## Results -- Participants

### Item 19 -- Flow of participants

**Description:** Flow of participants, using a diagram.

**What to look for in code/outputs:**
- STARD flow diagram generated from logged counts: eligible, received index test, received reference standard, included in the 2x2 table, with reasons for exclusion

### Item 20 -- Baseline characteristics

**Description:** Baseline demographic and clinical characteristics of participants.

**What to look for in code/outputs:**
- Table 1 of demographic and clinical characteristics

### Item 21a -- Disease severity in those with the target condition

**Description:** Distribution of severity of disease in those with the target condition.

**What to look for in code/outputs:**
- Severity or stage distribution among reference-positive participants

### Item 21b -- Alternative diagnoses in those without the target condition

**Description:** Distribution of alternative diagnoses in those without the target condition.

**What to look for in code/outputs:**
- Tabulation of alternative diagnoses among reference-negative participants

### Item 22 -- Time interval and interventions between tests

**Description:** Time interval and any clinical interventions between index test and reference standard.

**What to look for in code/outputs:**
- Computed interval between index test and reference standard dates (median, range)
- Documentation of treatments given between the two tests

---

## Results -- Test results

### Item 23 -- Cross tabulation

**Description:** Cross tabulation of the index test results (or their distribution) by the results of the reference standard.

**What to look for in code/outputs:**
- 2x2 table (TP, FP, FN, TN) or the distribution of continuous index results by reference status

### Item 24 -- Estimates of diagnostic accuracy

**Description:** Estimates of diagnostic accuracy and their precision (such as 95% confidence intervals).

**What to look for in code/outputs:**
- Accuracy estimates reported with 95% confidence intervals

### Item 25 -- Adverse events

**Description:** Any adverse events from performing the index test or the reference standard.

**What to look for in code/outputs:**
- Adverse event counts for each test, or an explicit statement that none occurred

---

## Discussion

### Item 26 -- Study limitations

**Description:** Study limitations, including sources of potential bias, statistical uncertainty, and generalisability.

**What to look for in code/outputs:**
- Limitations covering bias sources (spectrum, verification, incorporation), imprecision, and generalisability

### Item 27 -- Implications for practice

**Description:** Implications for practice, including the intended use and clinical role of the index test.

**What to look for in code/outputs:**
- Conclusions linked back to the intended use and clinical role stated under item 3

---

## Other information

### Item 28 -- Registration

**Description:** Registration number and name of registry.

**What to look for in code/outputs:**
- Registry name and identifier (e.g., ClinicalTrials.gov NCT number) in documentation

### Item 29 -- Protocol

**Description:** Where the full study protocol can be accessed.

**What to look for in code/outputs:**
- Link to the protocol or the protocol file in the repository

### Item 30 -- Sources of funding

**Description:** Sources of funding and other support; role of funders.

**What to look for in code/outputs:**
- Funding acknowledgment with grant numbers and a statement on the role of funders
