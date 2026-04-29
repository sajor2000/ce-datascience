# CLIF Point-of-Contact Table

Source: `https://github.com/Common-Longitudinal-ICU-data-Format/CLIF/blob/main/README.md` (last mirrored 2026-04). Used by the `ce-clif` protected-path guardrail to identify whose authorization is required before editing a CLIF table's mCIDE / DDL / outlier-handling files.

## How the guardrail uses this table

When an edit is proposed against `mCIDE/<table>/**`, `ddl/<table>.sql`, `outlier-handling/<table>**`, or `reference_ranges/<table>**`, look up `<table>` in the table below. The proposed prompt must include `POC: @<github_handle> approved` (or `--poc-approved`) to proceed; otherwise the edit is blocked and the diff is staged under `analysis/clif-protected-edits/`.

## Table -> POC mapping

| Table                          | POC                                    | Email                                          | GitHub          |
|--------------------------------|----------------------------------------|------------------------------------------------|-----------------|
| adt                            | Nicholas Ingraham, MD                  | ingra107@umn.edu                               | ingra107        |
| code_status                    | Nathan Mesfin, MD                      | mesfin@umn.edu                                 | mesfi005        |
| crrt_therapy                   | William Parker, MD                     | wparker@uchicago.edu                           | 08wparker       |
| ecmo_mcs                       | Shan Guleria, MD                       | shan.guleria@uchicagomedicine.org              | shanguleria     |
| hospitalization                | Nicholas Ingraham, MD                  | ingra107@umn.edu                               | ingra107        |
| input                          | Shan Guleria, MD                       | shan.guleria@uchicagomedicine.org              | shanguleria     |
| intermittent_dialysis          | Jay Koyner, MD                         | jkoyner@uchicago.edu                           | (n/a)           |
| labs                           | Catherine Gao, MD                      | catherine.gao@northwestern.edu                 | cloverbunny     |
| medication_admin_continuous    | Chad Hochberg, MD                      | chochbe1@jh.edu                                | chochbe1        |
| medication_admin_intermittent  | Anna Barker, MD, PhD                   | baanna@med.umich.edu                           | baanna23        |
| medication_orders              | Anna Barker, MD, PhD                   | baanna@med.umich.edu                           | baanna23        |
| microbiology_culture           | Kevin Buell, MBBS                      | kevin.buell@uchicagomedicine.org               | kevingbuell     |
| microbiology_nonculture        | Kevin Buell, MBBS                      | kevin.buell@uchicagomedicine.org               | kevingbuell     |
| microbiology_susceptibility    | Kevin Buell, MBBS                      | kevin.buell@uchicagomedicine.org               | kevingbuell     |
| output                         | Shan Guleria, MD                       | shan.guleria@uchicagomedicine.org              | shanguleria     |
| patient                        | Pat Lyons, MD                          | lyonspa@ohsu.edu                               | plyons          |
| patient_assessments            | Snigdha Jain, MD                       | snigdha.jain@yale.edu                          | snigdhajainyale |
| patient_procedures             | J.C. Rojas, MD                         | juan_rojas@rush.edu                            | sajor2000       |
| position                       | Chad Hochberg, MD                      | chochbe1@jh.edu                                | chochbe1        |
| provider                       | Nicholas Ingraham, MD                  | ingra107@umn.edu                               | ingra107        |
| respiratory_support            | Nicholas Ingraham, MD                  | ingra107@umn.edu                               | ingra107        |
| therapy_details                | William Parker, MD, PhD; Bhakti Patel  | wparker@uchicago.edu; bpatel@bsd.uchicago.edu  | 08wparker       |
| vitals                         | Catherine Gao, MD                      | catherine.gao@northwestern.edu                 | cloverbunny     |

## Tables without a published POC

The following CLIF tables have no published POC in the public README. Treat them as protected — any edit requires consortium-level approval (email `clif_consortium@uchicago.edu`):

- `clinical_notes_facts`
- `clinical_notes_text`
- `clinical_trial`
- `hospital_diagnosis`
- `invasive_hemodynamics`
- `key_icu_orders`
- `patient_diagnosis`
- `place_based_index`
- `transfusion`
- `validated_diagnosis`

## Cross-cutting paths (no single POC)

These paths affect multiple tables and require a consortium-level review:

| Path                  | Approver                                                                |
|-----------------------|-------------------------------------------------------------------------|
| `WORKFLOW.md`         | Consortium leadership; email `clif_consortium@uchicago.edu`             |
| `ddl/**` (multi-table)| Consortium leadership                                                   |
| `outlier-handling/**` | The POC of the affected table + consortium leadership                   |
| `reference_ranges/**` | The POC of the affected table + consortium leadership                   |

## Refresh policy

Re-pull this table from the upstream README whenever the consortium publishes a new contributors update. The README's POC table is authoritative; this file is a cache used by the guardrail.
