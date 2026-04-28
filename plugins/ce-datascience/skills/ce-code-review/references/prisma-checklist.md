# PRISMA Checklist for Systematic Reviews and Meta-Analyses

Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA).
27-item checklist applicable to systematic reviews and meta-analyses.

**Primary reference:** Moher D, Liberati A, Tetzlaff J, Altman DG; PRISMA Group. Preferred reporting items for systematic reviews and meta-analyses: the PRISMA statement. PLoS Med. 2009;6(7):e1000097. doi:10.1371/journal.pmed.1000097. PMID: 19621072.

**Explanation and elaboration:** Liberati A, Altman DG, Tetzlaff J, et al. The PRISMA statement for reporting systematic reviews and meta-analyses of studies that evaluate health care interventions: explanation and elaboration. PLoS Med. 2009;6(7):e1000100. doi:10.1371/journal.pmed.1000100. PMID: 19621070.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review, meta-analysis, or both.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "systematic review," "meta-analysis," or both
- Title generation code or manuscript template that includes the study type designation
- Output documents or compiled reports whose title clearly identifies the review methodology

---

## Abstract

### Item 2 -- Structured summary

**Description:** Provide a structured summary including, as applicable: background, objectives, data sources, study eligibility criteria, participants, interventions, study appraisal and synthesis methods, results, limitations, conclusions and implications of key findings, and systematic review registration number.

**What to look for in code/outputs:**
- Abstract template or generation code with structured sections (background, objectives, methods, results, conclusions)
- Registration number (e.g., PROSPERO) referenced in the abstract or document metadata
- Rendered summary sections that cover eligibility criteria, data sources, and synthesis approach
- Key quantitative findings (pooled estimates, heterogeneity measures) included in the abstract output

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe the rationale for the review in the context of what is already known.

**What to look for in code/outputs:**
- Introductory markdown cells or report sections citing prior reviews or knowledge gaps
- Documentation linking the review to a specific clinical or policy question
- References to existing evidence that motivates the current systematic review

### Item 4 -- Objectives

**Description:** Provide an explicit statement of questions being addressed with reference to participants, interventions, comparisons, outcomes, and study design (PICOS).

**What to look for in code/outputs:**
- PICOS framework documented in protocol, report preamble, or config file
- Explicit research question statements mapping to population, intervention, comparator, outcome, and study design
- Search strategy documentation that operationalizes the stated objectives

---

## Methods

### Item 5 -- Protocol and registration

**Description:** Indicate if a review protocol exists, if and where it can be accessed (e.g., Web address), and, if available, provide registration information including registration number.

**What to look for in code/outputs:**
- PROSPERO registration number or protocol DOI referenced in documentation
- Link to a published or deposited protocol document
- Protocol file included in the project repository or referenced in analysis metadata

### Item 6 -- Eligibility criteria

**Description:** Specify study characteristics (e.g., PICOS, length of follow-up) and report characteristics (e.g., years considered, language, publication status) used as criteria for eligibility, giving rationale.

**What to look for in code/outputs:**
- Inclusion/exclusion criteria documented in screening code, config files, or protocol
- Filter logic applied to search results (publication year range, language, study design)
- PICOS-based eligibility criteria operationalized in screening tool configuration
- Rationale for each criterion documented alongside the filter specification

### Item 7 -- Information sources

**Description:** Describe all information sources (e.g., databases with dates of coverage, contact with study authors to identify additional studies) in the search and date last searched.

**What to look for in code/outputs:**
- Database names and date ranges documented (e.g., MEDLINE, Embase, Cochrane, CINAHL)
- Search execution dates recorded in code comments, logs, or metadata files
- Documentation of supplementary sources (grey literature, trial registries, reference list screening, expert consultation)
- API query logs or search history exports from bibliographic databases

### Item 8 -- Search

**Description:** Present full electronic search strategy for at least one database, including any limits used, such that it could be repeated.

**What to look for in code/outputs:**
- Complete search strings with Boolean operators, MeSH terms, and field tags
- Search strategy files or appendix documents included in the project
- Database-specific syntax documented for reproducibility
- Search filters and limits (date, language, publication type) explicitly recorded

### Item 9 -- Study selection

**Description:** State the process for selecting studies (i.e., screening, eligibility, included in systematic review, and, if applicable, included in meta-analysis).

**What to look for in code/outputs:**
- Screening workflow code or tool configuration (Covidence, Rayyan, custom scripts)
- Dual-reviewer screening process documented with inter-rater agreement metrics
- PRISMA flow diagram generation code or rendered flow diagram output
- Counts at each screening stage (identified, screened, assessed for eligibility, included)

### Item 10 -- Data collection process

**Description:** Describe method of data extraction from reports (e.g., piloted forms, independently, in duplicate) and any processes for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Data extraction form templates or structured extraction tools
- Code for parsing or importing extracted data from standardized forms
- Documentation of dual extraction and discrepancy resolution procedures
- Correspondence logs or scripts for contacting study authors

### Item 11 -- Data items

**Description:** List and define all variables for which data were sought (e.g., PICOS, funding sources) and any assumptions and simplifications made.

**What to look for in code/outputs:**
- Data dictionary defining all extracted variables with definitions and coding rules
- Variable list in extraction code or database schema
- Documentation of assumptions for missing or ambiguous data fields
- PICOS elements mapped to specific extracted variables

### Item 12 -- Risk of bias in individual studies

**Description:** Describe methods used for assessing risk of bias of individual studies (including specification of whether this was done at the study or outcome level), and how this information is to be used in any data synthesis.

**What to look for in code/outputs:**
- Risk of bias assessment tool specified (Cochrane RoB 2, ROBINS-I, Newcastle-Ottawa Scale, etc.)
- Domain-level bias ratings coded in extraction data
- Code that incorporates risk of bias into sensitivity analyses or subgroup analyses
- Summary risk of bias tables or traffic-light plots generated in outputs

### Item 13 -- Summary measures

**Description:** State the principal summary measures (e.g., risk ratio, difference in means).

**What to look for in code/outputs:**
- Effect measure specification in meta-analysis code (OR, RR, HR, MD, SMD)
- Documentation of rationale for chosen summary measure
- Code that calculates or transforms effect estimates into the specified metric
- Output tables or forest plots displaying the chosen summary measure with confidence intervals

### Item 14 -- Synthesis of results

**Description:** Describe the methods of handling data and combining results of studies, if done, including measures of consistency (e.g., I-squared) for each meta-analysis.

**What to look for in code/outputs:**
- Meta-analysis code using established packages (metafor, meta, RevMan, metan)
- Fixed-effect vs. random-effects model specification with justification
- Heterogeneity statistics computed (I-squared, Q statistic, tau-squared, prediction intervals)
- Forest plot generation code with pooled estimates and heterogeneity annotations

### Item 15 -- Risk of bias across studies

**Description:** Specify any assessment of risk of bias that may affect the cumulative evidence (e.g., publication bias, selective reporting within studies).

**What to look for in code/outputs:**
- Funnel plot generation code for visual assessment of publication bias
- Statistical tests for publication bias (Egger test, Begg test, Peters test)
- Trim-and-fill analysis or selection model code
- Assessment of selective outcome reporting across included studies

### Item 16 -- Additional analyses

**Description:** Describe methods of additional analyses (e.g., sensitivity or subgroup analyses, meta-regression), if done, indicating which were pre-specified.

**What to look for in code/outputs:**
- Subgroup analysis code with pre-specified moderator variables
- Meta-regression models with covariates documented
- Sensitivity analysis code (leave-one-out, influence diagnostics, alternative model specifications)
- Documentation distinguishing pre-specified from post-hoc additional analyses

---

## Results

### Item 17 -- Study selection

**Description:** Give numbers of studies screened, assessed for eligibility, and included in the review, with reasons for exclusions at each stage, ideally with a flow diagram.

**What to look for in code/outputs:**
- PRISMA flow diagram rendered as a figure (using PRISMA2020, PRISMAstatement, or custom plotting code)
- Counts at each stage: records identified, duplicates removed, screened, excluded, full-text assessed, included
- Exclusion reasons tabulated at the full-text review stage
- Flow diagram data exported or logged programmatically

### Item 18 -- Study characteristics

**Description:** For each study, present characteristics for which data were extracted (e.g., study size, PICOS, follow-up period) and provide the citations.

**What to look for in code/outputs:**
- Characteristics of included studies table generated in code (study ID, design, sample size, population, intervention, comparator, outcomes, follow-up)
- Citation list or bibliography of included studies
- Summary statistics across included studies (range of sample sizes, follow-up durations)
- Data frame or structured output containing per-study extracted characteristics

### Item 19 -- Risk of bias within studies

**Description:** Present data on risk of bias of each study and, if available, any outcome-level assessment.

**What to look for in code/outputs:**
- Risk of bias summary figure (traffic-light plot or summary bar chart)
- Per-study, per-domain risk of bias ratings in tabular output
- Code generating risk of bias visualizations (robvis, custom plotting functions)
- Outcome-level bias assessments when applicable

### Item 20 -- Results of individual studies

**Description:** For all outcomes considered (benefits or harms), present, for each study: (a) simple summary data for each intervention group and (b) effect estimates and confidence intervals, ideally with a forest plot.

**What to look for in code/outputs:**
- Forest plot code displaying individual study estimates with confidence intervals and pooled effect
- Per-study effect estimates tabulated with numerators, denominators, or means and standard deviations
- Data extraction tables with raw counts or continuous outcome summaries by arm
- Forest plots generated for each outcome (primary and secondary)

### Item 21 -- Synthesis of results

**Description:** Present results of each meta-analysis done, including confidence intervals and measures of consistency.

**What to look for in code/outputs:**
- Pooled effect estimates with 95% confidence intervals in output tables or forest plots
- Heterogeneity measures reported alongside each pooled result (I-squared, tau-squared, Q p-value)
- Prediction intervals reported for random-effects models
- Multiple meta-analyses clearly delineated by outcome or subgroup

### Item 22 -- Risk of bias across studies

**Description:** Present results of any assessment of risk of bias across studies.

**What to look for in code/outputs:**
- Funnel plots rendered with symmetry assessment annotations
- Publication bias test results (Egger p-value, Begg p-value) reported in output
- Trim-and-fill adjusted estimates displayed alongside primary results
- GRADE assessment of certainty of evidence incorporating publication bias domain

### Item 23 -- Additional analysis

**Description:** Give results of additional analyses, if done (e.g., sensitivity or subgroup analyses, meta-regression).

**What to look for in code/outputs:**
- Subgroup forest plots or meta-regression coefficient tables in output
- Leave-one-out sensitivity analysis plots or tables
- Influence diagnostic results (Cook's distance, DFBETAS for meta-regression)
- Comparison of results across pre-specified and exploratory analyses

---

## Discussion

### Item 24 -- Summary of evidence

**Description:** Summarize the main findings including the strength of evidence for each main outcome; consider their relevance to key groups (e.g., healthcare providers, users, and policy makers).

**What to look for in code/outputs:**
- Summary of findings table (e.g., GRADE evidence profile) generated in outputs
- Key results section in rendered reports mapping findings to each outcome
- Strength of evidence ratings (high, moderate, low, very low) alongside pooled estimates
- Interpretation contextualized for relevant stakeholders

### Item 25 -- Limitations

**Description:** Discuss limitations at the study and outcome level (e.g., risk of bias), and at the review level (e.g., incomplete retrieval of identified research, reporting bias).

**What to look for in code/outputs:**
- Limitation sections in report templates addressing both study-level and review-level concerns
- Sensitivity analysis results referenced in limitation discussion
- Documentation of search limitations, language restrictions, or missing data
- GRADE downgrading rationale documented for each domain

### Item 26 -- Conclusions

**Description:** Provide a general interpretation of the results in the context of other evidence, and implications for future research.

**What to look for in code/outputs:**
- Conclusion statements in rendered reports that link findings to the stated objectives
- Recommendations for future research based on identified evidence gaps
- Language appropriately qualifying certainty of conclusions based on evidence quality
- Implications for clinical practice or policy framed by the strength of evidence

---

## Funding

### Item 27 -- Funding

**Description:** Describe sources of funding for the systematic review and other support (e.g., supply of data); role of funders for the systematic review.

**What to look for in code/outputs:**
- Funding acknowledgment sections in report templates
- Grant numbers or funding source documentation
- Statement describing the role (or lack thereof) of funders in review conduct
- Conflict of interest disclosures for review authors
