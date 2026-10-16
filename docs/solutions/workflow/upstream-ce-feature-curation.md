---
title: Upstream CE feature curation for methodsmith
module: methodsmith
tags:
  - upstream-sync
  - compound-engineering
  - product-scope
  - documentation
problem_type: workflow_issue
status: active
date: 2026-05-30
---

# Upstream CE Feature Curation

## Context

`methodsmith` is a curated health data science plugin, not a full mirror of the original compound-engineering plugin. Upstream sync work should port platform compatibility, shared workflow reliability, and public distribution polish while preserving biomedical research, SAP, R/Python, reporting-checklist, and clinical/health data positioning.

## Included From Upstream

| Upstream capability | methodsmith adaptation |
|---|---|
| Planning output modes and rendering | `/method-plan` keeps SAP mode and implementation-plan mode while adding upstream output handling, HTML/Markdown rendering references, format-preserving resume, synthesis, external-research routing, and conceptual diagrams. |
| Brainstorm output modes and grouped requirements | `/method-brainstorm` keeps PICO/PECO and study-design framing while adding grouped requirements, visual communication behavior, and output-mode handling. |
| PR feedback resolution reliability | `method-resolve-feedback` carries GitHub GraphQL pagination and split-reference handling, then answers with statistical methodology, SAP drift, reproducibility, and reporting-checklist language. |
| Cross-platform session discovery | `/method-sessions` discovers Claude Code, Codex, and Cursor sessions with repo-root pre-resolution and structured extraction scripts. |
| Review, commit, PR, and compounding fixes | `method-review`, `method-doc-review`, `method-commit`, `method-pr`, and `method-compound` accept upstream fixes where they improve shared workflow behavior without reintroducing software-product scope. |
| Public support skills | `/method-release-notes` and `/method-report-bug` are included because public users need version-specific answers and structured bug reporting. |
| Target compatibility | Agent source files use `method-*.md`, legacy `*.agent.md` parsing remains supported, Codex installs respect `CODEX_HOME`, and managed hooks preserve manual and other-plugin entries. |

### 2026-09-05 refresh

Merged in [PR #57](https://github.com/sajor2000/methodsmith/pull/57), the fork adopted the compatible 3.24 and post-3.24 safeguards: temporary-index commit isolation, project publishing gates, path-scoped coding criteria, worktree snapshot verification, semantic parallel-work checks, implementation-independent plan objectives, secret-safe performance debugging, and isolated native Codex experiment dispatch. Binding repository instructions, PHI controls, SAP ownership, real-data provenance, and cross-platform fallbacks remain authoritative.

The upstream LFG, full babysit state machine, catalog layout, developer runner, and `ce-explain` changes remain deferred because their owning components are absent or intentionally lean in this plugin.

### 2026-10-09 comparison (upstream v3.30.4)

The fork ported these converter CLI fixes:

- YAML scalar quoting in frontmatter.
- Windows `~/` expansion.
- Whole-word Droid tool inference.
- URL-safe Codex content transforms.
- A shared reserved-path allowlist.
- Current Sonnet/Opus aliases, with OpenCode temperature suppression for models that reject sampling parameters.
- The read-only-sandbox fix in the `method-setup` health check.

The fork's per-line Claude Code path guard is preserved. Shared-skill reliability ports, repository guardrails, and the fork-specific audit are planned in `docs/plans/2026-10-09-001-chore-upstream-v3-30-comparison-and-audit-plan.md`.

Upstream's move to a root-level, skills-only plugin is deliberately not adopted. It would break marketplace paths, gemini and kiro targets, and direct invocation of the shared statistical and PHI reviewers.

## Deferred From Upstream

Keep these upstream-only areas out of the default health data science inventory unless a later product decision explicitly requests them:

- Rails and DHH Rails style workflows.
- Frontend, browser polish, Xcode, and platform app testing workflows.
- Dogfood, LFG, agent-native architecture/audit, product-pulse, Slack research, demo-reel, proof, and riffrec-specific workflows.
- Generic software-product agents that would distract from statistical, biomedical, clinical, and data science review.

## Documentation Rule

When a future upstream sync lands, update these surfaces together:

- Root `README.md` for user-facing feature summary and installation behavior.
- `plugins/methodsmith/README.md` for skill/agent inventory and platform notes.
- Fork requirements and implementation plans in `docs/brainstorms/` and `docs/plans/` with a dated status update when historical statements become stale.
- A `docs/solutions/` note when the sync establishes a durable policy or recovery pattern.

Do not hand-bump release-owned versions or author release entries manually while documenting the sync.
