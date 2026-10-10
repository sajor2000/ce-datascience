# Synthesis Summary

## Contents

- Stage 1: internal three-bucket draft
- Stage 2: the chat-time scoping synthesis
- Prompt templates
- Re-present after revision; write only on confirm
- Soft-cut on circularity (not iteration count)
- Self-redirect
- Doc shape after confirmation

**Synthesis ≠ requirements doc.** The synthesis is NOT a preview, draft, or substitute for the requirements doc — it's the scope checkpoint that doc-write consumes as input. The requirements doc itself is written in Phase 3 from the confirmed synthesis. Both the synthesis and the requirements doc stay scope-only — implementation detail (file paths, code shapes, exact error wording) is downstream (ce-plan's job), not the requirements doc.

**Two-stage shape: internal draft, then chat-time scoping synthesis.** The synthesis is composed in two stages. Stage 1 is an internal three-bucket draft (Stated / Inferred / Out of scope) the agent uses to think comprehensively about scope. Stage 2 is the scoping synthesis presented to the user — shaped like what two product collaborators would confirm before writing a PRD, not like a comprehensive audit and not like a one-line preview. The user only sees stage 2. The internal draft still informs the doc body via the doc-shape routing below; it just doesn't reach the user verbatim. This split exists because the comprehensive audit shape produced too much detail for the user to actually weigh in on, even when the granularity rules were followed.

**Three-bucket structure is the internal draft, not the user-facing artifact.** It does its scope-thinking job during stage 1 and dissolves when Phase 3 writes the doc: Stated content informs Requirements, Inferred content informs Key Decisions, Out-of-scope content informs Scope Boundaries. The doc has no parallel `## Synthesis` section — only the scoping synthesis prose embeds, as `## Summary`. See "Doc shape after confirmation" below for the routing.

This content is loaded when Phase 2.9 fires — after Phase 2 (approaches chosen) and before Phase 3 (write requirements doc). The synthesis is the user's last opportunity to correct the agent's interpretation before the doc lands. It serves two purposes: synthesis confirmation (the user agreed to many individual things in dialogue but never saw the whole) and a transition checkpoint ("about to write a doc").

Fires for **all tiers** including Lightweight. Skip Phase 2.9 entirely on the Phase 0.1b non-software (universal-brainstorming) route. The skill is interactive by design — brainstorming requires dialogue with a synchronous user. There is no non-interactive mode; if an automated workflow needs a requirements doc without dialogue, the right move is to write the doc from context directly, not to load the `ce-brainstorm` skill.

---

## Stage 1: internal three-bucket draft

The internal draft is structured in three labeled buckets. Items may appear in two buckets when meaningfully both — flag the inclusion-then-exclusion as Inferred so the reasoning is captured.

- **Stated** — what the user said directly (in the original prompt, prior conversation, dialogue answers, approach selection in Phase 2). Items here have explicit user-language anchors.
- **Inferred** — what the agent assumed to fill gaps. Scope boundaries the user never explicitly named, success criteria extrapolated from intent, technical assumptions made because the brief interview didn't probe them. The Inferred bucket is the most actionable surface for correction — items here are the agent's bets.
- **Out of scope** — deliberately excluded items. Adjacent work the agent considered but decided not to include, refactors, nice-to-haves, future-work items. Making exclusions explicit lets the agent spot anything that should actually be included.

This draft is internal. Do not paste it verbatim into chat. Compose it as a thinking step, then derive stage 2 from it.

---

## Stage 2: the chat-time scoping synthesis

The scoping synthesis is what the user actually sees. It reflects the dialogue's substance back so the user can pattern-match — long enough to serve a multi-turn conversation, short enough to be high-impact only. The reference shape is what two product collaborators would say to each other after a real discussion: "OK, so we're doing X, with Y trade-off, deferring Z, and one thing I want to double-check is W. Sound right?"

The scoping synthesis has up to four named sections, each **render-conditional** on having something to say. Empty sections are omitted, not padded.

1. **What we're building** (always present) — 1–3 sentences. The shape that emerged from dialogue, forward-looking, plain words. Not a transcript of "you said X."
2. **Key trade-offs** (conditional) — 1–3 bullets, each with a brief why. Render only when real trade-offs were made in dialogue.
3. **What's not in scope** (conditional) — 1–3 bullets, or fold into a single sentence. Render only when deferred items would surprise a downstream reader if absent.
4. **Call outs** (conditional) — 0–3 bullets. Residual forks the dialogue didn't resolve: post-dialogue consequences (combining user answers surfaced something they couldn't see during Q&A), silent agent inferences, or — in pre-loaded contexts with no dialogue — scope bets the user is seeing for the first time. **Not "questions the agent could have asked during Phase 1.3 but didn't"** — if a call-out reads like a missed dialogue question, Phase 1.3's integration check failed; flag the gap rather than padding the section.

Each section answers a different question:

- **What's being built?** → shape
- **What did we trade off?** → explicit choices made in conversation
- **What did we cut?** → deferred items a reader would expect to see acknowledged
- **Where might you redirect?** → residual forks: post-dialogue consequences, silent inferences, late-cycle bets

Then the confirmation: *"Confirm and I'll write the requirements doc next, drawing on our dialogue and this synthesis. Or tell me what to change."* The phrasing sets the expectation that confirm → doc-write, so the user knows what's about to happen and can interrupt without ambiguity.

### Path A vs Path B: the gate that fires the confirmation question

Phase 2.9 has two presentation modes, gated by **two signals**: (1) did any blocking question fire before Phase 2.9? AND (2) what tier did Phase 0.3 classify the scope as? Blocking questions include Phase 0.3 scope disambiguation, Phase 1.3 collaborative dialogue probes, and Phase 2 approach selection (when a menu fires). Internal classification, Phase 1.1 scan, and Phase 1.2 pressure test are not blocking questions — they don't count.

- **Path A — no blocking questions fired AND tier is Lightweight**: announce-mode. Emit "What we're building" prose only (no other sections, no confirmation question), then proceed to Phase 3 doc-write in the same turn. Do NOT end the turn waiting for acknowledgment. The user can revise after the doc lands if the shape is wrong — Lightweight Path A docs are short, post-hoc revision is cheap.
- **Path B — at least one blocking question fired, OR tier is Standard / Deep-analysis / Deep-program**: full tier-aware scoping synthesis with confirmation gate. Two scenarios fire Path B: (a) the user invested answer-time during dialogue, or (b) the user pre-loaded substantive scope content (Phase 0.2 fast-path with a richly-specified opening prompt). Either way, the substance earns a real checkpoint. The confirmation question is unconditional even when zero call-outs survive the keep test.

**Why the tier guard exists.** Phase 0.2's fast path is designed for two very different cases — a tight one-line prompt that needs no dialogue ("fix the typo on line 47"), and a richly pre-loaded brainstorm context that ALSO needs no dialogue because the user pre-stated everything (e.g., handing off accumulated decisions from a prior session for a brainstorm doc backfill). Without a tier guard, both route to Path A, and the richly-loaded case gets a 1-sentence checkpoint for what may be 20+ items worth of scope. Tier-classifying Phase 0.3 distinguishes these cases — pre-loaded substance makes the tier Standard or Deep, which then routes to Path B and produces the full scoping synthesis the substance deserves. Do not simplify the gate back to a single "no questions fired" signal — that was a real defect that produced one-sentence syntheses on Deep-tier pre-loads.

Path A maps to the existing "announce-mode" concept on the Phase 0.2 fast path, but only when the substance genuinely warrants 1–3 sentences. Path B is the default for every other interactive invocation.

The per-section keep tests, total bullet budget, detail level, anti-patterns, and the pre-flight re-review live in `references/synthesis-discipline.md`. Read it before composing the scoping synthesis.

---

## Prompt templates

This is directional guidance — adjust phrasing to fit dialogue context. Open-ended feedback per Interaction Rule 5(b) (an option menu would unintentionally influence the user toward the parts the menu lists, away from anything else they might want to change).

**Prose discipline for "What we're building" (required):** forward-looking (what *will* be in the doc), not retrospective (what's been discussed). Lead with the actual thing being built in plain words. No qualifiers ("comprehensive," "thoughtful," "substantive"). No re-stating dialogue context the user just lived through. If the work can't be said in 1–3 sentences without filler, the synthesis isn't ready yet.

### Path B template (questions were asked)

```
Based on our dialogue, here's the scope I'm proposing for the requirements doc:

**What we're building:** [1–3 sentences — the shape that emerged from dialogue, forward-looking, plain words]

**Key trade-offs:** [render only when real trade-offs exist]
- [explicit choice + brief why]
- [explicit choice + brief why]

**What's not in scope:** [render only when deferred items would surprise a reader]
- [deferred item]
- [deferred item]

**Call outs:** [render only when one or more survived the keep test]
- [scope-level fork or non-obvious consequence the user can affirm or redirect]
- [same]

Confirm and I'll write the requirements doc next, drawing on our dialogue and this synthesis. Or tell me what to change — even something I captured correctly earlier is fair game to revise (you may have changed your mind or want to correct an unstated assumption).
```

### Path A template (no questions were asked — typically Phase 0.2 short-circuit)

```
Proposing: [1–3 line shape — what the doc will say in plain words].

No open decisions — writing the requirements doc now. Interrupt if the shape is wrong.
```

Proceed to Phase 3 doc-write in the same turn — do NOT end the turn waiting for an acknowledgment. The "interrupt if wrong" affordance means the user can revise after the doc lands, not before. Lightweight Path A docs are short, so post-hoc revision is cheap.

Ask the user open-ended on Path B (no blocking-question menu). The justification is Interaction Rule 5(b) in SKILL.md — an option menu would unintentionally influence the user's feedback toward the parts the menu lists.

### Worked example: compression from internal draft to scoping synthesis (Standard tier)

For a notification-mute feature where the internal draft had 5 Stated items, 4 Inferred items, and 3 Out-of-scope items, the compressed Stage 2 looks like:

```
Based on our dialogue, here's the scope I'm proposing for the requirements doc:

**What we're building:** Per-channel mute on notification rules, with a 24h preset for the support team's 3 AM ping problem. Mute lives on the rule itself and survives rule edits.

**Key trade-offs:**
- Per-channel over per-user — support team isn't a single user
- Mute on the rule, not a separate entity — pause state survives edits

**What's not in scope:**
- Presence-based mute and quiet-hours schedules — deferred for later
- Cross-rule mute groups — would force a rule-grouping concept we don't have

**Call outs:**
- Rule-delete silently loses pause state — confirm no warning needed

Confirm and I'll write the requirements doc next, drawing on our dialogue and this synthesis. Or tell me what to change.
```

What got cut from the 12-item internal draft and why:

- Stated items already covered by the "What we're building" prose dissolved silently
- "Use existing rule entity" — mechanical, no real trade-off
- "Use Postgres for persistence" — implementation detail (ce-plan's job), failed granularity rules
- One Out-of-scope item ("no rate limiting") — mechanical exclude, no reader would ask about it
- Three Inferred items rolled into the Trade-offs section as the explicit choices behind them

What survived: a scoping synthesis with substance proportional to the dialogue, bounded at the Standard ceiling of 5 bullets across the three conditional sections — any more would have triggered a re-cut at higher abstraction.

---

## Re-present after revision; write only on confirm

A revision is not a confirmation. After any user revision (even a trivially-understood swap like "move deferred item X back into scope"), integrate the change, re-present the revised scoping synthesis with the change reflected, and wait for explicit confirmation before writing the doc. The loop is:

1. Present scoping synthesis → user responds
2. User confirms → write the doc
3. User revises → integrate, re-present revised scoping synthesis, return to step 1

Doc-write fires only on explicit confirm or after the soft-cut blocking question's "proceed" option (see below). The confirmation step is what makes the scoping synthesis **confirmed** rather than "agent's last proposal" — never write immediately after a revision, even when the revision is small enough that the agent feels it understood.

---

## Soft-cut on circularity (not iteration count)

Track which scoping synthesis items the user touched per round. The soft-cut blocking question fires **only when the same item is revised twice** (or a third-round revision targets an item already revised in round two). New-item revisions across rounds proceed without limit — revising different aspects of a wrong scoping synthesis is exactly what the mechanism should support.

**Identity across rounds is by decision dimension, not surface wording or section.** A revision may cause stage 2 to re-derive — the same underlying decision can come back rephrased, merged with another bullet, or moved to a different section (e.g., what was a Trade-off in round one becomes a Call-out in round two after the user pushed back). "Same item" means the same underlying decision regardless of which section currently holds it. When a re-cut collapses multiple prior bullets into one, the new combined bullet inherits the "touched" status of any of its constituents — soft-cut fires if any underlying decision was already revised once before.

When the soft-cut fires, use the current harness's blocking question UI with two options:

- `Proceed and write the requirements doc`
- `Hold off — keep discussing before the doc`

Fall back to a numbered list in chat only when no blocking tool exists or the call errors. Never silently skip.

---

## Self-redirect

If the user response indicates they're in the wrong skill or want a different workflow (e.g., "this is too small, just `ce-work` it" or "this needs more thought, let me brainstorm differently"):

- Stop ce-brainstorm
- Suggest the alternative skill the user appears to want (e.g., `ce-work`, `ce-debug`)
- Offer to load it in-session
- Do not push back or argue — the user's redirect signal is the deliberate choice

This support exists because the scoping synthesis is an honest checkpoint. If the user discovers the skill choice was wrong by reading the scoping synthesis, redirecting is the right move.

---

## Doc shape after confirmation

After user confirmation (or after the soft-cut decision proceeds), Phase 3 writes the requirements doc. The internal draft does NOT carry into the doc as a `## Synthesis` section. Only the "What we're building" prose embeds, as `## Summary` at the top. Internal-draft content dissolves into the doc's body sections:

| Internal-draft element | Where it goes in the doc |
|---|---|
| "What we're building" prose | `## Summary` (1–3 lines, forward-looking, what's proposed) |
| Stated bullets | `## Requirements` (numbered R-IDs, full detail) and where relevant `## Problem Frame` for narrative context |
| Inferred bullets | `## Key Decisions` (with rationale) — bets the user accepted in dialogue become decisions in the doc. |
| Out-of-scope bullets | `## Scope Boundaries` |

The chat-time Trade-offs section dissolves into `## Key Decisions` (the explicit choices acknowledged in chat become documented decisions). The chat-time What's-not-in-scope section dissolves into `## Scope Boundaries`.

No italic capture-context note (e.g., "Captured at Phase 2.9..."). It would leak engineering process into an artifact whose readers do not need that signal.

The doc's `## Summary` and `## Problem Frame` must serve distinct purposes — see `references/brainstorm-sections.md` "Discipline: Summary vs Problem Frame" for the rules.
