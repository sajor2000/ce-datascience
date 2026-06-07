---
name: ce-notebook-edit
description: "Safely modify existing Jupyter, Marimo, or Quarto notebooks using anchors, backups, and metadata-preserving edits."
argument-hint: "<notebook.ipynb> --tag <anchor-tag> --source <file> [--cell-type markdown|code]"
---

# Guarded Notebook Editing


## Skill Value

- **Problem it solves:** Notebook edits can silently reorder cells, corrupt metadata, or break outputs when treated as plain text.
- **Use when:** The user asks to update, patch, or extend an existing notebook rather than generate a new one.
- **Output:** A backed-up notebook edit plus an anchor/change summary and validation notes.
- **Ask only if:** Only when target notebook, edit anchor, or desired insertion point is unclear.
- **Do not do:** Do not rewrite whole notebooks or discard metadata without explicit scope.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Existing notebooks are fragile because cell order, metadata, outputs, and JSON structure can drift silently. This skill edits them only through explicit anchors and always leaves a backup.

## When This Skill Activates

- The user asks to modify an existing `.ipynb` rather than generate a new script, Quarto file, or marimo notebook.
- A SAP amendment, sensitivity analysis, Table 1 note, or figure-generation cell must be inserted into a notebook that already exists.
- A reviewer asks for a small notebook change and preserving execution history matters.

## Workflow

1. Prefer text-native formats for new work. If the user is starting fresh, route to `/ce-work` scaffolding instead of creating a new `.ipynb`.
2. Inspect the notebook structure and identify a unique anchor tag in `cell.metadata.tags`.
3. Put the new cell body in a small project file, then run:

```bash
python3 scripts/notebook_edit.py --notebook analysis/notebook.ipynb --tag sap-5-1 --source analysis/notebook-edits/new-cell.py --cell-type code
```

4. Review the generated backup, modified notebook diff, and `.edit-report.md` file.
5. Run the notebook top-to-bottom with the project's normal runner if available. If no runner exists, surface that as a verification gap.

## Guarantees

- The script refuses absolute paths and paths outside the project root.
- The script requires exactly one matching anchor tag.
- The original notebook is copied to `<notebook>.bak` before writing.
- If `nbformat` is installed, the script validates the notebook schema before and after editing. If it is missing, the script still performs structural JSON checks and prints install guidance.

## What This Skill Does Not Do

- Does not rewrite or reorder existing cells.
- Does not execute notebooks.
- Does not edit notebooks without a unique metadata tag anchor.
- Does not hide manual review; `.ipynb` diffs must be inspected before treating the change as complete.

## References

@./references/notebook-edit-policy.md
