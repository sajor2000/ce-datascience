# CONSORT Extension for N-of-1 Trials

Consolidated Standards of Reporting Trials (CONSORT) extension for N-of-1 trials.
Supplements the core CONSORT 2010 checklist with items specific to single-patient multiple-crossover trials (N-of-1 trials) conducted individually or as a series.

**Primary reference:** Vohra S, Shamseer L, Sampson M, et al. CONSORT extension for reporting N-of-1 trials (CENT) 2015 statement. J Clin Epidemiol. 2015;76:9-17. doi:10.1016/j.jclinepi.2015.05.004. PMID: 26272792.

Apply this checklist alongside the core CONSORT 2010 checklist. Items below represent additions or modifications to base CONSORT items required for N-of-1 trial designs. Each item includes the description and what to look for in analysis code and outputs.

---

## Title and Abstract

### Item 1 -- Identification as an N-of-1 trial

**Description:** Identify the study as an N-of-1 trial or series of N-of-1 trials in the title and abstract, specifying whether the report covers a single patient or an aggregated series.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "N-of-1 trial," "single patient trial," or "series of N-of-1 trials"
- Abstract text clarifying whether results describe a single patient or an aggregated analysis across multiple N-of-1 trials
- Documentation distinguishing this design from a crossover trial, case study, or observational repeated-measures study

---

## Introduction

### Item 2 -- Rationale for N-of-1 design*

**Description:** Explain the rationale for using an N-of-1 design, including the clinical or scientific circumstances that make individual-level treatment comparison appropriate.

**What to look for in code/outputs:**
- Documentation justifying why a parallel-group or conventional crossover trial was not used (e.g., chronic stable condition, long-term treatment decision for an individual, patient preference)
- Report sections describing the clinical condition as one where group-average effects are expected to be heterogeneous or where individual-level decisions are the goal
- Protocol or SAP text explaining how the N-of-1 design addresses the specific clinical question

---

## Methods

### Item 3 -- Treatment periods and washout*

**Description:** Describe the length of each treatment period, the criteria used to determine period length (e.g., expected time to treatment effect and offset), and the duration and nature of any washout periods between treatment periods.

**What to look for in code/outputs:**
- Treatment period length specified in the SAP or protocol with justification based on pharmacokinetics or expected time to therapeutic effect
- Washout period duration specified with the rationale (minimum time for drug clearance, return to baseline)
- Code variables defining period start and end dates or time points relative to the washout schedule
- Outcome assessment windows within each treatment period documented and coded

### Item 4 -- Sequence of treatments*

**Description:** Describe the method used to determine the order of treatment periods (e.g., random assignment, alternating order) and whether the sequence was disclosed to the patient and clinician.

**What to look for in code/outputs:**
- Randomization or sequence assignment code operating at the period level for each patient
- Documentation of whether a balanced incomplete block design, fully randomized order, or fixed alternating sequence was used
- Record of whether treatment sequence allocation was concealed from the patient and clinician prior to each period
- Sequence assignment recorded in the data alongside the outcome data for each period

### Item 5 -- Number of treatment pairs or cycles*

**Description:** State the planned number of treatment periods (or treatment pairs for alternating designs) and the rationale for this number, including any stopping rules for individual patients.

**What to look for in code/outputs:**
- Pre-specified number of treatment cycles or pairs documented in the SAP (e.g., three pairs of two periods each)
- Rationale for the planned number of cycles based on power considerations or clinical decision requirements
- Stopping rules for individual patients defined (e.g., stop after achieving a clear treatment preference or after a pre-specified number of cycles regardless of outcome)
- Code recording the actual number of completed cycles per patient and flagging patients who stopped early with reasons

### Item 6 -- Carryover effects assessment*

**Description:** Describe how carryover effects (the influence of treatment received in one period on outcomes in subsequent periods) were assessed and accounted for in the analysis.

**What to look for in code/outputs:**
- Code testing for period-by-treatment interaction or carry-over effects in the statistical model
- Washout monitoring variables (e.g., drug levels, symptom scores at the start of each period) used as indicators of incomplete washout
- Documentation of the assumption of no carry-over and the evidence supporting this assumption
- Sensitivity analyses excluding the first period of each pair or extending the washout period in a subset of patients
- Graphical displays of outcomes by period overlaid on treatment assignment to visually inspect period trends and carryover

### Item 7 -- Outcome measurement within periods*

**Description:** Describe how and when outcomes were measured within each treatment period, including the number of observations per period and how multiple measurements within a period were combined.

**What to look for in code/outputs:**
- Timing of outcome assessments within each period documented (e.g., daily diary for days 5-14 of a 14-day period)
- Code averaging or summarizing multiple within-period observations to a single period-level outcome
- Rules for handling missing within-period observations documented and applied consistently
- Period summary statistics output alongside raw within-period measurements for review

### Item 8 -- Blinding in N-of-1 context

**Description:** State whether the patient, clinician, and outcome assessors were blinded to treatment assignment within each period, and describe how blinding was achieved (e.g., matching placebo, overencapsulation).

**What to look for in code/outputs:**
- Documentation of blinding status for the patient, treating clinician, and outcome assessor
- Pharmaceutical preparation method ensuring treatment indistinguishability referenced (overencapsulation, matching placebo)
- Blinding check or success assessment code (patient's guess of treatment assignment)
- Procedures for emergency unblinding described in the protocol

### Item 9 -- Statistical methods for within-patient analysis*

**Description:** Describe the primary statistical method for estimating the within-patient treatment effect, including how data were analysed to compare treatment periods for the individual patient.

**What to look for in code/outputs:**
- Within-patient analysis method specified: paired t-test, Wilcoxon signed-rank, linear mixed model with patient-as-random-effect, Bayesian hierarchical model
- Code implementing the primary within-patient comparison at the individual level before any aggregation
- Confidence intervals or credible intervals for the individual-level treatment effect computed and reported
- Documentation that the within-patient analysis is the primary inference target, not a group-average effect

### Item 10 -- Aggregation across patients in a series*

**Description:** If the report covers a series of N-of-1 trials, describe the method used to aggregate or synthesize individual patient results, including the rationale for aggregation and the model used.

**What to look for in code/outputs:**
- Aggregation method described: meta-analytic pooling using random-effects model, Bayesian hierarchical model with patient-level random effects, or fixed-effects pooling
- Code implementing the aggregation with individual patient estimates as inputs
- Between-patient heterogeneity estimated and reported (tau-squared or I-squared for random-effects approaches)
- Rationale for aggregating results across patients documented (e.g., estimating average treatment effect across a heterogeneous population)
- Individual patient treatment effect estimates presented alongside the pooled estimate

### Item 11 -- Patient-level treatment effect estimation*

**Description:** Describe how patient-specific treatment effect estimates were derived and whether they were used to guide individual treatment decisions.

**What to look for in code/outputs:**
- Code generating individual patient treatment effect estimates with uncertainty intervals (confidence or credible intervals)
- Documentation of how individual estimates were used clinically (shared with patient, used for prescribing decision)
- Empirical Bayes or shrinkage estimates reported when a hierarchical model is used, alongside the patient's own observed estimate
- Graphical display of individual patient estimates with uncertainty across the patient series

---

## Results

### Item 12 -- Participant flow per patient and per series

**Description:** Report the number of treatment cycles completed for each patient and, for a series, the total number of patients enrolled, completing the full protocol, and analyzed.

**What to look for in code/outputs:**
- Per-patient cycle completion table: planned cycles vs. completed cycles with reasons for early stopping
- For a series: CONSORT flow diagram showing number of patients enrolled, completing all cycles, and analyzed
- Reasons for missing periods or early stopping documented by patient
- Sensitivity analyses comparing completers to non-completers in a series

### Item 13 -- Baseline characteristics per patient

**Description:** Present baseline characteristics for each patient and, where relevant, compare characteristics across patients in a series.

**What to look for in code/outputs:**
- Per-patient baseline table including relevant clinical characteristics and disease severity measures
- For a series: summary table of patient characteristics with variability statistics (mean, SD, range)
- Baseline outcome or symptom scores recorded before the first treatment period for each patient
- Code generating the baseline table from the per-patient data file

### Item 14 -- Individual patient treatment effects*

**Description:** Present the estimated treatment effect for each individual patient with its confidence or credible interval, using a format that allows comparison across patients in a series.

**What to look for in code/outputs:**
- Forest plot or table of individual patient treatment effects with confidence or credible intervals
- Code generating per-patient estimates from the within-patient analysis model
- Graphical display of outcomes by treatment period for each patient (raw data plots)
- Clear labeling of the direction of effect (which treatment is favored) for each patient

### Item 15 -- Aggregated results for a series*

**Description:** For a series of N-of-1 trials, report the pooled treatment effect with its uncertainty, heterogeneity measures, and the number of patients for whom each treatment was favored.

**What to look for in code/outputs:**
- Pooled treatment effect estimate with 95% confidence or credible interval from the aggregation model
- Between-patient heterogeneity statistics (tau-squared, I-squared, or posterior distribution of heterogeneity)
- Count or proportion of patients for whom treatment A was favored, treatment B was favored, or results were inconclusive
- Code confirming the aggregation model and its output are consistent with the described method

### Item 16 -- Carryover and period effects*

**Description:** Report the results of any tests for carryover or period effects and describe how these findings affected the analysis or interpretation.

**What to look for in code/outputs:**
- Test statistics and p-values for carryover and period effect tests reported in results
- Code output for the period-by-treatment interaction test
- Discussion of how any detected carryover or period effects were handled (e.g., excluding first period, extending washout in future trials)
- Sensitivity analysis results when carryover was detected or suspected

---

## Discussion

### Item 17 -- Clinical application of individual results*

**Description:** Discuss how the individual patient treatment effect estimates can be used to guide clinical decisions for the patient(s) included in the trial.

**What to look for in code/outputs:**
- Discussion of how the individual estimates were communicated to patients and clinicians
- Description of the clinical decision made based on the N-of-1 trial results
- Acknowledgment of uncertainty in the individual estimate when cycles are few
- Consideration of whether the result for this individual generalizes to other similar patients

### Item 18 -- Generalizability from a series

**Description:** For a series of N-of-1 trials, discuss the extent to which the aggregated results generalize to the population of patients with the condition, and compare the N-of-1 series results to parallel-group trial evidence if available.

**What to look for in code/outputs:**
- Discussion comparing the aggregate N-of-1 series estimate to evidence from parallel-group RCTs
- Acknowledgment of selection bias (patients motivated to participate in N-of-1 trials may differ from the general population)
- Comparison of the between-patient heterogeneity found in the series to heterogeneity assumptions made in the design
- Recommendations for which patient subtypes may benefit most based on the heterogeneity of treatment response observed
