"""Render logo-direction contact sheets for the Methodsmith logo audit.

    python3 docs/brand/directions/build_directions.py

Each direction defines a mark on a 64-unit grid, a wordmark style and an app
icon. The script writes the SVG masters and an HTML contact sheet per direction
to docs/brand/directions/<id>/, then screenshots each sheet with headless
Chrome. The wordmarks use local font files (downloaded by
docs/brand/scripts/render-brand.sh to /tmp/methodsmith/brand/fonts); final
assets for the chosen direction are rebuilt with outlined text by the brand
generator.
"""

import base64
import math
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
FONTS = Path("/tmp/methodsmith/brand/fonts")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

INK = "#1B1F27"
PAPER = "#F7F5F0"
NIGHT = "#11141A"
NIGHT_TEXT = "#ECE8E0"
MUTED = "#5B6370"
RULE = "#DCD8CF"


# --- geometry helpers ---------------------------------------------------------


def arc(cx, cy, r, a0, a1):
    """SVG arc path from angle a0 to a1 (degrees, clockwise from 12 o'clock)."""
    def p(a):
        t = math.radians(a - 90)
        return cx + r * math.cos(t), cy + r * math.sin(t)

    (x0, y0), (x1, y1) = p(a0), p(a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return f"M{x0:.2f} {y0:.2f} A{r} {r} 0 {large} 1 {x1:.2f} {y1:.2f}"


def stroke(d, colour, width, cap="butt", join="round"):
    return (
        f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="{width}" '
        f'stroke-linecap="{cap}" stroke-linejoin="{join}"/>'
    )


def fill(d, colour):
    return f'<path d="{d}" fill="{colour}"/>'


# --- directions ---------------------------------------------------------------
# glyph(fg, accent) -> SVG inner markup on the 64 grid, unframed.
# app_icon(): the glyph inside its square directory tile.


def current_glyph(fg, accent):
    m = (
        "M18 44.5 V24 a7 7 0 0 1 14 0 V44.5 "
        "M32 24 a7 7 0 0 1 14 0 V44.5"
    )
    return stroke(m, fg, 6.2) + fill("M11 43.5 H53 L48.5 49.5 H15.5 Z", accent)


def anvil_glyph(fg, accent):
    """(a) Tightened m on anvil. The m is drawn as filled outlines so stems,
    arches and the shoulder notch are exact; the anvil gains a horn and a
    waist so it reads as an anvil, not an underline."""
    w, r, top, base = 6.4, 6.6, 13, 40.5  # stem width, arch radius (centre line)
    xs = (19.5, 19.5 + 2 * r, 19.5 + 4 * r)  # stem centres
    h = w / 2
    m = []
    for x in xs:
        m.append(f"M{x - h:.2f} {top + r:.2f} V{base} H{x + h:.2f} V{top + r:.2f} Z")
    for cx in (xs[0] + r, xs[1] + r):
        ro, ri = r + h, r - h
        m.append(
            f"M{cx - ro:.2f} {top + r:.2f} A{ro} {ro} 0 0 1 {cx + ro:.2f} {top + r:.2f} "
            f"H{cx + ri:.2f} A{ri} {ri} 0 0 0 {cx - ri:.2f} {top + r:.2f} Z"
        )
    # Face with a horn to the left and a square heel, a narrow waist, a foot.
    anvil = (
        "M2.5 40.5 H57 V45 H45 L41 48 V50 H47 V53.5 H17 V50 H23 V48 L19 45 H13 "
        "C8.5 45 5 43.5 2.5 40.5 Z"
    )
    return fill(" ".join(m), fg) + fill(anvil, accent)


def loop_glyph(fg, accent):
    """(b) The loop as the letter: one continuous m whose last stroke sweeps
    back under itself to where it began. The ink part is plan, work, review;
    the ember return is compound, the same device as the README loop."""
    w = 6.4
    m = "M15 36 V25 a7.5 7.5 0 0 1 15 0 V40 M30 25 a7.5 7.5 0 0 1 15 0 V40"
    ret = "M45 39.5 V42 a8 8 0 0 1 -8 8 H23 a8 8 0 0 1 -8 -8 V41"
    return stroke(m, fg, w) + stroke(ret, accent, w)


def _m_flat(fg, scale=1.0, cy=32.0):
    stem, dv = 6.2, 6.2 * 1.35
    l0, l1, r0, r1, top, base, v = 18, 18 + stem, 46 - stem, 46, 20.5, 43.5, 37
    pts = [(l0, base), (l0, top), (l1, top), (32, v - dv), (r0, top), (r1, top), (r1, base),
           (r0, base), (r0, top + dv * 1.05), (32, v), (l1, top + dv * 1.05), (l1, base)]
    pts = [(32 + (x - 32) * scale, cy + (y - 32) * scale) for x, y in pts]
    return fill("M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + " Z", fg)


def hallmark_glyph(fg, accent):
    """(c) A maker's mark. Smiths punch a hallmark into finished work to vouch
    for it; here a flat-topped geometric M is struck into a plate with
    chamfered corners (refined after the corner study)."""
    plate = "M11 12 H53 L57 16 V48 L53 52 H11 L7 48 V16 Z"
    return stroke(plate, accent, 3.4, join="miter") + _m_flat(fg)


def hallmark_icon_glyph(fg, accent):
    """Small-size form of (c): the M alone, enlarged, for 16-32 px."""
    return _m_flat(fg, 1.55, 33)


DIRECTIONS = {
    "current": {
        "title": "Current: m on an anvil face",
        "glyph": current_glyph,
        "accent": "#C2502A",
        "accent_dark": "#E57A50",
        "tile": INK,
        "tile_fg": PAPER,
        "word": ("Source Serif 4", 600, "-0.012em", "Methodsmith", "none"),
    },
    "a-anvil": {
        "title": "A. Tightened m on anvil",
        "glyph": anvil_glyph,
        "accent": "#C2502A",
        "accent_dark": "#E57A50",
        "tile": INK,
        "tile_fg": PAPER,
        "word": ("Source Serif 4", 600, "-0.018em", "Methodsmith", "none"),
    },
    "b-loop": {
        "title": "B. The loop as the letter",
        "glyph": loop_glyph,
        "accent": "#C2502A",
        "accent_dark": "#E57A50",
        "tile": INK,
        "tile_fg": PAPER,
        "word": ("IBM Plex Sans", 600, "-0.025em", "methodsmith", "none"),
    },
    "c-hallmark": {
        "title": "C. Hallmark monogram (chosen, refined)",
        "glyph": hallmark_glyph,
        "small": hallmark_icon_glyph,
        "accent": "#C2502A",
        "accent_dark": "#E57A50",
        "tile": INK,
        "tile_fg": PAPER,
        "word": ("Source Serif 4", 600, "-0.015em", "Methodsmith", "none"),
    },
}


def svg(inner, size=64, view=64, extra=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 {view} {view}" {extra}>{inner}</svg>'
    )


def app_icon(d, small=False):
    """Square directory tile (Claude `icon`, Codex `logo`): square, at least
    48 px, per the directories' specs; they apply their own corner masks."""
    glyph = (d.get("small") if small and d.get("small") else d["glyph"])(d["tile_fg"], d["accent_dark"])
    if small and d.get("small"):
        return f'<rect width="64" height="64" fill="{d["tile"]}"/>' + glyph
    return f'<rect width="64" height="64" fill="{d["tile"]}"/>' + f'<g transform="translate(5.12 5.12) scale(0.84)">{glyph}</g>'


# --- contact sheet ------------------------------------------------------------


def font_faces():
    return f"""
@font-face {{ font-family: 'Source Serif 4'; src: url('file://{FONTS}/SourceSerif4.ttf'); font-weight: 200 900; }}
@font-face {{ font-family: 'IBM Plex Sans'; src: url('file://{FONTS}/IBMPlexSans.ttf'); font-weight: 100 700; }}
@font-face {{ font-family: 'IBM Plex Mono'; src: url('file://{FONTS}/IBMPlexMono-Medium.ttf'); font-weight: 500; }}
"""


def wordmark(d, colour, size):
    family, weight, tracking, text, _ = d["word"]
    return (
        f'<span style="font-family:\'{family}\';font-weight:{weight};letter-spacing:{tracking};'
        f'font-size:{size}px;color:{colour};line-height:1;white-space:nowrap;'
        f'font-variation-settings:\'opsz\' 60">{text}</span>'
    )


def lockup(d, theme, size=56):
    fg, accent = (INK, d["accent"]) if theme == "light" else (NIGHT_TEXT, d["accent_dark"])
    mark = svg(d["glyph"](fg, accent), size=round(size * 1.3))
    return f'<div class="lockup">{mark}{wordmark(d, fg, size)}</div>'


def pixel(d, px, small=False):
    """A mark rasterised at its true pixel size on a canvas, then shown 6x with
    hard edges, so the sheet shows what a 16 px favicon really looks like."""
    inner = app_icon(d, small=small and px <= 32)
    data = base64.b64encode(svg(inner, size=px).encode()).decode()
    return (
        f'<figure><canvas class="pix" data-svg="{data}" width="{px}" height="{px}" '
        f'style="width:{px * 6}px;height:{px * 6}px"></canvas>'
        f"<figcaption>{px} px, shown 6x</figcaption></figure>"
    )


def sheet(key, d):
    accent = d["accent"]
    mono_ink = svg(d["glyph"](INK, INK), size=150)
    mono_rev = svg(d["glyph"](PAPER, PAPER), size=150)
    small = bool(d.get("small"))
    tile = svg(app_icon(d), size=150)
    tile_small = svg(app_icon(d, small=True), size=150) if small else ""
    fav = svg(app_icon(d, small=True), size=16)
    nav_mark = svg(d["glyph"](INK, accent), size=30)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
{font_faces()}
* {{ box-sizing: border-box; }}
body {{ margin:0; width:1600px; background:{PAPER}; color:{INK}; font-family:'IBM Plex Sans'; padding:48px 56px 56px; }}
h1 {{ font-family:'Source Serif 4'; font-weight:600; font-size:40px; margin:0 0 4px; letter-spacing:-0.01em; }}
.sub {{ color:{MUTED}; margin:0 0 28px; font-size:17px; }}
h2 {{ font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:{MUTED}; font-weight:500; margin:0 0 12px; }}
.row {{ display:flex; gap:28px; align-items:flex-end; margin-bottom:34px; }}
.cell {{ background:#fff; border:1px solid {RULE}; border-radius:10px; padding:20px; }}
.dark {{ background:{NIGHT}; border-color:#2E3440; }}
figure {{ margin:0; text-align:center; }}
figcaption {{ font-size:12px; color:{MUTED}; margin-top:8px; }}
.pix {{ image-rendering: pixelated; display:block; }}
.lockup {{ display:flex; align-items:center; gap:14px; }}
.lockup svg {{ flex:none; }}
/* context mockups */
.gh {{ width:690px; background:#fff; border:1px solid #d0d7de; border-radius:8px; padding:16px 20px; font-family:-apple-system,'Segoe UI',sans-serif; }}
.gh .top {{ display:flex; align-items:center; gap:10px; font-size:20px; }}
.gh .top b {{ font-weight:600; }}
.gh .pill {{ font-size:12px; border:1px solid #d0d7de; border-radius:2em; padding:0 7px; color:#59636e; }}
.gh .avatar {{ width:24px; height:24px; border-radius:50%; overflow:hidden; }}
.gh .card {{ margin-top:14px; border:1px solid #d0d7de; border-radius:6px; overflow:hidden; }}
.gh .og {{ background:{NIGHT}; height:170px; display:flex; align-items:center; padding:0 34px; }}
.nav {{ width:690px; display:flex; align-items:center; gap:22px; background:{PAPER}; border:1px solid {RULE}; border-radius:8px; padding:12px 18px; font-size:15px; }}
.nav a {{ color:{INK}; text-decoration:underline; text-underline-offset:3px; }}
.dir {{ width:340px; background:#fff; border:1px solid #e5e2da; border-radius:14px; padding:18px; font-family:-apple-system,'Segoe UI',sans-serif; }}
.dir .h {{ display:flex; gap:12px; align-items:center; }}
.dir .name {{ font-weight:600; font-size:16px; }}
.dir .by {{ font-size:12.5px; color:#6b6b6b; }}
.dir p {{ font-size:13.5px; color:#3d3d3d; margin:12px 0 14px; line-height:1.45; }}
.dir .btn {{ display:inline-block; background:#1f1f1f; color:#fff; border-radius:8px; padding:6px 14px; font-size:13px; }}
.tabs {{ width:690px; background:#dfe1e5; border-radius:10px 10px 0 0; padding:8px 8px 0; display:flex; gap:2px; font-family:-apple-system,'Segoe UI',sans-serif; font-size:12.5px; }}
.tab {{ display:flex; align-items:center; gap:8px; padding:8px 14px; border-radius:8px 8px 0 0; width:220px; color:#3c4043; white-space:nowrap; overflow:hidden; }}
.tab.on {{ background:#fff; }}
.tab svg {{ flex:none; }}
.tab .g {{ width:16px; height:16px; border-radius:3px; background:#9aa0a6; }}
.addr {{ width:690px; background:#fff; border:1px solid #dfe1e5; border-top:0; padding:8px 14px; font-size:12.5px; color:#5f6368; font-family:-apple-system,sans-serif; }}
</style></head><body>
<h1>{d["title"]}</h1>
<p class="sub">Methodsmith logo direction &middot; {key}</p>

<h2>Mark sizes</h2>
<div class="row">
  <figure><div class="cell">{svg(d["glyph"](INK, accent), size=256)}</div><figcaption>512 master, shown at 256</figcaption></figure>
  <figure><div class="cell">{svg(app_icon(d), size=64)}</div><figcaption>64 px</figcaption></figure>
  {pixel(d, 32, True)}
  {pixel(d, 16, True)}
  <figure><div class="cell" style="display:flex;gap:14px;align-items:flex-end">{svg(app_icon(d, small=True), size=16)}{svg(app_icon(d, small=True), size=32)}{svg(app_icon(d), size=64)}</div><figcaption>16 / 32 / 64 at 1x</figcaption></figure>
</div>

<h2>Lockups</h2>
<div class="row">
  <div class="cell" style="padding:28px 34px">{lockup(d, "light")}</div>
  <div class="cell dark" style="padding:28px 34px">{lockup(d, "dark")}</div>
</div>

<h2>Directory tile, monochrome</h2>
<div class="row">
  <figure>{tile}<figcaption>Claude / Codex directory tile</figcaption></figure>
  {f'<figure>{tile_small}<figcaption>small-size form</figcaption></figure>' if small else ''}
  <figure><div class="cell">{mono_ink}</div><figcaption>one colour</figcaption></figure>
  <figure><div class="cell" style="background:{INK}">{mono_rev}</div><figcaption>reversed</figcaption></figure>
</div>

<h2>In context</h2>
<div class="row" style="align-items:flex-start">
  <div style="display:flex;flex-direction:column;gap:22px">
    <div class="gh">
      <div class="top"><div class="avatar">{svg(app_icon(d, small=True), size=24)}</div><span>sajor2000 / <b>methodsmith</b></span><span class="pill">Public</span></div>
      <div class="card"><div class="og"><div class="lockup">{svg(d["glyph"](NIGHT_TEXT, d["accent_dark"]), size=78)}{wordmark(d, NIGHT_TEXT, 58)}</div></div></div>
    </div>
    <div class="nav">{nav_mark}<b style="font-family:'{d["word"][0]}';font-weight:600;font-size:19px;letter-spacing:{d["word"][2]}">{d["word"][3]}</b><a>Setup guide</a><a>Guideline sources</a><a>Skills and agents</a></div>
    <div><div class="tabs"><div class="tab on">{fav}<span>Methodsmith | Rigorous methods</span></div><div class="tab"><span class="g"></span><span>GitHub</span></div><div class="tab"><span class="g"></span><span>PubMed</span></div></div>
    <div class="addr">sajor2000.github.io/methodsmith/</div></div>
  </div>
  <div class="dir">
    <div class="h">{svg(app_icon(d), size=48)}<div><div class="name">Methodsmith</div><div class="by">Juan Carlos Rojas &middot; Plugin</div></div></div>
    <p>Rigorous methods for statistics, machine learning, and meta-analysis, from question to paper.</p>
    <span class="btn">Install</span>
  </div>
</div>
<script>
for (const c of document.querySelectorAll('canvas.pix')) {{
  const img = new Image();
  img.onload = () => c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  img.src = 'data:image/svg+xml;base64,' + c.dataset.svg;
}}
</script>
</body></html>"""


def main(keys):
    for key in keys:
        d = DIRECTIONS[key]
        out = HERE / key
        out.mkdir(parents=True, exist_ok=True)
        (out / "mark.svg").write_text(svg(d["glyph"](INK, d["accent"])) + "\n")
        (out / "mark-dark.svg").write_text(svg(d["glyph"](NIGHT_TEXT, d["accent_dark"])) + "\n")
        (out / "mark-mono.svg").write_text(svg(d["glyph"](INK, INK)) + "\n")
        (out / "tile.svg").write_text(svg(app_icon(d)) + "\n")
        html = out / "sheet.html"
        html.write_text(sheet(key, d))
        png = out / "contact-sheet.png"
        subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
             "--allow-file-access-from-files", "--virtual-time-budget=3000", "--window-size=1600,1560", f"--screenshot={png}", html.as_uri()],
            check=True, capture_output=True,
        )
        html.unlink()
        print(f"wrote {png.relative_to(HERE.parents[2])}")


if __name__ == "__main__":
    main(sys.argv[1:] or list(DIRECTIONS))
