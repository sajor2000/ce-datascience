---
name: ce-figure
description: "Create and validate publication figure manifests with source-data traceability, captions, alt text, SAP links, guideline links, and journal style profiles. Use when the user asks for manuscript figures, JAMA-style figures, figure export checks, source-data packages, or publication-ready figure validation."
argument-hint: "[optional: --manifest analysis/publication/figures/figure-manifest.json --project-root .]"
---

# Publication Figure Workflow

Create or validate figure manifests before figures enter a manuscript or journal package. A figure is ready only when its source data, source code, output file, caption, alt text, SAP link, and style profile are visible.

## Workflow

1. Build or locate `analysis/publication/figures/figure-manifest.json`.
2. Run:

```bash
python3 scripts/validate_figure_manifest.py --manifest analysis/publication/figures/figure-manifest.json --project-root .
```

3. Resolve blockers before marking any figure as manuscript-ready.
4. If the harness can view images, visually inspect generated PNG/PDF/SVG exports for text overlap, legend placement, and readability.

## Manifest Shape

```json
{
  "figures": [
    {
      "figure_id": "fig1",
      "sap_section": "SAP-5.1",
      "source_data": "analysis/publication/figures/fig1-source.csv",
      "source_code": "analysis/scripts/fig1.py",
      "output_path": "analysis/publication/figures/fig1.pdf",
      "caption": "Figure 1. Primary outcome by exposure group.",
      "alt_text": "Line chart showing...",
      "style_profile": "jama",
      "checklist_items": ["STROBE-14"]
    }
  ]
}
```

## Readiness Rules

- Block duplicate figure IDs.
- Block absolute or parent-traversal paths.
- Block missing source data, source code, output files, captions, or alt text.
- Warn when no checklist item is linked.
- Warn when output format is not a profile-supported publication format.

## References

@./references/figure-spec.md

@./references/jama-figure-style.md
