---
name: ce-manuscript-package
description: "Assemble manuscript and journal submission package manifests from SAPs, Table 1 specs, figure manifests, reporting checklists, model cards, preregistration packages, and reproducibility artifacts. Use when preparing a Quarto manuscript, journal submission package, supplement, or manuscript readiness handoff."
argument-hint: "[optional: --out-dir manuscript --format quarto]"
---

# Manuscript Package Builder

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
