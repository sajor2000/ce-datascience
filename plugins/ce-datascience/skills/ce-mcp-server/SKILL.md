---
name: ce-mcp-server
description: 'Register the ce-datascience MCP server for IDE-agnostic access to literature search, stack profile, SAP, and reporting compliance tools. Use when setting up ce-datascience in Cursor, Windsurf, VS Code+Cline, or any MCP-compatible IDE.'
argument-hint: "[install|status|tools]"
---

# CE DataScience MCP Server

Register and manage the ce-datascience MCP server for IDE-agnostic deployment. This skill exposes key ce-datascience capabilities as MCP tools that any MCP-compatible IDE can invoke.

The server runs as a **local stdio process** — no remote deployment needed. The IDE spawns the server as a child process and communicates via the MCP protocol.

## Prerequisites

- Python 3.10+ with `fastmcp`, `ruamel.yaml`, and `pydantic` installed
- Install dependencies:

```bash
pip install fastmcp ruamel.yaml pydantic
```

## Setup

### Claude Code

```bash
droid mcp add ce-datascience -- python3 plugins/ce-datascience/skills/ce-mcp-server/mcp_server/run.py
```

Or manually add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "ce-datascience": {
      "type": "stdio",
      "command": "python3",
      "args": ["plugins/ce-datascience/skills/ce-mcp-server/mcp_server/run.py"]
    }
  }
}
```

### Cursor / Windsurf

Add to your IDE's MCP configuration (e.g., `.cursor/mcp.json` or Windsurf settings):

```json
{
  "ce-datascience": {
    "command": "python3",
    "args": ["plugins/ce-datascience/skills/ce-mcp-server/mcp_server/run.py"]
  }
}
```

### VS Code + Cline

Add to `cline_mcp_settings.json`:

```json
{
  "ce-datascience": {
    "command": "python3",
    "args": ["plugins/ce-datascience/skills/ce-mcp-server/mcp_server/run.py"],
    "disabled": false
  }
}
```

**Note on installed paths:** The `args` path above works from a repo checkout. When the plugin is installed via `ce-datascience install --to codex` or `--to pi`, skills are copied to platform-specific locations and the MCP server path changes:

| Platform | MCP server path |
|----------|----------------|
| Claude Code (repo) | `plugins/ce-datascience/skills/ce-mcp-server/mcp_server/run.py` |
| Codex (`~/.codex`) | `skills/ce-mcp-server/mcp_server/run.py` (relative to `~/.codex/ce-datascience/`) |
| Pi (`~/.pi/agent`) | `skills/ce-mcp-server/mcp_server/run.py` (relative to `~/.pi/agent/`) |

For Codex and Pi, update the MCP server path in your config to match the installed location.

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `literature_search` | Search scientific papers via Google Scholar, Crossref, SciHub. Returns structured results with BibTeX. |
| `stack_profile` | Read/write the `.ce-datascience/config.local.yaml` stack profile for R/Python/library settings. |
| `sap_create` | Generate a Statistical Analysis Plan from study metadata using the SAP template with stable SAP-N.M identifiers. |
| `sap_drift_check` | Detect structural and semantic drift between a SAP and the current analysis code. |
| `reporting_compliance_check` | Run study-type-aware reporting guideline compliance check against the 16 supported guidelines. |
| `compound_learning` | Read/write institutional knowledge entries in `docs/solutions/` with data-science problem_type categorization. |

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
  "reporting": "quarto | rmarkdown | marimo | jupyter"
}
```

**Output:** Current config state or updated config confirmation.

### sap_create

**Input:**
```json
{
  "study_type": "observational | rct | systematic-review | diagnostic-accuracy | ...",
  "title": "Study title",
  "population": "Study population description",
  "primary_outcome": "Primary endpoint",
  "ai_involvement": "none | ai-assisted | ai-primary | llm-based",
  "output_path": "analysis/sap.md"
}
```

**Output:** SAP file path and summary.

### sap_drift_check

**Input:**
```json
{
  "sap_path": "analysis/sap.md",
  "analysis_dir": ""
}
```

**Output:** Drift report listing SAP sections with missing, found, or extra analysis code.

### reporting_compliance_check

**Input:**
```json
{
  "study_type": "rct | observational | systematic-review | diagnostic-accuracy | ...",
  "guideline": "consort | strobe | prisma | ...",
  "manuscript_path": "docs/manuscript.md"
}
```

**Output:** Compliance checklist with applicable guideline items.

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
  "tags": "comma-separated keywords"
}
```

**Output:** Matching entries (read) or write confirmation.

## Fallback: Slash Commands

When MCP is not available in your IDE, invoke the corresponding skills directly:
- `/ce-literature-search` instead of `literature_search`
- `/ce-setup` instead of `stack_profile`
- `/ce-plan` (SAP mode) instead of `sap_create`
- `/ce-code-review` with SAP drift agent instead of `sap_drift_check`
