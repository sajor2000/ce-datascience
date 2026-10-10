"""A silent GitHub Pages overview of the CE DataScience research workflow."""

from manim import (
    BLUE_B,
    DOWN,
    FadeIn,
    FadeOut,
    GREEN_B,
    GREY_B,
    LEFT,
    RIGHT,
    RoundedRectangle,
    Scene,
    Text,
    UP,
    VGroup,
    WHITE,
    Write,
    YELLOW_B,
)


BACKGROUND = "#0B1F33"
ACCENT = "#63B3ED"
STEPS = (
    ("Frame", "question + estimand", ACCENT),
    ("Design", "PICO, SAP, data checks", BLUE_B),
    ("Analyze", "reproducible R or Python", GREEN_B),
    ("Review", "methods + reporting", YELLOW_B),
    ("Document", "handoff + reusable record", GREY_B),
)


class CEDataScienceOverview(Scene):
    def card(self, title, detail, color):
        box = RoundedRectangle(
            corner_radius=0.16,
            width=4.6,
            height=1.15,
            stroke_color=color,
            stroke_width=3,
            fill_color="#102A43",
            fill_opacity=1,
        )
        heading = Text(title, font="Arial", font_size=26, color=WHITE, weight="BOLD")
        heading.move_to(box.get_left() + RIGHT * 0.35 + UP * 0.2, aligned_edge=LEFT)
        detail_text = Text(detail, font="Arial", font_size=17, color="#C9D8E8")
        detail_text.move_to(box.get_left() + RIGHT * 0.35 + DOWN * 0.25, aligned_edge=LEFT)
        return VGroup(box, heading, detail_text)

    def construct(self):
        self.camera.background_color = BACKGROUND

        title = Text(
            "CE DataScience", font="Arial", font_size=42, color=WHITE, weight="BOLD"
        )
        subtitle = Text(
            "A research workflow that stays reviewable",
            font="Arial",
            font_size=21,
            color="#C9D8E8",
        )
        title.to_edge(UP, buff=0.65)
        subtitle.next_to(title, DOWN, buff=0.2)
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.15), run_time=1.2)

        cards = VGroup(*(self.card(*step) for step in STEPS)).arrange(DOWN, buff=0.2)
        cards.scale(0.72).next_to(subtitle, DOWN, buff=0.35)

        for card in cards:
            self.play(FadeIn(card, shift=RIGHT * 0.25), run_time=0.42)

        close = Text(
            "Researcher judgment remains the decision point.",
            font="Arial",
            font_size=20,
            color=WHITE,
        ).to_edge(DOWN, buff=0.62)
        self.play(FadeIn(close, shift=UP * 0.15), run_time=0.7)
        self.wait(2)
        self.play(FadeOut(VGroup(title, subtitle, cards, close)), run_time=0.6)
