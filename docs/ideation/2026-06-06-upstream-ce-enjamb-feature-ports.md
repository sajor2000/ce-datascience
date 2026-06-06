---
title: Upstream CE and Enjamb-Informed Feature Ports
status: active
date: 2026-06-06
source: ce-ideate
---

# Upstream CE and Enjamb-Informed Feature Ports

## Pull Status

Fetched the latest upstream Compound Engineering code into this repo on
2026-06-06:

- `upstream/main` is available locally at `6f9ab03a`.
- Latest fetched upstream tags include `compound-engineering-v3.11.1` and
  `cli-v3.11.1`.
- Directly merging `upstream/main` into `ce-datascience` is unsafe: upstream is
  organized around `plugins/compound-engineering`, while this fork is a curated
  health data science plugin under `plugins/ce-datascience`. A direct merge
  would delete or overwrite large parts of the data science plugin surface.

Treat upstream CE as a source for selective ports, not as a wholesale merge
target.

## Enjamb Signals

Public sources only were reviewed; this is not a hands-on product validation.

- [Enjamb homepage](https://www.enjamb.ai/) frames the product as an agentic
  workspace for literature review, methodology design, data analysis, grants,
  figures, and manuscript drafting.
- [Enjamb IRE vision](https://www.enjamb.ai/blog/the-integrated-research-environment)
  emphasizes a unified research workspace with Word, LaTeX, Excel, PowerPoint,
  Python/R compute, reference management, task management, file storage,
  scientific canvas, and traceable integrations.
- [Enjamb pre-seed post](https://www.enjamb.ai/blog/announcing-backing-from-y-combinator)
  describes full-text literature reviews, validated methodology design,
  procurement-ready materials lists, Python/R data analysis, publication-quality
  figures, journal templates, grant proposals, and traceable outputs.
- [Y Combinator profile](https://www.ycombinator.com/companies/enjamb-labs)
  adds the drug-development framing: clinical evidence synthesis, regulatory
  documents such as INDs, protocols, SAPs, NDAs, and statistical programming
  including SDTM, ADaM, TFLs, and QC.
- [Enjamb privacy policy](https://www.enjamb.ai/privacy-policy) notes stored
  research artifacts such as documents, references, figures, datasets, tasks,
  comments, chat threads, and optional Zotero/GitHub integrations.

## Current Plugin Fit

`ce-datascience` already has strong pieces of this lifecycle:

- Research framing: `ce-research-question`, `ce-brainstorm`, `ce-plan`.
- Literature and methods: `ce-pubmed`, `ce-literature-search`,
  `ce-method-extract`, `ce-effect-size`.
- Data and analysis control: `ce-data-qa`, `ce-bioinfo-qc`, `ce-cohort-build`,
  `ce-work`, `ce-verify`, `ce-sprint`.
- Manuscript and reporting: `ce-checklist-match`, `ce-code-review`,
  `ce-table1`, `ce-figure`, `ce-model-card`, `ce-manuscript-package`,
  `ce-prereg`, `ce-review-pack`.

The gaps are less about adding generic chat and more about connecting these
skills into traceable, collaborative, submission-ready workflows.

## Ranked Candidates

### 1. Port upstream resolver hardening

Port the latest upstream `ce-resolve-pr-feedback` safety fixes into the adapted
data science resolver:

- Fail loudly when owner/repo auto-detection fails instead of exiting silently
  under `set -e`.
- Verify review thread IDs before replying/resolving so GitHub Enterprise node
  ID mismatches do not post replies on the wrong PR thread.

This is the highest reliability value because it prevents real PR workflow
damage.

### 2. Resolve missing `ce-proof` and `ce-demo-reel` references

Several `ce-datascience` skills already reference `ce-proof` and `ce-demo-reel`,
but those skills are not installed in `plugins/ce-datascience/skills`.

Options:

- Port `ce-proof` as an optional collaborative markdown review skill for SAPs,
  brainstorm docs, manuscript drafts, and PI review packs.
- Port `ce-demo-reel` as evidence capture for demos and PRs.
- Or remove/gate those menu options when the upstream CE plugin is not present.

Porting is attractive because Enjamb-like collaboration and visible evidence are
direct product gaps, but both need optional-dependency wording and corporate
install caveats.

### 3. Port upstream `ce-plan` approach-altitude flow

Upstream `ce-plan` now supports "plan the approach" / "plan for a plan" and
answer-seeking routing. `ce-datascience` should adapt this while preserving SAP
mode and the required data-QA-before-SAP rule.

Use case: users ask broad research or platform questions where a plan for how
to evaluate the problem is safer than inventing a deliverable immediately.

### 4. Build `ce-evidence-map`

Extend the current PubMed/literature/method-extract stack into a source-backed
evidence map:

- structured query set
- included/excluded paper table
- claim-to-source matrix
- methods and effect-size extraction handoff
- BibTeX/reference export
- clear "abstract only" vs "full text verified" status

This is the closest local-plugin analogue to Enjamb's source-traceable
literature review claims.

### 5. Build journal submission preflight

Add a `ce-journal-preflight` or extend `ce-manuscript-package` to inspect target
journal instructions and verify:

- manuscript sections
- word/page limits
- figure/table format and DPI/export requirements
- citation/bibliography presence
- reporting checklist attachments
- supplement/package completeness

This complements existing Table 1, figure, checklist, and manuscript package
skills.

### 6. Add grant discovery and package workflow

Create `ce-grant-match` and/or `ce-grant-package` for NIH/NSF/foundation style
work:

- match research profile or PICO to active opportunities
- generate a fit/risk table
- draft specific aims, significance, innovation, approach outline
- create biosketch/facilities/budget-justification checklist placeholders

This is a true missing lifecycle stage.

### 7. Add regulatory/TFL assessment

For clinical-trial or regulated research workflows, add a scoped assessment
skill before full implementation:

- inventory SDTM, ADaM, TFL, QC, and analysis dataset expectations
- assess whether the project is regulatory-facing or manuscript-only
- output TFL shell gaps and QC plan needs

Do not overpromise full SDTM/ADaM generation until fixtures, examples, and
domain review exist.

### 8. Add scientific diagram and export workflow

Extend `ce-figure` toward mechanism/pathway/workflow diagrams:

- figure intent and source-data/provenance manifest
- optional generated image or diagram prompt
- required human review gate
- export checklist for TIFF, EPS, SVG, PDF, and PNG
- alt text and caption generation

Avoid fake biological accuracy claims; the plugin should make provenance and
review status explicit.

### 9. Add protocol/SOP extraction

Add `ce-protocol-extract` for protocol and SOP synthesis from papers,
supplements, lab SOPs, and methods sections:

- stepwise methods table
- parameters and equipment/materials table
- uncertainty and missing-detail flags
- handoff into SAP, preregistration, or workflow execution

This captures the useful part of Enjamb's methodology design without pretending
to generate procurement orders by default.

### 10. Strengthen multi-CSV pattern discovery under `ce-data-qa`

Add an exploratory pattern-discovery mode that profiles many CSVs or extracts
before SAP/modeling:

- column schemas and grains across files
- obvious quality defects
- candidate relationships and keys
- high-level signal inventory
- strict warning that this is pre-SAP exploration, not inferential modeling

This builds on the existing "look at columns first" rule.

## Defer For Now

- Do not wholesale port Rails, frontend, Xcode, DHH style, or product-pulse
  skills into the default plugin; they dilute health data science focus.
- Do not port `lfg` as an autonomous science-analysis runner. Statistical and
  clinical work needs human checkpoints, SAP locks, and audit gates.
- Do not clone Enjamb as a cloud workspace. The plugin should stay local,
  installable, platform-portable, and explicit about optional external services.
