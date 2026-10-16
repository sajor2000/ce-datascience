# Stage 4: Dispatch Reviewers

Apply the SKILL.md PHI Safety Boundary reviewer-access rules to every prompt built here.

## Model tiering

Four reviewers inherit the session model with no override: `method-correctness-reviewer`, `method-security-reviewer`, `method-adversarial-reviewer`, and `method-phi-leak-reviewer`. These perform the highest-stakes analysis or must remain on the authorized active endpoint. If the user is on Opus, these get Opus.

All other persona sub-agents and Methodsmith agents use the platform's mid-tier model to reduce cost and latency. In Claude Code, pass `model: "sonnet"` in the Agent tool call. On other platforms, use that platform's current mid-tier model (in Codex, its smaller "mini"-class model). If the platform has no model override mechanism or the available model names are unknown, omit the model parameter and let agents inherit the default -- a working review on the parent model is better than a broken dispatch from an unrecognized model name.

The orchestrator (this skill) also inherits the session model; it handles intent discovery, reviewer selection, finding merge/dedup, and synthesis -- tasks that benefit from the same reasoning capability the user configured.

## Run ID

Generate a unique run identifier before dispatching any agents. This ID scopes all agent artifact files and the post-review run artifact to the same directory.

```bash
RUN_ID=$(date +%Y%m%d-%H%M%S)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')
mkdir -p "/tmp/methodsmith/method-review/$RUN_ID"
```

Pass `{run_id}` to every persona sub-agent so they can write their full analysis to `/tmp/methodsmith/method-review/{run_id}/{reviewer_name}.json`.

**Report-only mode:** Skip run-id generation and directory creation. Do not pass `{run_id}` to agents. Agents return compact JSON only with no file write, consistent with report-only's no-write contract.

## Spawning

Omit the `mode` parameter when dispatching sub-agents so the user's configured permission settings apply. Do not pass `mode: "auto"`.

Spawn each selected persona reviewer as a parallel sub-agent by filling the slots in `references/subagent-template.md` (sources listed in `references/subagent-template-variables.md`; `{persona_file}`, `{diff_scope_rules}` from `references/diff-scope.md`, `{schema}` from `references/findings-schema.json`). Each persona sub-agent receives:

1. Their persona file content (identity, failure modes, calibration, suppress conditions)
2. Shared diff-scope rules from `references/diff-scope.md`
3. The JSON output contract from `references/findings-schema.json`
4. PR metadata: title and body plus URL when reviewing a PR (empty string otherwise), in a `<pr-context>` block so reviewers can verify code against stated intent. With `PHI authorization: not confirmed`, pass PHI-free PR metadata only (sanitized title and body).
5. Reviewer-specific context: intent summary, safely described file list, and the diff. With `PHI authorization: not confirmed`, pass a PHI-free diff for every general reviewer and metadata only to `method-phi-leak-reviewer`. With confirmed authorization there is no content limit: `method-phi-leak-reviewer` may also receive a separate minimum-necessary patient-level context, and any reviewer that reads patient-level content inherits the session model with no model override.
6. Run ID and reviewer name for the artifact file path
7. **For `project-standards` only:** the criteria mapping from Stage 3b, pairing each standards file with the changed files it governs, wrapped in a `<standards-paths>` block appended to the review context
8. **For `phi-leak` only:** the PHI authorization marker resolved in Stage 1 and its separately scoped minimum-necessary or metadata-only context

Persona sub-agents are **read-only** with respect to the project: they review and return structured JSON. They do not edit project files. The one permitted write is saving their full analysis to the run-artifact path specified in the output contract (under `/tmp/methodsmith/method-review/<run-id>/`).

Read-only here means **non-mutating**, not unrestricted checkout access: every reviewer prompt carries the SKILL.md reviewer-access rules. No reviewer may edit project files, change branches, commit, push, create PRs, or otherwise mutate the checkout or repository state.

Each persona sub-agent writes full JSON (all schema fields) to `/tmp/methodsmith/method-review/{run_id}/{reviewer_name}.json` and returns compact JSON with merge-tier fields only:

```json
{
  "reviewer": "correctness",
  "findings": [
    {
      "title": "Left join on encounter_id duplicates patients with multiple encounters",
      "severity": "P1",
      "file": "analysis/02_cohort.R",
      "line": 42,
      "confidence": 100,
      "autofix_class": "gated_auto",
      "owner": "downstream-resolver",
      "requires_verification": true,
      "pre_existing": false,
      "suggested_fix": "Join on patient_id after selecting the index encounter; assert one row per patient"
    }
  ],
  "residual_risks": [],
  "testing_gaps": []
}
```

Detail-tier fields (`why_it_matters`, `evidence`) are in the artifact file only. `suggested_fix` is optional in both tiers -- included in compact returns when present so the orchestrator has fix context for auto-apply decisions. If the file write fails, the compact return still provides everything the merge needs.

**Methodsmith always-on agent** (method-learnings-researcher) is dispatched as a standard Agent call in parallel with the persona agents. Give it the same PHI-free review context bundle the general personas receive: entry mode, sanitized PR metadata gathered in Stage 1, intent summary, review base branch name when known, `BASE:` marker, safely described file list, PHI-free diff, and `UNTRACKED:` scope notes. Do not invoke it with a generic "review this" prompt. Its output is unstructured and synthesized separately in Stage 6.
