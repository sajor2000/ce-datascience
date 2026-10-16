"""Render the terminal demo as an animated SVG (SMIL, so it plays inside a
GitHub README <img>) plus a static poster SVG of the last scene.

    python docs/brand/scripts/build_demo.py website/static/brand
"""

import sys
from html import escape
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from demo_transcript import CAPTION, SCENES  # noqa: E402

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "website/static/brand")

W, PAD, TOP = 1200, 36, 76
LINE, SIZE, CHAR = 25, 15.5, 9.3  # line height, font size, mono advance (approx.)
FONT = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

COLOURS = {
    "cmd": "#ECE8E0",
    "head": "#ECE8E0",
    "text": "#D5D1C9",
    "dim": "#A3AAB5",
    "done": "#8CC9A0",
    "wip": "#E5B65C",
    "todo": "#A3AAB5",
    "accent": "#E57A50",
    "warn": "#E5B65C",
    "p1": "#E57A50",
    "p2": "#E5B65C",
    "p3": "#A3AAB5",
    "": "#A3AAB5",
}
BOLD = {"cmd", "head", "accent", "p1"}

TYPE_CPS = 22  # typed characters per second
LINE_GAP = 0.16  # seconds between output lines
HOLD = 3.2  # seconds a finished scene stays on screen
# Every animation begins this far into its timeline, so the very first frame
# (and any viewer that pauses SMIL for an off-screen image) shows a complete
# first scene instead of an empty terminal. Set in main() from the schedule.
OFFSET = 0.0
FADE = 0.35

rows = max(len(scene) for scene in SCENES)
H = TOP + rows * LINE + 64


def schedule():
    """Return [(scene_start, scene_end, [line_times], [type_end])], total."""
    t, plan = 0.6, []
    for scene in SCENES:
        start, times, typed = t, [], []
        for style, value in scene:
            if style == "cmd":
                times.append(t)
                t += len(value) / TYPE_CPS + 0.45
                typed.append(t - 0.45)
            else:
                times.append(t)
                typed.append(None)
                t += LINE_GAP if value else LINE_GAP / 2
        t += HOLD
        plan.append((start, t, times, typed))
        t += FADE
    return plan, t


def visible(start, end, total):
    """SMIL opacity animation: hidden, shown from start to end, hidden."""
    a, b = start / total, min(end / total, 1)
    return (
        f'<animate attributeName="opacity" values="0;1;0" keyTimes="0;{a:.4f};{b:.4f}" '
        f'dur="{total:.2f}s" begin="-{OFFSET:.2f}s" repeatCount="indefinite" calcMode="discrete"/>'
    )


def typed_clip(cid, x, y, width, start, end, total, full=False):
    """A clip rect that grows in whole-character steps while a command types."""
    steps = max(1, round((end - start) * TYPE_CPS))
    keys, vals = ["0"], ["0"]
    for i in range(steps + 1):
        keys.append(f"{(start + (end - start) * i / steps) / total:.4f}")
        vals.append(f"{width * i / steps:.1f}")
    return (
        f'<clipPath id="{cid}"><rect x="{x}" y="{y - SIZE}" height="{LINE}" width="{width if full else 0}">'
        f'<animate attributeName="width" values="{";".join(vals)}" keyTimes="{";".join(keys)}" '
        f'dur="{total:.2f}s" begin="-{OFFSET:.2f}s" repeatCount="indefinite" calcMode="discrete"/></rect></clipPath>'
    )


def line_el(style, value, x, y, extra=""):
    weight = ' font-weight="600"' if style in BOLD else ""
    return (
        f'<text x="{x}" y="{y}" fill="{COLOURS[style]}"{weight} xml:space="preserve"{extra}>'
        f"{escape(value)}</text>"
    )


def chrome(title):
    return (
        f'<rect width="{W}" height="{H}" rx="14" fill="#11141A"/>'
        f'<rect x="0.75" y="0.75" width="{W - 1.5}" height="{H - 1.5}" rx="13.5" fill="none" '
        f'stroke="#2E3440" stroke-width="1.5"/>'
        f'<line x1="0" y1="44" x2="{W}" y2="44" stroke="#2E3440" stroke-width="1.5"/>'
        + "".join(f'<circle cx="{26 + i * 20}" cy="22" r="6" fill="#2E3440"/>' for i in range(3))
        + f'<text x="{W / 2}" y="27" fill="#A3AAB5" text-anchor="middle" font-size="13">'
        f"{escape(title)}</text>"
        f'<text x="{W - PAD}" y="{H - 22}" fill="#7D8592" text-anchor="end" font-size="12.5">'
        f"{escape(CAPTION)}</text>"
    )


def scene_body(scene, times, typed, total, animate, sid, base=0):
    out = []
    for i, (style, value) in enumerate(scene):
        y = TOP + i * LINE
        if style == "cmd":
            prompt = f'<text x="{PAD}" y="{y}" fill="#E57A50" font-weight="600">&gt;</text>'
            if animate:
                cid = f"c{sid}"
                width = len(value) * CHAR + 4
                out.append(typed_clip(cid, PAD + 22, y, width, times[i], typed[i], total, base == 1))
                out.append(prompt + line_el(style, value, PAD + 22, y, f' clip-path="url(#{cid})"'))
            else:
                out.append(prompt + line_el(style, value, PAD + 22, y))
        elif value:
            el = line_el(style, value, PAD, y)
            if animate:
                el = el.replace("</text>", visible(times[i], total * 2, total) + "</text>", 1)
                el = el.replace(">", f' opacity="{base}">', 1)
            out.append(el)
    return "".join(out)


def svg(body, title, desc):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
        f'role="img" aria-labelledby="t d" font-family="{FONT}" font-size="{SIZE}">'
        f'<title id="t">{escape(title)}</title><desc id="d">{escape(desc)}</desc>{body}</svg>\n'
    )


DESC = (
    "Terminal replay on synthetic data. /method-workflow detects an observational study and shows "
    "the lifecycle card with method-sap as the next step. /method-sap links claim C1 to an ICH E9(R1) "
    "estimand and lists two decisions that block finalization. /method-review reports two P1, one P2 "
    "and one P3 finding, applies small-cell suppression, and returns Not ready."
)


def main():
    global OFFSET
    plan, total = schedule()
    first_start, first_end = plan[0][0], plan[0][1]
    OFFSET = first_end - HOLD + 0.2  # scene one fully typed, at the start of its hold
    scenes = []
    for sid, ((start, end, times, typed), scene) in enumerate(zip(plan, SCENES)):
        # Renderers that ignore SMIL show base values: only the last scene, complete.
        base = 1 if sid == len(SCENES) - 1 else 0
        group = scene_body(scene, times, typed, total, True, sid, base)
        scenes.append(f'<g opacity="{base}">{visible(start, end, total)}{group}</g>')
    animated = svg(chrome("methodsmith demo  |  synthetic data") + "".join(scenes), "Methodsmith terminal demo", DESC)
    (OUT / "demo.svg").write_text(animated)
    last = len(SCENES) - 1
    poster = scene_body(SCENES[last], plan[last][2], plan[last][3], total, False, last)
    (OUT / "demo-poster.svg").write_text(
        svg(chrome("methodsmith demo  |  synthetic data") + poster, "Methodsmith review results", DESC)
    )
    print(f"demo: {total:.1f}s loop, {W}x{H}")


if __name__ == "__main__":
    main()
