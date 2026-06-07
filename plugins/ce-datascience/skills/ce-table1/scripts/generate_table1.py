#!/usr/bin/env python3
"""Generate a traceable Table 1 shell from a ce-datascience variables catalog."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

BASELINE_CATEGORIES = {
    "baseline",
    "patient characteristic",
    "patient characteristics",
    "clinical characteristic",
    "clinical characteristics",
    "demographic",
    "demographics",
    "exposure",
    "cohort",
}

FIELD_ALIASES = {
    "category": ("category", "Category"),
    "variable": ("variable", "Variable"),
    "description": ("description", "Description"),
    "type": ("type", "Type"),
    "levels": ("levels", "Levels", "Format / Values", "format / values"),
    "notes": ("notes", "Notes"),
}


def repo_relative(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def validate_relative_path(value: str, field: str) -> Path:
    path = Path(value)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"{field} must be a project-relative path without '..': {value}")
    return path


def load_variables(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [{key: (value or "").strip() for key, value in row.items()} for row in csv.DictReader(handle)]


def value_for(row: dict[str, str], field: str) -> str:
    for candidate in FIELD_ALIASES.get(field, (field,)):
        if candidate in row and row[candidate]:
            return row[candidate]
    return ""


def baseline_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    selected: list[dict[str, str]] = []
    for row in rows:
        category = value_for(row, "category").strip().lower()
        if any(token in category for token in BASELINE_CATEGORIES):
            selected.append(row)
    return selected


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    fields = ["variable", "label", "category", "type", "levels", "overall", "by_strata", "notes"]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            variable = value_for(row, "variable")
            writer.writerow({
                "variable": variable,
                "label": value_for(row, "description") or variable,
                "category": value_for(row, "category"),
                "type": value_for(row, "type"),
                "levels": value_for(row, "levels"),
                "overall": "TBD: compute from locked analysis dataset",
                "by_strata": "TBD: compute by declared strata",
                "notes": value_for(row, "notes"),
            })


def write_markdown(path: Path, rows: list[dict[str, str]], style_profile: str) -> None:
    lines = [
        "# Table 1. Baseline Characteristics",
        "",
        f"Style profile: `{style_profile}`",
        "",
        "| Variable | Category | Type | Overall | By strata | Notes |",
        "|---|---|---|---|---|---|",
    ]
    for row in rows:
        label = value_for(row, "description") or value_for(row, "variable")
        lines.append(
            "| "
            + " | ".join([
                label,
                value_for(row, "category"),
                value_for(row, "type"),
                "TBD",
                "TBD",
                value_for(row, "notes"),
            ])
            + " |"
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_report(path: Path, blockers: list[str], warnings: list[str], spec_path: str) -> None:
    lines = ["# Table 1 Validation Report", ""]
    lines.append(f"Result: {'BLOCKED' if blockers else 'READY-WITH-REVIEW'}")
    lines.append("")
    lines.append(f"Spec: `{spec_path}`")
    lines.append("")
    lines.append("## Blockers")
    lines.extend([f"- {item}" for item in blockers] or ["- None"])
    lines.append("")
    lines.append("## Warnings")
    lines.extend([f"- {item}" for item in warnings] or ["- None"])
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--variables", default="analysis/sap-tables/03-variables.csv")
    parser.add_argument("--outputs", default="analysis/sap-tables/02-outputs.csv")
    parser.add_argument("--sap", default="analysis/sap.md")
    parser.add_argument("--out-dir", default="analysis/publication/tables")
    parser.add_argument("--style-profile", default="jama")
    parser.add_argument("--project-root", default=".")
    args = parser.parse_args(argv[1:])

    try:
      # Validate user-provided paths before resolving them.
        variables_rel = validate_relative_path(args.variables, "--variables")
        outputs_rel = validate_relative_path(args.outputs, "--outputs")
        sap_rel = validate_relative_path(args.sap, "--sap")
        out_dir_rel = validate_relative_path(args.out_dir, "--out-dir")
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2

    root = Path(args.project_root).resolve()
    variables_path = root / variables_rel
    outputs_path = root / outputs_rel
    sap_path = root / sap_rel
    out_dir = root / out_dir_rel

    blockers: list[str] = []
    warnings: list[str] = []

    if not variables_path.exists():
        blockers.append(f"Variables catalog not found: {repo_relative(variables_path, root)}")
        out_dir.mkdir(parents=True, exist_ok=True)
        write_report(out_dir / "table1-validation-report.md", blockers, warnings, "table1-spec.json")
        return 1

    rows = load_variables(variables_path)
    selected = baseline_rows(rows)
    if not selected:
        blockers.append("Variables catalog contains no baseline/patient/clinical/demographic/cohort rows.")
    if not outputs_path.exists():
        warnings.append(f"Outputs catalog not found: {repo_relative(outputs_path, root)}")
    if not sap_path.exists():
        warnings.append(f"SAP not found: {repo_relative(sap_path, root)}")

    out_dir.mkdir(parents=True, exist_ok=True)
    spec = {
        "artifact_type": "table1",
        "style_profile": args.style_profile,
        "source_catalog": repo_relative(variables_path, root),
        "sap_path": repo_relative(sap_path, root),
        "outputs_catalog": repo_relative(outputs_path, root),
        "rows": [
            {
                "variable": value_for(row, "variable"),
                "category": value_for(row, "category"),
                "description": value_for(row, "description") or value_for(row, "variable"),
                "type": value_for(row, "type"),
                "levels": value_for(row, "levels"),
            }
            for row in selected
        ],
        "status": "blocked" if blockers else "ready-with-review",
    }
    spec_path = out_dir / "table1-spec.json"
    spec_path.write_text(json.dumps(spec, indent=2) + "\n", encoding="utf-8")
    write_csv(out_dir / "table1.csv", selected)
    write_markdown(out_dir / "table1.md", selected, args.style_profile)
    write_report(out_dir / "table1-validation-report.md", blockers, warnings, repo_relative(spec_path, root))

    if blockers:
        for blocker in blockers:
            print(f"BLOCK: {blocker}", file=sys.stderr)
        return 1

    print(f"Wrote Table 1 shell to {repo_relative(out_dir, root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
