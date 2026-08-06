---
name: ce-table1
description: "Generate publication-ready Table 1 baseline-characteristics artifacts from SAP, tabular SAP variables, and style profile."
argument-hint: "[optional: --variables analysis/sap-tables/03-variables.csv --out-dir analysis/publication/tables --style-profile jama]"
---

# Table 1 Generator

> **Script paths are relative to this skill's directory.** Run the commands below from the skill directory (the directory containing this `SKILL.md`), or prefix each script path with that directory — the agent's working directory is the user's project, not the skill.


## Skill Value

- **Problem it solves:** Baseline tables fail when variable lists, cohort columns, formatting, and validation are not traceable.
- **Use when:** The user asks for Table 1, baseline characteristics, demographic table, or manuscript-ready descriptive cohort table.
- **Output:** Traceable CSV/Markdown Table 1 shell and validation report.
- **Ask only if:** Only when baseline variable list, cohort grouping, or data source is missing.
- **Do not do:** Do not invent variables, cohorts, or patient-level output.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Create a publication-ready Table 1 shell from declared study artifacts. This skill does not compute statistics from raw data unless the user supplies an explicit analysis dataset and asks for that implementation; the default is a traceable table specification and shell that the analyst can verify.

When the requested Table 1 workflow creates or materially extends a Marimo, Jupyter, R Markdown, or Quarto notebook, load the `ce-notebook-standards` skill before creating cells or chunks.

## Inputs

Prefer these project-local files:

- `analysis/sap.md`
- `analysis/sap-tables/03-variables.csv`
- `analysis/sap-tables/02-outputs.csv`
- `references/journal-style-profiles.yaml` (bundled with this skill) for journal style profiles.

If the variables catalog is missing, ask the user for the baseline variable list. Do not invent variables from a vague manuscript request.

## Workflow

1. Resolve the variables catalog, outputs catalog, output directory, and style profile. Default style profile is `jama` unless the project config names another profile.
2. Run:

```bash
python3 scripts/generate_table1.py --variables analysis/sap-tables/03-variables.csv --out-dir analysis/publication/tables --style-profile jama
```

3. Review the generated validation report before presenting the table as ready.
4. **Small-cell suppression (always, not only in CLIF mode):** before presenting or writing any stratified table, suppress or aggregate cells with n below the project's disclosure floor (default n<11 for EHR/claims data; use the site's policy when one is declared). Suppress complementary cells too when a suppressed value could be recovered by subtraction from totals. A Table 1 stratified by exposure routinely produces small cells — check every stratum, not just the obvious ones.
5. Table 1 output is aggregate-only: never write patient-level rows to publication, review-pack, or shared directories. If CLIF mode is active, write the aggregate-only output to `output/final_no_phi/`.

## Outputs

- `table1-spec.json` -- structured variables, strata, style profile, and readiness state
- `table1.csv` -- editable table shell
- `table1.md` -- Markdown table shell for manuscripts and review packs
- `table1-validation-report.md` -- blockers, warnings, and provenance

## Readiness Rules

- Block when no baseline variables are declared.
- Warn when no stratification variable is declared.
- Warn when no SAP path is provided.
- Preserve repo-relative paths in all generated artifacts.
- Use the configured journal style profile for formatting expectations.

## References

@./references/table1-spec.md

@./references/jama-table-rules.md
