# PRISMA-DTA Checklist for Systematic Reviews of Diagnostic Test Accuracy

## Contents

- Title
- Abstract
- Introduction
- Methods
- Results
- Discussion
- Funding

Preferred Reporting Items for Systematic Reviews and Meta-Analyses of Diagnostic Test Accuracy (PRISMA-DTA).
Stand-alone extension of PRISMA for systematic reviews and meta-analyses of diagnostic test accuracy studies.

**Primary reference:** McInnes MDF, Moher D, Thombs BD, McGrath TA, Bossuyt PM; and the PRISMA-DTA Group. Preferred Reporting Items for a Systematic Review and Meta-analysis of Diagnostic Test Accuracy Studies: The PRISMA-DTA Statement. JAMA. 2018;319(4):388-396. doi:10.1001/jama.2017.19163. PMID: 29362800. Erratum: JAMA. 2019;322(20):2026. doi:10.1001/jama.2019.18307. PMID: 31769809.

**Explanation and elaboration:** Salameh JP, Bossuyt PM, McGrath TA, et al. Preferred reporting items for systematic review and meta-analysis of diagnostic test accuracy studies (PRISMA-DTA): explanation, elaboration, and checklist. BMJ. 2020;370:m2632. doi:10.1136/bmj.m2632. PMID: 32816740.

**Source and licence:** Item IDs and order follow the official PRISMA-DTA checklist (https://www.prisma-statement.org/s/PRISMA-DTA-Checklist-xh5j.pdf). That checklist carries no open licence, so the descriptions are faithful paraphrases: every element of each official item is kept and nothing is added. Use the official PDF for verbatim wording. Abstracts follow the separate PRISMA-DTA for Abstracts checklist. The "What to look for" cues are added by this plugin.

PRISMA-DTA has 27 items. It was built on the 2009 PRISMA statement: 8 items unchanged, 17 modified, 2 added (D1, D2), and 2 omitted (PRISMA 2009 items 15 and 22, risk of bias across studies). Items are numbered as in the official checklist, so the sequence runs 1-14, D1-D2 placed as shown, 16-21, then 23-27. Apply it when the review's primary aim is to assess the accuracy of one or more index tests against a reference standard. Appraise the included studies with QUADAS-3 (or QUADAS-2 when pre-specified).

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review (with or without meta-analysis) of diagnostic test accuracy (DTA) studies.

**What to look for in code/outputs:**
- Report title naming the review as a systematic review of diagnostic test accuracy
- Title generation code or template including "diagnostic test accuracy" or "diagnostic accuracy"

---

## Abstract

### Item 2 -- Abstract

**Description:** For the abstract, see the PRISMA-DTA for Abstracts checklist.

**What to look for in code/outputs:**
- Abstract covering the PRISMA-DTA for Abstracts items, including summary sensitivity and specificity with confidence intervals
- Registration number in the abstract or metadata

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe why the review was done, in the context of what is already known.

**What to look for in code/outputs:**
- Introductory report sections citing prior evidence and gaps

### Item D1 -- Clinical role of index test

**Description:** State the scientific and clinical background, including the intended use and clinical role of the index test. Where applicable, give the rationale for the minimally acceptable test accuracy (or, for comparative designs, the minimum difference in accuracy).

**What to look for in code/outputs:**
- Documented intended use (diagnosis, screening, staging) and role (triage, replacement, add-on) of the index test
- Pre-specified minimally acceptable accuracy targets or comparative margins, with justification

### Item 4 -- Objectives

**Description:** Give an explicit statement of the question(s) being addressed in terms of participants, index test(s), and target condition(s).

**What to look for in code/outputs:**
- Review question naming participants, index test(s), and target condition(s) in the protocol or config

---

## Methods

### Item 5 -- Protocol and registration

**Description:** State whether a review protocol exists and whether and where it can be accessed (e.g., web address). If available, give registration information including the registration number.

**What to look for in code/outputs:**
- PROSPERO registration number or protocol link in documentation

### Item 6 -- Eligibility criteria

**Description:** Specify the study characteristics (participants, setting, index test(s), reference standard(s), target condition(s), and study design) and report characteristics (e.g., years considered, language, publication status) used as eligibility criteria, with rationale.

**What to look for in code/outputs:**
- Inclusion/exclusion criteria covering participants, setting, index test, reference standard, target condition, and design
- Filter logic for report characteristics (years, language, publication status) with rationale

### Item 7 -- Information sources

**Description:** Describe all information sources searched (e.g., databases with dates of coverage, contact with study authors to identify additional studies) and the date of the last search.

**What to look for in code/outputs:**
- Database names, coverage dates, and last-search dates recorded in logs or metadata
- Supplementary sources documented

### Item 8 -- Search

**Description:** Present the full search strategies for all electronic databases and other sources searched, including any limits used, so that they could be repeated.

**What to look for in code/outputs:**
- Complete search strings for every database and other source (not just one), with limits recorded

### Item 9 -- Study selection

**Description:** State the process for selecting studies (screening, eligibility, inclusion in the systematic review, and, if applicable, inclusion in the meta-analysis).

**What to look for in code/outputs:**
- Screening workflow configuration with dual screening and disagreement resolution documented
- Counts at each selection stage

### Item 10 -- Data collection process

**Description:** Describe the method of data extraction from reports (e.g., piloted forms, independently, in duplicate) and any processes for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Extraction form templates and dual-extraction documentation
- Logs of author contact to obtain 2x2 data

### Item 11 -- Definitions for data extraction

**Description:** Give the definitions used in data extraction and the classifications of target condition(s), index test(s), reference standard(s), and other characteristics (e.g., study design, clinical setting).

**What to look for in code/outputs:**
- Data dictionary defining target condition, index test, reference standard, study design, and setting categories

### Item 12 -- Risk of bias and applicability

**Description:** Describe the methods used to assess risk of bias in individual studies and concerns about applicability to the review question.

**What to look for in code/outputs:**
- QUADAS-3 (or QUADAS-2) assessment fields recording risk-of-bias and applicability judgments separately
- Review-specific tailoring of signalling questions documented

### Item 13 -- Diagnostic accuracy measures

**Description:** State the principal diagnostic accuracy measure(s) reported (e.g., sensitivity, specificity) and the unit of assessment (e.g., per patient, per lesion).

**What to look for in code/outputs:**
- Accuracy measures specified in analysis code
- Unit of analysis (patient, lesion, sample) recorded per study, with handling of clustered units

### Item 14 -- Synthesis of results

**Description:** Describe the methods for handling data, combining study results, and describing variability between studies. This may include, but is not limited to, handling of: (a) multiple definitions of the target condition; (b) multiple thresholds of test positivity; (c) multiple index test readers; (d) indeterminate test results; (e) grouping and comparing tests; and (f) different reference standards.

**What to look for in code/outputs:**
- Rules selecting one 2x2 table per study when several definitions, thresholds, or readers are reported
- Handling of indeterminate results and of differing reference standards
- Methods for describing between-study variability (e.g., forest plots of sensitivity and specificity, ROC space plots)

### Item D2 -- Meta-analysis

**Description:** Report the statistical methods used for meta-analysis, if one was performed.

**What to look for in code/outputs:**
- Bivariate random-effects or HSROC model code (e.g., R mada, metandi, meqrlogit, Stan) with software versions
- Model specification, estimation method, and handling of zero cells

### Item 16 -- Additional analyses

**Description:** Describe the methods of any additional analyses (e.g., sensitivity or subgroup analyses, meta-regression), indicating which were pre-specified.

**What to look for in code/outputs:**
- Meta-regression or subgroup code with covariates, labelled pre-specified or post hoc

---

## Results

### Item 17 -- Study selection

**Description:** Give the numbers of studies screened, assessed for eligibility, and included in the review (and in the meta-analysis, if applicable), with reasons for exclusion at each stage, ideally with a flow diagram.

**What to look for in code/outputs:**
- Flow diagram with counts including the number entering the meta-analysis
- Exclusion reasons tabulated at the full-text stage

### Item 18 -- Study characteristics

**Description:** For each included study, give the citation and key characteristics, including: (a) participant characteristics (presentation, prior testing); (b) clinical setting; (c) study design; (d) target condition definition; (e) index test; (f) reference standard; (g) sample size; and (h) funding sources.

**What to look for in code/outputs:**
- Characteristics table with all eight elements (a)-(h) per study, plus citations

### Item 19 -- Risk of bias and applicability

**Description:** Present the evaluation of risk of bias and of concerns about applicability for each study.

**What to look for in code/outputs:**
- Per-study, per-domain risk-of-bias and applicability judgments in tables or figures

### Item 20 -- Results of individual studies

**Description:** For each analysis in each study (e.g., each unique combination of index test, reference standard, and positivity threshold), report the 2x2 data (TP, FP, FN, TN) with estimates of diagnostic accuracy and confidence intervals, ideally with a forest plot or receiver operating characteristic (ROC) plot.

**What to look for in code/outputs:**
- Per-study 2x2 counts with sensitivity and specificity and their CIs
- Paired forest plots or ROC-space plots for each analysis

### Item 21 -- Synthesis of results

**Description:** Describe test accuracy, including its variability. If meta-analysis was done, include the results and confidence intervals.

**What to look for in code/outputs:**
- Summary sensitivity and specificity (or SROC curve) with confidence and prediction regions
- Description of between-study variability

### Item 23 -- Additional analysis

**Description:** Give the results of any additional analyses (e.g., sensitivity or subgroup analyses, meta-regression; analyses of the index test such as failure rates, proportion of inconclusive results, and adverse events).

**What to look for in code/outputs:**
- Subgroup or meta-regression outputs
- Index test failure rates, inconclusive-result proportions, and adverse events summarized

---

## Discussion

### Item 24 -- Summary of evidence

**Description:** Summarize the main findings, including the strength of the evidence.

**What to look for in code/outputs:**
- Key results section with certainty of evidence for each accuracy estimate

### Item 25 -- Limitations

**Description:** Discuss limitations arising from the included studies (e.g., risk of bias and concerns about applicability) and from the review process (e.g., incomplete retrieval of identified research).

**What to look for in code/outputs:**
- Limitations covering both study-level (QUADAS) concerns and review-process gaps

### Item 26 -- Conclusions

**Description:** Give a general interpretation of the results in the context of other evidence, and discuss implications for future research and clinical practice (e.g., the intended use and clinical role of the index test).

**What to look for in code/outputs:**
- Conclusions tied to the intended use and clinical role stated under D1

---

## Funding

### Item 27 -- Funding

**Description:** For the systematic review, describe the sources of funding and other support, and the role of the funders.

**What to look for in code/outputs:**
- Funding acknowledgment with grant numbers and the role of funders
