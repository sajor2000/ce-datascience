---
name: ce-cohort-build
description: 'Defines a study cohort using inclusion/exclusion criteria, OMOP concept sets (or ICD/CPT/LOINC/SNOMED/RxNorm code lists), an index event, and continuous-enrollment + look-back + wash-out + follow-up windows. Outputs a Capr-compatible JSON cohort spec, a SQL/CTE query, concept-set YAMLs with vocabulary version pinning, and a CONSORT-flow waterfall (eligible → included → excluded with reasons). Use whenever the user mentions cohort definition, OMOP, ATLAS, OHDSI, observational study setup, EHR cohort, claims cohort, ICD/CPT/SNOMED/RxNorm/LOINC code lists, phenotype algorithm, inclusion/exclusion criteria, index date, target trial cohort, or "build me a cohort of". Use at the START of any observational study, before /ce-data-qa runs. Wraps OHDSI Capr conventions; concept sets are vocabulary-version-pinned to prevent silent drift across data refreshes.'
argument-hint: "<cohort name>, optional: --vocab omop|icd10|icd9|cpt|loinc|snomed --index-event <event>"
---

# Cohort Definition Builder

Walks the user through defining a research cohort with vocabulary-pinned concept sets and an explicit index event. Cohort definition is the most common source of unrecoverable bias in observational research; this skill makes the definition explicit, version-controlled, and replayable.

## When this skill activates

- Starting a new observational study using EHR / claims / registry data
- Re-defining a cohort after a vocabulary refresh (e.g., 2023 ICD-10-CM changes)
- Validating an existing cohort by replaying its definition against a fresh extract
- Manual: `/ce-cohort-build "T2DM with statin initiation 2018-2023" --vocab omop`

## Prerequisites

- `stack_profile.data_root` is set (cohort runs against this)
- For OMOP: vocabulary tables exist (`concept`, `concept_ancestor`, `concept_relationship`)
- For non-OMOP: a code-list file (CSV or YAML) with `code,vocab,description`

## Core workflow

### Step 1: Elicit the cohort definition

Ask the user (or parse from `args`):

1. **Name and purpose** -- one sentence, becomes `cohort_name` and `cohort_purpose`
2. **Vocabulary** -- omop / icd10 / icd9 / cpt / loinc / snomed / mixed
3. **Vocabulary version** -- "OMOP v5.4 vocab 2024-Q1", "ICD-10-CM 2024", "SNOMED CT 2024-03-01". This MUST be pinned; vocabulary drift is the #1 cause of irreproducible cohorts
4. **Index event** -- the moment time-zero is defined (first diagnosis date, first prescription date, hospital admission, randomization)
5. **Inclusion criteria** -- positive criteria (must have)
6. **Exclusion criteria** -- negative criteria (must not have); each with a window (e.g., "no statin in prior 365 days")
7. **Eligibility window** -- continuous enrollment / observation window (e.g., 180 days prior, 365 days follow-up)
8. **Wash-out / look-back** -- explicit prior-period requirements

### Step 2: Build concept sets

For each criterion, build a concept set:

```yaml
concept_set:
  name: T2DM
  vocabulary: OMOP
  vocabulary_version: 2024-Q1
  primary_concepts:
    - { concept_id: 201826, concept_name: "Type 2 diabetes mellitus", domain: Condition, vocabulary: SNOMED }
  include_descendants: true
  excluded_concepts:
    - { concept_id: 201254, concept_name: "Type 1 diabetes mellitus" }
```

Save concept sets to `analysis/cohort/concept-sets/<set-name>.yaml`.

### Step 3: Generate cohort SQL

For OMOP, emit a CTE-based query against the standard schema (`person`, `condition_occurrence`, `drug_exposure`, `procedure_occurrence`, `measurement`, `observation_period`). Use parameterized concept-set joins so the same SQL replays after a vocab refresh.

For non-OMOP / claims, emit a join against the source tables using the user-provided code lists.

Save the SQL to `analysis/cohort/sql/<cohort-name>.sql` with comments referencing each concept-set YAML.

### Step 4: Generate the CONSORT waterfall

Run the SQL (or print it for the analyst to run) and capture the cascade:

```
Persons in source                        : N0
  + meets inclusion criterion 1           : N1 (lost N0 - N1)
  + meets inclusion criterion 2           : N2 (lost N1 - N2)
  - excludes exclusion criterion 1        : N3 (lost N2 - N3)
  - excludes exclusion criterion 2        : N4 (lost N3 - N4)
  + has continuous enrollment             : N5 (lost N4 - N5)
  + has index event in study window       : N6 (final cohort)
```

Save as `analysis/cohort/<cohort-name>-waterfall.md` and `analysis/cohort/<cohort-name>-waterfall.csv`. This is the CONSORT-style figure for the manuscript.

### Step 5: Write the cohort spec

`analysis/cohort/<cohort-name>.yaml`:

```yaml
cohort_name: T2DM_statin_init_2018_2023
cohort_purpose: ...
vocabulary: OMOP
vocabulary_version: 2024-Q1
data_wave_id: <from data-state.yaml>
index_event:
  description: First statin prescription on or after T2DM diagnosis
  source: drug_exposure
  concept_set: statin_initiation
inclusion:
  - concept_set: T2DM
  - continuous_enrollment_prior_days: 365
exclusion:
  - { concept_set: T1DM, window: any }
  - { concept_set: statin_use, window: prior_365_days }
follow_up:
  start: index_date
  end: index_date + 365 days OR earliest_of(death, lost_to_followup, study_end)
final_n: <from waterfall>
```

### Step 6: Compound learning hook

If the cohort waterfall loses > 50% at any single step, suggest `/ce-compound` to capture the dropout pattern -- this is where cohort definitions go wrong silently.

## What this skill does NOT do

- Does not run statistical analysis (use `/ce-work`)
- Does not validate the phenotype against chart review (use `/ce-phenotype-validate`)
- Does not validate the resulting dataset (run `/ce-data-qa` next; the CONSORT waterfall produced here is the data-quality starting point)
- Does not replace the SAP — the cohort spec is referenced FROM the SAP, not instead of it
- Does not de-identify (use `/ce-data-qa` and `ce-phi-leak-reviewer` for that)

## Handoff signal

After step 5, print one line so `/ce-plan` SAP mode and `/ce-data-qa` can pick this cohort up from chat context:

```
__CE_COHORT__ name=<cohort-name> n=<final-n> json=<path-to-cohort.yaml> waterfall=<path-to-waterfall.csv>
```

## References

@./references/omop-cohort-template.sql

@./references/concept-set-yaml.md

@./references/eligibility-windows.md
