"""Phenotype validation: PPV / NPV / sensitivity / specificity with Wilson CIs.

Reads a chart-review CSV (columns: subject_id, chart_label, algo_label,
plus optional sex / age_band / race / site) and emits:
  - 2x2 confusion matrix
  - Overall PPV, NPV, sensitivity, specificity, F1, Cohen kappa
  - Per-subgroup metrics with Wilson 95% CIs
  - Markdown report
  - JSON validation block ready to paste into a concept-set YAML

Wilson CI is used (not Wald) because Wald collapses at p=0 / p=1 and is
unreliable for small N -- typical phenotype validations have N=100-300 with
some subgroups having N<50.

Usage:
    python validate_phenotype.py T2DM analysis/cohort/chart-review-T2DM.csv \\
        --out reports/phenotype-validation/T2DM-2025-04.md
"""
from __future__ import annotations

import argparse
import csv
import json
import math
from collections import defaultdict
from datetime import date
from pathlib import Path


def wilson_ci(x: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score 95% CI for a proportion. Returns (lo, hi) in [0, 1]."""
    if n == 0:
        return (0.0, 1.0)
    p = x / n
    center = (p + z * z / (2 * n)) / (1 + z * z / n)
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return (max(0.0, center - half), min(1.0, center + half))


def compute_metrics(rows: list[dict]) -> dict:
    """Given chart-vs-algo labelled rows, compute all standard metrics."""
    tp = sum(1 for r in rows if r["chart"] == 1 and r["algo"] == 1)
    fp = sum(1 for r in rows if r["chart"] == 0 and r["algo"] == 1)
    fn = sum(1 for r in rows if r["chart"] == 1 and r["algo"] == 0)
    tn = sum(1 for r in rows if r["chart"] == 0 and r["algo"] == 0)

    n = tp + fp + fn + tn
    if n == 0:
        return {"n": 0}

    def safe_div(num: int, den: int) -> float | None:
        return num / den if den > 0 else None

    ppv = safe_div(tp, tp + fp)
    npv = safe_div(tn, tn + fn)
    sens = safe_div(tp, tp + fn)
    spec = safe_div(tn, tn + fp)
    f1 = (2 * ppv * sens / (ppv + sens)) if (ppv and sens and (ppv + sens) > 0) else None

    # Cohen's kappa: agreement beyond chance
    p_o = (tp + tn) / n
    p_e = (((tp + fp) * (tp + fn)) + ((fn + tn) * (fp + tn))) / (n * n)
    kappa = (p_o - p_e) / (1 - p_e) if (1 - p_e) > 0 else None

    out: dict = {"n": n, "tp": tp, "fp": fp, "fn": fn, "tn": tn,
                 "ppv": ppv, "npv": npv, "sens": sens, "spec": spec,
                 "f1": f1, "kappa": kappa}

    out["ppv_ci"] = wilson_ci(tp, tp + fp) if (tp + fp) > 0 else None
    out["npv_ci"] = wilson_ci(tn, tn + fn) if (tn + fn) > 0 else None
    out["sens_ci"] = wilson_ci(tp, tp + fn) if (tp + fn) > 0 else None
    out["spec_ci"] = wilson_ci(tn, tn + fp) if (tn + fp) > 0 else None
    return out


def fmt(x: float | None, digits: int = 2) -> str:
    return "—" if x is None else f"{x:.{digits}f}"


def fmt_ci(ci: tuple[float, float] | None) -> str:
    return "—" if ci is None else f"({ci[0]:.2f}, {ci[1]:.2f})"


def render_markdown(name: str, overall: dict,
                    subgroups: dict[str, dict[str, dict]]) -> str:
    lines = [
        f"# Phenotype validation: {name}",
        "",
        f"Date: {date.today().isoformat()}",
        f"N matched: {overall['n']}",
        "",
        "## Confusion matrix",
        "",
        "|              | Chart positive | Chart negative |",
        "|--------------|---------------:|---------------:|",
        f"| Algo positive | {overall['tp']:>14} | {overall['fp']:>14} |",
        f"| Algo negative | {overall['fn']:>14} | {overall['tn']:>14} |",
        "",
        "## Performance overall",
        "",
        "| Metric | Estimate | 95% CI (Wilson) |",
        "|--------|---------:|:----------------|",
        f"| PPV  | {fmt(overall['ppv'])}  | {fmt_ci(overall['ppv_ci'])} |",
        f"| NPV  | {fmt(overall['npv'])}  | {fmt_ci(overall['npv_ci'])} |",
        f"| Sens | {fmt(overall['sens'])} | {fmt_ci(overall['sens_ci'])} |",
        f"| Spec | {fmt(overall['spec'])} | {fmt_ci(overall['spec_ci'])} |",
        f"| F1   | {fmt(overall['f1'])}   | — |",
        f"| Kappa| {fmt(overall['kappa'])}| — |",
        "",
    ]

    if subgroups:
        for axis, groups in subgroups.items():
            lines.append(f"## Performance by {axis}")
            lines.append("")
            lines.append("| Group | N | PPV (95% CI) | Sens (95% CI) |")
            lines.append("|-------|--:|:-------------|:--------------|")
            for grp, m in sorted(groups.items()):
                lines.append(
                    f"| {grp} | {m['n']} | "
                    f"{fmt(m['ppv'])} {fmt_ci(m['ppv_ci'])} | "
                    f"{fmt(m['sens'])} {fmt_ci(m['sens_ci'])} |"
                )
            lines.append("")
    return "\n".join(lines)


def yaml_block_for_concept_set(name: str, overall: dict,
                               subgroups: dict[str, dict[str, dict]]) -> str:
    """Emit a YAML fragment to paste into the concept-set provenance file."""
    parts = [
        "validation:",
        f"  date: {date.today().isoformat()}",
        f"  n: {overall['n']}",
        f"  ppv: {fmt(overall['ppv'])}",
        f"  ppv_ci: [{overall['ppv_ci'][0]:.2f}, {overall['ppv_ci'][1]:.2f}]"
            if overall.get("ppv_ci") else "  ppv_ci: null",
        f"  sens: {fmt(overall['sens'])}",
        f"  spec: {fmt(overall['spec'])}",
        f"  npv: {fmt(overall['npv'])}",
    ]
    if subgroups:
        parts.append("  by_subgroup:")
        for axis, groups in subgroups.items():
            parts.append(f"    {axis}:")
            for grp, m in sorted(groups.items()):
                parts.append(f"      {grp}: {{n: {m['n']}, "
                             f"ppv: {fmt(m['ppv'])}, sens: {fmt(m['sens'])}}}")
    return "\n".join(parts)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name", help="phenotype name, e.g. T2DM")
    ap.add_argument("chart_csv", type=Path,
                    help="CSV with columns: subject_id,chart_label,algo_label, +optional subgroup cols")
    ap.add_argument("--out", type=Path, required=True,
                    help="output Markdown report path")
    ap.add_argument("--subgroup-cols", nargs="*", default=["sex", "age_band", "race", "site"],
                    help="columns to stratify by if present")
    args = ap.parse_args()

    rows: list[dict] = []
    with args.chart_csv.open() as fh:
        for row in csv.DictReader(fh):
            try:
                rows.append({
                    "subject_id": row["subject_id"],
                    "chart": int(row["chart_label"]),
                    "algo":  int(row["algo_label"]),
                    **{c: row.get(c, "") for c in args.subgroup_cols},
                })
            except (KeyError, ValueError) as e:
                raise SystemExit(f"row {row} invalid: {e}")

    overall = compute_metrics(rows)

    subgroups: dict[str, dict[str, dict]] = {}
    for axis in args.subgroup_cols:
        present = [r for r in rows if r.get(axis)]
        if not present:
            continue
        by_value: dict[str, list[dict]] = defaultdict(list)
        for r in present:
            by_value[r[axis]].append(r)
        subgroups[axis] = {v: compute_metrics(rs) for v, rs in by_value.items()
                           if compute_metrics(rs)["n"] >= 10}

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(render_markdown(args.name, overall, subgroups))

    yaml_path = args.out.with_suffix(".yaml")
    yaml_path.write_text(yaml_block_for_concept_set(args.name, overall, subgroups))

    print(f"__CE_PHENOTYPE_VALIDATE__ name={args.name} n={overall['n']} "
          f"ppv={fmt(overall['ppv'])} sens={fmt(overall['sens'])} "
          f"report={args.out} yaml={yaml_path}")


if __name__ == "__main__":
    main()
