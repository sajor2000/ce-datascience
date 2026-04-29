---
date: 2026-04-27
topic: ce-datascience-fork
---

# CE-DataScience: Compound Engineering for Computational Scientists

## Problem Frame

Biostatisticians, data scientists, and computational researchers working in R, Python (or both) follow a structured analytical workflow — from hypothesis formulation through statistical analysis to reporting — but their planning artifacts (Statistical Analysis Plans) decouple from their analysis code early and never reconnect. SAPs are written in Word, analyses run in Jupyter/marimo/RStudio, and the two drift apart silently. This creates scope creep, post-hoc rationalization, underpowered analyses, and irreproducible results.

The compound engineering loop (brainstorm → plan → work → review → compound) maps naturally onto the data science workflow (hypothesize → design study → execute analysis → review methods/results → document learnings), but the existing CE plugin is built for software engineers shipping features — its skills, agents, and review personas assume code reviews, PRs, and application architecture. A computational scientist opening the current plugin finds 20+ irrelevant skills (Rails reviewers, Swift agents, frontend design) and none of the domain-specific support they need (SAP management, statistical review, reporting checklists).

CE-DataScience forks the proven CE infrastructure and replaces the software-engineering domain layer with one built for computational science — keeping the compound loop, the cross-platform distribution, and the knowledge-accumulation system while adding SAP-code synchronization, statistical rigor review, and reporting checklist compliance.

---

## Actors

- A1. **Computational scientist (primary):** An analyst working in R, Python, or both — may be a clinical biostatistician, health data scientist, academic researcher, or applied data scientist in any domain. Uses notebooks (Jupyter, marimo, Quarto, RMarkdown) and/or scripts. Produces analyses, tables, figures, and reports.
- A2. **Principal investigator / study lead (indirect):** Requests analyses, defines research questions, reviews results. Interacts through the computational scientist, not directly with the harness. Consumes SAP exports and analysis outputs; PI-facing workflows are deferred.
- A3. **Review agents (automated):** Statistical review, reproducibility review, methods review, and reporting checklist agents that evaluate analysis code and outputs.
- A4. **Knowledge system:** The compound learning layer that accumulates institutional methods, validated approaches, and domain conventions over time.

---

## Key Flows

- F1. **Study design brainstorm**
  - **Trigger:** Scientist receives a new research question or dataset
  - **Actors:** A1, A2
  - **Steps:** (1) Scientist invokes `/ce-brainstorm` describing the research question. (2) Harness probes for study design elements: population, exposure/intervention, outcome, study type, confounders. (3) Harness challenges assumptions — appropriate comparison group, sufficient sample size, pre-registration needs. (4) Outputs a structured requirements doc framed as study objectives and design decisions.
  - **Outcome:** A durable study design document that anchors all downstream work.
  - **Covered by:** R18, R19

- F2. **Statistical analysis plan creation**
  - **Trigger:** Study design is finalized; scientist needs a formal SAP
  - **Actors:** A1
  - **Steps:** (1) Scientist invokes `/ce-plan` referencing the study design doc. (2) Harness generates a structured SAP: primary/secondary endpoints, analysis populations, statistical methods, multiplicity adjustments, sensitivity analyses, missing data strategy. (3) SAP is written as a versioned markdown file alongside the analysis code. (4) Harness checks for common SAP gaps (no power calculation, no missing data plan, no pre-specified subgroups).
  - **Outcome:** A machine-readable SAP that lives with the code and can be diffed, versioned, and audited.
  - **Covered by:** R4, R5, R6

- F3. **Analysis execution with SAP tracking**
  - **Trigger:** Scientist begins coding the analysis
  - **Actors:** A1, A3
  - **Steps:** (1) Scientist invokes `/ce-work` to execute analysis tasks from the SAP. (2) Harness generates code scaffolding appropriate to the user's stack profile (language, IDE, libraries; see R1-R3 for configuration). (3) As analyses are written, the harness tracks which SAP sections have been implemented and which remain. (4) If the scientist adds an analysis not in the SAP, the harness flags it as exploratory/post-hoc.
  - **Outcome:** Analysis code with clear traceability to the SAP; deviations are explicitly labeled.
  - **Covered by:** R7, R8, R9, R10

- F4. **Statistical and methodological review**
  - **Trigger:** Analysis is complete or at a review checkpoint
  - **Actors:** A1, A3
  - **Steps:** (1) Scientist invokes `/ce-code-review`. (2) Review agents evaluate: methods appropriateness for data structure, multiplicity handling, assumption verification, reproducibility (seeds, versions, paths), code quality for the chosen language. (3) A reporting checklist agent checks compliance with the relevant guideline (CONSORT, STROBE, TRIPOD, RECORD) based on study type. (4) Findings are presented with confidence calibration.
  - **Outcome:** A structured review identifying methodological, reproducibility, and reporting gaps before results go to the PI.
  - **Covered by:** R11, R12, R13, R14, R15

---

## Requirements

**Stack profile and configuration**

- R1. At first use, the harness prompts the user to configure a stack profile: primary language (R, Python, both), IDE (RStudio, marimo, Jupyter, Quarto), data libraries (polars/pandas/tidyverse/data.table), data layer (parquet/database/Fabric), statistical packages, and reporting framework (Quarto/RMarkdown/marimo). The profile is stored locally and all skills adapt to it.
- R2. The stack profile is editable at any time via `/ce-setup` and can be overridden per-project.
- R3. Skills generate code, scaffolding, and examples in the user's configured language and library preferences — never defaulting to a single language. v1 golden paths: R+tidyverse+Quarto and Python+pandas+Jupyter are primary supported and validated. Other combinations (polars, data.table, marimo, RMarkdown) are best-effort with graceful fallbacks to the golden path for the chosen language.

**Statistical analysis plan (SAP) management**

- R4. `/ce-plan` produces a structured SAP in versioned markdown using a single structured template with optional-depth sections. The template includes: objectives, study design, populations, endpoints (primary/secondary/exploratory), statistical methods, sample size/power (documented decisions; power is not computed in v1), multiplicity adjustments, sensitivity analyses, missing data handling, and subgroup analyses. Study-type-specific template variants (ICH E9, STROBE-aligned, lightweight) are deferred to v2 once the base format is validated.
- R5. The SAP format is parseable — sections use stable identifiers so downstream tools can reference specific SAP items.
- R6. The SAP lives alongside analysis code in the project directory, tracked in version control.

**Analysis execution**

- R7. `/ce-work` adapts to the user's stack profile, generating scaffolding in the appropriate language, notebook format, and library conventions.
- R8. When a SAP exists in the project, `/ce-work` tracks which SAP sections have corresponding analysis code and surfaces unimplemented sections. Tracking operates as a status overlay: at invocation, the harness reads the SAP and current codebase to produce a coverage summary (implemented / not yet implemented / exploratory). This is refreshed per-invocation, not monitored continuously during editing.
- R9. Analyses added that do not map to the SAP are flagged as exploratory/post-hoc, not blocked.
- R10. The harness supports notebook-native and script-based workflows with tiered support: first-class for text-native, diffable formats (Quarto .qmd, RMarkdown .Rmd, plain scripts), best-effort for binary/reactive formats (Jupyter .ipynb, marimo). v1 notebook support means generating new files with appropriate scaffolding — notebook modification (inserting cells into existing notebooks) is deferred.

**Statistical and methodological review**

- R11. `/ce-code-review` dispatches review agents for: (a) methods appropriateness — correct test for data structure, assumption verification, handling of clustering/correlation; (b) multiplicity and bias — multiple comparisons without correction, post-hoc hypotheses, selective reporting; (c) reproducibility — missing seeds, unversioned dependencies, hardcoded paths, missing data provenance.
- R12. A reporting checklist reviewer checks item coverage against STROBE (observational) and CONSORT (RCTs) in v1. Checklists are opt-in — off by default, enabled by the user when the analysis is mature enough for reporting compliance. When the user enables the checklist, the guideline is selected by the user or inferred from the SAP's study type. TRIPOD and RECORD are deferred to v2.
- R13. Review agents for R code quality and Python data science code quality replace the software-engineering language reviewers (Rails, TypeScript, Swift).
- R14. Review findings use the same confidence-calibrated, tiered presentation as CE's existing review system.
- R15a. SAP-drift detection (structural): the review tracks which SAP sections have corresponding analysis code and flags structural deviations — missing pre-specified analyses, extra analyses not in the SAP, or mismatched endpoint counts. This is v1-required.
- R15b. SAP-drift detection (semantic, best-effort): the review attempts to detect semantic deviations — analysis population changed from ITT to per-protocol, primary endpoint operationalized differently than specified, sensitivity analysis modified without SAP amendment. This depends on LLM reasoning capability and must be validated before relying on it (see Dependencies / Assumptions).

**Knowledge compounding**

- R16. `/ce-compound` documents validated analytical approaches, statistical decisions, domain-specific methods, and lessons learned in the same `docs/solutions/` structure, with frontmatter adapted for data science categories (e.g., `problem_type: methods_decision`, `statistical_pattern`, `data_quality_issue`, `reporting_convention`).
- R17. The learnings researcher agent searches accumulated knowledge before new analyses to surface relevant prior work, validated methods, and institutional conventions.

**Brainstorming adaptations**

- R18. `/ce-brainstorm` adapts its rigor probes to study-design context: evidence gap becomes prior literature / pilot data probing, specificity gap becomes study population definition, counterfactual gap becomes clinical equipoise assessment, attachment gap becomes study design appropriateness. Domain-specific probes are added: PICO/PECO framing, comparison group validity, confounding strategy, outcome measurement validity, and feasibility of data access.
- R19. Brainstorm output documents use study-design terminology (research question, hypothesis, study population, exposure, outcome) rather than software terminology (feature, user story, acceptance criteria).

**Plugin structure**

- R20. All software-engineering-specific skills and agents are removed: Rails/TypeScript/Swift reviewers, frontend design, API contract review, CLI readiness, database migration agents, Figma sync, Xcode testing.
- R21. Transferable skills are retained and adapted: brainstorm, plan, work, review, compound, commit, commit-push-pr, debug, ideate, doc-review, sessions, worktree, clean-gone-branches, setup, update.
- R22. The plugin is renamed to `ce-datascience` with updated manifests, descriptions, and marketplace metadata.
- R23. SAS and Stata support is stretch-goal: the harness acknowledges these languages in review and planning but may not generate code for them in v1.

---

## Acceptance Examples

- AE1. **Covers R1, R3.** Given a user configures their stack profile as R + tidyverse + Quarto, when they invoke `/ce-work` to implement a logistic regression from their SAP, the generated scaffolding uses `glm()` with `broom::tidy()` for output, not `sklearn.linear_model.LogisticRegression`.

- AE2. **Covers R8, R9.** Given a SAP specifying three pre-registered endpoints, when the user adds a fourth exploratory outcome analysis, the harness labels it "Exploratory — not in SAP" and continues without blocking.

- AE3. **Covers R11, R12.** Given an observational cohort study analyzing a binary outcome with a t-test, when the user has enabled the STROBE reporting checklist (opt-in per R12), the methods reviewer flags "t-test is inappropriate for a binary outcome; consider logistic regression or chi-squared test" and the reporting reviewer checks STROBE items.

- AE4. **Covers R15.** Given a SAP specifying "intention-to-treat population" as the primary analysis population, when the analysis code filters to per-protocol completers only, the SAP-drift detector flags: "Primary population changed from ITT to per-protocol without SAP amendment."

- AE5. **Covers R18, R19.** Given a user describes "I want to look at whether early mobility reduces ICU length of stay," the brainstorm probes for PICO elements: Population (ICU patients — which unit, which acuity?), Intervention (early mobility — what protocol, what timing?), Comparison (standard care — is it documented?), Outcome (ICU LOS — mean, median, time-to-event?).

---

## Success Criteria

- A computational scientist using ce-datascience can go from research question to reviewed analysis without leaving the compound loop — brainstorm produces a study design, plan produces a SAP, work tracks SAP implementation, review catches methodological and reporting gaps, compound preserves institutional methods.
- The SAP and the analysis code stay synchronized: deviations are flagged, not silent.
- A downstream planner (human or `/ce-plan`) can execute from the requirements doc without inventing study design decisions, statistical methods, or scope boundaries.

---

## Scope Boundaries

### Deferred for later

- Study-type-specific SAP template variants (ICH E9, STROBE-aligned, lightweight) — v1 uses a single structured template with optional depth
- TRIPOD (prediction models) and RECORD (routinely collected data) reporting checklists — v1 supports STROBE and CONSORT only
- SAS/Stata code generation (v1 supports R and Python; SAS/Stata are acknowledged in review and planning but not scaffolded)
- Automated sample size / power calculators (v1 guides the user through the decision but does not compute power itself)
- Integration with clinical trial registries (ClinicalTrials.gov pre-registration)
- Manuscript drafting skill (beyond reporting checklist compliance)
- Multi-site / multi-analyst coordination workflows
- Data quality profiling skill (automated EDA / data dictionary generation)
- Table 1 and publication figure generation skills (high value but separable from the core loop)

### Outside this product's identity

- A statistical computing environment — this is a workflow harness, not a replacement for R/Python/SAS
- An automated analysis tool that runs analyses without the scientist — the scientist writes the code; the harness provides structure, review, and knowledge
- A clinical decision support system or anything with direct patient-care implications
- A replacement for IRB or regulatory review processes

---

## Key Decisions

- **Fork over extend (pending audit):** Fork the full CE plugin rather than layering on top, because the software-engineering assumptions are expected to be deeply embedded. **Before committing to fork, planning must conduct a file-level audit:** classify every file in `plugins/compound-engineering/` as "swap reference file," "replace agent persona," "modify skill logic," or "structural change." If most changes are in the first two categories, reconsider an extension-based approach. The fork inherits the cross-platform infrastructure and compound loop architecture but creates permanent maintenance divergence from actively developed upstream — this ongoing cost must be weighed against the one-time cost of a clean extension.
- **SAP as first-class artifact:** The SAP is a versioned, parseable markdown file that lives with code — not a Word document or external system. This is the structural intervention that prevents plan-code drift.
- **Stack profile over opinionated defaults:** The harness adapts to the user's language/library/IDE preferences rather than prescribing a stack. This matches the "malleable across all types of computational scientist" requirement.
- **Reporting checklists are review-time, not plan-time:** CONSORT/STROBE/TRIPOD/RECORD compliance is checked during review, not enforced during planning, because the appropriate guideline depends on the final study design which may evolve.
- **Configurable SAP templates per study type:** The harness offers ICH E9 for clinical trials, STROBE-aligned for observational studies, and a lightweight template for exploratory work — auto-detected from the brainstorm output, with user override. No single template fits all study types.
- **Reporting checklists are opt-in:** Off by default. The user enables the relevant checklist when the analysis is mature enough for reporting compliance. This avoids noise during early exploratory work.
- **`/ce-plan` dual mode:** `/ce-plan` operates in SAP mode (triggered when a study design brainstorm is the input, producing a structured SAP) or implementation mode (for technical tasks like data pipeline setup or reporting automation, using an adapted implementation plan template). Mode is auto-detected from the input document type with user override.

---

## Dependencies / Assumptions

- The existing CE plugin infrastructure (cross-platform converters, release pipeline, test suite) is portable to a renamed fork without major modification.
- Claude Code (and target platforms) can read and reason about R code, Quarto documents, and notebook formats well enough to provide meaningful statistical review. **Validation gate:** before building review agents, construct a benchmark of 10-15 analysis scripts with known methodological errors (textbook, intermediate, and expert-level difficulty) and test detection rate. Minimum bar: 80% detection on textbook/intermediate errors with <20% false positive rate. If R code review quality is significantly lower than Python, scope R-specific review as a stretch goal.
- The SAP-drift detection (R15) depends on the SAP being structured enough to be machine-parseable — the markdown format in R4/R5 must be designed to support this.
- The user has working R and/or Python environments; the harness does not install or manage language runtimes.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R1][Technical] How should the stack profile be stored — reuse `.compound-engineering/config.local.yaml` or create a new `.ce-datascience/config.yaml`?
- [Affects R8, R15a][Technical] How should the SAP-drift detection agent receive input — dispatched with the full SAP plus analysis code, or structured differently from the existing diff-based review agents?
- [Affects R15b][Needs research] Can Claude reliably detect semantic SAP deviations (e.g., AE4 ITT→per-protocol scenario)? Validate with representative SAP+code pairs before building semantic drift detection.
- [Affects R13][Technical] Which existing review agent architecture (persona catalog, confidence calibration, merge/dedup pipeline) transfers to statistical review, and what needs new design?
- [Affects R20, R21][Technical] Exact inventory of skills/agents to keep, drop, and create — requires a line-by-line audit during planning.

---

## Next Steps

-> `/ce-plan` for structured implementation planning.
