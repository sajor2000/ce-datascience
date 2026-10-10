# Scoping Synthesis Discipline

## Contents

- Call-out tests (shared)
- Synthesis structural discipline (shared)
- Granularity: name the decision; don't expand it (shared)
- Soft-cut on circularity (shared)
- Self-redirect (shared)
- What does NOT belong in the synthesis

Read this with `references/synthesis-summary.md` before composing the stage-2 scoping synthesis. It holds the rules that decide which items survive, how much each says, and how revisions are handled.

---

## Call-out tests (shared)

### The keep test for each call-out

Before keeping a candidate call-out from the internal draft, run the **affirmability test**: would the user need to look at code to evaluate this? If yes, it is plan-body content — cut. If no, apply the keep test — one of the following must be true:

- **Real fork**: another reasonable agent might choose differently on this dimension (extend pattern X vs. introduce abstraction Y; scan source A vs. source B; etc.)
- **Non-obvious behavioral choice**: a default the agent picked that the user would not see by reading the summary alone, but that materially affects what the plan does (e.g., "scans the working-dir snapshot before the copy step" — the user would not infer the scan target from a description of the gate's purpose)
- **Non-obvious exclusion**: an item was deliberately excluded that the user might want to add back in
- **Cheap-now-expensive-later correction**: a bet the user is well-placed to redirect now that would be expensive to undo after research or plan-write

Cut anything else, including:

- Mechanical items where there is no real alternative (e.g., "no new dependencies" when the work clearly does not need any)
- Implementation choices that will be settled during the work (e.g., regex precision tuned during impl)
- Items already implied by the summary

### The detail test (per call-out and per summary bullet)

After the keep test, every surviving item runs the **detail test**: 1-2 lines max, conversational not documentary. A call-out or summary bullet that runs to 4+ lines of dense prose is naming an implementation consequence rather than a decision — re-cut at higher abstraction.

The keep test addresses *which* items survive. The detail test addresses *how much* each surviving item says. Without it, the count cap is gameable: an agent can hit "3 call-outs" while each call-out is a 6-line paragraph, and the synthesis reads as a doc preview instead of a checkpoint.

### How many call-outs are right?

The cap is heuristic, not law. The real discipline is the keep test on each candidate. Typical bounds by plan depth:

| Plan depth | Typical | Cap |
|---|---|---|
| Lightweight | 0-2 | 3 |
| Standard | 1-3 | 4 |
| Deep | 2-5 | 6 |

**If the stage-2 pass exceeds the tier cap, OR any call-out or summary bullet runs to 4+ lines of dense prose, the synthesis is misshapen — do not raise the cap or accept the bloat, re-cut at a higher level of abstraction.** Almost always, 2-3 of those call-outs are sub-decisions of one larger fork (file path, flag name, JSON key behavior, and dependency choice are usually four facets of one "how to extend the existing scaffold" decision, not four independent forks). Collapse related call-outs into a single decision named at the level the user actually weighs in on. The user's job is to redirect forks, not to validate every implementation consequence of a fork they have already implicitly agreed to by accepting the higher-level decision.

A useful test: read the call-outs aloud. If two or more sound like "and also" extensions of the same idea, they belong as one.

### Anti-patterns in call-outs

Each anti-pattern below produces a call-out that fails the affirmability test. If a candidate call-out matches one of these, it is plan-body content — cut, do not rephrase.

- Names a file path or module name (`internal/artifacts/pii.go`)
- Names a flag, env var, or exact env value (`--accept-redaction-list=<finding-id,...>`)
- Specifies a JSON shape, response format, or exact data structure
- Names HTTP status codes, event names, or exact error wording
- Describes implementation flow ("first X, then Y, then Z")
- Names exact method signatures, call graphs, or SQL syntax
- States a mechanical choice with no real alternative ("uses stdlib regexp")

The line-number, signature, and code-spec rules are not new — they have always been forbidden in Inferred bullets. They apply equally to call-outs, which are now the user-facing surface.

---

## Synthesis structural discipline (shared)

Both variants share these structural rules. They address failure modes where the synthesis becomes a Phase 5.2 (plan-write) preview instead of a scope checkpoint.

**Summary leads, call-outs follow** — not the reverse, and no separate framing block above. Putting extensive content ABOVE the synthesis (an approach pitch, files-touched bullets, rationale block) inverts the structure: the synthesis becomes a footnote to the proposal instead of the proposal being a tier-budgeted summary the call-outs depend on.

**Anti-pattern: synthesis as plan-pitch.** Plan-body content — file paths, code shapes, sentinel strings, exact error messages, "Recommendation" / "Behavior when X" / "Why this shape" rationale — does not belong in chat output regardless of where it appears: not in a block above the call-outs, not inside the summary, and not nested in a call-out's commentary or sub-bullets. The position rule and the content rule are independent: a structurally-legal placement (inside a call-out bullet) does not legitimize plan-body content. If you find yourself writing it anywhere, stop. That content is Phase 5.2 (plan-write) territory — it belongs in the plan body the next phase will write, not in the synthesis presentation. The synthesis is a scope/decisions checkpoint: a tier-budgeted summary plus call-outs bounded by the tiered cap (see "How many call-outs are right?"). Implementation detail leaking into the synthesis (anywhere) is a sign Phases 1-4 (research and structuring) and Phase 5.2 (plan-write) have collapsed into the synthesis-confirmation step.

**Anti-pattern: numerical attestation.** "All nine requirements covered," "all three flows in scope," "five acceptance examples addressed," counts of files or test scenarios. These are the agent showing its work or attesting completeness, not naming scope decisions. "Covers the full brainstorm scope" already conveys the claim; the count adds nothing the user can affirm or redirect. Cut the numbers; keep the scope claim.

**A revision is not a confirmation.** After any user revision (even a trivially-understood swap), integrate the change, re-present the revised stage 2 with the change reflected, and wait for explicit confirmation before writing the plan. The loop is:

1. Present stage 2 → user responds
2. User confirms → write the plan
3. User revises → integrate, re-present revised stage 2, return to step 1

Plan-write (Phase 5.2) fires only on explicit confirm or after the soft-cut blocking question's "proceed" option. Never write immediately after a revision, even when the revision is small enough that the agent feels it understood — the confirmation step is what makes the synthesis **confirmed** rather than "agent's last proposal."

---

## Granularity: name the decision; don't expand it (shared)

Each call-out should be affirmable or rejectable by the user **without reading code**. Name the decision at the granularity that lets the user say "yes" or "I want X instead." Anything more specific is plan-body content — Phase 5.2's job, not synthesis's.

**Allowed** (when these ARE the decisions being made):
- File / module names — "skip filter in the matcher" when "where to put it" is the choice
- Pattern names — "extends the existing event-skip pattern" when "extend vs. introduce" is the choice
- Column / table names — "user-TZ" or "destination-calendar TZ" when "which source" is the choice
- Approach posture — "DB-side query with Google-side fallback" when "which strategy" is the choice

**Not allowed** (always plan-body, regardless of variant):
- Line numbers (`route.ts:249-255`)
- Exact method signatures, call graphs, or implementation flow ("at the top, before include/exclude evaluation, returning ...")
- Exact JSON / response shapes (`{pause, cleanup: {eventsDeleted, eventsFailed, errors}}`)
- HTTP status codes (`409`, `404`, `403`)
- Exact event / activity-log / type names (`userPauseSet/userPauseEdited/...`)
- Exact wording of error messages or UI labels
- SQL syntax or query bodies

The line is drawn slightly differently per variant. **Solo** stays at the higher level — brainstorm's WHAT hasn't been validated yet, so file/module names are usually too specific; talk in terms of "the rule entity," not "syncRules table." **Brainstorm-sourced** allows the file / module / pattern / column level when those ARE plan-time decisions, but not implementation flow specifics.

### Bad-vs-good examples

| Plan-body in call-out (wrong) | Decision-level (right) |
|---|---|
| Timezone source: `users.timezone` (IANA), fallback to destination calendar TZ if null. Research found `useTimezoneSync` and `ProtectionStatsCalculator` establish the pattern. | Timezone source: user-TZ (reverses brainstorm's tentative lean — research found established infra and pattern precedent) |
| Skip filter goes in `RuleMatcher.eventMatchesRule` at the top, before include/exclude evaluation, using the existing `filteredReason` mechanism. | Skip filter extends the existing event-skip pattern in the matcher (vs. introducing a new mechanism) |
| Reactivation guard: explicit safety in `[ruleId]/route.ts` PATCH — when `isActive: false → true`, the existing handler clears `status/pausedAt/pausedReason`. | Reactivation guard: pause window state preserved through the isActive toggle's existing system-pause-clearing path |
| Partial cleanup failure response: `{pause, cleanup: {eventsDeleted, eventsFailed, errors}}`; pause window persists regardless of cleanup outcome. | Partial cleanup failure: pause window persists; partial-failure response mirrors the existing rule-edit precedent |

The test: a scanner reading a call-out should affirm or reject it without needing to read code. If they would have to look up a column name, method name, or call graph to evaluate the call-out, the granularity is wrong — that's plan-body content.

### Worked example: compression from internal draft to call-outs

For a PII redaction gate proposal where the internal draft had 4 Stated items, 7 Inferred items, and 3 Out-of-scope items, the compressed stage 2 looks like:

```
Planning a mechanical PII redaction gate before promote (the unguarded leak path from the amazon-orders retro) and alongside the existing vendor-prefix scanner at publish. Phase-1 detectors are shape-only — card last-4, postal address, JSON person names. Default halts; per-finding ack via flag.

**Call outs:**
- Person-name filter works by JSON key (allowlist of attribution keys: `printer`, `printer_name`, `owner_name`, `author`), not by name value.
- Promote scans the working-dir snapshot before the copy step, not the staged copy.
- Publish combines PII + vendor-prefix findings into one report, not fail-fast on first.

Confirm and I'll write the plan next, drawing on research and this scope.
```

What got cut from the internal draft and why:

- "Module name: `internal/artifacts/pii.go`" — plan-body content (file path), fails affirmability test
- "Flag name: `--accept-redaction-list=<finding-id,...>`" — plan-body content (exact flag string), fails affirmability test
- "No new dependencies — stdlib regexp + filepath.WalkDir only" — mechanical, no real alternative
- "Detector regex precision tuned during implementation" — deferred-impl, not a plan-time fork
- All three Out-of-scope items — either restated in prose ("defer to #960") or implicitly excluded by scope

What survived: three real forks where another reasonable agent might choose differently and the user can correct cheaply now. Each is affirmable in one sentence without reading code.

---

## Soft-cut on circularity (shared)

Track which call-outs the user touched per round. The soft-cut blocking question fires **only when the same call-out is revised twice** (or a third-round revision targets a call-out already revised in round two). New-call-out revisions across rounds proceed without limit.

**Identity across rounds is by decision dimension, not surface wording.** A revision may cause stage 2 to re-derive — the same underlying fork can come back rephrased, merged with another call-out, or split into two. "Same call-out" means the same decision being made (e.g., "where does the scan run" stays one decision whether it's worded as "promote scans the working-dir snapshot" or "scan target: pre-copy working dir"). When a re-cut collapses multiple prior call-outs into one, the new combined call-out inherits the "touched" status of any of its constituents — soft-cut fires if any of those underlying decisions was already revised once before.

When the soft-cut fires, use the platform's blocking question tool with two options:

- `Proceed and continue to plan-write`
- `Hold off — keep discussing before continuing`

Fall back to numbered list in chat only when no blocking tool exists or the call errors. Never silently skip.

---

## Self-redirect (shared)

If the user response indicates they're in the wrong skill or want a different workflow:

- **Solo variant**: common redirects include "this is bigger than I thought — let me brainstorm first" (suggest `ce-brainstorm`), "this is just a fix, no plan needed" (suggest `ce-work`), or "I need to investigate first" (suggest `ce-debug`).
- **Brainstorm-sourced variant**: less common, but possible — "actually this scope is wrong, take it back to brainstorm" (suggest `ce-brainstorm` to revise the upstream doc).

In either case: stop ce-plan, suggest the alternative skill, offer to load it in-session. Don't push back or argue — the user's redirect signal is the deliberate choice.

---

## What does NOT belong in the synthesis

- Implementation code (no imports, exact method signatures, framework-specific syntax, JSON shapes, exact error message wording) — in chat output OR in the internal draft
- Re-statement of the entire brainstorm doc — the synthesis is plan-perspective, not a copy
- Defensive what-ifs and hedges — if a concern is real, state it as Inferred (internal); if speculation, drop it
- The internal three-bucket draft pasted into chat as a verbatim user-facing artifact — that was the old shape and the volume problem it produced is why stage 2 exists. Compose internally, derive call-outs, present compressed
- Open questions surfaced outside the buckets/call-outs — by synthesis time, every scope-shaping question must be in **Stated** (internal — asked and answered earlier), **Inferred** (internal — agent's bet for correction, surfaces as a call-out if it survives the keep test), or **Out** (internal — deliberately excluded). There is no fourth status
- Floating questions adjacent to stage 2 — if a question genuinely cannot be defaulted, pause synthesis and resolve it before presenting. Pick the question shape that matches: a blocking multiple-choice tool when options are bounded and meaningfully distinct, prose when option sets would bias the answer. Integrate the answer, then present stage 2. Never present stage 2 with adjacent floating questions — that gives the user no clear resolution path
