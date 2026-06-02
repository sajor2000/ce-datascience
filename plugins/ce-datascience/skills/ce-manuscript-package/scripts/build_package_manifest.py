#!/usr/bin/env python3
"""Build a manuscript package manifest from ce-datascience publication artifacts."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def safe_relative(value: str) -> bool:
    path = Path(value)
    return not path.is_absolute() and ".." not in path.parts


def repo_relative(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", default=".")
    parser.add_argument("--out-dir", default="manuscript")
    parser.add_argument("--format", default="quarto")
    parser.add_argument("--sap", default="analysis/sap.md")
    parser.add_argument("--table1-spec", default="analysis/publication/tables/table1-spec.json")
    parser.add_argument("--figure-manifest", default="analysis/publication/figures/figure-manifest.json")
    args = parser.parse_args(argv[1:])

    for field_name in ("out_dir", "sap", "table1_spec", "figure_manifest"):
        value = getattr(args, field_name)
        if not safe_relative(value):
            print(f"Error: --{field_name.replace('_', '-')} must be project-relative without '..'", file=sys.stderr)
            return 2

    root = Path(args.project_root).resolve()
    out_dir = root / args.out_dir
    sap_path = root / args.sap
    table1_path = root / args.table1_spec
    figure_path = root / args.figure_manifest
    out_dir.mkdir(parents=True, exist_ok=True)

    blockers: list[str] = []
    warnings: list[str] = []

    if not sap_path.exists():
        blockers.append(f"SAP not found: {repo_relative(sap_path, root)}")
    if not table1_path.exists():
        blockers.append(f"Table 1 spec not found: {repo_relative(table1_path, root)}")
    if not figure_path.exists():
        blockers.append(f"Figure manifest not found: {repo_relative(figure_path, root)}")

    table1 = load_json(table1_path)
    figures = load_json(figure_path).get("figures", []) if figure_path.exists() else []
    if table1.get("status") == "blocked":
        blockers.append("Table 1 spec status is blocked.")
    if not figures:
        warnings.append("No figures listed in the figure manifest.")

    manifest = {
        "package_id": out_dir.name,
        "format": args.format,
        "sap_path": repo_relative(sap_path, root),
        "tables": [repo_relative(table1_path, root)] if table1_path.exists() else [],
        "figures": [repo_relative(figure_path, root)] if figure_path.exists() else [],
        "checklists": [],
        "registry_packages": [],
        "reproducibility": [],
        "readiness": "blocked" if blockers else "ready-with-review",
        "blockers": blockers,
        "warnings": warnings,
    }

    manifest_path = out_dir / "package-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    if args.format.lower() == "quarto":
        qmd = out_dir / "manuscript.qmd"
        if not qmd.exists():
            qmd.write_text(
                "---\ntitle: \"Manuscript Draft\"\nformat:\n  html: default\n  docx: default\n---\n\n"
                "# Abstract\n\nTBD.\n\n# Methods\n\nTBD.\n\n# Results\n\nTBD.\n",
                encoding="utf-8",
            )

    report_lines = [
        "# Manuscript Package Readiness Report",
        "",
        f"Result: {manifest['readiness'].upper()}",
        "",
        f"Manifest: `{repo_relative(manifest_path, root)}`",
        "",
        "## Blockers",
        *([f"- {item}" for item in blockers] or ["- None"]),
        "",
        "## Warnings",
        *([f"- {item}" for item in warnings] or ["- None"]),
    ]
    (out_dir / "package-readiness-report.md").write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    if blockers:
        for blocker in blockers:
            print(f"BLOCK: {blocker}", file=sys.stderr)
        return 1
    print(f"Wrote manuscript package manifest to {repo_relative(manifest_path, root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
