#!/usr/bin/env python3
"""Validate and synthesize a strictly aggregate, independent-unit meta-analysis.

The input is JSON only.  It must contain aggregate effects and standard errors,
not participant-level records.  All paths are supplied by command-line options.

Methods:
  common  Inverse-variance common-effect synthesis, implemented with Python's
          standard library.
  pm      Paule-Mandel random-effects synthesis through
          statsmodels.stats.meta_analysis.combine_effects(method_re="iterated").
          This is not REML.  Its reported interval is the documented random-
          effects estimated-scale (HKSJ/WLS) t interval, selected explicitly
          with conf_int(use_t=True)[3].

No prediction interval, Egger test, patient-data reader, custom REML estimator,
or silent input filtering is implemented.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import sys
import tempfile
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "1.0"
CONTRACT_FIELDS = (
    "effect_measure",
    "analysis_scale",
    "estimand",
    "outcome",
    "time_horizon",
    "model",
    "adjustment_specification",
    "analysis_version",
    "precision_weighting_estimand",
    "independence_assertion",
)
TOP_LEVEL_FIELDS = {"schema_version", "analysis_contract", "units"}
UNIT_FIELDS = {
    "analysis_unit_id",
    "site_id",
    "study_id",
    *CONTRACT_FIELDS,
    "status",
    "effect",
    "standard_error",
    "status_reason",
    "release_status",
    "release_review_reference",
}
ALLOWED_STATUSES = {"usable", "excluded", "failed", "suppressed", "missing"}
REVIEWED_INDEPENDENCE_ASSERTION = "reviewed_disjoint_independent"
NORMAL_975 = 1.959963984540054
IDENTIFIER_PATTERN = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-"


class ContractError(ValueError):
    """An input is not a valid aggregate meta-analysis contract."""


def fail(message: str) -> None:
    raise ContractError(message)


def require_exact_keys(value: Any, expected: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{label} must be an object")
    actual = set(value)
    missing = sorted(expected - actual)
    unknown = sorted(actual - expected)
    if missing or unknown:
        parts = []
        if missing:
            parts.append(f"missing: {', '.join(missing)}")
        if unknown:
            parts.append(f"unknown: {', '.join(unknown)}")
        fail(f"{label} has an invalid schema ({'; '.join(parts)})")
    return value


def require_nonempty_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} must be a non-empty string")
    return value


def require_identifier(value: Any, label: str) -> str:
    identifier = require_nonempty_string(value, label)
    if any(character not in IDENTIFIER_PATTERN for character in identifier):
        fail(f"{label} must use only ASCII letters, digits, '.', '_', or '-'")
    return identifier


def require_finite_number(value: Any, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        fail(f"{label} must be a JSON number")
    number = float(value)
    if not math.isfinite(number):
        fail(f"{label} must be finite")
    return number


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def load_input(path: Path) -> tuple[dict[str, Any], str]:
    try:
        raw = path.read_bytes()
    except OSError as exc:
        raise ContractError(f"cannot read input {path}: {exc}") from exc
    try:
        payload = json.loads(
            raw.decode("utf-8"),
            parse_constant=lambda token: (_ for _ in ()).throw(ValueError(token)),
            object_pairs_hook=reject_duplicate_keys,
        )
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        raise ContractError(f"input must be UTF-8 JSON without NaN or Infinity: {exc}") from exc
    return payload, hashlib.sha256(raw).hexdigest()


def validate_weight_stability(usable_units: list[dict[str, Any]]) -> None:
    weights: list[float] = []
    for unit in usable_units:
        standard_error = unit["standard_error"]
        variance = standard_error * standard_error
        if not math.isfinite(variance) or variance <= 0.0:
            fail(f"{unit['analysis_unit_id']}: standard_error squared is numerically unsafe")
        weight = 1.0 / variance
        if not math.isfinite(weight) or weight <= 0.0:
            fail(f"{unit['analysis_unit_id']}: inverse variance overflows or underflows")
        weights.append(weight)
    total_weight = math.fsum(weights)
    if not math.isfinite(total_weight) or total_weight <= 0.0:
        fail("inverse-variance weight total overflows or underflows")
    if any(weight / total_weight == 0.0 for weight in weights):
        fail("inverse-variance weight ratios underflow; rescale or use a numerically stable analysis")


def validate_input(payload: Any) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    root = require_exact_keys(payload, TOP_LEVEL_FIELDS, "root")
    if root["schema_version"] != SCHEMA_VERSION:
        fail(f"schema_version must be {SCHEMA_VERSION!r}")

    contract = require_exact_keys(root["analysis_contract"], set(CONTRACT_FIELDS), "analysis_contract")
    for field in CONTRACT_FIELDS:
        require_nonempty_string(contract[field], f"analysis_contract.{field}")
    if contract["independence_assertion"] != REVIEWED_INDEPENDENCE_ASSERTION:
        fail(
            "analysis_contract.independence_assertion must be "
            f"{REVIEWED_INDEPENDENCE_ASSERTION!r}; unknown or unreviewed overlap is not poolable"
        )
    if "inverse-variance" not in contract["precision_weighting_estimand"].lower():
        fail("analysis_contract.precision_weighting_estimand must explicitly declare inverse-variance weighting")

    if not isinstance(root["units"], list) or not root["units"]:
        fail("units must be a non-empty array")

    identifiers = {"analysis_unit_id": set(), "site_id": set(), "study_id": set()}
    usable_units: list[dict[str, Any]] = []
    for row_number, raw_unit in enumerate(root["units"], start=1):
        label = f"units[{row_number}]"
        unit = require_exact_keys(raw_unit, UNIT_FIELDS, label)
        if unit["status"] == "missing":
            if unit["release_status"] != "not_applicable" or unit["release_review_reference"] is not None:
                fail(f"{label}: missing submissions require not_applicable release status and a null review reference")
        else:
            if unit["release_status"] != "approved":
                fail(f"{label}.release_status must be 'approved' before central synthesis")
            require_nonempty_string(unit["release_review_reference"], f"{label}.release_review_reference")
        for identifier in identifiers:
            identifier_value = require_identifier(unit[identifier], f"{label}.{identifier}")
            if identifier_value in identifiers[identifier]:
                fail(f"{label}.{identifier} duplicates {identifier_value!r}")
            identifiers[identifier].add(identifier_value)
        for field in CONTRACT_FIELDS:
            value = require_nonempty_string(unit[field], f"{label}.{field}")
            if value != contract[field]:
                fail(f"{label}.{field} is incompatible with analysis_contract.{field}")

        status = require_nonempty_string(unit["status"], f"{label}.status")
        if status not in ALLOWED_STATUSES:
            fail(f"{label}.status must be one of {sorted(ALLOWED_STATUSES)}")
        if status == "usable":
            if unit["status_reason"] is not None:
                fail(f"{label}.status_reason must be null for a usable unit")
            effect = require_finite_number(unit["effect"], f"{label}.effect")
            standard_error = require_finite_number(unit["standard_error"], f"{label}.standard_error")
            if standard_error <= 0.0:
                fail(f"{label}.standard_error must be strictly positive")
            usable_units.append({
                "analysis_unit_id": unit["analysis_unit_id"],
                "site_id": unit["site_id"],
                "study_id": unit["study_id"],
                "effect": effect,
                "standard_error": standard_error,
            })
        else:
            if unit["effect"] is not None or unit["standard_error"] is not None:
                fail(f"{label}: {status} units must retain null effect and standard_error, never zero-fill them")
            require_nonempty_string(unit["status_reason"], f"{label}.status_reason")

    if len(usable_units) < 2:
        fail("at least two compatible, reviewed-independent usable units are required")
    validate_weight_stability(usable_units)
    return contract, usable_units


def write_validated_tsv(path: Path, usable_units: list[dict[str, Any]]) -> None:
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="", dir=path.parent, delete=False) as handle:
            temporary_path = Path(handle.name)
            writer = csv.DictWriter(
                handle,
                fieldnames=["analysis_unit_id", "site_id", "study_id", "effect", "standard_error"],
                delimiter="\t",
            )
            writer.writeheader()
            writer.writerows(usable_units)
        os.link(temporary_path, path)
        temporary_path.unlink()
    except OSError as exc:
        if "temporary_path" in locals():
            temporary_path.unlink(missing_ok=True)
        raise ContractError(f"cannot write validated artifact {path}: {exc}") from exc


def finite_number(value: float, label: str) -> float:
    if not math.isfinite(value):
        fail(f"{label} is not finite; no output was written")
    return value


def diagnostics(
    usable_units: list[dict[str, Any]], weights: list[float], pooled_effect: float
) -> dict[str, Any]:
    try:
        total_weight = math.fsum(weights)
        relative_weights = [weight / total_weight for weight in weights]
        # Cochran's Q uses common-effect weights and mean even when the fitted
        # synthesis uses random-effects weights. The RE residual sum is not Q.
        common_weights = [1.0 / unit["standard_error"] ** 2 for unit in usable_units]
        common_total = math.fsum(common_weights)
        common_mean = math.fsum(
            weight * unit["effect"] for weight, unit in zip(common_weights, usable_units)
        ) / common_total
        q = math.fsum(
            weight * (unit["effect"] - common_mean) ** 2
            for weight, unit in zip(common_weights, usable_units)
        )
    except (OverflowError, ValueError) as exc:
        raise ContractError(f"diagnostic calculation overflowed: {exc}") from exc
    if not math.isfinite(total_weight) or any(not math.isfinite(weight) for weight in relative_weights):
        fail("diagnostic inverse-variance weights are not finite")
    finite_number(q, "Q")
    degrees_freedom = len(usable_units) - 1
    i2_percent = 0.0 if q == 0.0 else max(0.0, (q - degrees_freedom) / q * 100.0)
    return {
        "q": q,
        "degrees_freedom": degrees_freedom,
        "i2_percent": finite_number(i2_percent, "I2"),
        "weights": [
            {"analysis_unit_id": unit["analysis_unit_id"], "relative_weight": weight}
            for unit, weight in zip(usable_units, relative_weights)
        ],
    }


def common_effect(usable_units: list[dict[str, Any]]) -> dict[str, Any]:
    try:
        weights = [1.0 / (unit["standard_error"] ** 2) for unit in usable_units]
        total_weight = math.fsum(weights)
        weighted_effects = [weight * unit["effect"] for weight, unit in zip(weights, usable_units)]
        if any(not math.isfinite(value) for value in weighted_effects):
            fail("weighted effects overflow or underflow; no output was written")
        pooled_effect = math.fsum(weighted_effects) / total_weight
        standard_error = math.sqrt(1.0 / total_weight)
        confidence_interval = [
            pooled_effect - NORMAL_975 * standard_error,
            pooled_effect + NORMAL_975 * standard_error,
        ]
    except (OverflowError, ValueError, ZeroDivisionError) as exc:
        raise ContractError(f"common-effect calculation failed numerically: {exc}") from exc
    return {
        "method": "common_effect_inverse_variance",
        "interval_method": "normal_95_percent",
        "pooled_effect": finite_number(pooled_effect, "pooled_effect"),
        "standard_error": finite_number(standard_error, "standard_error"),
        "confidence_interval_95": [finite_number(value, "common-effect confidence interval") for value in confidence_interval],
        "diagnostics": diagnostics(usable_units, weights, pooled_effect),
        "warnings": [
            "k <= 4: heterogeneity estimates and normal-approximation inference are especially unstable."
        ] if len(usable_units) <= 4 else [],
    }


def paule_mandel(usable_units: list[dict[str, Any]]) -> dict[str, Any]:
    try:
        import numpy as np
        import statsmodels
        from statsmodels.stats.meta_analysis import combine_effects
    except ImportError as exc:
        raise ContractError(
            "method pm requires installed numpy and statsmodels; no package was installed by this template. "
            "Use an environment with statsmodels or select another pre-specified scientifically appropriate method."
        ) from exc
    effects = np.asarray([unit["effect"] for unit in usable_units], dtype=float)
    variances = np.asarray([unit["standard_error"] ** 2 for unit in usable_units], dtype=float)
    result = combine_effects(
        effects,
        variances,
        method_re="iterated",
        row_names=[unit["analysis_unit_id"] for unit in usable_units],
        use_t=True,
    )
    ci_re_hksj = result.conf_int(use_t=True)[3]
    weights = [float(weight) for weight in result.weights_re]
    output = {
        "method": "random_effects_paule_mandel",
        "tau2_estimator": "Paule-Mandel iterative (statsmodels method_re='iterated'), not REML",
        "interval_method": "statsmodels random-effects estimated-scale HKSJ/WLS t interval, df=k-1",
        "pooled_effect": float(result.mean_effect_re),
        "standard_error": float(math.sqrt(result.var_hksj_re)),
        "confidence_interval_95": [float(ci_re_hksj[0]), float(ci_re_hksj[1])],
        "tau2": float(result.tau2),
        "hksj_scale": float(result.scale_hksj_re),
        "degrees_freedom": int(result.df_resid),
        "statsmodels_version": statsmodels.__version__,
        "diagnostics": diagnostics(usable_units, weights, float(result.mean_effect_re)),
        "warnings": [],
    }
    if len(usable_units) <= 4:
        output["warnings"].append("k <= 4: HKSJ/t inference and heterogeneity estimates are especially unstable.")
    if output["hksj_scale"] == 0.0:
        output["warnings"].append("HKSJ estimated scale is zero; inspect identical effects or degenerate sampling variances.")
    ensure_finite_json(output, "result")
    return output


def build_provenance(
    contract: dict[str, Any],
    usable_units: list[dict[str, Any]],
    all_units: list[dict[str, Any]],
    input_sha256: str,
) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "input_sha256": input_sha256,
        "analysis_contract": contract,
        "usable_analysis_unit_ids": [unit["analysis_unit_id"] for unit in usable_units],
        "k_usable": len(usable_units),
        "release_reviews": [
            {
                "analysis_unit_id": unit["analysis_unit_id"],
                "release_status": unit["release_status"],
                "release_review_reference": unit["release_review_reference"],
            }
            for unit in all_units
        ],
        "retained_nonusable_units": [
            {
                "analysis_unit_id": unit["analysis_unit_id"],
                "status": unit["status"],
                "status_reason": unit["status_reason"],
            }
            for unit in all_units
            if unit["status"] != "usable"
        ],
        "unit_dispositions": [
            {
                "analysis_unit_id": unit["analysis_unit_id"],
                "site_id": unit["site_id"],
                "study_id": unit["study_id"],
                "status": unit["status"],
                "status_reason": unit["status_reason"],
            }
            for unit in all_units
        ],
    }


def build_output(provenance: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    return {
        **provenance,
        "result": result,
        "limitations": [
            "Requires reviewed, disjoint, independent scalar aggregate estimates on one declared scale.",
            "Does not support REML in Python, prediction intervals, Egger tests, influence diagnostics, forest plots, multilevel dependence, or patient-level data.",
        ],
    }


def ensure_finite_json(value: Any, label: str) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        fail(f"{label} is not finite; no output was written")
    if isinstance(value, dict):
        for key, item in value.items():
            ensure_finite_json(item, f"{label}.{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            ensure_finite_json(item, f"{label}[{index}]")


def write_json(path: Path, value: dict[str, Any], label: str) -> None:
    ensure_finite_json(value, label)
    try:
        rendered = json.dumps(value, indent=2, sort_keys=True, allow_nan=False) + "\n"
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
            temporary_path = Path(handle.name)
            handle.write(rendered)
        os.link(temporary_path, path)
        temporary_path.unlink()
    except (OSError, ValueError) as exc:
        if "temporary_path" in locals():
            temporary_path.unlink(missing_ok=True)
        raise ContractError(f"cannot write {label} {path}: {exc}") from exc


def same_path(left: Path, right: Path) -> bool:
    try:
        return os.path.samefile(left, right)
    except OSError:
        return left.resolve(strict=False) == right.resolve(strict=False)


def reject_output_collisions(args: argparse.Namespace) -> None:
    outputs = [path for path in (args.output, args.validated_tsv, args.validated_manifest) if path is not None]
    for output in outputs:
        if same_path(args.input, output):
            fail(f"output path {output} resolves to the input path; source input will not be overwritten")
    for index, output in enumerate(outputs):
        for other in outputs[index + 1:]:
            if same_path(output, other):
                fail(f"output paths {output} and {other} resolve to the same path")

    for output in outputs:
        if os.path.lexists(output):
            fail(f"output destination already exists: {output}; choose a new path to preserve source and prior artifacts")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Aggregate JSON input contract")
    parser.add_argument("--output", type=Path, help="Aggregate JSON result path; required unless --validate-only")
    parser.add_argument("--validated-tsv", type=Path, help="Optional validated aggregate TSV artifact for the R template")
    parser.add_argument("--validated-manifest", type=Path, help="Optional validated JSON provenance artifact for the R template")
    parser.add_argument("--method", choices=("common", "pm"), default="common")
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    if not args.validate_only and args.output is None:
        parser.error("--output is required unless --validate-only is used")
    try:
        reject_output_collisions(args)
    except ContractError as exc:
        parser.error(str(exc))
    return args


def main() -> int:
    args = parse_args()
    written_paths: list[Path] = []
    success = False
    try:
        payload, input_sha256 = load_input(args.input)
        contract, usable_units = validate_input(payload)
        provenance = build_provenance(contract, usable_units, payload["units"], input_sha256)
        if args.validate_only:
            if args.validated_tsv is not None:
                write_validated_tsv(args.validated_tsv, usable_units)
                written_paths.append(args.validated_tsv)
            if args.validated_manifest is not None:
                write_json(args.validated_manifest, provenance, "validated manifest")
                written_paths.append(args.validated_manifest)
            print(f"validated {len(usable_units)} usable independent aggregate units")
            success = True
            return 0
        result = common_effect(usable_units) if args.method == "common" else paule_mandel(usable_units)
        output = build_output(provenance, result)
        if args.validated_tsv is not None:
            write_validated_tsv(args.validated_tsv, usable_units)
            written_paths.append(args.validated_tsv)
        if args.validated_manifest is not None:
            write_json(args.validated_manifest, provenance, "validated manifest")
            written_paths.append(args.validated_manifest)
        write_json(args.output, output, "output")
        written_paths.append(args.output)
        success = True
        return 0
    except ContractError as exc:
        print(f"aggregate_meta.py: {exc}", file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"aggregate_meta.py: filesystem error: {exc}", file=sys.stderr)
        return 2
    except (OverflowError, ValueError) as exc:
        print(f"aggregate_meta.py: numerical calculation failed; no output was written: {exc}", file=sys.stderr)
        return 2

    finally:
        if not success:
            for path in written_paths:
                path.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
