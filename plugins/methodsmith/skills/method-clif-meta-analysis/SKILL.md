---
name: method-clif-meta-analysis
description: "Plans formal R/Python meta-analysis. Use when pooling CLIF site effects or conducting a literature systematic review."
---

# CLIF and literature meta-analysis

## Skill Value

- **Problem it solves:** Site and study estimates can be pooled despite incompatible targets, dependence, failed models or mismatched software methods.
- **Use when:** Formal synthesis needs a CLIF site-to-lead contract or a literature-review protocol and R/Python analysis.
- **Output:** Validated aggregate inputs, executable synthesis source, site/study dispositions, diagnostics and a methods/reporting package.
- **Ask only if:** A material estimand, independence, protocol or release decision remains unresolved after reviewing supplied evidence.
- **Do not do:** Treat checklist coverage or passing code tests as statistical or clinical approval, or centralize patient data.

## Choose the design and estimand

Use the user's protocol, SAP, configuration, and existing decisions first.
Resolve material unknowns before fitting: population, comparison, outcome,
time origin and horizon, effect measure and direction, adjustment set,
conditional versus marginal estimand, independent sampling unit, and primary
model. Record unresolved items explicitly rather than choosing a convenient
pooling model.

- **CLIF federated analysis:** sites run common versioned code locally and send
  reviewed aggregate estimates to the lead. Read
  [references/federated.md](references/federated.md). No literature search or
  PRISMA flow diagram is needed merely because several sites contribute.
- **Literature synthesis:** studies are located, selected, appraised, and
  extracted under a review protocol. Read
  [references/literature.md](references/literature.md), including when source
  studies happen to use CLIF.

**Check:** write a short design/estimand record and identify which units can
contribute to each synthesis. If no compatible independent units exist, deliver
the exclusion/reconciliation record and a structured synthesis without pooling.

## Validate before pooling

Read [references/statistical-methods.md](references/statistical-methods.md)
and, when generating runnable code,
[references/coding.md](references/coding.md). The bundled code covers only
independent scalar estimates with known standard errors. It does not establish
that submitted summaries are private, scientifically compatible, or unbiased.

Require explicit effect scale, estimand, units, outcome horizon, adjustment,
model and code versions, uncertainty, and status for every site/study. Keep
failed, suppressed, missing, and excluded units in the accounting. Never encode
a failed model as zero effect or zero variance. Resolve duplicate cohorts,
overlapping sites, multiple outcomes, shared controls, and repeated estimates
before an independent-effects fit. Use a justified covariance/multilevel method
or select one estimate per independent unit under the protocol.

**Check:** save the input contract, all-unit disposition table, compatibility
checks and independence rationale. Stop a fit on incompatible or invalid inputs.
An explicit assertion is an audit trail, not proof of independence.

## Fit and challenge the planned synthesis

Choose common-effect or random-effects inference from the scientific target,
not from a Q-test P value or an I-squared cutoff. Record the heterogeneity
estimator, interval method, small-sample adjustment, transformations, and
software versions explicitly. R/metafor REML and Python/statsmodels
Paule-Mandel are different methods. Never call the latter REML or claim parity
without a matched-method numerical comparison.
When explaining Python `method_re="iterated"` or `"pm"`, explicitly name
Paule-Mandel and the selected interval. Saying only "not REML" is incomplete.

Report the estimate and uncertainty, independent-unit count, weights,
heterogeneity, applicable prediction interval, influence/leave-one-out checks,
and prespecified sensitivity analyses. Explain unstable inference with few
sites/studies. Do not run Egger's test automatically, interpret funnel asymmetry
as proof of publication bias, or run literature-publication diagnostics on a
fixed consortium roster without a relevant selection mechanism.

**Check:** execute the current source, retain commands/logs and environment
versions, and compare a synthetic result against a documented numerical fixture
or an independent calculation. Mark unexecuted paths and unsupported models.

## Deliver and hand back

Deliver editable R/Python source, configuration/input dictionary, reviewed
aggregate disposition and pooled tables, forest plot where applicable, methods
text, source provenance, sensitivity results, and an explicit limitations record.
Register reportable aggregates through `method-numbers` and draft manuscript results
with `{{num:id}}` placeholders. Retain computed JSON as analysis output.
For literature reviews, also deliver search and screening records, risk-of-bias
and certainty assessments, and a completed applicable reporting checklist with
artifact locations. Never invent registrations, reviewer decisions, approvals,
or missing results.

For CLIF, give sites a versioned lead report with local-versus-pooled estimates,
dispositions, diagnostics and queries for reconciliation. Returning a pooled
coefficient does not authorize applying a global predictive model clinically.
Keep patient data at the site and require local governance review of every
outgoing aggregate, including small cells and potentially revealing parameters.

**Done when:** authorized artifacts exist, relevant checks have run, numerical
and behavioral checks are recorded, and unresolved scientific or runtime limits
are named. Consult [references/sources.md](references/sources.md) for primary
guidelines and API documentation. Verify the current version when adopting a
tool, checklist, or registry policy.
