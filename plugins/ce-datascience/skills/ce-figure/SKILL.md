---
name: ce-figure
description: "Create or validate publication-ready scientific figures with JAMA-style typography, layout, and traceability checks."
argument-hint: "[optional: --manifest analysis/publication/figures/figure-manifest.json --project-root .]"
---

# Publication Figure Workflow

> **Script paths are relative to this skill's directory.** Run the commands below from the skill directory (the directory containing this `SKILL.md`), or prefix each script path with that directory — the agent's working directory is the user's project, not the skill.


## Skill Value

- **Problem it solves:** Figures can be visually polished but fail journal, readability, overlap, or data-traceability standards.
- **Use when:** The user asks for a figure, JAMA-style plot, manuscript graphic, or figure QA.
- **Output:** Figure artifact plus validation notes for style, labels, overlap, legend placement, and source data.
- **Ask only if:** Only when figure purpose, data source, panel structure, or journal style is unclear.
- **Do not do:** Do not invent data or skip visual inspection.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Create or validate figure manifests before figures enter a manuscript or journal package. A figure is ready only when its source data, source code, output file, caption, alt text, SAP link, and style profile are visible.

When the requested figure workflow creates or materially extends a Marimo, Jupyter, R Markdown, or Quarto notebook, load the `ce-notebook-standards` skill before creating cells or chunks.

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
