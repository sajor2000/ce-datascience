"""Editable, text-accurate diagrams used by the repository README."""

import sys
from pathlib import Path

from manim import DOWN, UP, Scene, VGroup

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ce_visuals import (  # noqa: E402
    PAPER,
    PHASES,
    connectors,
    guardrail_strip,
    heading,
    skill_map,
    note_panel,
    step_card,
)


class ResearchWorkflow(Scene):
    """Skill map: six lifecycle phases with the skills that do the work."""

    def construct(self):
        self.camera.background_color = PAPER
        header = heading(
            "From research question to reviewable evidence",
            "65 skills across six phases. ce-workflow recommends the next safe step.",
        ).to_edge(UP, buff=0.32)
        columns = skill_map()
        columns.scale_to_fit_width(13.5).next_to(header, DOWN, buff=0.32)
        strip = guardrail_strip(columns.width)
        strip.next_to(columns, DOWN, buff=0.22)
        body = VGroup(header, columns, strip)
        if body.height > 7.7:
            body.scale_to_fit_height(7.7)
        body.move_to(0)
        self.add(body)


def stepped(header, steps, note):
    cards = VGroup(*(step_card(i + 1, *s) for i, s in enumerate(steps))).arrange(buff=0.34)
    cards.scale_to_fit_width(13.3)
    cards.next_to(header, DOWN, buff=0.6)
    note.scale_to_fit_width(min(note.width, cards.width)).next_to(cards, DOWN, buff=0.5)
    body = VGroup(header, connectors(cards), cards, note)
    return body.move_to(0)


class PackageWorkflow(Scene):
    def construct(self):
        self.camera.background_color = PAPER
        header = heading(
            "Install once. Set up each project. Create reviewable artifacts.",
            "Use the route that matches your coding assistant and local policy.",
        )
        steps = (
            ("Choose a route", ("Claude Code, Codex, or Pi", "standard or locked-down"), PHASES[0][2]),
            ("Install", ("the plugin or an", "approved local package"), PHASES[1][2]),
            ("Set up", ("ce-setup", "once per project"), PHASES[2][2]),
            ("Work", ("ce-workflow", "recommends the next skill"), PHASES[3][2]),
            ("Deliver", ("reviewable artifacts", "with provenance"), PHASES[5][2]),
        )
        note = note_panel(
            "What you deliver",
            (
                ("ce-evidence-map", "evidence map"),
                ("ce-plan", "SAP + estimands"),
                ("ce-table1", "Table 1"),
                ("ce-figure", "figures"),
                ("ce-model-card", "model card"),
                ("ce-manuscript-package", "submission"),
            ),
            13.3,
        )
        self.add(stepped(header, steps, note))


class SkillCommands(Scene):
    def construct(self):
        self.camera.background_color = PAPER
        header = heading(
            "Use CE DataScience in the project where the work lives",
            "Start broad, then let the workflow route you to a focused skill.",
        )
        steps = (
            ("Open project", ("analysis, manuscript,", "or study folder"), PHASES[0][2]),
            ("Set up", ("/ce-datascience:ce-setup", "or ask in plain language"), PHASES[1][2]),
            ("View workflow", ("/ce-datascience:ce-workflow", "shows lifecycle status"), PHASES[2][2]),
            ("Run next skill", ("ce-data-qa, ce-plan", "ce-work, ce-code-review"), PHASES[3][2]),
            ("Record & reuse", ("ce-compound", "saves what you learned"), PHASES[5][2]),
        )
        note = note_panel(
            "Optional Claude shortcuts",
            (
                ("--aliases", "install flag"),
                ("/ce-setup", "short form"),
                ("/ce-workflow", "short form"),
                ("Optional research add-ons", "PubMed MCP  ·  Paperclip"),
            ),
            13.3,
        )
        self.add(stepped(header, steps, note))
