---
title: Release-please version drift recovery
module: release
tags:
  - release-please
  - manifests
  - versioning
  - workflow
problem_type: workflow_issue
status: active
date: 2026-05-29
---

# Release-Please Version Drift Recovery

## Context

Routine feature PRs must not hand-bump release-owned versions. Release automation owns versions and changelogs for:

- CLI package metadata.
- `plugins/ce-datascience/.claude-plugin/plugin.json`.
- `plugins/ce-datascience/.cursor-plugin/plugin.json`.
- `plugins/ce-datascience/.codex-plugin/plugin.json`.
- Marketplace plugin version entries.

The CLI and `ce-datascience` versions are linked intentionally. A plugin-only change can still bump the CLI version, and a CLI-only change can still bump the plugin version.

## Detection

Run:

```bash
bun run release:validate
```

If validation reports version drift in a normal feature branch, assume the branch edited release-owned files directly unless there is an active release PR or explicit `release-as` decision.

## Recovery Decision

Use the smallest recovery that restores release automation ownership:

- **Forward-sync metadata descriptions/counts:** use existing metadata scripts or `bun run release:validate` when only generated descriptions or inventory counts drift.
- **Revert manual version edits:** remove hand-bumped versions from the feature branch and let release-please choose the release in its own PR.
- **Use `release-as` only when intentional:** reserve explicit release pins for a coordinated release decision, not routine cleanup.

Do not add a root `CHANGELOG.md` release section from a feature PR. GitHub Releases and release PRs are the canonical release-notes surface.

## Validation

After recovery, run:

```bash
bun run release:validate
git diff --check
```

For changes that also touch converters, target writers, manifests, or TypeScript release logic, run:

```bash
bunx tsc --noEmit
bun test
```
