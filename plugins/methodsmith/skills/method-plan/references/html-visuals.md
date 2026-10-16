# HTML Visuals

## Contents

- Diagrams
- Wireframe mockups (requirements docs only)
- Affordance idioms

Read this with `references/html-rendering.md` when an HTML artifact needs a diagram, a wireframe, or an affordance beyond plain sections. The hard invariants, prose-is-authoritative rule, and post-compose audit in that file still apply.

## Diagrams

When the section contract calls for a diagram (architecture, sequence,
flowchart, state machine, swim lane, data-flow, quantitative
comparison), HTML renders it as **inline SVG**. The agent picks the
shape that conveys the content fastest — there is no fixed catalog of
"approved" diagram types. If the content is quantitative comparison
across categories, a bar chart is the right shape; if it's component
relationships, a topology diagram; if it's process flow across
participants, a swim lane; etc.

**Conceptual diagrams are not wireframes.** The wireframe affordance below
is scoped to brainstorm requirements docs about *visual products* and is
excluded for non-visual systems. That exclusion is about wireframes only —
a brainstorm about a data model, schema, agent workflow, or migration is
still free to use a conceptual diagram (a before/after field map, a
source-of-truth fan-out, a state diagram). Don't let the wireframe
exclusion suppress a conceptual diagram the content warrants.

**Diagrams complement prose; they never replace it.** A diagram is an
accelerant placed next to the prose it illustrates, not a substitute. The
IDed prose stays complete and standalone — a reader who ignores every
diagram still gets the full content in text, and a text-reading downstream
agent (which does not parse SVG geometry) is never left with a relationship
that exists only in the picture. This extends the prose-is-authoritative
rule in `references/html-rendering.md`: prose governs not only on disagreement but on completeness, so
adding a diagram is not license to thin the prose it depicts.

### Layout legibility for hand-authored SVG

The agent designs SVG coordinates without rendering — layouts that look
fine in source can collide in practice. Before emitting, trace each
labeled arrow and each text label:

- **No arrow path passes through a text label.** If an arrow line or
  curve crosses a label's bounding box, the text reads as struck-through
  and the arrow reads as terminating at the wrong element. Fix by
  re-routing the arrow, moving the label, or applying
  `paint-order: stroke fill` with a stroke color matching the diagram
  background to halo the label. The halo width is a judgment call:
  narrow enough not to bleed into glyph strokes (a halo whose width
  approaches the glyph's own stroke width muddies the text color), wide
  enough to mask underlying arrows (at least the arrow's stroke width
  plus a hairline). Verify by inspecting rendered text at the target
  font size — if glyphs look thicker or more colored-toward-halo than
  the same text outside the diagram, the halo is too wide.
- **Arrow labels sit adjacent to the arrow's midpoint** (typically
  within ~10-15px above or beside the line they describe). A label
  floating at the diagram's edge that readers have to trace back to an
  arrow is broken — readers will misread.
- **Avoid long curves that traverse the diagram** to connect a
  component on one side to one on the other. If A and D need a labeled
  connection across a multi-component layout, prefer reordering boxes
  so A and D are adjacent, numbered step badges next to each
  participant that the caption ties together, or a short
  labeled-channel notation — rather than one curve crossing multiple
  unrelated elements.
- **Differentiate diagram shapes by geometry first, by fill semantics
  second.** Geometry (diamond = decision, rect = step, oval =
  start/end, parallelogram = data) carries the role unambiguously.
  Fill semantics (accent-soft for highlighted path, warn-soft for
  fallthrough) carry meaning. Resist introducing additional neutral-tint
  tiers (a slightly-lighter grey to mark "decision shapes are different
  from boxes") — when geometry already differentiates, an additional
  luminance tier adds no information and creates fragility: small RGB
  deltas survive native browser rendering but can be flattened or
  inverted inconsistently by dark-mode extensions, accessibility
  plugins, or printing.

### Plan architecture diagrams are not directional sketches

Do not add hedging captions or section preambles to plan SVG diagrams —
phrases like "directional guidance for review, not implementation
specification" do not belong on plan diagrams or on unit-card
technical-design subsections. Plan diagrams render the same authoritative
content as the surrounding prose; the prose-is-authoritative rule
already governs disagreement. Hedging language is reserved for the
wireframe affordance below, which carries a *required* directional
caption because the wireframe is explicitly NOT a spec.

## Wireframe mockups (requirements docs only)

When a brainstorm requirements document describes a user-facing visual
surface (UI feature, screen layout, screen flow, component placement),
the HTML rendering may include a wireframe mockup. This affordance applies
ONLY to brainstorm requirements docs that describe visual products — not
to plan artifacts, and not to brainstorms about non-visual systems (API
design, agent workflows, infrastructure).

When a wireframe is included:

- **Fidelity ceiling: wireframe, not mockup.** Gray boxes for layout
  regions, text labels for content placeholders, intentional placeholder
  copy (`[Product name]`, `[CTA label]`, `[user avatar]`). No
  pixel-perfect colors, no exact typography choices, no specific
  component-library references. The wireframe communicates spatial
  arrangement and structure, not visual style.
- **Static only.** Inline SVG or simple HTML/CSS for layout. No JS
  interaction, no working form fields, no state changes, no live data.
- **Anti-padding.** One wireframe per distinct visual concept.
- **Mandatory directional caption.** Every wireframe carries an explicit
  "directional, not the spec" note adjacent to it. Required wording (or
  close paraphrase): *"Directional only — illustrates the intended
  user-facing shape. Exact colors, spacing, copy, and component choices
  are placeholders for review, not requirements."*

Without this caption the wireframe risks being read as a binding visual
spec, which the affordance is explicitly designed to avoid.

## Affordance idioms

Common HTML affordances the agent can reach for when content benefits.
These are examples, not requirements — the agent picks what each
artifact's content warrants. Other affordances not listed here are
fine when the content suggests them.

- **Sticky TOC sidebar with active-section indicator** — available when
  the agent judges navigation will materially help and the
  implementation is reliable: two-column layout on desktop, collapsed
  to top-of-page on mobile, paired with a small inline
  `IntersectionObserver` script that toggles `.active` on the matching
  nav anchor. Trade-off: a broken sticky TOC (layout collisions,
  active-section state drift, dark-mode CSS issues) is worse than a
  static top-of-doc TOC. For most long docs, default-closed `<details>`
  on repeating cards (see Implementation Units anatomy in
  `references/html-rendering.md`) already cuts
  the visible scroll length enough that a static TOC works — reach for
  sticky only when collapsibles alone don't solve the navigation
  problem.
- **Within-section sub-nav** for sections containing 6+ repeating cards
  (Implementation Units, KTDs, Risks at large counts). A short list of
  card-anchor links (`<ul>` of `<a href="#u1">U1. ...</a>`) rendered at
  the top of the section gives readers a jump table — no JS needed.
  Lower-complexity alternative to the sticky TOC for the specific case
  of long card sections.
- **Eyebrow labels** (small-caps tag above section titles) for
  editorial polish, especially when section titles are narrative
  rather than literal.
- **Stats strip** at the top of the doc when the artifact has 3+
  quantifiable signals worth surfacing at a glance.
- **`<details>` + `<summary>`** for collapsible secondary content
  inside repeating cards. All collapsibles start closed — `open`
  attribute should not appear on any `<details>` inside repeating
  cards by default.
- **Side-by-side columns** for parallel content (Request / Response,
  Before / After, Two alternatives).
- **Tinted callout cards** for content that is "different in kind"
  (Deferred, Open Questions, advisory notes, unit-level execution notes)
  — color-coded left borders communicate kind at a glance.
