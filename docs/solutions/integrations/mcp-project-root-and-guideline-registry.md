---
title: MCP project-root isolation and reporting guideline registry
category: integrations
status: active
last_verified: 2026-05-30
---

# MCP Project-Root Isolation and Guideline Registry

The ce-datascience MCP server is installed inside the plugin, but users invoke
it from arbitrary project directories and IDE launch contexts. Treat these as
separate roots:

- **Plugin root** is immutable installed content: bundled scripts, templates,
  and reporting checklist references.
- **Project root** is user-owned analysis content: `.ce-datascience/`,
  generated SAPs, data-state files, compliance reports, and learnings.

MCP tools resolve project root in this order:

1. explicit `project_root` tool argument
2. `CE_DATASCIENCE_PROJECT_ROOT`
3. process current working directory, promoted to the nearest git root

Never write user artifacts relative to the installed plugin cache. If the
resolved project root does not exist or is not writable, return actionable
setup text instead of falling back to plugin-local writes.

Reporting checklist support has one machine-readable source of truth:
`plugins/ce-datascience/skills/ce-code-review/references/guideline-registry.yaml`.
Docs, reviewer descriptions, MCP summaries, and routing guidance should agree
with that registry and its 35 checklist files. The canonical config fields are:

```yaml
stack_profile:
  reporting_checklist: STROBE
  reporting_checklist_extensions:
    - RECORD
```

Legacy `guidelines_selected` and nested `reporting_checklist` objects may be
read for compatibility, but new plugin output should write the canonical
stack-profile fields.
