# Stages 5 and 5b: Merge and Validate Findings

## Contents

- Action Routing (autofix_class, owner, and routing rules)
- Stage 5: Merge findings (validate, dedupe, promote, route, demote, gate, partition, sort)
- Stage 5b: Validation pass (externalizing modes only)

## Action Routing

Severity answers **urgency**. Routing answers **who acts next** and **whether this skill may mutate the checkout**.

| `autofix_class` | Default owner | Meaning |
|-----------------|---------------|---------|
| `safe_auto` | `review-fixer` | Local, deterministic fix suitable for the in-skill fixer when the current mode allows mutation |
| `gated_auto` | `downstream-resolver` or `human` | Concrete fix exists, but it changes behavior, contracts, permissions, or another sensitive boundary that should not be auto-applied by default |
| `manual` | `downstream-resolver` or `human` | Actionable work that should be handed off rather than fixed in-skill |
| `advisory` | `human` or `release` | Report-only output such as learnings, rollout notes, or residual risk |

- **Synthesis owns the final route.** Persona-provided routing metadata is input, not the last word.
- **Choose the more conservative route on disagreement.** A merged finding may move from `safe_auto` to `gated_auto` or `manual`, but never the other way without stronger evidence.
- **Only `safe_auto -> review-fixer` enters the in-skill fixer queue automatically.**
- **`requires_verification: true` means a fix is not complete without targeted tests, a focused re-review, or operational validation.**

## Stage 5: Merge findings

Convert multiple reviewer compact JSON returns into one deduplicated, confidence-gated finding set. The compact returns contain merge-tier fields (title, severity, file, line, confidence, autofix_class, owner, requires_verification, pre_existing) plus the optional suggested_fix. Detail-tier fields (why_it_matters, evidence) are on disk in the per-agent artifact files and are not loaded at this stage.

`confidence` is one of 5 discrete anchors (`0`, `25`, `50`, `75`, `100`) with behavioral definitions in the findings schema. Synthesis treats anchors as integers; do not coerce to floats.

1. **Validate.** Check each compact return for required top-level and per-finding fields, plus value constraints. Drop malformed returns or findings. Record the drop count.
   - **Top-level required:** reviewer (string), findings (array), residual_risks (array), testing_gaps (array). Drop the entire return if any are missing or wrong type.
   - **Per-finding required:** title, severity, file, line, confidence, autofix_class, owner, requires_verification, pre_existing
   - **Value constraints:**
     - severity: P0 | P1 | P2 | P3
     - autofix_class: safe_auto | gated_auto | manual | advisory
     - owner: review-fixer | downstream-resolver | human | release
     - confidence: integer in {0, 25, 50, 75, 100}
     - line: positive integer
     - pre_existing, requires_verification: boolean
   - Do not validate against the full schema here -- the full schema (including why_it_matters and evidence) applies to the artifact files on disk, not the compact returns.
2. **Deduplicate.** Compute fingerprint: `normalize(file) + line_bucket(line, +/-3) + normalize(title)`. When fingerprints match, merge: keep highest severity, keep highest anchor, note which reviewers flagged it. Dedup runs over the full validated set (including anchor 50) so cross-reviewer promotion in step 3 can lift matching anchor-50 findings into the actionable tier.
3. **Cross-reviewer agreement.** When 2+ independent reviewers flag the same issue (same fingerprint), promote the merged finding by one anchor step: `50 -> 75`, `75 -> 100`, `100 -> 100`. Cross-reviewer corroboration is a stronger signal than any single reviewer's anchor; the promotion routes a previously-soft finding into the actionable tier or strengthens its already-actionable position. Note the agreement in the Reviewer column of the output (e.g., "security, correctness").
4. **Separate pre-existing.** Pull out findings with `pre_existing: true` into a separate list.
5. **Resolve disagreements.** When reviewers flag the same code region but disagree on severity, autofix_class, or owner, annotate the Reviewer column with the disagreement (e.g., "security (P0), correctness (P1) -- kept P0"). This transparency helps the user understand why a finding was routed the way it was.
6. **Normalize routing.** For each merged finding, set the final `autofix_class`, `owner`, and `requires_verification`. If reviewers disagree, keep the most conservative route. Synthesis may narrow a finding from `safe_auto` to `gated_auto` or `manual`, but must not widen it without new evidence.
6b. **Derive the recommended action.** Interactive mode's walk-through and best-judgment paths present a per-finding recommended action (Apply / Defer / Skip / Acknowledge). The recommendation is derived from the normalized `autofix_class` and the presence of `suggested_fix` using this mapping:

| `autofix_class` | `suggested_fix` present? | Recommended action |
|-----------------|--------------------------|--------------------|
| `safe_auto`     | (auto-applied before the routing question; not surfaced to best-judgment/walk-through) | Apply |
| `gated_auto`    | yes                      | Apply |
| `gated_auto`    | no                       | Defer |
| `manual`        | **yes**                  | **Apply** |
| `manual`        | no                       | Defer |
| `advisory`      | n/a                      | Acknowledge |

The presence of `suggested_fix` is the authoritative signal that the agent can act on the finding. A `manual` finding *with* a `suggested_fix` recommends Apply because the persona has committed to a concrete fix shape grounded in review context (per the subagent template's suggested_fix rule). A `manual` finding *without* a `suggested_fix` recommends Defer because the persona signaled that the fix genuinely needs cross-team input or business-rule context the reviewer cannot provide. `autofix_class` itself is not collapsed by this mapping — the report still records what the persona thought (`manual` vs `gated_auto`), and the distinction matters for downstream surfaces like the unified completion report.

**Cross-reviewer tie-break.** When contributing reviewers implied different actions for the same merged finding, synthesis picks the most conservative using the order `Skip > Defer > Apply > Acknowledge`. This rule fires only on multi-reviewer disagreement; the per-finding mapping above is the single-reviewer default. Tie-break guarantees that identical review artifacts produce the same recommendation deterministically, so best-judgment results are auditable after the fact and the walk-through's recommendation is stable across re-runs. The user may still override per finding via the walk-through's options; this rule only determines what gets labeled "recommended."
6c. **Mode-aware demotion of weak general-quality findings.** Some persona output is real signal but does not warrant primary-findings attention. Reroute it to the existing soft buckets so the primary findings table stays focused on actionable issues.

A finding qualifies for demotion when **all** of these hold:
   - Severity is P2 or P3 (P0 and P1 always stay in primary findings)
   - `autofix_class` is `advisory` (concrete-fix findings stay in primary)
   - **All** contributing reviewers are `testing` or `maintainability` — if any other persona also flagged this finding, cross-reviewer corroboration is present and the finding stays in primary findings regardless of its severity or advisory status (expand the weak-signal list later only with evidence)

When a finding qualifies, route by mode:
   - **Interactive, agent, and report-only modes:** Move the finding out of the primary findings set. If the contributing reviewer is `testing`, append `<file:line> -- <title>` to `testing_gaps`. If `maintainability`, append the same to `residual_risks`. Record the demotion count for Coverage. The finding does not appear in the Stage 6 findings table. (Use title only because the compact return omits `why_it_matters`; enrich from detail artifacts when available. Soft-bucket entries are FYI items.)
   - **Headless and autofix modes:** Suppress the finding entirely. Record the suppressed count in Coverage as "mode-aware demotion suppressions" so the user can see what was filtered.

Demotion is intentionally narrow. The conservative scope (testing/maintainability + P2/P3 + advisory) is the starting point; do not expand the rule by guessing which other personas overproduce noise. If real review runs show another persona consistently emitting weak signal, expand with evidence.

7. **Confidence gate.** After dedup, promotion, and demotion have shaped the primary set, suppress remaining findings below anchor 75. Exception: P0 findings at anchor 50+ survive the gate -- critical-but-uncertain issues must not be silently dropped. Record the suppressed count by anchor (so Coverage can report "N findings suppressed at anchor 50, M at anchor 25"). The gate runs late deliberately: anchor-50 findings need a chance to be promoted by step 3 (cross-reviewer corroboration) or rerouted by step 6c (mode-aware demotion to soft buckets) before any drop decision.
8. **Partition the work.** Build three sets:
   - in-skill fixer queue: only `safe_auto -> review-fixer`
   - residual actionable queue: unresolved `gated_auto` or `manual` findings whose owner is `downstream-resolver`
   - report-only queue: `advisory` findings plus anything owned by `human` or `release`
9. **Sort.** Order by severity (P0 first) -> anchor (descending) -> file path -> line number.
10. **Collect coverage data.** Union residual_risks and testing_gaps across reviewers.
11. **Apply blinded-EDA and Protected Artifacts rules.** Add the SKILL.md blinded-EDA P0 finding when it applies, and discard any finding that recommends deleting or gitignoring a SKILL.md Protected Artifact.
12. **Preserve CE agent artifacts.** Keep the learnings researcher output alongside the merged finding set. Do not drop unstructured agent output just because it does not match the persona JSON schema.

## Stage 5b: Validation pass (externalizing modes only)

Independent verification gate. Spawn one validator sub-agent per surviving finding using `references/validator-template.md`. The validator's job is to re-check the finding against the diff and surrounding code with no commitment to the original persona's analysis. Findings the validator rejects are dropped; findings the validator confirms flow through unchanged.

The SKILL.md Stage 5b table decides which modes and routing paths run this stage.

The best-judgment path skips Stage 5b deliberately. Running per-finding validators before the fixer dispatches is duplicate research — the fixer naturally re-checks each finding when applying or proposing the fix, and items where the cited evidence no longer matches the code (the false-positive case Stage 5b would catch) are routed to the `failed` bucket during the fix attempt itself. The user reviews via diff and the post-run failure-handling question (see Step 2 Interactive option B), not via a pre-dispatch validator gate.

When Stage 5b does not run, the merged finding set from Stage 5 flows through to Stage 6 unchanged. When it runs, the steps below execute on the relevant set.

**Steps:**

1. **Select findings to validate.**
   - **agent/headless/autofix:** All survivors of Stage 5.
   - **interactive File-tickets (option C):** All pending findings regardless of recommended action. Option C externalizes every finding as a ticket, so every finding needs validation.
2. **Apply dispatch budget cap.** If the selected set exceeds 15 findings, validate the highest-severity 15 (P0 first, then P1, then P2, then P3, breaking ties by anchor descending). Drop the remainder and record the over-budget count for the Coverage section. The blunt drop is intentional; a review producing 15+ surviving findings is already in territory where a second wave would not change the user's triage approach.
3. **Spawn validators in parallel.** One sub-agent per finding, dispatched concurrently using `references/validator-template.md`. Each validator receives:
   - The finding's title, severity, file, line, suggested_fix, original reviewer name, and confidence anchor
   - `why_it_matters` when available — loaded from the per-agent artifact file at `/tmp/methodsmith/method-review/{run_id}/{reviewer_name}.json`; omit when the file is absent or the artifact write failed. The validator proceeds without it, using the diff and cited code directly.
   - The preflight-approved diff and relevant surrounding code
   - Read-tool access only within preflight-approved paths. In PHI-risk reviews
     without `PHI authorization: confirmed`, validator prompts must prohibit broad checkout-reading commands including
     `git diff`, `git show`, `git blame`, `git log`, and `gh`; validators inspect
     only the supplied PHI-free context. With confirmed authorization, validators
     have no content limits.
4. **Collect verdicts.** Each validator returns `{ "validated": true | false, "reason": "<one sentence>" }`.
   - `validated: true` -> finding survives unchanged into the next phase (Stage 6 for agent/headless/autofix, dispatch for interactive)
   - `validated: false` -> finding is dropped; record the validator's reason in Coverage
   - Validator failure (timeout, dispatch error, malformed JSON) -> drop the finding with reason "validator failed"; conservative bias is correct
5. **Use mid-tier model for validators.** Same model class (sonnet) the persona reviewers use. Validators are read-only and inherit the same preflight-approved path and checkout-access constraints as general persona reviewers.
6. **Record metrics for Coverage.** Total dispatched, validated true count, validated false count (with reasons), failures, and over-budget drops.

**Why per-finding parallel dispatch (not batched):** Independence is the point. A single batched validator looking at all findings together pattern-matches across them and recreates the persona-bias problem. Per-finding parallel dispatch preserves fresh context per call. Per-file batching is a plausible future optimization for reviews with many findings clustered in few files; not implemented today.
