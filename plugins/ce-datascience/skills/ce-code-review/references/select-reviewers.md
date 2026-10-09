# Stage 3: Select Reviewers

## Stage 3: Choose the roster

Read the diff and file list from Stage 1. The 4 always-on personas and 1 CE always-on agent are automatic. For each statistical, language-specific, and cross-cutting conditional persona in the SKILL.md Reviewers table and `references/persona-catalog.md`, decide whether the diff warrants it. This is agent judgment, not keyword matching. Apply the SKILL.md blinding-state exclusions before finalizing the roster.

**File-type awareness for conditional selection:** Instruction-prose files (Markdown skill definitions, JSON schemas, config files) are product code but do not benefit from runtime-focused reviewers. The adversarial reviewer's techniques (race conditions, cascade failures, abuse cases) target executable code behavior. For diffs that only change instruction-prose files, skip adversarial unless the prose describes auth, payment, or data-mutation behavior. Count only executable code lines toward line-count thresholds.

**`previous-comments` is PR-only.** Only select this persona when Stage 1 gathered PR metadata (PR number or URL was provided as an argument, or `gh pr view` returned metadata for the current branch). Skip it entirely for standalone branch reviews with no associated PR -- there are no prior comments to check.

Language-specific personas are additive. A Python analysis script may warrant `kieran-python` plus `python-ds`; an R notebook with statistical tests may warrant `r-code` plus `r-pipeline`, `methods` and `reproducibility`.

Announce the team before spawning:

```
Review team:
- correctness (always)
- testing (always)
- maintainability (always)
- project-standards (always)
- ce-learnings-researcher (always)
- methods -- logistic regression model with hypothesis testing in analysis.py
- reproducibility -- analysis notebook without seed or environment spec
- python-ds -- pandas and sklearn imports with manual transform steps
- kieran-python -- new Python module with public functions
- performance -- large data join operation in preprocessing pipeline
```

This is progress reporting, not a blocking confirmation.

## Stage 3b: Discover project standards paths

Before spawning sub-agents, map each relevant criteria file to the changed files it governs. Search the tree under review for `CODING_STANDARDS.md`, `AGENTS.md`, and `CLAUDE.md`, then keep files whose directory is an ancestor of a changed path.

Apply path-scoped `AGENTS.md` and `CLAUDE.md` instructions wherever they govern; they remain binding repository guidance. Add any governing `CODING_STANDARDS.md` as designated code criteria and deduplicate equivalent rules during synthesis. In remote scope, enumerate and read criteria from the reviewed head rather than the current checkout. Treat a failed or uncertain search as uncertainty, never as an empty result.

Pass the resulting criteria-to-changed-files mapping to the `project-standards` persona inside a `<standards-paths>` block (see Stage 4). In local scope, the persona reads the mapped paths. In remote scope, include the criteria content read from the reviewed head because local paths may name a different revision.

## Stage 3c: Apply the fail-closed lite-roster gate

`depth:full` always keeps the complete CE roster. With `depth:auto`, use the lite roster only when all of the following are known from the Stage 1 diff: 1-39 executable changed lines, no untracked or uncounted paths, no changed tests/configuration/instructions, no auth, privacy, PHI, data mutation, external API, credentials, serialization, concurrency, filesystem, or process-execution signal, and no conditional reviewer beyond project standards. Any uncertainty uses the complete roster.

The lite roster is `ce-correctness-reviewer` plus `ce-project-standards-reviewer` when Stage 3b found an applicable standards file. Record the selected roster and the reason in Coverage. This optimization never applies to analytical code, notebooks, statistical methods, or reporting artifacts: those retain CE's methods, reproducibility, multiplicity, and stack-specific review paths regardless of size.
