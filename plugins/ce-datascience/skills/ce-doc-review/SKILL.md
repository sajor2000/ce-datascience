---
name: ce-doc-review
description: "Reviews plans, SAPs, protocols, and manuscripts for clarity, completeness, and scope with persona reviewers. Use when the user asks to review a document, not code."
argument-hint: "[mode:non-interactive|headless] [path/to/document.md]"
---

# Document Review


## Skill Value

- **Problem it solves:** Documents can look complete while missing traceability, scope boundaries, or reader-facing clarity.
- **Use when:** The user asks to review, strengthen, simplify, or validate a document rather than code.
- **Output:** Prioritized document findings or an improved document when edit mode is requested.
- **Ask only if:** Only when the review target or edit-vs-report mode is unclear.
- **Do not do:** Do not turn document review into implementation or scientific analysis execution.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Reviews requirements or plan documents with parallel reviewer personas, auto-applies `safe_auto` fixes, and routes remaining findings through a four-option interaction (per-finding walk-through, auto-resolve with best judgment, Append-to-Open-Questions, Report-only).

## Interactive mode rules

Every user-facing question follows the Skill Value interaction rule above.

## Phase 0: Detect Mode

Check the skill arguments for `mode:non-interactive` or its backwards-compatible alias `mode:headless`. Arguments may contain a document path and either token. Tokens starting with `mode:` are flags, not file paths — normalize `mode:non-interactive` to `mode:headless`, strip it, and use the remaining token (if any) as the document path for Phase 1. Both aliases together are not a conflict.

If either alias is present, set **non-interactive mode** for the rest of the workflow (e.g., `Skill("ce-doc-review", "mode:non-interactive docs/plans/my-plan.md")`). It changes delivery, not classification: tier judgment is identical, `safe_auto` fixes still apply silently, `gated_auto`, `manual`, and FYI findings return as structured text with their original classifications (no blocking questions, no routing), and Phase 5 returns immediately with "Review complete".

Otherwise run in default interactive mode with the routing question, walk-through, and bulk preview.

## Phase 1: Get and Analyze Document

**If a document path is provided:** Read it and confirm it is readable on disk before dispatching personas. If it cannot be read, stop without dispatch: interactive mode names the missing path and asks for a corrected path; non-interactive mode returns `Review failed: non-interactive mode requires a readable document path.`

**If no document is specified (interactive mode):** Ask which document to review, or find the most recent in `docs/brainstorms/` or `docs/plans/` using a file-search/glob tool (e.g., Glob in Claude Code).

**If no document is specified (headless mode):** Output "Review failed: headless mode requires a document path. Re-invoke with: Skill(\"ce-doc-review\", \"mode:headless <path>\")" without dispatching agents.

### Classify Document Type

Classify the document by reading its **content shape**, not its file path. Path is a tie-breaker hint, not the primary signal -- a brainstorm-style doc placed under `docs/plans/` should still classify as `requirements`, and a plan-shaped doc under `docs/brainstorms/` should still classify as `plan`.

First check the current unified artifact contract:

- `artifact_contract: ce-unified-plan/v1` with `artifact_readiness: requirements-only` -> classify as `unified-requirements`. Review the Product Contract only; missing Planning Contract, Implementation Units, Verification Contract, or Definition of Done is expected and is not a finding.
- `artifact_contract: ce-unified-plan/v1` with `artifact_readiness: implementation-ready` -> classify as `unified-plan`. Review the Product Contract and Planning Contract with their distinct lenses, then review Implementation Units, verification, and Definition of Done for execution completeness.
- Invalid progress-like readiness values such as `active`, `in_progress`, `completed`, or `done` are document-contract findings; readiness describes artifact shape, not execution state.
- Unified HTML artifacts are report-only. Never apply markdown mutation paths to HTML.

Use these signals to decide:

**`requirements` signals (what-to-study or what-to-build documents):**
- Frontmatter fields like `actors:`, `flows:`, `acceptance_examples:`, `topic:`, or study-design metadata
- Section headings such as `Acceptance Examples`, `Actors`, `Key Flows`, `Study Population`, `Endpoints`, `Outstanding Questions`, `Resolve Before Planning`
- Numbered identifiers in the form `R1`, `A1`, `F1`, `AE1`
- Prose framing focused on research question, clinical/business problem, behavior, scope boundaries, success criteria, study design, or endpoints
- No implementation units, no per-unit file lists, no test scenarios attached to units

**`plan` signals (how-to-execute documents):**
- Frontmatter fields like `type: feat|fix|refactor`, `status: active`, `origin: docs/brainstorms/...`, `sap_version:`, or `analysis_plan:`
- Section headings such as `Implementation Units`, `Key Technical Decisions`, `Statistical Methods`, `Risks & Dependencies`, `System-Wide Impact`, `SAP Gap Check`
- Numbered identifiers in the form `U1`, `U2` for implementation units, or SAP method identifiers
- Per-unit fields named `Goal`, `Files`, `Approach`, `Test scenarios`, `Verification`
- Repo-relative file paths to create, modify, analyze, or test
- Prose framing focused on technical decisions, statistical methods, sequencing, and implementer/analyst-facing detail

**Tie-breaker rule.** When the content signals are mixed or sparse, fall back to path: `docs/brainstorms/` -> `requirements`, `docs/plans/` -> `plan`. When neither path location applies, treat the dominant content shape as authoritative; if shape is genuinely ambiguous, default to `requirements` (the more conservative classification).

Pass the classification result (`requirements`, `plan`, `unified-requirements`, or `unified-plan`) to each persona via the `{document_type}` slot in the subagent template. Extract the document's `origin:` frontmatter field once during this phase when present; pass it through `{origin_path}` as described below.

### Select Conditional Personas

Analyze the document content to determine which conditional personas to activate. Check for these signals:

**product-lens** -- activate when the document makes challengeable claims about what to build and why, or when the proposed work carries strategic weight beyond the immediate problem. The system's users may be end users, developers, operators, maintainers, or any other audience -- the criteria are domain-agnostic. Check for either leg:

*Leg 1 — Premise claims:* The document stakes a position on what to build or why that a knowledgeable stakeholder could reasonably challenge -- not merely describing a task or restating known requirements:
- Problem framing where the stated need is non-obvious or debatable, not self-evident from existing context
- Solution selection where alternatives plausibly exist (implicit or explicit)
- Prioritization decisions that explicitly rank what gets built vs deferred
- Goal statements that predict specific user outcomes, not just restate constraints or describe deliverables

*Leg 2 — Strategic weight:* The proposed work could affect system trajectory, user perception, or competitive positioning, even if the premise is sound:
- Changes that shape how the system is perceived or what it becomes known for
- Complexity or simplicity bets that affect adoption, onboarding, or cognitive load
- Work that opens or closes future directions (path dependencies, architectural commitments)
- Opportunity cost implications -- building this means not building something else

**design-lens** -- activate when the document contains:
- UI/UX references, frontend components, or visual design language
- User flows, wireframes, screen/page/view mentions
- Interaction descriptions (forms, buttons, navigation, modals)
- References to responsive behavior or accessibility

**security-lens** -- activate when the document contains:
- Auth/authorization mentions, login flows, session management
- API endpoints exposed to external clients
- Data handling, PII, payments, tokens, credentials, encryption
- Third-party integrations with trust boundary implications

**scope-guardian** -- activate when the document contains:
- Multiple priority tiers (P0/P1/P2, must-have/should-have/nice-to-have)
- Large requirement count (>8 distinct requirements or implementation units)
- Stretch goals, nice-to-haves, or "future work" sections
- Scope boundary language that seems misaligned with stated goals
- Goals that don't clearly connect to requirements

**adversarial** -- activate when the document contains a high-value challenge surface, not merely structural complexity. Routine plans with stated rationale are not by themselves an adversarial signal. Activate when ANY of the following holds:
- The document is a **requirements document** with 2+ challengeable claims (problem framing, study design, solution selection, prioritization, predicted outcomes)
- The document touches a **high-stakes domain** -- auth, payments, billing, data migrations, privacy/compliance, PHI, clinical decision support, external integrations, or regulated reporting
- The document **proposes a new abstraction, framework, statistical methodology, or significant architectural pattern**
- The document is a **plan with no `origin:` requirements doc** (greenfield bootstrap)
- The document is a **plan that explicitly extends scope** beyond its origin requirements doc (new actors, flows, endpoints, outcomes, analyses, or deferred-then-restored features)
- The document contains an **explicit alternatives section** or unresolved tradeoffs

Do NOT activate adversarial on a routine plan document that derives from a validated origin requirements doc, stays within scope, and does not introduce high-stakes domains or new abstractions. The plan's structural decisions (more units, more rationale) are not by themselves adversarial signal -- those are the plan doing its job.

## Phase 2: Announce and Dispatch Personas

### Build and Announce the Team

Always include `ce-coherence-reviewer` and `ce-feasibility-reviewer`. Add each activated conditional: `ce-product-lens-reviewer`, `ce-design-lens-reviewer`, `ce-security-lens-reviewer`, `ce-scope-guardian-reviewer`, `ce-adversarial-document-reviewer`. Tell the user the team, with a one-line justification per conditional:

```
Reviewing with:
- ce-coherence-reviewer (always-on)
- ce-feasibility-reviewer (always-on)
- ce-scope-guardian-reviewer -- plan has 12 requirements across 3 priority levels
```

### Dispatch

Dispatch agents using **bounded parallelism** with the platform's subagent primitive (e.g., `Agent` in Claude Code, `spawn_agent` in Codex, `subagent` in Pi via the `pi-subagents` extension). Omit the `mode` parameter so the user's configured permission settings apply. Respect the current harness's active-subagent limit: queue selected reviewers, dispatch only as many as the harness accepts, and fill freed slots as reviewers complete. Treat active-agent/thread/concurrency-limit spawn errors as backpressure, not reviewer failure.

Read `references/subagent-template.md` and `references/findings-schema.json` now. Build each agent's prompt from the template with these variables filled:

| Variable | Value |
|----------|-------|
| `{persona_file}` | Full content of the agent's markdown file |
| `{schema}` | Content of `references/findings-schema.json` |
| `{document_type}` | Phase 1 classification |
| `{document_path}` | Path to the document |
| `{document_content}` | Full text of the document |
| `{origin_path}` | The document's `origin:` frontmatter value, or the literal string `none` |
| `{decision_primer}` | Prior-round decisions in the current session (see Decision primer) |

Pass each agent the **full document** — do not split into sections.

### Decision primer

On round 1 (no prior decisions), set `{decision_primer}` to:

```
<prior-decisions>
Round 1 — no prior decisions.
</prior-decisions>
```

On round 2+ in the same interactive session, read `references/decision-primer.md` and render the accumulated prior-round decisions in its format.

**Error handling:** If an agent fails or times out, proceed with the completed agents' findings and note the failure in Coverage.

## Phases 3-5: Synthesis, Presentation, and Next Action

After all dispatched agents return, read `references/synthesis.md` for the synthesis pipeline (validate, anchor-based gate, dedup, cross-persona agreement promotion, resolve contradictions, auto-promotion, route by three tiers with FYI subsection); its step 3.5c lives in `references/synthesis-chains.md`. Then read `references/presentation.md` for `safe_auto` fix application, headless-envelope output, the handoff to the routing question, and the Phase 5 terminal question.

For the four-option routing question (interactive mode), read `references/routing-question.md`; for the per-finding walk-through and unified completion report, read `references/walkthrough.md`. For the bulk-action preview used by best-judgment routing, Append-to-Open-Questions, and walk-through `Auto-resolve with best judgment on the rest`, read `references/bulk-preview.md`. Do not load these files before agent dispatch completes. For Append-to-Open-Questions (Defer) actions, read `references/open-questions-defer.md`; for the final report shape, read `references/review-output-template.md`.

