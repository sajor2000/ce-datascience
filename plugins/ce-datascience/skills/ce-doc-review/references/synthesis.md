# Phase 3: Synthesize Findings

## Contents

- 3.1 Validate
- 3.2 Confidence Gate (Anchor-Based)
- 3.3 Deduplicate
- 3.3b Same-Persona Premise Redundancy Collapse
- 3.4 Cross-Persona Agreement Promotion
- 3.5 Resolve Contradictions
- 3.5b Deterministic Recommended-Action Tie-Break
- 3.5c Premise-Dependency Chain Linking (in `references/synthesis-chains.md`)
- 3.6 Promote Auto-Eligible Findings
- 3.7 Route by Autofix Class
- 3.8 Sort
- 3.9 Suppress Restatements in Residual Concerns and Deferred Questions

## Phase 3: Synthesize Findings

Process findings from all agents through this pipeline. Order matters — each step depends on the previous. The pipeline implements the finding-lifecycle state machine: **Raised → (Confidence Gate | FYI-eligible | Dropped) → Deduplicated → Classified → SafeAuto | GatedAuto | Manual | FYI**. Re-evaluate state at each step boundary; do not carry forward assumptions from earlier steps as prose-level shortcuts.

### 3.1 Validate

Check each agent's returned JSON against the findings schema:

- Drop findings missing any required field defined in the schema
- Drop findings with invalid enum values (including the pre-rename `auto` / `present` values from older personas — treat those as malformed until all persona output has been regenerated)
- Note the agent name for any malformed output in the Coverage section

**Do not narrate remap / validation diagnostics to the user.** Schema-drift notes ("persona X returned unknown enum Y, remapped to Z"), persona-prompt-drift commentary, and other validator-internal diagnostics are maintainer-facing information. They do not belong in the Phase 4 output the user reads. If a persona's output is malformed, the only user-visible consequence is a Coverage-row annotation (e.g., the persona shows fewer findings or a `malformed` marker). Everything else stays internal.

### 3.2 Confidence Gate (Anchor-Based)

Gate findings by their `confidence` anchor value. Anchors are discrete integers (`0`, `25`, `50`, `75`, `100`) with behavioral definitions documented in `references/findings-schema.json` and embedded in the persona rubric (`references/subagent-template.md`). This replaces the prior continuous 0.0-1.0 scale with per-severity gates — doc-review economics do not warrant threshold gradation by severity, and coarse anchors prevent false-precision gaming.

| Anchor | Meaning | Route |
|--------|---------|-------|
| `0`    | False positive or pre-existing issue | Drop silently |
| `25`   | Might be real but could not verify | Drop silently |
| `50`   | Verified real but nitpick / advisory / not very important | Surface in FYI subsection |
| `75`   | Double-checked, will hit in practice, directly impacts correctness | Enter actionable tier (classify by `autofix_class`) |
| `100`  | Evidence directly confirms; will happen frequently | Enter actionable tier (classify by `autofix_class`) |

- **Dropped silently** (anchors `0` and `25`): these do not surface in any output bucket — not as findings, not as FYI observations, not as residual concerns. Record the total drop count as a Coverage footnote line when non-zero: `Dropped: N (anchors 0/25 suppressed)`. The footnote appears below the Coverage table, alongside the `Chains:` footnote when both apply. This is the canonical location for drop-count reporting — not the summary line and not a per-persona Coverage column. Omit the footnote when N is zero.
- **FYI-subsection** (anchor `50`): surface in the presentation layer's FYI subsection regardless of `autofix_class`. These do not enter the walk-through or any bulk action — observational value without forcing a decision. Advisory observations ("nothing breaks, but...") naturally land here.
- **Actionable** (anchors `75` and `100`): enter the classification pipeline. Route by `autofix_class` (see 3.7).

**Why this threshold, not Anthropic's ≥ 80 code-review threshold:** Document review has opposite economics from code review. There is no linter backstop — the review IS the backstop. Premise-level concerns (product-lens, adversarial) naturally cap at anchors 50-75 because "is the motivation valid?" cannot be verified against ground truth. The routing menu already makes dismissal cheap (Skip, Append to Open Questions), so surfaced-and-skipped is a low-cost outcome while missed-and-shipped derails downstream implementation. Filter low (`≥ 50`) and let the routing menu handle volume.

### 3.3 Deduplicate

Fingerprint each finding using `normalize(section) + normalize(title)`. Normalization: lowercase, strip punctuation, collapse whitespace.

When fingerprints match across personas:

- If the findings recommend opposing actions (e.g., one says cut, the other says keep), do not merge — preserve both for contradiction resolution in 3.5
- Otherwise merge: keep the highest severity, keep the highest confidence anchor (if tied, keep the finding appearing first in document order — deterministic, not probabilistic), union all evidence arrays, note all agreeing reviewers (e.g., "coherence, feasibility")
- **Coverage attribution:** Attribute the merged finding to the persona with the highest confidence anchor. If anchors tie, attribute to the persona whose entry appeared first in document order. Decrement the losing persona's Findings count and the corresponding route bucket so totals stay exact.

### 3.3b Same-Persona Premise Redundancy Collapse

A single persona sometimes files multiple findings that share the same root premise expressed at different sections or wrapped in different framing (e.g., product-lens firing five variants of "motivation is weak" attached to Motivation, Unit 4b, Key Technical Decisions, and two other sections). Cross-persona dedup (3.3) does not catch this — it fingerprints on section+title, which differ even when the underlying concern is the same. Surfacing all N variants over-weights one persona's perspective relative to the other five and inflates the P2 Decisions tier with near-duplicate signal.

For each persona, cluster that persona's surviving findings by shared root premise. A cluster forms when 3 or more findings from the same persona share:

- The same `finding_type` (error or omission)
- Substantially overlapping `why_it_matters` phrasing (same key nouns/verbs signaling the same concern, e.g., "motivation", "justification", "premise unsupported", "scope creep")
- Fixes that would all be obviated by the same upstream decision (e.g., "add the triggering incident" would moot all five motivation-weakness findings)

For each cluster of size N ≥ 3:

- Keep the single finding with the strongest evidence (highest confidence anchor, or if tied, the one citing the most concrete document reference)
- Demote the remaining N-1 findings to FYI-subsection status (anchor `50`), regardless of their original anchor
- On the kept finding, note in the Reviewer column that the persona raised N-1 related variants (e.g., `product-lens (+4 related variants demoted to FYI)`)

This runs per-persona before 3.4 cross-persona boost. Cross-persona agreement across the *kept* finding still qualifies for the anchor-step promotion in 3.4; demoted variants do not participate in cross-persona promotion (they are observational only after collapse).

Do NOT collapse across personas at this step — different personas surfacing the same concern is exactly the independence signal the cross-persona boost rewards. Collapse applies within one persona's output only.

### 3.4 Cross-Persona Agreement Promotion

When 2+ independent personas flagged the same merged finding (from 3.3), promote the merged finding's anchor by one step: `50 → 75`, `75 → 100`. Anchor `100` does not promote further (already at the ceiling). Findings at anchors `0` or `25` do not reach this step (they were dropped in 3.2).

Independent corroboration is strong signal — multiple reviewers converging on the same issue is more reliable than any single reviewer's anchor. Promoting by one anchor step is semantically meaningful (a "verified but nitpick" finding that two personas independently surface is plausibly "will hit in practice"). This replaces the prior `+0.10` boost — the magic-number bump was calibrated to the continuous scale and no longer applies.

Note the promotion in the Reviewer column of the output (e.g., `coherence, feasibility (+1 anchor)`).

This replaces the earlier residual-concern promotion step. Findings at anchors `0` / `25` are not promoted back into the review surface; they appear only as drop counts in Coverage. If a dropped finding is genuinely important, the reviewer should raise their anchor to `50` or higher through stronger evidence rather than relying on a promotion rule.

### 3.5 Resolve Contradictions

When personas disagree on the same section:

- Create a combined finding presenting both perspectives
- Set `autofix_class: manual` (contradictions are by definition judgment calls)
- Set `finding_type: error` (contradictions are about conflicting things the document says, not things it omits)
- Frame as a tradeoff, not a verdict

Specific conflict patterns:

- Coherence says "keep for consistency" + scope-guardian says "cut for simplicity" → combined finding, let user decide
- Feasibility says "this is impossible" + product-lens says "this is essential" → P1 finding framed as a tradeoff
- Multiple personas flag the same issue (no disagreement) → handled in 3.3 merge, not here

### 3.5b Deterministic Recommended-Action Tie-Break

Every merged finding carries exactly one `recommended_action` field consumed by the walk-through (`references/walkthrough.md`) to mark the `(recommended)` option, by the best-judgment path (`references/bulk-preview.md`) to choose what to execute in bulk, and by the stem's yes/no framing. When a merged finding was flagged by multiple personas who implied different actions, synthesis picks the recommended action deterministically so identical review artifacts produce identical walk-through and best-judgment behavior across runs.

**Tie-break order (most conservative first):** `Skip > Defer > Apply`. The first action that at least one contributing persona implied wins, scanning in that order.

- If any contributing persona implied Skip → `recommended_action: Skip`
- Else if any contributing persona implied Defer → `recommended_action: Defer`
- Else → `recommended_action: Apply`

**Persona-to-action mapping.** A persona implies an action through its classification:

- `safe_auto` or `gated_auto` → implies Apply
- `manual` with a concrete `suggested_fix` and a recommended resolution → implies Apply (the persona has an opinion about what to do)
- `manual` flagged as a tradeoff or scope question with no recommended resolution → implies Defer (worth revisiting, not worth acting now)
- Any persona flagging the finding as low-confidence or suppression-eligible via residual concerns → implies Skip
- Persona in the contradiction set (3.5) implying "keep as-is / do not change" → implies Skip

If the contributing personas are all silent on action (e.g., a merged `manual` finding from personas that all flagged it as observation without recommendation), pick the default based on whether the merged finding carries an executable `suggested_fix`:

- `suggested_fix` present → `recommended_action: Apply` as the pragmatic default.
- `suggested_fix` absent → `recommended_action: Defer` (the walk-through and best-judgment path cannot execute Apply without a fix; routing an actionless finding to Defer surfaces it in Open Questions where the user can decide what to do with it).

This gate holds for every branch of the tie-break: if the winning action is `Apply` but the merged finding has no `suggested_fix` after 3.6 (Promote) and 3.7 (Route) have run, downgrade to `Defer`. The walk-through still lets the user pick any of the four options; this rule only governs the agent's default recommendation so the best-judgment path and bulk-preview never schedule a non-executable Apply.

**Conflict-context surface.** When the tie-break fires (contributing personas implied different actions), record a one-line conflict-context string on the merged finding. The walk-through renders this on the conflict-context line (see `references/walkthrough.md`). Example: `Coherence recommends Apply; scope-guardian recommends Skip. Agent's recommendation: Skip.`

**Downstream invariant.** The walk-through and bulk-preview never recompute the recommendation — they read `recommended_action` and render `(recommended)` on the matching option. Best-judgment-the-rest and routing option B execute the `recommended_action` across the scoped finding set in bulk. This keeps best-judgment outcomes reproducible and auditable: the same review artifact always produces the same bulk plan.

### 3.5c Premise-Dependency Chain Linking

Run this step after 3.5b and before 3.6. Read `references/synthesis-chains.md` and follow it.

### 3.6 Promote Auto-Eligible Findings

Scan `manual` findings for promotion to `safe_auto` or `gated_auto`. Promote when the finding meets one of the consolidated auto-promotion patterns:

- **Codebase-pattern-resolved.** `why_it_matters` cites a specific existing codebase pattern (concrete file/function/usage reference, not just "best practice" or "convention"), and `suggested_fix` follows that pattern. Promote to `gated_auto` — the user still confirms, but the codebase evidence resolves ambiguity.
- **Factually incorrect behavior.** The document describes behavior that is factually wrong, and the correct behavior is derivable from context or the codebase. Promote to `gated_auto`.
- **Missing standard security/reliability controls.** The omission is clearly a gap (not a legitimate design choice for the system described), and the fix follows established practice (HTTPS enforcement, checksum verification, input sanitization, fallback-with-deprecation-warning on renames). Promote to `gated_auto`.
- **Framework-native-API substitutions.** A hand-rolled implementation duplicates first-class framework behavior, and the framework API is cited. Promote to `gated_auto`.
- **Mechanically-implied completeness additions.** The missing content follows mechanically from the document's own explicit, concrete decisions (not high-level goals). Promote to `safe_auto` when there is genuinely one correct addition; `gated_auto` when the addition is substantive.

Do not promote if the finding involves scope or priority changes where the author may have weighed tradeoffs invisible to the reviewer.

**Strawman-downgrade safeguard.** If a `safe_auto` finding names dismissed alternatives in `why_it_matters` (per the subagent template's strawman rule), verify the alternatives are genuinely strawmen. If any alternative is a plausible design choice that the persona dismissed too aggressively, downgrade to `gated_auto` so the user sees the tradeoff before the fix applies.

### 3.7 Route by Autofix Class

**Severity and autofix_class are independent.** A P1 finding can be `safe_auto` if the correct fix is obvious. The test is not "how important?" but "is there one clear correct fix, or does this require judgment?"

**Anchor and autofix_class are also independent.** Anchor gates the finding into a surface (FYI vs actionable); `autofix_class` decides what the actionable surface does with it. Both are consulted in this step.

Findings reaching 3.7 have already been gated to anchors `50`, `75`, or `100` by 3.2 (anchors `0` and `25` were dropped).

| Anchor | Autofix Class | Route |
|--------|---------------|-------|
| `100`  | `safe_auto`   | Apply silently in Phase 4. Requires `suggested_fix`. Demote to `gated_auto` if missing. |
| `100`  | `gated_auto`  | Enter the per-finding walk-through with Apply marked (recommended). Requires `suggested_fix`. Demote to `manual` if missing. |
| `100`  | `manual`      | Enter the per-finding walk-through with user-judgment framing. `suggested_fix` is optional. |
| `75`   | `safe_auto`   | Demote to `gated_auto` before routing — silent apply is reserved for anchor `100` findings where evidence directly confirms the fix. Enter the walk-through with Apply marked (recommended). |
| `75`   | `gated_auto`  | Enter the per-finding walk-through with Apply marked (recommended). Requires `suggested_fix`. Demote to `manual` if missing. |
| `75`   | `manual`      | Enter the per-finding walk-through with user-judgment framing. `suggested_fix` is optional. |
| `50`   | any           | Surface in the FYI subsection regardless of `autofix_class`. Do not enter the walk-through or any bulk action. These are observations, not decisions. |

**Auto-eligible patterns for safe_auto:** summary/detail mismatch (body authoritative over overview), wrong counts, missing list entries derivable from elsewhere in the document, stale internal cross-references, terminology drift, prose/diagram contradictions where prose is more detailed, missing steps mechanically implied by other content, unstated thresholds implied by surrounding context.

**Auto-eligible patterns for gated_auto:** codebase-pattern-resolved fixes, factually incorrect behavior, missing standard security/reliability controls, framework-native-API substitutions, substantive completeness additions mechanically implied by explicit decisions.

### 3.8 Sort

Sort findings for presentation: P0 → P1 → P2 → P3, then by finding type (errors before omissions), then by confidence anchor (descending: `100` first, then `75`, then `50`), then by document order (section position) as the deterministic final tiebreak.

### 3.9 Suppress Restatements in Residual Concerns and Deferred Questions

Persona outputs carry `residual_risks` and `deferred_questions` arrays alongside `findings`. After the actionable-tier set is finalized (post-3.7 routing), personas often re-surface the same substance in their residual/deferred arrays — the persona's own finding and the persona's own residual concern are about the same issue. Rendering both sections verbatim inflates the output with restatements that carry no new signal.

For every `residual_risk` and `deferred_question` across all persona outputs, check against the finalized actionable-finding set (findings at confidence anchor `75` or `100`, plus FYI-subsection findings at anchor `50`). Drop the residual/deferred item if either of these holds:

- **Section-and-substance overlap.** The residual/deferred item names the same section as an actionable finding AND its substance fuzzy-matches the finding's `title` or `why_it_matters` (shared key nouns/verbs indicating the same concern).
- **Question form of an actionable finding.** A deferred question whose subject is directly answered by or obviated by an actionable finding's recommendation. Example: actionable finding "Motivation cites no real incident" → deferred question "Is there a concrete triggering event?" — the finding already raised this; the question restates it interrogatively.

Do NOT drop residual/deferred items that introduce genuinely new signal (a concern or question the actionable findings do not touch). When in doubt, keep — this pass is for obvious restatements, not borderline calls.

Run this pass on the merged set across all personas. Record the count dropped as a Coverage footnote line when non-zero: `Restated: N (residual/deferred items suppressed as duplicates of actionable findings)`. Ordering: footnotes appear in the sequence `Dropped:`, `Chains:`, `Restated:` below the Coverage table, each on its own line. Omit any footnote whose count is zero.
