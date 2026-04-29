# Plan Template (Implementation Mode)

Canonical templates the writer fills in during Phase 4 of `/ce-plan` when **implementation mode** is active. SAP-mode templates live in `sap-template.md`. Linked from `SKILL.md` § Phase 4.2.

## Table of contents

1. Core Plan Template — frontmatter, Overview, Problem Frame, Requirements Trace, Scope, Context, Decisions, Open Questions, Output Structure (optional), High-Level Technical Design (optional), Implementation Units, System-Wide Impact, Risks, Documentation Notes, Sources & References.
2. Optional Deep-Plan Extensions — Alternative Approaches, Success Metrics, Dependencies, Risk Analysis, Phased Delivery, Documentation Plan, Operational / Rollout Notes.

When to include each block:

- Lightweight plans use the Core template only and may omit optional sections.
- Standard plans use the full Core template and skip optional Deep-Plan Extensions.
- Deep plans use the Core template plus whichever Optional Extensions genuinely help; never as boilerplate.

---

## 1. Core Plan Template

```markdown
---
title: [Plan Title]
type: [feat|fix|refactor]
status: active
date: YYYY-MM-DD
origin: docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md  # include when planning from a requirements doc
deepened: YYYY-MM-DD  # optional, set when the confidence check substantively strengthens the plan
---

# [Plan Title]

## Overview

[What is changing and why]

---

## Problem Frame

[Summarize the user/business problem and context. Reference the origin doc when present.]

---

## Requirements Trace

- R1. [Requirement or success criterion this plan must satisfy]
- R2. [Requirement or success criterion this plan must satisfy]

<!-- Origin trace sub-blocks: include only when the upstream requirements doc supplies the
     corresponding section. Each sub-block is independent — include only the ones that apply.
     Omit cleanly (no header, no empty line) when no origin doc exists or the origin had no
     Actors / Key Flows / Acceptance Examples sections. -->

**Origin actors:** [A1 (role/name), A2 (role/name), …]
**Origin flows:** [F1 (flow name), F2 (flow name), …]
**Origin acceptance examples:** [AE1 (covers R1, R4), AE2 (covers R3), …]

---

## Scope Boundaries

<!-- Default structure (no origin doc, or origin was Lightweight / Standard / Deep-feature):
     a single bulleted list of explicit non-goals. The optional `### Deferred to Follow-Up Work`
     subsection below may still be included when this plan's implementation is intentionally
     split across other PRs/issues/repos. -->

- [Explicit non-goal or exclusion]

<!-- Optional plan-local subsection — include when this plan's implementation is intentionally
     split across other PRs, issues, or repos. Distinct from origin-carried "Deferred for later"
     (product sequencing) and "Outside this product's identity" (positioning). -->
### Deferred to Follow-Up Work

- [Work that will be done separately]: [Where or when -- e.g., "separate PR in repo-x", "future iteration"]

<!-- Triggered structure: replace the single list above with the three subsections below ONLY
     when the origin doc is Deep-product (detectable by presence of an "Outside this product's
     identity" subsection in the origin's Scope Boundaries). At all other tiers and when no
     origin exists, use the single-list structure above. -->

<!--
### Deferred for later

[Carried from origin — product/version sequencing. Work that will be done eventually but not in v1.]

- [Item]

### Outside this product's identity

[Carried from origin — positioning rejection. Adjacent product the plan must not accidentally build.]

- [Item]

### Deferred to Follow-Up Work

[Plan-local — implementation work intentionally split across other PRs/issues/repos. Distinct from origin's "Deferred for later" (product) and "Outside this product's identity" (positioning).]

- [Item]
-->

---

## Context & Research

### Relevant Code and Patterns

- [Existing file, class, component, or pattern to follow]

### Institutional Learnings

- [Relevant `docs/solutions/` insight]

### External References

- [Relevant external docs or best-practice source, if used]

---

## Key Technical Decisions

- [Decision]: [Rationale]

---

## Open Questions

### Resolved During Planning

- [Question]: [Resolution]

### Deferred to Implementation

- [Question or unknown]: [Why it is intentionally deferred]

---

<!-- Optional: Include when the plan creates a new directory structure (greenfield plugin,
     new service, new package). Shows the expected output shape at a glance. Omit for plans
     that only modify existing files. This is a scope declaration, not a constraint --
     the implementer may adjust the structure if implementation reveals a better layout. -->
## Output Structure

    [directory tree showing new directories and files]

---

<!-- Optional: Include this section only when the work involves DSL design, multi-component
     integration, complex data flow, state-heavy lifecycle, or other cases where prose alone
     would leave the approach shape ambiguous. Omit it entirely for well-patterned or
     straightforward work. -->
## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

[Pseudo-code grammar, mermaid diagram, data flow sketch, or state diagram — choose the medium that best communicates the solution shape for this work.]

---

## Implementation Units

<!-- Each unit carries a stable plan-local U-ID (U1, U2, …) assigned sequentially.
     U-IDs are never renumbered: reordering preserves them in place, splitting keeps the
     original U-ID and assigns the next unused number to the new unit, deletion leaves
     a gap. This anchor is what ce-work references in blockers and verification, so
     stability across plan edits is load-bearing. -->

- U1. **[Name]**

**Goal:** [What this unit accomplishes]

**Requirements:** [R1, R2]

**Dependencies:** [None / U1 / external prerequisite]

**Files:**
- Create: `path/to/new_file`
- Modify: `path/to/existing_file`
- Test: `path/to/test_file`

**Approach:**
- [Key design or sequencing decision]

**Execution note:** [Optional test-first, characterization-first, or other execution posture signal]

**Technical design:** *(optional -- pseudo-code or diagram when the unit's approach is non-obvious. Directional guidance, not implementation specification.)*

**Patterns to follow:**
- [Existing file, class, or pattern]

**Test scenarios:**
<!-- Include only categories that apply to this unit. Omit categories that don't. For units with no behavioral change, use "Test expectation: none -- [reason]" instead of leaving this section blank. -->
- [Scenario: specific input/action -> expected outcome. Prefix with category — Happy path, Edge case, Error path, or Integration — to signal intent]

**Verification:**
- [Outcome that should hold when this unit is complete]

---

## System-Wide Impact

- **Interaction graph:** [What callbacks, middleware, observers, or entry points may be affected]
- **Error propagation:** [How failures should travel across layers]
- **State lifecycle risks:** [Partial-write, cache, duplicate, or cleanup concerns]
- **API surface parity:** [Other interfaces that may require the same change]
- **Integration coverage:** [Cross-layer scenarios unit tests alone will not prove]
- **Unchanged invariants:** [Existing APIs, interfaces, or behaviors that this plan explicitly does not change — and how the new work relates to them. Include when the change touches shared surfaces and reviewers need blast-radius assurance]

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| [Meaningful risk] | [How it is addressed or accepted] |

---

## Documentation / Operational Notes

- [Docs, rollout, monitoring, or support impacts when relevant]

---

## Sources & References

- **Origin document:** [docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md](path)
- Related code: [path or symbol]
- Related PRs/issues: #[number]
- External docs: [url]
```

---

## 2. Optional Deep-Plan Extensions

Add these sections only when they materially improve execution quality or stakeholder alignment for a Deep plan. Never include as boilerplate.

```markdown
## Alternative Approaches Considered

- [Approach]: [Why rejected or not chosen]

---

## Success Metrics

- [How we will know this solved the intended problem]

---

## Dependencies / Prerequisites

- [Technical, organizational, or rollout dependency]

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk] | [Low/Med/High] | [Low/Med/High] | [How addressed] |

---

## Phased Delivery

### Phase 1
- [What lands first and why]

### Phase 2
- [What follows and why]

---

## Documentation Plan

- [Docs or runbooks to update]

---

## Operational / Rollout Notes

- [Monitoring, migration, feature flag, or rollout considerations]
```
