# CHEERS 2022 Checklist for Health Economic Evaluations

Consolidated Health Economic Evaluation Reporting Standards (CHEERS 2022).
28-item checklist applicable to health economic evaluations.

**Primary reference:** Husereau D, Drummond M, Augustovski F, et al; CHEERS 2022 ISPOR Good Research Practices Task Force. Consolidated Health Economic Evaluation Reporting Standards 2022 (CHEERS 2022) statement: updated reporting guidance for health economic evaluations. BMJ. 2022;376:e067975. doi:10.1136/bmj-2021-067975. PMID: 35017145.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title

### Item 1 -- Title

**Description:** Identify the study as an economic evaluation or use more specific terms such as "cost-effectiveness analysis," and describe the interventions compared.

**What to look for in code/outputs:**
- Report title or rendered document header identifying the study as a health economic evaluation
- Specific economic evaluation type named (cost-effectiveness, cost-utility, cost-benefit, cost-minimization)
- Interventions being compared identified in the title
- Title template or generation code that includes the evaluation type designation

---

## Abstract

### Item 2 -- Abstract

**Description:** Provide a structured summary that highlights context, key methods (including study design, inputs, and outcomes), results (including base-case and uncertainty analyses), and implications.

**What to look for in code/outputs:**
- Structured abstract with context, methods, results, and implications sections
- Key model inputs and outcomes summarized in the abstract
- Base-case results and uncertainty analysis findings included
- ICER or other summary economic metric reported in the abstract output

---

## Introduction

### Item 3 -- Background and objectives

**Description:** Give the context for the study, the study question and its practical relevance for decision making in policy or practice.

**What to look for in code/outputs:**
- Background section establishing the clinical and economic context for the evaluation
- Study question clearly stated with relevance to health policy or clinical decision making
- Prior economic evaluations on the topic referenced
- Decision problem framed from the perspective of relevant stakeholders

---

## Methods

### Item 4 -- Health economic analysis plan

**Description:** Indicate whether a health economic analysis plan was developed and where it can be accessed.

**What to look for in code/outputs:**
- Health economic analysis plan (HEAP) referenced or included in project files
- Registration or pre-specification of the analysis plan documented
- Plan accessibility documented (URL, repository, supplementary material)
- Protocol deviations from the original plan noted

### Item 5 -- Study population

**Description:** Describe characteristics of the study population (such as age range, demographics, disease status, country, and other important characteristics).

**What to look for in code/outputs:**
- Target population demographics defined in model parameters or documentation
- Age range, sex distribution, disease characteristics specified
- Population source data referenced (clinical trial, registry, national statistics)
- Subpopulation definitions for heterogeneity analyses documented

### Item 6 -- Setting and location

**Description:** Provide relevant contextual information that may influence findings (such as country, setting of care, geography).

**What to look for in code/outputs:**
- Country and healthcare setting specified in model documentation
- Level of care (primary, secondary, tertiary) documented
- Geographic or institutional context that influences costs or outcomes described
- Health system characteristics relevant to the evaluation noted

### Item 7 -- Comparators

**Description:** Describe the interventions or strategies being compared and why they were chosen.

**What to look for in code/outputs:**
- Comparator interventions explicitly defined in model structure or documentation
- Rationale for comparator selection documented (current standard of care, dominant alternatives)
- Intervention components described in sufficient detail (drug, dose, schedule, duration)
- "Do nothing" or status quo comparator included where appropriate

### Item 8 -- Perspective

**Description:** State the perspective(s) adopted and why.

**What to look for in code/outputs:**
- Analytic perspective explicitly stated (healthcare system, societal, patient, payer)
- Cost categories included/excluded consistent with the stated perspective
- Justification for perspective choice documented
- Multiple perspectives analyzed if recommended by guidelines (e.g., societal alongside healthcare)

### Item 9 -- Time horizon

**Description:** State the time horizon for the study and why it is appropriate.

**What to look for in code/outputs:**
- Time horizon specified in model parameters (e.g., lifetime, 10 years, trial duration)
- Justification for time horizon documented (captures all relevant costs and outcomes)
- Model cycle length defined and justified relative to the time horizon
- Extrapolation beyond trial data documented when lifetime horizon used

### Item 10 -- Discount rate

**Description:** Report the discount rate(s) used for costs and outcomes and why.

**What to look for in code/outputs:**
- Discount rate specified in model parameters (e.g., 3%, 3.5%, 5% per year)
- Same or different rates for costs and outcomes documented with justification
- Discount rate consistent with national HTA guidelines referenced
- Undiscounted results reported alongside discounted as sensitivity check

### Item 11 -- Selection of outcomes

**Description:** Describe what outcomes were used as the measure(s) of benefit, harm, and net benefit and why.

**What to look for in code/outputs:**
- Health outcomes specified (QALYs, DALYs, life years, clinical endpoints)
- Rationale for outcome measure selection documented
- Both benefits and harms captured in the outcome measure
- Outcome measure aligned with the decision context and perspective

### Item 12 -- Measurement of outcomes

**Description:** Describe how outcomes used to capture benefit were measured or estimated.

**What to look for in code/outputs:**
- Outcome measurement methods documented (clinical trial endpoints, survival data, natural history models)
- QALY calculation code with utility weights and survival estimates
- Data sources for outcome parameters referenced (published literature, trial data, registry)
- Transition probabilities or event rates documented with sources

### Item 13 -- Valuation of outcomes

**Description:** Describe the population and methods used to measure and value outcomes, including the use of preference-based instruments.

**What to look for in code/outputs:**
- Utility valuation method documented (EQ-5D, SF-6D, HUI, direct elicitation)
- Population used for valuation specified (general public, patient, expert)
- Country-specific tariffs or value sets referenced
- Disutility values for adverse events documented with sources

### Item 14 -- Resources and costs

**Description:** Describe how costs were valued.

**What to look for in code/outputs:**
- Cost categories enumerated (drug acquisition, administration, monitoring, hospitalization, adverse events)
- Unit costs documented with sources (fee schedules, hospital cost data, published literature)
- Resource use quantities specified per cost category
- Micro-costing vs. gross-costing approach documented
- Cost estimation code with transparent parameter sources

### Item 15 -- Currency, price date, and conversion

**Description:** Report the dates of the estimated resource quantities and unit costs, the currency, and the year of conversion.

**What to look for in code/outputs:**
- Currency and price year explicitly stated in model outputs
- Cost inflation methods documented (CPI, GDP deflator, specific health cost indices)
- Currency conversion methods documented when applicable (purchasing power parities, exchange rates)
- Reference year for all cost parameters consistently applied

### Item 16 -- Rationale and description of model

**Description:** If a model was used, describe and give reasons for the type of model used. Providing a figure to show model structure is strongly recommended.

**What to look for in code/outputs:**
- Model type explicitly stated (decision tree, Markov, microsimulation, partitioned survival, discrete event simulation)
- Model structure diagram generated or referenced
- Rationale for model type selection documented (disease natural history, data availability)
- Health states, transitions, and model architecture described
- Model validation procedures documented

### Item 17 -- Description of model

**Description:** Describe all structural or other assumptions underpinning the model.

**What to look for in code/outputs:**
- Structural assumptions listed and justified (cycle length, half-cycle correction, mortality assumptions)
- Clinical assumptions documented (treatment effect duration, disease progression, cure rates)
- Assumptions about resource use patterns documented
- Model simplifications acknowledged with rationale

### Item 18 -- Analytics and assumptions

**Description:** Describe all analytical methods supporting the evaluation, including methods for dealing with skewed, missing, or censored data; extrapolation methods; approaches for pooling data; regression or curve-fitting methods; and translation of data to the model context.

**What to look for in code/outputs:**
- Statistical methods for parameter estimation documented (survival analysis, regression, meta-analysis)
- Extrapolation methods specified (parametric survival curves: exponential, Weibull, log-logistic, etc.)
- Missing data handling documented
- Data pooling or synthesis methods (network meta-analysis, indirect comparison) described
- Curve-fitting diagnostics (AIC, BIC, visual inspection) reported for model selection

### Item 19 -- Characterizing heterogeneity

**Description:** Describe any methods for identifying, measuring, and adjusting for heterogeneity.

**What to look for in code/outputs:**
- Subgroup analyses defined by relevant patient or clinical characteristics
- Heterogeneity analysis code stratified by age, sex, disease severity, or risk factors
- Individual patient-level simulation with heterogeneous inputs documented
- Equity-relevant subgroup analyses included where appropriate

### Item 20 -- Characterizing distributional effects

**Description:** Describe methods used for estimating how costs and outcomes are distributed across different individuals or adjustments made to reflect priority populations.

**What to look for in code/outputs:**
- Distributional analysis code examining equity implications
- Costs and outcomes disaggregated by socioeconomic, demographic, or geographic group
- Equity weighting methods documented if applied
- Health inequality impact assessment included

### Item 21 -- Characterizing uncertainty

**Description:** Describe methods for characterizing the effects of uncertainty on results, distinguishing among sources of uncertainty.

**What to look for in code/outputs:**
- Deterministic sensitivity analysis (one-way, multi-way) code and tornado diagram output
- Probabilistic sensitivity analysis (PSA) code with Monte Carlo simulation
- Parameter distributions specified for PSA (beta for probabilities, gamma for costs, log-normal for hazard ratios)
- Cost-effectiveness acceptability curve (CEAC) generated from PSA output
- Scenario analyses varying structural assumptions documented

### Item 22 -- Approach to engagement with patients and others affected by the study

**Description:** Describe any approaches to engage patients or other individuals affected by the study (e.g., patient representatives, public contributors) in the design, conduct, and interpretation of the evaluation.

**What to look for in code/outputs:**
- Patient or public involvement (PPI) in study design documented
- Stakeholder engagement activities described (advisory boards, focus groups, surveys)
- How patient input influenced the evaluation noted (outcome selection, model structure, interpretation)
- Documentation of engagement approach or PPI reporting checklist (GRIPP2)

---

## Results

### Item 23 -- Study parameters

**Description:** Report the values, ranges, references, and if used, probability distributions for all parameters. Report reasons or sources for distributions used to represent uncertainty where appropriate.

**What to look for in code/outputs:**
- Parameter table generated with base-case values, ranges, distributions, and sources
- All model inputs documented (clinical, cost, utility parameters)
- Probability distributions for PSA specified per parameter
- Source references for each parameter included in output tables

### Item 24 -- Summary of main results

**Description:** For each intervention, report mean values for the main categories of estimated costs and outcomes, as well as mean differences between comparators. If applicable, report incremental cost-effectiveness ratios.

**What to look for in code/outputs:**
- Total costs and outcomes per strategy reported in results tables
- Incremental costs, incremental outcomes, and ICER calculated and displayed
- Cost-effectiveness plane or summary results table generated
- Disaggregated costs by category (drug, hospitalization, monitoring) reported
- QALYs or other outcomes disaggregated by health state if model-based

### Item 25 -- Effect of uncertainty

**Description:** Describe the effects of uncertainty for all stated decision outcomes of the analysis, doing so as rigorously as possible.

**What to look for in code/outputs:**
- Tornado diagram showing one-way sensitivity analysis results
- PSA scatter plot on the cost-effectiveness plane generated
- Cost-effectiveness acceptability curve (CEAC) output
- Value of information analysis (EVPI, EVPPI) if conducted
- Scenario analysis results comparing structural assumptions

---

## Discussion

### Item 26 -- Study findings, limitations, generalizability, and current knowledge

**Description:** Summarize key study findings and describe how they support the conclusions reached. Discuss limitations and the generalisability of the findings. Compare the findings with current knowledge.

**What to look for in code/outputs:**
- Discussion section summarizing key findings and linking to conclusions
- Limitations documented (data quality, model assumptions, generalizability constraints)
- Comparison with prior economic evaluations on the same topic
- Generalizability assessment relative to different settings, populations, or health systems
- Policy implications framed by the uncertainty in results

---

## Other

### Item 27 -- Source of funding

**Description:** Describe how the study was funded and the role of the funder in the identification, design, conduct, and reporting of the analysis.

**What to look for in code/outputs:**
- Funding source documented with grant numbers
- Funder role in study design, analysis, and interpretation explicitly stated
- Independence of the analysis from funder influence documented
- Industry sponsorship disclosed if applicable

### Item 28 -- Conflicts of interest

**Description:** Report authors' conflicts of interest according to journal or ICMJE requirements.

**What to look for in code/outputs:**
- Conflict of interest disclosures for all authors in report output
- Financial and non-financial conflicts documented
- ICMJE disclosure forms referenced or completed
- Industry advisory roles, consulting fees, or equity interests disclosed
