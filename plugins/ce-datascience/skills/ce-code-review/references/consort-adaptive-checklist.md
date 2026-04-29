# ACE Checklist for Adaptive Clinical Trial Designs

Adaptive designs CONSORT Extension (ACE).
Supplements the core CONSORT 2010 checklist with items specific to randomized controlled trials that use pre-planned adaptations based on accumulating data.

**Primary reference:** Dimairo M, Pallmann P, Wason J, et al. The Adaptive designs CONSORT Extension (ACE) statement: a checklist with explanation and elaboration guideline for reporting randomised trials that use an adaptive design. BMJ. 2020;369:m115. doi:10.1136/bmj.m115. PMID: 32554564.

Apply this checklist alongside the core CONSORT 2010 checklist. Items below represent additions or modifications to base CONSORT items required for adaptive trial designs. Each item describes what must be reported and what to look for in analysis code and outputs.

---

## Title and Abstract

### Item 1 -- Identification as an adaptive design trial

**Description:** Identify the study as a randomized adaptive design trial in the title and abstract, naming the specific type of adaptation used.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "adaptive" and naming the design (e.g., "group sequential," "response-adaptive randomization," "seamless phase II/III")
- Abstract text naming the type of adaptation and summarizing the pre-specified adaptation rules
- Report metadata confirming the adaptive design designation and the primary adaptation type

---

## Introduction

### Item 2 -- Rationale for adaptive design*

**Description:** Explain the scientific and statistical rationale for using an adaptive design, including why a non-adaptive design was insufficient to meet the objectives.

**What to look for in code/outputs:**
- Documentation explicitly justifying the adaptive design over a fixed-sample design
- Report sections explaining the specific operational or scientific advantage gained (e.g., ethical imperative to stop early for harm, uncertainty about effect size requiring sample size re-estimation)
- Protocol or SAP text describing the adaptive design within the context of the overall development program

---

## Methods

### Item 3 -- Type of adaptation*

**Description:** State the type(s) of adaptive design used, including the number of planned interim analyses, and describe each pre-specified adaptation rule in full operational detail.

**What to look for in code/outputs:**
- Adaptation type clearly named: group sequential stopping (for efficacy or futility), sample size re-estimation, arm dropping, biomarker-adaptive enrichment, response-adaptive randomization, seamless phase II/III, or platform trial adaptation
- All planned interim looks listed with their timing (information fraction or calendar time)
- Each adaptation rule specified completely (stopping boundary values, enrichment criteria, re-estimation algorithm, arm-dropping criteria)
- Code or statistical software implementation of the adaptation rules (gsDesign, rpact, ADDPLAN, East) referenced or included

### Item 4 -- Pre-specified adaptation rules*

**Description:** Provide complete pre-specified decision rules for each adaptation, including the criteria that trigger adaptation, the decision algorithm, and the possible outcomes at each interim.

**What to look for in code/outputs:**
- Decision rules documented in the SAP with exact threshold values (e.g., conditional power below 20% triggers futility stopping)
- Code implementing the decision boundaries with the exact parameter values from the SAP
- Documentation confirming rules were pre-specified before any unblinded data were accessed
- Version-controlled SAP files with timestamps confirming pre-specification relative to data access
- Possible outcomes at each interim analysis stage enumerated (continue unchanged, adapt allocation, stop for efficacy, stop for futility, enrich population)

### Item 5 -- Interim analysis schedule*

**Description:** Specify the timing of each planned interim analysis in terms of information fraction, sample size, or calendar time, and describe the process for conducting each interim analysis.

**What to look for in code/outputs:**
- Information fractions or sample size milestones for each interim analysis stated in the SAP and analysis code
- Code that triggers or flags interim analyses at pre-specified data maturity thresholds
- Documentation of who conducts each interim analysis and their access to unblinded data
- Procedures for data lock and data transfer to the independent data monitoring committee (DMC) at each interim

### Item 6 -- Type I error control across adaptations*

**Description:** Describe the method used to control the overall type I error rate across all planned interim analyses and adaptations, including the alpha-spending function or group-sequential boundary used.

**What to look for in code/outputs:**
- Alpha-spending function named and its parameters specified: O'Brien-Fleming, Pocock, Lan-DeMets with exact spending function parameters
- Code implementing the spending function (gsDesign `sfLDOF`, `sfHSD`, or custom function; rpact `getDesignGroupSequential`)
- Cumulative alpha spent at each interim analysis stated alongside the boundary
- Documentation confirming the overall one-sided or two-sided alpha level and how it is apportioned across interims
- Simulation results or analytic derivations confirming family-wise type I error control if non-standard adaptations are used

### Item 7 -- Information fraction at each interim*

**Description:** Provide the information fraction (proportion of maximum information) at each planned interim analysis and explain how information is defined and measured for the primary endpoint.

**What to look for in code/outputs:**
- Information fraction defined (e.g., number of events for time-to-event endpoints, number of participants for continuous endpoints) in the SAP
- Code that computes the information fraction at each interim as a function of observed data
- Planned vs. observed information fractions compared in the results
- Documentation of how information was measured when the maximum information was unknown at design time (e.g., in sample size re-estimation designs)

### Item 8 -- Conditional power and futility rules*

**Description:** If futility stopping is included, describe the conditional power calculation method, the threshold below which the trial will stop for futility, and whether stopping is binding or non-binding.

**What to look for in code/outputs:**
- Conditional power formula or computational approach documented in the SAP
- Threshold for futility stopping stated as a conditional power value (e.g., stop if conditional power < 20%)
- Code computing conditional power at each interim under the current observed treatment effect and under the assumed effect at design
- Documentation of whether futility boundaries are binding (protocol-specified mandatory stopping) or non-binding (advisory)
- DMC charter references confirming futility stopping authority and process

### Item 9 -- Sample size re-estimation method*

**Description:** If sample size re-estimation is used, describe the re-estimation algorithm, the blinding status during re-estimation, the timing, and the minimum and maximum sample size bounds.

**What to look for in code/outputs:**
- Re-estimation algorithm fully specified: internal pilot, conditional power-based re-estimation, promising zone design
- Blinding status at re-estimation: blinded (using pooled variance) vs. unblinded (using observed treatment effect)
- Minimum and maximum allowable sample sizes after re-estimation defined in the SAP and coded as hard constraints
- Code that enforces the bounds and records the pre- and post-re-estimation sample sizes
- Documentation of the timing of re-estimation relative to information fraction

### Item 10 -- Independence of DMC*

**Description:** Describe the independence and operating procedures of the data monitoring committee (DMC) or analogous body that oversees interim analyses and adaptation decisions.

**What to look for in code/outputs:**
- DMC charter referenced in the analysis documentation
- Documentation of DMC independence from the trial sponsor and investigators
- Description of the blinding firewall between the DMC statistician and the trial team
- Procedures for communicating DMC recommendations to the trial team without revealing unblinded interim data
- Code or workflow isolating unblinded analysis code from the main analysis repository

### Item 11 -- Statistical analysis after adaptation*

**Description:** Describe how the primary analysis accounts for the adaptive nature of the design, including any bias correction, conditional inference, or ordering of results across stages.

**What to look for in code/outputs:**
- Final analysis code that combines data across all stages using the correct combining function (e.g., weighted inverse normal, Fisher combination)
- Bias-corrected point estimates or median unbiased estimates reported alongside naive estimates
- Confidence intervals and p-values adjusted for the sequential design (not standard fixed-sample intervals)
- Documentation confirming the primary analysis method was specified before any unblinded data were reviewed
- Stage-wise ordering of results for sequential trials or confidence interval computation method specified

---

## Results

### Item 12 -- Participant flow through adaptive stages*

**Description:** Report the flow of participants through each stage of the adaptive trial, including the number at each interim, any adaptations implemented, and the reasons for stopping or continuing.

**What to look for in code/outputs:**
- CONSORT flow diagram extended to show the number of participants at each stage and the outcome of each interim analysis
- Adaptation decisions documented at each interim: continuation unchanged, sample size increase, arm dropped, population enriched, or stopping
- Code tracking and reporting participant counts at each stage boundary
- Reasons for any unplanned deviations from the adaptation rules documented with rationale

### Item 13 -- Results of interim analyses*

**Description:** Report the results of each interim analysis, including the test statistic, boundary value, information fraction, and the adaptation decision made.

**What to look for in code/outputs:**
- Table of interim analysis results: interim number, timing, observed statistic, boundary value (efficacy and/or futility), conditional power, and decision
- Code that records and outputs interim results in a reproducible log
- Documentation confirming whether each interim result triggered an adaptation or resulted in continuation
- Blinded vs. unblinded interim results clearly distinguished in reporting

### Item 14 -- Final analysis results accounting for adaptation*

**Description:** For each primary and secondary outcome, present the final analysis results including estimates, confidence intervals, and p-values that appropriately account for the adaptive design.

**What to look for in code/outputs:**
- Adjusted (stage-combining or bias-corrected) estimates alongside naive final estimates
- Confidence intervals derived from the sequential or adaptive analysis procedure, not standard fixed-sample formulas
- Adjusted p-values consistent with the alpha-spending or combination test used
- Software and version used for the adaptive analysis reported (gsDesign, rpact, ADDPLAN, East, or custom code)

---

## Discussion

### Item 15 -- Limitations specific to adaptive design

**Description:** Discuss limitations related to the adaptive design, including potential for operational bias, deviations from the adaptation plan, and how the adaptation may affect interpretation.

**What to look for in code/outputs:**
- Limitation sections addressing operational bias risks (e.g., unblinded information leaking to the trial team, sample size changes revealing interim results)
- Documentation of any deviations from the pre-specified adaptation rules with explanation and impact assessment
- Discussion of how the adaptation affects generalizability or interpretation of the results
- Sensitivity analyses comparing adaptive analysis estimates to naive estimates that ignore the adaptive nature

### Item 16 -- Generalizability after adaptation

**Description:** Discuss the generalizability of the results in light of any population enrichment, arm selection, or other adaptation that changed the study population or design during the trial.

**What to look for in code/outputs:**
- Explicit discussion of how population enrichment or arm dropping affects the population to which results apply
- Comparison of the enrolled population pre- and post-adaptation to contextualize generalizability
- Description of the final study population relative to the original target population

---

## Other Information

### Item 17 -- Adaptive design registration and protocol

**Description:** State where the adaptive design protocol, SAP, and DMC charter can be accessed, confirming they were finalized before the first interim analysis.

**What to look for in code/outputs:**
- Registration number referencing an adaptive trial registry entry (ClinicalTrials.gov, EudraCT) that includes the adaptive design details
- Version-controlled SAP and DMC charter with timestamps pre-dating the first interim analysis
- DOI or URL for the published adaptive design protocol if available
- Documentation confirming no post-hoc changes to adaptation rules
