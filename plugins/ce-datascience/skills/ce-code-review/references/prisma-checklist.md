# PRISMA 2020 Checklist for Systematic Reviews and Meta-Analyses

## Contents

- Title
- Abstract
- Introduction
- Methods
- Results
- Discussion
- Other information

Preferred Reporting Items for Systematic Reviews and Meta-Analyses (PRISMA 2020).
Current checklist applicable to systematic reviews, with or without meta-analysis. PRISMA 2020 replaces the 2009 statement.
27 items (42 rows counting the lettered sub-items 10a-b, 13a-f, 16a-b, 20a-d, 23a-d, and 24a-c) in seven sections.

**Current primary reference:** Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ. 2021;372:n71. doi:10.1136/bmj.n71. PMID: 33782057.

**Explanation and elaboration:** Page MJ, Moher D, Bossuyt PM, et al. PRISMA 2020 explanation and elaboration: updated guidance and exemplars for reporting systematic reviews. BMJ. 2021;372:n160. doi:10.1136/bmj.n160. PMID: 33781993.

**Legacy reference (superseded):** Moher D, Liberati A, Tetzlaff J, Altman DG; PRISMA Group. Preferred reporting items for systematic reviews and meta-analyses: the PRISMA statement. PLoS Med. 2009;6(7):e1000097. doi:10.1371/journal.pmed.1000097. PMID: 19621072.

**Source and licence:** Item numbers and descriptions are reproduced verbatim from Table 1 of the PRISMA 2020 statement (BMJ 2021;372:n71, PMC8005924), published under CC BY 4.0. Official checklist: https://www.prisma-statement.org/prisma-2020-checklist. The abstract item (2) refers to the 12-item PRISMA 2020 for Abstracts checklist (Table 2 of the same article). The "What to look for" cues are added by this plugin.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "systematic review" (and "meta-analysis" where one was done)
- Title generation code or manuscript template that includes the study type designation

---

## Abstract

### Item 2 -- Abstract

**Description:** See the PRISMA 2020 for Abstracts checklist.

**What to look for in code/outputs:**
- Abstract covering the 12 PRISMA 2020 for Abstracts items: title, objectives, eligibility criteria, information sources with last-search dates, risk-of-bias methods, synthesis methods, included studies, synthesis results, limitations of evidence, interpretation, funding, and registration
- Registration number (e.g., PROSPERO) in the abstract or document metadata
- Key quantitative findings (summary estimates with confidence/credible intervals, direction of effect) in the abstract output

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe the rationale for the review in the context of existing knowledge.

**What to look for in code/outputs:**
- Introductory report sections citing prior reviews or knowledge gaps
- Documentation linking the review to a specific clinical or policy question

### Item 4 -- Objectives

**Description:** Provide an explicit statement of the objective(s) or question(s) the review addresses.

**What to look for in code/outputs:**
- Explicit review question(s) in the protocol, report preamble, or config file (a PICO-style framing is common but not required)
- Search strategy documentation that operationalizes the stated objectives

---

## Methods

### Item 5 -- Eligibility criteria

**Description:** Specify the inclusion and exclusion criteria for the review and how studies were grouped for the syntheses.

**What to look for in code/outputs:**
- Inclusion/exclusion criteria documented in screening code, config files, or protocol
- Filter logic applied to search results (publication year range, language, study design)
- A grouping variable or mapping that assigns each study to a synthesis (e.g., intervention or comparison groups)

### Item 6 -- Information sources

**Description:** Specify all databases, registers, websites, organisations, reference lists and other sources searched or consulted to identify studies. Specify the date when each source was last searched or consulted.

**What to look for in code/outputs:**
- Database, register, and website names documented (e.g., MEDLINE, Embase, CENTRAL, ClinicalTrials.gov)
- Last-search date recorded for each source in logs or metadata files
- Documentation of supplementary sources (reference lists, organisations, contact with experts)

### Item 7 -- Search strategy

**Description:** Present the full search strategies for all databases, registers and websites, including any filters and limits used.

**What to look for in code/outputs:**
- Complete search strings for every database, register, and website, with Boolean operators, controlled vocabulary, and field tags
- Search strategy files or appendix documents stored verbatim in the project
- Filters and limits (date, language, publication type) explicitly recorded

### Item 8 -- Selection process

**Description:** Specify the methods used to decide whether a study met the inclusion criteria of the review, including how many reviewers screened each record and each report retrieved, whether they worked independently, and if applicable, details of automation tools used in the process.

**What to look for in code/outputs:**
- Screening workflow code or tool configuration (Covidence, Rayyan, ASReview, custom scripts)
- Number of screeners per record and per report, and whether screening was independent
- Configuration and version of any automation or machine-learning screening tool

### Item 9 -- Data collection process

**Description:** Specify the methods used to collect data from reports, including how many reviewers collected data from each report, whether they worked independently, any processes for obtaining or confirming data from study investigators, and if applicable, details of automation tools used in the process.

**What to look for in code/outputs:**
- Data extraction form templates or structured extraction tools
- Documentation of the number of extractors and how discrepancies were resolved
- Correspondence logs or scripts for contacting study investigators
- Configuration of any automated extraction tool

### Item 10a -- Data items: outcomes

**Description:** List and define all outcomes for which data were sought. Specify whether all results that were compatible with each outcome domain in each study were sought (e.g. for all measures, time points, analyses), and if not, the methods used to decide which results to collect.

**What to look for in code/outputs:**
- Outcome dictionary defining each outcome domain
- Documented rules for selecting among multiple measures, time points, or analyses per study

### Item 10b -- Data items: other variables

**Description:** List and define all other variables for which data were sought (e.g. participant and intervention characteristics, funding sources). Describe any assumptions made about any missing or unclear information.

**What to look for in code/outputs:**
- Data dictionary defining all non-outcome extracted variables with coding rules
- Documentation of assumptions for missing or ambiguous fields

### Item 11 -- Study risk of bias assessment

**Description:** Specify the methods used to assess risk of bias in the included studies, including details of the tool(s) used, how many reviewers assessed each study and whether they worked independently, and if applicable, details of automation tools used in the process.

**What to look for in code/outputs:**
- Risk-of-bias tool specified (RoB 2, ROBINS-I, QUADAS-3, etc.)
- Number of assessors per study and whether they worked independently
- Domain-level ratings coded in extraction data

### Item 12 -- Effect measures

**Description:** Specify for each outcome the effect measure(s) (e.g. risk ratio, mean difference) used in the synthesis or presentation of results.

**What to look for in code/outputs:**
- Effect measure specified per outcome in meta-analysis code (OR, RR, HR, MD, SMD)
- Code that calculates or transforms effect estimates into the specified metric

### Item 13a -- Synthesis methods: eligibility for each synthesis

**Description:** Describe the processes used to decide which studies were eligible for each synthesis (e.g. tabulating the study intervention characteristics and comparing against the planned groups for each synthesis (item #5)).

**What to look for in code/outputs:**
- Table or code mapping each study to the syntheses it contributes to
- Documented comparison of study characteristics against the planned synthesis groups

### Item 13b -- Synthesis methods: data preparation

**Description:** Describe any methods required to prepare the data for presentation or synthesis, such as handling of missing summary statistics, or data conversions.

**What to look for in code/outputs:**
- Code imputing missing SDs or converting medians/IQRs, SEs, or CIs to the analysis scale
- Documentation of each conversion formula and its source

### Item 13c -- Synthesis methods: tabulation and display

**Description:** Describe any methods used to tabulate or visually display results of individual studies and syntheses.

**What to look for in code/outputs:**
- Table and plotting code (forest plots, harvest plots, effect direction plots) with documented layout choices

### Item 13d -- Synthesis methods: synthesis

**Description:** Describe any methods used to synthesise results and provide a rationale for the choice(s). If meta-analysis was performed, describe the model(s), method(s) to identify the presence and extent of statistical heterogeneity, and software package(s) used.

**What to look for in code/outputs:**
- Meta-analysis code using established packages (metafor, meta, RevMan, metan) with versions recorded
- Model specification (common-effect or random-effects; tau-squared estimator; CI method) with rationale
- Heterogeneity statistics computed (I-squared, Q, tau-squared, prediction intervals)
- Synthesis without meta-analysis (e.g., SWiM vote counting by direction) documented when pooling was not done

### Item 13e -- Synthesis methods: heterogeneity exploration

**Description:** Describe any methods used to explore possible causes of heterogeneity among study results (e.g. subgroup analysis, meta-regression).

**What to look for in code/outputs:**
- Subgroup analysis or meta-regression code with pre-specified moderators flagged

### Item 13f -- Synthesis methods: sensitivity analyses

**Description:** Describe any sensitivity analyses conducted to assess robustness of the synthesised results.

**What to look for in code/outputs:**
- Sensitivity analysis code (leave-one-out, restriction to low risk of bias, alternative models)

### Item 14 -- Reporting bias assessment

**Description:** Describe any methods used to assess risk of bias due to missing results in a synthesis (arising from reporting biases).

**What to look for in code/outputs:**
- Funnel plot or small-study effect test code (Egger, Peters), selection models, or trim-and-fill
- Assessment of missing results using trial registers or protocols

### Item 15 -- Certainty assessment

**Description:** Describe any methods used to assess certainty (or confidence) in the body of evidence for an outcome.

**What to look for in code/outputs:**
- GRADE (or equivalent) approach specified, with domains and downgrading rules documented

---

## Results

### Item 16a -- Study selection: flow

**Description:** Describe the results of the search and selection process, from the number of records identified in the search to the number of studies included in the review, ideally using a flow diagram.

**What to look for in code/outputs:**
- PRISMA 2020 flow diagram rendered as a figure (e.g., PRISMA2020 R package or Shiny app, or custom plotting code)
- Counts at each stage: records identified per source, duplicates removed, screened, excluded, reports sought and assessed, studies included
- Flow diagram data exported or logged programmatically

### Item 16b -- Study selection: excluded studies

**Description:** Cite studies that might appear to meet the inclusion criteria, but which were excluded, and explain why they were excluded.

**What to look for in code/outputs:**
- Table of near-miss excluded studies with citations and exclusion reasons

### Item 17 -- Study characteristics

**Description:** Cite each included study and present its characteristics.

**What to look for in code/outputs:**
- Characteristics-of-included-studies table generated in code
- Citation list of included studies

### Item 18 -- Risk of bias in studies

**Description:** Present assessments of risk of bias for each included study.

**What to look for in code/outputs:**
- Per-study, per-domain risk-of-bias ratings in tabular output
- Risk-of-bias figures (e.g., robvis traffic-light plots)

### Item 19 -- Results of individual studies

**Description:** For all outcomes, present, for each study: (a) summary statistics for each group (where appropriate) and (b) an effect estimate and its precision (e.g. confidence/credible interval), ideally using structured tables or plots.

**What to look for in code/outputs:**
- Per-study summary statistics by group and effect estimates with intervals, for every outcome
- Forest plots or structured tables generated for each outcome

### Item 20a -- Results of syntheses: characteristics and risk of bias

**Description:** For each synthesis, briefly summarise the characteristics and risk of bias among contributing studies.

**What to look for in code/outputs:**
- Per-synthesis summary of contributing studies and their risk-of-bias profile

### Item 20b -- Results of syntheses: statistical results

**Description:** Present results of all statistical syntheses conducted. If meta-analysis was done, present for each the summary estimate and its precision (e.g. confidence/credible interval) and measures of statistical heterogeneity. If comparing groups, describe the direction of the effect.

**What to look for in code/outputs:**
- Summary estimates with 95% intervals for every synthesis
- Heterogeneity measures and prediction intervals reported alongside each pooled result
- Direction of effect stated for each comparison

### Item 20c -- Results of syntheses: heterogeneity investigations

**Description:** Present results of all investigations of possible causes of heterogeneity among study results.

**What to look for in code/outputs:**
- Subgroup forest plots or meta-regression coefficient tables

### Item 20d -- Results of syntheses: sensitivity analyses

**Description:** Present results of all sensitivity analyses conducted to assess the robustness of the synthesised results.

**What to look for in code/outputs:**
- Leave-one-out or alternative-model results presented next to the primary estimates

### Item 21 -- Reporting biases

**Description:** Present assessments of risk of bias due to missing results (arising from reporting biases) for each synthesis assessed.

**What to look for in code/outputs:**
- Funnel plots, small-study test results, or missing-results assessments reported per synthesis

### Item 22 -- Certainty of evidence

**Description:** Present assessments of certainty (or confidence) in the body of evidence for each outcome assessed.

**What to look for in code/outputs:**
- Summary of findings table or GRADE evidence profile with a certainty rating per outcome and downgrading reasons

---

## Discussion

### Item 23a -- Discussion: interpretation

**Description:** Provide a general interpretation of the results in the context of other evidence.

**What to look for in code/outputs:**
- Discussion text relating findings to prior evidence

### Item 23b -- Discussion: limitations of the evidence

**Description:** Discuss any limitations of the evidence included in the review.

**What to look for in code/outputs:**
- Limitations tied to risk of bias, inconsistency, imprecision, and indirectness of the included evidence

### Item 23c -- Discussion: limitations of the review processes

**Description:** Discuss any limitations of the review processes used.

**What to look for in code/outputs:**
- Discussion of search, language, screening, or extraction limitations of the review itself

### Item 23d -- Discussion: implications

**Description:** Discuss implications of the results for practice, policy, and future research.

**What to look for in code/outputs:**
- Implications framed by the certainty of evidence

---

## Other information

### Item 24a -- Registration and protocol: registration

**Description:** Provide registration information for the review, including register name and registration number, or state that the review was not registered.

**What to look for in code/outputs:**
- PROSPERO or OSF registration number in documentation, or an explicit "not registered" statement

### Item 24b -- Registration and protocol: protocol

**Description:** Indicate where the review protocol can be accessed, or state that a protocol was not prepared.

**What to look for in code/outputs:**
- Link to the protocol or the protocol file in the repository

### Item 24c -- Registration and protocol: amendments

**Description:** Describe and explain any amendments to information provided at registration or in the protocol.

**What to look for in code/outputs:**
- Dated amendment log comparing the analysis code against the registered protocol

### Item 25 -- Support

**Description:** Describe sources of financial or non-financial support for the review, and the role of the funders or sponsors in the review.

**What to look for in code/outputs:**
- Funding acknowledgment and grant numbers, with a statement on the role of funders

### Item 26 -- Competing interests

**Description:** Declare any competing interests of review authors.

**What to look for in code/outputs:**
- Competing interest declarations for all review authors

### Item 27 -- Availability of data, code, and other materials

**Description:** Report which of the following are publicly available and where they can be found: template data collection forms; data extracted from included studies; data used for all analyses; analytic code; any other materials used in the review.

**What to look for in code/outputs:**
- Public repository links for extraction forms, extracted data, analysis datasets, and analytic code
- A data and code availability statement in the report
