---
name: ce-marimo
description: "Create, modify, validate, or review Marimo reactive Python notebooks for data-science and research workflows. Use for marimo.App notebooks, reactive cells, UI widgets, PEP 723 dependencies, notebook export, or Marimo execution errors."
argument-hint: "[new|edit|validate|export]"
---

# Marimo Research Notebooks

## Skill Value

- **Problem it solves:** Reactive notebooks can hide dependency, mutation, and execution-order mistakes when treated like plain Python scripts or Jupyter JSON.
- **Use when:** The project has `import marimo`, a Marimo `.py` notebook, or the user asks for a reactive Python research notebook.
- **Output:** A text-native Marimo notebook or bounded edit, with declared dependencies, validation results, and reproducibility notes.
- **Ask only if:** The intended output, data source, or new-versus-existing-notebook boundary is unclear.
- **Do not do:** Do not silently convert a Jupyter notebook, fabricate unavailable data, or use broad exception handling to hide a failed cell.

## Workflow

1. Inspect existing project evidence. Reuse the project's Marimo and Python environment when present; otherwise state the proposed dependency method before creating files.
2. For a new notebook, create a text-native `.py` file with `import marimo as mo`, `app = mo.App(...)`, and explicit `@app.cell` functions.
3. Keep data loading, transformation, modeling, and reporting in separate cells with clear returned values. Let dependencies be visible through cell inputs and outputs.
4. Treat widgets as user inputs, not hidden defaults. In script mode, use declared test/config inputs only; do not replace failed production sources with synthetic data.
5. Keep mutable state out of cross-cell objects when a pure derived value can represent the same result.
6. Run `marimo check <notebook.py>` through the project runner when available, then execute the notebook's non-interactive path or report the validation gap.
7. Use `/ce-data-qa`, `/ce-plan`, and `/ce-code-review` for analytical work inside the notebook; Marimo structure does not waive the data or method gates.

## Existing notebooks

- For a bounded edit to an existing Marimo `.py` notebook, preserve the app structure and modify only the requested cells.
- Prefer `/ce-notebook-edit` when the target is Jupyter `.ipynb`; do not treat JSON notebook cells as Marimo functions.
- Keep PEP 723 dependency metadata, if present, synchronized with imports. Do not pin or install packages unless the user asks.

## Fail-loud rules

- Do not wrap ordinary reactive dependencies in broad `try/except` blocks.
- Do not gate output rendering behind unnecessary conditional cells.
- Surface missing files, invalid schemas, and failed assertions directly with the failed boundary and recovery options.
