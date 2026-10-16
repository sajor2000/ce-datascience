# Phases 4-5: Apply, Present, and Next Action

## Contents

- Phase 4: Apply and Present
- Phase 5: Next Action — Terminal Question
- What NOT to Do
- Iteration Guidance

## Phase 4: Apply and Present

**User-facing vocabulary rule (applies to ALL user-visible output in Phase 4, not just the rendered template).** Internal enum values — `safe_auto`, `gated_auto`, `manual`, `FYI` — stay inside the schema and synthesis prose. Every word the user sees in Phase 4 output, including free-text narration between sections, transition preambles, status lines, and confirmation messages, MUST use user-facing vocabulary: "fixes" (for `safe_auto`), "proposed fixes" (for `gated_auto`), "decisions" (for `manual` findings at anchor `75` or `100`), "FYI observations" (for any finding at anchor `50`). The only exception is the `Tier` column in rendered tables, which is explicitly documented as surfacing the internal enum for transparency. Do NOT emit narration like "safe_auto fixes applied" or "N safe_auto findings" — write "fixes applied" or "N fixes" instead.

### Apply safe_auto fixes

Apply only `safe_auto` findings **at confidence anchor `100`** to the document in a single pass. This matches the 3.7 routing table: anchor `100` + `safe_auto` silent-applies; anchor `75` + `safe_auto` was demoted to `gated_auto` in 3.7 and enters the walk-through instead; anchor `50` + any `autofix_class` routes to FYI and must never auto-apply.

- Edit the document inline using the platform's edit tool
- Track what was changed for the "Applied fixes" section in the rendered output (`safe_auto` is the internal enum; the rendered section header reads "Applied fixes")
- Do not ask for approval — these have one clear correct fix AND evidence directly confirms (anchor `100`)
- Do NOT silent-apply any `safe_auto` finding at anchor `75` or `50`. If a finding reaches this step with `autofix_class: safe_auto` and anchor below `100`, the 3.7 routing rule was not applied correctly; re-run 3.7 for that finding before continuing.

List every applied fix in the output summary so the user can see what changed. Use enough detail to convey the substance of each fix (section, what was changed, reviewer attribution). This is especially important for fixes that add content or touch document meaning — the user should not have to diff the document to understand what the review did.

### Route Remaining Findings

After safe_auto fixes apply, remaining findings split into buckets:

- `gated_auto` and `manual` findings at confidence anchor `75` or `100` → enter the routing question (see `references/routing-question.md`)
- FYI-subsection findings → surface in the presentation only, no routing
- Zero actionable findings remaining → skip the routing question; flow directly to Phase 5 terminal question

**Headless mode:** Do not use interactive question tools. Output all findings as a structured text envelope the caller can parse. Internal enum values (`safe_auto`, `gated_auto`, `manual`, `FYI`) stay in the schema and synthesis prose; the envelope below uses user-facing vocabulary — "fixes", "Proposed fixes", "Decisions", "FYI observations" — so headless output reads the same way interactive output does.

```
Document review complete (headless mode).

Applied N fixes:
- <section>: <what was changed> (<reviewer>)
- <section>: <what was changed> (<reviewer>)

Proposed fixes (concrete fix, requires user confirmation):

[P0] Section: <section> — <title> (<reviewer>, confidence <anchor>)
  Why: <why_it_matters>
  Suggested fix: <suggested_fix>

Decisions (requires user judgment):

[P1] Section: <section> — <title> (<reviewer>, confidence <anchor>)
  Why: <why_it_matters>
  Suggested fix: <suggested_fix or "none">

  Dependents (would resolve if this root is rejected):
    [P2] Section: <section> — <title> (<reviewer>, confidence <anchor>)
      Why: <why_it_matters>
    [P2] Section: <section> — <title> (<reviewer>, confidence <anchor>)
      Why: <why_it_matters>

FYI observations (anchor 50, no decision required):

[P3] Section: <section> — <title> (<reviewer>, confidence <anchor>)
  Why: <why_it_matters>

Residual concerns:
- <concern> (<source>)

Deferred questions:
- <question> (<source>)

Dropped: N (anchors 0/25 suppressed)
Chains: N root(s) with M dependents
Restated: N (residual/deferred items suppressed as duplicates of actionable findings)

Review complete
```

Omit any section with zero items. The section headers reflect user-facing vocabulary: the "Proposed fixes" bucket carries `gated_auto` findings at anchor `75` or `100` (the persona has a concrete fix; the user confirms), "Decisions" carries `manual` findings at anchor `75` or `100` (judgment calls), and "FYI observations" carries any finding at anchor `50` regardless of `autofix_class`. When a root has dependents, render the root at its normal position in the severity-sorted list and nest its dependents as an indented `Dependents (...)` sub-block immediately below. Do not re-list dependents at their own severity position — they appear only under their root. End with "Review complete" as the terminal signal so callers can detect completion.

**Compact rendering for FYI observations, residual concerns, and deferred questions (high-count mode).** When the combined count of these three buckets is 5 or more, collapse each to a one-line count followed by a tight bullet list without per-item `Why` expansion. Actionable buckets (Proposed fixes / Decisions) remain fully rendered regardless. This mirrors the interactive-mode rule in `references/review-output-template.md` so both modes produce the same shape.

**Interactive mode:**

Present findings using the review output template (read `references/review-output-template.md`). Within each severity level, separate findings by type:

- Errors (design tensions, contradictions, incorrect statements) first — these need resolution
- Omissions (missing steps, absent details, forgotten entries) second — these need additions

Brief summary at the top: "Applied N fixes. K items need attention (X errors, Y omissions). Z FYI observations."

Include the Coverage table, applied fixes, FYI observations (as a distinct subsection), residual concerns, and deferred questions.

**All tables MUST be pipe-delimited markdown (`| col | col |`). Do NOT use ASCII box-drawing characters (`┌ ┬ ┐ ├ ┼ ┤ └ ┴ ┘ │ ─`) under any circumstances, including for the Coverage table.** This rule restates the template's formatting requirement at the point of rendering so it cannot drift. Pipe-delimited tables render correctly across all target harnesses; box-drawing characters break rendering in some and violate the repo convention documented in root `AGENTS.md`.

### R29 Rejected-Finding Suppression (Round 2+)

When the orchestrator is running round 2+ on the same document in the same session, the decision primer (see `references/decision-primer.md`) carries forward every prior-round Skipped, Deferred, and Acknowledged finding. Synthesis suppresses re-raised rejected findings rather than re-surfacing them to the user. Acknowledged is treated as a rejected-class decision here: the user saw the finding, chose not to act on it (no Apply, no Defer append), and wants it on record — equivalent to Skip for suppression purposes.

For each current-round finding, compare against the primer's rejected list:

- **Matching predicate:** same as R30 — `normalize(section) + normalize(title)` fingerprint augmented with evidence-substring overlap check (>50%). If a current-round finding matches a prior-round rejected finding on fingerprint AND evidence overlap, drop the current-round finding.
- **Materially-different exception:** if the current document state has changed around the finding's section since the prior round (e.g., the section was edited and the evidence quote no longer appears in the current text), treat the finding as new — the underlying context shifted and the concern may be genuinely different now. The persona's evidence itself reveals this: a quote that doesn't appear in the current document is a signal the prior-round rejection no longer applies.
- **On suppression:** record the drop in Coverage with a "previously rejected, re-raised this round" note so the user can see what was suppressed. The user can explicitly escalate by invoking the review again on a different context if they believe the suppression was wrong.

This rule runs at synthesis time, not at the persona level. Personas have a soft instruction via the subagent template's `{decision_primer}` variable to avoid re-raising rejected findings, but the orchestrator is the authoritative gate — if a persona re-raises despite the primer, synthesis drops the finding.

### R30 Fix-Landed Matching Predicate

When the orchestrator is running round 2+ on the same document (see `references/decision-primer.md`), synthesis verifies that prior-round Applied findings actually landed. For each prior-round Applied finding:

- **Matching predicate:** `normalize(section) + normalize(title)` (same fingerprint as 3.3 dedup) augmented with an evidence-substring overlap check. If any current-round persona raises a finding whose fingerprint matches a prior-round Applied finding AND shares >50% of its evidence substring with the prior-round evidence, treat it as a fix-landed regression.
- **Section renames count as different locations.** If the section name has changed between rounds (edit introduced a heading rename), treat the new section as a different location and the current-round finding as new.
- **On match:** flag the finding as "fix did not land" in the report rather than surfacing it as a new finding. Include the prior-round finding's title and the current-round persona's evidence so the user can see why the verification flagged it.

### Protected Artifacts

During synthesis, discard any finding that recommends deleting or removing files in:

- `docs/brainstorms/`
- `docs/plans/`
- `docs/solutions/`

These are pipeline artifacts and must not be flagged for removal.

## Phase 5: Next Action — Terminal Question

**Headless mode:** Return "Review complete" immediately. Do not ask questions. The caller receives the text envelope from Phase 4 and handles any remaining findings.

**Interactive mode:** fire the terminal question using the current harness's blocking question UI. Fall back to numbered options in chat only when no blocking question UI exists in the harness or the call errors. Never silently skip the question. This question is distinct from the mid-flow routing question (`references/routing-question.md`) — the routing question chooses *how* to engage with findings, this one chooses *what to do next* once engagement is complete. Do not merge them.

**Stem:** `Apply decisions and what next?`

**Options (three by default; two in the zero-actionable case):**

When `fixes_applied_count > 0` (at least one safe_auto or Apply decision has landed this session):

```
A. Apply decisions and proceed to <next stage>
B. Apply decisions and re-review
C. Exit without further action
```

When `fixes_applied_count == 0` (zero-actionable case, or the user took routing option D / every walk-through decision was Skip):

```
A. Proceed to <next stage>
B. Exit without further action
```

The `<next stage>` substitution uses the document type from Phase 1:

- Requirements document or `unified-requirements` → `method-plan`
- Plan document or `unified-plan` → `method-work`

**Label adaptation:** when no decisions are queued to apply, the primary option drops the `Apply decisions and` prefix — the label should match what the system is doing. `Apply decisions and proceed` when fixes are queued; `Proceed` when nothing is queued.

**Caller-context handling (implicit):** the terminal question's "Proceed to <next stage>" option is interpreted contextually by the agent from the visible conversation state. When method-doc-review is invoked from inside another skill's flow (e.g., method-brainstorm Phase 4 re-review, method-plan phase 5.3.8), the agent does not fire a nested `method-plan` or `method-work` dispatch — it returns control to the caller's flow which continues its own logic. When invoked standalone, "Proceed" dispatches the appropriate next skill. No explicit caller-hint argument is required; if this implicit handling proves unreliable in practice, an explicit `nested:true` flag can be added as a follow-up.

### Iteration limit

After 2 refinement passes, recommend completion — diminishing returns are likely. But if the user wants to continue, allow it; the primer carries all prior-round decisions so later rounds suppress repeat findings cleanly.

Return "Review complete" as the terminal signal for callers, regardless of which option the user picked.

## What NOT to Do

- Do not rewrite the entire document
- Do not add new sections or requirements the user didn't discuss
- Do not over-engineer or add complexity
- Do not create separate review files or add metadata sections
- Do not modify caller skills (method-brainstorm, method-plan, or external plugin skills that invoke method-doc-review)

## Iteration Guidance

On subsequent passes, re-dispatch personas with the multi-round decision primer (see `references/decision-primer.md`) and re-synthesize. Fixed findings self-suppress because their evidence is gone from the current doc; rejected findings are handled by the R29 pattern-match suppression rule; applied-fix verification uses the R30 matching predicate above. If findings are repetitive across passes after these mechanisms run, recommend completion.
