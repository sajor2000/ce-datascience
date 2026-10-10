---
name: ce-manuscript-package
description: "Assemble manuscript-ready packages from SAP, outputs, tables, figures, reporting checklist, and provenance artifacts. Use when the user needs a journal/manuscript package, submission bundle, or final report handoff."
argument-hint: "[optional: --out-dir manuscript --format quarto]"
---

# Manuscript Package Builder

> **Run the commands below from the user's project root.** The `SKILL_DIR` anchor locates the bundled script; `--project-root` and `--out-dir` stay project-relative.


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
5. If the deliverable is a Word manuscript, run `ce-manuscript-citations` before
   final packaging and include the field-bearing DOCX master plus its citation
   ledger; a flattened DOCX or static bibliography is not the editable master.
6. Run:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
python3 "$SKILL_DIR/scripts/build_package_manifest.py" --project-root . --out-dir manuscript --format quarto
```

7. The script writes `checklists`, `registry_packages`, and `reproducibility` as empty lists and rewrites the manifest on every run; after the final run, add the artifacts from steps 3-4 to those lists. For a Word deliverable, also set the optional `word_master` and `citation_ledger` paths from the step 5 `__CE_CITATION_LEDGER__` handoff (`docx=` and `path=`).
8. Review `manuscript/package-readiness-report.md` before calling the package submission-ready.
9. The script never sets `ready-for-signoff`. The agent sets `readiness: ready-for-signoff` only after step 7, when the script result is `ready-with-review` and the user names the human reviewer who reviewed the readiness report; record that name in `signoff_reviewer`. Never set it from a `blocked` result or without a named reviewer. A rerun resets readiness, so repeat steps 7-9 after any rerun.

## Quarto Path

Load the `ce-notebook-standards` skill before creating or materially extending executable Quarto analysis notebooks that feed the manuscript package.

For Quarto projects, create or update a package manifest that expects:

- `manuscript/manuscript.qmd`
- `manuscript/package-manifest.json`
- `manuscript/tables/`
- `manuscript/figures/`
- `manuscript/supplement/`
- `manuscript/checklists/`

For non-Quarto projects, generate the same package manifest without forcing a conversion; the script writes the `manuscript.qmd` section stub only for `--format quarto`.

## References

@./references/package-manifest-schema.yaml

@./references/quarto-manuscript-template.md

@./references/journal-package-checklist.md
