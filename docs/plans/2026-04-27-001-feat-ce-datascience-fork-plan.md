---
title: CE-DataScience Fork — Data Science Compound Engineering Plugin
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-ce-datascience-fork-requirements.md
---

# CE-DataScience Fork — Data Science Compound Engineering Plugin

## Overview

Fork the compound-engineering plugin to create `ce-datascience`, a compound engineering harness for computational scientists working in R, Python, or both. The fork replaces the software-engineering domain layer (Rails/TypeScript/Swift reviewers, frontend design, API contract review) with data science equivalents (statistical review, SAP management, reporting checklist compliance) while preserving the compound loop architecture, cross-platform distribution, and knowledge accumulation system.

---

## Problem Frame

Biostatisticians and computational researchers follow a structured analytical workflow — hypothesis through analysis to reporting — but their planning artifacts (Statistical Analysis Plans) decouple from analysis code early and never reconnect. SAPs live in Word, analyses run in notebooks, and the two drift apart silently. This causes scope creep, post-hoc rationalization, underpowered analyses, and irreproducible results.

The compound engineering loop maps naturally onto this workflow, but the existing CE plugin assumes software engineering: its 53 agents include Rails reviewers, Swift agents, and frontend design personas — none of the domain-specific support a computational scientist needs. CE-DataScience replaces the software-engineering domain layer while keeping the proven infrastructure. (see origin: `docs/brainstorms/2026-04-27-ce-datascience-fork-requirements.md`)

---

## Requirements Trace

- R1. Stack profile: language, IDE, libraries, data layer, reporting framework — prompted at first use
- R2. Stack profile editable via `/ce-setup`, overridable per-project
- R3. Code generation in user's configured stack; golden paths: R+tidyverse+Quarto, Python+pandas+Jupyter
- R4. `/ce-plan` produces structured SAP in versioned markdown with stable identifiers
- R5. SAP format is parseable — sections use stable IDs for downstream reference
- R6. SAP lives alongside analysis code in version control
- R7. `/ce-work` adapts scaffolding to stack profile
- R8. `/ce-work` tracks SAP section implementation coverage per-invocation
- R9. Non-SAP analyses flagged as exploratory/post-hoc, not blocked
- R10. Tiered notebook support: first-class for text-native (Quarto, RMarkdown, scripts), best-effort for binary/reactive (Jupyter, marimo)
- R11. `/ce-code-review` dispatches: methods appropriateness, multiplicity/bias, reproducibility agents
- R12. Reporting checklist reviewer: STROBE + CONSORT in v1, opt-in, guideline selected by user or inferred from SAP
- R13. R and Python data science code quality reviewers replace software-eng language reviewers
- R14. Review findings use confidence-calibrated, tiered presentation (inherited from CE)
- R15a. SAP-drift detection (structural): section-level tracking of missing/extra analyses
- R15b. SAP-drift detection (semantic, best-effort): detect population, endpoint, method deviations via LLM reasoning
- R16. `/ce-compound` documents analytical approaches with data science frontmatter categories
- R17. Learnings researcher searches accumulated knowledge before new analyses
- R18. `/ce-brainstorm` adapts rigor probes to study design (PICO/PECO, confounding, equipoise)
- R19. Brainstorm outputs use study-design terminology
- R20. All software-engineering-specific skills and agents removed
- R21. Transferable skills retained and adapted
- R22. Plugin renamed to `ce-datascience` with updated manifests
- R23. SAS/Stata support is stretch-goal (acknowledged in review/planning, not scaffolded)

**Origin actors:** A1 (computational scientist, primary), A2 (PI/study lead, indirect — interacts through A1), A3 (review agents, automated), A4 (knowledge system)
**Origin flows:** F1 (study design brainstorm), F2 (SAP creation), F3 (analysis execution with SAP tracking), F4 (statistical and methodological review)
**Origin acceptance examples:** AE1 (covers R1, R3), AE2 (covers R8, R9), AE3 (covers R11, R12), AE4 (covers R15), AE5 (covers R18, R19)

---

## Scope Boundaries

### Deferred for later

Carried from origin — product/version sequencing:
- Study-type-specific SAP template variants (ICH E9, STROBE-aligned, lightweight) — v1 uses a single template with optional depth
- TRIPOD and RECORD reporting checklists — v1 supports STROBE and CONSORT only
- SAS/Stata code generation — v1 supports R and Python only
- Automated sample size / power calculators
- Clinical trial registry integration (ClinicalTrials.gov)
- Manuscript drafting skill
- Multi-site / multi-analyst coordination
- Data quality profiling skill (automated EDA / data dictionary)
- Table 1 and publication figure generation skills
- Notebook modification (inserting cells into existing notebooks) — v1 generates new files only

### Outside this product's identity

Carried from origin — positioning rejection:
- A statistical computing environment (this is a workflow harness)
- An automated analysis tool that runs analyses without the scientist
- A clinical decision support system
- A replacement for IRB or regulatory review processes

### Deferred to Follow-Up Work

- Upstream sync strategy — once the fork diverges, cherry-picking infrastructure improvements from `compound-engineering` upstream is a separate process
- PI-facing workflows (A2 direct interaction) — v1 serves A2 through A1
- Marketplace listing and publication — separate from implementation

---

## Context & Research

### Relevant Code and Patterns

- **Plugin architecture**: 100% Markdown + scripts. Skills are self-contained directories (`SKILL.md` + `references/` + `scripts/`). Agents are flat `.agent.md` files under `agents/`. No cross-skill references allowed (converter portability).
- **Compound loop**: `ce-ideate` -> `ce-brainstorm` -> `ce-plan` -> `ce-work` -> `ce-code-review` -> `ce-compound`, with `ce-learnings-researcher` closing the feedback loop.
- **Review dispatch**: `ce-code-review` uses 6 always-on + up to 12 conditional reviewers. Structured JSON findings with 5-anchor confidence scale, autofix classification, and synthesis pipeline.
- **Config system**: `.compound-engineering/config.local.yaml` at repo root, read via pre-resolution `!` backtick commands with worktree fallback.
- **Cross-platform**: Authored once for Claude Code, distributed via marketplace manifests (`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`) and converter CLI (`src/converters/`).
- **Multi-plugin pattern**: `coding-tutor` already exists as a second plugin under `plugins/`, demonstrating multi-plugin support in the repo.
- **Knowledge schema**: `docs/solutions/` with YAML frontmatter. Two tracks (bug/knowledge) with domain-specific enums for `component`, `root_cause`, `resolution_type`.

### Institutional Learnings

- **Pipeline separation** (`docs/solutions/skill-design/research-agent-pipeline-separation-2026-04-05.md`): brainstorm/plan/work stages are separated by information type. Brainstorm gathers WHAT context, plan gathers HOW context. Maps to data science: brainstorm = research question, plan = analysis design, work = code execution.
- **Confidence-anchored scoring** (`docs/solutions/skill-design/confidence-anchored-scoring-2026-04-21.md`): 5 discrete anchors (0/25/50/75/100). Threshold depends on domain economics: >= 50 for document review (no linter backstop), >= 75 for code review. Statistical review should use >= 50 for SAP review (no automated backstop) and >= 75 for code-level review.
- **Beta skills framework** (`docs/solutions/skill-design/beta-skills-framework.md`): `-beta` suffix for safe rollout of new skills. Useful for incremental domain adaptation.
- **Self-containment rule**: Each skill directory is copied as an isolated unit by converters. Shared files must be duplicated into each skill's directory.
- **Prefer Python for pipeline scripts**: Use Python for any script that chains 2+ tools.

### External References

- STROBE Statement checklist: 22-item checklist for observational studies
- CONSORT Statement: 25-item checklist for randomized controlled trials
- ICH E9 guidelines: Statistical principles for clinical trials (deferred to v2)

---

## Key Technical Decisions

- **Fork confirmed by audit**: The file-level audit classified 170+ files: 66% keep-as-is (infrastructure), 17% modify (domain adaptation), 21% swap/replace (software-eng-specific). Most changes are content swaps (new agent personas, skill rewrites), not structural redesign. The fork is justified because the user wants a standalone, curated product — a data scientist should see zero Rails reviewers, not the same plugin with extra skills added. The architecture transfers directly.

- **Keep `ce-` prefix**: The prefix is collision-avoidance against platform built-ins (`/plan`, `/review`), not branding. Changing to `ds-` would require rewiring all cross-references and the converter system with no functional benefit. The plugin name `ce-datascience` distinguishes it at the product level.

- **Config directory**: `.ce-datascience/config.local.yaml` (new directory matching plugin name). Follows the same pre-resolution reading pattern as `.compound-engineering/config.local.yaml` with worktree fallback and `__NO_CONFIG__` sentinel.

- **SAP-drift input model**: The SAP-drift agent receives file paths to the full SAP and the analysis code directory (not diffs). This differs from the existing diff-based review agents because drift detection requires full SAP context, not just changed lines. Dispatched alongside other review agents during `/ce-code-review`.

- **Review confidence thresholds**: >= 50 for SAP/methods review (no automated backstop, false negatives more costly than false positives), >= 75 for code quality review (follows existing pattern). Cross-persona corroboration promotes one anchor step.

- **Knowledge schema adaptation**: Replace the `component` enum (currently Rails/frontend-centric) with data science components. Add data-science-specific `problem_type` values to the knowledge track. Preserve the two-track (bug/knowledge) structure.

- **SAP as single structured template with optional depth**: v1 uses one template with sections that can be expanded or collapsed based on study complexity. Study-type-specific variants (ICH E9, STROBE-aligned) deferred to v2 per origin decision.

---

## Open Questions

### Resolved During Planning

- **Fork vs extend** (origin Key Decision): Resolved by audit. Fork confirmed — 66% keep-as-is means the architecture transfers, but the 21% swap/replace and the need for a curated data-science-only experience justify a standalone fork over an extension within the same plugin.

- **Stack profile storage** (origin Q1, affects R1): Use `.ce-datascience/config.local.yaml`. New directory name avoids collision with upstream. Same pre-resolution reading pattern.

- **SAP-drift agent input model** (origin Q2, affects R8, R15a): Dispatch with full SAP file path + analysis code directory path. Differs from diff-based review agents because drift detection needs full document context.

- **Review architecture transfer** (origin Q4, affects R13): The persona catalog, confidence calibration, merge/dedup pipeline, and findings schema transfer directly. New personas need domain-specific calibration bands and dispatch conditions. The `ce-code-review` SKILL.md orchestrator needs its conditional persona selector updated for data science signals instead of software-eng signals.

- **Exact keep/drop/create inventory** (origin Q5, affects R20, R21): Resolved by file-level audit — see U1 approach for complete classification.

### Deferred to Implementation

- **Semantic SAP drift reliability** (origin Q3, affects R15b): Can Claude reliably detect semantic deviations (ITT -> per-protocol, endpoint operationalization changes)? Must be validated with representative SAP+code pairs during U10. If detection rate is below 60%, scope R15b as advisory-only with explicit confidence disclaimers.

- **R code reasoning quality**: Claude's ability to review R code for methodological errors is less validated than Python. The benchmark in U10 must include R-specific test cases. If R review quality is significantly lower, scope R-specific statistical review as best-effort.

- **Notebook format handling**: How well can Claude reason about `.ipynb` JSON structure vs. `.qmd`/`.Rmd` text formats? Text-native formats are first-class; binary/reactive formats need implementation-time testing to determine the quality floor.

---

## Output Structure

```
plugins/ce-datascience/
├── .claude-plugin/
│   └── plugin.json
├── .cursor-plugin/
│   └── plugin.json
├── .codex-plugin/
│   └── plugin.json
├── agents/
│   ├── ce-*.agent.md                    # Retained universal agents (26)
│   ├── ce-methods-reviewer.agent.md     # NEW: statistical methods appropriateness
│   ├── ce-multiplicity-reviewer.agent.md # NEW: multiple comparisons, bias
│   ├── ce-reproducibility-reviewer.agent.md # NEW: seeds, versions, paths, provenance
│   ├── ce-reporting-checklist-reviewer.agent.md # NEW: STROBE/CONSORT compliance
│   ├── ce-sap-drift-detector.agent.md   # NEW: SAP-code synchronization
│   ├── ce-r-code-reviewer.agent.md      # NEW: R code quality
│   └── ce-python-ds-reviewer.agent.md   # NEW: Python data science quality
├── skills/
│   ├── ce-brainstorm/                   # MODIFIED: PICO/PECO probes, study design terminology
│   ├── ce-plan/                         # MODIFIED: SAP mode + implementation mode
│   ├── ce-work/                         # MODIFIED: stack-profile scaffolding, SAP tracking
│   ├── ce-code-review/                  # MODIFIED: data science review dispatch
│   ├── ce-compound/                     # MODIFIED: data science knowledge schema
│   ├── ce-setup/                        # MODIFIED: stack profile configuration
│   ├── ce-commit/                       # RETAINED as-is
│   ├── ce-commit-push-pr/              # RETAINED as-is
│   ├── ce-clean-gone-branches/         # RETAINED as-is
│   ├── ce-debug/                       # RETAINED as-is
│   ├── ce-doc-review/                  # RETAINED as-is
│   ├── ce-ideate/                      # RETAINED as-is
│   ├── ce-sessions/                    # RETAINED as-is
│   ├── ce-update/                      # RETAINED as-is
│   ├── ce-worktree/                    # RETAINED as-is
│   └── ce-compound-refresh/            # RETAINED as-is
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── LICENSE
```

---

## High-Level Technical Design

> *Directional guidance for review, not implementation specification.*

### SAP Template Structure (R4, R5)

```markdown
---
sap_version: 1
study_type: observational | rct | exploratory | other
date_created: YYYY-MM-DD
date_amended: YYYY-MM-DD
status: draft | final | amended
---

# Statistical Analysis Plan: [Study Title]

## SAP-1: Study Objectives
### SAP-1.1: Primary Objective
### SAP-1.2: Secondary Objectives
### SAP-1.3: Exploratory Objectives

## SAP-2: Study Design
### SAP-2.1: Study Type
### SAP-2.2: Study Population
### SAP-2.3: Exposure / Intervention
### SAP-2.4: Comparator

## SAP-3: Endpoints
### SAP-3.1: Primary Endpoint(s)
### SAP-3.2: Secondary Endpoint(s)
### SAP-3.3: Exploratory Endpoint(s)

## SAP-4: Analysis Populations
### SAP-4.1: Primary Analysis Population
### SAP-4.2: Sensitivity Populations

## SAP-5: Statistical Methods
### SAP-5.1: Primary Analysis
### SAP-5.2: Secondary Analyses
### SAP-5.3: Subgroup Analyses

## SAP-6: Sample Size and Power
## SAP-7: Multiplicity Adjustments
## SAP-8: Missing Data Handling
## SAP-9: Sensitivity Analyses
## SAP-10: Tables, Figures, and Listings
```

Stable `SAP-N.M` identifiers enable downstream tools to reference specific sections. The structural drift detector maps analysis code files to SAP section IDs.

### Stack Profile Config Schema

```yaml
# .ce-datascience/config.local.yaml
stack_profile:
  language: r | python | both
  ide: rstudio | jupyter | marimo | quarto | vscode
  data_libraries:
    r: [tidyverse, data.table]
    python: [pandas, polars]
  data_layer: parquet | database | fabric
  statistical_packages:
    r: [stats, survival, lme4]
    python: [scipy, statsmodels, scikit-learn]
  reporting: quarto | rmarkdown | marimo | jupyter

reporting_checklist:
  enabled: false
  guideline: null  # strobe | consort — set when user opts in
```

### Review Dispatch Adaptation

The `ce-code-review` conditional persona selector changes from software-eng signals to data science signals:

| Signal in diff/context | Agent dispatched |
|------------------------|------------------|
| Statistical test calls, model fitting | `ce-methods-reviewer` |
| Multiple endpoints, p-value corrections | `ce-multiplicity-reviewer` |
| Missing seeds, hardcoded paths, no dependency versions | `ce-reproducibility-reviewer` |
| SAP file exists in project | `ce-sap-drift-detector` |
| Reporting checklist enabled in config | `ce-reporting-checklist-reviewer` |
| `.R`, `.Rmd`, `.qmd` files | `ce-r-code-reviewer` |
| `.py`, `.ipynb` with data science imports | `ce-python-ds-reviewer` |

Always-on reviewers retained from CE: `ce-correctness-reviewer`, `ce-maintainability-reviewer`, `ce-testing-reviewer`, `ce-project-standards-reviewer`, `ce-learnings-researcher`.

---

## Implementation Units

### Phase 1: Infrastructure

- U1. **Fork Cleanup and Plugin Rename**

**Goal:** Strip all software-engineering-specific content, rename the plugin, and update manifests to create a clean `ce-datascience` plugin.

**Requirements:** R20, R21, R22

**Dependencies:** None — this is the foundation for all other units.

**Files:**
- Delete (agents): `ce-ankane-readme-writer`, `ce-dhh-rails-reviewer`, `ce-julik-frontend-races-reviewer`, `ce-kieran-rails-reviewer`, `ce-kieran-typescript-reviewer`, `ce-swift-ios-reviewer`, `ce-figma-design-sync`, `ce-design-implementation-reviewer`, `ce-schema-drift-detector`
- Delete (skills): `ce-dhh-rails-style/`, `ce-frontend-design/`, `ce-test-browser/`, `ce-test-xcode/`, `ce-polish-beta/`, `ce-agent-native-architecture/`, `ce-agent-native-audit/`, `ce-demo-reel/`, `ce-gemini-imagegen/`, `ce-release-notes/`, `ce-report-bug/`, `ce-resolve-pr-feedback/`, `ce-session-extract/`, `ce-session-inventory/`, `ce-slack-research/`, `ce-optimize/`, `ce-proof/`, `ce-work-beta/`, `lfg/`
- Delete (agents, modify-track not needed in v1): `ce-data-integrity-guardian`, `ce-data-migration-expert`, `ce-data-migrations-reviewer`, `ce-deployment-verification-agent`, `ce-api-contract-reviewer`, `ce-cli-agent-readiness-reviewer`, `ce-cli-readiness-reviewer`, `ce-agent-native-reviewer`, `ce-design-iterator`
- Modify: `plugins/ce-datascience/.claude-plugin/plugin.json` (rename, description)
- Modify: `plugins/ce-datascience/.cursor-plugin/plugin.json` (rename, description)
- Modify: `plugins/ce-datascience/.codex-plugin/plugin.json` (rename, description)
- Modify: `plugins/ce-datascience/AGENTS.md` (strip software-eng authoring context, add data science context)
- Modify: `plugins/ce-datascience/README.md` (rewrite for data science audience)

**Approach:**
- Rename `plugins/compound-engineering/` to `plugins/ce-datascience/`
- Delete software-eng-specific agents and skills per the audit classification
- Retain: 14 universal agents + `ce-kieran-python-reviewer` (Python is core to DS) + `ce-performance-oracle` + `ce-performance-reviewer` + `ce-reliability-reviewer` + `ce-security-reviewer` + `ce-security-sentinel` + `ce-security-lens-reviewer` + research/workflow agents
- Retain: 16 universal skills (brainstorm, plan, work, code-review, compound, compound-refresh, commit, commit-push-pr, debug, doc-review, ideate, sessions, setup, update, worktree, clean-gone-branches)
- Update all three marketplace manifests with new name `ce-datascience` and description
- Update root marketplace files (`.claude-plugin/marketplace.json`, etc.)
- Update release-please config for new plugin path
- Rewrite `README.md` for data science audience with accurate component counts

**Patterns to follow:**
- `plugins/coding-tutor/` as reference for multi-plugin structure
- Existing marketplace manifest format

**Test scenarios:**
- Happy path: `bun run release:validate` passes after rename with all three manifests in parity
- Happy path: `bun test` passes — no references to deleted agents/skills remain in converter tests
- Edge case: No cross-references to deleted skills remain in retained skills (grep for deleted names)

**Verification:**
- Plugin directory contains only data-science-relevant agents and skills
- All marketplace manifests reference `ce-datascience` with matching versions/descriptions
- No orphaned references to deleted components

---

- U2. **Stack Profile Configuration System**

**Goal:** Implement the stack profile that adapts all skills to the user's language, IDE, library, and reporting preferences.

**Requirements:** R1, R2, R3

**Dependencies:** U1

**Files:**
- Create: `plugins/ce-datascience/skills/ce-setup/references/stack-profile-template.yaml`
- Modify: `plugins/ce-datascience/skills/ce-setup/SKILL.md`
- Modify: `plugins/ce-datascience/skills/ce-setup/references/` (health check adapted for R/Python)

**Approach:**
- Design config schema with `stack_profile` section (see High-Level Technical Design)
- Store at `.ce-datascience/config.local.yaml` (gitignored)
- `ce-setup` prompts for profile at first use using the blocking question tool: language -> IDE -> data libraries -> data layer -> statistical packages -> reporting framework
- Profile is editable anytime via `/ce-setup` (detect existing config, offer to modify)
- Per-project override via project-level `.ce-datascience/config.local.yaml`
- Pre-resolution command reads the config at skill load time with worktree fallback
- Golden path validation: warn (not block) if combination is outside R+tidyverse+Quarto or Python+pandas+Jupyter

**Patterns to follow:**
- Existing `.compound-engineering/config.local.yaml` reading pattern with `git rev-parse --show-toplevel` and worktree fallback
- `ce-setup` skill's existing health-check flow

**Test scenarios:**
- Happy path: First-time user runs `/ce-setup`, answers prompts, config file created with correct schema
- Happy path: Existing user runs `/ce-setup`, sees current profile, modifies language preference
- Edge case: User selects "both" for language — config correctly stores dual-language preferences
- Edge case: User selects polars + marimo (non-golden path) — warning shown, setup completes
- Edge case: No git repo — config created in CWD, no worktree fallback attempted

**Verification:**
- Config file is created with valid YAML matching the schema
- Other skills (brainstorm, plan, work, review) can read the profile via pre-resolution
- Golden path combinations produce no warnings

---

### Phase 2: Core Loop Adaptation

- U3. **SAP Template and Plan Dual-Mode**

**Goal:** Create the SAP markdown template and adapt `/ce-plan` to operate in SAP mode (producing a structured SAP from a study design brainstorm) or implementation mode (for technical tasks).

**Requirements:** R4, R5, R6

**Dependencies:** U1

**Files:**
- Create: `plugins/ce-datascience/skills/ce-plan/references/sap-template.md`
- Create: `plugins/ce-datascience/skills/ce-plan/references/sap-gap-checklist.md`
- Modify: `plugins/ce-datascience/skills/ce-plan/SKILL.md`

**Approach:**
- SAP template uses stable `SAP-N.M` section identifiers (see High-Level Technical Design)
- YAML frontmatter includes `sap_version`, `study_type`, `date_created`, `date_amended`, `status`
- SAP is written to project directory (e.g., `analysis/sap.md` or user-specified path), tracked in version control
- Mode auto-detection: if input document is a study design brainstorm (contains study population, exposure, outcome keywords), enter SAP mode; otherwise enter implementation mode
- SAP gap checklist: no power calculation decision, no missing data plan, no pre-specified subgroups, no multiplicity plan, no sensitivity analyses
- Implementation mode uses the existing plan template with minimal adaptation (study-neutral terminology)
- User can override auto-detected mode

**Patterns to follow:**
- Existing `ce-plan` SKILL.md structure (Phase 0-5 workflow)
- Plan template in `references/` loaded via backtick path

**Test scenarios:**
- Happy path (AE coverage for R4): Study design brainstorm input -> auto-detects SAP mode -> produces structured SAP with all template sections populated
- Happy path: Technical task input -> auto-detects implementation mode -> produces standard plan
- Edge case: SAP with no power calculation -> gap checklist flags "Sample size/power: decision not documented"
- Edge case: User overrides SAP mode for a technical task -> implementation template used despite study keywords
- Integration: SAP written alongside analysis code in project directory, parseable by downstream SAP-drift agent

**Verification:**
- SAP file is valid markdown with YAML frontmatter and stable `SAP-N.M` identifiers
- Gap checklist catches common SAP omissions
- Mode auto-detection correctly classifies study design vs. technical inputs

---

- U4. **Brainstorm Adaptation for Study Design**

**Goal:** Adapt `/ce-brainstorm` rigor probes and output terminology for study design context.

**Requirements:** R18, R19

**Dependencies:** U1

**Files:**
- Modify: `plugins/ce-datascience/skills/ce-brainstorm/SKILL.md`
- Modify: `plugins/ce-datascience/skills/ce-brainstorm/references/requirements-capture.md`

**Approach:**
- Replace Phase 1.2 rigor probes with study-design equivalents:
  - Evidence gap -> prior literature / pilot data probing ("What existing evidence supports this research question?")
  - Specificity gap -> study population definition ("Can you describe the specific population — inclusion/exclusion criteria, setting, timeframe?")
  - Counterfactual gap -> clinical equipoise assessment ("What is the current standard of care / comparison group? Is equipoise established?")
  - Attachment gap -> study design appropriateness ("Is this the right study design for the question? Could a simpler design answer it?")
- Add domain-specific probes: PICO/PECO framing, comparison group validity, confounding strategy, outcome measurement validity, data access feasibility
- Phase 2 approaches use study-design framing (different study designs, different analysis strategies) rather than implementation alternatives
- Requirements capture template uses study-design terminology: research question, hypothesis, study population, exposure, outcome, study type — not feature, user story, acceptance criteria
- Keep the brainstorm infrastructure intact (scope assessment, dialogue flow, Phase 0-4 structure)

**Patterns to follow:**
- Existing `ce-brainstorm` SKILL.md structure
- Origin document AE5 for PICO probe example

**Test scenarios:**
- Happy path (AE5 coverage): User describes "I want to look at whether early mobility reduces ICU length of stay" -> brainstorm probes for PICO: Population (ICU patients — unit? acuity?), Intervention (early mobility — protocol? timing?), Comparison (standard care — documented?), Outcome (ICU LOS — mean? median? time-to-event?)
- Happy path: Output document uses study-design headings (Research Question, Study Design, Study Population, Exposure, Outcome)
- Edge case: Non-clinical research question (public health ecological study) -> probes adapt to PECO (Population, Exposure, Comparison, Outcome)
- Edge case: Exploratory data analysis with no hypothesis -> brainstorm classifies as Lightweight, minimal rigor probing

**Verification:**
- Rigor probes fire study-design questions, not software-engineering questions
- Output document is readable by a biostatistician without software engineering jargon
- Handoff to `/ce-plan` correctly routes to SAP mode

---

- U5. **Work Skill Adaptation with SAP Tracking**

**Goal:** Adapt `/ce-work` to generate stack-profile-aware scaffolding and track SAP implementation coverage.

**Requirements:** R7, R8, R9, R10

**Dependencies:** U2 (stack profile), U3 (SAP template)

**Files:**
- Modify: `plugins/ce-datascience/skills/ce-work/SKILL.md`
- Create: `plugins/ce-datascience/skills/ce-work/references/sap-tracking.md`
- Create: `plugins/ce-datascience/skills/ce-work/references/scaffolding-templates.md`

**Approach:**
- At invocation, read stack profile from config. Generate scaffolding in the user's configured language, notebook format, and library conventions:
  - R+tidyverse+Quarto: `.qmd` files with `library(tidyverse)`, `broom::tidy()` output patterns
  - Python+pandas+Jupyter: `.ipynb` or `.py` files with `import pandas as pd` patterns
  - Other combinations: best-effort adaptation of golden path patterns
- SAP tracking operates as a status overlay: at `/ce-work` invocation, read SAP file and current codebase to produce a coverage summary:
  - For each `SAP-N.M` section, check if corresponding analysis code exists (file naming conventions, code comments referencing SAP IDs, or content matching)
  - Summarize: implemented / not yet implemented / exploratory (code exists without SAP mapping)
  - Refresh per-invocation, not continuously monitored
- Non-SAP analyses flagged with a comment header: `# Exploratory — not in SAP` (or equivalent in the file format)
- Tiered notebook support:
  - First-class: Quarto `.qmd`, RMarkdown `.Rmd`, plain `.R`/`.py` scripts — generate new files with full scaffolding
  - Best-effort: Jupyter `.ipynb` (generate new notebooks with appropriate cell structure), marimo (generate `.py` marimo files)

**Patterns to follow:**
- Existing `ce-work` SKILL.md structure (task creation, sub-agent dispatch, incremental commits)
- Stack profile pre-resolution reading pattern from U2

**Test scenarios:**
- Happy path (AE1 coverage): Stack profile = R+tidyverse+Quarto, SAP specifies logistic regression -> scaffolding uses `glm()` with `broom::tidy()`, not `sklearn`
- Happy path (AE2 coverage): SAP has 3 pre-registered endpoints, user adds 4th analysis -> harness labels it "Exploratory — not in SAP" and continues
- Happy path: SAP tracking summary shows "SAP-5.1: Implemented (analysis/primary.qmd), SAP-5.2: Not implemented, SAP-5.3: Not implemented"
- Edge case: No SAP exists -> scaffolding generated normally, no tracking overlay
- Edge case: Stack profile = Python+polars+marimo (non-golden path) -> best-effort scaffolding with polars imports

**Verification:**
- Scaffolding matches the user's configured stack profile
- SAP coverage summary correctly identifies implemented vs. unimplemented sections
- Exploratory analyses are labeled, not blocked

---

### Phase 3: Review System

- U6. **Statistical Review Agents**

**Goal:** Create three new review agents for statistical methodology, multiplicity/bias, and reproducibility that replace the software-engineering language reviewers.

**Requirements:** R11, R13, R14

**Dependencies:** U1

**Files:**
- Create: `plugins/ce-datascience/agents/ce-methods-reviewer.agent.md`
- Create: `plugins/ce-datascience/agents/ce-multiplicity-reviewer.agent.md`
- Create: `plugins/ce-datascience/agents/ce-reproducibility-reviewer.agent.md`

**Approach:**
- **ce-methods-reviewer**: Reviews statistical test selection against data structure. Checks: correct test for outcome type (binary -> logistic regression, continuous -> linear regression, time-to-event -> Cox), assumption verification (normality, homoscedasticity, independence), handling of clustering/correlation (mixed models for nested data, GEE for repeated measures), appropriate handling of confounders. Confidence threshold >= 50 (no automated backstop).
- **ce-multiplicity-reviewer**: Reviews multiple comparisons handling. Checks: number of primary/secondary endpoints, pre-specified correction method (Bonferroni, Holm, FDR), post-hoc hypotheses without correction, selective reporting indicators, subgroup analyses without pre-specification, p-hacking signals. Confidence threshold >= 50.
- **ce-reproducibility-reviewer**: Reviews analysis reproducibility. Checks: random seeds set and documented, R/Python package versions pinned (renv/conda/pip freeze), hardcoded file paths, data provenance documented, intermediate results saved, environment specification (Dockerfile, renv.lock, requirements.txt). Confidence threshold >= 75 (these are checkable facts).
- All agents return structured JSON conforming to the existing `findings-schema.json` with `autofix_class`, `severity`, `confidence`, and `evidence` fields.
- Model tier: `ce-methods-reviewer` inherits session model (highest-stakes analysis); others use mid-tier.

**Patterns to follow:**
- Existing agent `.agent.md` format with YAML frontmatter
- `ce-correctness-reviewer` as structural template (always-on, returns findings JSON)
- Confidence-anchored scoring pattern from `docs/solutions/skill-design/confidence-anchored-scoring-2026-04-21.md`

**Test scenarios:**
- Happy path (AE3 partial): Observational study with binary outcome analyzed by t-test -> `ce-methods-reviewer` flags "t-test inappropriate for binary outcome; consider logistic regression or chi-squared test"
- Happy path: Analysis with 5 secondary endpoints and no multiplicity correction -> `ce-multiplicity-reviewer` flags missing correction
- Happy path: Script uses `set.seed(42)` and `renv.lock` exists -> `ce-reproducibility-reviewer` finds no issues
- Edge case: Mixed-effects model for clustered data -> methods reviewer confirms appropriate choice
- Edge case: Analysis uses relative paths but no data provenance documentation -> reproducibility reviewer flags provenance gap

**Verification:**
- Each agent produces valid findings JSON matching the schema
- Findings use appropriate confidence anchors (not arbitrary scores)
- Agent descriptions correctly scope their review domain

---

- U7. **Reporting Checklist and SAP-Drift Agents**

**Goal:** Create agents for reporting guideline compliance (STROBE/CONSORT) and SAP-code drift detection.

**Requirements:** R12, R15a, R15b

**Dependencies:** U3 (SAP template)

**Files:**
- Create: `plugins/ce-datascience/agents/ce-reporting-checklist-reviewer.agent.md`
- Create: `plugins/ce-datascience/skills/ce-code-review/references/strobe-checklist.md`
- Create: `plugins/ce-datascience/skills/ce-code-review/references/consort-checklist.md`
- Create: `plugins/ce-datascience/agents/ce-sap-drift-detector.agent.md`

**Approach:**
- **ce-reporting-checklist-reviewer**: Opt-in (off by default, enabled in config). When enabled, checks analysis code and outputs against the relevant guideline:
  - STROBE (22 items): title/abstract, introduction, methods (study design, setting, participants, variables, data sources, bias, study size, quantitative variables, statistical methods), results (participants, descriptive data, outcome data, main results, other analyses), discussion, other information
  - CONSORT (25 items): title/abstract, introduction, methods (trial design, participants, interventions, outcomes, sample size, randomization, blinding, statistical methods), results, discussion, other information
  - Guideline selected by user or auto-inferred from SAP `study_type` field (`observational` -> STROBE, `rct` -> CONSORT)
  - Reports item-by-item coverage: addressed / partially addressed / not addressed / not applicable
  - Confidence threshold >= 50

- **ce-sap-drift-detector**: Dispatched when a SAP file exists in the project. Two tiers:
  - **Structural (R15a, v1-required)**: Reads SAP `SAP-N.M` sections and maps them to analysis code files. Reports: missing pre-specified analyses (SAP section with no corresponding code), extra analyses not in SAP (code files with no SAP mapping), mismatched endpoint counts.
  - **Semantic (R15b, best-effort)**: Attempts to detect semantic deviations by comparing SAP prose against code behavior: analysis population changes (ITT -> per-protocol), endpoint operationalization differences, method substitutions. Explicitly labeled as best-effort with confidence calibration — findings below 50 are suppressed.
  - Input: file paths to SAP and analysis code directory (not diffs)
  - Output: structured findings JSON with `drift_type: structural | semantic` field

**Patterns to follow:**
- Existing conditional reviewer dispatch pattern in `ce-code-review`
- STROBE and CONSORT checklists stored as reference files (loaded by agent via backtick path)

**Test scenarios:**
- Happy path (AE3 partial): User enables STROBE checklist for observational study -> reviewer reports coverage against 22 items
- Happy path (AE4 coverage): SAP specifies "intention-to-treat population," code filters to per-protocol completers -> drift detector flags "Primary population changed from ITT to per-protocol without SAP amendment"
- Happy path: SAP has 3 primary endpoints, code implements all 3 -> structural drift check passes
- Edge case: Reporting checklist disabled (default) -> agent not dispatched
- Edge case: SAP specifies logistic regression, code uses Cox model -> semantic drift detected (best-effort)
- Edge case: Exploratory analysis (no SAP mapping) -> drift detector ignores (already flagged by ce-work)

**Verification:**
- Reporting checklist correctly maps items from STROBE/CONSORT to analysis code
- Structural drift detection correctly counts SAP sections vs. code files
- Semantic drift findings are explicitly labeled as best-effort with calibrated confidence

---

- U8. **Code Review Dispatch Adaptation and Language Reviewers**

**Goal:** Update the `ce-code-review` skill's conditional persona selector for data science signals and create R and Python data science code quality reviewers.

**Requirements:** R13, R14, R11 (dispatch)

**Dependencies:** U1, U6, U7

**Files:**
- Create: `plugins/ce-datascience/agents/ce-r-code-reviewer.agent.md`
- Create: `plugins/ce-datascience/agents/ce-python-ds-reviewer.agent.md`
- Modify: `plugins/ce-datascience/skills/ce-code-review/SKILL.md`
- Modify: `plugins/ce-datascience/skills/ce-code-review/references/` (update conditional dispatch table)

**Approach:**
- **ce-r-code-reviewer**: Reviews R code for data science quality. Checks: tidyverse vs base R consistency (match user's profile), appropriate use of `dplyr` verbs, proper pipe usage, `ggplot2` layer ordering, data.table syntax correctness, proper use of `purrr` for iteration (not nested loops), NSE vs tidy eval patterns, package namespace conflicts. Confidence threshold >= 75.
- **ce-python-ds-reviewer**: Reviews Python data science code quality. Checks: pandas anti-patterns (chained indexing, iterating over rows), proper vectorization, memory efficiency (dtypes, chunked reading), sklearn pipeline usage, proper train/test splitting, data leakage patterns (fitting on test data, target leakage). Replaces `ce-kieran-python-reviewer` with data-science-specific focus. Confidence threshold >= 75.
- Update `ce-code-review` SKILL.md conditional dispatch:
  - Remove software-eng conditions (Rails files, TypeScript, Swift, Stimulus/Turbo, schema.rb)
  - Add data science conditions (see dispatch table in High-Level Technical Design)
  - Retain always-on reviewers: correctness, maintainability, testing, project-standards, learnings-researcher
  - Add new always-on when SAP exists: sap-drift-detector
  - Add new conditional: methods, multiplicity, reproducibility, reporting-checklist, r-code, python-ds

**Patterns to follow:**
- Existing `ce-code-review` SKILL.md conditional dispatch structure
- `ce-kieran-python-reviewer` as structural template for language-specific review

**Test scenarios:**
- Happy path: R analysis file with `library(tidyverse)` -> dispatches `ce-r-code-reviewer` + applicable statistical reviewers
- Happy path: Python file with `import pandas as pd` and `from sklearn import` -> dispatches `ce-python-ds-reviewer` + applicable statistical reviewers
- Happy path: SAP exists in project -> `ce-sap-drift-detector` dispatched alongside other reviewers
- Edge case: File with both R and Python (e.g., Quarto doc with both engines) -> both language reviewers dispatched
- Edge case: No statistical tests in code (data wrangling only) -> methods and multiplicity reviewers not dispatched
- Integration: All reviewer findings merge through existing synthesis pipeline without schema conflicts

**Verification:**
- Software-eng reviewers (Rails, TypeScript, Swift) are fully removed from dispatch
- Data science reviewers dispatch correctly based on file content signals
- Findings from all reviewers merge cleanly through the existing synthesis pipeline

---

### Phase 4: Knowledge & Validation

- U9. **Knowledge Schema Adaptation**

**Goal:** Adapt the `docs/solutions/` knowledge schema for data science categories and update `/ce-compound` accordingly.

**Requirements:** R16, R17

**Dependencies:** U1

**Files:**
- Modify: `plugins/ce-datascience/skills/ce-compound/references/schema.yaml`
- Modify: `plugins/ce-datascience/skills/ce-compound/SKILL.md`
- Modify: `plugins/ce-datascience/skills/ce-compound/references/` (category mapping)

**Approach:**
- Replace the `component` enum with data science components:
  ```
  data_ingestion, data_cleaning, feature_engineering, statistical_analysis,
  model_training, model_evaluation, visualization, reporting,
  reproducibility, data_pipeline, environment_setup, documentation, tooling
  ```
- Add data science `problem_type` values to the knowledge track:
  ```
  methods_decision, statistical_pattern, data_quality_issue,
  reporting_convention, reproducibility_pattern
  ```
  These supplement the existing knowledge-track values (best_practice, architecture_pattern, etc.)
- Add data science `root_cause` values to the bug track:
  ```
  data_quality_issue, wrong_statistical_test, assumption_violation,
  data_leakage, missing_seed, unversioned_dependency
  ```
- Update `ce-compound` SKILL.md to use data science language in its prompts and examples
- `ce-learnings-researcher` requires no changes — it searches by frontmatter fields and is domain-agnostic

**Patterns to follow:**
- Existing `schema.yaml` two-track structure
- Existing `ce-compound` SKILL.md workflow (Context Analyzer, Solution Extractor, Related Docs Finder)

**Test scenarios:**
- Happy path: User solves a "wrong statistical test" problem -> `/ce-compound` captures it with `problem_type: methods_decision`, `component: statistical_analysis`
- Happy path: Learnings researcher finds the captured learning when planning a similar analysis
- Edge case: Problem that spans data cleaning and statistical analysis -> `component: statistical_analysis`, `related_components: [data_cleaning]`

**Verification:**
- Schema validates with the new enum values
- Existing validation script (`scripts/validate-frontmatter.py`) works with the adapted schema
- Learnings researcher correctly searches new category values

---

- U10. **Validation Benchmark**

**Goal:** Construct and execute a benchmark of analysis scripts with known methodological errors to validate Claude's statistical review capability before relying on the review agents.

**Requirements:** Dependencies/Assumptions from origin doc

**Dependencies:** U6, U7, U8

**Files:**
- Create: `tests/benchmark/` directory with 10-15 test scripts
- Create: `tests/benchmark/README.md` (benchmark methodology)
- Create: `tests/benchmark/expected-findings.json` (ground truth)

**Approach:**
- Construct 10-15 analysis scripts (mix of R and Python) with known methodological errors at three difficulty levels:
  - **Textbook** (5 scripts): t-test on binary outcome, no correction for multiple comparisons, no random seed, missing data deletion without justification, wrong confidence interval for proportion
  - **Intermediate** (5 scripts): logistic regression without checking linearity in logit, clustered data analyzed without mixed models, survival analysis with informative censoring not addressed, time-varying confounders handled with baseline-only adjustment, model selection by stepwise p-value
  - **Expert** (3-5 scripts): immortal time bias, conditioning on a collider, using change scores when ANCOVA is appropriate, ecological fallacy in aggregated data, measurement error ignored in exposure
- Include scripts with NO errors (control for false positive rate)
- Run each script through `ce-methods-reviewer`, `ce-multiplicity-reviewer`, `ce-reproducibility-reviewer`
- Score: detection rate per difficulty level, false positive rate on clean scripts
- **Minimum bar**: 80% detection on textbook/intermediate errors, <20% false positive rate
- If R detection rate is significantly lower than Python, document the gap and scope R review as best-effort
- For semantic SAP drift (R15b): include 3 SAP+code pairs with known semantic deviations (ITT->per-protocol, endpoint change, method substitution) and test detection rate

**Patterns to follow:**
- Test fixture structure in `tests/fixtures/`

**Test scenarios:**
- Happy path: Benchmark scores >= 80% on textbook/intermediate, <20% FPR -> proceed with full review agent deployment
- Degraded: R detection significantly lower than Python -> scope R-specific statistical review as best-effort with documentation
- Degraded: Semantic drift detection below 60% -> scope R15b as advisory-only with explicit confidence disclaimers
- Fail: Below minimum bar on textbook errors -> redesign agent prompts, retry benchmark

**Verification:**
- Benchmark results are documented with detection rates per difficulty level
- Decision on R review scope and semantic drift scope is recorded based on benchmark results
- Minimum bar thresholds are met before review agents are considered production-ready

---

## System-Wide Impact

- **Interaction graph:** Skills dispatch agents via the platform's sub-agent primitive. The stack profile config is read at skill load time via pre-resolution. The SAP file is read at invocation time by `ce-work` (tracking) and `ce-code-review` (drift detection). The knowledge store is searched by `ce-learnings-researcher` during planning and review.
- **Error propagation:** Missing stack profile falls back to Python+pandas defaults. Missing SAP means no tracking overlay (not an error). Failed review agents are noted in Coverage section (inherited behavior). Config read failures produce `__NO_CONFIG__` sentinel.
- **State lifecycle risks:** SAP file is the single source of truth for drift detection — if the SAP is edited outside the harness, drift detection still works (re-reads per invocation). Stack profile is per-machine state; no risk of stale shared state.
- **API surface parity:** All retained skills continue to work on all platforms (Claude Code, Cursor, Codex, etc.) through the converter system. New agents use the same dispatch patterns.
- **Unchanged invariants:** The compound loop (brainstorm -> plan -> work -> review -> compound) structure is unchanged. The findings schema JSON contract is unchanged. The cross-platform interaction patterns are unchanged. The self-containment rule for skills is unchanged.

---

## Alternative Approaches Considered

- **Extension within the same plugin**: Add data science agents/skills alongside software-engineering ones, gate via config. Rejected because the user experience would be cluttered — a data scientist would see 50+ irrelevant agents alongside the 7 they need. The curated experience matters more than avoiding maintenance divergence.

- **New plugin in the same repo** (like `coding-tutor`): Create `plugins/ce-datascience/` alongside `plugins/compound-engineering/`. Would avoid forking the repo entirely. Rejected because it would require duplicating all retained skills into the new plugin (self-containment rule) and maintaining two copies — the fork is cleaner.

- **Thin wrapper with config-driven persona selection**: Keep one plugin, use config to swap between software-eng and data science modes. Rejected because the skills themselves need different content (brainstorm probes, plan templates, work scaffolding), not just different agent dispatch. The domain adaptation runs deeper than agent selection.

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Claude's statistical review quality insufficient for meaningful feedback | Medium | High | Validation benchmark (U10) with minimum bar before deployment. If below threshold, scope as advisory-only |
| R code reasoning significantly weaker than Python | Medium | Medium | Benchmark includes R-specific test cases. If confirmed, scope R review as best-effort |
| SAP semantic drift detection unreliable | High | Low | R15b is already scoped as best-effort. Structural drift (R15a) is the v1 requirement |
| Upstream CE plugin evolves, fork falls behind on infrastructure improvements | Medium | Medium | Accept as trade-off of fork approach. Infrastructure changes are infrequent and can be cherry-picked |
| Stack profile combinatorial complexity creates untestable surface | Low | Medium | Golden paths (R+tidyverse+Quarto, Python+pandas+Jupyter) are primary-supported; others are best-effort with graceful fallback |
| Notebook format handling (`.ipynb` JSON) produces lower-quality review | Medium | Low | Text-native formats (`.qmd`, `.Rmd`, `.py`, `.R`) are first-class; notebook review quality is a known limitation |

---

## Phased Delivery

**Phase 1 — Infrastructure (U1, U2):** Fork cleanup, rename, stack profile. After this phase, the plugin is installable and recognizable as `ce-datascience` with a clean agent/skill inventory. Estimated: 1-2 work sessions.

**Phase 2 — Core Loop (U3, U4, U5):** SAP template, brainstorm adaptation, work skill adaptation. After this phase, the brainstorm -> plan -> work loop is fully adapted for data science. Estimated: 2-3 work sessions.

**Phase 3 — Review System (U6, U7, U8):** Statistical review agents, reporting checklist, SAP-drift detection, code review dispatch. After this phase, the full compound loop is functional. Estimated: 2-3 work sessions.

**Phase 4 — Knowledge & Validation (U9, U10):** Knowledge schema adaptation, validation benchmark. After this phase, the plugin is validated and the knowledge accumulation system is domain-adapted. Estimated: 1-2 work sessions.

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-27-ce-datascience-fork-requirements.md](docs/brainstorms/2026-04-27-ce-datascience-fork-requirements.md)
- File-level audit: 170+ files classified across 53 agents, 37 skills, infrastructure
- Institutional learnings: pipeline separation, confidence-anchored scoring, beta skills framework, self-containment rule
- STROBE Statement: https://www.strobe-statement.org
- CONSORT Statement: https://www.consort-statement.org
