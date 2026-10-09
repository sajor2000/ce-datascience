---
name: ce-plan
description: "Create the canonical durable implementation plan or statistical analysis plan. Use when the user asks to plan work, write or finalize a SAP, or turn requirements into implementation units; hand off to the claims-based SAP specialist only when a clinical study needs deeper claim-to-dataset and decision-evidence modeling."
argument-hint: "[optional: feature description, study design doc, requirements doc path, plan path to deepen, or any task to plan] [output:html]"
---

# Create Plan (Dual-Mode: SAP or Implementation)


## Skill Value

- **Problem it solves:** Execution fails when scope, decisions, dependencies, tests, or SAP assumptions are not explicit before work starts.
- **Use when:** The user asks to plan a feature, analysis, SAP, study, implementation, or to deepen an existing plan.
- **Output:** A durable plan or SAP under docs/plans/ with stable requirements and implementation/SAP identifiers.
- **Ask only if:** Only when planning-critical scope, mode, source document, or decision points cannot be inferred from input and repo context.
- **Do not do:** Do not implement code, run analysis, or treat execution-time unknowns as settled.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

**Resolve the current year at runtime** (`date +%Y`) rather than assuming one; use it when dating plans and searching for recent documentation.

`ce-brainstorm` defines **WHAT** to study or build. `ce-plan` defines **HOW** -- either as a Statistical Analysis Plan (SAP) for study designs or as an implementation plan for technical tasks. `ce-work` executes the plan. A prior brainstorm is useful context but never required — `ce-plan` works from any input: a study design doc, a requirements doc, a feature idea, or a rough description.

`ce-plan` owns the canonical versioned SAP. For complex clinical, validation, benchmarking, or observational studies, load `ce-statistical-analysis-plan` to develop the claim-to-dataset schema and decision evidence inside that SAP; do not create a second competing plan. Use `ce-model-strategy` after data QA when the primary model, random-effects structure, or implementation path requires a traceable decision. `ce-sap-tabular` owns the workbook companion, and manuscript skills own final prose and citation delivery.

**When directly invoked, always plan.** Never classify a direct invocation as "not a planning task" and abandon the workflow. If the input is unclear, ask clarifying questions or use the planning bootstrap (Phase 0.4) to establish enough context — but always stay in the planning workflow.

This workflow produces a durable plan artifact (SAP or implementation plan). It does **not** implement code, run inferential analyses, or learn from execution-time results. For study or analysis projects, it **does** require a data-column/QA preflight before SAP finalization or modeling recommendations: inspect available dataset columns and consume `ce-data-qa` output before writing variable/model sections. If the answer depends on changing code and seeing what happens, that belongs in `ce-work`, not here.

When the plan includes new or materially extended Marimo, Jupyter, R Markdown, or Quarto work, load the `ce-notebook-standards` skill and record its topology decision and notebook responsibilities in the plan.

## Interaction Method

Follow the Skill Value interaction rule above for every user-facing question: one question at a time, a concise single-select choice when natural options exist, and numbered choices in chat when no blocking question UI is available. Never silently skip a required question.

## Feature Description

<feature_description> #$ARGUMENTS </feature_description>

**If the feature description above is empty, ask the user:** "What would you like to plan? Describe the task, goal, or project you have in mind." Then wait for their response before continuing.

If the input is present but unclear or underspecified, do not abandon — ask one or two clarifying questions, or proceed to Phase 0.4's planning bootstrap to establish enough context. The goal is always to help the user plan, never to exit the workflow.

**IMPORTANT: All file references in the plan document must use repo-relative paths (e.g., `src/models/user.rb`), never absolute paths (e.g., `/Users/name/Code/project/src/models/user.rb`). This applies everywhere — implementation unit file lists, pattern references, origin document links, and prose mentions. Absolute paths break portability across machines, worktrees, and teammates.**

## Dual-Mode: SAP vs Implementation

This skill operates in one of two modes, detected after reading the input:

**SAP mode** -- activated when the input document or feature description contains study design keywords: study population, exposure, intervention, outcome, hypothesis, research question, PICO, primary endpoint, cohort, case-control, randomized, observational study, clinical trial, inclusion criteria, exclusion criteria. SAP mode produces a versioned Statistical Analysis Plan using the template in `references/sap-template.md`, requires the biostatistics-style tabular SAP workbook contract (`Overview`, `Outputs`, `Master Variables`), and runs the gap checklist from `references/sap-gap-checklist.md`.

**Implementation mode** -- activated for all other inputs (technical tasks, software features, refactors, infrastructure). Uses the existing plan template and full Phase 0-5 workflow described below.

**Detection and override:**
- After reading the input (Phase 0, before Phase 1), scan for the study design keywords listed above. If 2+ keywords are present, announce "Entering SAP mode" and follow the SAP workflow. If 0-1 keywords are present, announce "Entering implementation mode" and follow the standard workflow.
- The user can override by saying "use SAP mode" or "use implementation mode" at any point. If the auto-detected mode seems wrong, ask the user to confirm before proceeding.

### SAP Mode Workflow

When SAP mode is active, Phases 0-2 (resume, source, scope, research, questions) run as normal; then read `references/sap-mode-workflow.md` and follow it in place of Phases 3-5. Read `references/sap-template.md` when that workflow reaches SAP Phase 3 (structure) and `references/sap-gap-checklist.md` at SAP Phase 5 (gap check). For the SAP Phase 5 post-generation menu, load `references/plan-handoff.md` and run 5.3.8 (document review) and 5.4 with the SAP path in place of the plan path.

SAP-mode gates that hold regardless of what the reference says:
- **Data profile before SAP structure (SAP Phase 2.5).** Read the `ce-data-qa` profile/QA report before filling variable, missingness, cohort-size, or model sections. Inspectable data with no profile -> load `ce-data-qa` in pre-SAP column profile mode first. No inspectable data -> keep `status: draft` with a GAP comment. QA blockers -> do not write a final SAP.
- **No finalization over open methodological choices.** Unresolved estimand, comparator, outcome, follow-up, adjustment, or missing-data choices keep the SAP in `status: draft`.
- **Tabular companion required (SAP Phase 4.5).** A new SAP without the `ce-sap-tabular` companion and no explicit blocker is incomplete.
- **Human checkpoint on finalization.** Report critical/important/advisory gaps and set `status: final` only when the user accepts it and no critical gap remains.

The reference also defines the upstream handoff signals SAP Phase 3 consumes (`__CE_RESEARCH_QUESTION__`, `__CE_PUBMED_RESULTS__`, `__CE_METHOD_EXTRACT__`, `__CE_CHECKLIST__`, `__CE_COHORT__`, `__CE_DATA_QA__`, `__CE_MODEL_STRATEGY__`, `__CE_PHENOTYPE_VALIDATE__`, `__CE_EFFECT_SIZE__`, `__CE_POWER__`, `__CE_CLIF__`, `__CE_LANG__`), CLIF-profile behavior (data dictionary version, STROBE+RECORD default, protected paths), and SAP versioning (increment `sap_version`, never renumber SAP-N.M IDs).

## Core Principles

1. **Use requirements as the source of truth** - If `ce-brainstorm` produced a requirements document, planning should build from it rather than re-inventing behavior.
2. **Decisions, not code** - Capture approach, boundaries, files, dependencies, risks, and test scenarios. Do not pre-write implementation code or shell command choreography. Pseudo-code sketches or DSL grammars that communicate high-level technical design are welcome when they help a reviewer validate direction — but they must be explicitly framed as directional guidance, not implementation specification.
3. **Research before structuring** - Explore the codebase, institutional learnings, and external guidance when warranted before finalizing the plan.
4. **Right-size the artifact** - Small work gets a compact plan. Large work gets more structure. The philosophy stays the same at every depth.
5. **Separate planning from execution discovery** - Resolve planning-time questions here. Explicitly defer execution-time unknowns to implementation.
6. **Keep the plan portable** - The plan should work as a living document, review artifact, or issue body without embedding tool-specific executor instructions.
7. **Carry execution posture lightly when it matters** - If the request, origin document, or repo context clearly implies test-first, characterization-first, or another non-default execution posture, reflect that in the plan as a lightweight signal. Do not turn the plan into step-by-step execution choreography.
8. **Honor user-named resources** - When the user names a specific resource — a CLI, MCP server, URL, file, doc link, or prior artifact — treat it as authoritative input, not a suggestion. Discover it if unknown (`command -v`, fetch, read) before assuming it's unavailable. Use it in place of generic alternatives. If it fails or doesn't exist, say so explicitly rather than silently substituting.
9. **Data shape before SAP, coding, or modeling** - For any study, prediction, clinical, omics, dashboard, or analysis project with data available, inspect the actual columns, grain, keys, dates, missingness, duplicates, and basic validity before SAP finalization or implementation planning. Use the `ce-data-qa` skill for tabular data and `ce-bioinfo-qc` for omics data. If data is not available, write an explicit data-profile prerequisite and keep SAP variable/model sections provisional.
10. **Every new SAP gets a tabular workbook contract** - A new SAP is not execution-ready until it has the biostatistics-style tabular SAP companion: `analysis/sap-tables/01-overview.csv`, `02-outputs.csv`, `03-variables.csv`, and the rendered `<slug>-tabular-sap.xlsx` when `openpyxl` is available. If data QA is missing, keep the SAP in draft and list `ce-data-qa` before `ce-sap-tabular`; do not skip the workbook requirement.
11. **Causal/observational analysis guardrail** - For an observational or causal analysis, make the estimand, causal assumptions, unit/grain, key fields, time zero, and success criteria explicit. Document an analyst-approved assumption only when the choice can be responsibly deferred; unresolved methodological choices block finalization rather than being silently inferred.

## Plan Quality Bar

Every plan should contain:
- A clear problem frame and scope boundary
- Concrete requirements traceability back to the request or origin document
- Repo-relative file paths for the work being proposed (never absolute paths)
- Explicit test file paths for feature-bearing implementation units
- Decisions with rationale, not just tasks
- Existing patterns or code references to follow
- Enumerated test scenarios for each feature-bearing unit, specific enough that an implementer knows exactly what to test without inventing coverage themselves
- Clear dependencies and sequencing

A plan is ready when an implementer can start confidently without needing the plan to write the code for them.

## Workflow

### Phase 0: Resume, Source, and Scope

#### 0.0 Resolve Output Mode

Determine `OUTPUT_FORMAT` before any other phase fires. Output mode is **exclusive** -- the plan is written as either markdown (`.md`) OR HTML (`.html`), never both. Precedence: CLI arg > config > default (`md`), with a hard pipeline-mode override.

**Read config.** The repository root is pre-resolved at skill load:
!`git rev-parse --show-toplevel 2>/dev/null || true`

If the line above is an absolute path, use it as `<repo-root>`. If it is empty or still shows a backtick command string on a harness that did not execute pre-resolution, resolve `<repo-root>` at runtime with `git rev-parse --show-toplevel`. Read `<repo-root>/.ce-datascience/config.local.yaml` with the native file-read tool. If the root cannot be resolved or the file does not exist, fall through to defaults. In a linked worktree where the file is absent, resolve the absolute common Git directory and try the main checkout's `.ce-datascience/config.local.yaml` before falling through.

Resolution steps:

1. **CLI arg.** Scan `$ARGUMENTS` for a token starting with the literal prefix `output:`. If found, strip it from arguments before treating the remainder as the feature description, and match its value case-insensitively against `md` and `html`.
   - `output:` alone (no value) -> no-op, fall through to step 2.
   - `output:<unknown>` (e.g., `output:pdf`) -> drop the token, fall through to step 2, and remember to emit a one-line note above the post-generation menu after final resolution: `Ignored unknown output: value '<value>' -- using <resolved_format> instead.`
2. **Config.** If step 1 did not resolve and the config has an active, non-commented `plan_output:` key whose value matches `md` or `html` (case-insensitive), use it. Missing, invalid, or commented values fall through silently.
3. **Default.** Otherwise `OUTPUT_FORMAT=md`.
4. **Pipeline override.** When invoked from LFG or any `disable-model-invocation` context, force `OUTPUT_FORMAT=md` regardless of steps 1-3. Downstream automation parses markdown reliably; HTML in pipeline runs is unnecessary friction.

Only literal-prefix flag tokens (`output:`, `mode:`, `delegate:` where applicable) are consumed and stripped. Other `<word>:<word>` tokens -- including conventional commit prefixes like `feat:` or `fix:` inside a feature description -- pass through verbatim.

Load the format-rendering reference based on the resolved value. Section content is the same in either format; presentation differs. Both references pair with `references/plan-sections.md`, which describes what the plan contains regardless of format.

- When `OUTPUT_FORMAT=md`, read `references/markdown-rendering.md` for format principles.
- When `OUTPUT_FORMAT=html`, read `references/html-rendering.md` for format principles.

#### 0.1 Resume Existing Plan Work When Appropriate

If the user references an existing plan file or there is an obvious recent matching plan in `docs/plans/`:
- Read it
- If it has `artifact_contract: ce-unified-plan/v1` and `artifact_readiness: requirements-only`, update it in place and do not offer to create a sibling plan; this is the canonical brainstorm-to-plan handoff.
- Otherwise, confirm whether to update it in place or create a new plan
- If updating, revise only the still-relevant sections. Plans do not carry per-unit progress state — progress is derived from git by `ce-work`, so there is no progress to preserve across edits

**Deepen intent:** The word "deepen" (or "deepening") in reference to a plan is the primary trigger for the deepening fast path. When the user says "deepen the plan", "deepen my plan", "run a deepening pass", or similar, the target document is a **plan** in `docs/plans/`, not a requirements document. Use any path, keyword, or context the user provides to identify the right plan. If a path is provided, verify it is actually a plan document. If the match is not obvious, confirm with the user before proceeding.

Words like "strengthen", "confidence", "gaps", and "rigor" are NOT sufficient on their own to trigger deepening. These words appear in normal editing requests ("strengthen that section about the diagram", "there are gaps in the test scenarios") and should not cause a holistic deepening pass. Only treat them as deepening intent when the request clearly targets the plan as a whole and does not name a specific section or content area to change — and even then, prefer to confirm with the user before entering the deepening flow.

Once the plan is identified and appears complete (all major sections present, implementation units defined, `status: active`):
- **Routing is keyed on file extension first, then frontmatter.** HTML plans (`.html`) are always software or analysis plans -- the HTML rendering invariant forbids YAML frontmatter, so frontmatter absence is not a non-software signal for HTML. Treat the visible-header metadata as the frontmatter equivalent.
  - **`.html` plan:** short-circuit to Phase 5.3 (Confidence Check and Deepening) in **interactive mode**. Never route to `references/universal-planning.md` based on missing YAML.
  - **`.md` plan WITH YAML frontmatter:** short-circuit to Phase 5.3 in **interactive mode**.
  - **`.md` plan WITHOUT YAML frontmatter** (non-software plans use a simple `# Title` heading with `Created:` date instead): route to `references/universal-planning.md` for editing or deepening instead of Phase 5.3. Non-software plans do not use the software confidence check.

The Phase 5.3 short-circuit avoids re-running the full planning workflow and gives the user control over which findings are integrated.

Normal editing requests (e.g., "update the test scenarios", "add a new implementation unit", "strengthen the risk section") should NOT trigger the fast path — they follow the standard resume flow.

If the plan already has a `deepened: YYYY-MM-DD` frontmatter field and there is no explicit user request to re-deepen, the fast path still applies the same confidence-gap evaluation — it does not force deepening.

**Resume preserves the existing artifact's format, except pipeline mode.** When resuming an existing plan, write back in whatever format the existing artifact uses -- markdown if the existing file is `.md`, HTML if it is `.html`. Explicit `output:` arguments on this run override. Pipeline mode always wins per Phase 0.0: even when resuming an existing `.html` plan, pipeline runs force `OUTPUT_FORMAT=md` so downstream automation receives markdown. The resume rewrites the markdown file at the parallel path (`<plan-basename>.md`) and leaves the original `.html` in place untouched.

#### 0.1b Classify Task Domain and Detect Mode

First, detect SAP vs implementation mode using the keyword rule in the Dual-Mode section above. In SAP mode, announce "Entering SAP mode" and continue to Phase 0.2 (research is valuable for SAPs too); the SAP workflow replaces Phases 3-5 as described in the Dual-Mode section.

If SAP mode is not triggered, apply the standard domain classification:

If the task involves building, modifying, or architecting software or analysis code (references code, repos, APIs, databases, data pipelines, notebooks, or asks to build/modify/deploy), continue to Phase 0.2 in implementation mode.

If the domain is genuinely ambiguous (e.g., "plan a migration" with no other context), ask the user before routing.

Otherwise, read `references/universal-planning.md` and follow that workflow instead. Skip all subsequent phases. Named tools or source links don't change this routing — they're inputs, handled per Core Principle 8.

#### 0.2 Find Upstream Requirements Document

Before asking planning questions, first search `docs/plans/` for a matching current-CE unified artifact with `artifact_contract: ce-unified-plan/v1` and `artifact_readiness: requirements-only`. This is the preferred source: planning enriches that same artifact in place and changes readiness to `implementation-ready`, preserving its Product Contract and stable IDs. If none matches, search the legacy data-science location `docs/brainstorms/` for `*-requirements.md` or `*-requirements.html`; those remain valid inputs and are converted into a new plan with `origin:` provenance.

**Relevance criteria:** A requirements document is relevant if:
- The topic semantically matches the feature description
- It was created within the last 30 days (use judgment to override if the document is clearly still relevant or clearly stale)
- It appears to cover the same user problem or scope

If multiple source documents match, ask which one to use using the platform's blocking question tool when available (see Interaction Method). Otherwise, present numbered options in chat and wait for the user's reply before proceeding.

#### 0.3 Use the Source Document as Primary Input

If a relevant requirements document exists:
1. Read it thoroughly
2. Announce that it will serve as the origin document for planning
3. Carry forward all of the following:
   - Problem frame
   - Actors (A-IDs), Key Flows (F-IDs), and Acceptance Examples (AE-IDs) when present — preserve these as constraints that implementation units must honor
   - Requirements and success criteria
   - Scope boundaries (including "Deferred for later" and "Outside this product's identity" subsections when present)
   - Key decisions and rationale
   - Dependencies or assumptions
   - Outstanding questions, preserving whether they are blocking or deferred
4. Use the source document as the primary input to planning and research
5. Reference important carried-forward decisions in the plan with `(see origin: <source-path>)`
6. Do not silently omit source content — if the origin document discussed it, the plan must address it even if briefly. Before finalizing, scan each section of the origin document to verify nothing was dropped.
7. When the source uses `artifact_contract: ce-unified-plan/v1`, preserve its Product Contract verbatim except for explicitly resolved corrections, add the Planning Contract and execution sections to the same file, and retain its path as the canonical plan path.

If no relevant requirements document exists, planning may proceed from the user's request directly.

#### 0.4 Planning Bootstrap (No Requirements Doc or Unclear Input)

If no relevant requirements document exists, or the input needs more structure:
- Assess whether the request is already clear enough for direct technical planning — if so, continue to Phase 0.5
- If the ambiguity is mainly product framing, user behavior, or scope definition, recommend `ce-brainstorm` as a suggestion — but always offer to continue planning here as well
- If the user wants to continue here (or was already explicit about wanting a plan), run the planning bootstrap below

The planning bootstrap should establish:
- Problem frame
- Intended behavior
- Scope boundaries and obvious non-goals
- Success criteria
- Blocking questions or assumptions

Keep this bootstrap brief. It exists to preserve direct-entry convenience, not to replace a full brainstorm.

If the bootstrap uncovers major unresolved product questions:
- Recommend `ce-brainstorm` again
- If the user still wants to continue, require explicit assumptions before proceeding

If the bootstrap reveals that a different workflow would serve the user better:

- **Symptom without a root cause** (user describes broken behavior but hasn't identified why) — announce "This needs investigation before planning — switching to ce-debug to find the root cause." and load the `ce-debug` skill.
- **Clear task ready to execute** (known root cause, obvious fix, no architectural decisions) — suggest `ce-work` as a faster alternative alongside continuing with planning. The user decides.

#### 0.5 Classify Outstanding Questions Before Planning

If the origin document contains `Resolve Before Planning` or similar blocking questions:
- Review each one before proceeding
- Reclassify it into planning-owned work **only if** it is actually a technical, architectural, or research question
- Keep it as a blocker if it would change product behavior, scope, or success criteria

If true product blockers remain:
- Surface them clearly
- Ask the user, using the platform's blocking question tool when available (see Interaction Method), whether to:
  1. Resume `ce-brainstorm` to resolve them
  2. Convert them into explicit assumptions or decisions and continue
- Do not continue planning while true blockers remain unresolved

#### 0.6 Assess Plan Depth

Classify the work into one of these plan depths:

- **Lightweight** - small, well-bounded, low ambiguity
- **Standard** - normal feature or bounded refactor with some technical decisions to document
- **Deep** - cross-cutting, strategic, high-risk, or highly ambiguous implementation work

If depth is unclear, ask one targeted question and then continue.

### Phase 1: Gather Context

Read `references/phase1-context-gathering.md` now and run its sub-phases in order (1.0 data-column/QA preflight, 1.1 local research dispatch, 1.1b execution-posture detection, 1.2 external-research decision rubric, 1.3 conditional external research, 1.4 consolidation, 1.4b depth reclassification, 1.5 flow analysis).

Phase 1.0 is a gate for any study or analysis work with data: inspect the actual columns and consume `ce-data-qa` (tabular) or `ce-bioinfo-qc` (omics) evidence before writing variable, cohort, or model content. When no data is inspectable yet, record the data-profile prerequisite as a GAP and keep those sections provisional.

### Phase 2: Resolve Planning Questions

Build a planning question list from:
- Deferred questions in the origin document
- Gaps discovered in repo or external research
- Technical decisions required to produce a useful plan

For each question, decide whether it should be:
- **Resolved during planning** - the answer is knowable from repo context, documentation, or user choice
- **Deferred to implementation** - the answer depends on code changes, runtime behavior, or execution-time discovery

Ask the user only when the answer materially affects architecture, scope, sequencing, or risk and cannot be responsibly inferred. Use the platform's blocking question tool when available (see Interaction Method).

**Do not** run tests, build the app, or probe runtime behavior in this phase. The goal is a strong plan, not partial execution.

### Phase 3: Structure the Plan

#### 3.1 Title and File Naming

- Draft a clear, searchable title using conventional format such as `feat: Add user authentication` or `fix: Prevent checkout double-submit`
- Determine the plan type: `feat`, `fix`, or `refactor`
- Build the filename following the repository convention: `docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.<md|html>` using the resolved `OUTPUT_FORMAT`
  - Create `docs/plans/` if it does not exist
  - Check existing files for today's date to determine the next sequence number (zero-padded to 3 digits, starting at 001)
  - Keep the descriptive name concise (3-5 words) and kebab-cased
  - Examples: `2026-01-15-001-feat-user-authentication-flow-plan.md`, `2026-02-03-002-fix-checkout-race-condition-plan.html`
  - Avoid: missing sequence numbers, vague names like "new-feature", invalid characters (colons, spaces)

#### 3.2-3.7 Units, Design Sketches, and Unknowns

Read `references/plan-structure.md` now and apply 3.2 through 3.7: stakeholder impact, implementation-unit granularity, optional High-Level Technical Design and Output Structure, the per-unit field list (Goal, Requirements, Dependencies, Files, Approach, Execution note, Technical design, Patterns to follow, Test scenarios, Verification), deferred implementation unknowns, and keeping tangential cleanup under `Deferred to Follow-Up Work`.

Non-negotiables while structuring:
- Each unit heading carries a stable U-ID (`- U1. **[Name]**`). Never renumber: reordering keeps IDs, splitting assigns the next unused number, deletion leaves a gap. No `- [ ]` checkboxes; progress is derived from git by `ce-work`.
- Every feature-bearing unit lists its test file path in `**Files:**` and enumerates concrete test scenarios (happy path, edge, error, integration as applicable). Only non-feature-bearing units may use `Test expectation: none -- [reason]`.
- Execution-time unknowns are recorded as deferred, never presented as settled.

### Phase 4: Write the Plan

**NEVER CODE during this skill.** Research, decide, and write the plan — do not start implementation. Use one planning philosophy across all depths; change the amount of detail, not the boundary between planning and execution.

#### 4.1 Depth, Extensions, and Planning Rules

Apply the depth guidance (Lightweight 2-4 units, Standard 3-6, Deep 4-8), optional Deep-plan extensions, and the 4.3 Planning Rules from `references/plan-structure.md` (already loaded in Phase 3). The rules forbid implementation code, git commands, exact test command recipes, and `RED/GREEN/REFACTOR` micro-steps; pseudo-code and Mermaid are allowed only as directional guidance.

#### 4.2 Core Plan Template

Read `references/plan-sections.md` for the format-independent section contract and `references/plan-template.md` for the markdown template shape (core template plus optional Deep-plan extensions). Use the rendering reference loaded in Phase 0.0 (`markdown-rendering.md` or `html-rendering.md`) to decide presentation. Omit clearly inapplicable optional sections, especially for Lightweight plans.

#### 4.4 Visual Communication in Plan Documents

When the plan contains 4+ implementation units with non-linear dependencies, 3+ interacting surfaces in System-Wide Impact, 3+ behavioral modes/variants in Problem Frame, or 3+ interacting decisions in Key Technical Decisions or alternatives in Alternative Approaches, read `references/visual-communication.md` for diagram and table guidance. This covers plan-structure visuals (dependency graphs, interaction diagrams, comparison tables) — not solution-design diagrams, which 3.4 in `references/plan-structure.md` covers.

### Phase 5: Final Review, Write File, and Handoff

#### 5.0 Scoping Synthesis Checkpoint

Before writing the plan file, present the scoping synthesis — the scope/decisions checkpoint that plan-write consumes as input. Read `references/synthesis-summary.md` for what belongs at synthesis altitude (scope, posture, test approach) versus what is plan-write output and must not leak into it.

#### 5.1 Review Before Writing

Before finalizing, check:
- The plan does not invent product behavior that should have been defined in `ce-brainstorm`
- If there was no origin document, the bounded planning bootstrap established enough product clarity to plan responsibly
- Every major decision is grounded in the origin document or research
- Each implementation unit is concrete, dependency-ordered, and implementation-ready
- If test-first or characterization-first posture was explicit or strongly implied, the relevant units carry it forward with a lightweight `Execution note`
- Each feature-bearing unit has test scenarios from every applicable category (happy path, edge cases, error paths, integration) — right-sized to the unit's complexity, not padded or skimped
- Test scenarios name specific inputs, actions, and expected outcomes without becoming test code
- Feature-bearing units with blank or missing test scenarios are flagged as incomplete — feature-bearing units must have actual test scenarios, not just an annotation. The `Test expectation: none -- [reason]` annotation is only valid for non-feature-bearing units (pure config, scaffolding, styling)
- Deferred items are explicit and not hidden as fake certainty
- If a High-Level Technical Design section is included, it uses the right medium for the work, carries the non-prescriptive framing, and does not contain implementation code (no imports, exact signatures, or framework-specific syntax)
- Per-unit technical design fields, if present, are concise and directional rather than copy-paste-ready
- If the plan creates a new directory structure, would an Output Structure tree help reviewers see the overall shape?
- If Scope Boundaries lists items that are planned work for a separate PR, issue, or repo, are they under `### Deferred to Follow-Up Work` rather than mixed with true non-goals?
- U-IDs are unique within the plan and follow the stability rule — no two units share an ID; reordering or splitting did not renumber existing units; gaps from deletions are preserved
- Would a visual aid (dependency graph, interaction diagram, comparison table) help a reader grasp the plan structure faster than scanning prose alone?

If the plan originated from a requirements document, re-read that document and verify:
- The chosen approach still matches the product intent
- Scope boundaries and success criteria are preserved
- Blocking questions were either resolved, explicitly assumed, or sent back to `ce-brainstorm`
- Every section of the origin document is addressed in the plan — scan each section to confirm nothing was silently dropped
- If origin supplies A/F/AE IDs: every origin R/F/AE that *affects implementation* is referenced in Requirements Trace, a U-ID unit, test scenarios, verification, scope boundaries, or explicitly deferred. Actors are carried forward when they affect behavior, permissions, UX, orchestration, handoff, or verification. The standard is preservation of product intent, not mandatory ID spam — irrelevant origin IDs may be omitted
- If origin was Deep-product (origin contains an `Outside this product's identity` subsection): the plan's Scope Boundaries preserves the three-way split — `Deferred for later` and `Outside this product's identity` carried verbatim from origin, `Deferred to Follow-Up Work` reserved for plan-local implementation sequencing

#### 5.2 Write Plan File

**REQUIRED: Write the plan file to disk before presenting any options.**

For a current-CE unified requirements artifact (`artifact_contract: ce-unified-plan/v1`, `artifact_readiness: requirements-only`), update that same canonical file in place, set `artifact_readiness: implementation-ready`, and preserve the Product Contract and stable R/A/F/AE identifiers. Do not create a sibling `*-plan` file.

For legacy requirements or direct prompts, use the Write tool to save the complete plan to:

```text
docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.<md|html>
```

Confirm:

```text
Plan written to docs/plans/[filename]
```

**Pipeline mode:** If invoked from an automated workflow such as LFG, SLFG, or any `disable-model-invocation` context, skip interactive questions. Make the needed choices automatically and proceed to writing the plan.

#### 5.3 Confidence Check and Deepening

After writing the plan file, automatically evaluate whether the plan needs strengthening.

**Two deepening modes:**

- **Auto mode** (default during plan generation): Runs without asking the user for approval. The user sees what is being strengthened but does not need to make a decision. Sub-agent findings are synthesized directly into the plan.
- **Interactive mode** (activated by the re-deepen fast path in Phase 0.1): The user explicitly asked to deepen an existing plan. Sub-agent findings are presented individually for review before integration. The user can accept, reject, or discuss each agent's findings. Only accepted findings are synthesized into the plan.

Interactive mode applies whether the plan was generated by this skill, written by hand, or produced by another tool. The confidence check strengthens rationale, sequencing, risk treatment, and grounding; it does not replace `ce-doc-review` (5.3.8), which checks clarity, completeness, and scope.

**Pipeline mode:** This phase always runs in auto mode in pipeline/disable-model-invocation contexts. No user interaction needed.

##### 5.3.1 Classify Plan Depth and Topic Risk

Determine the plan depth from the document using the Phase 0.6 tiers (Lightweight 2-4 units, Standard 3-6, Deep 4-8 or phased delivery).

Build a risk profile. Treat these as high-risk signals:
- Authentication, authorization, or security-sensitive behavior
- Payments, billing, or financial flows
- Data migrations, backfills, or persistent data changes
- External APIs or third-party integrations
- Privacy, compliance, or user data handling, including PHI, patient-level data, small-cell disclosure, or IRB/DUA constraints
- Reported statistical inference: primary endpoints, causal claims, multiplicity, or deviations from a SAP
- Cross-interface parity or multi-surface behavior
- Significant rollout, monitoring, or operational concerns

##### 5.3.2 Gate: Decide Whether to Deepen

- **Lightweight** plans usually do not need deepening unless they are high-risk
- **Standard** plans often benefit when one or more important sections still look thin
- **Deep** or high-risk plans often benefit from a targeted second pass
- **Thin local grounding override:** If Phase 1.2 triggered external research because local patterns were thin (fewer than 3 direct examples or adjacent-domain match), always proceed to scoring regardless of how grounded the plan appears. Plans built on unfamiliar territory carry more unverified assumptions

If the plan already appears sufficiently grounded and the thin-grounding override does not apply, report "Confidence check passed — no sections need strengthening", then **load `references/plan-handoff.md` now and execute 5.3.8 → 5.3.9 → 5.4 in sequence**. Document review is mandatory — do not skip it because the confidence check passed. The two tools catch different classes of issues.

##### 5.3.3–5.3.7 Deepening Execution

When deepening is warranted, read `references/deepening-workflow.md` for confidence scoring checklists, section-to-agent dispatch mapping, execution mode selection, research execution, interactive finding review, and plan synthesis instructions. Execute steps 5.3.3 through 5.3.7 from that file, then return here for 5.3.8.

##### 5.3.8–5.4 Document Review, Final Checks, and Post-Generation Options

**Load `references/plan-handoff.md` now.** It contains the full instructions for 5.3.8 (document review), 5.3.9 (final checks and cleanup), and 5.4 (post-generation handoff, including the Proof HITL flow, post-HITL re-review, and Issue Creation branching). Document review is mandatory — do not skip it even if the confidence check already ran.

Ask through the Skill Value interaction rule and wait for the selection (a human checkpoint; never auto-select outside pipeline mode).

**Question:** "Plan ready at `<plan path>`. What would you like to do next?" (use the actual written path, `.md` or `.html`; in SAP mode, the SAP path)

**Options:**
1. **load the `ce-work` skill** (recommended) - Begin implementing this plan in the current session
2. **Create Issue** - Create a tracked issue from this plan in your configured issue tracker (GitHub or Linear)
3. **Open in Proof (web app) — review and comment to iterate with the agent** - Optional: show only when the core Compound Engineering `ce-proof` skill is available in the current harness (ce-datascience does not ship it). Otherwise omit this option; the saved local plan file is the fallback review surface.
4. **Done for now** - Pause; the plan file is saved and can be resumed later

Routing each selection, contextual surfacing of residual document-review findings, and the post-HITL resync logic all live in `references/plan-handoff.md` — follow it for every branch.

**Completion check:** This skill is not complete until the post-generation menu above has been presented and the user has selected an action. If you have written the plan file and have not yet presented the menu, you are not done — go to the load instruction above and continue.

**Pipeline mode exception:** In LFG, SLFG, or any `disable-model-invocation` context, skip the interactive menu and return control to the caller after the plan file is written, confidence check has run, and `ce-doc-review` has run in headless mode (per `references/plan-handoff.md`).
