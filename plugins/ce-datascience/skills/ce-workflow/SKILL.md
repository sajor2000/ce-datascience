---
name: ce-workflow
description: "Lifecycle navigator for science projects. Detects project type (observational, RCT, prediction model, bioinformatics) and data layer (OMOP, CLIF, admin claims), then shows the ordered skill sequence with current progress and next-step recommendation. Routes by language (Python Jupyter, Python Marimo, R). Use when starting a new project, resuming work, or unsure which skill to run next."
---

# Workflow Navigator

Shows the ordered skill sequence for a science project, detects progress, and recommends the next step. Read-only guidance — does not replace any existing skill.

## Stack Profile (pre-resolved)

!`(top=$(git rev-parse --show-toplevel 2>/dev/null); [ -n "$top" ] && cat "$top/.ce-datascience/config.local.yaml" 2>/dev/null) || (common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); [ -n "$common" ] && cat "$(dirname "$common")/.ce-datascience/config.local.yaml" 2>/dev/null) || echo '__NO_CONFIG__'`

Parse the resolved block for `language`, `ide`, `reporting`, and `data_layer` fields. If `__NO_CONFIG__`, infer from project files.

## Phase 0: Detect Signals

Scan the working directory for project-type signals. Do not ask the user yet.

**CLIF signals** (any one → observational study + CLIF overlay):
- `CLIF_CLAUDE.md` at repo root
- `mCIDE/` directory exists
- Both `WORKFLOW.md` and `renv.lock` exist
- Git remote contains `clif-consortium` or `clif-icu`
- `__CE_CLIF__ active=true` in chat context

**OMOP signals** (any one → observational study + OMOP overlay):
- SQL files referencing `cdm_source`, `concept`, `person`, or `observation_period`
- `analysis/cohort/` contains `.sql` with OMOP table names

**Bioinformatics signals** (any one → bioinformatics path):
- `.fastq`, `.fastq.gz`, `.bam`, `.vcf` files in project tree
- `Snakefile`, `nextflow.config`, or `workflow/Snakefile` exists
- `Bioconductor` in `renv.lock` or `DESCRIPTION`

**No biomedical signals** → default to Technical / software path without asking.

## Phase 1: Detect or Ask Project Type

If signals clearly indicate a project type, auto-route and print a one-line banner:

```
[ce-workflow] Auto-detected: Observational study (CLIF data layer, R)
```

If signals are absent or ambiguous, ask using the platform's blocking question tool (`AskUserQuestion` in Claude Code — call `ToolSearch` with `select:AskUserQuestion` first if its schema is not loaded; `request_user_input` in Codex; `ask_user` in Gemini/Pi). Fall back to numbered options in chat only when the blocking tool errors.

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

Resolve the language from `__CE_LANG__` or the stack profile. Resolve the data layer from Phase 0 signals (OMOP, CLIF, admin claims, or generic EHR).

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

If no stack profile exists, append: "Run `/ce-setup` first to configure your stack profile."

## What this skill does NOT do

- Does not run any lifecycle skill — it only recommends the next one
- Does not replace `/ce-setup` — run setup first for full stack profile
- Does not create files or modify project state
- Does not replace `/ce-clif` — CLIF activation happens automatically via `ce-clif`

## References

`references/lifecycle-paths.md` — Ordered skill sequences for all 5 project types with language branches and data-layer overlays

`references/state-detection.md` — File-system signals used to infer which steps are complete
