# Synthesis Discipline

## Contents

- Section keep tests and budgets
- Pre-flight re-review

Read this with `references/synthesis-summary.md` before presenting the Phase 2.9 scoping synthesis. It holds the rules that decide which bullets survive, how many, and how much each says.

---

## Section keep tests and budgets

### Keep tests per section

Each conditional section has its own keep test. Sections are render-conditional — an empty section is omitted, not padded with weak items.

**Trade-offs keep test:** would the user be surprised if I didn't surface this acknowledgment? Real trade-offs are choices the user explicitly weighed alternatives on in dialogue, or structural choices the agent made that the user would expect to see named. Mechanical or inevitable choices (e.g., "uses the existing rule entity") fail the test and dissolve into the doc body without surfacing.

**Deferred keep test:** is a reasonable downstream reader likely to ask "why isn't X here?" Items the user explicitly deferred, or items adjacent enough that a reader will look for them. Mechanical excludes (e.g., "no rate limiting because it's not in scope") fail and stay in the internal draft only.

**Call-outs keep test (the affirmability test):** would the user need to read code to evaluate this? If yes, it is doc-body content — cut. If no, apply the keep test — one of the following must be true:

- **Real scope fork** — another reasonable agent might choose a different scope on this dimension (who the primary actor is, whether case X is in/out, in scope vs deferred)
- **Non-obvious scope inclusion** — a behavior the agent assumed is in scope that the user might want excluded
- **Non-obvious scope exclusion** — an item the agent moved to deferred that the user might want in scope
- **Cheap-now-expensive-later correction** — a scope bet that's cheap to fix now but expensive after the requirements doc lands and method-plan consumes it
- **Non-obvious consequence of multi-turn answers** — a downstream effect of combining user-stated answers that the user is unlikely to have tracked through dialogue. Surfaced forward-looking ("X means Y for the doc"), not retrospectively ("you said X"). This category is the multi-turn-dialogue reason call-outs exist at all in method-brainstorm; do not filter these as "already implied by Stated"

Cut anything that doesn't match a keep-test category, including:

- Mechanical items where there is no real alternative
- Implementation choices that will be settled during planning
- Items already implied by the scoping synthesis prose
- Re-statements of Q&A turns ("you said you wanted X") — that's transcript, not a call-out
- Re-statements of the Phase 2 approach the user already picked

### Total bullet budget across sections 2–4

The cap is heuristic, not law. The real discipline is each section's keep test on each candidate. Typical bounds by tier, counting bullets across Trade-offs + Deferred + Call outs combined:

| Tier | Typical total | Hard ceiling |
|---|---|---|
| Lightweight | 0–1 | 2 |
| Standard | 2–4 | 5 |
| Deep — analysis | 3–5 | 7 |
| Deep — program | 4–7 | 9 |

**Above the hard ceiling, the synthesis is misshapen — do not raise the cap, re-cut at a higher level of abstraction.** Almost always, multiple bullets within a section are sub-decisions of one larger named decision. Collapse related bullets into a single one named at the level the user actually weighs in on.

A useful test: read the bullets aloud. If two or more sound like "and also" extensions of the same idea, they belong as one.

**Path A fires only for Lightweight tier with no blocking questions. Path B is the default for Standard, Deep-analysis, and Deep-program regardless of question signal — substance earns the checkpoint, not interaction history.** Zero call-outs on Path B is normal for Lightweight, sometimes for Standard, almost never for Deep. If a Deep scoping synthesis produces zero call-outs after rich content (whether from dialogue or pre-loaded context), double-check the agent hasn't filtered consequence-class call-outs as "already implied."

### Detail level: conversational, not documentary

Each bullet is **1 line ideally, 2 lines maximum**. The reference shape is what two collaborators would say to each other in conversation, not what a requirements doc would say in its body. The synthesis is a forcing function for shape confirmation; the requirements doc is where the substance lives. If a bullet reads like a doc paragraph, it's wrong-shaped — the agent has compressed horizontally (fewer bullets) without compressing vertically (less per bullet), and the cap is meaningless if individual bullets bloat to fill it.

Two tests:

- **Read-aloud test**: would two product collaborators *say* this bullet, or would they *write* it in a spec? Say = right. Write = re-cut to a sentence or cut.
- **Single-sentence test**: can the bullet land in one sentence? If it needs semicolons stringing clauses or a list within the bullet, it's probably two decisions sharing a bullet — split (and re-cut for count) or cut to the higher-level one.

Bad vs good — detail level:

| Too detailed (wrong) | Conversational (right) |
|---|---|
| Per-channel mute scoped to notification rules; mute applies to all events through that rule including @mentions, DMs forwarded as notifications, and bot messages; persists 24h with extension | Per-channel over per-user — support team isn't a single user |
| Rule-delete loss path is silent and could surprise users who configured extended mutes; consider a confirmation dialog, soft-delete with state preservation, or a 7-day undo window | Rule-delete silently loses pause state — confirm no warning needed |

The "What we're building" prose obeys the same discipline: 1–3 sentences describing the shape, not an enumeration of requirements. If the prose lists what's in / what's out / what's how, it has become a doc preview — cut to shape only.

### Anti-patterns

Each anti-pattern below produces a bullet that fails its section's keep test, or a scoping synthesis that drifts back toward the comprehensive-audit failure mode.

- **Naming implementation detail in any bullet**: file paths, module names, exact JSON keys, HTTP status codes, error message wording, SQL syntax. The synthesis is scope-only; implementation is method-plan's job. These granularity rules apply to every bullet in every section.
- **Re-stating a Q&A turn verbatim** ("you said you wanted X"): transcript, not scoping synthesis. Reframe forward-looking ("X means Y for the doc") or cut.
- **Re-stating the Phase 2 approach the user already picked**: the approach was chosen before Phase 2.9 — its mention belongs in one sentence of "What we're building," not as a call-out.
- **Padding a section to meet a bullet count**: render-conditional means empty is allowed. Omit the section entirely rather than fill it with weak items.
- **Pasting the three-bucket internal draft verbatim into chat**: that was the old shape and the volume problem it produced is why stage 2 exists. Compose internally, derive scoping synthesis sections, present compressed.
- **Floating questions adjacent to stage 2**: if a question genuinely cannot be defaulted, pause synthesis and resolve it before presenting. Pick the question shape that matches: a blocking multiple-choice tool when options are bounded and meaningfully distinct, open-ended when option sets would unintentionally influence the user's answer per Interaction Rule 5(b). Integrate the answer, then present the scoping synthesis. Never present the scoping synthesis with adjacent floating questions — that gives the user no clear resolution path.

---

## Pre-flight re-review

Before emitting the scoping synthesis, re-read the draft as a user would read it. Two failure modes to catch:

- **The scoping synthesis reads like a requirements-doc preview.** Prose enumerates what's in/out, bullets are documentary instead of conversational. The synthesis is a shape-confirmation checkpoint, not a doc preview — if it reads as preview, Phase 2.9 and Phase 3 have collapsed into one step. Revise to conversational shape, or accept that the requirements doc itself will contain the detail and the synthesis should be lighter.
- **The bullet count fits the cap but each bullet is over-detailed.** Hitting 5 bullets in Standard while each bullet is a paragraph means the agent met the count cap by compressing horizontally (fewer bullets) without compressing vertically (less per bullet). The cap is meaningless if individual bullets bloat to fill it. Re-cut to sentence-level bullets.

This is one mental act — re-read as the user — not a checklist to mechanically run. The forcing function is putting yourself in the user's reading shoes briefly, with explicit attention to detail level alongside the keep tests. Revise before emitting if either failure mode fires.
