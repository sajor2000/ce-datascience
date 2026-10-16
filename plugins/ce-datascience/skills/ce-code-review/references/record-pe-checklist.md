# RECORD-PE Checklist for Pharmacoepidemiology Studies

## Contents

- Methods
- Discussion

The reporting of studies conducted using observational routinely collected health data statement for pharmacoepidemiology (RECORD-PE).
Extension of RECORD and STROBE for non-interventional pharmacoepidemiology studies using routinely collected health data (electronic health records, primary care databases, registries, and administrative healthcare claims). It adds 15 items, 13 of them in the methods section: 4.a, 4.b, 6.1.a, 7.1.a-7.1.g, 8.a, 12.1.a, 12.1.b, 19.1.a, 20.a.

**Primary reference:** Langan SM, Schmidt SA, Wing K, Ehrenstein V, Nicholls SG, Filion KB, Klungel O, Petersen I, Sorensen HT, Dixon WG, Guttmann A, Harron K, Hemkens LG, Moher D, Schneeweiss S, Smeeth L, Sturkenboom M, von Elm E, Wang SV, Benchimol EI. The reporting of studies conducted using observational routinely collected health data statement for pharmacoepidemiology (RECORD-PE). BMJ. 2018;363:k3532. doi:10.1136/bmj.k3532. PMID: 30429167. PMCID: PMC6234471.

**Source and licence:** Item text is quoted verbatim from Table 1 of the BMJ statement (CC BY 4.0, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6234471/). The "What to look for in code/outputs" bullets are review cues added by this plugin, not checklist text.

This checklist supplements both STROBE and RECORD -- apply alongside both base checklists. Item numbers attach to the parent STROBE item (4, 8, 20) or RECORD item (6.1, 7.1, 12.1, 19.1).

---

## Methods

### RECORD-PE 4.a -- Study design details

**Description:** Include details of the specific study design (and its features) and report the use of multiple designs if used.

**What to look for in code/outputs:**
- Design named (new-user active-comparator cohort, nested case-control, self-controlled case series, case-crossover) with its features
- Each design documented separately when more than one is used

### RECORD-PE 4.b -- Study design diagram

**Description:** The use of a diagram(s) is recommended to illustrate key aspects of the study design(s), including exposure, washout, lag and observation periods, and covariate definitions as relevant.

**What to look for in code/outputs:**
- Design diagram showing index date, washout, covariate assessment, exposure, lag, and follow-up windows
- Window parameters in config match the diagram

### RECORD-PE 6.1.a -- Study entry criteria

**Description:** Describe the study entry criteria and the order in which these criteria were applied to identify the study population. Specify whether only users with a specific indication were included and whether patients were allowed to enter the study population once or if multiple entries were permitted. See explanatory document for guidance related to matched designs.

**What to look for in code/outputs:**
- Ordered sequence of entry criteria in cohort-building code
- Indication restriction documented
- Single vs multiple cohort entries per patient explicit in code

### RECORD-PE 7.1.a -- Development of the drug exposure definition

**Description:** Describe how the drug exposure definition was developed.

**What to look for in code/outputs:**
- Exposure definition rationale (literature, clinical input, prior validation) documented
- Drug code lists (NDC, ATC, RxNorm, BNF) with version and any mapping between systems

### RECORD-PE 7.1.b -- Drug exposure data sources

**Description:** Specify the data sources from which drug exposure information for individuals was obtained.

**What to look for in code/outputs:**
- Source tables named (prescribing, dispensing, administration records)
- Distinction between prescriptions written and medications dispensed or administered

### RECORD-PE 7.1.c -- Exposure time windows

**Description:** Describe the time window(s) during which an individual is considered exposed to the drug(s). The rationale for selecting a particular time window should be provided. The extent of potential left truncation or left censoring should be specified.

**What to look for in code/outputs:**
- Days-supply logic, grace periods, stockpiling, and gap handling in exposure-episode code
- Washout or new-user look-back period and its length

### RECORD-PE 7.1.d -- Attribution of events to exposure

**Description:** Justify how events are attributed to current, prior, ever, or cumulative drug exposure.

**What to look for in code/outputs:**
- Exposure categories (current, recent, past, ever) defined in code with time cut-points

### RECORD-PE 7.1.e -- Dose and time on therapy

**Description:** When examining drug dose and risk attribution, describe how current, historical or time on therapy are considered.

**What to look for in code/outputs:**
- Dose calculation (strength x quantity / days supply), defined daily dose, cumulative dose
- Duration-response or dose-response modelling choices

### RECORD-PE 7.1.f -- Comparator groups

**Description:** Use of any comparator groups should be outlined and justified.

**What to look for in code/outputs:**
- Comparator defined (active comparator, non-use, alternative drug) with rationale

### RECORD-PE 7.1.g -- Multiple relevant drug exposures

**Description:** Outline the approach used to handle individuals with more than one relevant drug exposure during the study period.

**What to look for in code/outputs:**
- Rules for switching, add-on, and concurrent use (censoring, exclusion, separate category)

### RECORD-PE 8.a -- Healthcare system and drug record generation

**Description:** Describe the healthcare system and mechanisms for generating the drug exposure records. Specify the care setting in which the drug(s) of interest was prescribed.

**What to look for in code/outputs:**
- Description of how drug records arise (pharmacy claims, primary-care prescribing, hospital administration) and what is not captured (over-the-counter, inpatient, samples)
- Care setting filter (primary care, specialist, inpatient) in exposure code

### RECORD-PE 12.1.a -- Evaluating assumptions

**Description:** Describe the methods used to evaluate whether the assumptions have been met.

**What to look for in code/outputs:**
- Covariate balance diagnostics (standardized mean differences), positivity checks, proportional-hazards checks

### RECORD-PE 12.1.b -- Multiple designs and analytical approaches

**Description:** Describe and justify the use of multiple designs, design features, or analytical approaches.

**What to look for in code/outputs:**
- Sensitivity analyses varying exposure windows, grace periods, or exposure definitions, each with a stated rationale
- Alternative designs or estimators run alongside the primary analysis

---

## Discussion

### RECORD-PE 19.1.a -- Capture of drug exposure

**Description:** Describe the degree to which the chosen database(s) adequately captures the drug exposure(s) of interest.

**What to look for in code/outputs:**
- Limitation section on prescribing vs dispensing vs actual intake, over-the-counter use, and out-of-system fills

### RECORD-PE 20.a -- Alternative explanations

**Description:** Discuss the potential for confounding by indication, contraindication or disease severity or selection bias (healthy adherer/sick stopper) as alternative explanations for the study findings when relevant.

**What to look for in code/outputs:**
- Interpretation addresses confounding by indication and healthy adherer/sick stopper bias
- Design or analysis features used against these biases (active comparator, new-user design, negative controls) cited
