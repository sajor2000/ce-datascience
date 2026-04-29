# Eligibility Windows

The four windows every observational cohort needs to declare explicitly.

## 1. Look-back window

Time prior to index date during which a covariate or exclusion is assessed. Common: 365 days.

Question: "Did the patient have a prior statin?" → Look in look-back window.

## 2. Wash-out window

Time prior to index date during which the EXPOSURE must be ABSENT (for new-user / incident-user designs). Common: 180-365 days.

Without wash-out: prevalent users contaminate the analysis with selection bias.

## 3. Continuous-enrollment window

Time during which the patient must be observable in the data source. For claims: continuous insurance coverage. For EHR: any encounter. Common: 365 days prior + the entire follow-up period.

Without this: missingness is informative (patient simply left the data source); leads to differential outcome ascertainment.

## 4. Follow-up window

Time after index date during which the OUTCOME is ascertained. End at: earliest of (event of interest, death, end of continuous enrollment, study end date).

## Censoring rules to declare

- **Lost to follow-up** → administrative censoring at last observed encounter
- **Death from competing cause** → competing-risks (Fine-Gray) or cause-specific Cox
- **Switch / discontinuation of exposure** → as-treated vs intention-to-treat decision; declare in SAP
- **End of data** → administrative censoring at study end date

## Common errors

- Forgetting wash-out → mixed prevalent + incident users; effect estimates biased
- Forgetting continuous enrollment → informative missingness; outcome rate underestimated
- Setting follow-up to "until last encounter" without administrative censor → immortal-time bias
- Not aligning index event across exposure groups → time-zero misalignment, the most common error in target trial emulation
