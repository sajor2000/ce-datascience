# SAP-Mode Workflow

Detailed workflow for `/ce-plan` when **SAP mode** is active. Linked from `SKILL.md` § "Dual-Mode: SAP vs Implementation". Phases 0-2 still run as normal; this file replaces Phases 3-5 with SAP-specific behavior.

## Table of contents

1. SAP Phase 3 — Structure the SAP (template, signal scan, fill rules).
2. Canonical handoff-signal envelopes (the `__CE_*__` table consumed by Phase 3).
3. CLIF-profile behavior under SAP mode.
4. SAP Phase 4 — Write the SAP file.
5. SAP Phase 5 — Gap check and review.
6. SAP versioning rules.

---

## 1. SAP Phase 3: Structure the SAP

1. Read the SAP template from `references/sap-template.md`.
2. Scan chat context and `analysis/` for upstream biomedical-skill handoff signals (see § 2 below). The model parses each signal out of recent chat turns (one line per signal beginning with `__CE_*__`) and out of the `analysis/` artifact paths the signals point at, then uses them as inputs in step 3.
3. Fill each SAP section (SAP-1 through SAP-10) from the input document, the upstream signal artifacts from step 2, and research findings.
4. Carry forward all study design decisions from the origin document -- do not re-litigate design choices made during brainstorming.
5. Fill every section; if a section is not applicable, write "Not applicable: [reason]" rather than leaving it blank.
6. Flag incomplete sections with `<!-- GAP: [description] -->` HTML comments (including the upstream-signal gaps from step 2).
7. Use precise statistical language -- name specific tests, models, and adjustment methods.

When a signal is present, treat its output file (`csv=`, `yaml=`, `json=`, `file=`) as authoritative input for that section. When a signal is absent for a section the SAP needs, write `<!-- GAP: missing /ce-<skill> output; SAP-<N.M> unanchored -->` as a placeholder rather than fabricating content. Tell the user which skills they should run to fill the gaps and offer to re-run `/ce-plan deepen` after.

## 2. Canonical handoff-signal envelopes

Each emitter MUST emit at minimum the listed keys; extra keys are allowed (forward-compatible). When a consumer expects a key that the emitter wrote `null` for (e.g. narrative-mode effect-size pooling), treat it as missing rather than an error.

| Signal | Canonical shape | Emitted by | Feeds SAP section |
|--------|------------------|------------|-------------------|
| `__CE_RESEARCH_QUESTION__ yaml=<path> design=<string> checklist=<string> query="<one-line>"` | `/ce-research-question` | SAP-1 framing, SAP-2.1 hypothesis |
| `__CE_PUBMED_RESULTS__ csv=<path> n=<int> query=<string> pmc_pct=<float>` | `/ce-pubmed` | SAP-1 background, SAP-2 rationale |
| `__CE_METHOD_EXTRACT__ csv=<path> n=<int> modal_method=<string>` | `/ce-method-extract` | SAP-1 background, SAP-4 analysis-plan justification |
| `__CE_CHECKLIST__ primary=<name> extensions=[<comma-or-empty>]` | `/ce-checklist-match` | SAP frontmatter `reporting_checklist` |
| `__CE_COHORT__ name=<string> n=<int> yaml=<path-to-cohort.yaml> waterfall=<path-to-waterfall.csv>` | `/ce-cohort-build` | SAP-2 population, SAP-2.2 inclusion/exclusion |
| `__CE_DATA_QA__ wave=<id> pass=<bool> blockers=<int> warns=<int> report=<path>` | `/ce-data-qa` | SAP-2.4 data quality assertions |
| `__CE_PHENOTYPE_VALIDATE__ name=<string> n=<int> ppv=<float> sens=<float> yaml=<path> report=<path>` | `/ce-phenotype-validate` | SAP-2 case-definition validation |
| `__CE_EFFECT_SIZE__ metric=<m> n_studies=<int> point=<v\|null> ci=<lo,hi\|null> i2=<float\|null> mode=<reml\|narrative>` | `/ce-effect-size` | SAP-2.5 effect-size anchor |
| `__CE_POWER__ design=<string> total=<int> file=<path>` (optional `n_per_arm`, `epv` for prediction-model variant) | `/ce-power` | SAP-2.5 sample-size result |
| `__CE_CLIF__ active=<bool> version=<dd-version> strict=<bool> rules=<path>` | `/ce-clif` | SAP frontmatter `data_source: CLIF`, SAP-2 layout, SAP-9 dissemination |
| `__CE_LANG__ primary=<python\|r\|both\|unknown> secondary=<...\|null> source=<auto\|cached\|manual>` | `/ce-language-detect` (via `/ce-setup`) | SAP-2 implementation-units split (Python vs R scaffolding choices) |

## 3. CLIF profile under SAP mode

When `__CE_CLIF__ active=true` is present:

- Set the SAP frontmatter field `data_source: CLIF` (with the data dictionary `version` from the signal).
- Default the implementation-units split to the three-script architecture (QC → cohort → analysis under `code/`).
- Default `reporting_checklist: STROBE` + `reporting_checklist_extensions: [RECORD]` for observational studies if not already set by `__CE_CHECKLIST__`.
- Add a SAP-9 dissemination note: "patient-level data does not leave each site; only aggregate results in `output/` are shared".
- Place protected-path edits (`mCIDE/`, `ddl/`, `outlier-handling/`, `reference_ranges/`, `WORKFLOW.md`) out of scope for any implementation unit unless the user has stated POC sign-off.

## 4. SAP Phase 4: Write the SAP

1. Determine the output path: use the user-specified path, or default to `analysis/sap.md` relative to the project root. Create the `analysis/` directory if it does not exist.
2. Set the YAML frontmatter:
   - `sap_version: 1`
   - `study_type:` one of `observational`, `rct`, `exploratory`, `other`
   - `date_created:` today's date
   - `date_amended:` leave empty for initial draft
   - `status: draft`
3. Write the SAP file to disk using the Write tool.
4. Confirm: `SAP written to [path]`.

## 5. SAP Phase 5: Gap Check and Review

1. Read the gap checklist from `references/sap-gap-checklist.md`.
2. Scan the written SAP against every item in the checklist.
3. Report gaps to the user in the format specified by the checklist (critical, important, advisory).
4. If critical gaps exist, recommend the user resolve them before finalizing (`status` remains `draft`).
5. If no critical gaps exist, offer to set `status: final`.
6. Present the post-generation menu (same options as implementation mode, substituting SAP path for plan path).

## 6. SAP versioning

When updating an existing SAP:

- Increment `sap_version` in the frontmatter.
- Set `date_amended` to today's date.
- Set `status: amended`.
- Preserve all existing SAP-N.M section IDs -- never renumber. Add new subsections as SAP-N.M+1.
