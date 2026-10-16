# Estimands, Sensitivity Analyses, and Target-Trial Protocols

## Contents

- Five estimand attributes
- Intercurrent-event strategies
- Analysis sets are not estimands
- Sensitivity versus supplementary analyses
- Missing data is defined relative to the estimand
- Conditional versus marginal summaries in randomized trials
- Observational claims: the target-trial protocol
- Worked example: one claim, analysis, and decision row
- Sources

Read this file when filling a `Claim` or `Analysis` estimand, choosing sensitivity analyses, or specifying an observational causal claim.

## Five estimand attributes

ICH E9(R1) section A.3.3 defines an estimand by five attributes. Write all five for every primary and key secondary claim:

| Attribute | What to write |
|---|---|
| Treatment | The treatment condition of interest and the comparator, including any regimen or add-on to standard care |
| Population | The patients targeted: the whole trial population, a baseline-defined subgroup, or a principal stratum |
| Variable (endpoint) | The measurement per patient and its time point; it may incorporate an intercurrent event (composite, while on treatment) |
| Intercurrent events | Each anticipated post-baseline event that affects interpretation or existence of the variable, each with its strategy |
| Population-level summary | The contrast between treatment conditions: risk difference, risk ratio, marginal or conditional OR, HR, RMST difference, mean difference |

"Adjusted OR" or "ITT analysis" is not an estimand. The first is a summary measure; the second is an analysis set.

## Intercurrent-event strategies

ICH E9(R1) section A.3.2 names five strategies. Different intercurrent events in the same estimand may use different strategies; the choice must be unambiguous.

| Strategy | Clinical question | Analysis implication |
|---|---|---|
| Treatment policy | Effect of being assigned the treatment, whatever happens after the event | Keep collecting and analysing outcomes after the event; missing post-event data becomes the main assumption |
| Hypothetical | Effect in a scenario where the event would not occur | Model the counterfactual (e.g., MI or IPW under the stated scenario); assumptions are untestable |
| Composite variable | The event is itself an informative outcome | Fold the event into the variable (e.g., treatment failure = death, rescue, or non-response) |
| While on treatment | Response before the event | Restrict the variable to time before the event; compare time-to-event distributions too |
| Principal stratum | Effect in the subgroup in which the event would (or would not) occur under a given treatment | Strata are not observed; estimation needs strong, unverifiable assumptions |

Flag every hypothetical and principal-stratum strategy as resting on untestable assumptions and attach a sensitivity analysis to it (Kahan et al. 2024).

Common intercurrent events: treatment discontinuation, rescue or open-label medication, treatment switching, death before the outcome time point, and organ support or surgery that changes the outcome's meaning.

## Analysis sets are not estimands

ITT/full analysis set, per-protocol set, and as-treated set describe who is analysed. They support an estimand; they do not define one. ICH E9(R1) section A.5.3 notes that a per-protocol set analysis may not align with any relevant estimand and does not estimate a principal-stratum effect, because it may compare dissimilar patients across arms.

## Sensitivity versus supplementary analyses

- **Sensitivity analysis** (ICH E9(R1) A.5.2): targets the *same* estimand under different assumptions, such as MNAR delta-adjusted or tipping-point imputation for missing outcomes, or an alternative model specification. Change one assumption at a time so a discrepancy can be traced.
- **Supplementary analysis** (A.5.3): any other analysis that adds insight, including a different estimand, population, or outcome definition (e.g., a per-protocol set or a per-protocol effect). Label it supplementary.
- A per-protocol result agreeing with the treatment-policy result does not show robustness: the two answer different questions. The first principle of Morris, Kahan, and White (2014) is that a sensitivity analysis must answer the same question as the primary analysis.

Record each full sensitivity replication as its own `SA-<name>` analysis row with the estimand it shares, and each supplementary analysis as a separate row with its own estimand.

## Missing data is defined relative to the estimand

ICH E9(R1) A.5.2.2: missing data are defined with respect to a particular estimand. Under a treatment-policy strategy, outcomes collected after discontinuation are data, not missing values; under a hypothetical strategy, post-event outcomes are not used and the hypothetical value must be modelled. State the missing-data assumption per estimand, not once per study.

## Conditional versus marginal summaries in randomized trials

FDA, *Adjusting for Covariates in Randomized Clinical Trials for Drugs and Biological Products* (final guidance, May 2023):

- Prespecify the covariate-adjusted analysis before any unblinding of comparative data; adjust for covariates expected to be most strongly prognostic.
- The adjustment model should generally include the randomization strata variables.
- Do not adjust for covariates measured after randomization (the guidance quotes ICH E9).
- State whether the treatment effect of interest is conditional or unconditional (marginal). A logistic or Cox model of outcome on treatment plus covariates estimates a conditional effect, which differs from the marginal OR or HR because these measures are non-collapsible.
- For a covariate-adjusted marginal effect from a nonlinear model (e.g., standardization or g-computation), use an appropriate bootstrap or standard-error formula justified in the literature.

Do not select adjustment covariates by testing baseline imbalance; CONSORT 2025 item 25 advises against baseline significance tests in randomized trials.

## Observational claims: the target-trial protocol

For a causal claim from observational data, specify the target trial and its emulation (Hernán and Robins 2016):

1. Eligibility criteria, assessable at time zero only.
2. Treatment strategies, defined exhaustively so every eligible person fits one arm.
3. Assignment procedure and the confounders that make assignment exchangeable.
4. Follow-up start and end. Time zero is when eligibility is met and a strategy is assigned, by the same rule in every arm. Name any grace period and how it is emulated (e.g., clone-censor-weight).
5. Outcome.
6. Causal contrast: observational analogue of the intention-to-treat effect, or the per-protocol effect.
7. Analysis plan: adjustment set, weighting or g-method, censoring handling. Per-protocol effects need artificial censoring at deviation plus inverse-probability weighting for time-varying predictors of adherence; naive per-protocol or as-treated analyses are biased (Hernán and Robins 2017).

Map these to the five estimand attributes in the `Claim` row and report against TARGET (2025).

## Worked example: one claim, analysis, and decision row

Synthetic randomized trial; values are illustrative.

| Object | Field | Content |
|---|---|---|
| `Claim` C1 | Scientific claim | Adding drug X to usual care lowers 28-day mortality in adults with septic shock |
| | Treatment | Drug X plus usual care versus placebo plus usual care |
| | Population | All randomized adults meeting the septic-shock eligibility criteria |
| | Variable | All-cause death by day 28 after randomization |
| | Intercurrent events | Study-drug discontinuation -> treatment policy; open-label rescue with drug X -> treatment policy |
| | Summary | Marginal risk difference, standardized over prespecified baseline covariates |
| `Analysis` A3 | Method | Logistic working model with treatment, stratification factors, and prespecified prognostic covariates; g-computation to the marginal risk difference; nonparametric bootstrap CI |
| | Missing data | Vital status missing for few patients; MI under MAR within arm; tipping-point analysis as `SA-tipping` |
| | Supplementary | `SUPP-pp`: per-protocol effect with artificial censoring at discontinuation and IPCW (different estimand) |
| `Decision_Evidence` D3 | Decision | Target the marginal risk difference rather than the conditional OR |
| | Rationale | Marginal effect matches the policy question; covariate adjustment gains precision without changing the estimand |
| | Citations | FDA covariate-adjustment guidance (2023, `regulatory`); Kahan et al. BMJ 2024, PMID 38262663 (`full_text`) |

## Sources

- ICH E9(R1) addendum on estimands and sensitivity analysis, Step 4, 20 November 2019: https://database.ich.org/sites/default/files/E9-R1_Step4_Guideline_2019_1203.pdf
- Kahan BC et al. The estimands framework: a primer on the ICH E9(R1) addendum. BMJ 2024;384:e076316. PMID 38262663.
- Morris TP, Kahan BC, White IR. Choosing sensitivity analyses for randomised trials: principles. BMC Med Res Methodol 2014;14:11. PMID 24456267.
- FDA. Adjusting for Covariates in Randomized Clinical Trials for Drugs and Biological Products. Final guidance, May 2023: https://www.fda.gov/media/148910/download
- Hopewell S et al. CONSORT 2025 explanation and elaboration. BMJ 2025;389:e081124. PMID 40228832.
- Hernán MA, Robins JM. Using big data to emulate a target trial when a randomized trial is not available. Am J Epidemiol 2016;183:758-64. PMID 26994063.
- Hernán MA, Robins JM. Per-protocol analyses of pragmatic trials. N Engl J Med 2017;377:1391-8. PMID 28976864.
- Cashin AG et al. TARGET Statement. JAMA 2025;334:1084-93, PMID 40899949; BMJ 2025;390:e087179, PMID 40903028.
