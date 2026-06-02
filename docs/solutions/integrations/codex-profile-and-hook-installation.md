---
title: Codex profile and hook installation
module: codex
tags:
  - codex
  - install
  - hooks
  - profile
problem_type: integration_issue
status: active
date: 2026-05-29
---

# Codex Profile and Hook Installation

## Context

`ce-datascience` supports Codex in two ways:

1. Native Codex plugin installation from the marketplace metadata in `.codex-plugin/plugin.json`.
2. Generated target installation through the Bun converter with `install --to codex`.

Native Codex plugin installation is the preferred skills path. The generated Codex target is still useful because Codex does not yet load plugin-defined agents natively. The default generated install is therefore an agent bridge.

## Current Behavior

`install --to codex` resolves the Codex root with this priority:

1. Explicit `--codex-home` path.
2. `$CODEX_HOME` when set.
3. `~/.codex`.

Default generated Codex installs write agents only. Use the same `CODEX_HOME` for Codex itself and for the installer:

```bash
export CE_DS_REPO="$HOME/ce-datascience"
export CODEX_HOME="$HOME/.codex/profiles/research"

codex plugin marketplace add "$CE_DS_REPO"
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME"
CODEX_HOME="$CODEX_HOME" codex
```

Full standalone installs are available when native plugin installation is not an option:

```bash
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME" --include-skills
```

Standalone mode carries generated skills, MCP server config, and managed `.codex/hooks.json` entries.

## Hook Merge Rules

Managed hook entries are tagged with plugin metadata. During upgrade, the writer removes stale entries for the current plugin and replaces them with the current generated hooks. It must preserve:

- Manual hooks without managed metadata.
- Managed hooks owned by other plugins.
- Valid hook arrays on events not touched by `ce-datascience`.

If an existing `.codex/hooks.json` exists but cannot be parsed, the writer backs it up before writing a replacement. This prevents a generated install from silently destroying the only copy of a user's broken-but-recoverable hook file.

## Validation

Run these checks after changing Codex conversion, install roots, hook merging, or cleanup behavior:

```bash
bunx tsc --noEmit
bun test tests/codex-converter.test.ts tests/codex-writer.test.ts tests/cli.test.ts tests/resolve-output.test.ts
bun run release:validate
git diff --check
```

Before release, also smoke-test temp-root installs for Codex agents-only mode and standalone `--include-skills` mode.
