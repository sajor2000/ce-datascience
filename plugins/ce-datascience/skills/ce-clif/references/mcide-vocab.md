# mCIDE Allow-Listed Vocabularies (v2.1.1)

The minimum Common ICU Data Elements (mCIDE) define the closed vocabularies for every `*_category` column. **Pinned source**: `https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/tree/v2.1.1/mCIDE` (latest tagged release, January 2026). The values below mirror that ref as cached in `CLIF_CLAUDE.md`. The upstream `2_2_0_WIP/` and tag `v3.0.0` directories add `ecmo_mcs/` and `output/` — see § "Coming in v2.2.0" at the bottom. When in doubt, fetch the latest mCIDE CSV at `?ref=v2.1.1` for the table in question and reconcile.

## Table of contents

1. `adt` — `hospital_type`, `location_category`, `location_type`.
2. `patient` — `race_category`, `ethnicity_category`, `sex_category`, `language_category`.
3. `hospitalization` — `admission_type_category`, `discharge_category`.
4. `vitals` — `vital_category` (9 values).
5. `labs` — `lab_specimen_category`, common `lab_category` examples.
6. `medication_admin_continuous` and `medication_admin_intermittent` — `med_group`, `med_category`, `mar_action_group`.
7. `respiratory_support` — `device_category`, `mode_category`, `fio2_set` units.
8. `hospital_diagnosis` — code formats and primary/POA flags.
9. `crrt_therapy` — `crrt_mode_category`.
10. `microbiology_culture` and `microbiology_susceptibility` — `method_category`, `susceptibility_category`.
11. `patient_assessments` — common assessments by group.
12. `code_status` — full categorical set.
13. `position` — prone / not_prone.
14. `patient_procedures` — procedure code formats.
15. Validation patterns (Python / polars and R / arrow + dplyr).
16. Coming in v2.2.0 (preview only — opt in explicitly).
17. When the cache is incomplete (refresh policy).

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

## Coming in v2.2.0 (preview only)

The `v2.2.0` tag adds two table directories not present in `v2.1.1`:

- `mCIDE/ecmo_mcs/` — ECMO and mechanical circulatory support categories.
- `mCIDE/output/` — output table categories (fluid balance variants).

Until the consortium publishes `v2.2.0` as a recommended default, these are opt-in only. Set `clif.data_dictionary_version: "2.2.0"` in `.ce-datascience/config.local.yaml` if you need them; otherwise `v2.1.1` remains the default.

## When the cache here is incomplete (refresh policy)

This file mirrors the major closed vocabularies as of `v2.1.1`. For tables with large open vocabularies (`labs.lab_category`, `microbiology_culture.organism_category`, `medication_admin_*.med_category`), **fetch the live mCIDE CSV** at `?ref=v2.1.1` before validating. The mCIDE directory is the source of truth; this file is a cache. Note also that the upstream directory has a typo (`postion/` instead of `position/`) — preserved here for fidelity. Refresh from upstream when the consortium publishes a new tagged release.
