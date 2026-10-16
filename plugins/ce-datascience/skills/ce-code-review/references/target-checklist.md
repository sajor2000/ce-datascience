# TARGET Checklist for Studies Emulating a Target Trial

## Contents

- Abstract
  - TARGET 1 -- Abstract (1a-1c)
- Introduction
  - TARGET 2 -- Background
  - TARGET 3 -- Causal question
  - TARGET 4 -- Rationale
- Methods
  - TARGET 5 -- Data sources
  - TARGET 6 -- Target trial specification (6a-6h)
  - TARGET 7 -- Target trial emulation (7a-7h.ii)
- Results
  - TARGET 8 -- Participant selection
  - TARGET 9 -- Baseline data
  - TARGET 10 -- Follow-up
  - TARGET 11 -- Missing data
  - TARGET 12 -- Outcomes
  - TARGET 13 -- Effect estimates
  - TARGET 14 -- Additional analyses
- Discussion
  - TARGET 15 -- Interpretation
  - TARGET 16 -- Limitations
- Other information
  - TARGET 17-21 -- Ethics, registration, sharing, funding, conflicts

TARGET (TrAnsparent ReportinG of observational studies Emulating a Target trial): 21 items in six sections -- abstract (1), introduction (2-4), methods (5-7), results (8-14), discussion (15-16), other information (17-21). Item numbers and wording below follow Table 2 of the statement; the "What to look for in code/outputs" bullets are review cues added by this plugin, not checklist text.

**Primary reference:** Cashin AG, Hansford HJ, Hernán MA, et al. Transparent reporting of observational studies emulating a target trial: the TARGET statement. BMJ. 2025;390:e087179. doi:10.1136/bmj-2025-087179. PMID: 40903028.
**Related reference:** Simultaneous publication in JAMA. 2025;334(12):1084-1093. doi:10.1001/jama.2025.13350. PMID: 40899949. PMCID: PMC13084563.

TARGET is intended as a standalone reporting guideline for observational studies of interventions that explicitly emulate a target trial. Do not require STROBE as a companion; add RECORD (routinely collected data) or STROBE only when the journal or data source requires them.

---

## Abstract

### TARGET 1 -- Abstract

**Description:** (a) Identify that the study attempts to emulate a target trial using observational data; state the study objectives and briefly summarize the specified target trial. (b) Report the data sources used for emulation. (c) Summarize key assumptions, statistical methods, findings and conclusions.

**What to look for in code/outputs:**
- Abstract names the design as a target trial emulation and the data source(s)
- Abstract numbers (effect estimates, CIs, counts) match the analysis outputs

---

## Introduction

### TARGET 2 -- Background

**Description:** Describe the scientific background of the study and the gap in knowledge.

### TARGET 3 -- Causal question

**Description:** Summarize the causal question.

**What to look for in code/outputs:**
- One causal question per primary estimand; the README/SAP and the analysis code agree on it

### TARGET 4 -- Rationale

**Description:** Describe the rationale for emulating a target trial with the available data. Cite randomized trials informing the design of the target trial if applicable.

---

## Methods

### TARGET 5 -- Data sources

**Description:** Cite the data sources contributing to the analyses and for each one describe the original purpose, type, geographic locations, setting and time period. If relevant, describe how the data were linked or pooled.

**What to look for in code/outputs:**
- Data extraction scripts identify each source, its version/extract date, and the study period
- Linkage or pooling code documented (keys, match rates, deduplication)

### TARGET 6 -- Target trial specification

**Description:** Specify the components of the target trial protocol that would answer the causal question:
- **6a Eligibility criteria** -- describe the eligibility criteria.
- **6b Treatment strategies** -- describe the treatment strategies that would be compared.
- **6c Assignment procedures** -- report that eligible individuals would be randomly assigned to treatment strategies and may be aware of their treatment allocation.
- **6d Follow-up** -- clarify that follow-up would start at the time of assignment to the treatment strategies; specify when follow-up would end.
- **6e Outcomes** -- describe the outcomes.
- **6f Causal contrasts** -- describe the causal contrasts of interest, including effect measures.
- **6g Identifying assumptions** -- describe the assumptions that would be made to identify each causal estimand, and the variables, if any, related to these assumptions.
- **6h Data analysis plan** -- for each causal estimand, describe the data analysis procedures and any associated statistical modelling assumptions, including approaches for handling missing data.

**What to look for in code/outputs:**
- A protocol table or SAP section that specifies the hypothetical trial before the emulation
- Treatment strategies specified as full regimens (dose, duration, switching, discontinuation), not "treated vs untreated"
- Causal contrast named (intention-to-treat effect, per-protocol effect) with its effect measure (risk difference, risk ratio, hazard ratio)

### TARGET 7 -- Target trial emulation

**Description:** Describe how each component of the target trial protocol was emulated with the observational data, including how all variables were measured or ascertained:
- **7a** how the eligibility criteria were operationalized with the data.
- **7b** how the treatment strategies were operationalized with the data.
- **7c** how assignment to treatment strategies was operationalized with the data.
- **7d** that follow-up starts at the time individuals were assigned to the treatment strategies, and how the end of follow-up was operationalized.
- **7e** how the outcomes were operationalized with the data.
- **7f** how the causal contrasts were operationalized, including effect measures.
- **7g.i** for each causal estimand, the assumptions made to identify it, including assumptions regarding baseline confounding due to lack of randomization; **7g.ii** how the variables related to these assumptions were operationalized.
- **7h.i** for each causal estimand, the data analysis procedures and statistical modelling assumptions, including approaches for handling missing data; **7h.ii** any additional analyses conducted to assess the sensitivity of the results to the choice of operationalizations, assumptions and analysis.

**What to look for in code/outputs:**
- Eligibility filters in code match the specified criteria; differences from the target trial are documented (7a)
- Code lists, prescription rules, or algorithms defining each strategy (7b)
- Time zero aligned: eligibility assessed, strategy assigned, and follow-up started at the same time (7c, 7d). Misalignment creates immortal time or selection bias. A grace period, if used, is handled by cloning-censoring-weighting or sequential trials, not by classifying people by later treatment
- Outcome code lists, ascertainment windows, and censoring rules (7d, 7e)
- Weighting or matching scheme consistent with the estimand: ATE weights 1/PS and 1/(1-PS); ATT weights 1 and PS/(1-PS); overlap weights target the overlap population; matching treated units without replacement targets the ATT (7f, 7h.i)
- Per-protocol effects use inverse-probability-of-censoring weights for protocol deviations; if cloning-censoring-weighting is used, all three steps are in code (7f, 7h.i)
- Confounders listed with rationale, the propensity/treatment model specified, and positivity assessed (overlap, weight distribution) (7g)
- Variance estimation appropriate to the design (bootstrap when cloning or weights are estimated; robust/sandwich otherwise) (7h.i)
- Sensitivity analyses for operational choices and unmeasured confounding, e.g. E-value or quantitative bias analysis (7h.ii)

---

## Results

### TARGET 8 -- Participant selection

**Description:** Report numbers of individuals assessed for eligibility, eligible, and assigned to each treatment strategy. A flow diagram is strongly recommended.

**What to look for in code/outputs:**
- Counts produced at each filtering step in code and a flow diagram generated from them

### TARGET 9 -- Baseline data

**Description:** Describe the distribution of characteristics of individuals at baseline, by treatment strategy.

**What to look for in code/outputs:**
- Baseline table by strategy, before and after weighting/matching, with standardized mean differences

### TARGET 10 -- Follow-up

**Description:** Summarize length of follow-up and describe reasons for end of follow-up for each treatment strategy and causal contrast.

### TARGET 11 -- Missing data

**Description:** Describe the frequency of missing data in all variables, by treatment strategy when applicable.

### TARGET 12 -- Outcomes

**Description:** Describe the frequency or distribution of each outcome, by treatment strategy.

### TARGET 13 -- Effect estimates

**Description:** Report the effect estimates for each causal contrast with corresponding measures of precision, including both absolute and relative measures of effect, when applicable.

**What to look for in code/outputs:**
- Absolute (risk difference, standardized risk curves) and relative effects with CIs for every causal contrast

### TARGET 14 -- Additional analyses

**Description:** Report results of all analyses to assess the sensitivity of the estimates to choices in operationalizations, assumptions and analysis.

---

## Discussion

### TARGET 15 -- Interpretation

**Description:** Provide an interpretation of the key findings.

### TARGET 16 -- Limitations

**Description:** Discuss the limitations of the study considering differences between the target trial and its emulation and the plausibility of assumptions, including assumptions regarding baseline confounding due to lack of randomization.

**What to look for in code/outputs:**
- A target-trial vs emulation comparison that names each compromise (eligibility, strategies, assignment, follow-up, outcomes)
- Exchangeability, positivity, and well-defined-intervention assumptions discussed against the diagnostics actually produced

---

## Other information

### TARGET 17 -- Ethics

**Description:** Provide the institutional research board or ethics committee that approved the study and approval numbers, if relevant.

### TARGET 18 -- Registration

**Description:** State whether, when and where the study protocol was registered.

### TARGET 19 -- Sharing of study materials

**Description:** Provide information on whether data, analytic code and/or other materials are accessible, and where and how they can be accessed.

### TARGET 20 -- Funding sources

**Description:** Provide the sources of funding and detail the role of the funders in the design, conduct and reporting of the study.

### TARGET 21 -- Conflicts of interest

**Description:** State any conflicts of interest and financial disclosures for all authors.
