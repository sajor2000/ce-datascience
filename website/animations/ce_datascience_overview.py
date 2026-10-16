"""A silent GitHub Pages overview: the skill map, built phase by phase."""

import sys
from pathlib import Path

from manim import (
    DOWN,
    LEFT,
    UP,
    FadeIn,
    FadeOut,
    LaggedStart,
    Scene,
    VGroup,
    Write,
)

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ce_visuals import MUTED, PAPER, guardrail_strip, heading, skill_map, text  # noqa: E402


class CEDataScienceOverview(Scene):
    def construct(self):
        self.camera.background_color = PAPER

        header = heading(
            "CE DataScience",
            "From research question to reviewable evidence, one safe step at a time",
        )
        header.to_edge(UP, buff=0.32)
        columns = skill_map()
        columns.scale_to_fit_width(13.5).next_to(header, DOWN, buff=0.32)
        strip = guardrail_strip(columns.width).next_to(columns, DOWN, buff=0.22)
        body = VGroup(header, columns, strip)
        if body.height > 7.7:
            body.scale_to_fit_height(7.7)
        body.move_to(0)

        self.play(Write(header[0]), FadeIn(header[1], shift=UP * 0.12), run_time=1.3)
        self.wait(0.4)

        for column in columns:
            frame, band, inner = column
            head, sub, rule, rows = inner
            self.play(
                FadeIn(frame, shift=UP * 0.15),
                FadeIn(band),
                FadeIn(head, shift=LEFT * 0.08),
                FadeIn(sub),
                FadeIn(rule),
                run_time=0.45,
            )
            self.play(
                LaggedStart(*(FadeIn(row, shift=LEFT * 0.1) for row in rows), lag_ratio=0.18),
                run_time=1.0,
            )
            self.wait(0.35)

        self.play(FadeIn(strip, shift=UP * 0.15), run_time=0.8)
        self.wait(2.2)

        close = text("Researcher judgment remains the decision point.", 26, color=MUTED)
        self.play(FadeOut(body, shift=UP * 0.2), run_time=0.8)
        self.play(FadeIn(close, shift=UP * 0.12), run_time=0.8)
        self.wait(1.6)
        self.play(FadeOut(close), run_time=0.6)
