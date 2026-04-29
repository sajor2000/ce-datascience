# mCIDE Allow-Listed Vocabularies

The minimum Common ICU Data Elements (mCIDE) define the closed vocabularies for every `*_category` column. Source of truth: `https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/tree/main/mCIDE`. The values below mirror data dictionary 2.0.0 / 2.1.0 as captured in `CLIF_CLAUDE.md`. When in doubt, fetch the latest mCIDE CSV for the table in question and reconcile.

## adt

`hospital_type`: `academic`, `community`, `LTACH`

`location_category`: `ed`, `ward`, `stepdown`, `icu`, `procedural`, `l&d`, `hospice`, `psych`, `rehab`, `radiology`, `dialysis`, `other`

`location_type` (when `location_category == "icu"`): `general_icu`, `medical_icu`, `surgical_icu`, `cardiac_icu`, `neuro_icu`, `mixed_icu`, `pediatric_icu`, `neonatal_icu`, `other_icu`

## patient

`race_category`: `Black or African American`, `White`, `American Indian or Alaska Native`, `Asian`, `Native Hawaiian or Other Pacific Islander`, `Unknown`, `Other`

`ethnicity_category`: `Hispanic`, `Non-Hispanic`, `Unknown`

`sex_category`: `Male`, `Female`, `Unknown`

`language_category`: standardized language codes; consult the mCIDE language CSV.

## hospitalization

`admission_type_category`: `ed`, `osh`, `elective`, `direct`, `facility`, `other`

`discharge_category`: `Home`, `SNF`, `Expired`, `Hospice`, `LTACH`, `AMA`, `Acute Care`, `Other`

## vitals

`vital_category`: `temp_c`, `heart_rate`, `sbp`, `dbp`, `map`, `spo2`, `respiratory_rate`, `height_cm`, `weight_kg`

## labs

`lab_specimen_category`: `blood/plasma/serum`, `urine`, `csf`, `other`

Common `lab_category` (non-exhaustive — fetch the mCIDE labs CSV for the full list):
- Blood counts: `white_blood_cell_count`, `hemoglobin`, `platelet_count`
- Chemistry: `sodium`, `potassium`, `chloride`, `bicarbonate`, `bun`, `creatinine`, `glucose_serum`
- Liver: `ast`, `alt`, `bilirubin_total`, `albumin`, `alkaline_phosphatase`
- Coagulation: `inr`, `ptt`
- Blood gas: `ph_arterial`, `pco2_arterial`, `po2_arterial`, `lactate`
- Cardiac: `troponin_i`, `troponin_t`
- Inflammatory: `crp`, `procalcitonin`

## medication_admin_continuous & medication_admin_intermittent

`med_group`: `vasoactives`, `sedation`, `paralysis`, `anticoagulation`, `antibiotics`, `steroids`, `analgesics`, `diuretics`, `other`

Continuous `med_category` examples: `norepinephrine`, `epinephrine`, `phenylephrine`, `vasopressin`, `dopamine`, `dobutamine`, `propofol`, `midazolam`, `dexmedetomidine`, `fentanyl`, `remifentanil`, `cisatracurium`, `rocuronium`, `vecuronium`, `heparin`.

Intermittent `med_category` examples: `vancomycin`, `piperacillin_tazobactam`, `cefepime`, `meropenem`, `hydrocortisone`, `methylprednisolone`, `dexamethasone`, `acetaminophen`, `morphine`, `hydromorphone`, `furosemide`.

`mar_action_group`: `administered`, `not_administered`, `other`. Only `administered` counts as exposure.

## respiratory_support

`device_category`: `IMV`, `NIPPV`, `CPAP`, `High Flow NC`, `Face Mask`, `Trach Collar`, `Nasal Cannula`, `Room Air`, `Other`

`mode_category` (for `IMV` / `NIPPV`): `Assist Control-Volume Control`, `Pressure Control`, `Pressure-Regulated Volume Control`, `SIMV`, `Pressure Support/CPAP`, `Volume Support`, `Other`

`fio2_set`: fraction in `[0, 1]`, never percent (`0.6`, not `60`).

## hospital_diagnosis

`diagnosis_code_format`: `ICD10CM`, `ICD9CM`

`diagnosis_primary` ∈ {0, 1}; `poa_present` ∈ {0, 1}.

## crrt_therapy

`crrt_mode_category`: `scuf`, `cvvh`, `cvvhd`, `cvvhdf`, `avvh`

## microbiology_culture

`method_category`: `culture`, `gram stain`, `smear`

`fluid_category`, `organism_category`, `organism_group`: NIH CDE categories — consult the mCIDE microbiology CSVs.

## microbiology_susceptibility

`susceptibility_category`: `susceptible`, `non_susceptible`, `indeterminate`, `NA`

## patient_assessments

Common `assessment_category`: `gcs_eye`, `gcs_verbal`, `gcs_motor`, `gcs_total`, `rass`, `cam_icu`, `sat_delivery_pass_fail`, `cpot`, `nrs`, `braden_total`. Each maps to an `assessment_group` (`neurological`, `sedation`, `pain`, `nursing_risk`).

## code_status

`code_status_category`: `DNR`, `DNAR`, `DNR/DNI`, `DNAR/DNI`, `AND`, `Full`, `Presume Full`, `Other`

## position

`position_category`: `prone`, `not_prone`

## patient_procedures

`procedure_code_format`: `CPT`, `ICD10PCS`, `HCPCS`

## Validation pattern (Python / polars)

```python
ALLOWED_LOCATION_CATEGORY = {"ed","ward","stepdown","icu","procedural","l&d","hospice","psych","rehab","radiology","dialysis","other"}
bad = adt.filter(~pl.col("location_category").is_in(list(ALLOWED_LOCATION_CATEGORY)))
assert bad.height == 0, f"mCIDE violation: {bad.select('location_category').unique().to_series().to_list()}"
```

## Validation pattern (R / arrow + dplyr)

```r
allowed <- c("ed","ward","stepdown","icu","procedural","l&d","hospice","psych","rehab","radiology","dialysis","other")
bad <- adt %>% filter(!location_category %in% allowed) %>% collect()
stopifnot(nrow(bad) == 0)
```

## When the vocab here is incomplete

This file mirrors the major closed vocabularies. For tables with large open vocabularies (`labs.lab_category`, `microbiology_culture.organism_category`, `medication_admin_*.med_category`), **fetch the live mCIDE CSV** for the table before validating. The mCIDE directory is the source of truth; this file is a cache.
