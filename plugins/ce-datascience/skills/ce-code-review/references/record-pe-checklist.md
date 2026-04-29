# RECORD-PE Checklist for Pharmacoepidemiology Studies

RECORD for PharmEpidemiology (RECORD-PE).
Extension of RECORD and STROBE for studies using routinely-collected data to evaluate drug safety, effectiveness, and utilization.

**Primary reference:** Langan SM, Schmidt SA, Wing K, Ehrenstein V, Nicholls SG, Filion KB, Klungel O, Petersen I, Sorensen HT, Dixon WG, Guttmann A, Harron K, Hemkens LG, Moher D, Schneeweiss S, Smeeth L, Sturkenboom M, von Elm E, Wang SV, Benchimol EI. The reporting of studies conducted using observational routinely collected health data statement for pharmacoepidemiology (RECORD-PE). BMJ. 2018;363:k3532. doi:10.1136/bmj.k3532. PMID: 30429167.

This checklist supplements both STROBE and RECORD -- apply alongside both base checklists. RECORD-PE items address drug exposure measurement, comparator selection, and pharmacoepidemiology-specific biases.

---

## Methods

### RECORD-PE 4.1 -- Drug exposure data source

**Description:** Describe the type of drug data available (prescribing, dispensing, administration) and the source system. Distinguish between prescriptions written and medications actually dispensed or administered.

**What to look for in code/outputs:**
- Explicit statement of whether drug data represents prescriptions (intent), dispensing (pharmacy claim), or administration (EHR medication administration record)
- Source table identified (e.g., "prescription table", "pharmacy claims", "MAR")
- Acknowledgment of the gap between prescribing and actual patient adherence

### RECORD-PE 6.1 -- Drug exposure definition

**Description:** Describe how drug exposure was defined, including the method used to determine the duration of exposure, the handling of gaps and overlaps in prescriptions, and how the exposure time window was constructed.

**What to look for in code/outputs:**
- Exposure window construction code: start date (prescription/dispensing date), end date (days supply, DDD-based, refill-gap-based)
- Gap and overlap handling: grace period definition, stockpiling algorithms, permissible gap between refills
- As-treated vs intention-to-treat exposure definition documented
- Drug identification method: NDC, RxNorm, ATC, BNF codes with version pinning

### RECORD-PE 6.2 -- Comparator definition

**Description:** Describe the comparator group, including whether it is active comparator, non-use, or alternative drug. Justify the comparator choice.

**What to look for in code/outputs:**
- Active comparator selection rationale (clinical equipoise, confounding by indication mitigation)
- New-user (incident user) design vs prevalent user documented
- Comparator drug identification codes listed

### RECORD-PE 7.1 -- Dose and duration

**Description:** For drug exposure variables, describe how dose, duration, and cumulative exposure were measured or calculated.

**What to look for in code/outputs:**
- Dose calculation: prescribed daily dose, defined daily dose (DDD), actual dispensed quantity
- Duration: days supply field, estimated from quantity and dose, or fixed window
- Cumulative exposure: sum of exposed days, total DDDs, dose-years
- Time-varying exposure modeling if applicable (cumulative, recency-weighted, lagged)

### RECORD-PE 8.1 -- Drug coding system

**Description:** Describe the drug coding system used and any mapping between systems (e.g., NDC to ATC, NDC to RxNorm ingredient).

**What to look for in code/outputs:**
- Drug vocabulary identified (NDC, ATC, RxNorm, BNF, GPI, HICL)
- Cross-mapping logic documented (e.g., NDC → RxNorm ingredient via OMOP concept_relationship)
- Version of drug vocabulary pinned
- Handling of combination products, branded vs generic grouping

### RECORD-PE 9.1 -- Pharmacoepidemiology biases

**Description:** Describe any efforts to address specific pharmacoepidemiology biases: confounding by indication, immortal time bias, time-related bias, protopathic bias, depletion of susceptibles, healthy user/adherer bias.

**What to look for in code/outputs:**
- New-user design to address depletion of susceptibles and prevalent user bias
- Active comparator design to address confounding by indication
- Immortal time handling: start of follow-up aligns with drug exposure start (no immortal person-time in exposed group)
- Time-zero alignment documented
- Protopathic bias: exclusion window before index date, or sensitivity analysis with different lag periods
- Healthy user bias: inclusion of health-seeking behavior proxies as covariates

### RECORD-PE 11.1 -- Dose-response analysis

**Description:** If applicable, describe how dose-response or duration-response relationships were analyzed.

**What to look for in code/outputs:**
- Dose or duration categorization (tertiles, clinical thresholds, cumulative DDDs)
- Trend tests across dose categories
- Restricted cubic splines or fractional polynomials for continuous dose-response

### RECORD-PE 12.1 -- Sensitivity analyses for drug exposure

**Description:** Describe sensitivity analyses related to drug exposure definition, including alternative exposure windows, grace periods, or exposure definitions.

**What to look for in code/outputs:**
- Alternative exposure window definitions tested (shorter/longer grace periods)
- Intention-to-treat vs as-treated sensitivity analysis
- Different drug identification strategies (ingredient-level vs product-level)
- Lag-time sensitivity analysis for latency-dependent outcomes

---

## Results

### RECORD-PE 13.1 -- Drug exposure distribution

**Description:** Report the distribution of drug exposure duration, dose, and number of prescriptions/dispensings in the study population.

**What to look for in code/outputs:**
- Summary statistics for exposure duration (median, IQR, range)
- Distribution of number of prescriptions/refills per patient
- Dose distribution if dose-response analysis was planned
- Follow-up time on and off drug

### RECORD-PE 16.1 -- Time-varying results

**Description:** If applicable, report how results varied by duration of exposure, recency of exposure, or cumulative dose.

**What to look for in code/outputs:**
- Hazard ratios or risk estimates by exposure duration category
- Results stratified by current vs past use
- Cumulative dose-response results

---

## Discussion

### RECORD-PE 19.1 -- Prescription vs dispensing limitations

**Description:** Discuss the implications of the type of drug data available (prescribing vs dispensing vs administration) for the study findings. Address the gap between data capture and actual drug intake.

**What to look for in code/outputs:**
- Limitation section addressing primary non-adherence (prescriptions never filled)
- Discussion of secondary non-adherence (filled but not taken)
- Acknowledgment of over-the-counter drug use not captured in claims data
- Discussion of drug samples, in-hospital medications, or other sources not captured
