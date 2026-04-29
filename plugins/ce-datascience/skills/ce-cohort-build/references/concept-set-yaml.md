# Concept Set YAML Schema

Each concept set is a versioned, vocabulary-pinned list of codes. One file per concept set. Files live in `analysis/cohort/concept-sets/`.

```yaml
concept_set:
  name: T2DM
  description: Type 2 diabetes mellitus, including descendants, excluding T1DM
  vocabulary: OMOP                # OMOP | ICD10 | ICD9 | CPT | LOINC | SNOMED | mixed
  vocabulary_version: 2024-Q1     # required; pin this
  source: built-from-ATLAS         # or hand-curated, or PheKB-id, or eMERGE-id
  primary_concepts:
    - concept_id: 201826
      concept_name: "Type 2 diabetes mellitus"
      domain: Condition
      vocabulary: SNOMED
      include_descendants: true
  excluded_concepts:
    - concept_id: 201254
      concept_name: "Type 1 diabetes mellitus"
      include_descendants: true
  validation:
    against: chart_review_2024_pilot.csv
    ppv: 0.94
    sensitivity: 0.88
  provenance:
    author: jcr
    created: 2024-11-15
    last_reviewed: 2025-02-01
    notes: "Aligned with eMERGE T2DM phenotype v3"
```

## Required vs optional

- **Required:** name, vocabulary, vocabulary_version, primary_concepts (at least one)
- **Strongly recommended:** include_descendants, excluded_concepts
- **Recommended for publication:** validation block (PPV / sensitivity from chart review or external dataset)
- **Optional but useful:** provenance (who built it, when, references)

## Pitfalls

- Forgetting `include_descendants: true` for SNOMED/ICD-10 → cohort silently misses subtypes
- Mixing vocabularies in `primary_concepts` without setting `vocabulary: mixed` and per-concept `vocabulary` field
- Pinning vocab version to "latest" → cohort changes between data refreshes; use a date-stamped version
- Using deprecated concept_ids (the `concept` table has `valid_end_date`); honor those windows
