# CLIFpy Recipes

Use these current `clifpy` patterns only with synthetic or approved demo data
while an agent is in the loop. The researcher runs the same code against real
CLIF data in their secure environment. Source: `https://clif-icu.com/`, the
current `clifpy` user guide, and `Common-Longitudinal-ICU-data-Format/clifpy`.
Recheck its API before upgrading an existing locked project.

## 1. Load selected tables and validate them

Use the template's site-local JSON configuration. Load only the tables and
categories required for the task before calling `validate_all()`.

```python
from clifpy import ClifOrchestrator

co = ClifOrchestrator(config_path="config/config.json")
co.initialize(
    tables=["hospitalization", "vitals", "labs"],
    filters={
        "vitals": {"hospitalization_id": cohort_ids,
                   "vital_category": ["heart_rate", "sbp", "spo2"]},
        "labs": {"hospitalization_id": cohort_ids,
                 "lab_category": ["hemoglobin", "creatinine"]},
    },
)
co.validate_all()
```

## 2. Create a wide dataset, then aggregate only if needed

`create_wide_dataset()` creates event-level data; it does not automatically
make an hourly dataset. Use `convert_wide_to_hourly()` only when a consistent
time window is required.

```python
co.create_wide_dataset(
    tables_to_load=["vitals", "labs", "respiratory_support"],
    category_filters={
        "vitals": ["heart_rate", "sbp", "spo2"],
        "labs": ["hemoglobin", "creatinine"],
        "respiratory_support": ["device_category", "fio2_set", "peep_set"],
    },
    hospitalization_ids=cohort_ids,
)
hourly = co.convert_wide_to_hourly(
    aggregation_config={"mean": ["heart_rate"], "min": ["sbp", "spo2"]},
    hourly_window=1,
)
```

## 3. Handle outliers and stitch encounters

`apply_outlier_handling()` modifies the supplied table object's `.df` in place.
Enable encounter stitching at orchestrator construction; retrieve the mapping
after initializing `hospitalization` and `adt`.

```python
from clifpy import ClifOrchestrator
from clifpy.utils.outlier_handler import apply_outlier_handling

co = ClifOrchestrator(
    config_path="config/config.json",
    stitch_encounter=True,
    stitch_time_interval=6,
)
co.initialize(["hospitalization", "adt", "vitals"])
apply_outlier_handling(co.vitals)
encounter_mapping = co.get_encounter_mapping()
# To rerun explicitly after replacing either source table:
co.run_stitch_encounters()
```

## 4. Convert medication doses before SOFA

Use the orchestrator's medication conversion method. `compute_sofa_scores()`
does not accept preferred units; pass an already prepared wide frame or let it
create one after conversion.

```python
preferred_units = {
    "norepinephrine": "mcg/kg/min",
    "epinephrine": "mcg/kg/min",
    "dopamine": "mcg/kg/min",
}
co.convert_dose_units_for_continuous_meds(
    preferred_units=preferred_units,
    hospitalization_ids=cohort_ids,
)
sofa = co.compute_sofa_scores(id_name="hospitalization_id")
```

## 5. Run the DQA API explicitly

For a table-level report, use `run_full_dqa()`. Its result is a dictionary of
conformance, completeness, and plausibility checks, not an orchestrator report
object. Store a shareable report only in `output/final_no_phi/`.

```python
from clifpy.utils.validator import run_full_dqa
from clifpy.utils.report_generator import generate_text_report

results = run_full_dqa(co.labs.df, table_name="labs")
generate_text_report(results, output_path="output/final_no_phi/dqa_report.txt")
```

## 6. Use utility functions for MDRO and comorbidity flags

MDRO and comorbidity functions are utilities, not `ClifOrchestrator` methods.
Do not use `hospital_diagnosis` as a predictor at admission or another pre-
discharge time point; it is finalized after discharge.

```python
from clifpy.utils.comorbidity import calculate_cci, calculate_elix
from clifpy.utils.mdro_flags import calculate_mdro_flags

cci = calculate_cci(co.hospital_diagnosis)
elix = calculate_elix(co.hospital_diagnosis)
mdro = calculate_mdro_flags(
    culture=co.microbiology_culture,
    susceptibility=co.microbiology_susceptibility,
    organism_name="pseudomonas_aeruginosa",
    hospitalization_ids=cohort_ids,
)
```

## 7. Install and source policy

- Install with `python3 -m pip install --upgrade clifpy`; in an existing uv
  project, use `uv add clifpy` and `uv sync`.
- Preserve a project's existing lockfile; do not add an unreviewed exact pin.
- `clifpy` currently supports Python >=3.9. Prefer individual table classes for
  focused reads and `ClifOrchestrator` for multi-table operations, stitching,
  wide datasets, or SOFA.
- CLIF 3.0 data require an explicit version-aware schema/migration workflow;
  do not apply these 2.1 category examples to a declared v3 dataset.
