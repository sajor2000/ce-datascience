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

FONT_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/methodsmith/brand/fonts")
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
# The hallmark. A smith punches a hallmark into finished work to vouch for it;
# here a geometric M is struck into a plate with chamfered corners. Drawn on a
# 64-unit grid: plate stroke 3.4, M stems 6.2, flat-cut tops, and the vertex a
# little below centre so the counters balance optically.

FRAME_W = 3.4
FRAME = "M11 12 H53 L57 16 V48 L53 52 H11 L7 48 V16 Z"
# Outer edge of the stroked plate, for alignment.
MARK_BOX = (7 - FRAME_W / 2, 12 - FRAME_W / 2, 57 + FRAME_W / 2, 52 + FRAME_W / 2)


def _m_points(scale=1.0, cx=32.0, cy=32.0):
    stem, diag = 6.2, 6.2
    l0, l1, r0, r1 = 18.0, 18.0 + stem, 46.0 - stem, 46.0
    top, base, v = 20.5, 43.5, 37.0
    dv = diag * 1.35
    pts = [(l0, base), (l0, top), (l1, top), (32, v - dv), (r0, top), (r1, top), (r1, base),
           (r0, base), (r0, top + dv * 1.05), (32, v), (l1, top + dv * 1.05), (l1, base)]
    return [(cx + (x - 32) * scale, cy + (y - 32) * scale) for x, y in pts]


def m_path(scale=1.0, cy=32.0):
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in _m_points(scale, cy=cy)) + " Z"


def mark_glyph(fg, accent):
    """The full mark: ember plate, ink (or paper) M."""
    return (
        f'<path d="{FRAME}" fill="none" stroke="{accent}" stroke-width="{FRAME_W}" '
        f'stroke-linejoin="miter"/><path d="{m_path()}" fill="{fg}"/>'
    )


def mark_mono():
    """One-colour mark that follows the surrounding text colour."""
    return mark_glyph("currentColor", "currentColor")


def icon_tile(small=False, rx=0):
    """Square directory/avatar tile. At 32 px and below the plate is dropped
    and the M is enlarged, so small sizes stay crisp."""
    inner = (
        f'<path d="{m_path(1.55, cy=33)}" fill="{PAPER}"/>'
        if small
        else f'<g transform="translate(5.12 5.12) scale(0.84)">{mark_glyph(PAPER, EMBER_GLOW)}</g>'
    )
    return f'<rect width="64" height="64" rx="{rx}" fill="{INK}"/>' + inner


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
    return text(SERIF, "Methodsmith", size, x, baseline, fill, tracking=-0.015)


CAP = 0.66  # Source Serif 4 cap height, in em


def _mark_beside(fg, accent, x, baseline, size):
    """Place the mark beside a wordmark set at `size`: the plate is 1.6x the cap
    height and centred on it. Returns (svg, width of the mark)."""
    bx0, by0, bx1, by1 = MARK_BOX
    s = 1.6 * CAP * size / (by1 - by0)
    mid = baseline - CAP * size / 2
    y = mid - (by0 + by1) / 2 * s
    return place(mark_glyph(fg, accent), x - bx0 * s, y, 64 * s), (bx1 - bx0) * s


def lockup(theme):
    """Horizontal lockup: mark, one cap-height gap, wordmark."""
    fg, accent = (INK, EMBER) if theme == "light" else (NIGHT_TEXT, EMBER_GLOW)
    size, baseline = 64, 70
    mark, mw = _mark_beside(fg, accent, 0, baseline, size)
    gap = CAP * size * 0.62
    word_w = width_of(SERIF, "Methodsmith", size, -0.015)
    body = mark + wordmark(mw + gap, baseline, size, fg)
    return svg(round(mw + gap + word_w + 2), 92, body, "Methodsmith")


def lockup_stacked(theme):
    """Stacked lockup: mark centred above the wordmark."""
    fg, accent = (INK, EMBER) if theme == "light" else (NIGHT_TEXT, EMBER_GLOW)
    size = 64
    word_w = width_of(SERIF, "Methodsmith", size, -0.015)
    W = round(word_w + 8)
    bx0, by0, bx1, by1 = MARK_BOX
    s = 120 / (bx1 - bx0)
    mark = place(mark_glyph(fg, accent), W / 2 - (bx0 + bx1) / 2 * s, -by0 * s, 64 * s)
    baseline = (by1 - by0) * s + 22 + CAP * size
    body = mark + wordmark(4, baseline, size, fg)
    return svg(W, round(baseline + 18), body, "Methodsmith")


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


PLUGIN_LINE = "A plugin for Claude Code and Codex"


def hero(theme):
    """README banner. The README's H1 carries the name, so the banner leads
    with the mark and the promise instead of repeating the wordmark."""
    W, H = 1600, 560
    bg, fg, muted, accent, accent_text, rule = (
        (PAPER, INK, MUTED, EMBER, EMBER_DEEP, RULE)
        if theme == "light"
        else (NIGHT, NIGHT_TEXT, NIGHT_MUTED, EMBER_GLOW, EMBER_GLOW, NIGHT_RULE)
    )
    bx0, by0, bx1, by1 = MARK_BOX
    s = 168 / (by1 - by0)
    body = [place(mark_glyph(fg, accent), 112 - bx0 * s, 92 - by0 * s, 64 * s)]
    tx = 112 + (bx1 - bx0) * s + 56
    body.append(text(SERIF, "Rigorous methods for statistics,", 50, tx, 134, fg, tracking=-0.012))
    body.append(text(SERIF, "machine learning, and meta-analysis,", 50, tx, 194, fg, tracking=-0.012))
    body.append(text(SERIF, "from question to paper.", 50, tx, 254, fg, tracking=-0.012))
    body.append(text(SANS_MEDIUM, SIGNOFF, 26, tx, 300, accent_text))
    sw = width_of(SANS_MEDIUM, SIGNOFF, 26)
    body.append(text(SANS, "  ·  " + PLUGIN_LINE, 26, tx + sw, 300, muted))
    body.append(f'<line x1="112" y1="344" x2="{W - 112}" y2="344" stroke="{rule}" stroke-width="1.5"/>')
    body.append(loop_strip(250, W - 250, 408, theme, bg))
    desc = (
        "Methodsmith hallmark. Rigorous methods for statistics, machine learning, and meta-analysis, "
        "from question to paper. Every study compounds. A plugin for Claude Code and Codex. "
        "The loop: plan, work, review, compound, with an arrow returning from compound to plan."
    )
    return svg(W, H, "".join(body), "Methodsmith", desc, background=bg)


def social_card():
    W, H = 1280, 640
    body = []
    mark, mw = _mark_beside(NIGHT_TEXT, EMBER_GLOW, 84, 160, 92)
    body.append(mark)
    body.append(wordmark(84 + mw + 0.62 * CAP * 92, 160, 92, NIGHT_TEXT))
    body.append(text(SANS_MEDIUM, PLUGIN_LINE, 22, 86, 212, EMBER_GLOW, tracking=0.01))
    body.append(text(SANS, "Rigorous methods for statistics, machine learning,", 30, 84, 270, NIGHT_MUTED))
    body.append(text(SANS, "and meta-analysis, from question to paper. Every study compounds.", 30, 84, 310, NIGHT_MUTED))
    body.append(loop_strip(176, W - 176, 410, "dark", NIGHT, label_size=15, cmd_size=17))
    skills, agents, checklists = inventory()
    facts = f"{skills} skills  ·  {agents} specialist reviewers  ·  {checklists} EQUATOR checklists  ·  PHI guard"
    body.append(f'<line x1="84" y1="560" x2="{W - 84}" y2="560" stroke="{NIGHT_RULE}" stroke-width="1.5"/>')
    body.append(text(SANS, facts, 20, 84, 600, NIGHT_MUTED))
    body.append(text(MONO, "github.com/sajor2000/methodsmith", 18, W - 84, 600, NIGHT_TEXT, anchor="end"))
    desc = (
        f"Methodsmith, a plugin for Claude Code and Codex: plan, work, review, compound. "
        f"{skills} skills, {agents} reviewers, {checklists} EQUATOR checklists, PHI guard."
    )
    return svg(W, H, "".join(body), "Methodsmith", desc, background=NIGHT)


def write(name, content):
    path = OUT / name
    path.write_text(content)
    print(f"wrote {path}")


def bare(inner, title="Methodsmith", extra=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"{extra}>'
        f"<title>{title}</title>{inner}</svg>\n"
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    write("mark-light.svg", bare(mark_glyph(INK, EMBER)))
    write("mark-dark.svg", bare(mark_glyph(NIGHT_TEXT, EMBER_GLOW)))
    write("mark-mono.svg", bare(mark_mono(), extra=' fill="none"'))
    write("icon.svg", bare(icon_tile()))
    write("icon-small.svg", bare(icon_tile(small=True)))
    write("favicon.svg", bare(icon_tile(small=True, rx=12)))
    write("lockup-light.svg", lockup("light"))
    write("lockup-dark.svg", lockup("dark"))
    write("lockup-stacked-light.svg", lockup_stacked("light"))
    write("lockup-stacked-dark.svg", lockup_stacked("dark"))
    write("hero-light.svg", hero("light"))
    write("hero-dark.svg", hero("dark"))
    write("social-preview.svg", social_card())


if __name__ == "__main__":
    main()
