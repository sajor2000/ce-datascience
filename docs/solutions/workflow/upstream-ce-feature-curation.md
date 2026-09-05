---
title: Upstream CE feature curation for ce-datascience
module: ce-datascience
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

`ce-datascience` is a curated health data science plugin, not a full mirror of the original compound-engineering plugin. Upstream sync work should port platform compatibility, shared workflow reliability, and public distribution polish while preserving biomedical research, SAP, R/Python, reporting-checklist, and clinical/health data positioning.

## Included From Upstream

| Upstream capability | ce-datascience adaptation |
|---|---|
| Planning output modes and rendering | `/ce-plan` keeps SAP mode and implementation-plan mode while adding upstream output handling, HTML/Markdown rendering references, format-preserving resume, synthesis, external-research routing, and conceptual diagrams. |
| Brainstorm output modes and grouped requirements | `/ce-brainstorm` keeps PICO/PECO and study-design framing while adding grouped requirements, visual communication behavior, and output-mode handling. |
| PR feedback resolution reliability | `ce-resolve-pr-feedback` carries GitHub GraphQL pagination and split-reference handling, then answers with statistical methodology, SAP drift, reproducibility, and reporting-checklist language. |
| Cross-platform session discovery | `/ce-sessions` discovers Claude Code, Codex, and Cursor sessions with repo-root pre-resolution and structured extraction scripts. |
| Review, commit, PR, and compounding fixes | `ce-code-review`, `ce-doc-review`, `ce-commit`, `ce-commit-push-pr`, and `ce-compound` accept upstream fixes where they improve shared workflow behavior without reintroducing software-product scope. |
| Public support skills | `/ce-release-notes` and `/ce-report-bug` are included because public users need version-specific answers and structured bug reporting. |
| Target compatibility | Agent source files use `ce-*.md`, legacy `*.agent.md` parsing remains supported, Codex installs respect `CODEX_HOME`, and managed hooks preserve manual and other-plugin entries. |

### 2026-09-04 refresh

The fork adopted the compatible 3.24 and post-3.24 safeguards: shell-safe commits, project publishing gates, scoped coding criteria, worktree snapshot verification, semantic parallel-work checks, outcome-first plan summaries, secret-safe performance debugging, and native Codex experiment dispatch. Binding repository instructions, PHI controls, SAP ownership, real-data provenance, and cross-platform fallbacks remain authoritative.

The upstream LFG, full babysit state machine, catalog layout, developer runner, and `ce-explain` changes remain deferred because their owning components are absent or intentionally lean in this plugin.

## Deferred From Upstream

Keep these upstream-only areas out of the default health data science inventory unless a later product decision explicitly requests them:

- Rails and DHH Rails style workflows.
- Frontend, browser polish, Xcode, and platform app testing workflows.
- Dogfood, LFG, agent-native architecture/audit, product-pulse, Slack research, demo-reel, proof, and riffrec-specific workflows.
- Generic software-product agents that would distract from statistical, biomedical, clinical, and data science review.

## Documentation Rule

When a future upstream sync lands, update these surfaces together:

- Root `README.md` for user-facing feature summary and installation behavior.
- `plugins/ce-datascience/README.md` for skill/agent inventory and platform notes.
- Fork requirements and implementation plans in `docs/brainstorms/` and `docs/plans/` with a dated status update when historical statements become stale.
- A `docs/solutions/` note when the sync establishes a durable policy or recovery pattern.

Do not hand-bump release-owned versions or author release entries manually while documenting the sync.
