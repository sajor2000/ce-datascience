# Site animation source

`ce_datascience_overview.py` is the source for the silent overview shown on the
GitHub Pages home page. Rebuild the committed MP4 from the repository root:

```bash
bash website/animations/render-overview-video.sh
```

The renderer uses an isolated Python 3.12 environment through `uv`; it does
not modify the repository's application dependencies. Review the resulting
`website/static/media/ce-datascience-overview.mp4` before committing it.

## README diagrams

`readme_diagrams.py` is the editable source for the three README diagrams,
including the skill map (`docs/workflow-diagram.png`). The overview video and
the diagrams share one design system and one content list in `ce_visuals.py`:
edit `PHASES` or `GUARDRAILS` there and re-render both so they stay in sync.

Render on macOS: the type pairs Avenir Next (prose) with Menlo (skill names);
other systems fall back to default faces and will not match the committed art. Render the complete set after an inventory or
workflow change:

```bash
bash website/animations/render-readme-diagrams.sh
```

The script replaces only these checked-in README assets:

- `docs/workflow-diagram.png`
- `docs/ce-datascience-package-workflow.png`
- `docs/ce-datascience-skill-commands.png`
