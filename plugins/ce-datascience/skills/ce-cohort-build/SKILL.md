---
name: ce-cohort-build
description: "Define a reproducible study cohort with inclusion/exclusion criteria, index event, vocabulary-pinned concepts, SQL/CTE output, and waterfall counts. Use when the user needs an EHR, OMOP, claims, phenotype, or observational-study cohort before data QA or SAP finalization."
argument-hint: "<cohort name>, optional: --vocab omop|icd10|icd9|cpt|loinc|snomed --index-event <event>"
---

# Cohort Definition Builder


## Skill Value

- **Problem it solves:** Cohort definitions are a common source of irrecoverable bias when criteria, timing, and code lists are implicit.
- **Use when:** The user needs an EHR, OMOP, claims, phenotype, or observational-study cohort before data QA or SAP finalization.
- **Output:** Cohort spec YAML, concept-set files or code lists, SQL/CTE query, and CONSORT-style waterfall counts.
- **Ask only if:** Only for cohort facts not supplied by PICO, prior research-question YAML, data source, or user prompt.
- **Do not do:** Do not run downstream modeling or pretend a vague population is a locked cohort.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Walks the user through defining a research cohort with vocabulary-pinned concept sets and an explicit index event. Cohort definition is the most common source of unrecoverable bias in observational research; this skill makes the definition explicit, version-controlled, and replayable.

## When this skill activates

- Starting a new observational study using EHR / claims / registry data
- Re-defining a cohort after a vocabulary refresh (e.g., 2023 ICD-10-CM changes)
- Validating an existing cohort by replaying its definition against a fresh extract
- Manual: `ce-cohort-build "T2DM with statin initiation 2018-2023" --vocab omop`

## Prerequisites

- `stack_profile.data_root` is set (cohort runs against this)
- For OMOP: vocabulary tables exist (`concept`, `concept_ancestor`, `concept_relationship`)
- For non-OMOP: a code-list file (CSV or YAML) with `code,vocab,description`

## Core workflow

### Step 0: Context inputs (scan chat first)

Before eliciting cohort criteria, scan the most recent ~50 chat turns for `__CE_RESEARCH_QUESTION__ yaml=<path>`. If found, read the YAML and use it as the seed:

- `pico.population` → starting point for inclusion criteria (the user can refine, but the population is already framed)
- `pico.intervention_or_exposure` → starting point for the index event / exposure concept set
- `pico.comparator` → seed for the comparator concept set when comparator is non-null
- `pico.outcome` → seed for the outcome concept set used in follow-up
- `suggested_design` → if it starts with "target trial", surface the target_trial.* slots as additional inputs

Print: `[research-question] seeding cohort from analysis/research-question.yaml; pico.population = "..."`. The user still confirms each criterion in step 1; pre-seeding shortens the conversation, it does not skip review.

When `__CE_RESEARCH_QUESTION__` is absent, fall through to step 1 cold.

**CLIF profile**: if chat context contains `__CE_CLIF__ active=true`, switch defaults. Treat `https://clif-icu.com/` and the matching `version=` + `mcide_version=` values in the CLIF handoff as the authoritative data-dictionary family. If the pair is missing, incomplete, or mixed, route to the `ce-clif` skill before emitting `_category` filters.

- Default source schema is the CLIF relational schema (read from Parquet files). Skip OMOP CTE generation; instead emit a `polars` (Python) or `arrow` + `dplyr` (R) script that reads `hospitalization.parquet`, `adt.parquet`, etc. from the `tables_path` in `config/config.json`.
- The cohort identifier is `hospitalization_id` (VARCHAR). Persist patient-level cohort IDs only as `output/intermediate_phi/cohort_ids.parquet` after verifying that path is approved, local, non-synced, and gitignored (otherwise under the approved restricted data root) — never CSV, never with an integer cast, and never share or commit them.
- Inclusion criteria default to `adt.location_category == "icu"` for ICU studies; `hospitalization.age_at_admission >= 18` for adult studies.
- All datetime filters are timezone-aware UTC.
- Write only disclosure-reviewed cohort-flow summaries to `output/final_no_phi/cohort_waterfall.csv`; replace SQL/CTE generation with a `code/01_cohort_<name>.{py,R}` script that starts the template workflow.
- `_category` filters must use mCIDE allow-listed values from the selected family. Use the bundled cache only for 2.1 + 2.1; for 3.0 + 3.0, require the declared v3 mCIDE source. Refuse to emit a filter with an unknown category string.
- For canonical code patterns, route by language: `__CE_LANG__ primary=python` -> use `clifpy` and `ClifOrchestrator` rather than rolling your own joins; `__CE_LANG__ primary=r` -> use `arrow::open_dataset()` per the CLIF project-template layout. If `__CE_LANG__` is absent, load the `ce-language-detect` skill first; if still `unknown`, surface both implementation choices.

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

### Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** validated code sets and phenotype algorithms for each criterion (PheKB, eMERGE, OHDSI/OMOP phenotype studies) with their reported PPV and sensitivity, cited by PMID; a concept set without a read, published precedent is `project-defined` and the spec must say so.

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

Save concept sets to `analysis/cohort/concept-sets/<set-name>.yaml`. Set `source:` to the published algorithm the set follows (PheKB/eMERGE/OHDSI identifier plus PMID) or `project-defined`, and record any reported PPV/sensitivity in the optional `literature:` block with its PMID and evidence label (see `references/concept-set-yaml.md`); never copy a literature value into the project's own `validation` block, which `ce-phenotype-validate` fills from chart review.

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

**Small-cell suppression (always, not only in CLIF mode):** waterfall steps are aggregate counts, but a step that loses very few patients can still disclose. Before saving or sharing the waterfall, suppress or merge any step whose lost-N is below the project's disclosure floor (default n<11 unless the project declares its own floor, for example the CLIF consortium floor of n>=10, or a site or DUA rule is stricter), and never annotate a step with patient-identifying examples.

### Step 5: Write the cohort spec

`analysis/cohort/<cohort-name>.yaml`:

```yaml
cohort_name: T2DM_statin_init_2018_2023
cohort_purpose: ...
vocabulary: OMOP
vocabulary_version: 2024-Q1
data_wave_id: <from analysis/data-waves.md>
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

If the cohort waterfall loses > 50% at any single step, suggest `ce-compound` to capture the dropout pattern -- this is where cohort definitions go wrong silently.

## What this skill does NOT do

- Does not run statistical analysis (use the `ce-work` skill)
- Does not validate the phenotype against chart review (use the `ce-phenotype-validate` skill)
- Does not validate the resulting dataset (load the `ce-data-qa` skill next; the CONSORT waterfall produced here is the data-quality starting point)
- Does not replace the SAP — the cohort spec is referenced FROM the SAP, not instead of it
- Does not de-identify (use the `ce-data-qa` skill and `ce-phi-leak-reviewer` for that)

## Handoff signal

After step 5, print one line so `ce-plan` SAP mode and `ce-data-qa` can pick this cohort up from chat context:

```
__CE_COHORT__ name=<cohort-name> n=<final-n> yaml=<path-to-cohort.yaml> waterfall=<path-to-waterfall.csv>
```

The `yaml=` key points at the cohort spec (`analysis/cohort/<cohort-name>.yaml` from step 5); `waterfall=` points at the CONSORT waterfall CSV from step 4. Both keys must be present so downstream skills can pick whichever they need.

## References

`scripts/concept_set_to_capr.R` — converts a concept-set YAML into Capr concept-set R code and ATLAS-compatible JSON, then prints a `__CE_COHORT_CAPR__` summary line; use it when `__CE_LANG__ primary=r` and the cohort is OMOP-based. It requires the `Capr` and `yaml` R packages and stops when `vocabulary_version` is missing:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
Rscript "$SKILL_DIR/scripts/concept_set_to_capr.R" --in analysis/cohort/concept-sets/<set>.yaml --out-r analysis/cohort/concept-sets/<set>.R --out-json analysis/cohort/concept-sets/<set>.json
```

@./references/omop-cohort-template.sql

@./references/concept-set-yaml.md

@./references/eligibility-windows.md
