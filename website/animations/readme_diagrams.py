"""Editable, text-accurate diagrams used by the repository README."""

from manim import (
    Arrow,
    DOWN,
    LEFT,
    RIGHT,
    UP,
    RoundedRectangle,
    Scene,
    Text,
    VGroup,
    WHITE,
)


BACKGROUND = "#081B2E"
PANEL = "#102A43"
PANEL_ALT = "#163A5F"
TEXT_MUTED = "#B8CCE0"
BLUE = "#63B3ED"
TEAL = "#38D9C0"
GOLD = "#F6C85F"
LINE = "#2B5278"


class ReadmeDiagram(Scene):
    def heading(self, title: str, subtitle: str) -> VGroup:
        heading = Text(title, font="Arial", weight="BOLD", font_size=42, color=WHITE)
        subheading = Text(subtitle, font="Arial", font_size=19, color=TEXT_MUTED)
        group = VGroup(heading, subheading).arrange(DOWN, buff=0.12)
        group.scale_to_fit_width(13.1)
        return group.to_edge(UP, buff=0.42)

    def card(self, title: str, detail: str, accent: str, width: float = 3.4) -> VGroup:
        box = RoundedRectangle(
            corner_radius=0.16,
            width=width,
            height=1.7,
            stroke_color=accent,
            stroke_width=2.2,
            fill_color=PANEL,
            fill_opacity=1,
        )
        title_text = Text(title, font="Arial", weight="BOLD", font_size=23, color=WHITE)
        detail_text = Text(detail, font="Arial", font_size=15, color=TEXT_MUTED, line_spacing=0.75)
        title_text.scale_to_fit_width(width - 0.35)
        detail_text.scale_to_fit_width(width - 0.35)
        title_text.move_to(box.get_center() + UP * 0.3)
        detail_text.move_to(box.get_center() + DOWN * 0.32)
        return VGroup(box, title_text, detail_text)

    def pill(self, text: str, color: str, width: float = 2.4) -> VGroup:
        box = RoundedRectangle(
            corner_radius=0.22,
            width=width,
            height=0.53,
            stroke_color=color,
            fill_color=PANEL_ALT,
            fill_opacity=1,
        )
        label = Text(text, font="Arial", weight="BOLD", font_size=15, color=WHITE)
        label.move_to(box)
        return VGroup(box, label)

class ResearchWorkflow(ReadmeDiagram):
    def construct(self):
        self.camera.background_color = BACKGROUND
        header = self.heading(
            "From research question to reviewable evidence",
            "65 skills • 55 specialist agents • 35 reporting checklists",
        )
        steps = (
            ("Frame", "question + estimand", BLUE),
            ("Check data", "keys, joins, missingness", TEAL),
            ("Plan", "protocol + analysis plan", GOLD),
            ("Execute", "reproducible R or Python", BLUE),
            ("Review", "methods + reporting", TEAL),
        )
        cards = VGroup(*(self.card(*step, width=2.65) for step in steps)).arrange(RIGHT, buff=0.28)
        cards.scale_to_fit_width(13.2).move_to(UP * 0.2)
        arrows = VGroup(
            *(
                Arrow(
                    cards[index][0].get_right() + RIGHT * 0.04,
                    cards[index + 1][0].get_left() + LEFT * 0.04,
                    buff=0,
                    stroke_width=3,
                    color=BLUE,
                    max_tip_length_to_length_ratio=0.25,
                )
                for index in range(len(cards) - 1)
            )
        )
        outcome = self.card(
            "Result: documented decisions, evidence, code, and a reusable record",
            "Researcher judgment remains the decision point.",
            GOLD,
            width=8.7,
        ).scale(0.9).to_edge(DOWN, buff=0.55)
        self.add(header, arrows, cards, outcome)


class PackageWorkflow(ReadmeDiagram):
    def construct(self):
        self.camera.background_color = BACKGROUND
        header = self.heading(
            "Install once. Set up each project. Create reviewable artifacts.",
            "Use the route that matches your coding assistant and local policy.",
        )
        steps = (
            ("1  Choose a route", "Claude Code • Codex • Pi\nstandard or locked-down", BLUE),
            ("2  Install", "plugin or approved local package", TEAL),
            ("3  Set up", "open a project\nrun ce-setup", GOLD),
            ("4  Work", "ce-workflow recommends\nthe next skill", BLUE),
            ("5  Deliver", "evidence map • SAP • figures\nmanuscript • review pack", TEAL),
        )
        cards = VGroup(*(self.card(*step, width=2.65) for step in steps)).arrange(RIGHT, buff=0.3)
        cards.scale_to_fit_width(13.15).move_to(UP * 0.14)
        arrows = VGroup(
            *(
                Arrow(
                    cards[index][0].get_right() + RIGHT * 0.04,
                    cards[index + 1][0].get_left() + LEFT * 0.04,
                    buff=0,
                    stroke_width=3,
                    color=TEAL,
                    max_tip_length_to_length_ratio=0.25,
                )
                for index in range(len(cards) - 1)
            )
        )
        addons_title = Text("Optional research add-ons", font="Arial", weight="BOLD", font_size=21, color=WHITE)
        addons = VGroup(
            self.pill("PubMed MCP", BLUE),
            self.pill("Paperclip", TEAL),
        ).arrange(RIGHT, buff=0.35)
        addon_content = VGroup(addons_title, addons).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.67)
        addon_box = RoundedRectangle(
            corner_radius=0.16,
            width=6.4,
            height=1.35,
            stroke_color=LINE,
            fill_color=PANEL,
            fill_opacity=1,
        ).move_to(addon_content)
        self.add(header, arrows, cards, addon_box, addons_title, addons)


class SkillCommands(ReadmeDiagram):
    def construct(self):
        self.camera.background_color = BACKGROUND
        header = self.heading(
            "Use CE DataScience in the project where the work lives",
            "Start broad, then let the workflow route you to a focused skill.",
        )
        steps = (
            ("1  Open project", "analysis, manuscript,\nor study folder", BLUE),
            ("2  Set up", "/ce-datascience:ce-setup\nor ask Codex in plain language", TEAL),
            ("3  View workflow", "/ce-datascience:ce-workflow", GOLD),
            ("4  Choose next skill", "data QA • plan • execute\nreview • publish", BLUE),
            ("5  Continue", "follow the next recommended\nstep with human review", TEAL),
        )
        cards = VGroup(*(self.card(*step, width=2.65) for step in steps)).arrange(RIGHT, buff=0.3)
        cards.scale_to_fit_width(13.15).move_to(UP * 0.12)
        arrows = VGroup(
            *(
                Arrow(
                    cards[index][0].get_right() + RIGHT * 0.04,
                    cards[index + 1][0].get_left() + LEFT * 0.04,
                    buff=0,
                    stroke_width=3,
                    color=GOLD,
                    max_tip_length_to_length_ratio=0.25,
                )
                for index in range(len(cards) - 1)
            )
        )
        note = self.card(
            "Claude shortcuts are optional",
            "Install with --aliases to use /ce-setup and /ce-workflow.",
            GOLD,
            width=7.5,
        ).scale(0.9).to_edge(DOWN, buff=0.55)
        self.add(header, arrows, cards, note)
