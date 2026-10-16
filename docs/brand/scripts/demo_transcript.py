"""Scripted replay for the README terminal demo.

Every dataset, count and file name here is synthetic. The output is
abridged from the formats the skills define (method-workflow's lifecycle
card, method-sap's claim and estimand schema, method-review's severity
table); it is not a recording of a live run. Keep it in sync with those
skills when their output formats change.

Each scene is a list of (style, text) lines. Style "cmd" lines are typed;
the others appear one by one. Styles map to colours in build_demo.py.
"""

SCENES = [
    [
        ("cmd", "/method-workflow"),
        ("dim", "[method-workflow] Auto-detected: Observational study (generic EHR, Python)"),
        ("dim", "  evidence: data/synthetic/encounters.parquet, analysis/cohort.py"),
        ("", ""),
        ("head", "## Workflow: Observational Study"),
        ("dim", "Language: Python (Jupyter) | Data layer: generic EHR | Data: synthetic"),
        ("", ""),
        ("done", " 1. [done] method-question       analysis/research-question.yaml"),
        ("done", " 2. [done] method-checklist      STROBE + RECORD"),
        ("done", " 3. [done] method-power          analysis/power/report.md"),
        ("done", " 4. [done] method-cohort         analysis/cohort/waterfall.csv"),
        ("done", " 5. [done] method-data-qa        GO, 0 blocking issues"),
        ("wip", " 6. [wip ] method-plan           docs/plans/sap-v0.2.md"),
        ("todo", " 7. [    ] method-sap-workbook"),
        ("todo", " 8. [    ] method-work           Jupyter .ipynb"),
        ("todo", " 9. [    ] method-review"),
        ("", ""),
        ("accent", "Next step: method-sap"),
        ("dim", "  The draft SAP makes a causal claim; link it to an estimand and evidence."),
    ],
    [
        ("cmd", "/method-sap deepen claim C1 in docs/plans/sap-v0.2.md"),
        ("dim", "Data gate: method-data-qa GO | grain: one row per admission | unit: patient"),
        ("", ""),
        ("head", "Claim C1  Antibiotics within 1 h of sepsis onset lower 30-day mortality"),
        ("text", "  Estimand (ICH E9(R1))"),
        ("text", "    treatment      first dose < 1 h vs 1-3 h after onset; time zero = onset"),
        ("text", "    population     adults, first sepsis admission (synthetic, n = 4,812)"),
        ("text", "    variable       death within 30 days of time zero"),
        ("text", "    intercurrent   transfer out -> treatment policy"),
        ("text", "    summary        marginal risk difference, g-computation, bootstrap CI"),
        ("", ""),
        ("text", "  Target trial     clone-censor-weight for the 1-3 h grace period"),
        ("text", "  Diagnostics      weight distribution, positivity by site, E-value"),
        ("", ""),
        ("warn", "  Blocks finalization (2)"),
        ("warn", "    D4  missing lactate (18%): MAR assumed, no MNAR tipping-point analysis"),
        ("warn", "    D6  ICU-transfer exclusion stated only in prose; add a decision row"),
    ],
    [
        ("cmd", "/method-review"),
        ("dim", "Reviewers: methods, causal-inference, reproducibility, python-ds,"),
        ("dim", "  phi-leak, reporting-checklist (STROBE + RECORD), +4 more"),
        ("", ""),
        ("head", "## Code Review Results"),
        ("dim", "Scope: working tree vs main (9 files) | Mode: interactive"),
        ("", ""),
        ("dim", "Sev File                     Issue                                Reviewer"),
        ("p1", "P1  analysis/model.py:88     time zero differs by arm             causal-inference"),
        ("p1", "P1  analysis/impute.py:31    imputation model omits the outcome   methods"),
        ("p2", "P2  analysis/table1.py:12    cells under 11 not suppressed        phi-leak"),
        ("p3", "P3  manuscript/methods.md    RECORD 1.1: data source not named    reporting-checklist"),
        ("", ""),
        ("done", "Applied fix (safe_auto): small-cell suppression in output/table1.csv"),
        ("accent", "Verdict: Not ready. 2 P1 findings need the analyst's decision."),
    ],
]

CAPTION = "Scripted replay on synthetic data. Output abridged from the skills' defined formats."
