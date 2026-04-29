# PRISMA-IPD Checklist for Systematic Reviews Using Individual Participant Data

Preferred Reporting Items for Systematic Reviews and Meta-Analyses of Individual Participant Data (PRISMA-IPD).
Extension of PRISMA for systematic reviews and meta-analyses that use individual participant data.

**Primary reference:** Stewart LA, Clarke M, Rovers M, Riley RD, Simmonds M, Stewart G, Tierney JF; PRISMA-IPD Development Group. Preferred Reporting Items for Systematic Review and Meta-Analyses of Individual Participant Data: The PRISMA-IPD Statement. JAMA. 2015;313(16):1657-1665. doi:10.1001/jama.2015.3656. PMID: 25919529.

This checklist extends base PRISMA with items specific to IPD meta-analyses (IPDMAs). Items marked with an asterisk (*) are new additions or modifications from base PRISMA. Apply when reporting a systematic review or meta-analysis that uses participant-level data obtained directly from trial or study investigators, rather than relying solely on published aggregate data. The base 27-item PRISMA 2009 checklist remains applicable alongside these extensions.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review and/or meta-analysis of individual participant data. *

**What to look for in code/outputs:**
- Report title identifying the review as an IPD meta-analysis or IPD systematic review
- Title naming the intervention(s), condition, and key outcome
- Keywords including "individual participant data," "IPD meta-analysis," or "individual patient data"
- Structured abstract consistent with IPD review scope

---

## Abstract

### Item 2 -- Structured summary

**Description:** Provide a structured summary including, as applicable: background, objectives, data sources, eligibility criteria, participants, interventions and comparators, IPD collection, data checking and harmonization, statistical methods, results, and conclusions. *

**What to look for in code/outputs:**
- Abstract stating the proportion of eligible IPD obtained (e.g., IPD from X of Y eligible studies)
- Summary of data harmonization and checking procedures
- Key efficacy or safety estimates with confidence intervals
- One- vs. two-stage analysis method named in abstract

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe the rationale for the review, specifically including why IPD were sought (rather than or in addition to aggregate data), in the context of what is already known. *

**What to look for in code/outputs:**
- Justification for IPD approach over aggregate data (subgroup analyses, time-to-event, standardized outcomes)
- Documentation of limitations of published aggregate data for the research question
- Prior systematic reviews using aggregate data cited with their limitations
- Specific advantages of IPD for the stated objectives (participant-level subgroups, covariate adjustment)

### Item 4 -- Objectives

**Description:** Provide an explicit statement of questions being addressed with reference to participants, interventions, comparators, outcomes, and study design (PICOS), specifying whether an IPD meta-analysis was planned.

**What to look for in code/outputs:**
- PICOS framework specified
- IPD meta-analysis designated as primary or secondary analysis
- Participant-level subgroup analyses prespecified
- Primary and secondary outcomes defined with measurement methods

---

## Methods

### Item 5 -- Protocol and registration

**Description:** Indicate if a review protocol exists, if and where it can be accessed, and, if available, provide registration information including registration number.

**What to look for in code/outputs:**
- PROSPERO registration number or other review registry reference
- Published protocol DOI or URL
- Deviation log for protocol amendments
- Date of registration relative to data collection and analysis

### Item 6 -- Eligibility criteria

**Description:** Specify study characteristics (e.g., PICOS, length of follow-up) and report characteristics (e.g., years considered, language, publication status) used as criteria for eligibility, giving rationale. Specify whether IPD, aggregate data, or both were sought. *

**What to look for in code/outputs:**
- Eligibility criteria specifying whether IPD were required for inclusion or merely preferred
- Criteria for accepting aggregate data in place of IPD for non-contributing studies
- Minimum follow-up or sample size thresholds with rationale
- Study design restrictions (RCTs, observational, or both)

### Item 7 -- Information sources

**Description:** Describe all information sources (e.g., databases with dates of coverage, contact with study authors to identify additional studies) in the search and the date last searched.

**What to look for in code/outputs:**
- Database list with coverage dates
- Unpublished and ongoing trial registries searched (ClinicalTrials.gov, WHO ICTRP)
- Author and sponsor contact for unreported studies or data
- Date last searched for each source

### Item 8 -- Search

**Description:** Present the full electronic search strategy for at least one database, including any limits used, such that it could be repeated.

**What to look for in code/outputs:**
- Full reproducible search string for at least one database
- MeSH terms, free-text terms, and Boolean operators documented
- Search strategy sufficient to identify unpublished and ongoing studies
- Search peer-reviewed or validated using known-item testing

### Item 9 -- Study selection

**Description:** State the process for selecting studies (i.e., screening, eligibility, included in systematic review, and, if applicable, included in the meta-analysis).

**What to look for in code/outputs:**
- Two-stage screening process with counts at each stage
- Study selection process documented separately from IPD collection outcome
- PRISMA flow diagram generated distinguishing studies providing IPD from those not
- Reasons for non-contribution of IPD documented per study

### Item 10 -- IPD collection process

**Description:** Describe all methods used to identify, request, receive, and manage the IPD, including any process for obtaining and confirming data from investigators. *

**What to look for in code/outputs:**
- Data request process documented (initial contact, reminders, data sharing agreements)
- Data transfer method specified (secure file transfer, data repository)
- Data management plan or data custody documentation referenced
- Timeline from initial contact to data receipt per study

### Item 11a -- Data items: study-level

**Description:** List and define all study-level variables for which data were sought (e.g., PICOS, funding sources) and any assumptions made.

**What to look for in code/outputs:**
- Study-level extraction form with all variables listed
- Study design, intervention details, and setting variables defined
- Risk of bias assessment variables captured at study level
- Statistical analysis plan variables to inform planned analyses

### Item 11b -- Data items: participant-level

**Description:** List and define all participant-level variables for which data were sought and any assumptions made. *

**What to look for in code/outputs:**
- Participant-level variable list including demographic, prognostic, treatment, and outcome variables
- Variable definitions with units, coding schemes, and reference ranges
- Prespecified subgroup variables (age, sex, disease severity, biomarkers) listed
- Outcome variable definitions consistent across studies in the data collection plan

### Item 12 -- Risk of bias in individual studies

**Description:** Describe methods used for assessing risk of bias of individual studies (including specification of whether this was done at the study or outcome level) and how this information is to be used in data synthesis.

**What to look for in code/outputs:**
- Cochrane RoB 2.0 or RoB 1.0 domain ratings applied
- IPD-specific risk of bias items assessed (selective participant exclusion, differential outcome data availability)
- Risk of bias judgments coded per domain per study
- Sensitivity analyses excluding high-risk-of-bias studies planned

### Item 13 -- Summary measures

**Description:** State the principal summary measures (e.g., risk ratio, difference in means).

**What to look for in code/outputs:**
- Primary effect measure specified (OR, HR, RR, mean difference)
- Absolute and relative measures both specified
- Treatment interaction terms for subgroup analyses defined
- Time-to-event outcome handling specified (Cox model, parametric survival)

### Item 14 -- Planned methods of analysis

**Description:** Describe the methods of handling data and combining results of studies, including any planned exploration of between-study heterogeneity. Describe the statistical method used (e.g., one-stage or two-stage approach). Specify any methods used to check, clean, and harmonize the IPD received from different studies. *

**What to look for in code/outputs:**
- One-stage vs. two-stage analysis approach specified with rationale
- One-stage model specification (mixed-effects regression, stratified Cox, clustered standard errors)
- Two-stage approach with within-study estimate extraction method defined
- Data checking procedures specified (range checks, internal consistency, cross-variable logic)
- Harmonization procedures for differently coded variables across studies
- Missing participant data handling (within-study imputation, missing at random assumption)

### Item 15 -- Assessment of risk of bias across studies

**Description:** Specify any assessment of risk of bias that may affect the cumulative evidence (e.g., publication bias, selective reporting within studies).

**What to look for in code/outputs:**
- Comparison of characteristics between contributing and non-contributing studies
- Funnel plot asymmetry test planned
- Comparison of results using IPD vs. published aggregate data where both available
- Selection bias assessment for non-contributing studies

### Item 16 -- Additional analyses

**Description:** Describe methods of additional analyses (e.g., sensitivity or subgroup analyses, meta-regression), if done, indicating which were pre-specified.

**What to look for in code/outputs:**
- Participant-level subgroup analyses coded (treatment-by-covariate interaction terms)
- Aggregate vs. IPD result comparison coded as sensitivity analysis
- Meta-regression for between-study moderators specified
- Pre-specified vs. post-hoc labeling for all additional analyses

---

## Results

### Item 17 -- Study selection

**Description:** Give numbers of studies screened, assessed for eligibility, and included in the review, with reasons for exclusions at each stage, ideally with a flow diagram. Report the number of studies and participants (and events, if applicable) for which IPD were obtained. *

**What to look for in code/outputs:**
- PRISMA flow diagram distinguishing studies providing IPD from non-contributing studies
- Total participant count and event count across IPD-contributing studies
- Reasons for IPD non-contribution per study (refused, unreachable, data lost)
- Proportion of eligible IPD obtained reported (studies and participants)

### Item 18 -- Study characteristics

**Description:** For each study, present characteristics for which data were extracted and provide the citations. Present comparisons of characteristics between studies that did and did not provide IPD. *

**What to look for in code/outputs:**
- Study characteristics table stratified by IPD contributor vs. non-contributor
- Statistical comparison of key characteristics between contributing and non-contributing studies
- Missing IPD impact assessment (would non-contributors change conclusions)
- Treatment arm descriptions and dosing per study

### Item 19 -- Risk of bias within studies

**Description:** Present data on risk of bias of each included study and, if available, any outcome-level assessment.

**What to look for in code/outputs:**
- Risk of bias table or traffic light plot per study and per domain
- IPD-specific risk of bias items reported (completeness of IPD, selective participant exclusion)
- Comparison of risk of bias between IPD contributors and non-contributors
- Sensitivity analysis results for high-risk-of-bias studies

### Item 20a -- Results of data checking and harmonization

**Description:** Report on any important issues found when checking and harmonizing the IPD received from different studies, and how these were resolved. *

**What to look for in code/outputs:**
- Data cleaning log documenting issues found and resolution decisions
- Variable harmonization decisions documented (recoding, combining categories, unit conversion)
- Participant-level data integrity checks and error correction procedures
- Final variable coding scheme with decisions documented per study

### Item 20b -- Results of individual studies

**Description:** For all outcomes considered, present, for each study: (a) simple summary data for each intervention group and (b) effect estimates and confidence intervals, ideally with a forest plot.

**What to look for in code/outputs:**
- Arm-level event rates, means, or survival summaries per study
- Study-level effect estimates with 95% CIs in forest plots
- Participant flow within each contributing study (randomized, analyzed, events)
- Consistency between IPD-derived estimates and published aggregate data checked

### Item 21 -- Synthesis of results

**Description:** Present the results of each meta-analysis done, including confidence intervals and measures of consistency.

**What to look for in code/outputs:**
- Pooled effect estimate with 95% CI from IPD meta-analysis
- Heterogeneity statistics (I-squared, tau-squared) reported
- One-stage and two-stage estimates compared if both computed
- Prediction intervals reported alongside summary estimates

### Item 22 -- Risk of bias across studies

**Description:** Present results of any assessment of risk of bias across studies (see Item 15).

**What to look for in code/outputs:**
- Comparison of pooled estimates from IPD vs. published aggregate data
- Funnel plot and asymmetry test results reported
- Characteristics comparison between contributing and non-contributing studies
- Sensitivity analysis excluding non-contributing studies reported

### Item 23 -- Additional analyses

**Description:** Give results of additional analyses, if done (e.g., sensitivity or subgroup analyses, meta-regression [see Item 16]).

**What to look for in code/outputs:**
- Participant-level subgroup interaction estimates with p-values for interaction reported
- Aggregate vs. IPD sensitivity analysis results compared
- Meta-regression covariate estimates tabulated
- Pre-specified vs. exploratory labeling for each analysis

---

## Discussion

### Item 24 -- Summary of evidence

**Description:** Summarize the main findings including the strength of evidence for each main outcome; consider their relevance to key groups.

**What to look for in code/outputs:**
- Summary of pooled IPD estimates with clinical interpretation
- Participant-level subgroup findings contextualized
- IPD advantages over prior aggregate analyses discussed
- Certainty of evidence (GRADE) assessed and reported

### Item 25 -- Limitations

**Description:** Discuss limitations at study and outcome level (e.g., risk of bias), and at review-level (e.g., incomplete retrieval of identified research, reporting bias). Describe any limitations of the IPD meta-analysis (e.g., not all eligible IPD obtained, between-study heterogeneity in variable definitions). *

**What to look for in code/outputs:**
- Missing IPD impact discussed (studies and participant proportions not contributing)
- Variable harmonization limitations and residual heterogeneity in variable definitions
- Missing participant-level data patterns and potential bias impact
- Generalizability limitations from contributing vs. non-contributing study differences

### Item 26 -- Conclusions

**Description:** Provide a general interpretation of the results in the context of other evidence, and implications for future research.

**What to look for in code/outputs:**
- Conclusions referencing both summary estimates and subgroup findings
- Clinical implications of participant-level subgroup analyses
- Recommended future research based on IPD findings
- Data sharing recommendations for future trials to facilitate prospective IPD-MA

---

## Funding

### Item 27 -- Funding

**Description:** Describe sources of funding for the systematic review and other support; role of funders for the systematic review.

**What to look for in code/outputs:**
- Funding acknowledgment in report
- Conflict of interest disclosures for all authors
- Role of funder in IPD collection, analysis, or reporting stated
- Independence of analysis from original study sponsors confirmed
