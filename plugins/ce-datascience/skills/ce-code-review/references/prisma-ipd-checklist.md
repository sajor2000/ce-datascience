# PRISMA-IPD Checklist for Systematic Reviews Using Individual Participant Data

## Contents

- Title
- Abstract
- Introduction
- Methods
- Results
- Discussion
- Funding

Preferred Reporting Items for Systematic Reviews and Meta-Analyses of Individual Participant Data (PRISMA-IPD).
Stand-alone extension of PRISMA for systematic reviews and meta-analyses that use individual participant data.

**Primary reference:** Stewart LA, Clarke M, Rovers M, Riley RD, Simmonds M, Stewart G, Tierney JF; PRISMA-IPD Development Group. Preferred Reporting Items for Systematic Review and Meta-Analyses of Individual Participant Data: The PRISMA-IPD Statement. JAMA. 2015;313(16):1657-1665. doi:10.1001/jama.2015.3656. PMID: 25919529.

**Source and licence:** Item IDs and order follow the official PRISMA-IPD checklist (https://www.prisma-statement.org/s/PRISMA-IPD-checklist.pdf). The PRISMA-IPD Group permits reuse only for non-commercial purposes, so the descriptions are faithful paraphrases: every element of each official item is kept and nothing is added. Use the official PDF for verbatim wording. The "What to look for" cues are added by this plugin.

PRISMA-IPD is a stand-alone checklist with 31 rows: the 27 PRISMA items adapted for IPD, plus A1-A3 (new items) and A4 (created by rearranging standard PRISMA content). Use it in place of the base PRISMA checklist. Developed mainly for reviews of randomized trials, many items also apply to IPD reviews of diagnosis and prognosis.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a systematic review and meta-analysis of individual participant data.

**What to look for in code/outputs:**
- Report title stating "individual participant data" (or "IPD") meta-analysis

---

## Abstract

### Item 2 -- Structured summary

**Description:** Give a structured summary covering, as applicable:
- **Background:** the research question and main objectives, with information on participants, interventions, comparators, and outcomes.
- **Methods:** eligibility criteria; data sources, including dates of the last bibliographic search or elicitation, noting that IPD were sought; methods for assessing risk of bias.
- **Results:** the number and type of studies and participants identified, and the number (%) for which IPD were obtained; summary effect estimates for the main outcomes (benefits and harms) with confidence intervals and measures of statistical heterogeneity; the direction and size of summary effects, in terms meaningful to those who would put the findings into practice.
- **Discussion:** the main strengths and limitations of the evidence, a general interpretation of the results, and any important implications.
- **Other:** the primary funding source, and the registration number and registry name for the systematic review and IPD meta-analysis.

**What to look for in code/outputs:**
- Abstract reporting the number (%) of studies and participants with IPD obtained
- Summary effects with confidence intervals and heterogeneity measures

---

## Introduction

### Item 3 -- Rationale

**Description:** Describe why the review was done, in the context of what is already known.

**What to look for in code/outputs:**
- Introductory sections citing prior evidence and gaps

### Item 4 -- Objectives

**Description:** Give an explicit statement of the questions addressed with reference, as applicable, to participants, interventions, comparisons, outcomes, and study design (PICOS). Include any hypotheses about particular participant-level subgroups.

**What to look for in code/outputs:**
- PICOS question and pre-specified participant-level subgroup hypotheses in the protocol

---

## Methods

### Item 5 -- Protocol and registration

**Description:** State whether a protocol exists and where it can be accessed. If available, give registration information, including the registration number and registry name, and publication details if applicable.

**What to look for in code/outputs:**
- Registration number, registry name, and protocol link or citation

### Item 6 -- Eligibility criteria

**Description:** Specify the inclusion and exclusion criteria, including those relating to participants, interventions, comparisons, outcomes, study design, and study characteristics (e.g., years when conducted, required minimum follow-up). State whether the criteria were applied at the study level or the individual level, i.e. whether eligible participants were included (and ineligible participants excluded) from a study whose population was wider than the review's inclusion criteria. Give the rationale for the criteria.

**What to look for in code/outputs:**
- Participant-level eligibility filters applied to pooled IPD, with counts excluded per study

### Item 7 -- Identifying studies: information sources

**Description:** Describe all methods used to identify published and unpublished studies, including, as applicable: the bibliographic databases searched, with dates of coverage; any hand searching, including of conference proceedings; use of study registers and agency or company databases; contact with the original research teams and experts in the field; open adverts and surveys. Give the date of the last search or elicitation.

**What to look for in code/outputs:**
- Search and elicitation sources documented with last-search dates

### Item 8 -- Identifying studies: search

**Description:** Present the full electronic search strategy for at least one database, including any limits used, so that it could be repeated.

**What to look for in code/outputs:**
- Complete search string for at least one database stored verbatim

### Item 9 -- Study selection processes

**Description:** State the process used to decide which studies were eligible for inclusion.

**What to look for in code/outputs:**
- Screening workflow and eligibility decisions documented

### Item 10 -- Data collection processes

**Description:** Describe how IPD were requested, collected, and managed, including any processes for querying and confirming data with investigators. If IPD were not sought from an eligible study, give the reason (for each such study). If applicable, describe how studies without available IPD were dealt with, including whether, how, and what aggregate data were sought or extracted from study reports and publications (such as independent extraction in duplicate) and any processes for obtaining and confirming these data with investigators.

**What to look for in code/outputs:**
- IPD request and transfer log per study, including data-sharing agreements and query logs
- Reasons recorded for each study where IPD were not sought
- Aggregate-data extraction forms for studies without IPD

### Item 11 -- Data items

**Description:** Describe how the information and variables to be collected were chosen. List and define all study-level and participant-level data sought, including baseline and follow-up information. If applicable, describe the methods used to standardise or translate variables within the IPD datasets to ensure common scales or measurements across studies.

**What to look for in code/outputs:**
- Harmonized data dictionary mapping each study's variables to common definitions
- Recoding and unit-conversion scripts per study

### Item A1 -- IPD integrity

**Description:** Describe which aspects of the IPD were checked (such as sequence generation, data consistency and completeness, and baseline imbalance) and how this was done.

**What to look for in code/outputs:**
- Data-checking scripts per study: randomization pattern, date consistency, range and logic checks, completeness, baseline balance
- Query logs sent to investigators

### Item 12 -- Risk of bias assessment in individual studies

**Description:** Describe the methods used to assess risk of bias in the individual studies and whether this was done separately for each outcome. If applicable, describe how the findings of IPD checking informed the assessment. Report whether and how the risk-of-bias assessment was used in any data synthesis.

**What to look for in code/outputs:**
- Risk-of-bias tool and per-outcome ratings, linked to IPD-check findings

### Item 13 -- Specification of outcomes and effect measures

**Description:** State all treatment comparisons of interest. State all outcomes addressed and define them in detail. State whether they were pre-specified for the review and, if applicable, whether they were primary/main or secondary/additional outcomes. Give the principal effect measures (such as risk ratio, hazard ratio, or difference in means) used for each outcome.

**What to look for in code/outputs:**
- Outcome definitions derived consistently across studies, labelled pre-specified and primary or secondary
- Effect measure per outcome specified in analysis code

### Item 14 -- Synthesis methods

**Description:** Describe the meta-analysis methods used to synthesise the IPD, specifying any statistical methods and models used. Issues should include, but are not restricted to:
- use of a one-stage or two-stage approach;
- how effect estimates were generated separately within each study and combined across studies (where applicable);
- specification of one-stage models (where applicable), including how clustering of patients within studies was accounted for;
- use of fixed-effect or random-effects models and any other model assumptions, such as proportional hazards;
- how (summary) survival curves were generated (where applicable);
- methods for quantifying statistical heterogeneity (such as I² and τ²);
- how studies providing and not providing IPD were analysed together (where applicable);
- how missing data within the IPD were dealt with (where applicable).

**What to look for in code/outputs:**
- One-stage (mixed model with study-level clustering) or two-stage analysis code, with model assumptions checked
- Heterogeneity estimates; methods for combining IPD with aggregate data; missing-data handling within IPD

### Item A2 -- Exploration of variation in effects

**Description:** If applicable, describe any methods used to explore variation in effects by study-level or participant-level characteristics (such as estimating interactions between effect and covariates). State all participant-level characteristics analysed as potential effect modifiers and whether they were pre-specified.

**What to look for in code/outputs:**
- Treatment-covariate interaction models that separate within-study from across-study information
- Effect modifiers listed and labelled pre-specified or exploratory

### Item 15 -- Risk of bias across studies

**Description:** Specify any assessment of risk of bias affecting the accumulated body of evidence, including any arising from not obtaining IPD for particular studies, outcomes, or other variables.

**What to look for in code/outputs:**
- Assessment of availability bias (studies or outcomes without IPD) and of publication bias

### Item 16 -- Additional analyses

**Description:** Describe the methods of any additional analyses, including sensitivity analyses, and state which were pre-specified.

**What to look for in code/outputs:**
- Sensitivity analysis code labelled pre-specified or post hoc

---

## Results

### Item 17 -- Study selection and IPD obtained

**Description:** Give the numbers of studies screened, assessed for eligibility, and included in the systematic review, with reasons for exclusion at each stage. Give the numbers of studies and participants for which IPD were sought and for which IPD were obtained. For studies without available IPD, give the numbers of studies and participants for which aggregate data were available. Report the reasons IPD were not available. Include a flow diagram.

**What to look for in code/outputs:**
- PRISMA-IPD flow diagram with IPD sought vs obtained, and aggregate data available for the rest
- Reasons for IPD non-availability tabulated

### Item 18 -- Study characteristics

**Description:** For each study, present key study and participant characteristics (such as description of interventions, numbers of participants, demographic data, unavailability of outcomes, funding source, and, if applicable, duration of follow-up). Give the (main) citation for each study. Where applicable, report similar characteristics for any studies not providing IPD.

**What to look for in code/outputs:**
- Characteristics table for IPD studies and, separately, for non-IPD studies

### Item A3 -- IPD integrity

**Description:** Report any important issues found when checking the IPD, or state that there were none.

**What to look for in code/outputs:**
- Summary of data-check findings and their resolution per study

### Item 19 -- Risk of bias within studies

**Description:** Present the data on the risk-of-bias assessments. If applicable, describe whether data checking led to these assessments being up-weighted or down-weighted. Consider how any potential bias affects the robustness of the meta-analysis conclusions.

**What to look for in code/outputs:**
- Per-study risk-of-bias ratings, with changes prompted by IPD checks noted

### Item 20 -- Results of individual studies

**Description:** For each comparison and each main outcome (benefit or harm), report for each individual study the number of eligible participants for whom data were obtained, together with simple summary data for each intervention group (including, where applicable, the number of events), effect estimates, and confidence intervals. These may be tabulated or shown in a forest plot.

**What to look for in code/outputs:**
- Per-study counts, events by arm, and effect estimates with CIs, as tables or forest plots

### Item 21 -- Results of syntheses

**Description:** Present summary effects for each meta-analysis, with confidence intervals and measures of statistical heterogeneity. State whether the analysis was pre-specified, and report the numbers of studies and participants (and, where applicable, events) on which it is based. When exploring variation in effects due to patient or study characteristics, present summary interaction estimates for each characteristic examined, with confidence intervals and measures of statistical heterogeneity; state whether the analysis was pre-specified and whether any interaction is consistent across trials. Describe the direction and size of effects in terms meaningful to those who would put the findings into practice.

**What to look for in code/outputs:**
- Summary effects with CIs, heterogeneity, and denominators
- Interaction estimates with CIs, consistency across trials, and pre-specification labels

### Item 22 -- Risk of bias across studies

**Description:** Present the results of any assessment of risk of bias affecting the accumulated body of evidence, including any relating to the availability and representativeness of the available studies, outcomes, or other variables.

**What to look for in code/outputs:**
- Results of availability-bias and publication-bias assessments

### Item 23 -- Additional analyses

**Description:** Give the results of any additional analyses (e.g., sensitivity analyses). If applicable, include any analyses that incorporate aggregate data for studies without IPD, and summarise the main meta-analysis results with and without the studies for which IPD were not available.

**What to look for in code/outputs:**
- Sensitivity results, including IPD-only vs IPD-plus-aggregate-data comparisons

---

## Discussion

### Item 24 -- Summary of evidence

**Description:** Summarise the main findings, including the strength of the evidence for each main outcome.

**What to look for in code/outputs:**
- Key results with certainty of evidence per outcome

### Item 25 -- Strengths and limitations

**Description:** Discuss any important strengths and limitations of the evidence, including the benefits of having access to IPD and any limitations arising from IPD that were not available.

**What to look for in code/outputs:**
- Discussion of IPD advantages and of the impact of unavailable IPD

### Item 26 -- Conclusions

**Description:** Give a general interpretation of the findings in the context of other evidence.

**What to look for in code/outputs:**
- Conclusions linked to prior evidence

### Item A4 -- Implications

**Description:** Consider the relevance of the findings to key groups (such as policy makers, service providers, and service users) and the implications for future research.

**What to look for in code/outputs:**
- Implications for stakeholders and for future research stated separately from the conclusions

---

## Funding

### Item 27 -- Funding

**Description:** Describe the sources of funding and other support (such as supply of IPD), and the role in the systematic review of those providing such support.

**What to look for in code/outputs:**
- Funding acknowledgment, including providers of IPD and their role
