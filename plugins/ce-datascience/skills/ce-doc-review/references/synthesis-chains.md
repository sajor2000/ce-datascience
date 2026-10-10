# Synthesis Step 3.5c: Premise-Dependency Chain Linking

Read this from `references/synthesis.md` after step 3.5b. Return to step 3.6 there when done.

### 3.5c Premise-Dependency Chain Linking

Document reviews often produce fanout: a single premise challenge ("is this work justified?") generates downstream findings that all evaporate if the premise is rejected ("alias unjustified", "abstraction overkill", "migration lacks rollback", "naming forecloses future"). Surfacing each as an independent decision forces the user to re-litigate the same root question N times. This step links dependent findings to their root so presentation can group them and the walk-through can cascade a single root decision across the chain.

Run this step after 3.5b (recommended_action normalized) and before 3.6 (auto-promotion), operating on the merged finding set.

**Step 1: Identify roots.** A finding is a candidate root when ALL of the following hold:

- Severity is `P0` or `P1` (premise-level issues carry high priority by nature)
- `autofix_class` is `manual` (the root itself requires judgment — a safe/gated root is acted on, not cascaded)
- `why_it_matters` or `title` challenges a foundational premise, not a detail. Signal phrases (shape, not vocabulary): "premise unsupported", "justification missing", "do-nothing baseline not evaluated", "is X justified", "unsupported by evidence", "is the proposed solution the right approach"
- The finding's `section` is framing-level (Problem Frame, Overview, Why, Motivation, Goals) OR the finding explicitly questions whether a named component should exist

If multiple candidates match the criteria, elevate ALL of them. The criteria above (P0/P1, manual, framing-level section, premise-challenge signal phrases) are restrictive enough that this list will be short for any well-formed document; do not impose a further numerical cap. Picking only one root when two valid roots exist leaves the second root's natural dependents stranded as independent manual findings — the exact UX problem chains are meant to solve.

**Peer vs nested test.** Two candidate roots are peers when accepting root A's proposed fix would not resolve root B's concern (and vice versa). They are nested when one root's fix would moot the other — in which case the subsumed candidate becomes a dependent of the surviving root, not a peer root. Apply the test symmetrically: check both directions before deciding.

**Surviving-root selection under asymmetric subsumption.** When nested, the surviving root is the one whose fix moots the other — **not** the one with higher confidence. If accepting Root A's fix moots Root B's concern, but accepting Root B's fix leaves Root A's concern standing, A is the surviving root and B becomes its dependent, regardless of which candidate scored higher confidence. The subsumption direction determines scope (broader premise wins); confidence determines strength, not scope. Confidence is used for tie-breaking *among peers*, not for deciding which of two nested candidates dominates.

**Sanity diagnostic.** If more than 3 candidates match, reconsider whether the criteria are being applied correctly — it is unusual for a single document to contain more than 3 genuinely distinct premise-level challenges. Do not silently drop candidates; either confirm each one independently meets the criteria (and surface them all), or tighten the application of the criteria. If the count is legitimately high, surfacing all of them is more useful than hiding any.

If none match, skip the rest of this step — no chains exist.

**Dependent assignment under multiple roots.** When multiple roots exist and a candidate dependent could plausibly link to more than one, assign it to the root whose rejection most directly dissolves the dependent's concern. If ambiguity remains, assign to the root with the higher confidence anchor; if anchors tie, assign to the root appearing first in document order. A dependent never links to more than one root — a single `depends_on` value.

**Step 2: Identify dependents.** For each candidate root, scan the remaining findings for dependents. The predicate must match the cascade trigger in `references/walkthrough.md` — dependents cascade when the user rejects (Skip/Defer) the root, so dependency is defined on the rejection branch, not the acceptance branch. A finding is a dependent of a root when:

- The root challenges a foundational premise about a named component — questioning whether it should exist, whether the proposed approach is correct, or whether the work is justified. Shapes to recognize (not a vocabulary list — map to whatever the document's domain actually uses): a compatibility layer whose necessity is challenged, a planned feature whose justification is in doubt, an abstraction whose warrant is questioned, a proposed change whose scope is disputed, a migration target whose choice is contested, an architectural commitment whose basis is unsupported
- The candidate's `suggested_fix` modifies, adds detail to, or constrains that same component
- The candidate's concern would dissolve if the root's premise is rejected — meaning: if the user rejects the root (Skip/Defer), the component the dependent targets is no longer a settled part of the plan, so the dependent's fix has nothing stable to act on and batch-rejects with the root

Test with the substitution check: "If the user rejects the root (Skip/Defer), does the dependent's finding still describe an actionable concern the user would want to engage with this round?" If no — the dependent's premise dissolves alongside the root's — it is a dependent. If yes (the finding identifies a problem that survives root rejection), it is not.

**Step 3: Independence safeguard.** Even when a finding's target component is addressed by the root, do NOT link if:

- The dependent identifies a problem that would exist regardless of the root's resolution. A migration's rollback plan, a module's error handling, a feature's test coverage — these are operational obligations that don't evaporate when the premise changes. They describe how a component must behave if it exists at all.
- The dependent's `why_it_matters` cites evidence (codebase fact, framework convention, production data) that stands on its own, not conditioned on the premise
- The dependent is `safe_auto` — it has one clear correct fix and should apply regardless of the root's resolution

When uncertain, default to NOT linking. A mis-linked chain hides a real issue; leaving a finding unlinked only costs one extra decision.

**Step 4: Annotate.** On each dependent, record `depends_on: <root_finding_id>` (use section + normalized title as the id). On each root, record `dependents: [<dependent_ids>]`. Cap `dependents` at 6 entries per root — if more than 6 candidates link to the same root, keep the top 6 by severity, then confidence anchor (descending), then document order as the deterministic final tiebreak; leave the rest unlinked (over-aggressive chaining risks obscuring independent concerns).

Do NOT reclassify, re-route, or change the confidence anchor of any finding in this step. Linking is purely annotative; the walk-through and presentation use the annotation, synthesis proper does not.

**Step 5: Report in Coverage.** Add a line to the coverage summary: `Chains: N root(s) with M dependents`. When N = 0, omit the line.

**Count invariant (critical — do not violate).** `M` in the coverage line is the number of findings with `depends_on` set after Step 4 completes — i.e., the final linked count after steps 2 (candidacy), 3 (independence safeguard), and 4 (cap). It is NOT the number of candidates considered in Step 2. The same `dependents` array is the source of truth for both coverage counting AND rendering the `Dependents (...)` sub-block. If a finding appears in a root's `dependents` array, it MUST appear nested under that root in the presentation and MUST NOT appear at its own severity position. If a finding does NOT appear in any root's `dependents` array, it MUST appear at its own severity position and MUST NOT appear nested anywhere. Coverage count and rendering drift apart only if the orchestrator is using two different source-of-truth values — there is exactly one, the post-Step-4 `dependents` array on each root.

**Worked example A (rename-shape).** Review of a refactor plan surfaces 11 findings. One is P0 manual "Rename premise unsupported by user-facing evidence" in Problem Frame — a candidate root. Scanning the other 10:

- P1 manual "Alias mechanism unjustified scope" — root proposes scoping down to a pure alias-free rename; dependent's fix proposes dropping alias infrastructure. Linked.
- P2 manual "AliasedCommand abstraction overkill" — abstraction exists to support the alias; if alias dropped, abstraction dissolves. Linked.
- P2 manual "Rename forecloses dual-mode future" — concern only exists if rename proceeds. Linked.
- P2 manual "Identity drift: command vs artifact names" — naming asymmetry only exists if rename proceeds. Linked.
- P1 manual "Migration lacks rollback strategy" — migration needs rollback regardless of scope. NOT linked (independence safeguard).
- P0 gated_auto "Deployment-ordering between migration and code" — concrete fix user confirms regardless. NOT linked (safeguard: gated_auto with own resolution path).

Result: 1 root + 4 dependents. User sees the root first; rejecting it cascades the 4 dependents to auto-resolved. Manual engagement drops from 11 → 7 (6 unlinked + 1 visible root).

**Worked example B (auth-shape).** Review of a plan to introduce a new session-management middleware. One finding is P1 manual "Middleware rewrite premise unsupported — existing session handling has no reported reliability issues" in Problem Frame. Scanning the other findings:

- P2 manual "Middleware abstraction boundary unclear vs existing request context" — the boundary only matters if the middleware is built. Linked.
- P2 manual "Rollout strategy for new session store not specified" — the rollout only matters if the new store ships. Linked.
- P1 gated_auto "CSRF token regeneration missing on session rotation" — a real security gap in the plan's written design, independent of whether the middleware is the right approach. NOT linked (safeguard: gated_auto, concrete fix applies regardless).
- P2 manual "Existing session timeout behavior not captured in tests" — this is a pre-existing test coverage gap. It exists in the current code regardless of whether the rewrite happens. NOT linked (independence safeguard).

Result: 1 root + 2 dependents. The shape is the same as Example A — different vocabulary, different domain — which is the pattern to recognize.
