#!/usr/bin/env python3
"""Assess SAS and Stata project surface area for review or porting."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SAS_PATTERNS = {
    "proc_logistic": re.compile(r"\bproc\s+logistic\b", re.I),
    "proc_phreg": re.compile(r"\bproc\s+phreg\b", re.I),
    "proc_mixed": re.compile(r"\bproc\s+mixed\b", re.I),
    "proc_glimmix": re.compile(r"\bproc\s+glimmix\b", re.I),
    "proc_genmod": re.compile(r"\bproc\s+genmod\b", re.I),
    "proc_glm": re.compile(r"\bproc\s+glm\b", re.I),
    "proc_reg": re.compile(r"\bproc\s+reg\b", re.I),
    "proc_freq": re.compile(r"\bproc\s+freq\b", re.I),
    "proc_lifetest": re.compile(r"\bproc\s+lifetest\b", re.I),
    "proc_mi": re.compile(r"\bproc\s+(mi|mianalyze)\b", re.I),
    "proc_survey": re.compile(r"\bproc\s+survey\w+", re.I),
    "proc_univariate": re.compile(r"\bproc\s+univariate\b", re.I),
    "proc_sql": re.compile(r"\bproc\s+sql\b", re.I),
    "data_step": re.compile(r"^\s*data\s+\w+", re.I | re.M),
    "libname": re.compile(r"\blibname\b", re.I),
    "ods_output": re.compile(r"\bods\s+", re.I),
}

STATA_PATTERNS = {
    "logit": re.compile(r"^\s*(logit|logistic)\b", re.I | re.M),
    "stcox": re.compile(r"^\s*stcox\b", re.I | re.M),
    "regress": re.compile(r"^\s*(regress|reg)\b", re.I | re.M),
    "xtreg": re.compile(r"^\s*xtreg\b", re.I | re.M),
    "mixed": re.compile(r"^\s*(mixed|me(logit|probit|cloglog|ologit|oprobit|poisson|nbreg|glm|streg|intreg|tobit|qrprobit))\b", re.I | re.M),
    "glm": re.compile(r"^\s*(glm|poisson|nbreg)\b", re.I | re.M),
    "svy": re.compile(r"^\s*svy\b", re.I | re.M),
    "teffects": re.compile(r"^\s*teffects\b", re.I | re.M),
    "stcrreg": re.compile(r"^\s*stcrreg\b", re.I | re.M),
    "margins": re.compile(r"^\s*margins\b", re.I | re.M),
    "vce_cluster": re.compile(r"\bvce\(\s*cl(uster)?\b", re.I),
    "mi": re.compile(r"^\s*mi\s+", re.I | re.M),
    "global_macro": re.compile(r"^\s*global\s+", re.I | re.M),
    "putexcel": re.compile(r"^\s*putexcel\b", re.I | re.M),
    "esttab": re.compile(r"^\s*(esttab|outreg2)\b", re.I | re.M),
}

# Defaults that differ across SAS, Stata, and R; align them before comparing a port.
PORTING_NOTES = {
    "proc_phreg": "Cox ties: SAS PROC PHREG defaults to TIES=BRESLOW; R survival::coxph defaults to Efron.",
    "stcox": "Cox ties: Stata stcox defaults to Breslow; R survival::coxph defaults to Efron.",
    "proc_logistic": "PROC LOGISTIC models the response with Ordered Value 1 (Y=0 for a 0/1 outcome) unless EVENT= or DESCENDING is set, and CLASS defaults to PARAM=EFFECT; signs and contrasts differ from R/Stata defaults.",
    "proc_genmod": "SAS CLASS reference level defaults to the last level (REF=LAST); R uses the first factor level.",
    "proc_glm": "SAS CLASS reference level defaults to the last level; R uses the first factor level.",
    "proc_mixed": "PROC MIXED reports denominator df (DDFM=); lme4 reports none. Use lmerTest (Satterthwaite) or pbkrtest (Kenward-Roger) to match DDFM=SATTERTH or KR.",
    "proc_glimmix": "PROC GLIMMIX estimation method and DDFM= defaults differ from lme4::glmer (Laplace); align method and df before comparing.",
    "mixed": "Stata mixed/me* default estimation, covariance structure, and df differ from lme4; align them and use lmerTest/pbkrtest for df.",
    "vce_cluster": "Stata vce(cluster) applies a small-sample factor including G/(G-1); match it (for example sandwich::vcovCL type HC1) before comparing SEs.",
    "proc_univariate": "Percentiles: SAS PCTLDEF=5 by default; R quantile() defaults to type 7.",
}

IGNORE_DIRS = {".git", "node_modules", "dist", "build", ".venv", "renv", "__pycache__"}


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


def iter_source_files(scan_dir: Path) -> list[Path]:
    files: list[Path] = []
    for path in scan_dir.rglob("*"):
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in {".sas", ".do", ".ado"}:
            files.append(path)
    return sorted(files)


def collect_patterns(files: list[Path], patterns: dict[str, re.Pattern[str]]) -> dict[str, list[Path]]:
    hits: dict[str, list[Path]] = {name: [] for name in patterns}
    for file_path in files:
        text = file_path.read_text(encoding="utf-8", errors="ignore")
        for name, pattern in patterns.items():
            if pattern.search(text):
                hits[name].append(file_path)
    return {name: paths for name, paths in hits.items() if paths}


def rel_list(root: Path, files: list[Path]) -> str:
    return ", ".join(str(path.relative_to(root)) for path in files)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", default=".", help="Project root for resolving relative paths")
    parser.add_argument("--scan-dir", default=".", help="Project-relative directory to scan")
    parser.add_argument("--report", default="analysis/sas-stata-assessment.md", help="Project-relative report path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        root = resolve_project_root(args.project_root)
        scan_dir = resolve_relative(root, args.scan_dir, "--scan-dir")
        report_path = resolve_relative(root, args.report, "--report")
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if not scan_dir.exists() or not scan_dir.is_dir():
        print(f"Scan directory not found: {scan_dir.relative_to(root)}", file=sys.stderr)
        return 1

    files = iter_source_files(scan_dir)
    sas_files = [path for path in files if path.suffix.lower() == ".sas"]
    stata_files = [path for path in files if path.suffix.lower() in {".do", ".ado"}]
    sas_hits = collect_patterns(sas_files, SAS_PATTERNS)
    stata_hits = collect_patterns(stata_files, STATA_PATTERNS)

    report_lines = [
        "# SAS/Stata Assessment",
        "",
        "Result: ASSESSMENT-ONLY",
        "",
        "## Inventory",
        f"- SAS files: {len(sas_files)}",
        f"- Stata files: {len(stata_files)}",
        "",
        "## SAS Signals",
    ]
    report_lines.extend(
        [f"- `{name}`: {rel_list(root, paths)}" for name, paths in sas_hits.items()] or ["- None"]
    )
    report_lines.extend(["", "## Stata Signals"])
    report_lines.extend(
        [f"- `{name}`: {rel_list(root, paths)}" for name, paths in stata_hits.items()] or ["- None"]
    )
    notes = [PORTING_NOTES[name] for name in list(sas_hits) + list(stata_hits) if name in PORTING_NOTES]
    report_lines.extend(["", "## Defaults to align before comparing a port"])
    report_lines.extend([f"- {note}" for note in dict.fromkeys(notes)] or ["- None detected"])
    report_lines.extend([
        "",
        "## Recommendation",
        "- Do not auto-scaffold new SAS/Stata work from this plugin.",
        "- Keep legacy code runnable where possible and wrap review around outputs.",
        "- Port one bounded output at a time and compare estimates before claiming equivalence.",
    ])

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print(
        "__CE_SAS_STATA_ASSESS__ "
        f"sas_files={len(sas_files)} stata_files={len(stata_files)} report={report_path.relative_to(root)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
