#!/usr/bin/env python3
"""Generate a traceable Table 1 shell from a methodsmith variables catalog."""

from __future__ import annotations

import argparse
import csv
import json
import re
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
    "cohort",
}
# Exposure rows are excluded: the exposure is the stratifier, not a baseline row.
# Time-varying rows are excluded: baseline means measured at or before time zero.

STYLE_PROFILES = Path(__file__).resolve().parent.parent / "references" / "journal-style-profiles.yaml"
DESIGNS = ("rct", "observational", "descriptive")

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


def _cell(value: object) -> str:
    # csv.DictReader hands overflow cells (a row longer than the header) to the
    # None key as a list; fold them into one string instead of crashing.
    if value is None:
        return ""
    if isinstance(value, list):
        return ", ".join(str(part).strip() for part in value if str(part).strip())
    return str(value).strip()


def load_variables(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return [
            {str(key): _cell(value) for key, value in row.items() if key is not None}
            for row in csv.DictReader(handle)
        ]


def value_for(row: dict[str, str], field: str) -> str:
    for candidate in FIELD_ALIASES.get(field, (field,)):
        if candidate in row and row[candidate]:
            return row[candidate]
    return ""


def baseline_rows(rows: list[dict[str, str]]) -> tuple[list[dict[str, str]], list[str]]:
    """Return baseline rows and the time-varying rows skipped from them."""
    selected: list[dict[str, str]] = []
    skipped: list[str] = []
    for row in rows:
        category = value_for(row, "category").strip().lower()
        if not any(token in category for token in BASELINE_CATEGORIES):
            continue
        if value_for(row, "type").strip().lower() in {"time-varying", "time varying"}:
            skipped.append(value_for(row, "variable"))
            continue
        selected.append(row)
    return selected, skipped


def known_style_profiles(path: Path = STYLE_PROFILES) -> set[str]:
    """Profile keys are the two-space-indented keys under `profiles:`."""
    names: set[str] = set()
    in_profiles = False
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("profiles:"):
            in_profiles = True
        elif in_profiles and line and not line.startswith(" "):
            break
        elif in_profiles and (match := re.match(r"^  ([A-Za-z0-9_-]+):\s*$", line)):
            names.add(match.group(1))
    return names


def comparison_column(design: str, strata: list[str]) -> str:
    """Observational comparisons get an absolute SMD column; trials never get baseline tests."""
    return "abs_smd" if design == "observational" and strata else ""


def write_csv(path: Path, rows: list[dict[str, str]], strata: list[str], comparison: str) -> None:
    fields = ["variable", "label", "category", "type", "levels", "overall", "by_strata"]
    fields += [comparison] if comparison else []
    fields += ["notes"]
    by_strata = f"TBD: compute by {', '.join(strata)}" if strata else "TBD: compute by declared strata"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            variable = value_for(row, "variable")
            record = {
                "variable": variable,
                "label": value_for(row, "description") or variable,
                "category": value_for(row, "category"),
                "type": value_for(row, "type"),
                "levels": value_for(row, "levels"),
                "overall": "TBD: compute from locked analysis dataset",
                "by_strata": by_strata,
                "notes": value_for(row, "notes"),
            }
            if comparison:
                record[comparison] = "TBD: absolute standardized difference"
            writer.writerow(record)


def write_markdown(
    path: Path,
    rows: list[dict[str, str]],
    style_profile: str,
    strata: list[str],
    floor: int,
    design: str,
    comparison: str,
) -> None:
    lines = [
        "# Table 1. Baseline Characteristics",
        "",
        f"Style profile: `{style_profile}`",
        "",
        f"Strata: {', '.join(f'`{s}`' for s in strata) if strata else 'none declared'}",
        "",
        f"Disclosure floor: suppress stratified cells with n<{floor} (and complementary cells recoverable by subtraction).",
        "",
    ]
    if design == "rct":
        lines += ["Comparison: none. Do not report significance tests of baseline differences (CONSORT 2025 item 25).", ""]
    elif comparison:
        lines += ["Comparison: absolute standardized difference; |SMD| > 0.10 flags meaningful imbalance. No p-values.", ""]
    header = ["Variable", "Category", "Type", "Overall", "By strata"] + (["Abs. SMD"] if comparison else []) + ["Notes"]
    lines += ["| " + " | ".join(header) + " |", "|" + "---|" * len(header)]
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
                *(["TBD"] if comparison else []),
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
    parser.add_argument(
        "--design",
        choices=DESIGNS,
        default=None,
        help="rct: no baseline tests; observational: add an absolute SMD column when strata are declared",
    )
    parser.add_argument("--project-root", default=".")
    parser.add_argument(
        "--strata",
        default="",
        help="comma-separated stratification variable(s), e.g. prone_any; recorded in the spec and table shell",
    )
    parser.add_argument(
        "--disclosure-floor",
        type=int,
        default=11,
        help="suppress stratified cells with n below this value (default 11; use the project or DUA floor when stricter)",
    )
    args = parser.parse_args(argv[1:])
    strata = [item.strip() for item in args.strata.split(",") if item.strip()]

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

    profiles = known_style_profiles()
    if args.style_profile not in profiles:
        blockers.append(
            f"Unknown style profile: {args.style_profile} (known: {', '.join(sorted(profiles))})"
        )

    rows = load_variables(variables_path)
    selected, skipped = baseline_rows(rows)
    if not selected:
        blockers.append("Variables catalog contains no fixed baseline/patient/clinical/demographic/cohort rows.")
    if skipped:
        warnings.append(
            "Skipped time-varying rows (baseline = value at or before time zero; add a *_baseline variable instead): "
            + ", ".join(skipped)
        )
    design = args.design or ""
    if not design:
        warnings.append("No study design declared (--design); comparison-column rule (no p-values for RCTs, SMD for observational) not applied.")
    comparison = comparison_column(design, strata)
    if not outputs_path.exists():
        warnings.append(f"Outputs catalog not found: {repo_relative(outputs_path, root)}")
    if not sap_path.exists():
        warnings.append(f"SAP not found: {repo_relative(sap_path, root)}")
    if not strata:
        warnings.append("No stratification variable declared (--strata); stratified columns are not recorded.")
    else:
        catalog_variables = {value_for(row, "variable") for row in rows}
        for stratum in strata:
            if stratum not in catalog_variables:
                warnings.append(f"Stratification variable not found in the variables catalog: {stratum}")

    out_dir.mkdir(parents=True, exist_ok=True)
    spec = {
        "artifact_type": "table1",
        "style_profile": args.style_profile,
        "source_catalog": repo_relative(variables_path, root),
        "sap_path": repo_relative(sap_path, root),
        "outputs_catalog": repo_relative(outputs_path, root),
        "strata": strata,
        "design": design or None,
        "comparison_column": comparison or None,
        "disclosure_floor": {"suppress_below_n": args.disclosure_floor},
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
    write_csv(out_dir / "table1.csv", selected, strata, comparison)
    write_markdown(
        out_dir / "table1.md", selected, args.style_profile, strata, args.disclosure_floor, design, comparison
    )
    write_report(out_dir / "table1-validation-report.md", blockers, warnings, repo_relative(spec_path, root))

    if blockers:
        for blocker in blockers:
            print(f"BLOCK: {blocker}", file=sys.stderr)
        return 1

    print(f"Wrote Table 1 shell to {repo_relative(out_dir, root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
