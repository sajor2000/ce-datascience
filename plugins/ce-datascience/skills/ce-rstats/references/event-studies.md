# R Event Studies

Event-study code can look conventional while using an invalid comparison set, treatment clock, or staggered-adoption estimator.

- **Use for:** The study uses difference-in-differences, event time, treatment adoption, panel fixed effects, or dynamic treatment effects.
- **Output:** A design contract, estimator rationale, diagnostic plan, and R implementation guidance.
- **Ask only if:** Treatment timing, comparison group, estimand, or unit/time grain is unresolved.
- **Do not do:** Do not infer parallel trends, treatment dates, or never-treated comparison units from incomplete data.

## Required design contract

1. State unit, calendar time, treatment time, time zero, estimand, adoption pattern, and comparison group.
2. Identify anticipation windows, post-treatment covariates, attrition/censoring, and the event-time reference period.
3. For staggered adoption, select an estimator appropriate to heterogeneous effects and timing; do not treat a two-way fixed-effects coefficient as automatically valid.
   Candidate heterogeneity-robust estimators (verify against the pinned package docs): Callaway-Sant'Anna group-time ATTs (`did`; J Econometrics 2021, DOI 10.1016/j.jeconom.2020.12.001), Sun-Abraham interaction-weighted event study (`fixest::sunab()`; DOI 10.1016/j.jeconom.2020.09.006), Borusyak-Jaravel-Spiess imputation (`didimputation`; Rev Econ Stud 2024, DOI 10.1093/restud/rdae007), de Chaisemartin-D'Haultfoeuille (`DIDmultiplegtDYN`). Diagnose a TWFE fit with a Goodman-Bacon decomposition (`bacondecomp`; DOI 10.1016/j.jeconom.2021.03.014).
4. Pre-specify event-window truncation, clustering, weights, and sensitivity analyses.
5. Inspect cohort balance, treatment timing, and event-time support before fitting a model.
6. Report diagnostics and limitations as evidence; never label an unsupported pre-trend as proof of parallel trends. Treat a non-significant pre-trend test as low-power evidence and report sensitivity bounds for violations of parallel trends (`HonestDiD`; Rambachan & Roth, Rev Econ Stud 2023, DOI 10.1093/restud/rdad018).
7. Separate statistical-method evidence from package syntax: use Ref MCP for the pinned estimator package's documentation and use Tavily MCP only to discover primary methodological sources when needed. Do not infer an estimator's identification assumptions from its R interface.

If a research tool is unavailable, disclose that the method-source check could not be completed and retain the design question as an analyst decision.

## Handoff

Load `ce-plan` to lock the design; add `ce-statistical-analysis-plan` only when a complex clinical study needs the deeper claim-to-dataset schema. Then load `ce-code-review` to audit timing, immortal-time risk, and estimator assumptions before reporting effects.
