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

TARGET (TrAnsparent ReportinG of observational studies Emulating a Target trial): 21 items in six sections -- abstract (1), introduction (2-4), methods (5-7), results (8-14), discussion (15-16), other information (17-21). Item numbers below follow Table 2 of the statement and the item text is paraphrased (see Source and licence); the "What to look for in code/outputs" bullets are review cues added by this plugin, not checklist text.

**Primary reference:** Cashin AG, Hansford HJ, Hernán MA, et al. Transparent reporting of observational studies emulating a target trial: the TARGET statement. BMJ. 2025;390:e087179. doi:10.1136/bmj-2025-087179. PMID: 40903028.
**Related reference:** Simultaneous publication in JAMA. 2025;334(12):1084-1093. doi:10.1001/jama.2025.13350. PMID: 40899949. PMCID: PMC13084563.

**Source and licence:** Item text is a faithful paraphrase, not a quotation, of the official TARGET checklist (https://target-guideline.org/files/TARGET_checklist_editable_2025.docx; EQUATOR: https://www.equator-network.org/reporting-guidelines/22462/). The checklist is licensed CC BY-ND 4.0, and neither journal publication is verifiably CC BY, so the wording is not reproduced. Item numbers, item names, and meaning follow the official checklist; consult it for the exact wording.

TARGET is intended as a standalone reporting guideline for observational studies of interventions that explicitly emulate a target trial. Do not require STROBE as a companion; add RECORD (routinely collected data) or STROBE only when the journal or data source requires them.

---

## Abstract

### TARGET 1 -- Abstract

**Description:**
- **1a** State that the study uses observational data to emulate a target trial; give the study objectives and a short summary of the specified target trial.
- **1b** Name the data sources used for the emulation.
- **1c** Briefly summarize the key assumptions, the statistical methods, the findings, and the conclusions.

**What to look for in code/outputs:**
- Abstract names the design as a target trial emulation and the data source(s)
- Abstract numbers (effect estimates, CIs, counts) match the analysis outputs

---

## Introduction

### TARGET 2 -- Background

**Description:** Set out the scientific background and the knowledge gap the study addresses.

### TARGET 3 -- Causal question

**Description:** Give a summary of the causal question.

**What to look for in code/outputs:**
- One causal question per primary estimand; the README/SAP and the analysis code agree on it

### TARGET 4 -- Rationale

**Description:** Explain why emulating a target trial with the available data is a suitable approach, and cite any randomized trials that informed the target trial design, where applicable.

---

## Methods

### TARGET 5 -- Data sources

**Description:** Cite each data source used in the analyses and describe its original purpose, data type, geographic coverage, setting, and time period; where relevant, explain how sources were linked or pooled.

**What to look for in code/outputs:**
- Data extraction scripts identify each source, its version/extract date, and the study period
- Linkage or pooling code documented (keys, match rates, deduplication)

### TARGET 6 -- Target trial specification

**Description:** Specify the components of the target trial protocol that would answer the causal question.
- **6a Eligibility criteria** -- State the eligibility criteria.
- **6b Treatment strategies** -- State the treatment strategies to be compared.
- **6c Assignment procedures** -- State that eligible individuals would be randomly assigned to the strategies and could know which strategy they were allocated.
- **6d Follow-up** -- State that follow-up would begin at assignment to a strategy, and specify when it would end.
- **6e Outcomes** -- State the outcomes.
- **6f Causal contrasts** -- State the causal contrasts of interest and their effect measures.
- **6g Identifying assumptions** -- State the assumptions needed to identify each causal estimand and any variables connected to those assumptions.
- **6h Data analysis plan** -- For each causal estimand, state the analysis procedures and their statistical modelling assumptions, including how missing data would be handled.

**What to look for in code/outputs:**
- A protocol table or SAP section that specifies the hypothetical trial before the emulation
- Treatment strategies specified as full regimens (dose, duration, switching, discontinuation), not "treated vs untreated"
- Causal contrast named (intention-to-treat effect, per-protocol effect) with its effect measure (risk difference, risk ratio, hazard ratio)

### TARGET 7 -- Target trial emulation

**Description:** Explain how each component of the target trial protocol was emulated in the observational data, including how every variable was measured or ascertained.
- **7a Eligibility criteria** -- Explain how the eligibility criteria were operationalized in the data.
- **7b Treatment strategies** -- Explain how the treatment strategies were operationalized in the data.
- **7c Assignment procedures** -- Explain how assignment to the treatment strategies was operationalized in the data.
- **7d Follow-up** -- Confirm that follow-up begins when individuals are assigned to a strategy, and explain how the end of follow-up was operationalized in the data.
- **7e Outcomes** -- Explain how the outcomes were operationalized in the data.
- **7f Causal contrasts** -- Explain how the causal contrasts, including effect measures, were operationalized in the data.
- **7g.i Identifying assumptions** -- For each causal estimand, state the assumptions used to identify it, including assumptions about baseline confounding arising from the absence of randomization.
- **7g.ii** -- Explain how the variables connected to those assumptions were operationalized in the data.
- **7h.i Data analysis plan** -- For each causal estimand, state the analysis procedures and their statistical modelling assumptions, including how missing data were handled.
- **7h.ii** -- For each causal estimand, describe any additional analyses run to test how sensitive the results are to choices of operationalization, assumptions, and analysis.

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

**Description:** Give the numbers assessed for eligibility, found eligible, and assigned to each treatment strategy; a flow diagram is strongly recommended.

**What to look for in code/outputs:**
- Counts produced at each filtering step in code and a flow diagram generated from them

### TARGET 9 -- Baseline data

**Description:** Describe the baseline characteristics of individuals, by treatment strategy.

**What to look for in code/outputs:**
- Baseline table by strategy, before and after weighting/matching, with standardized mean differences

### TARGET 10 -- Follow-up

**Description:** Summarize the length of follow-up and the reasons follow-up ended, for each treatment strategy and causal contrast.

### TARGET 11 -- Missing data

**Description:** Report how often data were missing for every variable, by treatment strategy where applicable.

### TARGET 12 -- Outcomes

**Description:** Report the frequency or distribution of each outcome, by treatment strategy.

### TARGET 13 -- Effect estimates

**Description:** For each causal contrast, give the effect estimate with its measure of precision, reporting absolute and relative effect measures where applicable.

**What to look for in code/outputs:**
- Absolute (risk difference, standardized risk curves) and relative effects with CIs for every causal contrast

### TARGET 14 -- Additional analyses

**Description:** Report the results of every analysis run to test how sensitive the estimates are to choices of operationalization, assumptions, and analysis.

---

## Discussion

### TARGET 15 -- Interpretation

**Description:** Interpret the key findings.

### TARGET 16 -- Limitations

**Description:** Discuss the study's limitations, including differences between the target trial and its emulation and how plausible the assumptions are, especially those about baseline confounding arising from the absence of randomization.

**What to look for in code/outputs:**
- A target-trial vs emulation comparison that names each compromise (eligibility, strategies, assignment, follow-up, outcomes)
- Exchangeability, positivity, and well-defined-intervention assumptions discussed against the diagnostics actually produced

---

## Other information

### TARGET 17 -- Ethics

**Description:** Name the institutional review board or ethics committee that approved the study and give approval numbers, where relevant.

### TARGET 18 -- Registration

**Description:** State whether the study protocol was registered, and if so when and where.

### TARGET 19 -- Sharing of study materials

**Description:** State whether the data, analytic code, and other materials are available, and where and how to access them.

### TARGET 20 -- Funding sources

**Description:** List the funding sources and describe the funders' role in designing, conducting, and reporting the study.

### TARGET 21 -- Conflicts of interest

**Description:** Declare any conflicts of interest and financial disclosures for every author.
