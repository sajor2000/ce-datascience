---
name: ce-code-review
description: "Review code changes with ce-datascience reviewer personas and confidence-gated findings. Use mode:agent for a read-only JSON handoff to workflow callers. Use when the user asks for code review, PR review, review before merge, or fixable findings on current changes."
argument-hint: "[mode:agent] [blank to review current branch, or provide PR link]"
---

# Code Review


## Skill Value

- **Problem it solves:** Data science code review needs correctness, testing, reproducibility, SAP drift, PHI, methods, and platform checks in one pass.
- **Use when:** The user asks for code review, PR review, review before merge, or fixable findings on current changes.
- **Output:** Prioritized P0-P3 findings, applied safe fixes when allowed, residual work, and verification summary.
- **Ask only if:** Only in interactive mode when a routing decision materially changes whether to apply, defer, file, or ignore findings.
- **Do not do:** Do not invent findings without evidence, mutate in report-only mode, or merge/push without explicit workflow routing.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Reviews code changes using dynamically selected reviewer personas. Spawns parallel sub-agents that return structured JSON, then merges and deduplicates findings into a single report.

## When to Use

- Before creating a PR
- After completing a task during iterative implementation
- When feedback is needed on any code changes
- Can be invoked standalone
- Can run as a read-only or autofix review step inside larger workflows

## Argument Parsing

Parse `$ARGUMENTS` for the following optional tokens. Strip each recognized token before interpreting the remainder as the PR number, GitHub URL, or branch name.

| Token | Example | Effect |
|-------|---------|--------|
| `mode:agent` | `mode:agent` | Current CE programmatic contract: strictly read-only and return one raw JSON object plus `review.json` in the run artifact directory |
| `mode:autofix` | `mode:autofix` | Select autofix mode (see Mode Detection below) |
| `mode:report-only` | `mode:report-only` | Select report-only mode |
| `mode:headless` | `mode:headless` | Select headless mode for programmatic callers (see Mode Detection below) |
| `mode:non-interactive` | `mode:non-interactive` | Preferred alias for `mode:headless`; normalize before conflict checks |
| `depth:auto` | `depth:auto` | Default risk-aware roster selection; trivial low-risk code-only diffs may use the lite roster |
| `depth:full` | `depth:full` | Force the complete reviewer roster; never use the lite roster |
| `base:<sha-or-ref>` | `base:abc1234` or `base:origin/main` | Skip scope detection — use this as the diff base directly |
| `plan:<path>` | `plan:docs/plans/2026-03-25-001-feat-foo-plan.md` | Load this plan for requirements verification |
All tokens are optional. Each one present means one less thing to infer. Treat `mode:non-interactive` as `mode:headless`; both aliases together name one mode, not a conflict. `depth:auto` is the default and conflicts only with `depth:full`. When absent, fall back to existing behavior for that stage.

## Blinding-state awareness

Resolve the repository root before reading config:
!`git rev-parse --show-toplevel 2>/dev/null || true`

Use the resolved absolute path or resolve it at runtime, then read `<repo-root>/.ce-datascience/config.local.yaml` with the native file-read tool; in a linked worktree, fall back to the main checkout when needed. Read `stack_profile.blinding_state`. When it is `blinded`, the diff is treated as blinded EDA: do not spawn `ce-methods-reviewer` or `ce-multiplicity-reviewer`, and emit a P0 block finding titled "Inferential code on assignment variable during blinded EDA" if the diff contains regression / hypothesis-test / survival / chi-square code that references the assignment / treatment / arm variable. When the field is `unblinded` or `n/a` (or absent), proceed normally. No flag for the user to type.

**Conflicting mode flags:** If multiple distinct mode tokens appear in arguments, stop and do not dispatch agents. In `mode:agent`, emit `{"status":"failed","reason":"conflicting mode flags"}`. If `mode:headless` is one of the conflicting tokens, emit the headless error envelope: `Review failed (headless mode). Reason: conflicting mode flags — <mode_a> and <mode_b> cannot be combined.` Otherwise emit the generic form: `Review failed. Reason: conflicting mode flags — <mode_a> and <mode_b> cannot be combined.`

## Quick Review Short-Circuit

If `$ARGUMENTS` indicates the user wants a quick, fast, or light code review, do not dispatch the multi-agent flow.

**Announce the chosen path** before any other work (Quick review vs Multi-agent review).

Programmatic callers (`mode:agent`, `mode:autofix`, `mode:report-only`, or `mode:headless`) skip this announcement and bypass the short-circuit -- the orchestrator owns user-facing messaging.

Sequence:

1. **Run the harness's built-in code review.** If `$ARGUMENTS` contained a review target (PR number, GitHub URL, or branch name) after stripping recognized tokens, forward that target to the built-in. If no target was provided, run the bare command and let the built-in default to the current branch.
   - If you are Claude Code, run the `/review` tool, passing the target if present (for example, `/review 123`, `/review <PR-URL>`, `/review <branch>`); otherwise run bare `/review`.
   - If you are Gemini, run a quick code review against the resolved target, or the current branch when none was provided.
   - For all other coding harnesses, run the built-in code review tool when one exists, forwarding the target when its syntax accepts one.
2. **Exemption -- no built-in code review exists.** If the current harness has no built-in code review command or skill, do not short-circuit. Continue into the full multi-agent review described in the rest of this skill.
3. **Programmatic callers bypass this short-circuit.** Skill-to-skill callers that want a lightweight pass should invoke `/review` or the harness equivalent directly rather than route through this skill.

## Mode Detection

| Mode | When | Behavior |
|------|------|----------|
| **Interactive** (default) | No mode token present | Review, apply safe_auto fixes automatically, present findings, ask for policy decisions on gated/manual findings, and optionally continue into fix/push/PR next steps |
| **Agent** | `mode:agent` in arguments | Current CE machine handoff: no questions or mutations; return one raw JSON object and write the same payload to `review.json` in the run artifact directory |
| **Autofix** | `mode:autofix` in arguments | No user interaction. Review, apply only policy-allowed `safe_auto` fixes, re-review in bounded rounds, write a run artifact capturing residual downstream work |
| **Report-only** | `mode:report-only` in arguments | Strictly read-only. Review and report only, then stop with no edits, artifacts, commits, pushes, or PR actions |
| **Headless** | `mode:headless` in arguments | Programmatic mode for skill-to-skill invocation. Apply `safe_auto` fixes silently (single pass), return all other findings as structured text output, write run artifacts, and return "Review complete" signal. No interactive prompts. |

### Agent mode rules

- **Strictly read-only.** Do not edit, apply fixes, commit, push, create pull requests, file tickets, or switch the checkout. The caller owns all mutation.
- **No blocking questions.** Infer scope and intent from arguments, Git metadata, the diff, and caller context; record uncertainty in the payload.
- **One parseable response.** Emit exactly one raw JSON object with no markdown fence or trailing prose, and write the same payload to `/tmp/ce-datascience/ce-code-review/<run-id>/review.json`.
- **Full pipeline.** Bypass quick-review short circuits and use the normal reviewer selection, merge, confidence gating, and requirements checks.
- **Failures are JSON.** Use `status: failed`, `degraded`, or `skipped` with a one-sentence `reason` when the review cannot complete normally.

### Autofix mode rules

- **Skip all user questions.** Never pause for approval or clarification once scope has been established.
- **Apply only `safe_auto -> review-fixer` findings.** Leave `gated_auto`, `manual`, `human`, and `release` work unresolved.
- **Write a run artifact** under `/tmp/ce-datascience/ce-code-review/<run-id>/` summarizing findings, applied fixes, residual actionable work, and advisory outputs. Orchestrators read this artifact to route residual `downstream-resolver` findings; the skill itself does not file tickets or prompt the user in autofix.
- **Emit a compact Residual Actionable Work summary in the autofix return** listing each residual `downstream-resolver` finding with its stable `#`, severity, file:line, title, and autofix_class. Structure the summary as two separate contiguous sections: applied `safe_auto` fixes first, then residual non-auto findings. Within the residual section, reuse each finding's stable `#` from Stage 5 -- never renumber. Include the run-artifact path. Callers read this summary directly without parsing the artifact. When no residuals exist, state `Residual actionable work: none.` explicitly.
- **Never commit, push, or create a PR** from autofix mode. Parent workflows own those decisions.

### Report-only mode rules

- **Skip all user questions.** Infer intent conservatively if the diff metadata is thin.
- **Never edit files or externalize work.** Do not write `/tmp/ce-datascience/ce-code-review/<run-id>/`, do not file tickets, and do not commit, push, or create a PR.
- **Safe for parallel read-only verification.** `mode:report-only` is the only mode that is safe to run concurrently with browser testing on the same checkout.
- **Do not switch the shared checkout.** If the caller passes an explicit PR or branch target, `mode:report-only` must run in an isolated checkout/worktree or stop instead of running `gh pr checkout` / `git checkout`.
- **Do not overlap mutating review with browser testing on the same checkout.** If a future orchestrator wants fixes, run the mutating review phase after browser testing or in an isolated checkout/worktree.

### Headless mode rules

- **Skip all user questions.** Never pause for approval or clarification. Infer intent conservatively from the available branch, PR, diff, and caller context.
- **Require a determinable diff scope.** If headless mode cannot determine a diff scope (no branch, PR, or `base:` ref determinable without user interaction), emit `Review failed (headless mode). Reason: no diff scope detected. Re-invoke with a branch name, PR number, or base:<ref>.` and stop without dispatching agents.
- **Apply only `safe_auto -> review-fixer` findings in a single pass.** No bounded re-review rounds. Leave `gated_auto`, `manual`, `human`, and `release` work unresolved and return them in the structured output.
- **Return all non-auto findings as structured text output.** Use the headless output envelope format (`references/synthesis-and-output.md`) preserving severity, autofix_class, owner, requires_verification, confidence, pre_existing, and suggested_fix per finding. Enrich with detail-tier fields (why_it_matters, evidence[]) from the per-agent artifact files on disk (Detail enrichment in that reference).
- **Write a run artifact** under `/tmp/ce-datascience/ce-code-review/<run-id>/` summarizing findings, applied fixes, and advisory outputs. Include the artifact path in the structured output.
- **Do not file tickets or externalize work.** The caller receives structured findings and routes downstream work itself.
- **Do not switch the shared checkout.** If the caller passes an explicit PR or branch target, `mode:headless` must run in an isolated checkout/worktree or stop instead of running `gh pr checkout` / `git checkout`. When stopping, emit `Review failed (headless mode). Reason: cannot switch shared checkout. Re-invoke with base:<ref> to review the current checkout, or run from an isolated worktree.`
- **Not safe for concurrent use on a shared checkout.** Unlike `mode:report-only`, headless mutates files (applies `safe_auto` fixes). Callers must not run headless concurrently with other mutating operations on the same checkout.
- **Never commit, push, or create a PR** from headless mode. The caller owns those decisions.
- **End with "Review complete" as the terminal signal** so callers can detect completion. If all reviewers fail or time out, emit `Code review degraded (headless mode). Reason: 0 of N reviewers returned results.` followed by "Review complete".

### Interactive mode rules

- **Question handling.** Follow the Skill Value interaction rule above for every routing or policy question. Ask once at each decision point and wait for the answer before proceeding.

## Severity Scale

All reviewers use P0-P3:

| Level | Meaning | Action |
|-------|---------|--------|
| **P0** | Critical breakage, exploitable vulnerability, data loss/corruption | Must fix before merge |
| **P1** | High-impact defect likely hit in normal usage, breaking contract | Should fix |
| **P2** | Moderate issue with meaningful downside (edge case, perf regression, maintainability trap) | Fix if straightforward |
| **P3** | Low-impact, narrow scope, minor improvement | User's discretion |

## Action Routing

Severity answers **urgency**. Routing answers **who acts next** and **whether this skill may mutate the checkout**.

| `autofix_class` | Default owner | Meaning |
|-----------------|---------------|---------|
| `safe_auto` | `review-fixer` | Local, deterministic fix suitable for the in-skill fixer when the current mode allows mutation |
| `gated_auto` | `downstream-resolver` or `human` | Concrete fix exists, but it changes behavior, contracts, permissions, or another sensitive boundary that should not be auto-applied by default |
| `manual` | `downstream-resolver` or `human` | Actionable work that should be handed off rather than fixed in-skill |
| `advisory` | `human` or `release` | Report-only output such as learnings, rollout notes, or residual risk |

Routing rules:

- **Synthesis owns the final route.** Persona-provided routing metadata is input, not the last word.
- **Choose the more conservative route on disagreement.** A merged finding may move from `safe_auto` to `gated_auto` or `manual`, but never the other way without stronger evidence.
- **Only `safe_auto -> review-fixer` enters the in-skill fixer queue automatically.**
- **`requires_verification: true` means a fix is not complete without targeted tests, a focused re-review, or operational validation.**

## Reviewers

Always-on personas, the CE always-on agent, and layered conditionals. This table is the authoritative spawn list; `references/persona-catalog.md` describes each reviewer's focus.

**Always-on:** `ce-correctness-reviewer`, `ce-testing-reviewer`, `ce-maintainability-reviewer`, `ce-project-standards-reviewer`, `ce-learnings-researcher`. Spawn every review.

**Conditional — spawn when the diff hits the trigger:**

| Agent | Spawn when... |
|-------|---------------|
| `ce-r-code-reviewer` | `.R` / `.Rmd` / `.qmd` files in diff |
| `ce-r-pipeline-reviewer` | `.R` / `.Rmd` / `.qmd` files in diff |
| `ce-python-ds-reviewer` | `.py` / `.ipynb` files with DS imports (pandas, numpy, scipy, sklearn, statsmodels) in diff |
| `ce-kieran-python-reviewer` | `.py` files in diff |
| `ce-methods-reviewer` | inferential/model-fitting code, or `analysis/model-strategy/*-model-strategy.md` / its `.R` or `.py` scaffold in diff |
| `ce-multiplicity-reviewer` | multiple comparisons, subgroup, or repeated-testing code in diff |
| `ce-reproducibility-reviewer` | analysis scripts, notebooks, or env lock files in diff. Pass the resolved skill-local path for `references/study-metadata-schema.md` so the reviewer can check `.ce-datascience/study-metadata.yaml` completeness. |
| `ce-sap-drift-detector` | `analysis/sap.md` (or any markdown with `sap_version` frontmatter) exists in project |
| `ce-data-mapping-reviewer` | codebook, SAP variable list, or `analysis/sap-tables/03-variables.csv` in diff |
| `ce-phi-leak-reviewer` | data files, codebooks, notebooks, manuscripts, or figure files in diff, OR `stack_profile.data_root` is inside the repo |
| `ce-targets-pipeline-reviewer` | `_targets.R`, `_targets.yaml`, or `tar_target(` in diff |
| `ce-quarto-render-reviewer` | `.qmd`, `_quarto.yml`, `_publish.yml`, or `_book/` / `_site/` in diff |
| `ce-reporting-checklist-reviewer` | `stack_profile.reporting_checklist` set to a non-null string (e.g., `STROBE`, `TRIPOD+AI`) AND a SAP exists. Pass the value, any `stack_profile.reporting_checklist_extensions`, and the resolved skill-local paths for `references/guideline-registry.yaml`, `references/guideline-routing.md`, and the selected checklist files. |
| `ce-data-leakage-reviewer` | ML training/eval code in diff (sklearn, lightgbm, xgboost, pytorch, tensorflow, keras, lifelines, sksurv, tidymodels) |
| `ce-fairness-reviewer` | prediction-model code in diff AND data has subgroup variables (sex, race, age band, site, payer) |
| `ce-calibration-reviewer` | prediction-model evaluation code in diff that produces predicted probabilities |
| `ce-omop-mapping-reviewer` | OMOP CDM tables, `concept_id` columns, or `analysis/cohort/concept-sets/` in diff |
| CLIF brief for `ce-project-standards-reviewer` | `__CE_CLIF__ active=true` in chat context OR strong CLIF signals (CLIF_CLAUDE.md at root, or a git remote containing clif-icu, clif-consortium, or Common-Longitudinal-ICU-data-Format — NOT mCIDE/ or WORKFLOW.md alone). Extend the always-on standards reviewer's prompt with CLIF protected-path, Parquet-only, timezone, identifier, category, and patient-row rules. Require matching `version=` + `mcide_version=` before judging category values; flag an absent, mixed, or v2.1-cache-on-v3 family as a blocking review finding and route to the `ce-clif` skill. Do not dispatch a nonexistent `ce-clif-reviewer`. |
| `ce-administrative-data-reviewer` | claims / billing / payer / administrative healthcare data in diff (Medicare, Medicaid, MarketScan, Optum, OMOP claims-flavor) |
| `ce-concept-drift-reviewer` | concept sets, ICD/CPT/LOINC/SNOMED code lists in diff AND data spans multiple refresh waves or multiple years |
| `ce-causal-inference-reviewer` | observational analysis with causal aim in diff (IPTW, matching, MSM, g-computation, DR, IV, RDD, DiD, target-trial emulation) |
| `ce-bioinfo-pipeline-reviewer` | Snakefile / `*.smk` / `*.nf` / `nextflow.config` / `*.cwl` / Bioconductor pipelines / sample-sheet driven scripts in diff |
| `ce-omics-batch-reviewer` | omics count / beta matrices in diff AND downstream differential or clustering or ML code |
| `ce-sprint-audit-reviewer` | dispatched by `ce-sprint close` (not by code review directly) |
| `ce-security-reviewer` | auth, public endpoints, user input, permissions in diff |
| `ce-performance-reviewer` | DB queries, loop-heavy data transforms, caching, async, large-data operations in diff |
| `ce-reliability-reviewer` | error handling, retries, timeouts, background jobs in diff |
| `ce-adversarial-reviewer` | >=50 changed non-test/non-generated lines, OR data mutations, external APIs, high-risk domains |
| `ce-previous-comments-reviewer` | reviewing a PR with existing review comments |

## Review Scope

Unless the Stage 3c lite-roster gate applies, every review spawns all 4 always-on personas plus the 1 CE always-on agent, then adds whichever statistical, language-specific, and cross-cutting conditionals fit the diff. The model naturally right-sizes: a small config change triggers 0 conditionals = 5 reviewers. A Python analysis with statistical tests might trigger methods + python-ds + kieran-python + reproducibility = 9 reviewers. An R survival analysis might trigger methods + r-code + r-pipeline + reproducibility = 9 reviewers.

## Protected Artifacts

The following paths are ce-datascience pipeline artifacts and must never be flagged for deletion, removal, or gitignore by any reviewer:

- `docs/brainstorms/*` -- requirements documents created by ce-brainstorm
- `docs/plans/*.md` -- plan files created by ce-plan (decision artifacts; execution progress is derived from git, not stored in plan bodies)
- `docs/solutions/*.md` -- solution documents created during the pipeline
- `analysis/model-strategy/*` -- model decision memos and scaffolds created by ce-model-strategy

If a reviewer flags any file in these directories for cleanup or removal, discard that finding during synthesis.

## PHI Safety Boundary

These rules govern every stage, every sub-agent prompt, and every artifact.

**PHI-safe scope preflight:** Before any command prints a path name, diff body, file content, notebook output, PR title, or PR body, classify the request and repository from already-available context such as the stack profile and CLIF signals. Clinical, health-data, case-report, CLIF, or otherwise uncertain contexts are PHI-risk before path discovery. For a context that is clearly non-clinical, write changed and untracked path names to local temporary files without echoing them, then use a deterministic local check that returns only a risk boolean, counts, and extensions. Treat data files, codebooks, notebooks, manuscripts, figures, clinical notes, imaging, patient/MRN/case-like names, and any unclassified text file in a PHI-risk repository as PHI-risk. Never print a raw basename before this decision because a filename can itself contain an identifier.

When PHI risk is present, reuse any user confirmation already present in the current conversation that both the data environment and active model endpoint are PHI/PII-compliant. In interactive mode, if confirmation is absent or ambiguous, ask that compliance question once using the Skill Value interaction rule and wait. In agent, autofix, report-only, or headless mode, do not ask; unresolved confirmation remains not confirmed. Record exactly `PHI authorization: confirmed` or `PHI authorization: not confirmed`.

- With confirmed authorization, the orchestrator may inspect the PHI-risk content through the active endpoint. Do not place patient-level content in general reviewer prompts or artifacts. Route only the minimum necessary PHI-risk content to `ce-phi-leak-reviewer`, which must inherit the active session model with no model override; give other reviewers code, schemas, metadata, reviewed aggregates, and PHI-free context.
- Without confirmed authorization, do not run a broad content diff or open PHI-risk files. Limit scope to path names, metadata, and files explicitly established as code, schemas, or reviewed aggregates. Report excluded content as a coverage gap rather than treating it as clean.
- Regardless of authorization, never reproduce identifiers in prompts, findings, artifacts, logs, screenshots, or responses.

When no PHI risk is present, continue normally without asking. If local classification cannot establish a clearly non-PHI scope, treat it as PHI-risk.

**Safe display metadata.** After preflight, set `SAFE_BRANCH` and other display metadata to their raw values only when each value is established as PHI-free. Otherwise use an opaque label such as `[redacted-phi-risk-branch]`. All prompts, reports, and persistent run artifacts use the safe values; raw metadata never leaves `$REVIEW_SCOPE_DIR`.

**Reviewer access.** When `ce-phi-leak-reviewer` is selected, pass the PHI authorization marker resolved during Stage 1. A not-confirmed reviewer may inspect paths, code, schemas, metadata, and reviewed aggregates, but not patient-level content. Never pass patient-level content to any other reviewer. General
reviewer sub-agents may inspect only the preflight-approved paths and PHI-free
context supplied by the orchestrator. Their prompts must prohibit broad
checkout-reading commands such as `git diff`, `git show`, `git blame`,
`git log`, and `gh pr view` in PHI-risk reviews. Only
`ce-phi-leak-reviewer`, after `PHI authorization: confirmed`, may receive the
minimum necessary patient-level context or read patient-level paths directly.
With authorization not confirmed, it also remains limited to paths, code,
schemas, metadata, and reviewed aggregates. Stage 5b validators inherit the general-reviewer limits.

## How to Run

Run the stages in order. Each stage names the reference files to read when entering it; read them then, not earlier. Every required file is linked here directly.

### Stage 1: Determine scope

Read `references/scope.md` and follow the path for the invocation (`base:`, PR, branch, or standalone). It sets up the private `$REVIEW_SCOPE_DIR` with an exit trap, captures path names without printing them, and resolves `BASE` (branch and standalone paths run `references/resolve-base.sh`).

- If `mode:agent`, `mode:report-only`, or `mode:headless` is active, do **not** run `gh pr checkout` or `git checkout <branch>` on the shared checkout; emit that mode's stop message from `references/scope.md` unless the review already runs in an isolated checkout.
- Apply the PHI-safe scope preflight above before reading any captured path, title, or body. After the preflight, collect `git diff -U10 $BASE` only for the permitted paths.
- Fail closed: when the base cannot be resolved, stop instead of falling back to `git diff HEAD`.
- In headless mode, a missing diff scope stops the review with the headless "no diff scope detected" error.

### Stage 2: Intent and plan discovery

Read `references/intent-and-plan.md`. Write a 2-3 line intent summary for every reviewer (ask one intent question only in interactive mode; other modes infer conservatively and record uncertainty), then locate a plan for requirements verification and tag it `plan_source: explicit` or `inferred`. A missing plan never blocks the review.

### Stage 3: Select reviewers

Read `references/persona-catalog.md` and `references/select-reviewers.md`. Choose conditionals from the Reviewers table by judgment (Stage 3), map `CODING_STANDARDS.md` / `AGENTS.md` / `CLAUDE.md` criteria to the changed files they govern (Stage 3b), and apply the fail-closed lite-roster gate (Stage 3c), which never applies to analytical code, notebooks, statistical methods, or reporting artifacts. Announce the team with a one-line justification per conditional; this is progress reporting, not a blocking confirmation.

### Stage 4: Spawn sub-agents

Read `references/dispatch-reviewers.md`, `references/subagent-template.md`, `references/diff-scope.md`, and `references/findings-schema.json`. Generate the run ID (skip in report-only mode), apply model tiering, and dispatch every selected reviewer in parallel with the platform's sub-agent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex). Omit the `mode` parameter so the user's permission settings apply. Reviewers are read-only and return compact JSON; the only permitted write is their artifact under `/tmp/ce-datascience/ce-code-review/<run-id>/`.

### Stage 5: Merge findings

Read `references/merge-findings.md` (Stage 5). Validate compact returns, deduplicate by fingerprint, promote cross-reviewer agreement by one anchor step, normalize to the most conservative route, derive recommended actions, demote weak testing/maintainability advisories, then apply the confidence gate: suppress findings below anchor 75 except P0 findings at anchor 50+. Partition into fixer, residual actionable, and report-only queues; discard findings that recommend deleting or gitignoring Protected Artifacts.

### Stage 5b: Validation pass

Run one independent validator per surviving finding (budget: 15) using `references/merge-findings.md` (Stage 5b) and `references/validator-template.md`, only where this table says so:

| Mode | Runs Stage 5b? | Where |
|------|---------------|-------|
| `agent` | Yes, eagerly and read-only | Between Stage 5 and Stage 6 |
| `headless` | Yes, eagerly | Between Stage 5 and Stage 6 |
| `autofix` | Yes, eagerly | Between Stage 5 and Stage 6 |
| `interactive`, walk-through routing (option A) — per-finding phase | No -- the user is the per-finding validator | n/a |
| `interactive`, walk-through routing (option A) — best-judgment-the-rest handoff | No -- the best-judgment path dispatches the fixer immediately; the fixer's apply/fail outcome is the validation | n/a |
| `interactive`, best-judgment routing (option B) | No -- the best-judgment path dispatches the fixer immediately; the fixer's apply/fail outcome is the validation | n/a |
| `interactive`, File-tickets routing (option C) | Yes, on all pending findings | Before tracker dispatch |
| `interactive`, Report-only routing (option D) | No -- nothing is being externalized | n/a |
| `report-only` | No -- read-only mode externalizes nothing | n/a |

### Stage 6: Synthesize and present

Read `references/synthesis-and-output.md` and `references/review-output-template.md`. Interactive, autofix, and report-only modes render pipe-delimited findings tables grouped by severity; headless mode uses the structured text envelope; `mode:agent` emits only the JSON contract below. Include Requirements Completeness only when a plan was found, report Coverage (suppressions, demotions, validator drops, failed reviewers), and end with a verdict. Do not include time estimates.

### JSON output format (`mode:agent` only)

Emit one raw JSON object as the entire response, without a markdown fence or trailing prose. Write the identical payload to `/tmp/ce-datascience/ce-code-review/<run-id>/review.json`.

Minimum shape:

```json
{
  "status": "complete",
  "verdict": "Ready to merge | Ready with fixes | Not ready",
  "scope": {
    "base": "<merge-base sha, pr:NNN marker, or base ref>",
    "branch": "<SAFE_BRANCH>",
    "head_sha": "<git rev-parse HEAD>",
    "pr_url": null,
    "files_changed": 0
  },
  "intent": "<summary>",
  "intent_confidence": "explicit | inferred | uncertain",
  "reviewers": [],
  "findings": [],
  "actionable_findings": [],
  "pre_existing_findings": [],
  "requirements_completeness": null,
  "learnings": [],
  "deployment_notes": [],
  "residual_risks": [],
  "testing_gaps": [],
  "coverage": {},
  "artifact_path": "/tmp/ce-datascience/ce-code-review/<run-id>/",
  "run_id": "<run-id>"
}
```

Each `findings` object carries the merged finding fields including stable `#`, title, severity, file, line, confidence, autofix_class, owner, requires_verification, pre_existing, suggested_fix, why_it_matters, evidence, and reviewers. `actionable_findings` is the `gated_auto` or `manual` subset owned by `downstream-resolver`. Agent mode never includes applied fixes because it never mutates. On failure return `{"status":"failed","reason":"<one sentence>"}`; use `degraded` when all reviewers fail and `skipped` when a review skip rule fires.

## Quality Gates

Before delivering the review, verify:

1. **Every finding is actionable.** Re-read each finding. If it says "consider", "might want to", or "could be improved" without a concrete fix, rewrite it with a specific action. Vague findings waste engineering time.
2. **No false positives from skimming.** For each finding, verify the surrounding code was actually read. Check that the "bug" isn't handled elsewhere in the same function, that the "unused import" isn't used in a type annotation, that the "missing null check" isn't guarded by the caller.
3. **Severity is calibrated.** A style nit is never P0. A SQL injection is never P3. Re-check every severity assignment.
4. **Line numbers are accurate.** Verify each cited line number against the file content. A finding pointing to the wrong line is worse than no finding.
5. **Protected artifacts are respected.** Discard any findings that recommend deleting or gitignoring files in `docs/brainstorms/`, `docs/plans/`, `docs/solutions/`, or `analysis/model-strategy/`.
6. **Findings don't duplicate linter output.** Don't flag things the project's linter/formatter would catch (missing semicolons, wrong indentation). Focus on semantic issues.

## Language-Aware Conditionals

This skill uses language-specific reviewer agents when the diff clearly warrants them. Keep those agents opinionated. They are not generic language checkers; they add a distinct review lens on top of the always-on and cross-cutting personas.

Do not spawn them mechanically from file extensions alone. The trigger is meaningful changed analysis logic, data transformations, or modeling code in that language.

## After Review

Route the next steps by mode. Review and synthesis stay the same in every mode; only mutation and handoff behavior changes.

- **Interactive, autofix, and headless modes:** read `references/post-review.md` and follow Steps 1-5 (action sets, policy by mode, one fixer per checkout, run artifacts with `metadata.json`, final next steps). Interactive routing also uses `references/tracker-defer.md` (tracker pre-detection, option C, and Defer), `references/walkthrough.md` (option A and the unified completion report), and `references/bulk-preview.md` (option C preview); read each when its path is taken.
- **Agent mode:** perform no fixes, tickets, commits, pushes, PRs, or checkout switches. Write `review.json` plus the Step 4 run artifact from `references/post-review.md` (synthesized findings and `metadata.json` with `SAFE_BRANCH`), then emit nothing after the single JSON object.
- **Report-only mode:** stop after Stage 6. Do not write run artifacts.

Never commit, push, or create a PR outside interactive mode's Step 5, and only after fixes were applied in this run.

## Fallback

If the platform doesn't support parallel sub-agents, run reviewers sequentially. Everything else (stages, output format, merge pipeline) stays the same.
