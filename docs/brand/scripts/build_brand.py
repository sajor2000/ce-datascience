"""Build the Methodsmith brand SVGs: mark, wordmark, lockups, hero, social card.

Every piece of text is converted to outlines, so the SVGs render the same on
GitHub, in browsers and in image viewers without the fonts installed.

Run through docs/brand/scripts/render-brand.sh, which pins the Python
dependencies, downloads the OFL fonts to /tmp, and exports the PNGs.
"""

from __future__ import annotations

import io
import sys
from functools import lru_cache
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONT_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/ce-datascience/brand/fonts")
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "website/static/brand")

# Palette. Contrast ratios against the background they are used on are listed
# in docs/brand/brand.md; EMBER is for graphics only, EMBER_DEEP for text.
INK = "#1B1F27"
PAPER = "#F7F5F0"
MUTED = "#5B6370"
RULE = "#DCD8CF"
EMBER = "#C2502A"
EMBER_DEEP = "#A63F1C"
NIGHT = "#11141A"
NIGHT_SURFACE = "#1B1F27"
NIGHT_TEXT = "#ECE8E0"
NIGHT_MUTED = "#A3AAB5"
NIGHT_RULE = "#2E3440"
EMBER_GLOW = "#E57A50"

SERIF = ("SourceSerif4.ttf", (("wght", 600), ("opsz", 60)))
SANS = ("IBMPlexSans.ttf", (("wght", 400), ("wdth", 100)))
SANS_MEDIUM = ("IBMPlexSans.ttf", (("wght", 500), ("wdth", 100)))
MONO = ("IBMPlexMono-Medium.ttf", None)

LOOP = (
    ("Plan", "/method-plan"),
    ("Work", "/method-work"),
    ("Review", "/method-review"),
    ("Compound", "/method-compound"),
)
PLUGIN = Path(__file__).resolve().parents[3] / "plugins" / "methodsmith"


def inventory():
    """Counts shown on the social card, read from the plugin so they stay true."""
    skills = len(list((PLUGIN / "skills").glob("*/SKILL.md")))
    agents = len(list((PLUGIN / "agents").rglob("*.md")))
    checklists = len(list((PLUGIN / "skills" / "method-review" / "references").glob("*-checklist.md")))
    return skills, agents, checklists


TAGLINE = "Rigorous methods for statistics, machine learning, and meta-analysis, from question to paper."
SIGNOFF = "Every study compounds."


# --- type -------------------------------------------------------------------


@lru_cache(maxsize=None)
def _font(spec):
    name, axes = spec
    font = TTFont(FONT_DIR / name)
    if axes:
        font = instantiateVariableFont(font, dict(axes))
    buf = io.BytesIO()
    font.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), data


def text_path(spec, value, size, x=0.0, y=0.0, tracking=0.0, anchor="start"):
    """Return (svg path data, advance width) for `value` set at `size` px.

    `y` is the baseline. `tracking` is in em. Shaping uses HarfBuzz, so
    kerning and ligatures match what a browser would set.
    """
    font, data = _font(spec)
    upem = font["head"].unitsPerEm
    hb_font = hb.Font(hb.Face(data))
    buf = hb.Buffer()
    buf.add_str(value)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf, {"kern": True, "liga": True})
    scale = size / upem
    width = sum(p.x_advance for p in buf.glyph_positions) * scale + tracking * size * (len(value) - 1)
    if anchor == "middle":
        x -= width / 2
    elif anchor == "end":
        x -= width
    glyphs = font.getGlyphSet()
    order = font.getGlyphOrder()
    pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    cursor = x
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        gx = cursor + pos.x_offset * scale
        gy = y - pos.y_offset * scale
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, gx, gy)))
        cursor += pos.x_advance * scale + tracking * size
    return pen.getCommands(), width


def text(spec, value, size, x, y, fill, tracking=0.0, anchor="start"):
    d, _ = text_path(spec, value, size, x, y, tracking, anchor)
    return f'<path d="{d}" fill="{fill}"/>'


def width_of(spec, value, size, tracking=0.0):
    return text_path(spec, value, size, tracking=tracking)[1]


# --- mark -------------------------------------------------------------------
# A lowercase m (methods) forged on an anvil face (smith). The two arches are
# two passes of the loop; the ember face is the compound step every study
# rests on. Drawn on a 64-unit grid.


def _m_path():
    x0, top, base, r = 18, 17, 44.5, 7
    return (
        f"M{x0} {base} V{top + r} a{r} {r} 0 0 1 {2 * r} 0 V{base} "
        f"M{x0 + 2 * r} {top + r} a{r} {r} 0 0 1 {2 * r} 0 V{base}"
    )


ANVIL = "M11 43.5 H53 L48.5 49.5 H15.5 Z"


def mark_glyph(fg, accent):
    return (
        f'<path d="{_m_path()}" fill="none" stroke="{fg}" stroke-width="6.2" '
        f'stroke-linejoin="round"/><path d="{ANVIL}" fill="{accent}"/>'
    )


def mark_tile(tile=INK, fg=PAPER, accent=EMBER):
    return f'<rect width="64" height="64" rx="14" fill="{tile}"/>' + mark_glyph(fg, accent)


def place(inner, x, y, size):
    s = size / 64
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({s:.4f})">{inner}</g>'


def svg(width, height, body, title, desc=None, background=None):
    bg = f'<rect width="{width}" height="{height}" fill="{background}"/>' if background else ""
    desc_el = f"<desc>{desc}</desc>" if desc else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" role="img" aria-labelledby="t">'
        f'<title id="t">{title}</title>{desc_el}{bg}{body}</svg>\n'
    )


# --- compositions -----------------------------------------------------------


def wordmark(x, baseline, size, fill):
    return text(SERIF, "Methodsmith", size, x, baseline, fill, tracking=-0.012)


def lockup(theme):
    """Mark plus wordmark. The mark's anvil sits on the wordmark baseline and
    the mark scales with the type (1.34x the font size), as in the hero."""
    fg, accent = (INK, EMBER) if theme == "light" else (NIGHT_TEXT, EMBER_GLOW)
    size, baseline = 64, 66
    mark_size = size * 150 / 112
    s = mark_size / 64
    word_x = 42 * s + size * 30 / 112
    word_w = width_of(SERIF, "Methodsmith", size, -0.012)
    body = place(mark_glyph(fg, accent), -11 * s, baseline - 49.5 * s, mark_size)
    body += wordmark(word_x, baseline, size, fg)
    return svg(round(word_x + word_w + 2), 82, body, "Methodsmith")


def loop_strip(x0, x1, y, theme, bg, label_size=17, cmd_size=19):
    """The four commands in a row, joined by rules, with an ember arc that
    returns from compound to plan. The return arc is the signature: it is the
    one curve in the system."""
    fg, muted, rule, accent, accent_text = (
        (INK, MUTED, RULE, EMBER, EMBER_DEEP)
        if theme == "light"
        else (NIGHT_TEXT, NIGHT_MUTED, NIGHT_RULE, EMBER_GLOW, EMBER_GLOW)
    )
    n = len(LOOP)
    step = (x1 - x0) / (n - 1)
    out = []
    xs = [x0 + i * step for i in range(n)]
    for i, (verb, cmd) in enumerate(LOOP):
        cx = xs[i]
        last = i == n - 1
        out.append(f'<circle cx="{cx:.1f}" cy="{y}" r="7" fill="{accent if last else fg}"/>')
        out.append(text(SANS_MEDIUM, verb.upper(), label_size, cx, y - 26, muted, tracking=0.08, anchor="middle"))
        out.append(text(MONO, cmd, cmd_size, cx, y + 42, accent_text if last else fg, anchor="middle"))
        if not last:
            out.append(
                f'<line x1="{cx + 16:.1f}" y1="{y}" x2="{xs[i + 1] - 16:.1f}" y2="{y}" '
                f'stroke="{rule}" stroke-width="2"/>'
            )
    # Return path from compound back to plan, under the commands. Square
    # corners with a small radius keep it a diagram line, not a swoosh.
    a, b, r = xs[-1], xs[0], 14
    top, low = y + 58, y + 92
    out.append(
        f'<path d="M{a:.1f} {top} V{low - r} Q{a:.1f} {low} {a - r:.1f} {low} H{b + r:.1f} '
        f'Q{b:.1f} {low} {b:.1f} {low - r} V{top + 2}" fill="none" stroke="{accent}" '
        f'stroke-width="2.5" stroke-linejoin="round"/>'
    )
    out.append(
        f'<path d="M{b - 8:.1f} {top + 11} L{b:.1f} {top} L{b + 8:.1f} {top + 11}" fill="none" '
        f'stroke="{accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    )
    note = "learnings feed the next plan"
    note_size = label_size - 1
    note_w = width_of(SANS, note, note_size)
    mid = (a + b) / 2
    out.append(
        f'<rect x="{mid - note_w / 2 - 14:.1f}" y="{low - 12}" width="{note_w + 28:.1f}" height="24" '
        f'fill="{bg}"/>'
    )
    out.append(text(SANS, note, note_size, mid, low + note_size * 0.36, accent_text, anchor="middle"))
    return "".join(out)


def hero(theme):
    W, H = 1600, 560
    bg, fg, muted, accent, accent_text, rule = (
        (PAPER, INK, MUTED, EMBER, EMBER_DEEP, RULE)
        if theme == "light"
        else (NIGHT, NIGHT_TEXT, NIGHT_MUTED, EMBER_GLOW, EMBER_GLOW, NIGHT_RULE)
    )
    body = []
    body.append(place(mark_glyph(fg, accent), 112 - 11 * 150 / 64, 172 - 49.5 * 150 / 64, 150))
    body.append(wordmark(112 + 42 * 150 / 64 + 30, 172, 112, fg))
    body.append(text(SANS, TAGLINE, 31, 112, 254, muted))
    body.append(text(SANS_MEDIUM, SIGNOFF, 31, 112, 300, accent_text))
    body.append(f'<line x1="112" y1="344" x2="{W - 112}" y2="344" stroke="{rule}" stroke-width="1.5"/>')
    body.append(loop_strip(250, W - 250, 408, theme, bg))
    desc = (
        "Methodsmith logo and tagline. The loop: plan, work, review, compound, "
        "with an arrow returning from compound to plan."
    )
    return svg(W, H, "".join(body), "Methodsmith", desc, background=bg)


def social_card():
    W, H = 1280, 640
    body = []
    body.append(place(mark_tile(NIGHT_SURFACE, NIGHT_TEXT, EMBER_GLOW), 80, 80, 104))
    body.append(wordmark(212, 160, 92, NIGHT_TEXT))
    body.append(text(SANS, "Rigorous methods for statistics, machine learning,", 30, 84, 252, NIGHT_MUTED))
    body.append(text(SANS, "and meta-analysis, from question to paper.", 30, 84, 292, NIGHT_MUTED))
    body.append(text(SANS_MEDIUM, SIGNOFF, 30, 84, 338, EMBER_GLOW))
    body.append(loop_strip(176, W - 176, 420, "dark", NIGHT, label_size=15, cmd_size=17))
    skills, agents, checklists = inventory()
    facts = f"{skills} skills  ·  {agents} specialist reviewers  ·  {checklists} EQUATOR checklists  ·  PHI guard"
    body.append(f'<line x1="84" y1="560" x2="{W - 84}" y2="560" stroke="{NIGHT_RULE}" stroke-width="1.5"/>')
    body.append(text(SANS, facts, 19, 84, 598, NIGHT_MUTED))
    body.append(text(MONO, "github.com/sajor2000/methodsmith", 18, W - 84, 598, NIGHT_TEXT, anchor="end"))
    desc = (
        f"Methodsmith: plan, work, review, compound. {skills} skills, {agents} reviewers, "
        f"{checklists} EQUATOR checklists, PHI guard."
    )
    return svg(W, H, "".join(body), "Methodsmith", desc, background=NIGHT)


def write(name, content):
    path = OUT / name
    path.write_text(content)
    print(f"wrote {path}")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    write("mark.svg", svg(64, 64, mark_tile(), "Methodsmith"))
    write("mark-light.svg", svg(64, 64, mark_glyph(INK, EMBER), "Methodsmith"))
    write("mark-dark.svg", svg(64, 64, mark_glyph(NIGHT_TEXT, EMBER_GLOW), "Methodsmith"))
    write(
        "favicon.svg",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Methodsmith</title>'
        + mark_tile()
        + "</svg>\n",
    )
    write("lockup-light.svg", lockup("light"))
    write("lockup-dark.svg", lockup("dark"))
    write("hero-light.svg", hero("light"))
    write("hero-dark.svg", hero("dark"))
    write("social-preview.svg", social_card())


if __name__ == "__main__":
    main()
