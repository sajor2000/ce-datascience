---
name: ce-mcp-server
description: 'Register the ce-datascience MCP server for IDE-agnostic access to literature search, stack profile, SAP, and reporting compliance tools. Use when setting up ce-datascience in Cursor, Windsurf, VS Code+Cline, or any MCP-compatible IDE.'
argument-hint: "[install|status|tools]"
---

# CE DataScience MCP Server

Register and manage the ce-datascience MCP server for IDE-agnostic deployment. This skill exposes key ce-datascience capabilities as MCP tools that any MCP-compatible IDE can invoke.

## Setup

### Claude Code

```bash
droid mcp add ce-datascience https://mcp.ce-datascience.dev/mcp --type http
```

Or manually add to `.mcp.json`:

```json
{
  "mcpServers": {
    "ce-datascience": {
      "type": "http",
      "url": "https://mcp.ce-datascience.dev/mcp",
      "description": "Compound engineering for computational scientists"
    }
  }
}
```

### Cursor / Windsurf / VS Code + Cline

Add the server URL to your IDE's MCP configuration:

```json
{
  "ce-datascience": {
    "url": "https://mcp.ce-datascience.dev/mcp",
    "description": "Compound engineering for computational scientists"
  }
}
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `literature_search` | Search scientific papers via Google Scholar, Crossref, SciHub. Returns structured results with BibTeX. |
| `stack_profile_configure` | Read/write the `.ce-datascience/config.local.yaml` stack profile for R/Python/library settings. |
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
  "min_year": 2018,
  "max_citations": null,
  "scholar_pages": 3,
  "doi": null,
  "output_dir": null
}
```

**Output:** Structured paper list with title, authors, year, journal, DOI, citation count, and BibTeX.

### stack_profile_configure

**Input:**
```json
{
  "action": "read" | "write",
  "language": "r" | "python" | "both",
  "ide": "rstudio" | "jupyter" | "marimo" | "quarto" | "vscode",
  "reporting": "quarto" | "rmarkdown" | "marimo" | "jupyter"
}
```

**Output:** Current config state or updated config confirmation.

### sap_create

**Input:**
```json
{
  "study_type": "rct" | "observational" | "diagnostic" | "systematic_review",
  "title": "Study title",
  "population": "Study population description",
  "primary_outcome": "Primary endpoint",
  "ai_involvement": false
}
```

**Output:** Structured SAP markdown with SAP-N.M section identifiers.

### sap_drift_check

**Input:**
```json
{
  "sap_path": "docs/plans/sap.md",
  "analysis_dir": "src/"
}
```

**Output:** Drift report listing SAP sections with missing, divergent, or extra analysis code.

### reporting_compliance_check

**Input:**
```json
{
  "study_type": "rct" | "observational" | "diagnostic" | "systematic_review" | ...,
  "manuscript_path": "docs/manuscript.md",
  "guideline": "consort" | "strobe" | null
}
```

**Output:** Compliance checklist with pass/fail/warning per guideline item.

### compound_learning

**Input:**
```json
{
  "action": "read" | "write",
  "problem_type": "methods_decision" | "statistical_pattern" | "data_quality_issue" | "reporting_convention",
  "title": "Learning title",
  "content": "Learning content (markdown)"
}
```

**Output:** Confirmation or matching entries from `docs/solutions/`.

## Offline / Local Mode

When the remote MCP server is unavailable, the tools fall back to local execution using the skill scripts and templates bundled with the plugin. The MCP server is a convenience layer for IDEs that prefer the MCP protocol over slash commands — both paths produce the same results.

To use offline, invoke the corresponding skills directly:
- `/ce-literature-search` instead of `literature_search`
- `/ce-setup` instead of `stack_profile_configure`
- `/ce-plan` (SAP mode) instead of `sap_create`
- `/ce-code-review` with SAP drift agent instead of `sap_drift_check`
