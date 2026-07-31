#!/usr/bin/env python3
"""Insert a markdown or code cell after a tagged Jupyter notebook cell."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Any


def resolve_project_root(value: str | None) -> Path:
    root = Path(value or ".").expanduser().resolve()
    if not root.exists() or not root.is_dir():
        raise ValueError(f"Project root does not exist or is not a directory: {root}")
    return root


def resolve_relative(root: Path, value: str, label: str) -> Path:
    candidate = Path(value)
    if candidate.is_absolute():
        raise ValueError(f"{label} must be a project-relative path: {value}")
    resolved = (root / candidate).resolve()
    if root != resolved and root not in resolved.parents:
        raise ValueError(f"{label} must stay inside the project root: {value}")
    return resolved


def load_nbformat() -> Any | None:
    try:
        import nbformat  # type: ignore

        return nbformat
    except ImportError:
        return None


def basic_validate(notebook: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if notebook.get("nbformat") != 4:
        errors.append("nbformat must be 4")
    if not isinstance(notebook.get("cells"), list):
        errors.append("cells must be a list")
        return errors
    for index, cell in enumerate(notebook["cells"]):
        if not isinstance(cell, dict):
            errors.append(f"cell {index} must be an object")
            continue
        if cell.get("cell_type") not in {"markdown", "code", "raw"}:
            errors.append(f"cell {index} has unsupported cell_type")
        if "metadata" not in cell or not isinstance(cell.get("metadata"), dict):
            errors.append(f"cell {index} metadata must be an object")
        if "source" not in cell:
            errors.append(f"cell {index} missing source")
    return errors


def validate_notebook(notebook: dict[str, Any], nbformat: Any | None) -> list[str]:
    errors = basic_validate(notebook)
    if errors or nbformat is None:
        return errors
    try:
        nbformat.validate(notebook)
    except Exception as exc:  # nbformat raises several schema-specific exceptions
        return [f"nbformat validation failed: {exc}"]
    return []


def cell_tags(cell: dict[str, Any]) -> list[str]:
    metadata = cell.get("metadata")
    if not isinstance(metadata, dict):
        return []
    tags = metadata.get("tags")
    if not isinstance(tags, list):
        return []
    return [tag for tag in tags if isinstance(tag, str)]


def make_cell(cell_type: str, source: str, tags: list[str]) -> dict[str, Any]:
    cell: dict[str, Any] = {
        "cell_type": cell_type,
        "metadata": {"tags": tags},
        "source": source,
    }
    if cell_type == "code":
        cell["execution_count"] = None
        cell["outputs"] = []
    return cell


def write_report(report_path: Path, lines: list[str]) -> None:
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", default=".", help="Project root for resolving relative paths")
    parser.add_argument("--notebook", required=True, help="Project-relative .ipynb path")
    parser.add_argument("--tag", required=True, help="Unique anchor tag in cell.metadata.tags")
    parser.add_argument("--source", required=True, help="Project-relative file containing the new cell source")
    parser.add_argument(
        "--markdown-source",
        help="Project-relative Markdown source required when inserting a code cell",
    )
    parser.add_argument("--cell-type", choices=["markdown", "code"], default="code")
    parser.add_argument("--new-tag", action="append", default=[], help="Tag to add to the inserted cell")
    parser.add_argument("--backup-suffix", default=".bak", help="Suffix for the pre-edit backup")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        root = resolve_project_root(args.project_root)
        notebook_path = resolve_relative(root, args.notebook, "--notebook")
        source_path = resolve_relative(root, args.source, "--source")
        markdown_source_path = (
            resolve_relative(root, args.markdown_source, "--markdown-source")
            if args.markdown_source
            else None
        )
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if notebook_path.suffix != ".ipynb":
        print("--notebook must point to a .ipynb file", file=sys.stderr)
        return 2
    if not notebook_path.exists():
        print(f"Notebook not found: {notebook_path.relative_to(root)}", file=sys.stderr)
        return 1
    if not source_path.exists():
        print(f"Source file not found: {source_path.relative_to(root)}", file=sys.stderr)
        return 1
    if args.cell_type == "code" and markdown_source_path is None:
        print("--markdown-source is required when --cell-type code", file=sys.stderr)
        return 2
    if markdown_source_path is not None and not markdown_source_path.exists():
        print(f"Markdown source file not found: {markdown_source_path.relative_to(root)}", file=sys.stderr)
        return 1

    markdown_source: str | None = None
    if args.cell_type == "code":
        assert markdown_source_path is not None
        markdown_source = markdown_source_path.read_text(encoding="utf-8")
        if not markdown_source.strip():
            print("--markdown-source must contain explanatory Markdown", file=sys.stderr)
            return 2

    nbformat = load_nbformat()
    warning_lines: list[str] = []
    if nbformat is None:
        warning = (
            "nbformat is not installed; used JSON structural validation only. "
            "Install the latest release with `python3 -m pip install --upgrade nbformat` for full notebook schema validation."
        )
        warning_lines.append(f"WARN: {warning}")
        print(f"WARN: {warning}", file=sys.stderr)

    try:
        notebook = json.loads(notebook_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"Notebook JSON is invalid: {exc}", file=sys.stderr)
        return 1

    validation_errors = validate_notebook(notebook, nbformat)
    if validation_errors:
        print("Notebook failed pre-edit validation:", file=sys.stderr)
        for error in validation_errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    matches = [
        index
        for index, cell in enumerate(notebook["cells"])
        if isinstance(cell, dict) and args.tag in cell_tags(cell)
    ]
    if len(matches) != 1:
        print(f"Anchor tag {args.tag!r} matched {len(matches)} cells; expected exactly 1", file=sys.stderr)
        return 1

    source = source_path.read_text(encoding="utf-8")
    new_tags = args.new_tag or [f"inserted-after-{args.tag}"]
    insert_index = matches[0] + 1
    if args.cell_type == "code":
        assert markdown_source is not None
        notebook["cells"].insert(
            insert_index,
            make_cell("markdown", markdown_source, [f"{new_tags[0]}-documentation"]),
        )
        insert_index += 1
    notebook["cells"].insert(insert_index, make_cell(args.cell_type, source, new_tags))

    post_validation_errors = validate_notebook(notebook, nbformat)
    if post_validation_errors:
        print("Notebook failed post-edit validation:", file=sys.stderr)
        for error in post_validation_errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    backup_path = notebook_path.with_name(notebook_path.name + args.backup_suffix)
    shutil.copy2(notebook_path, backup_path)
    notebook_path.write_text(json.dumps(notebook, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    report_path = notebook_path.with_suffix(".edit-report.md")
    report_lines = [
        "# Notebook Edit Report",
        "",
        f"Notebook: `{notebook_path.relative_to(root)}`",
        f"Backup: `{backup_path.relative_to(root)}`",
        f"Inserted after tag: `{args.tag}`",
        f"Inserted cell type: `{args.cell_type}`",
        f"Inserted cell tags: `{', '.join(new_tags)}`",
        "",
        "Result: EDITED-WITH-REVIEW",
    ]
    report_lines.extend(["", *warning_lines] if warning_lines else [])
    write_report(report_path, report_lines)

    print(
        "__CE_NOTEBOOK_EDIT__ "
        f"notebook={notebook_path.relative_to(root)} "
        f"inserted_after={args.tag} "
        f"documentation={'inserted' if args.cell_type == 'code' else 'not-applicable'} "
        f"backup={backup_path.relative_to(root)} "
        f"report={report_path.relative_to(root)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
