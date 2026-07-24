---
name: ce-r-event-studies
description: "Plan, implement, or review R event-study and difference-in-differences analyses, including staggered treatment adoption, treatment timing, fixed effects, dynamic effects, and diagnostics."
argument-hint: "[plan|implement|review]"
---

# R Event Studies

## Skill Value

- **Problem it solves:** Event-study code can look conventional while using an invalid comparison set, treatment clock, or staggered-adoption estimator.
- **Use when:** The study uses difference-in-differences, event time, treatment adoption, panel fixed effects, or dynamic treatment effects.
- **Output:** A design contract, estimator rationale, diagnostic plan, and R implementation guidance.
- **Ask only if:** Treatment timing, comparison group, estimand, or unit/time grain is unresolved.
- **Do not do:** Do not infer parallel trends, treatment dates, or never-treated comparison units from incomplete data.

## Required design contract

1. State unit, calendar time, treatment time, time zero, estimand, adoption pattern, and comparison group.
2. Identify anticipation windows, post-treatment covariates, attrition/censoring, and the event-time reference period.
3. For staggered adoption, select an estimator appropriate to heterogeneous effects and timing; do not treat a two-way fixed-effects coefficient as automatically valid.
4. Pre-specify event-window truncation, clustering, weights, and sensitivity analyses.
5. Inspect cohort balance, treatment timing, and event-time support before fitting a model.
6. Report diagnostics and limitations as evidence; never label an unsupported pre-trend as proof of parallel trends.

## Handoff

Use `/ce-plan` or `/ce-statistical-analysis-plan` to lock the design, then `/ce-code-review` to audit timing, immortal-time risk, and estimator assumptions before reporting effects.
