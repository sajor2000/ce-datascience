# Logo audit and refined directions

Audit of the original Methodsmith mark, wordmark, lockups, directory tile,
favicon, hero and social preview, against what strong developer-tool and
plugin identities do well. Three refined directions follow, each with a contact
sheet. Written 2026-10-16. **Outcome: direction C, the hallmark, was chosen and
refined; the shipped kit is built from it** (see the end of this file).

Methodsmith is a plugin for Claude Code and Codex, not an app. Its mark appears
in the Claude and Codex plugin directories, on GitHub (README, social preview,
avatar), on the docs site (navbar, favicon, social card), in badges and in the
terminal. Every criterion below is judged in those places.

Contact sheets (regenerate with `python3 docs/brand/directions/build_directions.py`):

| Direction | Sheet |
|---|---|
| Current: m on an anvil face | [current/contact-sheet.png](directions/current/contact-sheet.png) |
| A. Tightened m on anvil | [a-anvil/contact-sheet.png](directions/a-anvil/contact-sheet.png) |
| B. The loop as the letter | [b-loop/contact-sheet.png](directions/b-loop/contact-sheet.png) |
| C. Hallmark monogram (chosen) | [c-hallmark/contact-sheet.png](directions/c-hallmark/contact-sheet.png) |

Each sheet shows the mark at 512, 64, 32 and 16 px (32 and 16 rasterised at
true size, then enlarged with hard edges), light and dark lockups, the square
directory tile, one-colour and reversed versions, and the mark in context:
GitHub repository header and social card, docs navbar, Claude directory tile
and a browser tab.

## What the benchmarks have in common

Linear, Vercel, Stripe, Notion, Supabase, Raycast, Posit, Hex and Deepnote, and
the marks in the Claude and Codex plugin directories, differ in style, but the
strong ones share five traits:

1. **One idea, one silhouette.** A single geometric primitive or letterform
   that survives being filled solid black at 16 px.
2. **Monochrome first.** Colour is added to a mark that already works in one
   colour; it is never what makes the mark legible.
3. **A small-size form.** Favicons and directory icons drop detail rather than
   shrinking it.
4. **A clean square tile.** Directory listings ask for a square image and apply
   their own corner mask, so the tile is a plain square with even padding.
5. **One brand colour.** Used sparingly, with a lighter variant for dark mode.

## Scores for the shipped assets

1 = weak, 5 = professional standard.

| Criterion | Score | Finding |
|---|---|---|
| Geometry on a grid | 3 | Consistent 6.2-unit stroke on a 64 grid, but the arches are mathematically round with no overshoot, and the anvil's slant is arbitrary rather than derived from the grid |
| Silhouette at 16, 32, 64 px | 2 | At 64 px it reads. At 16 px the anvil collapses into an underline and the m into three grey stems |
| Monochrome and reversed | 2 | In one colour the m fuses with the anvil face into a portico or bridge shape |
| Concept clarity | 2 | "m on an anvil" does not read without being told; most people see an m with an underline |
| Wordmark | 3 | Source Serif 4 Semibold is a good, honest choice, but it runs on default kerning, and its humanist serif does not match the geometric monoline mark |
| Mark-to-wordmark ratio, clear space | 4 | 1.34x the font size with the anvil on the baseline works; clear space is defined |
| Colour | 4 | Ember is warm and uncommon in the category. Contrast is fine for the glyph, but ember on the ink tile is only 3.5:1, and two ember values (graphics and text) muddy which one is "the" brand colour |
| Directory tile | 2 | A rounded rectangle (r = 22%) that the directories then mask again, with no small-size form |
| Distinctiveness | 3 | Clear of Every's script E, K-Dense, MedSci and the vendor marks in the competitor research, but rounded lowercase-m marks are common |
| Hero | 4 | Clear hierarchy and a strong loop device; the mark is the weakest element in it |
| Social preview | 4 | Good hierarchy on dark; the 19 px facts line is small once scaled to a feed card |
| Favicon | 2 | Inherits the 16 px problem above |

### Top issues

1. **The concept needs explaining.** The anvil, the part that carries "smith",
   disappears below 32 px and turns into an underline.
2. **No monochrome form.** The one-colour mark loses the m/anvil boundary.
3. **The type voices disagree.** A serif wordmark beside a geometric monoline
   mark looks like two brands.
4. **The tile is double-rounded.** Its own rounded corners sit inside the
   directories' corner mask.
5. **There is no small-size form.** The favicon shrinks the full mark instead of
   simplifying it.

## Directions

All three keep ember (`#C2502A`, dark mode `#E57A50`) as the single brand
colour and use a plain square directory tile.

| Criterion | A. m on anvil | B. Loop letter | C. Hallmark |
|---|---|---|---|
| Geometry on a grid | 4 | 5 | 5 |
| Silhouette at 16-64 px | 3 | 4 | 5 |
| Monochrome and reversed | 3 | 4 | 5 |
| Concept clarity | 4 | 3 | 4 |
| Wordmark pairing | 3 | 5 | 4 |
| Directory tile | 4 | 5 | 5 |
| Distinctiveness | 4 | 3 | 4 |
| **Total (35)** | **25** | **29** | **32** |

**A. Tightened m on anvil.** The anvil now has a horn, a heel, a waist and a
foot, so it reads as an anvil at 64 px and above. The m is built from filled
outlines, and the serif wordmark is tracked tighter (-0.018 em). It is the most
literal "smith" story. The cost is a busy silhouette: at 16 px the horn and foot
become noise, and in one colour the mark looks like a small monument.

**B. The loop as the letter.** One continuous m whose last stroke sweeps back
under the letter, in ember, to just short of where it began: plan, work and
review in ink, compound as the return. This is the same device as the README
loop. It pairs with a lowercase IBM Plex Sans Semibold wordmark (-0.025 em) and
is the most product-like. Risks: it carries little of the craft idea, and a rounded
lowercase m sits close to Mastodon's mark.

**C. Hallmark monogram (chosen).** A smith punches a hallmark into finished
work to vouch for it. Here a geometric M is struck into a punch with concave
corners, the shape of an assay stamp. The punch is ember, and the M is ink, or
paper on dark. At 32 px and below, the tile drops the punch and keeps the
heavier M alone, the way strong marks simplify at small sizes. The
wordmark stays Source Serif 4 Semibold in title case, so the mark, the docs
headings and the hero share one voice.

## Recommendation: C, the hallmark

- **The concept is the product.** A hallmark is a maker's guarantee that the work
  was tested. That is what Methodsmith sells: verified, reviewed, traceable
  analysis. It maps onto the audience's trust words (verified, audit trail)
  better than an anvil, which only says "craft".
- **It has the strongest small-size and monochrome behaviour.** The M alone is
  unmistakable at 16 px; the punch shape survives one colour and reversal
  intact.
- **It looks professional without being generic.** A single letterform in a
  distinctive frame, a square tile and one accent colour put it in the same
  family as the benchmark marks. The concave-corner punch avoids the octagon (a
  stop sign) and the plain square monograms of transit and media brands.
- **It costs least to adopt.** It keeps the serif wordmark, the palette and the
  site typography; only the mark changes.

## Refinement of C (shipped)

The first version of C used concave corners that could read as a ticket stub.
The [corner study](directions/c-hallmark/corner-study.png) compared four plate
treatments with a rebuilt M:

| Variant | At 128 px | At 32 and 16 px | One colour | Verdict |
|---|---|---|---|---|
| C1 soft concave corners (r 4) | Stamp-like | Clean | Clean | Still slightly ticket-like |
| **C2 chamfered corners (4 units)** | **Stamped maker's plate** | **Crisp** | **Crisp** | **Chosen** |
| C3 chamfer plus inner rule | Richest "struck stamp" | Inner rule blurs into haze | Busy | Large sizes only, so rejected |
| C4 rounded corners plus inner rule | Reads as a generic badge | Haze | Busy | Rejected |

Two changes to the M fixed balance across every variant:

- **Flat-cut tops.** The stroked M's mitred tops spiked toward the plate and
  made the mark look top-heavy.
- **Optical centring.** The M is filled, with its vertex 5 units below centre so
  the counters balance inside the plate.

Its 6.2-unit stems match the stem weight of the Source Serif 4 Semibold
wordmark at lockup size, so the monoline M and the serif sit together without
needing serif-style stress in the M. The refined mark is in the
[C contact sheet](directions/c-hallmark/contact-sheet.png) and specified in
[brand.md](brand.md).
