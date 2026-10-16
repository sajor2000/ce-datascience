# Methodsmith brand guide

Methodsmith is a plugin for Claude Code and Codex for rigorous research methods:
clinical statistics, Python and machine-learning papers, and meta-analysis, from
question to paper. It is a plugin, not an app: the brand appears in plugin
directories, on GitHub, on the docs site and in the terminal, so every asset is
designed for those places.
The brand should read like a well-kept methods section: plain, exact and
checkable. It should not read like a startup.

All assets live in [`website/static/brand/`](../../website/static/brand/) and are
rebuilt from source with:

```bash
bash docs/brand/scripts/render-brand.sh
```

The script downloads the OFL fonts to `/tmp`, writes outlined SVGs (no font
needed to view them) and exports the PNGs with headless Chrome.

## Name and voice

- Write **Methodsmith**, one word, capital M. The plugin slug is `methodsmith`
  and every command starts with `/method-`.
- Tagline: *Rigorous methods for statistics, machine learning, and
  meta-analysis, from question to paper. Every study compounds.* The second
  sentence may stand alone as a sign-off.
- "Compound" is a verb and a loop step, never the product name.
- Use the words our audience trusts: rigorous, reproducible, verified,
  transparent, audit trail, pre-specified, reporting guideline.
- Do not use: autonomous, 10x, vibe, hands-off, "AI statistician", "replaces
  your analyst". The researcher stays accountable; say so.
- Credit Every's [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin)
  as the origin of the plan -> work -> review -> compound loop wherever the loop
  is explained at length (README, docs home).

## The mark: the hallmark

![The Methodsmith hallmark](../../website/static/brand/mark-512.png)

A smith punches a **hallmark** into finished work to vouch for it. The
Methodsmith mark is a geometric **M** struck into a plate with chamfered
corners: the maker's guarantee that the work was tested, which is what the
plugin offers an analysis (verified, reviewed, traceable). The choice and the
alternatives are recorded in [logo-audit.md](logo-audit.md).

Construction, on a 64-unit grid:

- **Plate:** a 50 x 40 rectangle with 4-unit 45-degree chamfers, stroked at 3.4
  units with mitred corners.
- **M:** filled, with flat-cut tops. The stems are 6.2 units wide, matching the
  stem weight of the Semibold wordmark at lockup size.
- **Vertex:** the M's inner vertex sits 5 units below centre, so the two
  counters balance optically inside the plate.
- **Small form:** at 32 px and below, the plate is dropped and the M is enlarged
  1.55x, so favicons and composer icons stay crisp.

| File | Use |
|---|---|
| `mark-light.svg`, `mark-{64..1024}.png` | The mark on light backgrounds: ember plate, ink M, transparent |
| `mark-dark.svg` | On dark backgrounds: glow plate, paper M |
| `mark-mono.svg` | One colour, following `currentColor` (print, embossing, single-colour badges) |
| `icon.svg`, `icon-{48..1024}.png` | Square tile: ink ground, full hallmark. For the plugin directories and avatars |
| `icon-small.svg`, `icon-16.png`, `icon-32.png` | Square tile, small form (M only). For the Codex composer icon and anywhere 32 px or smaller |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Docs site browser icons; the ico holds 16, 32 and 48 |
| `avatar.png` | 500 x 500 tile for a GitHub organisation or profile avatar |
| `lockup-light`, `lockup-dark` (`.svg`, `.png`) | Horizontal lockup |
| `lockup-stacked-light`, `lockup-stacked-dark` (`.svg`, `.png`) | Stacked lockup for square spaces |

### Clear space and minimum size

- **Clear space:** keep at least the gap between the plate and the M (about 7 grid units,
  about 10% of the mark's width) clear on every side. In lockups, the gap
  between mark and wordmark is 0.62x the cap height.
- **Minimum size:** 48 px for the full hallmark, 14 px for the small form, and
  120 px wide for the horizontal lockup.
- **Lockup proportions:** the plate is 1.6x the wordmark's cap height and is
  centred on it. Use the lockup files; don't rebuild the lockup by hand.

### Don'ts

- Don't fill the plate, round its corners, or replace the chamfers with notches.
- Don't recolour the M in ember, or the plate in ink when colour is available.
- Don't add gradients, shadows, outlines, glows, or 3D bevels.
- Don't put the light mark (ink M) on a dark ground; use `mark-dark.svg`.
- Don't set the wordmark in another face, in all caps, or with wider tracking.
- Don't present the mark as an app icon (no squircles or platform icon grids).
  The square tile exists because the plugin directories ask for a square image.

## Colour

Built on the editorial palette already used by the README diagrams and site
video (`website/animations/method_visuals.py`): warm paper, ink type, muted phase
hues. Methodsmith adds one accent, **ember**, the colour of worked metal.

| Token | Hex | Role | Contrast (WCAG 2.x) |
|---|---|---|---|
| Ink | `#1B1F27` | Text and mark on light | 15.2:1 on Paper |
| Paper | `#F7F5F0` | Light background | — |
| Muted | `#5B6370` | Secondary text on light | 5.6:1 on Paper, 6.1:1 on white |
| Rule | `#DCD8CF` | Hairlines and borders on light | decorative |
| Ember | `#C2502A` | Accent fills: the hallmark plate, active node, return arrow | 4.3:1 on Paper (graphics need 3:1) |
| Ember Deep | `#A63F1C` | Accent **text** and links on light | 5.8:1 on Paper, 6.3:1 on white |
| Night | `#11141A` | Dark background | — |
| Night Surface | `#1B1F27` | Cards and the icon tile on dark | — |
| Night Text | `#ECE8E0` | Text on dark | 15.1:1 on Night |
| Night Muted | `#A3AAB5` | Secondary text on dark | 7.9:1 on Night |
| Ember Glow | `#E57A50` | Accent text and fills on dark | 6.4:1 on Night, 5.7:1 on Night Surface |

Ember is never body text on light: use Ember Deep. Keep ember to one or two
marks per view; it signals "this is the compounding step" or "act here".

The six phase hues in `method_visuals.py` (Frame `#1D4E89`, Design `#2A7F7A`,
Data `#7A5C1E`, Plan `#A61B2B`, Execute `#5B3F8C`, Review `#2F6B3B`) stay as the
categorical palette for diagrams. They are data colours, not brand colours.

## Type

All three families are open source (SIL OFL 1.1).

| Role | Family | Notes |
|---|---|---|
| Wordmark and display headings | [Source Serif 4](https://github.com/adobe-fonts/source-serif) Semibold, optical size 60 | The voice of a journal methods section. Tracking -0.012 em in the wordmark |
| Text and UI | [IBM Plex Sans](https://github.com/IBM/plex) 400 and 500 | Labels in caps get +0.08 em tracking |
| Commands, code, numbers in tables | [IBM Plex Mono](https://github.com/IBM/plex) 500 | Only for things a user types or a machine prints |

The README diagrams and the overview video use the same three faces; see
`website/animations/README.md` for how they are fetched and registered.

## Media

| Asset | File | Notes |
|---|---|---|
| README hero | `hero-light.svg`, `hero-dark.svg` (+ PNG) | 1600x560. Use a `<picture>` element so GitHub picks the theme |
| Who decides what | `human-loop-light.svg`, `human-loop-dark.svg` (+ PNG) | 1200x560 swimlane: the scientist's decisions above, the plugin's work below, ember on the approval gate and the return to the next plan. Used in the README and on the docs home in place of a video |
| GitHub social preview | `social-preview.png` | 1280x640, under 1 MB. Upload in repository Settings (it cannot be set through the API) |
| README hero | (as above) | The README's H1 carries the name, so the banner leads with the mark and the promise |
| Plugin directory icon | `plugins/methodsmith/assets/icon.png` (512) and `icon.svg` | Square tile. Claude reads `icon` from `plugin.json`; Codex reads `interface.logo`. Both directories require a square image of at least 48 px (PNG or SVG), and neither accepts `.ico` inside the plugin |
| Codex composer icon | `plugins/methodsmith/assets/icon-small.svg` | Small form, for `interface.composerIcon` |
| Badges | README docs badge | Carries the small-form M as a shields.io logo |
| Terminal | `demo.svg`, `demo-poster.png` | Commands in IBM Plex Mono; no mark inside the terminal |

## The loop graphic

The hero and social card show the loop as four nodes in a row: Plan, Work,
Review, Compound. Compound is the only ember node, and an ember return line
runs back to Plan labelled "learnings feed the next plan". That return line is
the brand's one recurring device; use it wherever the loop is drawn, and don't
add other decorative curves.
