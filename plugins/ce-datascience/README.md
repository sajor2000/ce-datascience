# CE DataScience

Compound engineering for computational scientists. SAP management, statistical review, and full reporting guideline compliance for R and Python workflows — covering 16 standards across all study types and AI extensions.

## Getting Started

After installing, run `/ce-setup` in any project. It configures your stack profile (language, IDE, libraries, reporting framework) and bootstraps project config.

## Components

| Component | Count |
|-----------|-------|
| Agents | 41 |
| Skills | 18 |

## Skills

### Core Workflow

The compound engineering loop adapted for data science: hypothesize, design study, execute analysis, review methods, document learnings.

| Skill | Description |
|-------|-------------|
| `/ce-ideate` | Big-picture ideation: generate and evaluate research ideas, then route into brainstorming |
| `/ce-brainstorm` | Interactive study design exploration with PICO/PECO probes, writing a requirements doc before planning |
| `/ce-plan` | Create structured plans -- Statistical Analysis Plans (SAPs) for studies, or implementation plans for technical tasks |
| `/ce-code-review` | Statistical and methodological review with confidence-calibrated findings, reporting checklist compliance, and phase-aware dispatch (blinded EDA / confirmatory / general) |
| `/ce-work` | Execute analysis tasks with SAP tracking -- surfaces unimplemented SAP sections, flags exploratory analyses, and seeds tasks from the tabular SAP output catalog when present |
| `/ce-debug` | Systematically find root causes in analysis pipelines and data issues |
| `/ce-compound` | Document validated analytical approaches, statistical decisions, and domain methods (with deterministic dedup fingerprints across studies) |
| `/ce-compound-refresh` | Refresh stale learnings and decide whether to keep, update, replace, or archive |
| `/ce-sap-tabular` | Generate the structured tabular companion to the prose SAP -- 5-table artifact (overview, outputs catalog, variables catalog, long/wide samples) statisticians hand to programmers |
| `/ce-data-qa` | Data QA gate with 16 numbered checks, GO/NO-GO emit, missingness pattern catalog, and PI sign-off block. Runs between data extraction and modeling |

### Git Workflow

| Skill | Description |
|-------|-------------|
| `ce-clean-gone-branches` | Clean up local branches whose remote tracking branch is gone |
| `ce-commit` | Create a git commit with a value-communicating message |
| `ce-commit-push-pr` | Commit, push, and open a PR with an adaptive description |
| `ce-worktree` | Manage Git worktrees for parallel development |

### Review & Quality

| Skill | Description |
|-------|-------------|
| `ce-doc-review` | Review documents using parallel persona agents for role-specific feedback |

### Literature & Evidence

| Skill | Description |
|-------|-------------|
| `/ce-literature-search` | Search and download scientific papers via Google Scholar, Crossref, and SciHub using PyPaperBot. Supports PICO/PECO queries, DOI lookup, and structured literature summaries. |

### IDE & Deployment

| Skill | Description |
|-------|-------------|
| `/ce-mcp-server` | Register the ce-datascience MCP server for IDE-agnostic access from Cursor, Windsurf, VS Code+Cline, and other MCP-compatible environments |

### Workflow Utilities

| Skill | Description |
|-------|-------------|
| `/ce-sessions` | Ask questions about session history across Claude Code, Codex, and Cursor |
| `/ce-setup` | Configure stack profile, diagnose environment, and bootstrap project config |
| `/ce-update` | Check plugin version and fix stale cache (Claude Code only) |

## Scripts

Plain shell utilities for things that don't need a skill:

| Script | Purpose |
|--------|---------|
| `scripts/freeze-submission.sh <tag>` | Tag the current commit as a submission freeze. Refuses on a dirty tree; writes `submissions/<tag>/manifest.yaml` with commit sha, SAP version, locked-wave hash, and env-lock-file hashes. Does not push the tag and does not copy data. |

## Agents

Agents are specialized subagents invoked by skills.

### Statistical Review

| Agent | Description |
|-------|-------------|
| `ce-methods-reviewer` | Statistical test selection and assumption verification |
| `ce-multiplicity-reviewer` | Multiple comparisons, p-hacking, and selective reporting |
| `ce-reproducibility-reviewer` | Seeds, package versions, paths, and environment specs |
| `ce-reporting-checklist-reviewer` | Reporting guideline compliance across 16 guidelines — auto-routes by study type, layers AI extensions, writes append-only compliance report (opt-in) |
| `ce-sap-drift-detector` | Structural and semantic drift between SAP and analysis code; also flags blinding-state violations, missing amendment log entries, primary-endpoint changes after data lock, and code drift after amendments |
| `ce-data-mapping-reviewer` | Codebook / SAP / extract column-mapping correctness — name drift, unit mismatches, level-set drift, derived-variable formulae, PHI in codebook |
| `ce-phi-leak-reviewer` | HIPAA Safe Harbor identifier scan across data files, codebooks, notebooks, manuscripts, figure captions, and rendered output |
| `ce-targets-pipeline-reviewer` | targets pipeline correctness (hidden file deps, format hints, branching drift, seed leaks). **Opt-in** via `reviewers:` in `.ce-datascience/config.local.yaml` |
| `ce-quarto-render-reviewer` | Quarto / RMarkdown render-time correctness (committed output, cache traps, params drift, bibliography paths, accessibility). **Opt-in** via `reviewers:` in `.ce-datascience/config.local.yaml` |
| `ce-r-code-reviewer` | R code quality — tidyverse, dplyr, ggplot2, data.table patterns |
| `ce-r-pipeline-reviewer` | R analysis pipeline correctness — dplyr logic errors, ggplot2 accessibility, survival analysis, mixed model convergence |
| `ce-python-ds-reviewer` | Python DS quality — pandas, vectorization, sklearn, data leakage |
| `ce-kieran-python-reviewer` | General Python code review with strict conventions |

### Code Quality Review

| Agent | Description |
|-------|-------------|
| `ce-correctness-reviewer` | Logic errors, edge cases, state bugs |
| `ce-maintainability-reviewer` | Coupling, complexity, naming, dead code |
| `ce-performance-oracle` | Performance analysis and optimization |
| `ce-performance-reviewer` | Runtime performance with confidence calibration |
| `ce-testing-reviewer` | Test coverage gaps, weak assertions |
| `ce-project-standards-reviewer` | AGENTS.md compliance |
| `ce-adversarial-reviewer` | Construct failure scenarios to break implementations |
| `ce-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `ce-reliability-reviewer` | Production reliability and failure modes |
| `ce-security-reviewer` | Security vulnerabilities with confidence calibration |
| `ce-security-sentinel` | Security audits and vulnerability assessments |
| `ce-previous-comments-reviewer` | Check whether prior review feedback has been addressed |

### Document Review

| Agent | Description |
|-------|-------------|
| `ce-coherence-reviewer` | Review documents for internal consistency and terminology drift |
| `ce-feasibility-reviewer` | Evaluate whether proposed approaches will survive contact with reality |
| `ce-product-lens-reviewer` | Challenge problem framing, evaluate scope decisions |
| `ce-scope-guardian-reviewer` | Challenge unjustified complexity and scope creep |
| `ce-security-lens-reviewer` | Evaluate plans for security gaps (auth, data, APIs) |
| `ce-adversarial-document-reviewer` | Challenge premises and stress-test decisions |
| `ce-design-lens-reviewer` | Review plans for missing design decisions |

### Research

| Agent | Description |
|-------|-------------|
| `ce-best-practices-researcher` | Gather external best practices and examples |
| `ce-framework-docs-researcher` | Research framework documentation and best practices |
| `ce-git-history-analyzer` | Analyze git history and code evolution |
| `ce-issue-intelligence-analyst` | Analyze GitHub issues for recurring themes |
| `ce-learnings-researcher` | Search institutional learnings for relevant past solutions |
| `ce-repo-research-analyst` | Research repository structure and conventions |
| `ce-session-historian` | Search prior sessions for related investigation context |
| `ce-slack-researcher` | Search Slack for organizational context |
| `ce-web-researcher` | Iterative web research for prior art and best practices |

### Workflow

| Agent | Description |
|-------|-------------|
| `ce-architecture-strategist` | Analyze architectural decisions and compliance |
| `ce-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `ce-pr-comment-resolver` | Address PR comments and implement fixes |
| `ce-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

## License

MIT
