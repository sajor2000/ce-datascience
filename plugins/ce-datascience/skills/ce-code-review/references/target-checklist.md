# TARGET Checklist for Target Trial Emulation Studies

TARGET (TArgeted Reporting of observational studies emulating a randomized trial using the TARGET framework).
Reporting checklist for observational studies that explicitly emulate a hypothetical target trial.

**Primary reference:** Hansford HJ, Cashin AG, Jones MD, Swanson SA, Islam N, Douglas SR, Camacho EM, Furlan AD, Golub RM, Hopewell S, Lee H, Maas ET, Mathieson S, McCord KA, Moher D, Moreno-Betancur M, Rijnhart JJW, Rogers KD, Sandbrink F, Schriger DL, Turk DC, Williamson E, McAuley JH; TARGET Working Group. The TARGET statement: a framework for the reporting of studies that emulate a target trial using observational data. BMJ. 2025;388:e081680.

This checklist applies to observational studies that frame their analysis as an emulation of a hypothetical randomized trial. Use alongside STROBE and, where applicable, RECORD.

---

## Protocol Components

### TARGET 1 -- Eligibility criteria

**Description:** Specify the eligibility criteria for the target trial and describe how they were emulated using the observational data.

**What to look for in code/outputs:**
- Target trial eligibility stated explicitly (who would be enrolled in the hypothetical trial)
- Emulation eligibility criteria in code: how the observational cohort was filtered to approximate the trial population
- Differences between target trial and emulated eligibility documented

### TARGET 2 -- Treatment strategies

**Description:** Specify the treatment strategies being compared in the target trial and describe how they were defined in the observational data.

**What to look for in code/outputs:**
- Treatment strategies fully specified (not just "treated vs untreated" but exact regimens, doses, durations)
- Operationalization in data: code lists, prescription rules, or algorithm defining each strategy
- Handling of treatment switching, discontinuation, and non-adherence documented

### TARGET 3 -- Treatment assignment

**Description:** Describe the assumed treatment assignment mechanism in the target trial and the method used to adjust for confounding in the emulation.

**What to look for in code/outputs:**
- Confounding adjustment method documented (IPTW, matching, g-estimation, standardization)
- Covariates used for adjustment listed with rationale
- Propensity score model specification if applicable
- Positivity assessment: overlap in propensity scores between groups

### TARGET 4 -- Outcome

**Description:** Define the primary and secondary outcomes and how they were ascertained in both the target trial and its emulation.

**What to look for in code/outputs:**
- Outcome definition matching the target trial outcome (same ascertainment window, same severity threshold)
- ICD/procedure codes or clinical criteria used for outcome identification
- Outcome ascertainment period and censoring rules

### TARGET 5 -- Time zero (baseline)

**Description:** Define time zero (the point of randomization in the target trial) and describe how it was emulated. Time zero must align treatment assignment, eligibility, and the start of follow-up.

**What to look for in code/outputs:**
- Time zero defined explicitly in documentation and code
- Alignment verified: eligibility assessed at time zero, treatment assigned at time zero, follow-up starts at time zero
- No immortal time between eligibility and treatment assignment
- Grace period documented if used (and justified)

### TARGET 6 -- Follow-up

**Description:** Specify the follow-up period, censoring rules, and end-of-follow-up definition.

**What to look for in code/outputs:**
- Follow-up start (time zero) and end (outcome, censoring, administrative end) documented
- Censoring rules: what events trigger censoring, handling of competing risks
- Per-protocol vs intention-to-treat emulation documented
- Artificial censoring for per-protocol emulation explained

### TARGET 7 -- Statistical analysis

**Description:** Describe the causal estimand and the statistical methods used to estimate it.

**What to look for in code/outputs:**
- Estimand stated explicitly (ATE, ATT, per-protocol effect, ITT effect)
- Statistical method consistent with the estimand (IPTW for ATE, matching for ATT)
- Variance estimation method (bootstrap, robust SE, sandwich estimator)
- Sensitivity analyses for unmeasured confounding (E-value, quantitative bias analysis)
- If cloning-censoring-weighting used, all three steps documented

---

## Reporting

### TARGET 8 -- Table mapping target trial to emulation

**Description:** Include a structured table that maps each protocol component (eligibility, treatment, assignment, outcome, time zero, follow-up, analysis) from the target trial to its observational emulation.

**What to look for in code/outputs:**
- Two-column table: "Target Trial Protocol" vs "Emulation Using Observational Data"
- All 7 protocol components addressed
- Differences and compromises documented in the table

### TARGET 9 -- Assumptions and limitations

**Description:** Discuss the assumptions required for the emulation to be valid, and the limitations of the observational data relative to the hypothetical trial.

**What to look for in code/outputs:**
- Exchangeability (no unmeasured confounding) assumption discussed
- Positivity assumption assessed (treatment available to all eligible)
- Consistency assumption discussed (well-defined interventions)
- Data-specific limitations: measurement error, misclassification, missing data
