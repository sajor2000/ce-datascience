# Eligibility Windows

The four windows every observational cohort needs to declare explicitly.

## 1. Look-back window

Time prior to index date during which a covariate or exclusion is assessed. Common: 365 days.

Question: "Did the patient have a prior statin?" → Look in look-back window.

## 2. Wash-out window

Time prior to index date during which the EXPOSURE must be ABSENT (for new-user / incident-user designs). Common: 180-365 days.

Without wash-out: prevalent users contaminate the analysis with selection bias.

## 3. Continuous-enrollment window

Time during which the patient must be observable in the data source. For claims: continuous insurance coverage. For EHR: no true enrollment exists, so use an explicit observability proxy (e.g., at least one encounter in each look-back year, or the source's `observation_period`) and report it as a limitation; requiring healthcare contact can select sicker patients. Common: 365 days prior + the entire follow-up period.

Without this: missingness is informative (patient simply left the data source); leads to differential outcome ascertainment.

## 4. Follow-up window

Time after index date during which the OUTCOME is ascertained. End at: earliest of (event of interest, death, end of continuous enrollment, study end date).

## Censoring rules to declare

- **Lost to follow-up** → censor at the last date the person is observable. This censoring may be informative: adjust with inverse-probability-of-censoring weights or justify non-informativeness. Administrative censoring is only the fixed study end date
- **Death from competing cause** → competing event: cause-specific Cox for etiologic questions; Fine-Gray or Aalen-Johansen cumulative incidence for prognosis and absolute risk. Never censor deaths in a Kaplan-Meier risk estimate (Austin, Lee & Fine, Circulation 2016, PMID 26858290)
- **Switch / discontinuation of exposure** → choose the estimand: intention-to-treat analogue (ignore switching) or per-protocol (artificially censor at deviation and weight with inverse-probability-of-censoring weights for time-varying predictors of adherence). Do not use naive as-treated reclassification (Hernán & Robins, NEJM 2017, PMID 28976864). Declare in the SAP
- **End of data** → administrative censoring at study end date

## Common errors

- Forgetting wash-out → mixed prevalent + incident users; effect estimates biased
- Forgetting continuous enrollment → informative missingness; outcome rate underestimated
- Setting follow-up to "until last encounter" with no administrative end date → follow-up length depends on healthcare contact (informative censoring, outcome under-ascertainment); fix a study end date and censor at loss of observability
- Requiring post-index information for eligibility (e.g., a second fill, survival to day 90, minimum follow-up) → immortal-time and selection bias; every eligibility criterion must be assessable at time zero (Suissa, Am J Epidemiol 2008, PMID 18056625)
- Not aligning index event across exposure groups → time-zero misalignment, the most common error in target trial emulation
