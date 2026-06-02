#!/usr/bin/env python3
"""Validate a ce-datascience publication figure manifest."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED_FIELDS = [
    "figure_id",
    "sap_section",
    "source_data",
    "source_code",
    "output_path",
    "caption",
    "alt_text",
    "style_profile",
]

PUBLICATION_SUFFIXES = {".pdf", ".eps", ".svg", ".tif", ".tiff", ".png", ".jpg", ".jpeg"}


def is_safe_relative(value: str) -> bool:
    path = Path(value)
    return not path.is_absolute() and ".." not in path.parts


def repo_relative(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", default="analysis/publication/figures/figure-manifest.json")
    parser.add_argument("--project-root", default=".")
    parser.add_argument("--report", default="")
    args = parser.parse_args(argv[1:])

    if not is_safe_relative(args.manifest):
        print("Error: --manifest must be a project-relative path without '..'", file=sys.stderr)
        return 2

    root = Path(args.project_root).resolve()
    manifest_path = root / args.manifest
    report_path = root / args.report if args.report else manifest_path.with_name("figure-validation-report.md")

    blockers: list[str] = []
    warnings: list[str] = []

    if not manifest_path.exists():
        blockers.append(f"Manifest not found: {repo_relative(manifest_path, root)}")
        figures: list[dict] = []
    else:
        try:
            payload = json.loads(manifest_path.read_text(encoding="utf-8"))
            figures = payload.get("figures", [])
        except Exception as exc:
            blockers.append(f"Manifest is not valid JSON: {exc}")
            figures = []

    if not isinstance(figures, list):
        blockers.append("Manifest field 'figures' must be a list.")
        figures = []

    seen_ids: set[str] = set()
    for index, figure in enumerate(figures, start=1):
        if not isinstance(figure, dict):
            blockers.append(f"Figure entry {index} must be an object.")
            continue
        figure_id = str(figure.get("figure_id", f"entry-{index}")).strip()
        if figure_id in seen_ids:
            blockers.append(f"Duplicate figure_id: {figure_id}")
        seen_ids.add(figure_id)

        for field in REQUIRED_FIELDS:
            if not str(figure.get(field, "")).strip():
                blockers.append(f"{figure_id}: missing required field '{field}'")

        for field in ("source_data", "source_code", "output_path"):
            value = str(figure.get(field, "")).strip()
            if not value:
                continue
            if not is_safe_relative(value):
                blockers.append(f"{figure_id}: {field} must be project-relative without '..': {value}")
                continue
            resolved = root / value
            if not resolved.exists():
                blockers.append(f"{figure_id}: {field} does not exist: {value}")

        output_path = str(figure.get("output_path", "")).strip()
        if output_path and Path(output_path).suffix.lower() not in PUBLICATION_SUFFIXES:
            warnings.append(f"{figure_id}: output format is not a common publication format: {output_path}")

        if not figure.get("checklist_items"):
            warnings.append(f"{figure_id}: no reporting checklist item linked.")

    report_lines = [
        "# Figure Validation Report",
        "",
        f"Result: {'BLOCKED' if blockers else 'READY-WITH-REVIEW'}",
        "",
        f"Manifest: `{repo_relative(manifest_path, root)}`",
        "",
        "## Blockers",
        *([f"- {item}" for item in blockers] or ["- None"]),
        "",
        "## Warnings",
        *([f"- {item}" for item in warnings] or ["- None"]),
    ]
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    if blockers:
        for blocker in blockers:
            print(f"BLOCK: {blocker}", file=sys.stderr)
        return 1
    print(f"Figure manifest ready with review: {repo_relative(manifest_path, root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
