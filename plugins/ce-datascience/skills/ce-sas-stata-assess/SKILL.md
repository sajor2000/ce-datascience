---
name: ce-sas-stata-assess
description: "Assess SAS and Stata analysis projects for migration, review, or reproducibility planning without pretending the plugin can fully scaffold SAS/Stata workflows. Use when a repo contains .sas, .do, .ado, .dta, PROC statements, or Stata model commands and the user asks what can be reviewed, ported, or made safer."
argument-hint: "[optional: --scan-dir analysis --report analysis/sas-stata-assessment.md]"
---

# SAS/Stata Project Assessment

This skill is intentionally assessment-first. The plugin does not yet provide first-class SAS or Stata scaffolding. It can identify the surface area, likely statistical procedures, portability risks, and a safe handoff path to R/Python/Quarto workflows.

## Workflow

1. Scan the project for `.sas`, `.do`, and `.ado` files.
2. Identify common procedure/model families and IO patterns.
3. Write a concise assessment report:

```bash
python3 scripts/assess_sas_stata.py --project-root . --scan-dir analysis --report analysis/sas-stata-assessment.md
```

4. Use the report to decide whether to:
   - keep the legacy code and add reproducibility wrappers,
   - port a bounded analysis to R/Python,
   - ask a human SAS/Stata analyst to validate model equivalence.

## Guardrails

- Do not generate new SAS/Stata project scaffolds automatically.
- Do not claim statistical equivalence after a port without paired output comparison.
- Do not read or commit `.dta`, `.sas7bdat`, or other patient-level files unless the project explicitly permits access and PHI handling is clear.

## References

@./references/assessment-checklist.md
