---
name: ce-handoff
description: "Create or resume a concise, portable continuity record for a CE Data Science task."
argument-hint: "[create [focus] | resume [path or keywords]]"
---

# Handoff

## Skill Value

- **Problem it solves:** Session context disappears while task constraints and verification evidence still matter.
- **Use when:** Work must move to another agent or later session without relying on chat history.
- **Output:** A concise, portable handoff record or a verified resume summary.
- **Ask only if:** The requested continuity source is ambiguous or stale evidence changes the safe next action.
- **Do not do:** Treat a handoff as authority to mutate code, expose restricted data, or bypass current validation.

Create a durable, human-readable continuity record when work must move to another session or agent. The record preserves objective, verified state, changed files, constraints, commands run, residual risks, and the next safe action; it never includes credentials, raw patient data, or private model transcripts.

## Routes

- Bare invocation or `create [focus]`: write a handoff under `docs/handoffs/` using the current repository state and conversation context.
- `resume <path or keywords>`: read the selected handoff, verify referenced paths still exist, and summarize what remains before acting.

## Create

Resolve the repository root and choose `docs/handoffs/YYYY-MM-DD-<slug>.md`. Use repo-relative paths. Include: objective, branch/PR state, completed and verified work, active constraints (including real-data and SAP gates), residuals, and one next action. State uncertainty explicitly. Do not mutate source files, stage, commit, push, or create a PR as part of handoff creation.

## Resume

Treat a handoff as context, not authority. Re-check its branch, file, and validation claims before continuing. If its target is missing or its evidence is stale, report the mismatch and ask for direction before any mutation.
