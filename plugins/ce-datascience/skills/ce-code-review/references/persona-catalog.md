# Persona Catalog

17 reviewer personas organized into always-on, statistical conditional, language-specific conditional, and cross-cutting conditional layers, plus 1 CE always-on agent. The orchestrator uses this catalog to select which reviewers to spawn for each review.

## Always-on (4 personas + 1 CE agent)

Spawned on every review regardless of diff content.

**Persona agents (structured JSON output):**

| Persona | Agent | Focus |
|---------|-------|-------|
| `correctness` | `ce-correctness-reviewer` | Logic errors, edge cases, state bugs, error propagation, intent compliance |
| `testing` | `ce-testing-reviewer` | Coverage gaps, weak assertions, brittle tests, missing edge case tests |
| `maintainability` | `ce-maintainability-reviewer` | Coupling, complexity, naming, dead code, premature abstraction |
| `project-standards` | `ce-project-standards-reviewer` | AGENTS.md compliance -- frontmatter, references, naming, portability |

**CE agent (unstructured output, synthesized separately):**

| Agent | Focus |
|-------|-------|
| `ce-learnings-researcher` | Search docs/solutions/ for past issues related to this PR's modules and patterns |

## Statistical Conditional (dispatched based on analysis content)

| Persona | Agent | Select when diff touches... |
|---------|-------|---------------------------|
| `methods` | `ce-methods-reviewer` | Files containing statistical tests, regression models, hypothesis testing, or inferential analysis code |
| `multiplicity` | `ce-multiplicity-reviewer` | Code with multiple endpoints, multiple comparisons, subgroup analyses, or repeated testing patterns |
| `reproducibility` | `ce-reproducibility-reviewer` | Analysis scripts, notebooks, or pipeline code (checks seeds, versions, paths, environment specs) |
| `reporting-checklist` | `ce-reporting-checklist-reviewer` | **Opt-in only.** Dispatched when `reporting_checklist: true` in config AND a SAP or study protocol exists. Auto-routes to the correct guideline(s) from the full set: CONSORT, STROBE, PRISMA, STARD, CARE, COREQ, ARRIVE, CHEERS, plus AI extensions (REFORMS, TRIPOD+AI, CLAIM, SPIRIT-AI, CONSORT-AI, DEAL, CHART, PDSQI-9) when `ai_involvement` is set |
| `sap-drift` | `ce-sap-drift-detector` | SAP file (`**/sap.md` or markdown with `sap_version` frontmatter) exists in the project |

## Language-Specific Conditional

| Persona | Agent | Select when diff touches... |
|---------|-------|---------------------------|
| `r-code` | `ce-r-code-reviewer` | `.R`, `.Rmd`, `.qmd` files, or R code chunks in polyglot documents |
| `r-pipeline` | `ce-r-pipeline-reviewer` | `.R`, `.Rmd`, `.qmd` files with dplyr group_by logic, ggplot2 visualizations, survival analysis (`survival::`, `survminer::`), mixed models (`lme4::`, `glmmTMB::`), or targets pipeline code (`_targets.R`) |
| `python-ds` | `ce-python-ds-reviewer` | `.py` files with data science imports (pandas, numpy, scipy, sklearn, statsmodels, matplotlib, seaborn) |
| `kieran-python` | `ce-kieran-python-reviewer` | Python modules, endpoints, services, scripts, or typed domain code (general Python quality alongside DS-specific review) |

## Cross-Cutting Conditional

| Persona | Agent | Select when diff touches... |
|---------|-------|---------------------------|
| `security` | `ce-security-reviewer` | Auth, public endpoints, user input handling, permission checks, secrets management |
| `performance` | `ce-performance-reviewer` | Database queries, loop-heavy data transforms, caching layers, async code, large data operations |
| `reliability` | `ce-reliability-reviewer` | Error handling, retry logic, timeouts, background jobs, async handlers |
| `adversarial` | `ce-adversarial-reviewer` | Diff has >=50 changed non-test/non-generated lines, or touches data mutations, external APIs, or other high-risk domains |
| `previous-comments` | `ce-previous-comments-reviewer` | **PR-only.** Reviewing a PR that has existing review comments or threads |

## Selection rules

1. **Always spawn all 4 always-on personas** plus the 1 CE always-on agent.
2. **For each statistical conditional**, check whether the diff contains relevant statistical content. This is judgment, not keyword matching.
3. **For each language-specific conditional**, use file extensions and import patterns as starting signals, then decide whether meaningful work exists for that reviewer.
4. **For each cross-cutting conditional**, apply the same judgment-based selection as always.
5. **Reporting checklist is opt-in** -- never dispatch unless explicitly enabled in config or requested by the user.
6. **SAP-drift detector** dispatches automatically whenever a SAP file exists in the project.
7. **Announce the team** before spawning with a one-line justification per conditional reviewer selected.
