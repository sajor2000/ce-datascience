---
name: ce-statistical-analysis-plan
description: "Deepen a clinical or observational SAP with a claims-to-datasets schema, estimands, diagnostics, and decision evidence. Use when a complex EHR/registry, validation, prediction, causal, multisite, or benchmarking design needs more depth after ce-plan establishes the canonical plan."
---

# Claims-Based Statistical Analysis Plan

## Skill Value

**Problem it solves:** Turn a clinical or observational study idea into a traceable analysis contract instead of disconnected methods prose.

**Use when:** A clinical or observational SAP needs claim-level linkage among datasets, variables, estimands, diagnostics, outputs, and evidence-backed decisions.

**Output:** A linked claims, datasets, variables, analyses, diagnostics, outputs, and decision-evidence schema for the canonical SAP, or an unresolved-decisions review.

**Ask only if:** Study aim, supporting dataset grain, unit of analysis, estimand, or a high-stakes method decision is not established by the supplied materials.

**Do not do:** Create a competing SAP, own workbook rendering, draft final manuscript prose, present a final method recommendation when data grain is unknown, or silently choose missing-data, causal-timing, or threshold defaults.

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

Consume an existing `__CE_MODEL_STRATEGY__` handoff when present. For a nontrivial primary model decision without one, load `ce-model-strategy` after the data gate. Only `ready_for_review` strategy details may populate an execution-ready model specification; carry `blocked` or `provisional` decisions into the unresolved-decisions review.

Use the platform's blocking question tool for load-bearing gaps. If no such tool is available, present concise numbered questions in chat and wait. Do not silently select a default method or analysis unit.

## Build the Schema

Create these linked objects before rendering any output:

| Object | Required content |
|---|---|
| `Study` | Aim, design, population, sites, protocol/version, study window |
| `Dataset` | Source, grain, denominator, keys, refresh/provenance, analysis-ready status |
| `Claim` | Label, plain-language scientific claim, analysis question, estimand |
| `Variable` | Role, category, temporal type, source, grain, coding, and analyses that use it |
| `Analysis` | Claim, question, estimand, unit of analysis, supporting dataset, primary/secondary method, model-strategy memo, script, output artifact, and decision ID |
| `Diagnostic` | Assumption or failure mode, diagnostic/sensitivity method, trigger, and interpretation |
| `Output` | Filename, subfolder, cohort scope, column-level contents, and interpretation |
| `Decision_Evidence` | Decision, rationale, threshold or rule, uncertainty, and 1–3 method citations |

Map variables to analyses with a visible `used_by` matrix. Give every analysis a plain-language question beside its estimand. Give each full sensitivity replication its own `SA-<name>` analysis row rather than burying it in prose.

## Method and Evidence Routing

Choose methods only after the claim, estimand, unit of analysis, and data structure are known. Use `ce-model-strategy` to resolve the primary family, link, dependence structure, diagnostics, fallback triggers, and stack-matched scaffold. Account for clustering, repeated measurements, time at risk, competing risks, missingness, validation reference standards, and any benchmarking hierarchy.

For nontrivial choices, record 1–3 citations in `Decision_Evidence`: primary model family, missing-data strategy, competing-risk handling, multilevel structure, agreement metric, composite outcome, causal adjustment, or benchmarking model. Find a methods anchor with the Evidence access tools below, read it before citing it, and record PMID/DOI plus the evidence label on the row.

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** estimand and analysis-method precedents for each `Decision_Evidence` row, plus the missing-data and sensitivity-analysis conventions for the design (RCT, EHR/registry cohort, target-trial emulation, validation, prediction, or benchmarking).

At the first literature lookup of a session, check once which of these servers is connected; never block SAP work on either, do not re-offer setup in the same session, and use the `ce-pubmed` script, not ad hoc HTTP calls, when no PubMed server is connected. Use full text only when an abstract cannot verify a needed formula, cutoff, eligibility rule, or methods claim.

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

## Hand Off the Schema

| Need | Owner |
|---|---|
| Canonical versioned SAP or implementation roadmap | `ce-plan` |
| Primary model choice and R/Python scaffold | `ce-model-strategy` |
| `Overview`, `Outputs`, and `Master Variables` workbook | `ce-sap-tabular` |
| Final Methods prose and section boundaries | `ce-manuscript-section-discipline` |
| Citation verification and editable Word fields | `ce-manuscript-citations` |
| Unresolved claim/dataset/schema decisions | This skill |

For a new CE DataScience SAP, use `ce-plan` for the durable study-plan artifact. Add this schema to that artifact, then use `ce-sap-tabular` for the workbook companion. Keep claim and decision identifiers aligned rather than creating competing plans.

Before handoff, verify that every claim maps to a dataset and grain, every analysis maps to a claim and output, every output names an interpretation, and every nontrivial decision has evidence. In review mode, clearly separate confirmed integrity blockers from methodological questions requiring analyst resolution.
