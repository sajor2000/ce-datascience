# PRISMA-NMA Checklist for Network Meta-Analyses

## Contents

- Title
- Abstract
- Introduction
- Methods
- Results
- Discussion
- Funding

Preferred Reporting Items for Systematic Reviews and Meta-Analyses incorporating Network Meta-Analysis (PRISMA-NMA).
Extension of PRISMA for systematic reviews that include a network meta-analysis.

**Primary reference:** Hutton B, Salanti G, Caldwell DM, Chaimani A, Schmid CH, Cameron C, Ioannidis JPA, Straus S, Thorlund K, Jansen JP, Mulrow C, Catala-Lopez F, Gotzsche PC, Dickersin K, Boutron I, Altman DG, Moher D. The PRISMA Extension Statement for Reporting of Systematic Reviews Incorporating Network Meta-analyses of Health Care Interventions: Checklist and Explanations. Ann Intern Med. 2015;162(11):777-784. doi:10.7326/M14-2385. PMID: 26030634.

**Source and licence:** Item IDs and order follow the official PRISMA-NMA checklist (https://www.prisma-statement.org/s/PRISMA-NMA-checklist.pdf). The checklist and article are copyright of the American College of Physicians and carry no open licence, so the descriptions are faithful paraphrases: every element of each official item is kept and nothing is added. Use the official PDF for verbatim wording. The "What to look for" cues are added by this plugin.

PRISMA-NMA is a modified 32-item checklist: the 27 items of PRISMA 2009 (since superseded by PRISMA 2020), with NMA-specific wording added to several, plus five new items S1-S5. Use it in place of the base PRISMA checklist. Apply it to systematic reviews that use indirect or mixed treatment comparisons (network meta-analysis). An updated PRISMA-NMA is in development (protocol: Veroniki et al. JBI Evid Synth 2025, PMID 39829235). Until it is published, this 2015 checklist is current.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review incorporating a network meta-analysis (or a related form of meta-analysis).

**What to look for in code/outputs:**
- Report title naming the review as including a network meta-analysis

---

## Abstract

### Item 2 -- Structured summary

**Description:** Give a structured summary including, as applicable:
- **Background:** main objectives.
- **Methods:** data sources; study eligibility criteria, participants, and interventions; study appraisal; and synthesis methods, such as network meta-analysis.
- **Results:** numbers of studies and participants identified; summary estimates with their confidence or credible intervals. Treatment rankings may also be discussed, and for brevity authors may summarize pairwise comparisons against a chosen treatment included in their analyses.
- **Discussion/Conclusions:** limitations; conclusions and implications of the findings.
- **Other:** primary source of funding; systematic review registration number and registry name.

**What to look for in code/outputs:**
- Abstract output with summary estimates and intervals, and any rankings reported

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe why the review was done, in the context of what is already known, including why a network meta-analysis was conducted.

**What to look for in code/outputs:**
- Introductory sections explaining the need to compare multiple treatments

### Item 4 -- Objectives

**Description:** Give an explicit statement of the questions addressed, with reference to participants, interventions, comparisons, outcomes, and study design (PICOS).

**What to look for in code/outputs:**
- PICOS question in the protocol or config

---

## Methods

### Item 5 -- Protocol and registration

**Description:** State whether a review protocol exists and whether and where it can be accessed (e.g., web address). If available, give registration information, including the registration number.

**What to look for in code/outputs:**
- Registration number and protocol link

### Item 6 -- Eligibility criteria

**Description:** Specify the study characteristics (e.g., PICOS, length of follow-up) and report characteristics (e.g., years considered, language, publication status) used as eligibility criteria, with rationale. Clearly describe the eligible treatments included in the treatment network, and state whether any were clustered or merged into the same node (with justification).

**What to look for in code/outputs:**
- Node definitions mapping each intervention, dose, or regimen to a network node, with justification for any merged nodes

### Item 7 -- Information sources

**Description:** Describe all information sources searched (e.g., databases with dates of coverage, contact with study authors to identify additional studies) and the date of the last search.

**What to look for in code/outputs:**
- Sources, coverage dates, and last-search dates documented

### Item 8 -- Search

**Description:** Present the full electronic search strategy for at least one database, including any limits used, so that it could be repeated.

**What to look for in code/outputs:**
- Complete search string for at least one database stored verbatim

### Item 9 -- Study selection

**Description:** State the process for selecting studies (screening, eligibility, inclusion in the systematic review, and, if applicable, inclusion in the meta-analysis).

**What to look for in code/outputs:**
- Screening workflow and counts per stage

### Item 10 -- Data collection process

**Description:** Describe the method of data extraction from reports (e.g., piloted forms, independently, in duplicate) and any processes for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Extraction forms and dual-extraction documentation, including arm-level data for multi-arm trials

### Item 11 -- Data items

**Description:** List and define all variables for which data were sought (e.g., PICOS, funding sources) and any assumptions and simplifications made.

**What to look for in code/outputs:**
- Data dictionary, including potential effect modifiers used to assess transitivity

### Item S1 -- Geometry of the network

**Description:** Describe the methods used to explore the geometry of the treatment network and any potential biases related to it. Include how the evidence base was graphically summarized for presentation and which characteristics were compiled and used to describe the evidence base to readers.

**What to look for in code/outputs:**
- Network plot code (e.g., R netmeta::netgraph, multinma, BUGSnet) and the network characteristics computed (nodes, edges, studies and patients per comparison)

### Item 12 -- Risk of bias within individual studies

**Description:** Describe the methods used to assess the risk of bias of individual studies (including whether this was done at the study or outcome level), and how this information is to be used in any data synthesis.

**What to look for in code/outputs:**
- Risk-of-bias tool and how ratings feed into the synthesis (e.g., CINeMA)

### Item 13 -- Summary measures

**Description:** State the principal summary measures (e.g., risk ratio, difference in means). Also describe any additional summary measures assessed, such as treatment rankings and surface under the cumulative ranking curve (SUCRA) values, and any modified approaches used to present summary findings from the meta-analyses.

**What to look for in code/outputs:**
- Effect measures per outcome; ranking metrics (SUCRA, P-scores, rank probabilities) computed

### Item 14 -- Planned methods of analysis

**Description:** Describe the methods of handling data and combining study results for each network meta-analysis. This should include, but not be limited to: handling of multi-arm trials; selection of the variance structure; selection of prior distributions in Bayesian analyses; and assessment of model fit.

**What to look for in code/outputs:**
- Multi-arm correlation handling; common vs random heterogeneity variance; priors stated; model fit (DIC, residual deviance)

### Item S2 -- Assessment of inconsistency

**Description:** Describe the statistical methods used to evaluate agreement between direct and indirect evidence in the treatment network(s) studied, and the steps taken to address inconsistency when it was found.

**What to look for in code/outputs:**
- Node-splitting, design-by-treatment interaction, or loop-specific inconsistency code, and the planned response to inconsistency

### Item 15 -- Risk of bias across studies

**Description:** Specify any assessment of risk of bias that may affect the cumulative evidence (e.g., publication bias, selective reporting within studies).

**What to look for in code/outputs:**
- Comparison-adjusted funnel plots or other small-study assessments

### Item 16 -- Additional analyses

**Description:** Describe the methods of any additional analyses, indicating which were pre-specified. These may include, but are not limited to: sensitivity or subgroup analyses; meta-regression analyses; alternative formulations of the treatment network; and alternative prior distributions for Bayesian analyses (if applicable).

**What to look for in code/outputs:**
- Network meta-regression, alternative node definitions, and prior-sensitivity runs, labelled pre-specified or post hoc

---

## Results

### Item 17 -- Study selection

**Description:** Give the numbers of studies screened, assessed for eligibility, and included in the review, with reasons for exclusion at each stage, ideally with a flow diagram.

**What to look for in code/outputs:**
- Flow diagram with counts and exclusion reasons

### Item S3 -- Presentation of network structure

**Description:** Provide a network graph of the included studies so that the geometry of the treatment network can be visualized.

**What to look for in code/outputs:**
- Rendered network graph with node size and edge width reflecting the amount of evidence

### Item S4 -- Summary of network geometry

**Description:** Give a brief overview of the characteristics of the treatment network. This may include commentary on the number of trials and randomized patients for the different interventions and pairwise comparisons, gaps in the evidence, and potential biases reflected by the network structure.

**What to look for in code/outputs:**
- Table of studies and patients per node and per comparison; noted evidence gaps

### Item 18 -- Study characteristics

**Description:** For each study, present the characteristics for which data were extracted (e.g., study size, PICOS, follow-up period) and give the citation.

**What to look for in code/outputs:**
- Characteristics table with citations

### Item 19 -- Risk of bias within studies

**Description:** Present data on the risk of bias of each study and, if available, any outcome-level assessment.

**What to look for in code/outputs:**
- Per-study risk-of-bias ratings in tables or figures

### Item 20 -- Results of individual studies

**Description:** For all outcomes considered (benefits or harms), present for each study: (1) simple summary data for each intervention group, and (2) effect estimates and confidence intervals. Modified approaches may be needed for information from larger networks.

**What to look for in code/outputs:**
- Arm-level data and per-study effect estimates, possibly in an appendix for large networks

### Item 21 -- Synthesis of results

**Description:** Present the results of each meta-analysis, including confidence or credible intervals. In larger networks, authors may focus on comparisons against a particular comparator (e.g., placebo or standard care) and give the full findings in an appendix. League tables and forest plots may be used to summarize pairwise comparisons. If additional summary measures were explored (such as treatment rankings), present these too.

**What to look for in code/outputs:**
- League table of all pairwise estimates with intervals; forest plot against a common comparator; ranking outputs

### Item S5 -- Exploration for inconsistency

**Description:** Describe the results of the investigations of inconsistency. These may include measures of model fit comparing consistency and inconsistency models, P values from statistical tests, or summaries of inconsistency estimates from different parts of the treatment network.

**What to look for in code/outputs:**
- Node-split results, global inconsistency test, consistency vs inconsistency model fit

### Item 22 -- Risk of bias across studies

**Description:** Present the results of any assessment of risk of bias across studies for the evidence base being studied.

**What to look for in code/outputs:**
- Comparison-adjusted funnel plots or small-study results

### Item 23 -- Results of additional analyses

**Description:** Give the results of any additional analyses (e.g., sensitivity or subgroup analyses, meta-regression analyses, alternative network geometries studied, alternative choices of prior distributions for Bayesian analyses).

**What to look for in code/outputs:**
- Sensitivity and meta-regression outputs presented next to the primary results

---

## Discussion

### Item 24 -- Summary of evidence

**Description:** Summarize the main findings, including the strength of the evidence for each main outcome, and consider their relevance to key groups (e.g., healthcare providers, users, and policy makers).

**What to look for in code/outputs:**
- Key results with certainty ratings (e.g., CINeMA or GRADE for NMA)

### Item 25 -- Limitations

**Description:** Discuss limitations at the study and outcome level (e.g., risk of bias) and at the review level (e.g., incomplete retrieval of identified research, reporting bias). Comment on the validity of the assumptions, such as transitivity and consistency, and on any concerns about network geometry (e.g., avoidance of certain comparisons).

**What to look for in code/outputs:**
- Discussion of transitivity, consistency, and network-geometry concerns

### Item 26 -- Conclusions

**Description:** Give a general interpretation of the results in the context of other evidence, and implications for future research.

**What to look for in code/outputs:**
- Conclusions qualified by the certainty of evidence

---

## Funding

### Item 27 -- Funding

**Description:** Describe the sources of funding for the systematic review and other support (e.g., supply of data), and the role of the funders. Also state whether funding was received from manufacturers of treatments in the network and/or whether any authors are content experts with professional conflicts of interest that could affect use of treatments in the network.

**What to look for in code/outputs:**
- Funding statement covering manufacturer funding and authors' professional conflicts relevant to the network
