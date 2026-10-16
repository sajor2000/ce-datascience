#!/usr/bin/env python3
"""Validate a preregistration package directory before registry hand-entry."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ALLOWED_REGISTRIES = {
    "clinicaltrials": ["brief_title", "brief_summary", "primary_outcomes", "eligibility_criteria", "sponsor"],
    "osf": ["description", "hypotheses", "sampling_plan", "analysis_plan"],
    "prospero": ["review_question", "search_strategy", "participants", "outcomes", "synthesis_plan"],
    "aspredicted": ["research_question", "hypothesis", "dependent_variable", "conditions", "analyses"],
}
COMMON_REQUIRED = ["registry", "title", "study_type", "sap_version", "generated_at", "fields"]
# PROSPERO requires registration before data extraction (or receipt of IPD) starts.
PROSPERO_LATE_STAGE = re.compile(r"extraction|\bIPD\b|risk.of.bias|synthesis|complete", re.IGNORECASE)
PLACEHOLDER_PATTERNS = [re.compile(r"<[^>]+>"), re.compile(r"\bTBD\b", re.IGNORECASE), re.compile(r"\bTODO\b", re.IGNORECASE)]


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


def flatten_strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        strings: list[str] = []
        for item in value:
            strings.extend(flatten_strings(item))
        return strings
    if isinstance(value, dict):
        strings = []
        for item in value.values():
            strings.extend(flatten_strings(item))
        return strings
    return []


def has_value(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict)):
        return bool(value)
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", default=".", help="Project root for resolving relative paths")
    parser.add_argument("--package-dir", required=True, help="Project-relative preregistration package directory")
    parser.add_argument("--registry", choices=sorted(ALLOWED_REGISTRIES), help="Expected registry name")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        root = resolve_project_root(args.project_root)
        package_dir = resolve_relative(root, args.package_dir, "--package-dir")
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    blocks: list[str] = []
    warnings: list[str] = []

    if not package_dir.exists() or not package_dir.is_dir():
        print(f"Package directory not found: {package_dir.relative_to(root)}", file=sys.stderr)
        return 1

    form_path = package_dir / "form.md"
    payload_path = package_dir / "payload.json"
    if not form_path.exists():
        blocks.append("Missing required file: form.md")
        form_text = ""
    else:
        form_text = form_path.read_text(encoding="utf-8")
    if not payload_path.exists():
        blocks.append("Missing required file: payload.json")
        payload: dict[str, Any] = {}
    else:
        try:
            payload = json.loads(payload_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            blocks.append(f"payload.json is invalid JSON: {exc}")
            payload = {}

    registry = str(payload.get("registry", "")).lower()
    if args.registry and registry and args.registry != registry:
        blocks.append(f"Registry mismatch: expected {args.registry}, payload has {registry}")
    registry = args.registry or registry
    if registry not in ALLOWED_REGISTRIES:
        blocks.append(f"Unsupported or missing registry: {registry or '(missing)'}")

    for field in COMMON_REQUIRED:
        if not has_value(payload.get(field)):
            blocks.append(f"payload.json missing required field: {field}")

    fields = payload.get("fields", {})
    if not isinstance(fields, dict):
        blocks.append("payload.json field `fields` must be an object")
        fields = {}
    if registry in ALLOWED_REGISTRIES:
        for field in ALLOWED_REGISTRIES[registry]:
            if not has_value(fields.get(field)):
                blocks.append(f"payload.fields missing required {registry} field: {field}")

    sap_status = str(payload.get("sap_status", "")).strip().lower()
    if sap_status == "draft":
        blocks.append("payload.sap_status is draft; the SAP must be locked (final or amended) before registration")
    elif not sap_status:
        warnings.append("payload.sap_status not recorded; confirm the SAP is locked")
    blinding_state = str(payload.get("blinding_state", "")).strip().lower()
    if blinding_state == "unblinded":
        blocks.append("payload.blinding_state is unblinded; comparative data must not be unblinded before registration")
    elif not blinding_state:
        warnings.append("payload.blinding_state not recorded; confirm comparative data are still blinded")

    if registry == "prospero":
        stage = str(fields.get("review_stage", "")).strip()
        if not stage:
            warnings.append("payload.fields.review_stage not recorded; PROSPERO requires registration before data extraction starts")
        elif PROSPERO_LATE_STAGE.search(stage):
            blocks.append(
                f"PROSPERO review_stage '{stage}' is too late: register before data extraction or IPD receipt starts, or register on OSF and disclose the timing"
            )

    if form_text and "PRE-REGISTRATION CHECKLIST" not in form_text:
        warnings.append("form.md does not contain a PRE-REGISTRATION CHECKLIST heading")
    if not (package_dir / "sap-snapshot.md").exists() and not has_value(payload.get("sap_hash")):
        warnings.append("No sap-snapshot.md or payload.sap_hash found; registry package traceability is weaker")

    placeholder_sources = [form_text, *flatten_strings(payload)]
    for text in placeholder_sources:
        for pattern in PLACEHOLDER_PATTERNS:
            match = pattern.search(text)
            if match:
                blocks.append(f"Unresolved placeholder found: {match.group(0)}")
                break

    report_path = package_dir / "registry-validation-report.md"
    result = "READY-WITH-REVIEW" if not blocks else "BLOCKED"
    report_lines = [
        "# Registry Package Validation Report",
        "",
        f"Package: `{package_dir.relative_to(root)}`",
        f"Registry: `{registry or '(missing)'}`",
        f"Result: {result}",
        "",
        "## Blocking Findings",
    ]
    report_lines.extend([f"- {item}" for item in blocks] or ["- None"])
    report_lines.extend(["", "## Warnings"])
    report_lines.extend([f"- {item}" for item in warnings] or ["- None"])
    report_path.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print(f"__CE_PREREG_VALIDATE__ package={package_dir.relative_to(root)} result={result} report={report_path.relative_to(root)}")
    return 0 if not blocks else 1


if __name__ == "__main__":
    raise SystemExit(main())
