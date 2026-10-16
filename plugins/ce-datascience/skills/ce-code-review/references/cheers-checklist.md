# CHEERS 2022 Checklist for Health Economic Evaluations

## Contents

- Title
- Abstract
- Introduction
- Methods
- Results
- Discussion
- Other relevant information

Consolidated Health Economic Evaluation Reporting Standards (CHEERS 2022).
28-item checklist applicable to health economic evaluations.

**Primary reference:** Husereau D, Drummond M, Augustovski F, et al; CHEERS 2022 ISPOR Good Research Practices Task Force. Consolidated Health Economic Evaluation Reporting Standards 2022 (CHEERS 2022) statement: updated reporting guidance for health economic evaluations. BMJ. 2022;376:e067975. doi:10.1136/bmj-2021-067975. PMID: 35017145.

**Source and licence:** Item numbers, topics, and guidance are reproduced verbatim from "The CHEERS 2022 checklist" table in BMJ 2022;376:e067975 (https://doi.org/10.1136/bmj-2021-067975, PMC8749494), published under CC BY 4.0. Official checklist PDF: https://www.equator-network.org/wp-content/uploads/2013/04/CHEERS-2022-checklist-1.pdf. The "What to look for" bullets are ce-datascience review guidance, not part of the guideline. For economic evaluations of interventions that use artificial intelligence, also apply the CHEERS-AI extension (Elvidge J, et al. Value Health. 2024;27(9):1196-1205. doi:10.1016/j.jval.2024.05.006. PMID: 38795956).

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title

### Item 1 -- Title

**Description:** Identify the study as an economic evaluation and specify the interventions being compared.

**What to look for in code/outputs:**
- Report title or rendered document header identifying the study as a health economic evaluation
- Specific economic evaluation type named (cost-effectiveness, cost-utility, cost-benefit, cost-minimization)
- Interventions being compared identified in the title
- Title template or generation code that includes the evaluation type designation

---

## Abstract

### Item 2 -- Abstract

**Description:** Provide a structured summary that highlights context, key methods, results, and alternative analyses.

**What to look for in code/outputs:**
- Structured abstract with context, methods, results, and implications sections
- Key model inputs and outcomes summarized in the abstract
- Base-case results and uncertainty analysis findings included
- ICER or other summary economic metric reported in the abstract output

---

## Introduction

### Item 3 -- Background and objectives

**Description:** Give the context for the study, the study question, and its practical relevance for decision making in policy or practice.

**What to look for in code/outputs:**
- Background section establishing the clinical and economic context for the evaluation
- Study question clearly stated with relevance to health policy or clinical decision making
- Prior economic evaluations on the topic referenced
- Decision problem framed from the perspective of relevant stakeholders

---

## Methods

### Item 4 -- Health economic analysis plan

**Description:** Indicate whether a health economic analysis plan was developed and where available.

**What to look for in code/outputs:**
- Health economic analysis plan (HEAP) referenced or included in project files
- Registration or pre-specification of the analysis plan documented
- Plan accessibility documented (URL, repository, supplementary material)
- Protocol deviations from the original plan noted

### Item 5 -- Study population

**Description:** Describe characteristics of the study population (such as age range, demographics, socioeconomic, or clinical characteristics).

**What to look for in code/outputs:**
- Target population demographics defined in model parameters or documentation
- Age range, sex distribution, disease characteristics specified
- Population source data referenced (clinical trial, registry, national statistics)
- Subpopulation definitions for heterogeneity analyses documented

### Item 6 -- Setting and location

**Description:** Provide relevant contextual information that may influence findings.

**What to look for in code/outputs:**
- Country and healthcare setting specified in model documentation
- Level of care (primary, secondary, tertiary) documented
- Geographic or institutional context that influences costs or outcomes described
- Health system characteristics relevant to the evaluation noted

### Item 7 -- Comparators

**Description:** Describe the interventions or strategies being compared and why chosen.

**What to look for in code/outputs:**
- Comparator interventions explicitly defined in model structure or documentation
- Rationale for comparator selection documented (current standard of care, dominant alternatives)
- Intervention components described in sufficient detail (drug, dose, schedule, duration)
- "Do nothing" or status quo comparator included where appropriate

### Item 8 -- Perspective

**Description:** State the perspective(s) adopted by the study and why chosen.

**What to look for in code/outputs:**
- Analytic perspective explicitly stated (healthcare system, societal, patient, payer)
- Cost categories included/excluded consistent with the stated perspective
- Justification for perspective choice documented
- Multiple perspectives analyzed if recommended by guidelines (e.g., societal alongside healthcare)

### Item 9 -- Time horizon

**Description:** State the time horizon for the study and why appropriate.

**What to look for in code/outputs:**
- Time horizon specified in model parameters (e.g., lifetime, 10 years, trial duration)
- Justification for time horizon documented (captures all relevant costs and outcomes)
- Model cycle length defined and justified relative to the time horizon
- Extrapolation beyond trial data documented when lifetime horizon used

### Item 10 -- Discount rate

**Description:** Report the discount rate(s) and reason chosen.

**What to look for in code/outputs:**
- Discount rate specified in model parameters (e.g., 3%, 3.5%, 5% per year)
- Same or different rates for costs and outcomes documented with justification
- Discount rate consistent with national HTA guidelines referenced
- Undiscounted results reported alongside discounted as sensitivity check

### Item 11 -- Selection of outcomes

**Description:** Describe what outcomes were used as the measure(s) of benefit(s) and harm(s).

**What to look for in code/outputs:**
- Health outcomes specified (QALYs, DALYs, life years, clinical endpoints)
- Rationale for outcome measure selection documented
- Both benefits and harms captured in the outcome measure
- Outcome measure aligned with the decision context and perspective

### Item 12 -- Measurement of outcomes

**Description:** Describe how outcomes used to capture benefit(s) and harm(s) were measured.

**What to look for in code/outputs:**
- Outcome measurement methods documented (clinical trial endpoints, survival data, natural history models)
- QALY calculation code with utility weights and survival estimates
- Data sources for outcome parameters referenced (published literature, trial data, registry)
- Transition probabilities or event rates documented with sources

### Item 13 -- Valuation of outcomes

**Description:** Describe the population and methods used to measure and value outcomes.

**What to look for in code/outputs:**
- Utility valuation method documented (EQ-5D, SF-6D, HUI, direct elicitation)
- Population used for valuation specified (general public, patient, expert)
- Country-specific tariffs or value sets referenced
- Disutility values for adverse events documented with sources

### Item 14 -- Measurement and valuation of resources and costs

**Description:** Describe how costs were valued.

**What to look for in code/outputs:**
- Cost categories enumerated (drug acquisition, administration, monitoring, hospitalization, adverse events)
- Unit costs documented with sources (fee schedules, hospital cost data, published literature)
- Resource use quantities specified per cost category
- Micro-costing vs. gross-costing approach documented
- Cost estimation code with transparent parameter sources

### Item 15 -- Currency, price date, and conversion

**Description:** Report the dates of the estimated resource quantities and unit costs, plus the currency and year of conversion.

**What to look for in code/outputs:**
- Currency and price year explicitly stated in model outputs
- Cost inflation methods documented (CPI, GDP deflator, specific health cost indices)
- Currency conversion methods documented when applicable (purchasing power parities, exchange rates)
- Reference year for all cost parameters consistently applied

### Item 16 -- Rationale and description of model

**Description:** If modelling is used, describe in detail and why used. Report if the model is publicly available and where it can be accessed.

**What to look for in code/outputs:**
- Model type explicitly stated (decision tree, Markov, microsimulation, partitioned survival, discrete event simulation)
- Model structure diagram generated or referenced
- Rationale for model type selection documented (disease natural history, data availability)
- Health states, transitions, and model architecture described
- Model validation procedures documented
- Structural assumptions listed and justified (cycle length, half-cycle correction, mortality assumptions)
- Clinical assumptions documented (treatment effect duration, disease progression, cure rates)
- Assumptions about resource use patterns documented
- Model simplifications acknowledged with rationale
- Public availability of the model and where it can be accessed (repository, licence) stated

### Item 17 -- Analytics and assumptions

**Description:** Describe any methods for analysing or statistically transforming data, any extrapolation methods, and approaches for validating any model used.

**What to look for in code/outputs:**
- Statistical methods for parameter estimation documented (survival analysis, regression, meta-analysis)
- Extrapolation methods specified (parametric survival curves: exponential, Weibull, log-logistic, etc.)
- Missing data handling documented
- Data pooling or synthesis methods (network meta-analysis, indirect comparison) described
- Curve-fitting diagnostics (AIC, BIC, visual inspection) reported for model selection

### Item 18 -- Characterising heterogeneity

**Description:** Describe any methods used for estimating how the results of the study vary for subgroups.

**What to look for in code/outputs:**
- Subgroup analyses defined by relevant patient or clinical characteristics
- Heterogeneity analysis code stratified by age, sex, disease severity, or risk factors
- Individual patient-level simulation with heterogeneous inputs documented
- Equity-relevant subgroup analyses included where appropriate

### Item 19 -- Characterising distributional effects

**Description:** Describe how impacts are distributed across different individuals or adjustments made to reflect priority populations.

**What to look for in code/outputs:**
- Distributional analysis code examining equity implications
- Costs and outcomes disaggregated by socioeconomic, demographic, or geographic group
- Equity weighting methods documented if applied
- Health inequality impact assessment included

### Item 20 -- Characterising uncertainty

**Description:** Describe methods to characterise any sources of uncertainty in the analysis.

**What to look for in code/outputs:**
- Deterministic sensitivity analysis (one-way, multi-way) code and tornado diagram output
- Probabilistic sensitivity analysis (PSA) code with Monte Carlo simulation
- Parameter distributions specified for PSA (beta for probabilities, gamma for costs, log-normal for hazard ratios)
- Cost-effectiveness acceptability curve (CEAC) generated from PSA output
- Scenario analyses varying structural assumptions documented

### Item 21 -- Approach to engagement with patients and others affected by the study

**Description:** Describe any approaches to engage patients or service recipients, the general public, communities, or stakeholders (such as clinicians or payers) in the design of the study.

**What to look for in code/outputs:**
- Patient or public involvement (PPI) in study design documented
- Stakeholder engagement activities described (advisory boards, focus groups, surveys)
- How patient input influenced the evaluation noted (outcome selection, model structure, interpretation)
- Documentation of engagement approach or PPI reporting checklist (GRIPP2)

---

## Results

### Item 22 -- Study parameters

**Description:** Report all analytic inputs (such as values, ranges, references) including uncertainty or distributional assumptions.

**What to look for in code/outputs:**
- Parameter table generated with base-case values, ranges, distributions, and sources
- All model inputs documented (clinical, cost, utility parameters)
- Probability distributions for PSA specified per parameter
- Source references for each parameter included in output tables

### Item 23 -- Summary of main results

**Description:** Report the mean values for the main categories of costs and outcomes of interest and summarise them in the most appropriate overall measure.

**What to look for in code/outputs:**
- Total costs and outcomes per strategy reported in results tables
- Incremental costs, incremental outcomes, and ICER calculated and displayed
- Cost-effectiveness plane or summary results table generated
- Disaggregated costs by category (drug, hospitalization, monitoring) reported
- QALYs or other outcomes disaggregated by health state if model-based

### Item 24 -- Effect of uncertainty

**Description:** Describe how uncertainty about analytic judgments, inputs, or projections affect findings. Report the effect of choice of discount rate and time horizon, if applicable.

**What to look for in code/outputs:**
- Tornado diagram showing one-way sensitivity analysis results
- PSA scatter plot on the cost-effectiveness plane generated
- Cost-effectiveness acceptability curve (CEAC) output
- Value of information analysis (EVPI, EVPPI) if conducted
- Scenario analysis results comparing structural assumptions

### Item 25 -- Effect of engagement with patients and others affected by the study

**Description:** Report on any difference patient/service recipient, general public, community, or stakeholder involvement made to the approach or findings of the study

**What to look for in code/outputs:**
- Results or discussion text describing what changed because of patient, public, community, or stakeholder input (outcomes chosen, model structure, parameter values, interpretation)
- Explicit statement when engagement made no difference or no engagement took place
- Consistency with the engagement approach described under Item 21

---

## Discussion

### Item 26 -- Study findings, limitations, generalisability, and current knowledge

**Description:** Report key findings, limitations, ethical or equity considerations not captured, and how these could affect patients, policy, or practice.

**What to look for in code/outputs:**
- Discussion section summarizing key findings and linking to conclusions
- Limitations documented (data quality, model assumptions, generalizability constraints)
- Comparison with prior economic evaluations on the same topic
- Generalizability assessment relative to different settings, populations, or health systems
- Policy implications framed by the uncertainty in results
- Ethical or equity considerations not captured by the analysis discussed

---

## Other relevant information

### Item 27 -- Source of funding

**Description:** Describe how the study was funded and any role of the funder in the identification, design, conduct, and reporting of the analysis

**What to look for in code/outputs:**
- Funding source documented with grant numbers
- Funder role in study design, analysis, and interpretation explicitly stated
- Independence of the analysis from funder influence documented
- Industry sponsorship disclosed if applicable

### Item 28 -- Conflicts of interest

**Description:** Report authors conflicts of interest according to journal or International Committee of Medical Journal Editors requirements.

**What to look for in code/outputs:**
- Conflict of interest disclosures for all authors in report output
- Financial and non-financial conflicts documented
- ICMJE disclosure forms referenced or completed
- Industry advisory roles, consulting fees, or equity interests disclosed
