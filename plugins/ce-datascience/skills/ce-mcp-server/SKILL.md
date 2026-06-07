---
name: ce-mcp-server
description: "Register and explain the ce-datascience MCP server for stack profiles, SAPs, data locks, compliance checks, and learning artifacts."
argument-hint: "[install|status|tools]"
---

# CE DataScience MCP Server


## Skill Value

- **Problem it solves:** MCP setup can point at the wrong root or confuse bundled plugin assets with user project outputs.
- **Use when:** The user wants MCP setup, tool registration, stack-profile tools, SAP tools, or project-root behavior.
- **Output:** Platform-specific MCP setup guidance and verified runtime path expectations.
- **Ask only if:** Only when the target platform or install root cannot be inferred.
- **Do not do:** Do not write user project artifacts under the plugin cache.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Register and manage the ce-datascience MCP server for IDE-agnostic deployment. This skill exposes key ce-datascience capabilities as MCP tools that any MCP-compatible IDE can invoke.

The server runs as a **local stdio process** — no remote deployment needed. The IDE spawns the server as a child process and communicates via the MCP protocol.

## Prerequisites

- Python 3.10+ with `fastmcp`, `ruamel.yaml`, and `pydantic` installed
- Install dependencies:

```bash
python3 -m pip install --upgrade fastmcp ruamel.yaml pydantic
```

If the server starts without those packages, it exits with the same install command instead of a raw Python traceback.

## Project Root Resolution

The MCP server separates bundled plugin assets from user project artifacts. Scripts and checklist references load from the installed plugin, while config, SAPs, data-state files, compliance reports, and learnings resolve under the user project root.

Resolution order:

1. Tool call `project_root` argument
2. `CE_DATASCIENCE_PROJECT_ROOT`
3. Server current working directory, promoted to the nearest git root when one exists

When an IDE launches MCP servers outside the project directory, set `CE_DATASCIENCE_PROJECT_ROOT` in the MCP server environment.

## Setup

### Claude Code

For a plugin loaded with `claude --plugin-dir`, use the plugin-root path. Claude
pre-resolves `CLAUDE_PLUGIN_ROOT` when loading plugin content:

```bash
claude mcp add ce-datascience -- python3 "${CLAUDE_PLUGIN_ROOT}/skills/ce-mcp-server/mcp_server/run.py"
```

Or manually add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "ce-datascience": {
      "type": "stdio",
      "command": "python3",
      "args": ["${CLAUDE_PLUGIN_ROOT}/skills/ce-mcp-server/mcp_server/run.py"],
      "env": {
        "CE_DATASCIENCE_PROJECT_ROOT": "/absolute/path/to/your/project"
      }
    }
  }
}
```

### Codex, OpenCode, Pi, Gemini CLI, and Kiro

When installing with the converter, use the normal install command for the target. The installer rewrites MCP server paths to absolute installed skill files and writes the target's config shape:

```bash
bun run src/index.ts install ./plugins/ce-datascience --to codex --include-skills
bun run src/index.ts install ./plugins/ce-datascience --to opencode --output /path/to/workspace
bun run src/index.ts install ./plugins/ce-datascience --to pi
bun run src/index.ts install ./plugins/ce-datascience --to gemini --output /path/to/gemini-home
bun run src/index.ts install ./plugins/ce-datascience --to kiro --output /path/to/kiro-workspace
```

Do not copy a source-checkout path into generated target configs. The generated configs point to the installed `ce-mcp-server/mcp_server/run.py` file for that platform.

### Cursor / Windsurf

Add to your IDE's MCP configuration (e.g., `.cursor/mcp.json` or Windsurf settings):

```json
{
  "ce-datascience": {
    "command": "python3",
    "args": ["/absolute/path/to/installed/ce-mcp-server/mcp_server/run.py"],
    "env": {
      "CE_DATASCIENCE_PROJECT_ROOT": "/absolute/path/to/your/project"
    }
  }
}
```

### VS Code + Cline

Add to `cline_mcp_settings.json`:

```json
{
  "ce-datascience": {
    "command": "python3",
    "args": ["/absolute/path/to/installed/ce-mcp-server/mcp_server/run.py"],
    "env": {
      "CE_DATASCIENCE_PROJECT_ROOT": "/absolute/path/to/your/project"
    },
    "disabled": false
  }
}
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `literature_search` | Search scientific papers via Google Scholar, Crossref, SciHub. Returns structured results with BibTeX. |
| `stack_profile` | Read/write the `.ce-datascience/config.local.yaml` stack profile for R/Python/library settings. |
| `sap_create` | Generate a Statistical Analysis Plan from study metadata using the SAP template with stable SAP-N.M identifiers. |
| `sap_drift_check` | Detect structural and semantic drift between a SAP and the current analysis code. |
| `reporting_compliance_check` | Run study-type-aware reporting guideline compliance check against the 35 supported reporting guidelines. |
| `publication_readiness_check` | Summarize Table 1, figure manifest, manuscript package, registry package, and signoff readiness into a project-local report. |
| `compound_learning` | Read/write institutional knowledge entries in `docs/solutions/` with data-science problem_type categorization. |
| `data_wave_register` | Register a data extract in project-local `.ce-datascience/data-state.yaml`. |
| `data_lock` | Seal a registered data wave after QA passes. |

## Tool Details

### literature_search

**Input:**
```json
{
  "query": "PICO/PECO research question or keywords",
  "doi": "",
  "min_year": 2018,
  "scholar_pages": 3,
  "max_citations": null,
  "output_dir": null
}
```

**Output:** Structured paper list with title, authors, year, journal, DOI, citation count, and BibTeX.

### stack_profile

**Input:**
```json
{
  "action": "read | write",
  "language": "r | python | both",
  "ide": "rstudio | jupyter | marimo | quarto | vscode",
  "environment_manager_r": "renv | packrat | none",
  "environment_manager_python": "venv | conda | poetry | pixi | none",
  "r_project_type": "script | package | shiny | plumber | targets",
  "reporting": "quarto | rmarkdown | marimo | jupyter",
  "data_root": "/absolute/path/to/local/extracts-or-null",
  "data_connection_name": "healthmap-connection",
  "data_connection_type": "postgres | sqlite | duckdb | other",
  "data_connection_database": "healthmap_dev",
  "data_connection_auth": "entra",
  "data_connection_status": "verified",
  "reporting_checklist": "STROBE",
  "reporting_checklist_extensions": ["RECORD"],
  "project_root": "/absolute/path/to/your/project"
}
```

**Output:** Current config state or updated config confirmation. Database connection metadata is stored separately from `data_root`; database-backed projects may leave `data_root` unset and register concrete tables, extracts, or query outputs with `data_wave_register(location=...)`.

### sap_create

**Input:**
```json
{
  "study_type": "observational | rct | systematic-review | diagnostic-accuracy | ...",
  "title": "Study title",
  "population": "Study population description",
  "primary_outcome": "Primary endpoint",
  "ai_involvement": "none | ai-assisted | ai-primary | llm-based",
  "power_analysis": "descriptive only: no inferential test",
  "output_path": "analysis/sap.md",
  "project_root": "/absolute/path/to/your/project"
}
```

**Output:** SAP file path and summary.

### sap_drift_check

**Input:**
```json
{
  "sap_path": "analysis/sap.md",
  "analysis_dir": "",
  "project_root": "/absolute/path/to/your/project"
}
```

**Output:** Drift report listing SAP sections with missing, found, or extra analysis code.

### reporting_compliance_check

**Input:**
```json
{
  "study_type": "rct | observational | systematic-review | diagnostic-accuracy | ...",
  "guideline": "consort | strobe | prisma | ...",
  "manuscript_path": "docs/manuscript.md",
  "project_root": "/absolute/path/to/your/project"
}
```

**Output:** Compliance checklist with applicable guideline items.

### publication_readiness_check

**Input:**
```json
{
  "table1_spec": "analysis/publication/tables/table1-spec.json",
  "figure_manifest": "analysis/publication/figures/figure-manifest.json",
  "package_manifest": "analysis/publication/package/package-manifest.json",
  "signoff_ledger": "analysis/signoff/signoff-ledger.json",
  "registry_package_dir": "analysis/prereg/clinicaltrials-2026-05-30",
  "report_path": ".ce-datascience/publication-readiness-report.md",
  "project_root": "/absolute/path/to/your/project"
}
```

**Output:** `__CE_PUBLICATION_READINESS__` signal plus a markdown report path.

### compound_learning

**Input:**
```json
{
  "action": "read | write",
  "problem_type": "methods_decision | statistical_pattern | data_quality_issue | reproducibility_pattern | literature_pattern | ...",
  "title": "Learning title",
  "content": "Learning content (markdown)",
  "module": "Module or area affected",
  "component": "statistical_analysis | reproducibility | ...",
  "tags": "comma-separated keywords",
  "project_root": "/absolute/path/to/your/project"
}
```

**Output:** Matching entries (read) or write confirmation.

## Fallback: Slash Commands

When MCP is not available in your IDE, invoke the corresponding skills directly:
- `/ce-literature-search` instead of `literature_search`
- `/ce-datascience:ce-setup` instead of `stack_profile`
- `/ce-datascience:ce-plan` (SAP mode) instead of `sap_create`
- `/ce-datascience:ce-code-review` with SAP drift agent instead of `sap_drift_check`

If optional local aliases were installed into `.claude/commands`, the bare
forms such as `/ce-setup` also work. Treat those aliases as user/project command
files, not as native plugin names.
