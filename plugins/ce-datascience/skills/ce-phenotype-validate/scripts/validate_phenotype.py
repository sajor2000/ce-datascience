"""Phenotype validation: PPV / NPV / sensitivity / specificity with design-aware CIs.

Reads a merged chart-review CSV (columns: subject_id, chart_label, algo_label,
plus optional sex / age_band / race / site) and emits:
  - 2x2 confusion matrix (suppressed at the disclosure floor, see below)
  - PPV and NPV with Wilson 95% CIs
  - Sensitivity and specificity, estimated according to the sampling design
  - Per-subgroup metrics
  - Markdown report, suppressed aggregate CSV, and a YAML validation block

Sampling design matters (verification bias; Begg & Greenes, Biometrics 1983,
PMID 6871349):
  - `--design srs` (simple random sample of the cohort): all four metrics are
    estimated directly from the sample cells with Wilson CIs.
  - `--design algo-stratified` (the default; chart review sampled within
    algorithm-positive and algorithm-negative strata): PPV and NPV are
    estimated directly. Sensitivity and specificity are NOT estimable from the
    raw cells. They are estimated only when the cohort stratum counts
    (`--n-algo-pos-pop`, `--n-algo-neg-pop`) are supplied, by weighting each
    stratum by its inverse sampling fraction, with logit-scale delta-method
    CIs. Otherwise they are reported as not estimable.

Usage:
    python validate_phenotype.py T2DM output/intermediate_phi/merged-T2DM.csv \\
        --out reports/phenotype-validation/T2DM-2025-04.md \\
        --n-algo-pos-pop 1800 --n-algo-neg-pop 48200
"""
from __future__ import annotations

import argparse
import csv
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


def _expit(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def weighted_accuracy(tp: int, fp: int, fn: int, tn: int,
                      w_pos: float, w_neg: float, z: float = 1.96) -> dict:
    """Inverse-sampling-fraction weighted sensitivity and specificity.

    w_pos = N_algo_pos_cohort / n_algo_pos_sampled, w_neg likewise. Equivalent
    to Se = PPV*pi / (PPV*pi + (1-NPV)*(1-pi)) with pi = P(algo+) in the cohort.
    CIs use the delta method on the logit scale, treating PPV and NPV as
    independent binomials from the two strata:
      Var(logit Se) = 1/TP - 1/(TP+FP) + 1/FN - 1/(FN+TN)
      Var(logit Sp) = 1/TN - 1/(TN+FN) + 1/FP - 1/(FP+TP)
    When a zero cell makes the logit undefined, 0.5 is added to every cell for
    the interval only (the point estimate stays unadjusted) and the result is
    flagged.
    """
    out: dict = {"sens": None, "spec": None, "sens_ci": None, "spec_ci": None,
                 "zero_cell_correction": False}
    if tp + fn > 0:
        out["sens"] = w_pos * tp / (w_pos * tp + w_neg * fn)
    if tn + fp > 0:
        out["spec"] = w_neg * tn / (w_neg * tn + w_pos * fp)
    if (tp + fp) == 0 or (fn + tn) == 0:
        return out
    a, b, c, d = tp, fp, fn, tn
    if min(a, b, c, d) == 0:
        a, b, c, d = a + 0.5, b + 0.5, c + 0.5, d + 0.5
        out["zero_cell_correction"] = True

    def logit_ci(num: float, den: float, var: float) -> tuple[float, float]:
        centre = math.log(num / den)
        half = z * math.sqrt(var)
        return (_expit(centre - half), _expit(centre + half))

    if out["sens"] is not None:
        var = 1 / a - 1 / (a + b) + 1 / c - 1 / (c + d)
        out["sens_ci"] = logit_ci(w_pos * a, w_neg * c, var)
    if out["spec"] is not None:
        var = 1 / d - 1 / (d + c) + 1 / b - 1 / (b + a)
        out["spec_ci"] = logit_ci(w_neg * d, w_pos * b, var)
    return out


def compute_metrics(rows: list[dict], design: str,
                    weights: tuple[float, float] | None) -> dict:
    """Given chart-vs-algo labelled rows, compute design-appropriate metrics."""
    tp = sum(1 for r in rows if r["chart"] == 1 and r["algo"] == 1)
    fp = sum(1 for r in rows if r["chart"] == 0 and r["algo"] == 1)
    fn = sum(1 for r in rows if r["chart"] == 1 and r["algo"] == 0)
    tn = sum(1 for r in rows if r["chart"] == 0 and r["algo"] == 0)

    n = tp + fp + fn + tn
    if n == 0:
        return {"n": 0}

    def safe_div(num: int, den: int) -> float | None:
        return num / den if den > 0 else None

    out: dict = {"n": n, "tp": tp, "fp": fp, "fn": fn, "tn": tn,
                 "ppv": safe_div(tp, tp + fp), "npv": safe_div(tn, tn + fn),
                 "ppv_ci": wilson_ci(tp, tp + fp) if (tp + fp) > 0 else None,
                 "npv_ci": wilson_ci(tn, tn + fn) if (tn + fn) > 0 else None,
                 "sens": None, "spec": None, "sens_ci": None, "spec_ci": None,
                 "se_sp_method": "not estimable", "zero_cell_correction": False}

    if design == "srs":
        out["sens"] = safe_div(tp, tp + fn)
        out["spec"] = safe_div(tn, tn + fp)
        out["sens_ci"] = wilson_ci(tp, tp + fn) if (tp + fn) > 0 else None
        out["spec_ci"] = wilson_ci(tn, tn + fp) if (tn + fp) > 0 else None
        out["se_sp_method"] = "direct (simple random sample), Wilson CI"
    elif weights is not None:
        out.update(weighted_accuracy(tp, fp, fn, tn, *weights))
        out["se_sp_method"] = ("inverse-sampling-fraction weighted "
                               "(Begg & Greenes 1983), logit delta-method CI")

    ppv, sens = out["ppv"], out["sens"]
    out["f1"] = (2 * ppv * sens / (ppv + sens)) if (ppv and sens) else None
    return out


def fmt(x: float | None, digits: int = 2) -> str:
    return "NA" if x is None else f"{x:.{digits}f}"


def fmt_ci(ci: tuple[float, float] | None) -> str:
    return "--" if ci is None else f"({ci[0]:.2f}, {ci[1]:.2f})"


def has_small_cell(m: dict, floor: int) -> bool:
    """True when any 2x2 cell is 1..floor-1. Zero is publishable (CMS cell size
    suppression policy); a count derivable from reported values is not."""
    return any(0 < m.get(k, 0) < floor for k in ("tp", "fp", "fn", "tn"))


def suppressed_cells(m: dict, floor: int) -> dict[str, str]:
    """Cell counts as strings. If any cell is below the floor, all four read
    "suppressed" so the small one is not singled out. Callers must also withhold
    n and every derived metric: n with PPV, NPV, Se, Sp, or a Wilson CI width
    reconstructs the table."""
    keys = ("tp", "fp", "fn", "tn")
    if has_small_cell(m, floor):
        return {k: "suppressed" for k in keys}
    return {k: str(m[k]) for k in keys}


WITHHELD_NOTE = ("A confusion-matrix cell is below the disclosure floor, so n, the cells, "
                 "and every derived metric are withheld: n with PPV/NPV/Se/Sp or a CI "
                 "recovers the small cell. Merge categories or enlarge the sample, or "
                 "re-run with the project's declared floor if it is lower.")


def render_markdown(name: str, overall: dict, subgroups: dict[str, dict[str, dict]],
                    design: str, floor: int, weights: tuple[float, float] | None) -> str:
    cells = suppressed_cells(overall, floor)
    withheld = has_small_cell(overall, floor)
    se_note = overall["se_sp_method"]
    if overall["sens"] is None and design != "srs":
        se_note = ("not estimable (algo-stratified sample; supply "
                   "--n-algo-pos-pop and --n-algo-neg-pop)")
    lines = [
        f"# Phenotype validation: {name}",
        "",
        f"Date: {date.today().isoformat()}",
        f"N matched: {'suppressed' if withheld else overall['n']}",
        f"Sampling design: {design}",
        f"Sensitivity/specificity: {se_note}",
        f"Disclosure floor: n<{floor} cells suppressed",
        "",
        "## Confusion matrix (sample counts)",
        "",
        "|              | Chart positive | Chart negative |",
        "|--------------|---------------:|---------------:|",
        f"| Algo positive | {cells['tp']:>14} | {cells['fp']:>14} |",
        f"| Algo negative | {cells['fn']:>14} | {cells['tn']:>14} |",
        "",
    ]
    if withheld:
        return "\n".join(lines + [WITHHELD_NOTE, ""])
    lines += [
        "## Performance overall",
        "",
        "| Metric | Estimate | 95% CI |",
        "|--------|---------:|:-------|",
        f"| PPV  | {fmt(overall['ppv'])}  | {fmt_ci(overall['ppv_ci'])} Wilson |",
        f"| NPV  | {fmt(overall['npv'])}  | {fmt_ci(overall['npv_ci'])} Wilson |",
        f"| Sens | {fmt(overall['sens'])} | {fmt_ci(overall['sens_ci'])} |",
        f"| Spec | {fmt(overall['spec'])} | {fmt_ci(overall['spec_ci'])} |",
        f"| F1 (descriptive only) | {fmt(overall['f1'])} | -- |",
        "",
    ]
    if weights is not None:
        lines += [f"Stratum weights (cohort N / sampled n): algo+ {weights[0]:.3f}, "
                  f"algo- {weights[1]:.3f}", ""]
    if overall.get("zero_cell_correction"):
        lines += ["A zero cell made the logit undefined; 0.5 was added to each cell "
                  "for the weighted CIs only.", ""]

    for axis, groups in subgroups.items():
        lines.append(f"## Performance by {axis}")
        lines.append("")
        lines.append("| Group | N | PPV (95% CI) | NPV (95% CI) | Sens (95% CI) | Spec (95% CI) |")
        lines.append("|-------|--:|:-------------|:-------------|:--------------|:--------------|")
        for grp, m in sorted(groups.items()):
            lines.append(
                f"| {grp} | {m['n']} | "
                f"{fmt(m['ppv'])} {fmt_ci(m['ppv_ci'])} | "
                f"{fmt(m['npv'])} {fmt_ci(m['npv_ci'])} | "
                f"{fmt(m['sens'])} {fmt_ci(m['sens_ci'])} | "
                f"{fmt(m['spec'])} {fmt_ci(m['spec_ci'])} |"
            )
        lines.append("")
    return "\n".join(lines)


def write_csv(path: Path, overall: dict, subgroups: dict[str, dict[str, dict]],
              floor: int) -> None:
    """Aggregate-only CSV: suppressed cell counts and metrics, no subject rows."""
    with path.open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["level", "group", "n", "tp", "fp", "fn", "tn",
                    "ppv", "npv", "sens", "spec"])
        cells = suppressed_cells(overall, floor)
        if has_small_cell(overall, floor):
            w.writerow(["overall", "all", "suppressed", *cells.values(), *["suppressed"] * 4])
            return
        w.writerow(["overall", "all", overall["n"], cells["tp"], cells["fp"],
                    cells["fn"], cells["tn"], fmt(overall["ppv"], 4),
                    fmt(overall["npv"], 4), fmt(overall["sens"], 4),
                    fmt(overall["spec"], 4)])
        for axis, groups in subgroups.items():
            for grp, m in sorted(groups.items()):
                c = suppressed_cells(m, floor)
                w.writerow([axis, grp, m["n"], c["tp"], c["fp"], c["fn"], c["tn"],
                            fmt(m["ppv"], 4), fmt(m["npv"], 4),
                            fmt(m["sens"], 4), fmt(m["spec"], 4)])


def yaml_block_for_concept_set(overall: dict, subgroups: dict[str, dict[str, dict]],
                               design: str, floor: int) -> str:
    """Emit a YAML fragment to paste into the concept-set provenance file."""
    if has_small_cell(overall, floor):
        return ("validation:\n"
                f"  date: {date.today().isoformat()}\n"
                f"  sampling_design: {design}\n"
                f"  suppressed: true  # a 2x2 cell is below the disclosure floor of {floor}\n")
    def ci(key: str) -> str:
        v = overall.get(key)
        return f"[{v[0]:.2f}, {v[1]:.2f}]" if v else "null"

    def val(key: str) -> str:
        v = overall.get(key)
        return "null" if v is None else f"{v:.2f}"

    parts = [
        "validation:",
        f"  date: {date.today().isoformat()}",
        f"  n: {overall['n']}",
        f"  sampling_design: {design}",
        f"  sens_spec_method: \"{overall['se_sp_method']}\"",
        f"  ppv: {val('ppv')}",
        f"  ppv_ci: {ci('ppv_ci')}",
        f"  npv: {val('npv')}",
        f"  npv_ci: {ci('npv_ci')}",
        f"  sens: {val('sens')}",
        f"  sens_ci: {ci('sens_ci')}",
        f"  spec: {val('spec')}",
        f"  spec_ci: {ci('spec_ci')}",
    ]
    if subgroups:
        parts.append("  by_subgroup:")
        for axis, groups in subgroups.items():
            parts.append(f"    {axis}:")
            for grp, m in sorted(groups.items()):
                parts.append(f"      {grp}: {{n: {m['n']}, ppv: {fmt(m['ppv'])}, "
                             f"npv: {fmt(m['npv'])}, sens: {fmt(m['sens'])}, "
                             f"spec: {fmt(m['spec'])}}}")
    return "\n".join(parts) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name", help="phenotype name, e.g. T2DM")
    ap.add_argument("chart_csv", type=Path,
                    help="CSV with columns: subject_id,chart_label,algo_label, +optional subgroup cols")
    ap.add_argument("--out", type=Path, required=True,
                    help="output Markdown report path (CSV and YAML are written beside it)")
    ap.add_argument("--design", choices=["algo-stratified", "srs"], default="algo-stratified",
                    help="chart-review sampling design (default algo-stratified)")
    ap.add_argument("--n-algo-pos-pop", type=int,
                    help="algorithm-positive count in the full cohort (enables weighted Se/Sp)")
    ap.add_argument("--n-algo-neg-pop", type=int,
                    help="algorithm-negative count in the full cohort (enables weighted Se/Sp)")
    ap.add_argument("--disclosure-floor", type=int, default=11,
                    help="suppress tables with a cell below this count and drop subgroup "
                         "axes with a small group or cell (default 11)")
    ap.add_argument("--subgroup-cols", nargs="*", default=["sex", "age_band", "race", "site"],
                    help="columns to stratify by if present")
    args = ap.parse_args()

    if not args.chart_csv.is_file():
        raise SystemExit(f"chart-review CSV not found: {args.chart_csv}")
    if (args.n_algo_pos_pop is None) != (args.n_algo_neg_pop is None):
        raise SystemExit("supply both --n-algo-pos-pop and --n-algo-neg-pop, or neither")
    if args.design == "srs" and args.n_algo_pos_pop is not None:
        raise SystemExit("cohort stratum counts apply only to --design algo-stratified")
    if args.disclosure_floor < 1:
        raise SystemExit("--disclosure-floor must be >= 1")

    rows: list[dict] = []
    with args.chart_csv.open(newline="") as fh:
        reader = csv.DictReader(fh)
        required = ("subject_id", "chart_label", "algo_label")
        missing = [c for c in required if c not in (reader.fieldnames or [])]
        if missing:
            raise SystemExit(
                f"{args.chart_csv}: missing required column(s) {', '.join(missing)}; "
                f"expected header: subject_id,chart_label,algo_label[,sex,age_band,race,site]")
        # Never echo row contents (subject_id, labels) into errors: PHI rule.
        for line_no, row in enumerate(reader, start=2):
            try:
                chart, algo = int(row["chart_label"]), int(row["algo_label"])
            except ValueError:
                raise SystemExit(
                    f"{args.chart_csv} line {line_no}: chart_label and algo_label must be 0 or 1")
            if chart not in (0, 1) or algo not in (0, 1):
                raise SystemExit(
                    f"{args.chart_csv} line {line_no}: chart_label and algo_label must be 0 or 1")
            rows.append({
                "chart": chart,
                "algo": algo,
                **{c: row.get(c, "") for c in args.subgroup_cols},
            })

    if not rows:
        raise SystemExit(f"{args.chart_csv}: no data rows; nothing to validate")

    weights: tuple[float, float] | None = None
    if args.n_algo_pos_pop is not None:
        n_pos = sum(1 for r in rows if r["algo"] == 1)
        n_neg = len(rows) - n_pos
        if n_pos == 0 or n_neg == 0:
            raise SystemExit("weighted Se/Sp needs sampled patients in both algorithm strata")
        if args.n_algo_pos_pop < n_pos or args.n_algo_neg_pop < n_neg:
            raise SystemExit("cohort stratum counts must be >= the sampled counts in each stratum")
        weights = (args.n_algo_pos_pop / n_pos, args.n_algo_neg_pop / n_neg)

    overall = compute_metrics(rows, args.design, weights)

    subgroups: dict[str, dict[str, dict]] = {}
    for axis in args.subgroup_cols:
        if not any(r.get(axis) for r in rows):
            continue
        # Missing values form their own group: shown groups plus the overall
        # table would otherwise recover it by subtraction.
        by_value: dict[str, list[dict]] = defaultdict(list)
        for r in rows:
            by_value[r.get(axis) or "(missing)"].append(r)
        groups = {v: compute_metrics(rs, args.design, weights) for v, rs in by_value.items()}
        # Drop the whole axis if any group is small: one dropped group is
        # recoverable as overall minus the groups shown.
        if all(m["n"] >= args.disclosure_floor and not has_small_cell(m, args.disclosure_floor)
               for m in groups.values()):
            subgroups[axis] = groups

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(render_markdown(args.name, overall, subgroups, args.design,
                                        args.disclosure_floor, weights))
    csv_path = args.out.with_suffix(".csv")
    write_csv(csv_path, overall, subgroups, args.disclosure_floor)
    yaml_path = args.out.with_suffix(".yaml")
    yaml_path.write_text(yaml_block_for_concept_set(overall, subgroups, args.design,
                                                    args.disclosure_floor))

    print(f"__CE_PHENOTYPE_VALIDATE__ name={args.name} n={overall['n']} "
          f"design={args.design} suppressed={'yes' if has_small_cell(overall, args.disclosure_floor) else 'no'} "
          f"ppv={fmt(overall['ppv'])} npv={fmt(overall['npv'])} "
          f"sens={fmt(overall['sens'])} spec={fmt(overall['spec'])} "
          f"report={args.out} csv={csv_path} yaml={yaml_path}")


if __name__ == "__main__":
    main()
