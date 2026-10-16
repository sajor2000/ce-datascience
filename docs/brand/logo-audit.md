# Logo audit and refined directions

Audit of the shipped Methodsmith mark, wordmark, lockups, app icon, favicon,
hero and social preview, against what professional SaaS and developer-tool
identities do well. Three refined directions follow, each with a contact sheet.
Written 2026-10-16. The shipped assets are unchanged until a direction is
chosen.

Contact sheets (regenerate with `python3 docs/brand/directions/build_directions.py`):

| Direction | Sheet |
|---|---|
| Current: m on an anvil face | [current/contact-sheet.png](directions/current/contact-sheet.png) |
| A. Tightened m on anvil | [a-anvil/contact-sheet.png](directions/a-anvil/contact-sheet.png) |
| B. The loop as the letter | [b-loop/contact-sheet.png](directions/b-loop/contact-sheet.png) |
| C. Hallmark monogram (recommended) | [c-hallmark/contact-sheet.png](directions/c-hallmark/contact-sheet.png) |

Each sheet shows the mark at 512, 64, 32 and 16 px (32 and 16 rasterised at
true size, then enlarged with hard edges), light and dark lockups, the macOS
icon on Apple's 824-on-1024 grid, the iOS and directory tile, one-colour and
reversed versions, and the mark in context: GitHub repository header and social
card, docs navbar, Claude directory tile and a browser tab.

## What the benchmarks have in common

Linear, Vercel, Stripe, Notion, Supabase, Raycast, Posit, Hex, Deepnote and the
Anthropic and OpenAI app icons differ in style, but the strong ones share five
traits:

1. **One idea, one silhouette.** A single geometric primitive or letterform
   that survives being filled solid black at 16 px.
2. **Monochrome first.** Colour is added to a mark that already works in one
   colour; it is never what makes the mark legible.
3. **A small-size form.** App icons and favicons drop detail rather than
   shrinking it.
4. **Continuous-corner tiles.** App icons use a squircle (superellipse), not a
   rounded rectangle, and sit on the platform's grid with padding.
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
| App-icon framing | 2 | A rounded rectangle (r = 22%), not a squircle, and no macOS grid or shadow version |
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
4. **The icon tile is not platform-native.** It is a rounded rectangle with no
   macOS grid version.
5. **There is no small-size form.** The favicon shrinks the full mark instead of
   simplifying it.

## Directions

All three keep ember (`#C2502A`, dark mode `#E57A50`) as the single brand
colour, use a superellipse tile, and include a macOS grid icon.

| Criterion | A. m on anvil | B. Loop letter | C. Hallmark |
|---|---|---|---|
| Geometry on a grid | 4 | 5 | 5 |
| Silhouette at 16-64 px | 3 | 4 | 5 |
| Monochrome and reversed | 3 | 4 | 5 |
| Concept clarity | 4 | 3 | 4 |
| Wordmark pairing | 3 | 5 | 4 |
| App-icon framing | 4 | 5 | 5 |
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
is the most "SaaS". Risks: it carries little of the craft idea, and a rounded
lowercase m sits close to Mastodon's mark.

**C. Hallmark monogram (recommended).** A smith punches a hallmark into finished
work to vouch for it. Here a geometric M is struck into a punch with concave
corners, the shape of an assay stamp. The punch is ember, and the M is ink, or
paper on dark. At 32 px and below, the icon drops the punch and keeps the
heavier M alone, the way professional icons simplify at small sizes. The
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
  distinctive frame, a squircle tile and one accent colour put it in the same
  family as the benchmark icons. The concave-corner punch avoids the octagon (a
  stop sign) and the plain square monograms of transit and media brands.
- **It costs least to adopt.** It keeps the serif wordmark, the palette and the
  site typography; only the mark changes.

Before shipping C, two refinements are worth making:

1. Add a 1-unit optical overshoot to the M's inner vertex.
2. Check the M at 16 px on a light browser tab, since the tile carries the
   contrast.

After a direction is picked, the full kit (lockups, favicon, social preview,
hero, directory icon, video and diagram marks) is regenerated from it by the
brand generator.
