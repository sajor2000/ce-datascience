#!/usr/bin/env python3
"""Validate the untrusted JSON result produced by an adversarial-review peer."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


MAX_INPUT_BYTES = 64 * 1024
MAX_FINDINGS = 5
MAX_TEXT_LENGTH = 1200
PRIORITIES = {"P0", "P1", "P2", "P3"}
CONFIDENCES = {50, 75, 100}
REQUIRED_FIELDS = {"priority", "confidence", "location", "title", "trigger", "path", "consequence", "recommendation", "evidence"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", required=True, type=Path)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    return parser.parse_args()


def reject(message: str) -> None:
    print(f"Invalid peer artifact: {message}", file=sys.stderr)
    raise SystemExit(2)


def validate_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        reject(f"{field} must be a non-empty string")
    if len(value) > MAX_TEXT_LENGTH:
        reject(f"{field} exceeds {MAX_TEXT_LENGTH} characters")
    if "\x00" in value:
        reject(f"{field} contains a NUL byte")
    return value


def validate_location(value: Any, root: Path) -> str:
    location = validate_text(value, "location")
    match = re.fullmatch(r"([^:\n]+):(\d+)", location)
    if match is None:
        reject("location must be a repository-relative path followed by :line")
    relative_path = Path(match.group(1))
    if relative_path.is_absolute() or ".." in relative_path.parts:
        reject("location must stay within the repository")
    candidate = (root / relative_path).resolve()
    try:
        candidate.relative_to(root)
    except ValueError:
        reject("location resolves outside the repository")
    if not candidate.is_file():
        reject("location file does not exist in the repository")
    return location


def validate_finding(value: Any, root: Path) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != REQUIRED_FIELDS:
        reject("each finding must contain exactly the documented finding fields")
    priority = value["priority"]
    confidence = value["confidence"]
    if priority not in PRIORITIES:
        reject("priority must be P0, P1, P2, or P3")
    if confidence not in CONFIDENCES:
        reject("confidence must be 50, 75, or 100")
    result = {field: validate_text(value[field], field) for field in REQUIRED_FIELDS - {"priority", "confidence", "location"}}
    result["priority"] = priority
    result["confidence"] = confidence
    result["location"] = validate_location(value["location"], root)
    return {field: result[field] for field in sorted(result)}


def main() -> int:
    args = parse_args()
    root = args.repo_root.resolve()
    if not root.is_dir():
        reject("--repo-root must be a directory")
    try:
        raw = args.input.read_bytes()
    except OSError as exc:
        reject(f"cannot read input: {exc}")
    if len(raw) > MAX_INPUT_BYTES:
        reject(f"input exceeds {MAX_INPUT_BYTES} bytes")
    try:
        artifact = json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        reject(f"not valid JSON: {exc}")
    if not isinstance(artifact, dict) or set(artifact) != {"findings", "residual_risks", "verification_gaps"}:
        reject("artifact must contain only findings, residual_risks, and verification_gaps")
    findings = artifact["findings"]
    if not isinstance(findings, list) or len(findings) > MAX_FINDINGS:
        reject(f"findings must be a list of at most {MAX_FINDINGS}")
    for name in ("residual_risks", "verification_gaps"):
        if not isinstance(artifact[name], list) or any(not isinstance(item, str) or len(item) > MAX_TEXT_LENGTH for item in artifact[name]):
            reject(f"{name} must be a list of bounded strings")
    normalized = {
        "findings": [validate_finding(item, root) for item in findings],
        "residual_risks": artifact["residual_risks"],
        "verification_gaps": artifact["verification_gaps"],
    }
    args.output.write_text(json.dumps(normalized, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
