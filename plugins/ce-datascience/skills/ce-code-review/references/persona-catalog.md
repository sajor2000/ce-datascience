# Persona Catalog

The `ce-code-review` skill uses this catalog to dispatch reviewers. The skill's own SKILL.md table is the authoritative source for spawn conditions; this file describes what each reviewer focuses on.

## Always-on (every review)

| Agent | Focus |
|-------|-------|
| `ce-correctness-reviewer` | Logic errors, edge cases, state bugs, error propagation, intent compliance |
| `ce-testing-reviewer` | Coverage gaps, weak assertions, brittle tests, missing edge case tests |
| `ce-maintainability-reviewer` | Coupling, complexity, naming, dead code, premature abstraction |
| `ce-project-standards-reviewer` | AGENTS.md compliance — frontmatter, references, naming, portability |
| `ce-learnings-researcher` | Search docs/solutions/ for past issues related to this PR (unstructured output) |

## Conditional — spawn when the diff hits the trigger

| Agent | Spawn when... |
|-------|---------------|
| `ce-r-code-reviewer` | `.R` / `.Rmd` / `.qmd` files in diff |
| `ce-r-pipeline-reviewer` | `.R` / `.Rmd` / `.qmd` files in diff |
| `ce-python-ds-reviewer` | `.py` / `.ipynb` files with DS imports (pandas, numpy, scipy, sklearn, statsmodels) in diff |
| `ce-kieran-python-reviewer` | `.py` files in diff |
| `ce-methods-reviewer` | inferential analysis or model-fitting code in diff (regression, hypothesis tests, survival) |
| `ce-multiplicity-reviewer` | multiple comparisons, subgroup, or repeated-testing code in diff |
| `ce-reproducibility-reviewer` | analysis scripts, notebooks, or env lock files in diff |
| `ce-sap-drift-detector` | `analysis/sap.md` (or any markdown with `sap_version` frontmatter) exists in project |
| `ce-data-mapping-reviewer` | codebook, SAP variable list, or `analysis/sap-tables/03-variables.csv` in diff |
| `ce-phi-leak-reviewer` | data files, codebooks, notebooks, manuscripts, figure files in diff, OR `stack_profile.data_root` is inside the repo |
| `ce-targets-pipeline-reviewer` | `_targets.R`, `_targets.yaml`, or `tar_target(` in diff |
| `ce-quarto-render-reviewer` | `.qmd`, `_quarto.yml`, `_publish.yml`, or `_book/` / `_site/` in diff |
| `ce-reporting-checklist-reviewer` | `reporting_checklist: true` in stack profile AND a SAP exists. Auto-routes to the correct guideline(s) from the full set: CONSORT, STROBE, PRISMA, STARD, CARE, COREQ, ARRIVE, CHEERS, plus AI extensions (REFORMS, TRIPOD+AI, CLAIM, SPIRIT-AI, CONSORT-AI, DEAL, CHART, PDSQI-9) when `ai_involvement` is set |
| `ce-security-reviewer` | auth, public endpoints, user input, permissions in diff |
| `ce-performance-reviewer` | DB queries, loop-heavy transforms, caching, async, large-data operations in diff |
| `ce-reliability-reviewer` | error handling, retries, timeouts, background jobs in diff |
| `ce-adversarial-reviewer` | >=50 changed non-test/non-generated lines, OR data mutations, external APIs, high-risk domains |
| `ce-previous-comments-reviewer` | reviewing a PR with existing review comments |

## Selection notes

- Always spawn the always-on set.
- For each conditional, check the trigger; spawn when it matches. The reviewer's own frontmatter `description:` reinforces the trigger so the dispatch stays consistent.
- Announce the team before spawning with a one-line justification per conditional reviewer selected.
