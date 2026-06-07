---
name: ce-manuscript-package
description: "Assemble manuscript-ready packages from SAP, outputs, tables, figures, reporting checklist, and provenance artifacts."
argument-hint: "[optional: --out-dir manuscript --format quarto]"
---

# Manuscript Package Builder


## Skill Value

- **Problem it solves:** Manuscript submission packages fail when required outputs, checklist items, and provenance are scattered.
- **Use when:** The user needs a journal/manuscript package, submission bundle, or final report handoff.
- **Output:** A manuscript package manifest with included artifacts, missing items, and readiness notes.
- **Ask only if:** Only when target journal, package scope, or required artifacts are unclear.
- **Do not do:** Do not invent missing tables, figures, or manuscript claims.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Build a traceable manuscript package manifest. The skill wires known study artifacts together; it does not invent manuscript prose or scientific claims.

## Workflow

1. Confirm the SAP exists and is the correct study contract.
2. Confirm Table 1 and figure manifests exist, or surface them as blockers.
3. Include selected reporting checklist files from the guideline registry.
4. Include preregistration and model-card artifacts when applicable.
5. Run:

```bash
python3 scripts/build_package_manifest.py --project-root . --out-dir manuscript --format quarto
```

6. Review `manuscript/package-readiness-report.md` before calling the package submission-ready.

## Quarto Path

For Quarto projects, create or update a package manifest that expects:

- `manuscript/manuscript.qmd`
- `manuscript/package-manifest.json`
- `manuscript/tables/`
- `manuscript/figures/`
- `manuscript/supplement/`
- `manuscript/checklists/`

For non-Quarto projects, generate the same package manifest and section stubs without forcing a conversion.

## References

@./references/package-manifest-schema.yaml

@./references/quarto-manuscript-template.md

@./references/journal-package-checklist.md
