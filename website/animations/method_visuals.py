"""Shared design system and content for the README diagrams and the site video.

Render on macOS: the type pairs Avenir Next (prose) with Menlo (skill names).
Other systems fall back to their default sans and mono faces.
"""

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Circle,
    Line,
    RoundedRectangle,
    Text,
    VGroup,
)

# Editorial palette: warm paper, ink text, six muted phase hues that stay
# distinguishable in print and for common color-vision deficiencies.
PAPER = "#F7F5F0"
CARD = "#FFFFFF"
INK = "#1B1F27"
MUTED = "#5B6370"
FAINT = "#9AA1AB"
RULE = "#DCD8CF"
SHADOW = "#1B1F27"

SANS = "Avenir Next"
MONO = "Menlo"

# (phase, purpose, color, [(skill, what it does)])
PHASES = (
    (
        "Frame",
        "ask a sharp question",
        "#1D4E89",
        (
            ("method-brainstorm", "compare designs, scope it"),
            ("method-question", "PICO, FINER, hypothesis"),
            ("method-pubmed", "MeSH-aware search"),
            ("method-evidence-map", "cited evidence map"),
            ("method-extract", "methods from prior papers"),
        ),
    ),
    (
        "Design",
        "size it and register it",
        "#2A7F7A",
        (
            ("method-checklist", "pick the EQUATOR guideline"),
            ("method-meta-analysis", "pool effects: REML + HKSJ"),
            ("method-power", "sample size and power"),
            ("method-trial-design", "group-sequential frontiers"),
            ("method-prereg", "OSF, CT.gov, PROSPERO"),
        ),
    ),
    (
        "Data",
        "build and trust the cohort",
        "#7A5C1E",
        (
            ("method-cohort", "index event, waterfall, SQL"),
            ("method-data-qa", "GO / NO-GO quality gate"),
            ("method-phenotype", "PPV, NPV, weighted Se/Sp"),
            ("method-clif", "ICU data-format rules"),
            ("method-omics-qc", "omics QC, batch checks"),
        ),
    ),
    (
        "Plan",
        "lock the analysis first",
        "#A61B2B",
        (
            ("method-model-choice", "justify the model choice"),
            ("method-plan", "SAP with E9(R1) estimands"),
            ("method-grill", "stress-test the plan"),
            ("method-sap-workbook", "SAP workbook companion"),
            ("method-sprint", "scoped sprints, data lock"),
        ),
    ),
    (
        "Execute",
        "run it reproducibly",
        "#5B3F8C",
        (
            ("method-work", "SAP-traceable analysis"),
            ("method-r", "R, targets, testthat"),
            ("method-marimo", "reactive Python notebooks"),
            ("method-ml-track", "hashes, splits, metrics"),
            ("method-verify", "leakage, direction, PHI gate"),
        ),
    ),
    (
        "Review",
        "check it, then publish",
        "#2F6B3B",
        (
            ("method-review", "55 specialist reviewers"),
            ("method-table1", "Table 1 by study design"),
            ("method-figure", "publication figures"),
            ("method-model-card", "calibration, fairness, limits"),
            ("method-submission-package", "submission package"),
        ),
    ),
)

GUARDRAILS = (
    ("ICH E9(R1)", "estimands in every SAP"),
    ("39", "reporting checklists"),
    ("55", "specialist reviewers"),
    ("PHI-safe", "aggregate-only outputs"),
)


def text(value, size, color=INK, weight="NORMAL", font=SANS):
    return Text(value, font=font, font_size=size, color=color, weight=weight)


def fit(mobject, max_width):
    if mobject.width > max_width:
        mobject.scale_to_fit_width(max_width)
    return mobject


def shadowed(box, offset=0.045, opacity=0.08):
    """A soft drop shadow: the same shape, offset and faintly filled."""
    shadow = box.copy().set_fill(SHADOW, opacity=opacity).set_stroke(width=0)
    shadow.shift(RIGHT * offset + DOWN * offset * 1.6)
    return VGroup(shadow, box)


def heading(title, subtitle, width=12.6, top_buff=0.38):
    head = text(title, 40, weight="BOLD")
    sub = text(subtitle, 20, color=MUTED)
    group = VGroup(head, sub).arrange(DOWN, buff=0.16)
    fit(group, width)
    return group


def number_badge(number, color, radius=0.2):
    disc = Circle(radius=radius, stroke_width=0).set_fill(color, opacity=1)
    label = text(str(number), 17, color="#FFFFFF", weight="BOLD").move_to(disc)
    return VGroup(disc, label)


def skill_row(name, detail, color, name_scale=1.0, detail_scale=1.0):
    dot = Circle(radius=0.045, stroke_width=0).set_fill(color, opacity=1)
    skill = text(name, 15, color=color, weight="BOLD", font=MONO).scale(name_scale)
    what = text(detail, 14, color=MUTED).scale(detail_scale)
    words = VGroup(skill, what).arrange(DOWN, aligned_edge=LEFT, buff=0.07)
    dot.next_to(skill, LEFT, buff=0.12)
    return VGroup(dot, words)


def _uniform_scales(phases, room):
    """One scale for every skill name and one for every description, so type
    stays consistent across columns instead of shrinking per item."""
    names = [text(n, 15, weight="BOLD", font=MONO).width for *_, skills in phases for n, _ in skills]
    details = [text(d, 14).width for *_, skills in phases for _, d in skills]
    return min(1.0, room / max(names)), min(1.0, room / max(details))


def phase_column(index, phase, purpose, color, skills, width=2.12, scales=(1.0, 1.0)):
    band = RoundedRectangle(
        corner_radius=0.12, width=width, height=0.16, stroke_width=0
    ).set_fill(color, opacity=1)
    badge = number_badge(index, color)
    title = fit(text(phase, 20, weight="BOLD"), width - 0.75)
    head = VGroup(badge, title).arrange(RIGHT, buff=0.12)
    sub = fit(text(purpose, 13, color=color, weight="BOLD"), width - 0.32)
    rule = Line(LEFT, RIGHT, stroke_width=1, color=RULE).set_width(width - 0.32)
    rows = VGroup(*(skill_row(n, w, color, *scales) for n, w in skills))
    rows.arrange(DOWN, aligned_edge=LEFT, buff=0.22)
    inner = VGroup(head, sub, rule, rows)
    sub.next_to(head, DOWN, buff=0.1).align_to(head, LEFT)
    rule.next_to(sub, DOWN, buff=0.16).align_to(sub, LEFT)
    rows.next_to(rule, DOWN, buff=0.22).align_to(rule, LEFT).shift(RIGHT * 0.14)
    panel = RoundedRectangle(
        corner_radius=0.12,
        width=width,
        height=inner.height + 0.78,
        stroke_color=RULE,
        stroke_width=1,
        fill_color=CARD,
        fill_opacity=1,
    )
    inner.align_to(panel, UP).shift(DOWN * 0.42)
    inner.align_to(panel, LEFT).shift(RIGHT * 0.16)
    band.align_to(panel, UP)
    return VGroup(shadowed(panel), band, inner)


def skill_map(width=2.12):
    scales = _uniform_scales(PHASES, width - 0.66)
    columns = VGroup(
        *(phase_column(i + 1, *phase, width=width, scales=scales) for i, phase in enumerate(PHASES))
    ).arrange(RIGHT, buff=0.16, aligned_edge=UP)
    tallest = max(column[0][1].height for column in columns)
    for column in columns:
        panel, shadow = column[0][1], column[0][0]
        top = panel.get_top()
        for shape in (panel, shadow):
            shape.stretch_to_fit_height(tallest)
        shift = top - panel.get_top()
        panel.shift(shift)
        shadow.shift(shift)
    return columns


def guardrail_strip(width):
    items = VGroup()
    for value, label in GUARDRAILS:
        big = text(value, 22, weight="BOLD")
        small = text(label, 13, color=MUTED)
        items.add(VGroup(big, small).arrange(DOWN, buff=0.04))
    items.arrange(RIGHT, buff=0.75)
    caption = text("Guardrails across every phase", 13, color=FAINT, weight="BOLD")
    content = VGroup(caption, items).arrange(RIGHT, buff=0.7)
    fit(content, width - 0.6)
    panel = RoundedRectangle(
        corner_radius=0.12,
        width=width,
        height=content.height + 0.42,
        stroke_color=RULE,
        stroke_width=1,
        fill_color=CARD,
        fill_opacity=1,
    ).move_to(content)
    return VGroup(shadowed(panel), content)


def _is_code(line):
    return all(tok.startswith(("/", "method-", "--")) for tok in line.replace(",", " ").split())


def step_card(index, title, detail, color, width=2.5, height=2.7):
    panel = RoundedRectangle(
        corner_radius=0.12,
        width=width,
        height=height,
        stroke_color=RULE,
        stroke_width=1,
        fill_color=CARD,
        fill_opacity=1,
    )
    band = RoundedRectangle(
        corner_radius=0.12, width=width, height=0.16, stroke_width=0
    ).set_fill(color, opacity=1)
    band.align_to(panel, UP)
    badge = number_badge(index, color, radius=0.26)
    head = fit(text(title, 21, weight="BOLD"), width - 0.3)
    lines = VGroup(
        *(
            text(line, 15, color=color, weight="BOLD", font=MONO)
            if _is_code(line)
            else text(line, 15, color=MUTED)
            for line in detail
        )
    )
    for kind in (True, False):  # scale code and prose separately so neither shrinks the other
        group = [line for line, raw in zip(lines, detail) if _is_code(raw) is kind]
        widest = max((line.width for line in group), default=0)
        if widest > width - 0.3:
            for line in group:
                line.scale((width - 0.3) / widest)
    lines.arrange(DOWN, buff=0.1)
    content = VGroup(badge, head, lines).arrange(DOWN, buff=0.2)
    content.set_x(panel.get_x()).align_to(panel, UP).shift(DOWN * 0.48)
    return VGroup(shadowed(panel), band, content)


def note_panel(title, items, width):
    """A quiet footnote panel: bold label, then items as code-or-prose chips."""
    label = text(title, 15, color=FAINT, weight="BOLD")
    chips = VGroup()
    for name, what in items:
        parts = [text(name, 15, weight="BOLD", font=MONO if _is_code(name) else SANS,
                      color=INK)]
        if what:
            parts.append(text(what, 14, color=MUTED))
        chips.add(VGroup(*parts).arrange(DOWN, buff=0.05))
    chips.arrange(RIGHT, buff=0.55)
    content = VGroup(label, chips).arrange(RIGHT, buff=0.6)
    fit(content, width - 0.6)
    panel = RoundedRectangle(
        corner_radius=0.12,
        width=width,
        height=content.height + 0.45,
        stroke_color=RULE,
        stroke_width=1,
        fill_color=CARD,
        fill_opacity=1,
    ).move_to(content)
    return VGroup(shadowed(panel), content)


def connectors(cards, color=FAINT):
    links = VGroup()
    for left, right in zip(cards[:-1], cards[1:]):
        start = left.get_right() + RIGHT * 0.03
        end = right.get_left() + LEFT * 0.03
        links.add(Line(start, end, stroke_width=2, color=color))
        links.add(Circle(radius=0.035, stroke_width=0).set_fill(color, 1).move_to(end))
    return links
