# PRISMA-DTA Checklist for Systematic Reviews of Diagnostic Test Accuracy

Preferred Reporting Items for Systematic Reviews and Meta-Analyses of Diagnostic Test Accuracy (PRISMA-DTA).
Extension of PRISMA for systematic reviews and meta-analyses of diagnostic test accuracy studies.

**Primary reference:** McInnes MDF, Moher D, Thombs BD, McGrath TA, Bossuyt PM; and the PRISMA-DTA Group. Preferred Reporting Items for a Systematic Review and Meta-analysis of Diagnostic Test Accuracy Studies: The PRISMA-DTA Statement. JAMA. 2018;319(4):388-396. doi:10.1001/jama.2017.19163. PMID: 29362800.

**Explanation and elaboration:** Salameh JP, Bossuyt PM, McGrath TA, et al. Preferred reporting items for systematic review and meta-analysis of diagnostic test accuracy studies (PRISMA-DTA): explanation, elaboration, and checklist. BMJ. 2020;370:m2632. doi:10.1136/bmj.m2632. PMID: 32816740.

This checklist extends the 2009 PRISMA statement with items specific to diagnostic accuracy reviews. Items marked with an asterisk (*) are new additions or modifications from base PRISMA. Apply when reporting a systematic review or meta-analysis where the primary aim is to assess the accuracy of one or more index tests against a reference standard.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review and/or meta-analysis of diagnostic test accuracy. *

**What to look for in code/outputs:**
- Report title specifying systematic review or meta-analysis and naming the index test
- Title identifying the target condition or the clinical question
- Keywords including "diagnostic accuracy," "sensitivity," "specificity," and the test name
- Structured abstract consistent with the DTA review scope

---

## Abstract

### Item 2 -- Structured summary

**Description:** Provide a structured summary including, as applicable: background, objectives, data sources, study eligibility criteria, participants, index test(s), reference standard(s), synthesis methods, results (including estimates of sensitivity and specificity), and conclusions. *

**What to look for in code/outputs:**
- Abstract reporting pooled sensitivity and specificity with confidence intervals
- Index test and reference standard named explicitly in abstract
- Number of studies and total participant count in abstract
- Summary ROC or HSROC point estimates reported

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe the rationale for the review in the context of what is already known, specifically including mention of why accurate diagnosis is important in the context of this clinical question.

**What to look for in code/outputs:**
- Documentation of clinical context and importance of accurate diagnosis
- Literature review of existing accuracy estimates or prior systematic reviews
- Articulation of the knowledge gap motivating the review
- Description of consequences of false-positive and false-negative results in this context

### Item 4 -- Objectives

**Description:** Provide an explicit statement of questions being addressed with reference to participants, index test(s), reference standard, and target condition (PIRT). *

**What to look for in code/outputs:**
- PIRT framework (Participants, Index test, Reference standard, Target condition) specified
- Primary and secondary research questions documented
- Subgroup or threshold-specific questions prespecified
- Study outcomes (sensitivity, specificity, likelihood ratios, AUC) named

---

## Methods

### Item 5 -- Protocol and registration

**Description:** Indicate if a review protocol exists, if and where it can be accessed (e.g., Web address), and, if available, provide registration information including registration number.

**What to look for in code/outputs:**
- PROSPERO registration number or other review registry reference
- Published protocol DOI or URL
- Deviation log or amendment documentation if protocol was modified
- Date of registration relative to data collection

### Item 6 -- Eligibility criteria

**Description:** Specify study characteristics (e.g., PIRT, minimum sample size, length of follow-up) and report characteristics (e.g., years considered, language, publication status) used as criteria for eligibility, giving rationale. *

**What to look for in code/outputs:**
- Eligibility criteria documented including study design restrictions
- Index test specification (modality, technology, threshold if fixed)
- Reference standard specification and acceptability criteria
- Language, publication status, and date restrictions with rationale

### Item 7 -- Information sources

**Description:** Describe all information sources (e.g., databases with dates of coverage, contact with study authors to identify additional studies) in the search and the date last searched.

**What to look for in code/outputs:**
- Database list with coverage dates (MEDLINE, EMBASE, Cochrane, others)
- Grey literature and conference abstract searches documented
- Date last searched specified
- Supplementary search strategies (reference lists, citation tracking, expert contact)

### Item 8 -- Search

**Description:** Present the full electronic search strategy for at least one database, including any limits used, such that it could be repeated.

**What to look for in code/outputs:**
- Full reproducible search string for at least one database in supplementary materials
- MeSH terms, free-text terms, and Boolean operators documented
- Search filters applied (date, language, human subjects) specified
- Search strategy peer-reviewed or validated using known-item testing

### Item 9 -- Study selection

**Description:** State the process for selecting studies (i.e., screening, eligibility, included in systematic review, and, if applicable, included in the meta-analysis).

**What to look for in code/outputs:**
- Two-stage screening process (title/abstract then full-text) documented
- Number of independent screeners and conflict resolution method described
- PRISMA flow diagram generation code with counts at each stage
- Cohen's kappa or percent agreement between screeners reported

### Item 10 -- Data collection process

**Description:** Describe the method of data extraction from reports (e.g., piloted forms, independently, in duplicate) and any process for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Data extraction form template or codebook
- Dual extraction with reconciliation process documented
- Author contact log for missing or unclear data
- Standardized variable names for TP, FP, FN, TN counts

### Item 11 -- Data items

**Description:** List and define all variables for which data were sought (e.g., PIRT, study characteristics, index test and reference standard details, sources of variability, risk of bias) and any assumptions made. *

**What to look for in code/outputs:**
- Complete extraction variable list including TP, FP, FN, TN for each threshold
- Index test technical parameters extracted (manufacturer, protocol, reader training)
- Reference standard procedure and interpretation criteria extracted
- Threshold or cutoff values extracted per study

### Item 12 -- Risk of bias in individual studies

**Description:** Describe methods used for assessing the risk of bias of individual studies (including specification of whether this was done at the study or outcome level) and how this information is to be used in any data synthesis. *

**What to look for in code/outputs:**
- QUADAS-2 implementation with domain ratings (Patient selection, Index test, Reference standard, Flow and timing)
- Risk of bias judgments (low, high, unclear) coded per domain per study
- Applicability concerns assessed separately from risk of bias
- Risk of bias summary plots or tables generated

### Item 13 -- Summary measures

**Description:** State the principal summary measures (e.g., sensitivity and specificity, likelihood ratios, diagnostic odds ratio, area under the ROC curve). Describe the rationale for the choice of cut-points of the index test, where applicable. *

**What to look for in code/outputs:**
- Primary accuracy measures specified (paired sensitivity/specificity vs. DOR vs. AUC)
- Threshold selection rationale documented (prespecified vs. study-reported vs. optimal)
- Secondary measures (likelihood ratios, predictive values) defined
- AUC or SROC curve as a planned synthesis output

### Item 14 -- Synthesis of results

**Description:** Describe the methods of handling data and combining results of studies, including measures of consistency (for each meta-analysis). Describe any planned exploration of between-study heterogeneity, including subgroup analyses and meta-regression analyses in relation to the index test, reference standard, and clinical characteristics of the included studies. *

**What to look for in code/outputs:**
- Bivariate model or HSROC (Hierarchical Summary ROC) implementation specified
- Random-effects meta-analysis code for sensitivity and specificity
- Heterogeneity quantification (I-squared, tau-squared for sensitivity and specificity)
- Subgroup analyses prespecified by index test variation, reference standard, or population
- Meta-regression code for covariates hypothesized to explain heterogeneity

### Item 15 -- Risk of bias across studies

**Description:** Specify any assessment of risk of bias that may affect the cumulative evidence (e.g., publication bias, selective reporting within studies).

**What to look for in code/outputs:**
- Publication bias assessment code (Deeks' funnel plot asymmetry test for DTA)
- Selective threshold reporting assessment
- Comparison of registered vs. reported outcomes where applicable
- Sensitivity analyses excluding high-risk-of-bias studies

### Item 16 -- Additional analyses

**Description:** Describe methods of additional analyses (e.g., sensitivity analyses, subgroup analyses, meta-regression), if done, indicating which were pre-specified.

**What to look for in code/outputs:**
- Sensitivity analysis code excluding studies with high risk of bias
- Subgroup analysis by index test modality, patient setting, or reference standard
- Meta-regression implementation with covariate definitions
- Pre-specified vs. post-hoc analysis labeling in code comments

---

## Results

### Item 17 -- Study selection

**Description:** Give numbers of studies screened, assessed for eligibility, and included in the review, with reasons for exclusions at each stage, ideally with a flow diagram.

**What to look for in code/outputs:**
- PRISMA flow diagram generated with counts at each stage
- Exclusion reasons tabulated with frequencies
- Total studies included in qualitative synthesis vs. meta-analysis reported
- Studies included in each subgroup or threshold analysis counted

### Item 18 -- Study characteristics

**Description:** For each study, present characteristics for which data were extracted (e.g., study size, PIRT, index test details, reference standard, and prevalence of target condition) and provide the citations. *

**What to look for in code/outputs:**
- Summary table of included studies with PIRT characteristics
- Index test technical parameters per study (modality, threshold, operator)
- Reference standard procedure and criteria per study
- Target condition prevalence per study reported

### Item 19 -- Risk of bias within studies

**Description:** Present data on risk of bias of each included study and, if available, any outcome-level assessment. *

**What to look for in code/outputs:**
- QUADAS-2 domain ratings displayed per study (traffic light plot or table)
- Applicability concerns reported alongside risk of bias judgments
- Proportion of studies with high/unclear risk of bias per domain summarized
- Sensitivity analysis results comparing high vs. low risk-of-bias studies

### Item 20 -- Results of individual studies

**Description:** For all outcomes considered (benefits or harms), present, for each study: (a) simple summary data for each intervention group, and (b) effect estimates and confidence intervals, ideally with a forest plot. *

**What to look for in code/outputs:**
- 2x2 table data (TP, FP, FN, TN) or sensitivity/specificity per study with 95% CIs
- Forest plots of sensitivity and specificity across studies generated
- Study-level data displayed at each threshold analyzed
- Confidence intervals computed using exact binomial or score methods

### Item 21 -- Synthesis of results

**Description:** Present results of each meta-analysis done, including confidence intervals and measures of consistency. *

**What to look for in code/outputs:**
- Pooled sensitivity and specificity with 95% confidence and prediction regions
- SROC curve with confidence and prediction ellipses generated as figure
- Heterogeneity statistics (I-squared, tau-squared) reported for both sensitivity and specificity
- Bivariate model parameter estimates (mu, sigma, rho) reported

### Item 22 -- Risk of bias across studies

**Description:** Present results of any assessment of risk of bias across studies (see Item 15).

**What to look for in code/outputs:**
- Deeks' funnel plot asymmetry test result reported
- Egger's or related test for small-study effects implemented
- Sensitivity analysis results comparing subsets by risk-of-bias rating
- Publication bias discussion contextualizing test limitations for DTA reviews

### Item 23 -- Additional analyses

**Description:** Give results of additional analyses, if done (e.g., sensitivity or subgroup analyses, meta-regression [see Item 16]).

**What to look for in code/outputs:**
- Subgroup and meta-regression results tabulated or plotted
- Pre-specified vs. exploratory status labeled for each additional analysis
- Comparison of pooled estimates across subgroups reported
- Covariate coefficients and confidence intervals from meta-regression reported

---

## Discussion

### Item 24 -- Summary of evidence

**Description:** Summarize the main findings including the strength of evidence for each main outcome; consider their relevance to key groups (e.g., healthcare providers, users, and policy makers).

**What to look for in code/outputs:**
- Summary of pooled sensitivity and specificity with clinical interpretation
- Strength-of-evidence statement referencing heterogeneity and risk-of-bias findings
- Clinical utility framed in terms of false-positive and false-negative rates
- Comparison with prior systematic reviews or manufacturer-reported accuracy claims

### Item 25 -- Limitations

**Description:** Discuss limitations at study and outcome level (e.g., risk of bias), and at review level (e.g., incomplete retrieval of identified research, reporting bias).

**What to look for in code/outputs:**
- Limitation discussion referencing QUADAS-2 domain findings
- Grey literature and language restriction impact acknowledged
- Threshold heterogeneity across studies discussed as limitation
- Between-study heterogeneity sources that could not be explained

### Item 26 -- Conclusions

**Description:** Provide a general interpretation of the results in the context of other evidence, and implications for future research.

**What to look for in code/outputs:**
- Conclusion referencing both summary accuracy and certainty of evidence
- Implications for clinical use at the tested threshold(s)
- Recommended future research (prospective validation, threshold standardization, head-to-head comparisons)
- Explicit statement on readiness for clinical implementation

---

## Funding

### Item 27 -- Funding

**Description:** Describe sources of funding for the systematic review and other support (e.g., supply of data); role of funders for the systematic review.

**What to look for in code/outputs:**
- Funding acknowledgment section in report
- Conflict of interest disclosures for all authors
- Role of funder in search, selection, analysis, or reporting stated
- Independence of review from test manufacturer or commercial interest
