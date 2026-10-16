#!/usr/bin/env python3
"""Build a manuscript package manifest from methodsmith publication artifacts."""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
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
    parser.add_argument("--number-gate", help="method-numbers CLI path; default: the project-local analysis/numbers/method_numbers.py helper")
    parser.add_argument("--number-input", action="append", help="project-relative manuscript or aggregate table; repeat for multiple inputs")
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

    number_gate = Path(args.number_gate).resolve() if args.number_gate else root / "analysis/numbers/method_numbers.py"
    inputs = args.number_input
    if inputs is None:
        inputs = [repo_relative(p, root) for directory in (out_dir, table1_path.parent, figure_path.parent)
                  if directory.exists() for p in sorted(directory.rglob("*"))
                  if p.is_file() and p.suffix.lower() in {".md", ".qmd", ".rmd", ".csv", ".tsv", ".docx"}
                  and p.name != "package-readiness-report.md"]
    number_status = "FAIL"
    if not number_gate.is_file():
        blockers.append("Number gate unavailable: install the project helper or pass --number-gate.")
    elif any(not safe_relative(value) for value in inputs):
        blockers.append("Number gate inputs must be project-relative without '..'.")
    else:
        try:
            with tempfile.TemporaryDirectory(prefix="method-package-captions-") as scratch:
                caption_inputs = []
                for index, figure in enumerate(figures):
                    text = "\n".join(str(figure.get(key, "")) for key in ("caption", "alt_text"))
                    if text.strip():
                        caption = Path(scratch) / f"caption-{index}.md"
                        caption.write_text(text, encoding="utf-8")
                        caption_inputs.append(str(caption))
                gate = subprocess.run([sys.executable, str(number_gate), "check", *inputs, *caption_inputs],
                                      cwd=root, capture_output=True, text=True, timeout=120)
            # Exit status and the PASS summary must both agree; absence is never a pass.
            if gate.returncode == 0 and any(line.startswith("PASS:") for line in gate.stdout.splitlines()):
                number_status = "PASS"
            else:
                blockers.append("Number gate failed; correct the manuscript sources and rerun method-numbers check.")
        except (OSError, subprocess.SubprocessError, UnicodeError):
            blockers.append("Number gate could not run; package remains blocked.")

    manifest = {
        "package_id": out_dir.name,
        "format": args.format,
        "sap_path": repo_relative(sap_path, root),
        "tables": [repo_relative(table1_path, root)] if table1_path.exists() else [],
        "figures": [repo_relative(figure_path, root)] if figure_path.exists() else [],
        "checklists": [],
        "registry_packages": [],
        "reproducibility": [],
        "number_gate": {"status": number_status, "inputs": inputs},
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
