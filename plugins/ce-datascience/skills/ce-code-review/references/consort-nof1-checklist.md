# CONSORT Extension for N-of-1 Trials

## Contents

- Title and Abstract (items 1a-1b)
- Introduction (item 2a.2)
- Methods (items 3a-12c)
- Results (items 13a.1-19)

Consolidated Standards of Reporting Trials (CONSORT) extension for N-of-1 trials (CENT 2015).
Supplements the current CONSORT core with items specific to single-patient multiple-crossover trials (N-of-1 trials) conducted individually or as a series. CENT adds guidance to 14 of the 25 CONSORT 2010 items; the CONSORT 2010 items not listed below apply unchanged, and items 2a.1, 6a.1 and 13b keep the CONSORT 2010 text. CENT also recommends a diagram depicting an individual N-of-1 trial and a modified CONSORT flow diagram for a series.

**Primary reference:** Vohra S, Shamseer L, Sampson M, et al.; CENT Group. CONSORT extension for reporting N-of-1 trials (CENT) 2015 Statement. BMJ. 2015;350:h1738. doi:10.1136/bmj.h1738. PMID: 25976398. Erratum: BMJ. 2016;355:i5381 (PMID: 27758798). Also published in J Clin Epidemiol. 2016;76:9-17 (doi:10.1016/j.jclinepi.2015.05.004; PMID: 26272792; e-published 2015).

**Explanation and elaboration:** Shamseer L, Sampson M, Bukutu C, et al.; CENT Group. CONSORT extension for reporting N-of-1 trials (CENT) 2015: Explanation and elaboration. BMJ. 2015;350:h1793. PMID: 25976162.

**Verified against:** "CONSORT Extension for N-of-1 Trials (CENT) 2015 checklist" (Word), linked from https://www.consort-spirit.org/extensions, and the EQUATOR record https://www.equator-network.org/reporting-guidelines/consort-cent/ (verified 2026-10-15). Re-checked on 2026-10-15 against Tables 1 and 2 of the BMJ statement (BMJ 2015;350:h1738, PDF): items 1a-19 match Table 1, and the abstract guidance under item 1b follows Table 2.

**Licence:** Checklist text reproduced verbatim (including its original punctuation) from the CENT 2015 checklist, which states: "The copyright for CENT (including checklist) is held by the CENT Group and is distributed under a Creative Commons Attribution (CC-BY 4.0) license." (https://creativecommons.org/licenses/by/4.0/). The BMJ article itself is CC BY-NC 4.0. The CC BY statement is a footnote to the checklist (Table 1), so the abstract guidance (Table 2) is treated as part of the CC BY-NC article and paraphrased. The "What to look for" bullets and the CONSORT 2025 mapping lines are added by this plugin and are not CENT text.

**Numbering:** Item IDs are the CENT 2015 numbers, keyed to CONSORT 2010. Apply CENT alongside the CONSORT 2025 core and cite CONSORT 2025 numbers for core items; each item gives the nearest CONSORT 2025 core item as a plugin mapping.

**Privacy (checklist footnote):** Caution should be taken when reporting potentially identifying information pertaining to CENT items 4a, 4b, 14a, and 15.

---

## Title and Abstract

### Item 1a -- Identification as an N-of-1 trial

**Description:** Identify as an "N-of-1 trial" in the title For series: Identify as "a series of N-of-1 trials" in the title

CONSORT 2025 core: 1a.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "N-of-1 trial" or "series of N-of-1 trials"
- Documentation distinguishing this design from a parallel-group crossover trial, case study, or observational repeated-measures study

### Item 1b -- Abstract

**Description:** For specific guidance, see CENT guidance for abstracts (table 2)

CONSORT 2025 core: 1b.

**CENT abstract guidance (Table 2, paraphrased):** CENT changes or adds to these CONSORT for Abstracts items; all other CONSORT for Abstracts items (authors, objective, outcome, randomisation, blinding, outcome results, harms, conclusions, trial registration, funding) apply unchanged.

| CONSORT for Abstracts item | N-of-1 modification |
|---|---|
| Title | Identify the study in the title as an N-of-1 trial or a series of N-of-1 trials |
| Trial design | Describe the design, the number of periods, and the duration of each period |
| Participant(s) | Individual trial: the clinical condition studied. Series: participant eligibility criteria |
| Interventions | Interventions planned for each period (not each group) |
| Numbers randomised | Individual trial: number and sequence of periods completed. Series: number of individual trials done |
| Recruitment | Not applicable (trial status is not required) |
| Numbers analysed | Individual trial: periods analysed per intervention. Series: number of participants analysed |

**What to look for in code/outputs:**
- Abstract stating whether results describe a single patient or a series
- Abstract reporting the number and duration of periods, and the periods completed and analysed per intervention (or, for a series, trials done and participants analysed)

---

## Introduction

### Item 2a.2 -- Rationale for the N-of-1 approach

**Description:** Rationale for using N-of-1 approach

CONSORT 2025 core: 6.

**What to look for in code/outputs:**
- Documentation justifying why a parallel-group trial was not used (e.g., chronic stable condition, individual long-term treatment decision, rare disease)
- Protocol or SAP text explaining how the N-of-1 design addresses the clinical question

---

## Methods

### Item 3a -- Trial design, periods, and durations

**Description:** Describe trial design, planned number of periods, and duration of each period (including run-in and wash out, if applicable) In addition for series: Whether and how the design was individualized to each participant, and explain the series design

CONSORT 2025 core: 9.

**What to look for in code/outputs:**
- Treatment period length and washout duration specified in the SAP, with justification (time to effect and offset)
- Pre-specified number of periods or pairs, and any stopping rules for individual patients
- Code variables defining period start and end dates relative to the washout schedule

### Item 4a -- Diagnosis and clinical context

**Description:** Diagnosis or disorder, diagnostic criteria, comorbid conditions, and concurrent therapies. For series: Same as CONSORT item 4a

CONSORT 2025 core: 12a.

**What to look for in code/outputs:**
- Diagnostic criteria, comorbidities, and concurrent therapies recorded without identifying details

### Item 4c -- Research status and ethics approval

**Description:** Whether the trial(s) represents a research study and if so, whether institutional ethics approval was obtained

CONSORT 2025 core: no direct equivalent (ethics approval is reported outside the core items).

**What to look for in code/outputs:**
- Statement of whether the trial was research or clinical care, with the ethics approval reference if research

### Item 5 -- Interventions for each period

**Description:** The interventions for each period with sufficient details to allow replication, including how and when they were actually administered

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Per-period treatment records (drug, dose, timing) and pharmaceutical preparation used for blinding (e.g., overencapsulation, matching placebo)

### Item 6a.2 -- Outcome assessment tools

**Description:** Description and measurement properties (validity and reliability) of outcome assessment tools

CONSORT 2025 core: 14.

**What to look for in code/outputs:**
- Instrument names, versions, and cited validity and reliability evidence
- Timing of outcome assessments within each period and how multiple within-period observations are summarized

### Item 8a -- Randomisation of period order

**Description:** Whether the order of treatment periods was randomised, with rationale, and method used to generate allocation sequence

CONSORT 2025 core: 17a.

**What to look for in code/outputs:**
- Sequence assignment code operating at the period level for each patient, with seed recorded

### Item 8b -- Type of randomisation and restrictions

**Description:** When applicable, type of randomisation; details of any restrictions (such as pairs, blocking)

CONSORT 2025 core: 17b.

**What to look for in code/outputs:**
- Documentation of randomisation within pairs or blocks, or of a fixed alternating sequence

### Item 8c -- Full intended sequence

**Description:** Full, intended sequence of periods

CONSORT 2025 core: 17b.

**What to look for in code/outputs:**
- The planned sequence of periods stored alongside the per-period outcome data

### Item 12a -- Summarizing data and comparing interventions

**Description:** Methods used to summarize data and compare interventions for primary and secondary outcomes

CONSORT 2025 core: 21a.

**What to look for in code/outputs:**
- Within-patient analysis method specified (e.g., paired comparison, linear mixed model, Bayesian model) and implemented before any aggregation
- Interval estimates for the individual-level treatment effect

### Item 12b -- Quantitative synthesis for a series

**Description:** For series: If done, methods of quantitative synthesis of individual trial data, including subgroup analyses, adjusted analyses, and how heterogeneity between participants was assessed, (for specific guidance on reporting syntheses of multiple trials, please consult the PRISMA Statement)

CONSORT 2025 core: 21d.

**What to look for in code/outputs:**
- Aggregation method (random-effects meta-analysis or Bayesian hierarchical model) with individual estimates as inputs
- Between-patient heterogeneity estimated and reported

### Item 12c -- Carryover, period effects, and intra-subject correlation

**Description:** Statistical methods used to account for carryover effect, period effects, and intra-subject correlation

CONSORT 2025 core: 21a.

**What to look for in code/outputs:**
- Model terms or tests for period-by-treatment interaction and carryover
- Correlation structure for repeated measures within a patient (e.g., autoregressive errors)
- Sensitivity analyses excluding early observations in each period when carryover is suspected

---

## Results

### Item 13a.1 -- Periods completed

**Description:** Number and sequence of periods completed, and any changes from original plan with reasons

CONSORT 2025 core: 22a.

**What to look for in code/outputs:**
- Per-patient table of planned vs completed periods, in sequence, with reasons for changes

### Item 13a.2 -- Participant flow for a series

**Description:** For series: The number of participants who were enrolled, assigned to interventions, and analysed for the primary outcome

CONSORT 2025 core: 22a.

**What to look for in code/outputs:**
- Modified CONSORT flow diagram for the series showing participants enrolled, assigned, and analysed

### Item 13c -- Losses and exclusions in a series

**Description:** For series: losses or exclusions of participants after treatment assignment, with reasons, and period in which this occurred, if applicable

CONSORT 2025 core: 22b.

**What to look for in code/outputs:**
- Withdrawal records with reasons and the period in which each occurred

### Item 14b -- Early stopping of periods or trial

**Description:** Whether any periods were stopped early and/or whether trial was stopped early, with reason(s).

CONSORT 2025 core: 23b.

**What to look for in code/outputs:**
- Flags for periods or trials stopped early, with reasons

### Item 16 -- Number of periods analysed

**Description:** For each intervention, number of periods analysed. In addition for series: if quantitative synthesis was performed, number of trials for which data were synthesized

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Periods analysed per intervention per patient, and the number of trials entering any synthesis

### Item 17a.1 -- Results for each period

**Description:** For each primary and secondary outcome, results for each period; an accompanying figure displaying the trial data is recommended.

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Per-period outcome summaries and a plot of outcomes over time with periods and treatments marked

### Item 17a.2 -- Effect size and precision

**Description:** For each primary and secondary outcome, the estimated effect size and its precision (such as 95% confidence interval) In addition for series: if quantitative synthesis was performed, group estimates of effect and precision for each primary and secondary outcome

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Individual patient effect estimates with confidence or credible intervals, with the direction of effect labelled
- For a series, the pooled estimate with its interval alongside the individual estimates

### Item 18 -- Other analyses

**Description:** Results of any other analyses performed, including assessment of carryover effects, period effects, intra-subject correlation In addition for series: If done, results of subgroup or sensitivity analyses

CONSORT 2025 core: 28.

**What to look for in code/outputs:**
- Reported results of carryover, period-effect, and autocorrelation assessments
- Subgroup or sensitivity analysis results for a series, labelled as such

### Item 19 -- Harms for each intervention

**Description:** All harms or unintended effects for each intervention. (for specific guidance see CONSORT for harms)

CONSORT 2025 core: 27.

**What to look for in code/outputs:**
- Adverse event records attributed to the intervention and period in which they occurred
