# PRISMA-NMA Checklist for Network Meta-Analyses

Preferred Reporting Items for Systematic Reviews and Meta-Analyses incorporating Network Meta-Analysis (PRISMA-NMA).
Extension of PRISMA for systematic reviews that include a network meta-analysis.

**Primary reference:** Hutton B, Salanti G, Caldwell DM, Chaimani A, Schmid CH, Cameron C, Ioannidis JPA, Straus S, Thorlund K, Jansen JP, Mulrow C, Catala-Lopez F, Gotzsche PC, Dickersin K, Boutron I, Altman DG, Moher D. The PRISMA Extension Statement for Reporting of Systematic Reviews Incorporating Network Meta-analyses of Health Care Interventions: Checklist and Explanations. Ann Intern Med. 2015;162(11):777-784. doi:10.7326/M14-2385. PMID: 26030634.

This checklist extends base PRISMA with items specific to network meta-analysis. Items marked with an asterisk (*) are new additions or modifications from base PRISMA. Apply when reporting a systematic review incorporating indirect or mixed treatment comparisons via network meta-analysis (NMA). The base 27-item PRISMA 2009 checklist remains applicable alongside these extensions.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review incorporating a network meta-analysis. *

**What to look for in code/outputs:**
- Report title specifying network meta-analysis or indirect treatment comparison
- Title naming the condition, intervention class, or decision context
- Structured abstract consistent with NMA scope and network geometry
- Keywords including "network meta-analysis," "indirect comparisons," and the therapeutic area

---

## Abstract

### Item 2 -- Structured summary

**Description:** Provide a structured summary including, as applicable: background, objectives, data sources, study eligibility criteria, participants, interventions, study appraisal and synthesis methods (including any assumptions about transitivity and consistency), results (including the network geometry and ranking of interventions), and conclusions. *

**What to look for in code/outputs:**
- Abstract reporting the number of treatments in the network and number of studies per comparison
- Summary of ranking results (e.g., SUCRA or P-scores) or selected pairwise estimates
- Transitivity and consistency assessment methods named in abstract
- Network plot or reference to it in abstract

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe the rationale for the review in the context of what is already known and specifically why a network meta-analysis is appropriate, including justification that transitivity assumption is likely to hold. *

**What to look for in code/outputs:**
- Justification for indirect comparisons (absence of head-to-head trials, decision-making need)
- Argument for transitivity based on shared effect modifiers across comparisons
- Documentation of clinical homogeneity across the treatment network
- Reference to existing pairwise meta-analyses and their limitations for decision-making

### Item 4 -- Objectives

**Description:** Provide an explicit statement of questions being addressed with reference to participants, interventions, comparators, outcomes, and study design (PICOS). Include the perspective of the network meta-analysis (e.g., decision-making, research synthesis).

**What to look for in code/outputs:**
- PICOS framework specified for the network
- All treatments (nodes) in the planned network listed
- Primary and secondary outcomes defined
- Target comparisons or decision context specified (e.g., ranking, which treatment is best)

---

## Methods

### Item 5 -- Protocol and registration

**Description:** Indicate if a review protocol exists, if and where it can be accessed (e.g., Web address), and, if available, provide registration information including registration number.

**What to look for in code/outputs:**
- PROSPERO registration number or other review registry reference
- Published protocol DOI or URL
- Deviation log documenting changes from the protocol
- Date of registration relative to data collection

### Item 6 -- Eligibility criteria

**Description:** Specify study characteristics (e.g., PICOS, length of follow-up) and report characteristics (e.g., years considered, language, publication status) used as criteria for eligibility, giving rationale.

**What to look for in code/outputs:**
- Inclusion criteria specifying which comparisons are eligible (active vs. active, active vs. placebo)
- Outcome measurement time point standardization across the network
- Study design restrictions (RCTs only, or including observational)
- Minimum follow-up or sample size thresholds with rationale

### Item 7 -- Information sources

**Description:** Describe all information sources (e.g., databases with dates of coverage, contact with study authors to identify additional studies) in the search and the date last searched.

**What to look for in code/outputs:**
- Database list with coverage dates (MEDLINE, EMBASE, Cochrane CENTRAL, others)
- Grey literature and conference abstract searches documented
- Date last searched for each database
- Author or manufacturer contact for unpublished data

### Item 8 -- Search

**Description:** Present the full electronic search strategy for at least one database, including any limits used, such that it could be repeated.

**What to look for in code/outputs:**
- Full reproducible search string for at least one database
- MeSH terms, free-text terms, and Boolean operators documented
- All relevant intervention terms included to capture the full network
- Search strategy peer-reviewed or validated

### Item 9 -- Study selection

**Description:** State the process for selecting studies (i.e., screening, eligibility, included in systematic review, and, if applicable, included in the meta-analysis).

**What to look for in code/outputs:**
- Two-stage screening process with counts at each stage
- Number of independent screeners and conflict resolution method
- PRISMA flow diagram generated with counts
- Separate reporting of studies excluded from NMA vs. narrative synthesis

### Item 10 -- Data collection process

**Description:** Describe the method of data extraction from reports and any process for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Data extraction form for arm-level data (treatment, sample size, events, means, SDs)
- Dual extraction with reconciliation documented
- Author contact log for multi-arm trial data needed for NMA
- Handling of multi-arm trials in extraction (all arms captured)

### Item 11 -- Data items

**Description:** List and define all variables for which data were sought (e.g., PICOS, funding sources) and any assumptions made. *

**What to look for in code/outputs:**
- Complete variable list including arm-level outcome data (events/n for binary, mean/SD for continuous)
- Treatment coding scheme with reference treatment designated
- Study-level potential effect modifier variables extracted for transitivity assessment
- Multi-arm trial flag for appropriate handling in analysis

### Item 12 -- Risk of bias in individual studies

**Description:** Describe methods used for assessing risk of bias of individual studies (including specification of whether this was done at the study or outcome level) and how this information is to be used in data synthesis.

**What to look for in code/outputs:**
- Cochrane RoB 2.0 or RoB 1.0 domain ratings per study
- Risk of bias judgments coded (low, some concerns, high) per domain
- Sensitivity analysis excluding high-risk-of-bias studies planned
- Risk of bias summary figures or tables generated

### Item 13 -- Summary measures

**Description:** State the principal summary measures (e.g., risk ratio, difference in means) including the network meta-analysis summary measures (e.g., odds ratio, mean difference, relative risk, absolute risk difference). *

**What to look for in code/outputs:**
- Effect measure specified (odds ratio, relative risk, mean difference, hazard ratio)
- Reference treatment for all pairwise comparisons defined
- Absolute and relative effect measures both specified where relevant
- Ranking measures defined (SUCRA, P-score, probability of being best)

### Item 14 -- Planned methods of analysis

**Description:** Describe the methods of handling data and combining results of studies including any planned exploration of heterogeneity and inconsistency. Describe the statistical model used (e.g., Bayesian or frequentist), the specific model used for the network meta-analysis (e.g., consistency model), any assumptions made in the analysis, and the methods used to assess transitivity (comparability across treatment comparisons). *

**What to look for in code/outputs:**
- Statistical framework specified (Bayesian with prior distributions, or frequentist)
- Consistency model specified (common heterogeneity vs. comparison-specific)
- Transitivity assessment method coded (comparison of effect modifier distributions across comparisons)
- Inconsistency tests planned (node-splitting, design-by-treatment interaction, loop-specific inconsistency)
- Network geometry description method (network plot, contribution matrix)

### Item 15 -- Assessment of risk of bias across studies

**Description:** Specify any assessment of risk of bias that may affect the cumulative evidence (e.g., publication bias, selective reporting within studies).

**What to look for in code/outputs:**
- Comparison-adjusted funnel plots generated for publication bias assessment
- Selective reporting assessment using registered vs. reported outcomes
- Small-study effects assessment in network context
- Sensitivity analyses for potential publication bias

### Item 16 -- Additional analyses

**Description:** Describe methods of additional analyses (e.g., sensitivity or subgroup analyses, meta-regression), if done, indicating which were pre-specified.

**What to look for in code/outputs:**
- Subgroup and meta-regression analyses prespecified with effect modifier rationale
- Sensitivity analyses for key assumptions (consistency, heterogeneity priors)
- Network meta-regression code with treatment-covariate interaction terms
- Pre-specified vs. post-hoc analysis designation in code comments

---

## Results

### Item 17 -- Study selection

**Description:** Give numbers of studies screened, assessed for eligibility, and included in the review, with reasons for exclusions at each stage, ideally with a flow diagram.

**What to look for in code/outputs:**
- PRISMA flow diagram with counts at each stage
- Studies by comparison (pairwise breakdown of included studies)
- Reasons for exclusion of full-text articles tabulated
- Multi-arm trials identified and counted

### Item 18 -- Study characteristics

**Description:** For each study, present characteristics for which data were extracted (e.g., study size, PICOS, follow-up period) and provide the citations. *

**What to look for in code/outputs:**
- Summary table with study-level characteristics (design, sample size, comparisons, outcomes)
- Treatment arms and dosing for each study
- Effect modifiers (e.g., baseline risk, disease severity, duration) tabulated per study
- Multi-arm trial indicator noted in study characteristics table

### Item 19 -- Risk of bias within studies

**Description:** Present data on risk of bias of each included study and, if available, any outcome-level assessment.

**What to look for in code/outputs:**
- Risk of bias table or traffic light plot per study and per domain
- Overall risk of bias judgment per study
- Proportion of studies with high or unclear risk per domain summarized
- Sensitivity analysis results for high-risk-of-bias studies

### Item 20 -- Results of individual studies

**Description:** For all outcomes considered, present, for each study: (a) simple summary data for each intervention group and (b) effect estimates and confidence intervals, ideally with a forest plot.

**What to look for in code/outputs:**
- Arm-level event rates or means per study tabulated
- Pairwise effect estimates with CIs displayed in forest plots
- Direct evidence forest plots by comparison pair generated
- Multi-arm trial data displayed with all arms reported

### Item 21 -- Synthesis of results

**Description:** Present the results of each analysis, the network geometry (including a network plot), results of the network meta-analysis (including a summary treatment effect for each pairwise comparison, with credible or confidence intervals), and the results for ranking of interventions. *

**What to look for in code/outputs:**
- Network plot generated with nodes sized by sample size and edges by study count
- League table or matrix of all pairwise treatment effects with 95% CrI/CI
- SUCRA values or P-scores with uncertainty quantification reported
- Rankograms or cumulative ranking plots generated for primary outcome
- Contribution matrix showing direct vs. indirect evidence weights

### Item 22 -- Exploration of inconsistency

**Description:** Present the results of any investigation of inconsistency (see Item 14). *

**What to look for in code/outputs:**
- Node-splitting results with direct, indirect, and network estimates compared
- Design-by-treatment inconsistency test (chi-squared, p-value) reported
- Loop-specific inconsistency factors for identified loops reported
- Overall inconsistency test result (Cochran's Q for design-by-treatment interaction)

### Item 23 -- Assessment of risk of bias across studies

**Description:** Present results of any assessment of publication bias across studies (see Item 15).

**What to look for in code/outputs:**
- Comparison-adjusted funnel plot displayed
- Egger's test or rank correlation test results for asymmetry
- Qualitative discussion of small-study effects in the network
- Sensitivity analysis results for scenarios with selective reporting

### Item 24 -- Additional analyses

**Description:** Give results of additional analyses, if done (e.g., sensitivity or subgroup analyses, meta-regression [see Item 16]).

**What to look for in code/outputs:**
- Subgroup and meta-regression estimates tabulated
- Sensitivity analyses (excluding studies, alternative priors, alternative heterogeneity assumptions) reported
- Pre-specified vs. exploratory labeling for each additional analysis
- Comparison of rankings across sensitivity scenarios

---

## Discussion

### Item 25 -- Summary of evidence

**Description:** Summarize the main findings including the strength of evidence for each main outcome, and considering its relevance to key groups (e.g., healthcare providers, users, and policy makers). Interpret the results in the context of the transitivity assumption. *

**What to look for in code/outputs:**
- Summary of NMA estimates with clinical interpretation
- Transitivity evaluation results discussed (similarity of effect modifier distributions)
- Consistency assessment findings integrated into conclusions
- Certainty of evidence (GRADE for NMA) assessed and reported

### Item 26 -- Limitations

**Description:** Discuss limitations at study and outcome level (e.g., risk of bias), and at review-level (e.g., incomplete retrieval of identified research, reporting bias). Describe any limitations of the network meta-analysis (e.g., assumptions about transitivity and consistency). *

**What to look for in code/outputs:**
- Transitivity assumption limitations discussed with supporting evidence
- Inconsistency sources identified and their impact discussed
- Sparse network limitations (few studies per comparison, disconnected nodes) addressed
- Heterogeneity impact on ranking uncertainty discussed

### Item 27 -- Conclusions

**Description:** Provide a general interpretation of the results in the context of other evidence, and implications for future research.

**What to look for in code/outputs:**
- Conclusion referencing summary estimates and ranking with appropriate uncertainty language
- Implications for clinical decision-making and guideline development
- Recommended future research (direct head-to-head trials for key comparisons)
- Explicit statement on conditions under which transitivity assumption holds

---

## Funding

### Item 28 -- Funding

**Description:** Describe sources of funding for the systematic review and other support; role of funders for the systematic review.

**What to look for in code/outputs:**
- Funding acknowledgment section in report
- Conflict of interest disclosures for all authors
- Role of funder in search, selection, analysis, or reporting stated
- Independence of review from pharmaceutical or device industry stated
