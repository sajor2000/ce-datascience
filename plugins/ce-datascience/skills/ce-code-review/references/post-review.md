# After Review: Fixes, Artifacts, and Next Steps

## Contents

- Step 1: Build the action sets
- Step 2: Choose policy by mode (interactive routing question, then autofix, agent, report-only, and headless mode rules)
- Step 3: Apply fixes with one fixer
- Step 4: Emit artifacts and downstream handoff
- Step 5: Final next steps

After presenting findings and verdict (Stage 6), route the next steps by mode. Review and synthesis stay the same in every mode; only mutation and handoff behavior changes.

## Step 1: Build the action sets

- **Clean review** means zero findings after suppression and pre-existing separation. Skip the fix/handoff phase when the review is clean.
- **Fixer queue:** final findings routed to `safe_auto -> review-fixer`.
- **Residual actionable queue:** unresolved `gated_auto` or `manual` findings whose final owner is `downstream-resolver`.
- **Report-only queue:** `advisory` findings and any outputs owned by `human` or `release`.
- **Never convert advisory-only outputs into fix work or ticket handoff.** Deployment notes, residual risks, and release-owned items stay in the report.
- **Agent-mode hard gate:** when `mode:agent` is active, build `actionable_findings` for the JSON handoff but never build or dispatch a fixer queue.

## Step 2: Choose policy by mode

### Interactive mode rules

- Apply `safe_auto -> review-fixer` findings automatically without asking. These are safe by definition.
- **Zero-remaining case:** if no `gated_auto` or `manual` findings remain after the `safe_auto` pass, skip the routing question entirely. Emit a one-line completion summary phrased so advisory and pre-existing findings (which are not handled by this flow) are not implied to be cleared. When no advisory or pre-existing findings remain in the report, `All findings resolved — N safe_auto fixes applied.` is accurate. When advisory and/or pre-existing findings do remain, use the qualified form `All actionable findings resolved — N safe_auto fixes applied. (K advisory, J pre-existing findings remain in the report.)`, omitting any zero-count clause. Follow the summary with the existing end-of-review verdict, then proceed to Step 5 per the gating rule there.
- **Tracker pre-detection:** before rendering the routing question, consult `references/tracker-defer.md` for the session's tracker tuple `{ tracker_name, confidence, named_sink_available, any_sink_available }`. The probe runs at most once per session and is cached for the rest of the run. `named_sink_available` drives the option C label (inline tracker name only when the named sink can actually be invoked). `any_sink_available` drives whether option C is offered at all (it can still be offered when the named tracker is unreachable but GitHub Issues via `gh` works).
- **Routing question:** Follow the Skill Value interaction rule, then present:

  ```
  (A) Review each finding one by one — accept the recommendation or choose another action
  (B) Auto-resolve with best judgment — apply per-finding fixes the agent can defend, surface the rest
  (C) File a [TRACKER] ticket per finding without applying fixes
  (D) Report only — take no further action
  ```

  Render option C per `references/tracker-defer.md`: when `confidence = high` AND `named_sink_available = true`, replace `[TRACKER]` with the concrete name and keep the full label (e.g., `File a Linear ticket per finding without applying fixes`). When `any_sink_available = true` but either `confidence = low` or `named_sink_available = false` (GitHub Issues via `gh` is working as the fallback), use the generic label `File an issue per finding without applying fixes` — this is a whole-label substitution, not a `[TRACKER]` token swap. When `any_sink_available = false`, **omit option C entirely** and add one line to the stem explaining that no issue tracker is configured for this checkout (Linear, GitHub Issues, etc., were probed and unavailable). Phrase it for a developer audience — avoid `tracker sink` jargon, and avoid `platform` since the missing piece is per-project, not per-agent-platform. The three remaining options (A, B, D) survive.

- **Dispatch on selection.** Route by the option letter (A / B / C / D), not by the rendered label string. The option-C label varies by tracker-detection confidence (`File a [TRACKER] ticket per finding without applying fixes` for a named tracker, `File an issue per finding without applying fixes` as the generic fallback, or omitted entirely when no sink is available — see `references/tracker-defer.md`), and options A / B / D have a single canonical label each. The letter is the stable dispatch signal; the canonical labels below are shown for documentation only. A low-confidence run that rendered option C as the generic label routes to the same branch as a high-confidence run that rendered it with the named tracker.
  - (A) `Review each finding one by one` — load `references/walkthrough.md` and enter the per-finding walk-through loop. The walk-through accumulates Apply decisions in memory; Defer decisions execute inline via `references/tracker-defer.md`; Skip / Acknowledge decisions are recorded as no-action. `Auto-resolve with best judgment on the rest` exits the walk-through loop and dispatches **one** fixer pass on the union of (already-accumulated Apply set ∪ remaining undecided findings) — there is no second end-of-loop dispatch in this branch, so the "one fixer, consistent tree" contract holds. When the user works through every finding without invoking the auto-resolve-the-rest option, dispatch one fixer subagent for the accumulated Apply set at end of loop (Step 3). Emit the unified completion report after dispatch.
  - (B) `Auto-resolve with best judgment — apply per-finding fixes the agent can defend, surface the rest` — dispatch the fixer subagent (Step 3) immediately on the full pending action set (`gated_auto` + `manual` + `advisory`). No Stage 5b validator pre-pass. No bulk-preview approval gate. The fixer applies items with concrete `suggested_fix`, no-ops on advisory items, and routes items where the fix cannot be applied cleanly (or where the cited evidence no longer matches the code) to a `failed` bucket with a one-line reason.

    **After the fixer returns, the order is:**
    1. **If `failed` is empty:** emit the unified completion report and proceed to Step 5 per its gating rule. No question fires.
    2. **If `failed` is non-empty:** fire the post-run failure-handling question *first* — emitting the report before the user resolves the failed bucket would produce a stale or duplicated report, since `File tickets` and `Walk through` both change the final action state. Stem: `N findings could not be auto-resolved. What should the agent do with them?` Three options:
       - `File tickets for these` — route the failed set through `references/tracker-defer.md` Interactive mode. Omit this option when the cached tracker-detection tuple reports `any_sink_available = false`, and append one line to the stem explaining that no issue tracker is configured for this checkout (Linear, GitHub Issues, etc., were probed and unavailable). Phrase it for a developer audience — avoid `tracker sink` jargon, and avoid `platform` since the missing piece is per-project, not per-agent-platform.
       - `Walk through these one at a time` — re-enter the walk-through loop scoped to the failed set. Each finding's recommended action is recomputed via the Stage 5 step 6b mapping: items that have a `suggested_fix` recommend Apply (and join the in-memory Apply set if the user picks Apply, dispatching at end-of-walk-through to a focused fixer pass on those items only); items without a `suggested_fix` recommend Defer (Apply is not offered for them; menu is Defer / Skip / `Auto-resolve with best judgment on the rest`).
       - `Ignore — leave them in the report` — record the failed list as residual actionable work in the report. No further action.

       After the user's choice executes (tickets filed, walk-through completed, or ignore recorded), emit the unified completion report. The report reflects the final state including any tickets filed or additional fixes applied during walk-through re-entry.

  - (C) `File a [TRACKER] ticket per finding without applying fixes` (or the generic `File an issue per finding without applying fixes` when the named-tracker label is not used) — first run Stage 5b validation on every pending finding. Drop validator-rejected findings with their reasons recorded in Coverage. Then load `references/bulk-preview.md` with every surviving finding in the file-tickets bucket. On `Proceed`, route every finding through `references/tracker-defer.md`; no fixes are applied. On `Cancel`, return to this routing question. Emit the unified completion report.
  - (D) `Report only — take no further action` — do not enter any dispatch phase. Emit the completion report, then proceed to Step 5 per its gating rule (`fixes_applied_count > 0` from earlier `safe_auto` passes). If no fixes were applied this run, stop after the report.

- The walk-through's completion report, the best-judgment / File-tickets completion report, and the zero-remaining completion summary all follow the unified completion-report structure documented in `references/walkthrough.md`. Use the same structure across every terminal path.

### Autofix mode rules

- **Skip all user questions.** Never pause for approval or clarification once scope has been established.
- Apply only the `safe_auto -> review-fixer` queue, re-reviewing in bounded rounds (Step 3). Leave `gated_auto`, `manual`, `human`, and `release` items unresolved.
- Prepare residual work only for unresolved actionable findings whose final owner is `downstream-resolver`, and write the run artifact (Step 4). Do not file tickets.
- **Emit a compact Residual Actionable Work summary in the autofix return** as two contiguous sections: applied `safe_auto` fixes first, then residual non-auto findings. List each residual `downstream-resolver` finding with its stable `#` from Stage 5 (never renumber), severity, file:line, title, and autofix_class, and include the run-artifact path. Callers read this summary directly without parsing the artifact. When no residuals exist, state `Residual actionable work: none.` explicitly.
- Never commit, push, or create a PR.

### Agent mode rules

- Ask no questions and perform no mutations.
- Skip every fixer, ticket, commit, push, pull-request, and checkout-switch path.
- Serialize the complete merged finding set and the actionable subset through the SKILL.md JSON output contract, write `review.json`, and stop.

### Report-only mode rules

- **Skip all user questions.** Infer intent conservatively if the diff metadata is thin.
- Do not build a fixer queue.
- Do not write run artifacts.
- Never file tickets, commit, push, or create a PR. Stop after Stage 6; everything remains in the report.
- `mode:report-only` (like the read-only `mode:agent`) is safe to run concurrently with browser testing on the same checkout, and it never switches the shared checkout (`references/scope.md`).

### Headless mode rules

- **Skip all user questions.** Never pause for approval or clarification. Infer intent conservatively from the available branch, PR, diff, and caller context.
- Apply only the `safe_auto -> review-fixer` queue in a single pass. No bounded re-review rounds: spawn one fixer subagent, apply fixes, then proceed directly to Step 4.
- Leave `gated_auto`, `manual`, `human`, and `release` items unresolved and return them in the headless output envelope (`references/synthesis-and-output.md`), preserving severity, autofix_class, owner, requires_verification, confidence, pre_existing, and suggested_fix per finding, enriched with detail-tier fields from the per-agent artifacts.
- Write a run artifact (Step 4) and include its path in the structured output. Do not file tickets or externalize work. The caller owns that.
- With an explicit PR or branch target, `mode:headless` must run in an isolated checkout/worktree or stop (`references/scope.md`).
- **Not safe for concurrent use on a shared checkout.** Unlike `mode:report-only`, headless mutates files (applies `safe_auto` fixes). Callers must not run headless concurrently with other mutating operations on the same checkout.
- End with "Review complete" as the terminal signal after the structured text output. No commit/push/PR.

## Step 3: Apply fixes with one fixer

- Spawn exactly one fixer subagent for the current fixer queue in the current checkout. That fixer applies all approved changes and runs the relevant targeted tests in one pass against a consistent tree.
- Do not fan out multiple fixers against the same checkout. Parallel fixers require isolated worktrees/branches and deliberate mergeback.
- Do not start a mutating review round concurrently with browser testing on the same checkout. Future orchestrators that want both must either run `mode:report-only` during the parallel phase or isolate the mutating review in its own checkout/worktree.

**Queue contract by caller path:**

The fixer accepts two queue shapes depending on which caller invoked it:

- **Homogeneous queue (autofix, headless, walk-through Apply set):** every item is `safe_auto -> review-fixer` (autofix, headless), or every item carries a concrete `suggested_fix` (walk-through Apply set, where the user picked Apply on each finding). The fixer applies each item. **Defensive backstop for the walk-through Apply set:** the walk-through suppresses the Apply option for findings without a `suggested_fix` (see `references/walkthrough.md` adaptations) and the post-run failure-handling re-entry suppresses it as well, so this queue should not contain such items in normal runs. If one slips through, route it to `failed` with reason `no fix proposed by reviewer` rather than attempting an undefined apply — mirroring the heterogeneous queue's handling. Autofix and headless callers are unaffected; they only ever process `safe_auto` items.
- **Heterogeneous queue (best-judgment path — interactive option B and walk-through's `Auto-resolve with best judgment on the rest`):** the queue mixes `gated_auto`, `manual`, and `advisory` findings. Each item carries: `autofix_class`, `severity`, `file:line`, `title`, `suggested_fix` (may be null), `why_it_matters`, and `evidence`. The fixer routes each item to one of four buckets — the routing categories are fixed; the failure *reason string* should be specific enough that the post-run question's framing (`N findings could not be auto-resolved...`) reads meaningfully to the user. Use the category's default phrasing below when nothing more specific applies; prefer richer, finding-specific reasons that capture *why this particular item didn't land* (e.g., `needs intent confirmation; was the field narrowing deliberate, or do clients still need the full payload?` is more useful than the generic default).
  - **`safe_auto` / `gated_auto` / `manual` with `suggested_fix`:** light evidence-match check (verify the cited code at `file:line` still resembles the persona's evidence — concretely: at least one identifier or distinctive token from the evidence appears at the cited location, and the line has not been deleted). If the check passes, attempt to apply the fix. On clean apply, route to `applied`. On fix-application failure (line moved, conflicting edit, syntax issue), route to `failed` with a concrete reason — default phrasing `fix did not apply cleanly: <error>` when no richer description fits.
  - **`gated_auto` or `manual` without `suggested_fix`:** route to `failed` — default phrasing `no fix proposed by reviewer` when no richer description fits. For `manual` this signal indicates the persona judged the finding to need cross-team input or context outside the review; a richer reason naming the specific decision (intent ambiguity, contract decision, design choice) is more useful when the persona's `why_it_matters` or `evidence` makes that clear. For `gated_auto` this is a defensive case (the persona shouldn't normally produce `gated_auto` without a concrete fix) — surface it in `failed` rather than skipping it, to preserve the apply-or-fail contract.
  - **Advisory items (`autofix_class: advisory`):** no-op. Route to `advisory` (recorded as acknowledged).
  - **Evidence-match check fails:** route to `failed` — default phrasing `evidence no longer matches code at <file:line>` when no richer description fits. This is the false-positive case — the finding cited something that has since changed or was already handled.

**Best-judgment path is single-pass.** No `max_rounds: 2` re-review loop. After the fixer returns, the orchestrator follows Step 2 Interactive option B's post-fixer ordering: when the `failed` bucket is empty, emit the unified completion report directly; when it is non-empty, fire the post-run failure-handling question first, execute the user's choice, then emit the unified completion report so it reflects the final action state.

**Other paths retain the bounded-rounds loop.** For autofix and the walk-through Apply set, re-review only the changed scope after fixes land, bound the loop with `max_rounds: 2`, and if issues remain after the second round, hand them off as residual work or report them as unresolved.

**Verification.** If any applied finding has `requires_verification: true`, the fixer runs the targeted verification (focused tests or operational checks) for that item before declaring it `applied`. Verification failure routes the item to `failed` — default phrasing `verification failed: <test-name>` when no richer description fits (e.g., `verification failed: payment_spec timed out after 30s` is more useful than the bare default). This applies on every path.

**Fixer return shape (best-judgment path).** The fixer returns the partition `{applied, failed, advisory}` where each entry includes the finding identifier, original `autofix_class`, `severity`, `file:line`, and (for `failed`) a one-line reason. The orchestrator uses this partition to assemble the unified completion report and gate the post-run failure-handling question.

## Step 4: Emit artifacts and downstream handoff

- In interactive, agent, autofix, and headless modes, write a per-run artifact under `/tmp/ce-datascience/ce-code-review/<run-id>/` containing:
  - synthesized findings (merged output from Stage 5)
  - applied fixes
  - residual actionable work
  - advisory-only outputs
  Per-agent full-detail JSON files (`{reviewer_name}.json`) are already present in this directory from Stage 4 dispatch.
- Also write `metadata.json` alongside the findings so downstream skills or external core Compound Engineering callers can verify the artifact matches the current branch and HEAD. Minimum fields:
  ```json
  {
    "run_id": "<run-id>",
    "branch": "<SAFE_BRANCH at dispatch time>",
    "head_sha": "<git rev-parse HEAD at dispatch time>",
    "verdict": "<Ready to merge | Ready with fixes | Not ready>",
    "completed_at": "<ISO 8601 UTC timestamp>"
  }
  ```
  Capture `SAFE_BRANCH` and `head_sha` at dispatch time (before any autofixes land), and write the file after the verdict is finalized. Never persist a raw branch value that the PHI-safe preflight did not establish as safe. This file is additive -- pre-existing artifacts that predate this field are still valid, and downstream skills fall back to file mtime when it is missing.
- In autofix mode, the run artifact is the handoff. Orchestrators read the artifact's residual actionable work and route it as appropriate. The skill itself does not file tickets or prompt the user in autofix.
- Interactive mode may offer to externalize residual actionable work via `references/tracker-defer.md` (named tracker -> GitHub Issues via `gh`), but it is not required to finish the review.

## Step 5: Final next steps

**Interactive mode only.** After the fix-review cycle completes (clean verdict or the user chose to stop), offer next steps based on the entry mode. Reuse the resolved review base/default branch from Stage 1 when known; do not hard-code only `main`/`master`.

**The gate is total fixes applied this run, not routing option.** Track `fixes_applied_count` across the whole Interactive invocation. This counter includes both the `safe_auto` fixes applied automatically before the routing question (see Step 2 Interactive mode) AND any Apply decisions executed by routing option A (walk-through) or option B (best-judgment). Routing options C (File tickets) and D (Report only) add zero to this counter; neither does a walk-through that ends with only Skip / Defer / Acknowledge, and neither does a best-judgment dispatch whose findings were all routed to `failed` or `advisory`.

Step 5 runs only when `fixes_applied_count > 0`. If the counter is zero — no `safe_auto` fixes were applied AND the routing path produced no additional Apply — skip Step 5 entirely and exit after the completion report. Asking "push fixes?" when nothing changed in the working tree is incoherent.

Common outcomes:

- `safe_auto` produced fixes AND the user picked any routing option → Step 5 runs (counter > 0 from the safe_auto pass alone).
- No `safe_auto` fixes AND the user picked option C or D → Step 5 skipped.
- No `safe_auto` fixes AND walk-through / best-judgment finished with zero Applies → Step 5 skipped.
- Zero-remaining case (no `gated_auto` / `manual` after `safe_auto`) with at least one `safe_auto` fix → Step 5 runs; the routing question was never asked but the counter is > 0.

- **PR mode (entered via PR number/URL):**
  - **Push fixes** -- push commits to the existing PR branch
  - **Exit** -- done for now
- **Branch mode (feature branch with no PR, and not the resolved review base/default branch):**
  - **Create a PR (Recommended)** -- push and open a pull request
  - **Continue without PR** -- stay on the branch
  - **Exit** -- done for now
- **On the resolved review base/default branch:**
  - **Continue** -- proceed with next steps
  - **Exit** -- done for now

If "Create a PR": first publish the branch with `git push --set-upstream origin HEAD`, then use `gh pr create` with a title and summary derived from the branch changes.
If "Push fixes": push the branch with `git push` to update the existing PR.

**Agent, autofix, report-only, and headless modes:** stop after the report, artifact emission when allowed, and residual-work handoff. Do not commit, push, or create a PR. In `mode:agent`, emit nothing after the single JSON object.
