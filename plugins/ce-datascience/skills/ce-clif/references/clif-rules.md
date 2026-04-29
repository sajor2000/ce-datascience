# CLIF-Safe Rules

These rules apply whenever `__CE_CLIF__ active=true` is present in chat context. They are derived from the CLIF consortium's `WORKFLOW.md`, the data dictionary at `https://clif-consortium.github.io/website/data-dictionary.html`, and the project's `CLIF_CLAUDE.md`. Pinned default: data dictionary **v2.1.1** (latest tagged release, January 2026). Tags `v2.2.0` and `v3.0.0` exist upstream as work-in-progress (v2.2.0 adds `ecmo_mcs/` and `output/` to mCIDE); opt in explicitly per project. Sources: `clif-icu.com`, `github.com/Common-Longitudinal-ICU-data-Format/CLIF`, `github.com/Common-Longitudinal-ICU-data-Format/clifpy`, `github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template`.

## 1. Storage

- **Parquet only.** CLIF tables are persisted as `.parquet`. Never `read_csv` / `pd.read_csv` / `write.csv` for CLIF tables. Never emit Feather, ORC, RDS, or pickle for CLIF tables.
- **Python**: prefer `polars` (`pl.read_parquet`, `pl.scan_parquet` for lazy). Pandas (`pd.read_parquet`) is acceptable for small tables only.
- **R**: prefer `arrow` + `dplyr` (`arrow::read_parquet`, `arrow::open_dataset` for partitioned datasets), collected via `dplyr::collect()`.
- Output artifacts (figures, tables, model files) are written under `output/`. Never write derived patient-level Parquet to `output/`.

## 2. Identifiers

- `patient_id` and `hospitalization_id` are **VARCHAR**. Never cast to `int`/`int64`/`numeric`. Joins, group-bys, and filters preserve string type.
- `hospitalization_joined_id` is the linkage key for chained encounters; do not invent your own grouping key when this exists.
- Primary unit of analysis is `hospitalization_id` for encounter-level analyses, `patient_id` for cross-encounter analyses.

## 3. Datetime

- All `*_dttm` columns are timezone-aware UTC. Format: `YYYY-MM-DD HH:MM:SS+00:00`. Never tz-naive.
- `birth_date` is a `DATE` (no time, no zone).
- When parsing, always specify `tz="UTC"` (Python) or `tz = "UTC"` (R, lubridate). When writing, ensure timestamps round-trip as UTC.
- Time arithmetic uses `dt.total_hours()` / `as.numeric(difftime(..., units="hours"))`. Never subtract naive timestamps.

## 4. mCIDE vocabularies

- Every `*_category` column has an allow-listed vocabulary. See `mcide-vocab.md` for the full set. Never invent new category strings; never silently relabel.
- When a source value cannot be mapped, write `Other` (where the vocab includes it) and preserve the raw value in the corresponding `*_name` column.
- Validate before writing: `assert df["location_category"].is_in(ALLOWED_LOCATION_CATEGORIES).all()`.

## 5. Project layout (from `clif-consortium/project-template`)

```
project/
├── code/                  # All analysis scripts (QC, cohort, analysis)
├── config/
│   └── config.json        # Site-specific paths, NEVER committed with patient data
├── outlier-thresholds/    # Site-specific override thresholds (optional)
├── output/                # Aggregated, de-identified results only
├── renv/                  # R environment (if R)
├── renv.lock              # R lockfile (if R)
├── requirements.txt       # Python lockfile (if Python)
├── utils/                 # Shared helpers
└── README.md
```

Rules:
- New analysis files go under `code/`. Do not create top-level `analysis.py` / `script.R`.
- Site-specific paths live in `config/config.json` (not hardcoded).
- `output/` is the only sanctioned destination for shared results.

## 6. Three-script architecture (from `WORKFLOW.md`)

Every CLIF project organizes code into three logical components:

1. **QC scripts** (`code/01_qc_*.{py,R,qmd}`)
   - Verify required tables exist, columns are present and typed correctly, mCIDE categories are valid, missingness is acceptable.
   - Output: a QC report, no patient-level rows.

2. **Cohort identification scripts** (`code/02_cohort_*.{py,R,qmd}`)
   - Apply inclusion / exclusion criteria.
   - Emit a list of `hospitalization_id` (or `patient_id`) values, persisted as `output/cohort_ids.parquet`.
   - Document the CONSORT-style waterfall (`output/cohort_waterfall.csv`).

3. **Analysis scripts** (`code/03_analysis_*.{py,R,qmd}`)
   - Read the cohort, perform the planned analyses, produce aggregate results in `output/`.
   - May be split into multiple modules; keep each script focused on one analytic question.

When `/ce-plan` (SAP mode) runs under CLIF profile, the implementation plan must reflect this split.

## 7. PHI / data privacy

- **Never** write patient-level rows to `output/`. Only aggregates that have been reviewed for re-identification risk.
- **Never** print PHI (names, MRNs, raw zipcodes, dates of birth, free-text columns containing PHI) to stdout, logs, or notebook cells. Mask or hash before printing.
- **Never** share patient-level CLIF tables across sites. CLIF is federated: code travels, data does not.
- When the user asks to commit data, refuse and direct them to share the analysis script + aggregated output instead.
- Treat `clinical_notes_text`, `clinical_notes_facts`, raw `discharge_name`, raw `med_name` as PHI-suspect and require explicit confirmation before reading them in code that writes to disk.

## 8. Protected paths (no edits without POC sign-off)

These paths must not be edited without the responsible point-of-contact's authorization. The POC table is in `poc-table.md`.

- `mCIDE/**` — minimum Common ICU Data Elements. Schema-level changes here ripple across every consortium site.
- `ddl/**` — DDL statements that define the relational schema.
- `outlier-handling/**` — agreed thresholds for outlier rules.
- `reference_ranges/**` — clinical reference ranges.
- `WORKFLOW.md` — process document; any change is a consortium-level decision.

To override: include `POC: @<github-handle> approved` (or `--poc-approved`) in the prompt. Without that, refuse and stage the diff under `analysis/clif-protected-edits/`.

## 9. Federated analysis pattern

- Develop on MIMIC-IV converted to CLIF format (`CLIF-MIMIC` pipeline) or on local CLIF data.
- Ship the analysis script via PR; each site runs it locally and returns aggregate results.
- Validate site-portability: scripts must read paths from `config/config.json`, not hardcoded paths; must not assume a particular OS or filesystem; must list dependencies in `requirements.txt` / `renv.lock` with pinned versions.

## 10. Common pitfalls (codify the warnings from `CLIF_CLAUDE.md`)

- Do not use `hospital_diagnosis` (billing diagnoses) as a predictor — finalized after discharge, prone to leakage.
- `medication_admin_continuous` has no end time. End is inferred from `med_dose == 0` or the next administration. Do not assume a fixed duration.
- `lab_value` may be non-numeric (e.g., `"> upper limit"`, `"<0.01"`). Use `lab_value_numeric` for arithmetic; preserve `lab_value` for QC.
- `mar_action_group == "administered"` is the only value that means the medication was given. `not_administered` and `other` must be filtered out before exposure analyses.
- `ADT.location_category` is a *physical* location, not a patient-status flag. ICU presence is `location_category == "icu"`.
- `device_category == "IMV"` is invasive ventilation; `NIPPV`, `CPAP`, `High Flow NC`, `Face Mask`, `Trach Collar`, `Nasal Cannula`, `Room Air`, `Other` are non-invasive or no support. Never collapse these silently.

## 11. Reporting checklist defaults under CLIF profile

- Observational cohort study on CLIF data → STROBE + RECORD (EHR extension).
- Prediction model on CLIF data → TRIPOD+AI.
- Target trial emulation → TARGET (with STROBE underneath).
- RCT using CLIF for outcome ascertainment → CONSORT.

`/ce-checklist-match` should pre-fill the routing answer with these defaults when CLIF profile is active and the user has not specified otherwise.

## 12. References (read-only, cite as needed)

- CLIF data dictionary v2.1.1 (latest release): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/releases/tag/v2.1.1
- CLIF GitHub (main): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF
- CLIF WORKFLOW.md: https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/blob/main/WORKFLOW.md
- mCIDE directory @ v2.1.1: https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/tree/v2.1.1/mCIDE
- **clifpy** (official Python client, PyPI: `pip install clifpy`): https://github.com/Common-Longitudinal-ICU-data-Format/clifpy — examples in `examples/`, docs at https://common-longitudinal-icu-data-format.github.io/clifpy/
- **CLIF-Project-Template** (canonical R skeleton with `renv.lock`, `code/`, `config/`, `outlier-thresholds/`, `output/`, `utils/`): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template
- CLIF-MIMIC pipeline (MIMIC -> CLIF): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-MIMIC
- CLIF Lighthouse (validation tool): https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Lighthouse
- Consortium contact: clif_consortium@uchicago.edu
