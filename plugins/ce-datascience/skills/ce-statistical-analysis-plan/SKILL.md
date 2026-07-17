---
name: ce-statistical-analysis-plan
description: "Create a claims-based Statistical Analysis Plan (SAP), clinical methods section, master-variables dictionary, coordinating-center analysis plan, or claims-based analysis workbook for clinical, EHR/registry, validation, prediction-model, and hospital-benchmarking studies. Use whenever planning analyses or choosing statistical methods for a clinical or observational study."
---

# Claims-Based Statistical Analysis Plan

## Skill Value

**Problem it solves:** Turn a clinical or observational study idea into a traceable analysis contract instead of disconnected methods prose.

**Use when:** Drafting an SAP, methods section, analysis workbook, master-variable catalog, coordinating-center plan, or methodological review.

**Output:** A linked claims, datasets, variables, analyses, diagnostics, outputs, and decision-evidence schema rendered as a workbook, methods section, execution roadmap, or unresolved-decisions review.

**Ask only if:** Study aim, supporting dataset grain, unit of analysis, estimand, or a high-stakes method decision is not established by the supplied materials.

**Do not do:** Present a final method recommendation when the study's analysis unit or data grain is unknown, or silently choose missing-data, causal-timing, or threshold defaults.

## Core Principles

1. **Schema-first, prose-second.** Define study objects before writing workbook tables or methods prose; prose renders the approved schema.
2. **Claims-based organization.** Give every analysis a named scientific claim and estimand. Keep analyses without a claim out of scope.
3. **Dataset-grain awareness.** Map every claim to a supporting dataset, denominator, and unit of analysis before choosing a method.
4. **Diagnostics and sensitivity are first-class outputs.** Attach at least one diagnostic or sensitivity analysis to every primary analysis.
5. **Explicit decisions log.** Record every threshold, recode, exclusion, and nontrivial method choice as an evidence-backed decision.
6. **Executable contract.** Name analysis scripts, output files, cohort scope, and column-level contents so a programmer can implement the plan without inventing specifications.

## Intake and Data Gate

Classify the study's aim (validation, association, prediction, benchmarking, or causal effect) and design (RCT, EHR/registry cohort, cross-sectional, multisite, or other). Capture:

- Study population, inclusion/exclusion criteria, data sources, study window, and site structure.
- Named claims, each with an analysis question and estimand.
- Dataset grain, denominator, identifiers, join keys, and unit of analysis for each claim.
- Exposure/intervention, outcome, covariates, temporal definitions, index date, and follow-up/censoring rules when longitudinal.
- Missing-data mechanism and intended handling, required outputs, and target journal or operational audience.

When data are available, run the `ce-data-qa` skill before finalizing variables or models. Keep the SAP draft when provenance, grain, keys, types, row counts, or missing-data handling are unresolved. For observational or causal claims, also make the estimand, assumptions, treatment strategy, time zero, and success criteria explicit; unresolved choices block finalization.

Use the platform's blocking question tool for load-bearing gaps. If no such tool is available, present concise numbered questions in chat and wait. Do not silently select a default method or analysis unit.

## Build the Schema

Create these linked objects before rendering any output:

| Object | Required content |
|---|---|
| `Study` | Aim, design, population, sites, protocol/version, study window |
| `Dataset` | Source, grain, denominator, keys, refresh/provenance, analysis-ready status |
| `Claim` | Label, plain-language scientific claim, analysis question, estimand |
| `Variable` | Role, category, temporal type, source, grain, coding, and analyses that use it |
| `Analysis` | Claim, question, estimand, unit of analysis, supporting dataset, primary/secondary method, script, output artifact, and decision ID |
| `Diagnostic` | Assumption or failure mode, diagnostic/sensitivity method, trigger, and interpretation |
| `Output` | Filename, subfolder, cohort scope, column-level contents, and interpretation |
| `Decision_Evidence` | Decision, rationale, threshold or rule, uncertainty, and 1–3 method citations |

Map variables to analyses with a visible `used_by` matrix. Give every analysis a plain-language question beside its estimand. Give each full sensitivity replication its own `SA-<name>` analysis row rather than burying it in prose.

## Method and Evidence Routing

Choose methods only after the claim, estimand, unit of analysis, and data structure are known. Account for clustering, repeated measurements, time at risk, competing risks, missingness, validation reference standards, and any benchmarking hierarchy.

For nontrivial choices, record 1–3 citations in `Decision_Evidence`: primary model family, missing-data strategy, competing-risk handling, multilevel structure, agreement metric, composite outcome, causal adjustment, or benchmarking model. Start with an appropriate methods anchor, expand with OpenAlex when needed, and verify a precise claim from full text only when the decision needs it.

At the first live literature search of a session, check whether Paperclip is available. If it is not, offer setup once and continue with `curl PubMed` if setup is declined or unavailable. Never block SAP work on Paperclip, and do not re-offer it in the same session. Use Paperclip or another full-text tool only when an abstract cannot verify a needed formula, cutoff, eligibility rule, or methods claim.

## Required Guardrails

- No method choice before `unit_of_analysis` and dataset grain are defined for that analysis.
- No high-stakes method choice without at least one citation in `Decision_Evidence`.
- No analysis without an explicit missing-data strategy and at least one diagnostic entry.
- No threshold, recode, or exclusion criterion only in prose; record it in `Decision_Evidence`.
- No vague phrase such as “appropriate tests were used”; name the method, estimand, and evidence-backed rationale.
- Do not treat model discrimination as causal balance, post-treatment variables as baseline confounders, or an undocumented time zero as acceptable.

When an immediate answer is required but grain or unit of analysis is unknown, make the uncertainty part of the pasteable recommendation:

```text
[PROVISIONAL — unit of analysis not yet confirmed] <method name>, <one-line justification and its required assumption>.
```

Name the likely method and the assumption it rests on, but do not present the choice as final until the schema is complete.

## Render the Requested Output

| Mode | Produce |
|---|---|
| Workbook | `Overview`, `Outputs`, `Master_Variables`, and `Decision_Evidence` tables with cross-table identifiers |
| Methods | Manuscript-ready prose rendered from the schema with inline citations |
| Execution | Section and script roadmap with input-to-output mappings and validation gates |
| Review | Unresolved decisions, assumptions, missing inputs, and their blocking status |

For a new CE DataScience SAP, use `ce-plan` for the durable study-plan artifact and `ce-sap-tabular` for the biostatistics-style workbook companion. Keep this skill's claims and decision identifiers aligned with those artifacts rather than creating competing plans.

Before rendering, verify that every claim maps to a dataset and grain, every analysis maps to a claim and output, every output names an interpretation, and every nontrivial decision has evidence. In review mode, clearly separate confirmed integrity blockers from methodological questions requiring analyst resolution.
