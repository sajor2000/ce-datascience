---
name: ce-workflow
description: "Show the ordered ce-datascience lifecycle for the current project and recommend the next safe skill to run."
---

# Workflow Navigator


## Skill Value

- **Problem it solves:** Users do not know which slash skill comes next after setup, QA, SAP, sprint, or analysis work.
- **Use when:** The user starts or resumes a science project, feels unsure what to run next, or wants lifecycle status.
- **Output:** Lifecycle card with detected project type, current status, and next recommended skill.
- **Ask only if:** Only when project type remains ambiguous after scanning repo and stack-profile signals.
- **Do not do:** Do not run lifecycle skills or modify project state.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Shows the ordered skill sequence for a science project, detects progress, and recommends the next step. Read-only guidance — does not replace any existing skill.

## Stack Profile

The repository root is pre-resolved at skill load:
!`git rev-parse --show-toplevel 2>/dev/null || true`

Use the resolved absolute path or resolve it at runtime, then read `.ce-datascience/config.local.yaml` with the native file-read tool. In a linked worktree, fall back to the main checkout when the machine-local file is absent. Parse `language`, `ide`, `reporting`, `data_layer`, and the optional `stack_profile.inference` map; if no config can be read, infer them from project files.

Treat a saved inference value with its `confidence` and `evidence` as a reusable
setup handoff. Do not re-ask a setup question when a high-confidence value is
available. If routing must use a fallback, say so and name the missing evidence
that would refine it.

## Phase 0: Detect Signals

Scan the working directory for project-type signals. Do not ask the user yet.

**CLIF signals** (strong signals → auto-route to CLIF overlay; weak signals need 2+ to route):

Strong (any one sufficient):
- `CLIF_CLAUDE.md` at repo root
- Git remote contains `clif-consortium` or `clif-icu`
- `__CE_CLIF__ active=true` in chat context

Weak (need 2+ together):
- `mCIDE/` directory exists
- `clif_*.parquet` files exist
- `WORKFLOW.md` at repo root

Do NOT route to CLIF for: generic `patient.parquet`, `vitals`, `labs`, `renv.lock` alone, or `WORKFLOW.md` alone — these appear in non-CLIF EHR projects.

**OMOP signals** (any one → observational study + OMOP overlay):
- SQL files referencing `cdm_source`, `concept`, `person`, or `observation_period`
- `analysis/cohort/` contains `.sql` with OMOP table names

**Bioinformatics signals** (any one → bioinformatics path):
- `.fastq`, `.fastq.gz`, `.bam`, `.vcf` files in project tree
- `Snakefile`, `nextflow.config`, or `workflow/Snakefile` exists
- `Bioconductor` in `renv.lock` or `DESCRIPTION`

**Claims signals** (any one → observational-study + claims overlay):
- Medicare, Medicaid, MarketScan, NDC, enrollment-gap, or payer-claim logic in active analysis files

**Generic EHR signals** (two or more → observational-study + generic-EHR overlay):
- cohort, encounter, diagnosis, medication, laboratory, or vital-sign fields in active analysis files

**No biomedical signals** → default to Technical / software path without asking and label the route `fallback: no biomedical project evidence`.

## Phase 1: Detect or Ask Project Type

If signals clearly indicate a project type, auto-route and print a one-line banner with its evidence:

```
[ce-workflow] Auto-detected: Observational study (CLIF data layer, R; evidence: CLIF_CLAUDE.md, clif_*.parquet)
```

If project type remains unclear after scanning available files, ask this routing question using the Skill Value interaction rule above.

**Question:** "What type of project is this?"

**Options:**
1. Observational study (cohort, case-control, cross-sectional)
2. Clinical trial analysis (RCT, trial emulation)
3. Prediction / ML model (development, validation, impact)
4. Bioinformatics / omics (genomics, transcriptomics, proteomics)

## Phase 2: Detect Progress and Emit Card

Read `references/lifecycle-paths.md` for the skill sequence matching the project type. Then read `references/state-detection.md` and check each signal to determine step status:

- Done: file artifact exists and appears complete
- In progress: artifact exists but is partial or ambiguous
- Not started: no artifact found

Resolve language from the highest-confidence compatible source in this order:
explicit current request, saved profile, saved inference, `__CE_LANG__`, then
project files. Resolve data domain from Phase 0 signals or saved inference
(OMOP, CLIF, admin claims, bioinformatics, generic EHR, or generic data). Never
convert an unknown language to `both`; show `unknown` and recommend setup only
when the selected lifecycle needs a language-specific artifact.

Emit the lifecycle card:

```
## Workflow: Observational Study (OMOP)
Language: Python (Jupyter) | Data layer: OMOP

 1. [done] /ce-research-question    analysis/research-question.yaml
 2. [done] /ce-pubmed                analysis/literature/
 3. [    ] /ce-method-extract
 4. [    ] /ce-checklist-match       STROBE + RECORD
 5. [    ] /ce-effect-size
 6. [    ] /ce-power
 7. [    ] /ce-cohort-build          OMOP SQL + concept sets
 8. [    ] /ce-data-qa
 9. [    ] /ce-plan (SAP mode)
10. [    ] /ce-sap-tabular
11. [    ] /ce-sprint
12. [    ] /ce-work                  Jupyter .ipynb
13. [    ] /ce-code-review
14. [    ] /ce-compound

Next step: /ce-method-extract
  Extract statistical methods from your PubMed results for SAP justification.
```

Inline language-specific and data-layer notes at the steps where they matter (e.g., step 7 shows "OMOP SQL + concept sets" or "CAPR + SQL" depending on language; step 12 shows "Jupyter .ipynb" or "Marimo .py" or "Quarto .qmd").

If all steps are complete, emit: "All lifecycle steps complete. Run `/ce-compound` to document learnings."

If no stack profile exists, append: "Run the setup skill first to review the detected profile. In Claude plugin installs, use `/ce-datascience:ce-setup`; bare `/ce-setup` works only when local aliases are installed."

## What this skill does NOT do

- Does not run any lifecycle skill — it only recommends the next one
- Does not replace setup -- run `ce-setup` first for full stack profile
- Does not create files or modify project state
- Does not replace `/ce-clif` — CLIF activation happens automatically via `ce-clif`

## References

`references/lifecycle-paths.md` — Ordered skill sequences for all 5 project types with language branches and data-layer overlays

`references/state-detection.md` — File-system signals used to infer which steps are complete
