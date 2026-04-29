# clifpy Recipes (Python)

Canonical Python patterns for working with CLIF data, drawn directly from `Common-Longitudinal-ICU-data-Format/clifpy/examples/`. **Always prefer clifpy** (`pip install clifpy`) over hand-rolled Parquet IO — it provides automatic schema validation, mCIDE-aware unit conversion, encounter stitching, and clinical calculators (SOFA scores, etc.) tested against the consortium reference data.

## Table of contents

1. Install and quick start (`ClifOrchestrator`, `validate_all`).
2. Compute SOFA scores.
3. Build an hourly wide dataset.
4. Vitals outlier handling.
5. Encounter stitching (link related stays).
6. Data Quality Assessment (DQA) pattern.
7. Unit conversion for medications.
8. MDRO / hospital-diagnosis flags.
9. Where to read more.

---

## 1. Install and quick start

Source: clifpy README + `examples/00_basic_usage.py`.

```python
# pip install clifpy
from clifpy import ClifOrchestrator

orchestrator = ClifOrchestrator(
    data_directory='/path/to/clif/data',
    timezone='US/Eastern',
)

# Validate every table against the CLIF schema (mCIDE-aware).
orchestrator.validate_all()

# Access individual tables (each is a thin wrapper around a polars / pandas frame).
vitals = orchestrator.vitals.df
labs = orchestrator.labs.df
hospitalization = orchestrator.hospitalization.df
```

Configuration via YAML (preferred for federated projects):

```python
co = ClifOrchestrator(config_path='config/config.yaml')
```

`config/config.yaml` keeps site-specific paths out of the analysis script — required by `WORKFLOW.md` for federated portability.

## 2. Compute SOFA scores

Source: `examples/sofa_demo.py`. SOFA spans 6 organ systems (cardiovascular, coagulation, liver, respiratory, CNS, renal) and clifpy maps each to the right CLIF columns.

```python
from clifpy.clif_orchestrator import ClifOrchestrator

co = ClifOrchestrator(config_path='config/config.yaml')

preferred_units_for_sofa = {
    'norepinephrine': 'mcg/kg/min',
    'epinephrine': 'mcg/kg/min',
    'dopamine': 'mcg/kg/min',
}

sofa = co.compute_sofa_scores(
    preferred_units=preferred_units_for_sofa,
    # Other args: time_window, fill_strategy, etc. -- see clifpy docs.
)
# sofa is a frame with columns: hospitalization_id, score_dttm, sofa_total, sofa_<system>.
```

## 3. Hourly wide dataset

Source: clifpy README. Long CLIF tables (`vitals`, `labs`, `medication_admin_continuous`, `respiratory_support`) collapse to one row per hospitalization per hour with columns named after `*_category` values.

```python
co = ClifOrchestrator(config_path='config/config.yaml')
wide_df = co.create_wide_dataset()
# Use this for prediction-model feature engineering.
```

## 4. Vitals outlier handling

Source: `examples/outlier_handling_vitals.py`. Use the consortium-agreed thresholds in `outlier-handling/`; clifpy applies them when constructing wide frames if `apply_outlier_handling=True`.

```python
co = ClifOrchestrator(config_path='config/config.yaml')
vitals_clean = co.vitals.apply_outlier_handling()
# Out-of-range values are set to NaN (never silently clipped) and recorded in
# vitals_clean.outlier_report for audit.
```

## 5. Encounter stitching

Source: `examples/stitching_encounters_demo.ipynb`. Hospital readmissions and inter-facility transfers can be stitched via `hospitalization_joined_id` and a configurable time window.

```python
co = ClifOrchestrator(config_path='config/config.yaml')
stitched = co.stitch_encounters(
    max_gap_hours=24,        # default 24h gap counts as the same care episode
    require_same_facility=False,
)
# stitched["hospitalization_joined_id"] is the key for downstream cohort joins.
```

## 6. Data Quality Assessment (DQA)

Source: `examples/dqa_demo.ipynb`. clifpy's DQA mirrors the WORKFLOW.md QC pattern. Use it before any cohort or analysis step (and as the canonical implementation of `/ce-data-qa` under CLIF profile).

```python
co = ClifOrchestrator(config_path='config/config.yaml')
report = co.run_dqa()
# report has: schema_violations, missingness_per_column, mcide_violations,
# range_violations (per outlier-thresholds), datetime_tz_violations,
# id_type_violations, dup_keys.
report.to_html('output/dqa_report.html')
assert report.is_pass, report.blocker_summary()
```

## 7. Unit conversion for medications

Source: `examples/unit_converter_demo.py`. mCIDE pins `med_dose_unit` to a known set; clifpy handles conversion to a preferred unit (e.g., `mcg/kg/min`) for vasopressors before any exposure calculation.

```python
co = ClifOrchestrator(config_path='config/config.yaml')
meds_std = co.medication_admin_continuous.standardize_units(
    target_units={'norepinephrine': 'mcg/kg/min'},
)
# meds_std.df["med_dose"] is in target units; original dose preserved as
# "med_dose_orig" for reproducibility.
```

## 8. MDRO / hospital-diagnosis flags

Source: `examples/mdro_flags_demo.py` and `examples/hospital_diagnosis_simple.py`. Convenience flags that wrap repeated cohort logic.

```python
co = ClifOrchestrator(config_path='config/config.yaml')
mdro = co.flag_mdro()                           # multi-drug-resistant organism flags
charlson = co.compute_charlson_comorbidity()    # uses hospital_diagnosis + comorbidity package
```

> Reminder from the CLIF rules: `hospital_diagnosis` is finalized at discharge — never use it as a predictor in time-to-event or prediction-at-admission models. clifpy's helpers compute Charlson on discharge data only.

## 9. Where to read more

- clifpy docs: https://common-longitudinal-icu-data-format.github.io/clifpy/
- Examples directory: https://github.com/Common-Longitudinal-ICU-data-Format/clifpy/tree/main/examples
- PyPI: `pip install clifpy`
- Notebooks rendered with `marimo`: many examples are `.py` files using `marimo.App`. Run with `marimo run examples/sofa_demo.py` or `python examples/sofa_demo.py`.
