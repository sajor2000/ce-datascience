# Scoping Synthesis

## Contents

- Stage 1: internal three-bucket draft (shared)
- Stage 2: chat-time scoping synthesis
- When to skip the blocking confirmation
- Solo variant
- Brainstorm-sourced variant
- Headless mode (shared)
- Doc shape after confirmation

**Scoping synthesis ≠ plan doc.** The scoping synthesis is the scope/decisions checkpoint that plan-write (Phase 5.2) consumes as input. It surfaces decisions the agent CAN make at synthesis time: scope-level (does this plan cover the full brainstorm or narrow to a subset?), posture (extend existing pattern vs. introduce new abstraction), test approach. It does NOT surface decisions plan-write produces: PR count, commit/branch sequencing, effort or time estimates, Implementation Unit lists, exact file paths, test command recipes. If the synthesis claims any of those, it has leaked plan-write thinking and must be re-cut to scope-decisions only. Even when the agent has formed plan-write opinions earlier in the session, the synthesis stays at scope altitude — the user is being asked to affirm scope, not to rubber-stamp implementation.

**Two-stage shape: internal draft, then chat-time synthesis.** The synthesis is composed in two stages. Stage 1 is an internal three-bucket draft (Stated / Inferred / Out of scope) the agent uses to think comprehensively about scope. Stage 2 is the compressed chat-time output: a tier-shaped summary plus "Call outs" (zero or more, capped by plan depth — see the cap table under "How many call-outs are right?" in `references/synthesis-discipline.md`) — the specific forks where the user might redirect. The user only sees stage 2. The internal draft still informs the plan body via the doc-shape routing below; it just doesn't reach the user verbatim. This split exists because the comprehensive audit shape produced too much detail for the user to weigh in on, even when the granularity rules were followed.

**Three-bucket structure is the internal draft, not the user-facing artifact.** It does its scope-thinking job during stage 1 and dissolves when Phase 5.2 writes the plan: Stated content informs Requirements, Inferred content informs Key Technical Decisions / Implementation Units (interactive mode) or `## Assumptions` (non-interactive mode), Out-of-scope content informs Scope Boundaries. The plan has no parallel `## Synthesis` section — only the stage-2 summary embeds, as `## Summary`. See "Doc shape after confirmation" below for the routing.

This content is loaded at Phase 5.0, after research and structuring (Phases 1-4) and before the Phase 5.1 pre-write review and Phase 5.2 plan-write. There are two variants — they share structure and timing but differ in content focus:

- **Solo variant** (no upstream brainstorm): full breadth — problem frame, intended behavior, success criteria, in/out scope.
- **Brainstorm-sourced variant**: focuses on plan-time decisions (which files/modules to touch, which patterns extended vs. introduced new, test scope, refactor scope). Brainstorm-validated WHAT is assumed and not re-stated.

Both variants share the two-stage shape, the keep test for call-outs, soft-cut behavior, and the doc-shape routing. In non-interactive (headless) mode, both compose the internal draft and skip stage 2 — the user-facing compression is moot when there is no synchronous user. The internal draft dissolves into the plan body the same way, with Inferred bets routing to a `## Assumptions` section. See "Headless mode (shared)" below for the full routing.

---

## Stage 1: internal three-bucket draft (shared)

The internal draft is structured in three labeled buckets. Items may appear in two buckets when meaningfully both — flag the inclusion-then-exclusion as Inferred so the reasoning is captured.

- **Stated** — what the user said directly (in the original prompt, prior conversation, dialogue answers, or the upstream brainstorm doc when present). Items here have explicit user-language anchors.
- **Inferred** — what the agent assumed to fill gaps. Scope boundaries the user never explicitly named, success criteria extrapolated from intent, technical assumptions made because the brief interview didn't probe them. The Inferred list is the most actionable bucket — items here are the agent's bets that the user can correct.
- **Out of scope** — deliberately excluded items. Adjacent work the agent considered but decided not to include, refactors, nice-to-haves, future-work items.

This draft is internal. Do not paste it verbatim into chat. Compose it as a thinking step, then derive stage 2 from it.

---

## Stage 2: chat-time scoping synthesis

Stage 2 is what the user actually sees. The shape differs between variants because they serve different purposes — brainstorm-sourced plans inherit a validated WHAT and surface plan-specific HOW; solo plans have no upstream and the synthesis is the WHAT.

### Brainstorm-sourced shape

Two content sections plus call-outs:

1. **Brainstorm-scope restatement** (1-2 sentences, prose). Restates the brainstorm's scope as orientation. The user wrote this content, but the synthesis may be read days later or in parallel with other plans — the restatement is the topic anchor that says "this is the artifact we're planning against." Stay in the brainstorm's own vocabulary. Do NOT enumerate Implementation Units, restate constraints back at the user, or list acceptance examples.

2. **Plan-specific scoping decisions** (prose, or bullets when multi-faceted). Scope-level commitments the agent made that the brainstorm did not: does this plan cover the full brainstorm scope or narrow to a subset; are adjacent refactors pulled in or held out; what test scope at scenario level (which sites, which acceptance examples). Each item must pass the **affirmability test** — the user can affirm or redirect it without reading code. This section is scope claims at affirm-or-redirect level, NOT a description of where the implementation reaches, NOT PR count or commit sequencing, NOT Implementation Unit lists, NOT exact file paths or test commands — those are all plan-write outputs the synthesis cannot honestly claim. If the plan covers the full brainstorm scope with no narrowing, expansions, or adjacent work, this section stays short ("This plan covers the full brainstorm scope; test scope is X").

3. **Call outs** (zero or more, capped by plan depth — see "How many call-outs are right?" in `references/synthesis-discipline.md`). Each a real fork where the user's input materially changes the plan. Omit the "Call outs:" header entirely when zero forks survived the keep test.

### Solo shape

No upstream document; the synthesis itself is the scope claim:

1. **Scope claim** (prose, or bullets when multi-faceted). What the agent is planning to build, at affirm-or-redirect level — names what's in and what's out. NOT an enumeration of Implementation Units the plan will contain.

2. **Call outs** (zero or more, capped by plan depth). Same as brainstorm-sourced.

### Shape budgets

Tier-aware budgets are **ceilings, not targets**. Less is correct when there isn't more to say — filling the budget produces noise.

| Plan depth | Restatement (brainstorm-sourced) | Plan-specific scoping (brainstorm-sourced) / Scope claim (solo) |
|---|---|---|
| Lightweight | 1 sentence | 1-3 lines prose |
| Standard | 1-2 sentences | up to 3-5 lines or 2-4 bullets |
| Deep | 1-2 sentences | up to 4-6 lines or 3-6 bullets |

Form within each section (prose, bullets, mix) follows whatever communicates best.

### Shared rules

- **No "Stated" bucket in chat** (the orientation or scope-claim covers it).
- **No "Out of scope" bucket as a separate list** — fold a non-obvious exclusion into a call-out when it survives the keep test, otherwise drop it.
- **Source-document vocabulary.** When a brainstorm exists, use its terms. Don't invent agent-coded shorthand (e.g., "skill-instruction shape", "hooks engine selection at Step 2a entry"). When referencing acceptance examples, requirements, or flows, name them in plain terms ("the install-prompt acceptance case") — never use bare IDs.

- **Pre-emit mechanical checks.** Before emitting the synthesis, scan the output:
  - **Bare ID references** (`AE\d+`, `R\d+`, `F\d+`, `A\d+`, `U\d+`) → replace with plain names. Mixed forms (case named AND ID cited) still violate the rule because the ID adds noise without information.
  - **File paths** (`path/like.md`, `path/like.py`, `internal/cli/...`, `skills/.../...`, etc.) → cut unless the path IS the topic of an explicit fork in the call-outs. Allowed: "cleanup hook in the existing archive step vs. a new dedicated phase" (where the path is implicit in the decision). Forbidden: paths listed to demonstrate completeness, preview Implementation Units, or describe where the implementation reaches. The synthesis names *what* the plan targets, not *where* the code lives.

The keep test, detail test, call-out caps, and call-out anti-patterns live in `references/synthesis-discipline.md`, along with the structural discipline, granularity rules, soft-cut, self-redirect, and exclusions. Read it before composing stage 2.

---

## When to skip the blocking confirmation

The auto-proceed path (announce without waiting for user confirmation) fires only when **plan depth is Lightweight AND zero call-outs survive the keep test**. For Standard or Deep plans, always fire the confirmation gate even when zero call-outs survive — substance earns the checkpoint, not interaction history. A Deep plan with rich silent decisions and a 1-3 line summary is exactly the case where rubber-stamping is most likely; the explicit confirmation request gives the user a real chance to push back before plan-write proceeds.

When auto-proceed applies (Lightweight + zero call-outs), emit a one-line announcement and continue:

```
Planning: [1-3 line summary]

No open decisions to weigh in on — proceeding to plan-write. Interrupt if I have the scope wrong.
```

The announcement is mandatory when skipping — silent proceeding is not allowed. The "why" (no forks worth flagging) must be visible.

For Standard/Deep with zero call-outs, the confirmation template still fires; the "Call outs:" header is simply omitted. The user gets the summary plus the explicit confirmation request.

---

## Solo variant

Fires only when:
- Phase 0.2 found no upstream brainstorm doc
- AND Phase 0.4 stayed in ce-plan (did not route to ce-debug, ce-work, or universal-planning)
- AND Phase 0.5 cleared (no unresolved blockers)
- AND not on Phase 0.1 fast paths (resume normal, deepen-intent)

The solo variant does NOT fire on resume/deepen, route-out, or brainstorm-sourced paths.

**Content focus**: full-breadth internal draft. Phase 0.4 bootstrap is brief by design ("ask one or two clarifying questions"), so the agent has made substantial inferences before the synthesis fires. The Inferred bucket in the internal draft is especially load-bearing here — the agent's bets are widest. Stage 2 compression still applies: most of those inferences will not survive the keep test, and that is correct — the user should only see the forks they can meaningfully redirect.

**Counter-warning for rich-context invocations.** When the inference source is *not* just Phase 0.4 bootstrap — e.g., a prior in-conversation validation agent, completed sibling work units earlier in the same session, or a planning artifact already in the conversation — the temptation is to dump that material into call-outs verbatim. The granularity rules tighten in this case, not loosen: the agent has more material to compress, not more material to expose. A bet that's already been validated upstream is **Stated** (internal), not Inferred (internal); a bet whose specifics belong in plan-body is named at decision-level in the call-out regardless of how much detail upstream context provided. If recent turns produced detailed code, file paths, or research artifacts, expect the internal draft to over-share and compress proactively before stage 2.

### Stage 2 template (solo)

**Summary discipline (required):** lead with the implementation-independent Objective, then name the proposed scope without repeating the Problem Frame. The summary's job is to help the user pattern-match against intent before reading call-outs — solo invocation has minimal pre-write dialogue, so the summary is especially load-bearing here. Form (prose, bullets, mix) and length follow the tier budget in "Stage 2: chat-time scoping synthesis" above; detail test applies per bullet.

**Anti-fluff guidance:** lead with the actual thing being planned in plain words. No qualifiers ("comprehensive," "thoughtful," "substantive"). No re-stating the user's prompt. If the scope cannot be said within the tier budget without filler, the synthesis isn't ready yet.

**Confirmation template (fires for Standard/Deep regardless of call-out count, or for any tier with one or more call-outs surviving):**

```
Based on your request and our brief discussion, here's the scope I'm proposing to plan against:

[Objective — the implementation-independent outcome]

[scope claim — what the plan will target, what it will not; affirm-or-redirect level; NOT an enumeration of Implementation Units]

**Call outs:** (omit this header when zero forks survived the keep test)
- [decision-level fork in 1-2 lines: name the choice and optional one-clause trade-off in parens. NO multi-sentence rationale, NO "my default is X" pitch — those belong in Key Technical Decisions in the plan body, not the synthesis]

Confirm and I'll write the plan next, drawing on research and this scope. (You can also redirect to `ce-brainstorm` if this is bigger than you initially thought — I'll stop here and load it for you.)
```

**Auto-proceed template (fires only for Lightweight with zero call-outs):**

```
Planning: [1-3 line scope claim]

No open decisions to weigh in on — proceeding to plan-write. Interrupt if I have the scope wrong.
```

Then continue to Phase 5.1 without waiting. Use prose for any user response that does arrive (no blocking-question menu), because an option menu would bias the response.

---

## Brainstorm-sourced variant

Fires only when:
- Phase 0.2 found upstream brainstorm doc (brainstorm-sourced invocation)
- AND not on Phase 0.1 fast paths

**Content focus**: plan-time decisions only. The brainstorm and its confirmed scoping synthesis already validated WHAT to build; the internal draft and stage 2 surface HOW the plan will execute that work — decisions the brainstorm did not make.

Items to surface in the internal draft:
- **Files/modules to touch (and not touch)** — what the implementation reaches into
- **Patterns extended vs. introduced new** — architectural decisions the agent made within confirmed scope (not a bias toward either direction)
- **Test scope** — which existing-but-untested code is in/out of test scope for this work
- **Refactor scope** — adjacent cleanup, if any, going to deferred items vs. active diff
- **Cross-cutting impact** — auth, migrations, shared types when they're touched

Most of these will not survive the keep test as separate call-outs. Surface only the forks where another reasonable agent might choose differently and the user can correct cheaply now.

**Reads from doc body, not a synthesis section**: brainstorm docs do not have a `## Synthesis` section (the synthesis is a chat-time artifact in ce-brainstorm; only the prose summary embeds, as `## Summary`). This variant derives plan-time decisions from the brainstorm doc's body sections — Summary, Problem Frame, Requirements, Key Decisions, Scope Boundaries — plus Phase 1 research. Older brainstorms that may have a legacy `## Synthesis` section work fine; that content is treated as supplementary, not authoritative, with the body sections taking precedence.

**Why pre-write, not pre-research**: brainstorm doc and its confirmed synthesis already validated WHAT, so research is well-targeted. Plan-time decisions emerge during research and structuring (Phases 1-4), so pre-write catches them at the latest cheap moment — before Phase 5.2 commits the plan to disk.

### Stage 2 template (brainstorm-sourced)

**Summary discipline (required):** state the implementation-independent Objective. Keep implementation shape, files, patterns, and other means in their owning sections. Form (prose, bullets, mix) and length follow the tier budget in "Stage 2: chat-time scoping synthesis" above; detail test applies per bullet.

**Anti-fluff guidance:** state the Objective in plain words, with no qualifiers, implementation shape, or repetition of the brainstorm's Problem Frame.

**Confirmation template (fires for Standard/Deep regardless of call-out count, or for any tier with one or more call-outs surviving):**

```
[Objective — the implementation-independent outcome]

The brainstorm scopes [1-2 sentence restatement of the brainstorm's scope as orientation; in the brainstorm's own vocabulary; NOT an enumeration of Implementation Units, constraints, or acceptance examples].

This plan [plan-specific scoping: what's covered vs. deferred vs. expanded relative to the brainstorm; test scope; any adjacent refactors pulled in or held out. Prose or bullets per substance].

**Call outs:** (omit this header when zero forks survived the keep test)
- [plan-time fork in 1-2 lines: name the choice and optional one-clause trade-off in parens. NO multi-sentence rationale, NO "my default is X" pitch — those belong in Key Technical Decisions in the plan body, not the synthesis]

Confirm and I'll write the plan next, drawing on the brainstorm, research, and this synthesis.
```

**Auto-proceed template (fires only for Lightweight with zero call-outs):**

```
Planning [brief brainstorm-scope restatement] — [plan-specific shape in one clause].

No open decisions to weigh in on — proceeding to plan-write. Interrupt if I have the scope wrong.
```

Then continue to Phase 5.1 without waiting. Use prose for any user response that does arrive, because an option menu would bias the response.

---

## Headless mode (shared)

When the skill is invoked from an automated workflow such as LFG or any `disable-model-invocation` context, the skill runs in non-interactive mode (no synchronous user). The artifact is read by downstream skills (ce-doc-review, ce-work) and human reviewers (PR review).

**Stage 2 is moot in headless mode.** Compose the internal draft (stage 1) as usual, but skip the chat-time compression — there is no synchronous user to confirm to, no call-outs to derive, no auto-proceed announcement. Route the internal draft directly into the plan body via the doc-shape table below.

**Timing:** both variants fire at Phase 5.0, after research and before plan-write. Compose the internal draft and proceed through Phase 5.1 to Phase 5.2 plan-write. Inferred content routes to `## Assumptions`.

**Shared behavior across both variants:**

- **No user prompt; no stage 2; no auto-proceed announcement.** All three are moot.
- **Route internal-draft content with mode-aware shape:**
  - **Stated** content → Requirements (user-stated constraints, traced to origin's R-IDs when present)
  - **Out-of-scope** content → Scope Boundaries
  - **Inferred** content → `## Assumptions` section in the plan — explicitly labeled as un-validated agent bets. Do NOT route Inferred items into Key Technical Decisions or Implementation Units; that would make un-validated bets indistinguishable from user-confirmed decisions.

The `## Assumptions` section appears in non-interactive plans only. Interactive plans don't need it (Inferred bets either get user-corrected via call-outs and become Key Technical Decisions, are revised away, or were judged not-fork material by the keep test and dissolved into Implementation Units silently).

This restores the audit visibility the original design intended (un-validated bets must not propagate as authoritative content), but surfaces them under their own label rather than hiding them. Downstream review (ce-doc-review, ce-work, human PR review) can scrutinize Assumptions specifically.

---

## Doc shape after confirmation

After user confirmation (or after the soft-cut decision proceeds), Phase 5.2 writes the plan doc. The internal draft does NOT carry into the plan as a `## Synthesis` section. Only the stage-2 summary embeds, as the plan template's `## Summary`. Internal-draft content dissolves into the plan's body sections:

| Internal-draft element | Where it goes in the plan |
|---|---|
| Summary (stage 2) | `## Summary` (1-3 lines prose, forward-looking) — the implementation-independent Objective only |
| Stated bullets | `## Requirements` (R-IDs) and where relevant `## Problem Frame` for narrative context |
| Inferred bullets | `## Key Technical Decisions` (with rationale) and Implementation Units when the bet drives a structural choice. In non-interactive mode, route to `## Assumptions` instead — see Headless mode above. |
| Out-of-scope bullets | `## Scope Boundaries` — including the `### Deferred to Follow-Up Work` subsection when relevant |

No italic capture-context note (e.g., "Captured at Phase 5.0..."). It would leak engineering process into an artifact whose readers do not need that signal.

The plan's `## Summary` and `## Problem Frame` must serve distinct purposes: Summary answers "what is this plan proposing?" (forward-looking, 1-3 lines); Problem Frame answers "why does this proposal exist?" (backward-looking, paragraphs). Don't restate the proposal in Problem Frame; don't pad Summary with situational context.
