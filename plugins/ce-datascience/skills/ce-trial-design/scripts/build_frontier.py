#!/usr/bin/env python3
"""Validate normalized trial-design results and build a Pareto frontier.

This script deliberately performs no statistical design calculations. Those
must be produced by the version-pinned external engine named in the spec.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import os
import sys
import tempfile
from pathlib import Path
from typing import Any


TOOL_VERSION = "1.0.0"
SUPPORTED_ENGINES = {"rpact", "gsDesign"}
IDENTIFIER_FIELDS = (
    "scenario_id",
    "candidate_id",
    "engine",
    "engine_version",
)
OBJECTIVES = (
    "max_information",
    "expected_information_null",
    "expected_information_alt",
)
NUMERIC_FIELDS = (
    "analyses",
    "achieved_power",
    "type1_error",
    *OBJECTIVES,
)
RESULT_FIELDS = (*IDENTIFIER_FIELDS, *NUMERIC_FIELDS)


class ContractError(ValueError):
    pass


def require_mapping(value: Any, name: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractError(f"{name} must be an object")
    return value


def require_probability(value: Any, name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ContractError(f"{name} must be numeric")
    number = float(value)
    if not math.isfinite(number) or not 0 < number < 1:
        raise ContractError(f"{name} must be between 0 and 1")
    return number


def require_nonempty_string(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"{name} must be a non-empty string")
    return value.strip()


def require_number(value: Any, name: str, *, positive: bool = False) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ContractError(f"{name} must be numeric")
    number = float(value)
    if not math.isfinite(number) or (positive and number <= 0):
        qualifier = "positive and finite" if positive else "finite"
        raise ContractError(f"{name} must be {qualifier}")
    return number


def load_spec(contents: bytes) -> dict[str, Any]:
    try:
        spec = json.loads(contents.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ContractError(f"cannot parse design spec: {exc}") from exc
    spec = require_mapping(spec, "design spec")
    if spec.get("schema_version") != 1:
        raise ContractError("schema_version must equal 1")
    require_nonempty_string(spec.get("design_id"), "design_id")

    engine = require_mapping(spec.get("engine"), "engine")
    engine_name = engine.get("name")
    engine_version = engine.get("version")
    if engine_name not in SUPPORTED_ENGINES:
        raise ContractError("engine name must be rpact or gsDesign")
    require_nonempty_string(engine_version, "engine version")

    endpoint = require_mapping(spec.get("endpoint"), "endpoint")
    for field in ("type", "name", "estimand", "effect_scale"):
        require_nonempty_string(endpoint.get(field), f"endpoint.{field}")
    if "null" not in endpoint:
        raise ContractError("endpoint.null is required")

    hypothesis = require_mapping(spec.get("hypothesis"), "hypothesis")
    if hypothesis.get("type") != "superiority":
        raise ContractError("hypothesis.type must be superiority")
    sided = hypothesis.get("sided")
    if isinstance(sided, bool) or sided not in (1, 2):
        raise ContractError("hypothesis.sided must be 1 or 2")
    require_nonempty_string(hypothesis.get("direction"), "hypothesis.direction")

    design = require_mapping(spec.get("design"), "design")
    for field in ("information_unit",):
        require_nonempty_string(design.get(field), f"design.{field}")
    require_number(design.get("allocation_ratio"), "design.allocation_ratio", positive=True)

    target = require_mapping(spec.get("target"), "target")
    require_probability(target.get("alpha"), "target.alpha")
    require_probability(target.get("power"), "target.power")
    if "type1_error_tolerance" not in target:
        raise ContractError("target.type1_error_tolerance is required")
    tolerance = target["type1_error_tolerance"]
    if isinstance(tolerance, bool) or not isinstance(tolerance, (int, float)):
        raise ContractError("target.type1_error_tolerance must be numeric")
    if not math.isfinite(float(tolerance)) or float(tolerance) < 0:
        raise ContractError("target.type1_error_tolerance must be non-negative")

    scenarios = spec.get("scenarios")
    if not isinstance(scenarios, list) or not scenarios:
        raise ContractError("scenarios must be a non-empty array")
    scenario_ids: list[str] = []
    for index, scenario in enumerate(scenarios):
        scenario = require_mapping(scenario, f"scenarios[{index}]")
        scenario_id = scenario.get("id")
        if not isinstance(scenario_id, str) or not scenario_id.strip():
            raise ContractError(f"scenarios[{index}].id must be a non-empty string")
        if "alternative" not in scenario:
            raise ContractError(f"scenarios[{index}].alternative is required")
        require_nonempty_string(scenario.get("provenance"), f"scenarios[{index}].provenance")
        scenario_ids.append(scenario_id)
    if len(scenario_ids) != len(set(scenario_ids)):
        raise ContractError("scenario ids must be unique")

    candidates = spec.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        raise ContractError("candidates must be a non-empty array")
    candidate_pairs: list[tuple[str, str]] = []
    for index, candidate in enumerate(candidates):
        candidate = require_mapping(candidate, f"candidates[{index}]")
        scenario_id = require_nonempty_string(candidate.get("scenario_id"), f"candidates[{index}].scenario_id")
        candidate_id = require_nonempty_string(candidate.get("id"), f"candidates[{index}].id")
        if scenario_id not in scenario_ids:
            raise ContractError(f"candidates[{index}].scenario_id is not declared")
        parameters = require_mapping(candidate.get("parameters"), f"candidates[{index}].parameters")
        for field in ("efficacy_rule", "futility_rule"):
            require_nonempty_string(parameters.get(field), f"candidates[{index}].parameters.{field}")
        if not isinstance(parameters.get("futility_binding"), bool):
            raise ContractError(f"candidates[{index}].parameters.futility_binding must be boolean")
        information_rates = parameters.get("information_rates")
        if not isinstance(information_rates, list) or not information_rates:
            raise ContractError(f"candidates[{index}].parameters.information_rates must be a non-empty array")
        normalized_rates = []
        for rate_index, rate in enumerate(information_rates):
            name = f"candidates[{index}].parameters.information_rates[{rate_index}]"
            if isinstance(rate, bool) or not isinstance(rate, (int, float)):
                raise ContractError(f"{name} must be numeric")
            number = float(rate)
            if not math.isfinite(number) or not 0 < number <= 1:
                raise ContractError(f"{name} must be between 0 and 1")
            normalized_rates.append(number)
        if normalized_rates != sorted(set(normalized_rates)) or normalized_rates[-1] != 1:
            raise ContractError(
                f"candidates[{index}].parameters.information_rates must be unique, increasing, and end at 1"
            )
        require_mapping(parameters.get("engine_arguments"), f"candidates[{index}].parameters.engine_arguments")
        candidate_pairs.append((scenario_id, candidate_id))
    if len(candidate_pairs) != len(set(candidate_pairs)):
        raise ContractError("scenario/candidate pairs must be unique")
    candidate_scenarios = {scenario_id for scenario_id, _ in candidate_pairs}
    missing_candidate_scenarios = sorted(set(scenario_ids) - candidate_scenarios)
    if missing_candidate_scenarios:
        raise ContractError(
            f"scenarios without candidates: {', '.join(missing_candidate_scenarios)}"
        )
    if spec.get("simulation") is not None:
        simulation = require_mapping(spec["simulation"], "simulation")
        require_nonempty_string(simulation.get("algorithm"), "simulation.algorithm")
        require_number(simulation.get("iterations"), "simulation.iterations", positive=True)
        require_number(simulation.get("seed"), "simulation.seed")
        require_nonempty_string(simulation.get("monte_carlo_criterion"), "simulation.monte_carlo_criterion")
    review = require_mapping(spec.get("review"), "review")
    if review.get("statistician") is not None:
        require_nonempty_string(review["statistician"], "review.statistician")
    require_nonempty_string(review.get("status"), "review.status")
    if not isinstance(spec.get("unresolved"), list):
        raise ContractError("unresolved must be an array")
    return spec


def parse_number(value: str, field: str, row_number: int) -> float:
    try:
        number = float(value)
    except ValueError as exc:
        raise ContractError(f"row {row_number}: {field} must be numeric") from exc
    if not math.isfinite(number):
        raise ContractError(f"row {row_number}: {field} must be finite")
    return number


def require_cell(raw: dict[str, str | None], field: str, row_number: int) -> str:
    value = raw.get(field)
    if value is None:
        raise ContractError(f"row {row_number}: {field} must not be missing")
    return value.strip()


def validate_runtime_provenance(
    contents: bytes,
    spec: dict[str, Any],
    results_md5: str,
) -> dict[str, Any]:
    try:
        provenance = json.loads(contents.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ContractError(f"cannot parse runtime provenance: {exc}") from exc
    provenance = require_mapping(provenance, "runtime provenance")
    if provenance.get("schema_version") != 1:
        raise ContractError("runtime provenance schema_version must equal 1")
    if provenance.get("engine") != spec["engine"]["name"]:
        raise ContractError("runtime provenance engine does not match pinned engine")
    if provenance.get("engine_version") != spec["engine"]["version"]:
        raise ContractError("runtime provenance engine version does not match pinned engine version")
    require_nonempty_string(provenance.get("r_version"), "runtime provenance r_version")
    if provenance.get("completed") is not True:
        raise ContractError("runtime provenance completed must be true")
    if provenance.get("results_md5") != results_md5:
        raise ContractError("runtime provenance results_md5 does not match engine results")
    return provenance


def load_results(contents: bytes, spec: dict[str, Any]) -> list[dict[str, Any]]:
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ContractError(f"cannot parse engine results: {exc}") from exc

    with io.StringIO(text, newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        if tuple(fieldnames) != RESULT_FIELDS:
            raise ContractError(f"engine results columns must exactly equal: {', '.join(RESULT_FIELDS)}")
        rows: list[dict[str, Any]] = []
        seen_candidates: set[tuple[str, str]] = set()
        expected_engine = spec["engine"]["name"]
        expected_version = spec["engine"]["version"]
        scenario_ids = {scenario["id"] for scenario in spec["scenarios"]}
        expected_pairs = {(candidate["scenario_id"], candidate["id"]) for candidate in spec["candidates"]}
        candidate_by_pair = {
            (candidate["scenario_id"], candidate["id"]): candidate for candidate in spec["candidates"]
        }
        for row_number, raw in enumerate(reader, start=2):
            scenario_id = require_cell(raw, "scenario_id", row_number)
            candidate_id = require_cell(raw, "candidate_id", row_number)
            if scenario_id not in scenario_ids:
                raise ContractError(f"row {row_number}: unknown scenario_id {scenario_id!r}")
            if not candidate_id:
                raise ContractError(f"row {row_number}: candidate_id must not be empty")
            key = (scenario_id, candidate_id)
            if key not in expected_pairs:
                raise ContractError(f"row {row_number}: undeclared scenario/candidate pair {scenario_id}/{candidate_id}")
            if key in seen_candidates:
                raise ContractError(f"row {row_number}: duplicate candidate {scenario_id}/{candidate_id}")
            seen_candidates.add(key)
            if require_cell(raw, "engine", row_number) != expected_engine:
                raise ContractError(f"row {row_number}: engine does not match pinned engine")
            if require_cell(raw, "engine_version", row_number) != expected_version:
                raise ContractError(f"row {row_number}: engine version does not match pinned engine version")

            row: dict[str, Any] = {
                "scenario_id": scenario_id,
                "candidate_id": candidate_id,
                "engine": expected_engine,
                "engine_version": expected_version,
            }
            for field in NUMERIC_FIELDS:
                row[field] = parse_number(require_cell(raw, field, row_number), field, row_number)
            if not row["analyses"].is_integer() or row["analyses"] < 1:
                raise ContractError(f"row {row_number}: analyses must be a positive integer")
            for field in ("achieved_power", "type1_error"):
                if not 0 <= row[field] <= 1:
                    raise ContractError(f"row {row_number}: {field} must be between 0 and 1")
            for field in OBJECTIVES:
                if row[field] <= 0:
                    raise ContractError(f"row {row_number}: {field} must be positive")
            if row["expected_information_null"] > row["max_information"]:
                raise ContractError(f"row {row_number}: expected_information_null must not exceed max_information")
            if row["expected_information_alt"] > row["max_information"]:
                raise ContractError(f"row {row_number}: expected_information_alt must not exceed max_information")
            if row["analyses"] != len(candidate_by_pair[key]["parameters"]["information_rates"]):
                raise ContractError(f"row {row_number}: analyses must match candidate information_rates")
            rows.append(row)

    if not rows:
        raise ContractError("engine results must contain at least one row")
    observed_pairs = {(row["scenario_id"], row["candidate_id"]) for row in rows}
    missing_pairs = sorted(expected_pairs - observed_pairs)
    if missing_pairs:
        rendered = ", ".join(f"{scenario}/{candidate}" for scenario, candidate in missing_pairs)
        raise ContractError(f"engine results missing scenario/candidate pairs: {rendered}")
    return rows


def dominates(left: dict[str, Any], right: dict[str, Any]) -> bool:
    no_worse = all(left[field] <= right[field] for field in OBJECTIVES)
    strictly_better = any(left[field] < right[field] for field in OBJECTIVES)
    return no_worse and strictly_better


def evaluate(rows: list[dict[str, Any]], spec: dict[str, Any]) -> list[dict[str, Any]]:
    target = spec["target"]
    alpha_limit = float(target["alpha"]) + float(target["type1_error_tolerance"])
    power_target = float(target["power"])
    feasible_by_scenario: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        row["feasible"] = row["achieved_power"] >= power_target and row["type1_error"] <= alpha_limit
        row["pareto"] = False
        if row["feasible"]:
            feasible_by_scenario.setdefault(row["scenario_id"], []).append(row)

    for feasible in feasible_by_scenario.values():
        for candidate in feasible:
            candidate["pareto"] = not any(dominates(other, candidate) for other in feasible)
    return rows


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    fields = list(RESULT_FIELDS) + ["feasible", "pareto"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in sorted(rows, key=lambda item: (item["scenario_id"], item["candidate_id"])):
            writer.writerow({field: row[field] for field in fields})


def write_handoff(path: Path, spec: dict[str, Any], frontier: list[dict[str, Any]]) -> None:
    engine = spec["engine"]
    endpoint = spec["endpoint"]
    hypothesis = spec["hypothesis"]
    target = spec["target"]
    design = spec["design"]
    review = spec["review"]
    lines = [
        f"# Trial design frontier: {spec['design_id']}",
        "",
        f"External engine: `{engine['name']} {engine['version']}`.",
        "",
        "CE validated the adapter contract, feasibility thresholds, provenance hashes, and Pareto calculation. "
        "CE does not validate the statistical mathematics, regulatory acceptability, or clinical feasibility of the external engine results.",
        "",
        "A qualified statistician must review the design specification, engine script, operating characteristics, and decision rules before protocol or SAP use.",
        "",
        "## Declared design",
        "",
        f"- Endpoint: {endpoint['name']} ({endpoint['type']})",
        f"- Estimand: {endpoint['estimand']}",
        f"- Effect scale and null: {endpoint['effect_scale']}; null = {endpoint['null']}",
        f"- Hypothesis: {hypothesis['type']}, {hypothesis['sided']}-sided, direction = {hypothesis['direction']}",
        f"- Overall alpha: {target['alpha']} (tolerance {target['type1_error_tolerance']})",
        f"- Target power: {target['power']}",
        f"- Information unit: {design['information_unit']}",
        f"- Allocation ratio: {design['allocation_ratio']}",
        f"- Statistical reviewer: {review['statistician'] or 'not yet named'}; status = {review['status']}",
        "",
        "## Declared candidates",
        "",
    ]
    for candidate in spec["candidates"]:
        parameters = candidate["parameters"]
        lines.append(
            f"- {candidate['scenario_id']}/{candidate['id']}: information rates = "
            f"{parameters['information_rates']}; efficacy = {parameters['efficacy_rule']}; "
            f"futility = {parameters['futility_rule']} (binding = "
            f"{str(parameters['futility_binding']).lower()}); engine arguments = "
            f"{json.dumps(parameters['engine_arguments'], sort_keys=True)}"
        )
    lines.extend([
        "",
        "## Scenario assumptions",
        "",
    ])
    for scenario in spec["scenarios"]:
        lines.append(
            f"- {scenario['id']}: alternative = {scenario['alternative']}; provenance = {scenario['provenance']}"
        )
    if spec["simulation"] is not None:
        simulation = spec["simulation"]
        lines.append(
            f"- Simulation: algorithm = {simulation['algorithm']}; iterations = {simulation['iterations']}; "
            f"seed = {simulation['seed']}; criterion = {simulation['monte_carlo_criterion']}"
        )
    if spec["unresolved"]:
        lines.extend(["", "## Unresolved constraints", ""])
        lines.extend(f"- {item}" for item in spec["unresolved"])
    lines.extend([
        "## Feasible Pareto candidates",
        "",
    ])
    if not frontier:
        lines.append("No candidate met the declared power and type I error thresholds. Do not select a design from this run.")
    else:
        lines.extend([
            "| Scenario | Candidate | Analyses | Power | Type I error | Max information | Expected information H0 | Expected information H1 |",
            "|---|---|---:|---:|---:|---:|---:|---:|",
        ])
        for row in sorted(frontier, key=lambda item: (item["scenario_id"], item["candidate_id"])):
            lines.append(
                f"| {row['scenario_id']} | {row['candidate_id']} | {int(row['analyses'])} | "
                f"{row['achieved_power']:.6g} | {row['type1_error']:.6g} | "
                f"{row['max_information']:.6g} | {row['expected_information_null']:.6g} | "
                f"{row['expected_information_alt']:.6g} |"
            )
    lines.extend([
        "",
        "## SAP handoff requirements",
        "",
        "Cite the external engine documentation and attach the exact design spec, engine script, normalized results, and receipt. Record the selected candidate rationale only after qualified statistical review.",
        "",
    ])
    path.write_text("\n".join(lines), encoding="utf-8")


def build(
    spec_path: Path,
    results_path: Path,
    engine_script_path: Path,
    engine_log_path: Path,
    session_info_path: Path,
    runtime_provenance_path: Path,
    output_dir: Path,
) -> None:
    if output_dir.exists():
        raise ContractError("output directory already exists; use a new directory for each immutable run")
    try:
        captured_inputs = {
            "spec_sha256": spec_path.read_bytes(),
            "results_sha256": results_path.read_bytes(),
            "engine_script_sha256": engine_script_path.read_bytes(),
            "engine_log_sha256": engine_log_path.read_bytes(),
            "session_info_sha256": session_info_path.read_bytes(),
            "runtime_provenance_sha256": runtime_provenance_path.read_bytes(),
        }
    except OSError as exc:
        raise ContractError(f"cannot capture design artifacts: {exc}") from exc
    input_hashes = {
        name: hashlib.sha256(contents).hexdigest() for name, contents in captured_inputs.items()
    }
    spec = load_spec(captured_inputs["spec_sha256"])
    runtime_provenance = validate_runtime_provenance(
        captured_inputs["runtime_provenance_sha256"],
        spec,
        hashlib.md5(captured_inputs["results_sha256"]).hexdigest(),  # nosec B303 - provenance only
    )
    rows = evaluate(load_results(captured_inputs["results_sha256"], spec), spec)
    frontier = [row for row in rows if row["pareto"]]

    receipt = {
        "schema_version": 1,
        "tool": {"name": "ce-trial-design-frontier", "version": TOOL_VERSION},
        "design_id": spec["design_id"],
        "engine": spec["engine"],
        "runtime": runtime_provenance,
        "inputs": input_hashes,
        "thresholds": spec["target"],
        "objectives": list(OBJECTIVES),
        "counts": {
            "input_rows": len(rows),
            "feasible_rows": sum(row["feasible"] for row in rows),
            "frontier_rows": len(frontier),
        },
        "statistical_engine_validated_by_ce": False,
        "human_statistical_review_required": True,
    }
    output_dir.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=f".{output_dir.name}-", dir=output_dir.parent) as temporary:
        staging_dir = Path(temporary)
        write_csv(staging_dir / "evaluated-results.csv", rows)
        write_csv(staging_dir / "frontier.csv", frontier)
        write_handoff(staging_dir / "sap-handoff.md", spec, frontier)
        (staging_dir / "receipt.json").write_text(
            json.dumps(receipt, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        os.replace(staging_dir, output_dir)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate normalized external-engine results and build a trial-design frontier."
    )
    parser.add_argument("--spec", required=True, type=Path)
    parser.add_argument("--results", required=True, type=Path)
    parser.add_argument("--engine-script", required=True, type=Path)
    parser.add_argument("--engine-log", required=True, type=Path)
    parser.add_argument("--session-info", required=True, type=Path)
    parser.add_argument("--runtime-provenance", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    try:
        build(
            args.spec.resolve(),
            args.results.resolve(),
            args.engine_script.resolve(),
            args.engine_log.resolve(),
            args.session_info.resolve(),
            args.runtime_provenance.resolve(),
            args.output_dir.resolve(),
        )
    except (ContractError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
