"""Corner-treatment study for the hallmark mark (direction C).

    python3 docs/brand/directions/build_hallmark_study.py

Writes docs/brand/directions/c-hallmark/corner-study.png: each variant at
128 px, at 32 and 16 px rasterised at true size (shown 6x), in one colour,
and beside the serif wordmark.
"""

import base64
import subprocess
from pathlib import Path

from build_directions import CHROME, FONTS, INK, MUTED, NIGHT, NIGHT_TEXT, PAPER, RULE, stroke

HERE = Path(__file__).resolve().parent
EMBER, GLOW = "#C2502A", "#E57A50"

def m_flat(fg, stem=6.2, diag=6.2):
    """A geometric M with flat-cut tops, centred optically in the frame: the
    vertex sits a little below centre so the counters balance."""
    l0, l1, r0, r1 = 18.0, 18.0 + stem, 46.0 - stem, 46.0
    top, base, v = 20.5, 43.5, 37.0
    dv = diag * 1.35  # vertical thickness of a ~48 degree diagonal
    pts = [(l0, base), (l0, top), (l1, top), (32, v - dv), (r0, top), (r1, top), (r1, base),
           (r0, base), (r0, top + dv * 1.05), (32, v), (l1, top + dv * 1.05), (l1, base)]
    return f'<path d="M{" L".join(f"{x:.2f} {y:.2f}" for x, y in pts)} Z" fill="{fg}"/>'


def frame_concave(r):
    x0, y0, x1, y1 = 7, 12, 57, 52
    return (
        f"M{x0 + r} {y0} H{x1 - r} A{r} {r} 0 0 0 {x1} {y0 + r} V{y1 - r} "
        f"A{r} {r} 0 0 0 {x1 - r} {y1} H{x0 + r} A{r} {r} 0 0 0 {x0} {y1 - r} "
        f"V{y0 + r} A{r} {r} 0 0 0 {x0 + r} {y0} Z"
    )


def frame_chamfer(c, x0=7, y0=12, x1=57, y1=52):
    return (
        f"M{x0 + c} {y0} H{x1 - c} L{x1} {y0 + c} V{y1 - c} L{x1 - c} {y1} "
        f"H{x0 + c} L{x0} {y1 - c} V{y0 + c} Z"
    )


def frame_round(r, x0=7, y0=12, x1=57, y1=52):
    return f"M{x0 + r} {y0} H{x1 - r} Q{x1} {y0} {x1} {y0 + r} V{y1 - r} Q{x1} {y1} {x1 - r} {y1} H{x0 + r} Q{x0} {y1} {x0} {y1 - r} V{y0 + r} Q{x0} {y0} {x0 + r} {y0} Z"


def variant(frame, inner=None):
    def glyph(fg, accent):
        out = stroke(frame, accent, 3.4, join="miter")
        if inner:
            out += stroke(inner, accent, 1.2, join="miter")
        return out + m_flat(fg)

    return glyph


VARIANTS = [
    ("C1 Soft concave r4", variant(frame_concave(4))),
    ("C2 Chamfer c4", variant(frame_chamfer(4))),
    ("C3 Chamfer c4 + inner rule", variant(frame_chamfer(4), frame_chamfer(2.4, 10.8, 15.8, 53.2, 48.2))),
    ("C4 Rounded r5 + inner rule", variant(frame_round(5), frame_round(3, 10.8, 15.8, 53.2, 48.2))),
]


def svg(inner, size):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 64 64">{inner}</svg>'


def raster(inner, px):
    data = base64.b64encode(svg(inner, px).encode()).decode()
    return (
        f'<canvas class="pix" data-svg="{data}" width="{px}" height="{px}" '
        f'style="width:{px * 6}px;height:{px * 6}px"></canvas>'
    )


def main():
    rows = []
    for name, glyph in VARIANTS:
        light = glyph(INK, EMBER)
        rows.append(f"""<tr><th>{name}</th>
<td class="w">{svg(light, 128)}</td>
<td>{raster(light, 32)}</td><td>{raster(light, 16)}</td>
<td class="w">{svg(glyph(INK, INK), 96)}</td>
<td class="d">{svg(glyph(NIGHT_TEXT, GLOW), 96)}</td>
<td class="w"><div class="lk">{svg(light, 70)}<span>Methodsmith</span></div></td></tr>""")
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family:'Source Serif 4'; src:url('file://{FONTS}/SourceSerif4.ttf'); font-weight:200 900; }}
@font-face {{ font-family:'IBM Plex Sans'; src:url('file://{FONTS}/IBMPlexSans.ttf'); font-weight:100 700; }}
body {{ margin:0; background:{PAPER}; font-family:'IBM Plex Sans'; color:{INK}; padding:40px; width:1520px; }}
h1 {{ font-family:'Source Serif 4'; font-weight:600; font-size:34px; margin:0 0 6px; }}
p {{ color:{MUTED}; margin:0 0 20px; }}
table {{ border-collapse:separate; border-spacing:14px 10px; }}
th {{ text-align:left; font-weight:500; font-size:15px; width:210px; }}
thead th {{ color:{MUTED}; font-size:12px; letter-spacing:.08em; text-transform:uppercase; }}
td {{ text-align:center; vertical-align:middle; }}
td.w {{ background:#fff; border:1px solid {RULE}; border-radius:8px; padding:10px; }}
td.d {{ background:{NIGHT}; border-radius:8px; padding:10px; }}
.pix {{ image-rendering:pixelated; display:block; }}
.lk {{ display:flex; align-items:center; gap:12px; }}
.lk span {{ font-family:'Source Serif 4'; font-weight:600; font-size:46px; letter-spacing:-0.015em; font-variation-settings:'opsz' 60; }}
</style></head><body>
<h1>Hallmark corner study</h1><p>Frame treatments and M stress, checked at true pixel size and in one colour.</p>
<table><thead><tr><th></th><th>128</th><th>32 px x6</th><th>16 px x6</th><th>one colour</th><th>dark</th><th>with wordmark</th></tr></thead>
{"".join(rows)}</table>
<script>
for (const c of document.querySelectorAll('canvas.pix')) {{
  const img = new Image();
  img.onload = () => c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  img.src = 'data:image/svg+xml;base64,' + c.dataset.svg;
}}
</script></body></html>"""
    page = HERE / "c-hallmark" / "corner-study.html"
    page.write_text(html)
    png = page.with_suffix(".png")
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
         "--allow-file-access-from-files", "--virtual-time-budget=3000", "--window-size=1600,940",
         f"--screenshot={png}", page.as_uri()],
        check=True, capture_output=True,
    )
    page.unlink()
    print(f"wrote {png}")


if __name__ == "__main__":
    main()
