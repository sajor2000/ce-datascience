# Site animation source

`methodsmith_overview.py` is the source for the silent overview video. The docs
home page no longer embeds it (the human-in-the-loop diagram from
`docs/brand/scripts/build_brand.py` does that job); the MP4 stays published
because older links point at it. Rebuild the committed MP4 from the repository root:

```bash
bash website/animations/render-overview-video.sh
```

The renderer uses an isolated Python 3.12 environment through `uv`; it does
not modify the repository's application dependencies. Review the resulting
`website/static/media/methodsmith-overview.mp4` and its poster frame
(`methodsmith-overview-poster.jpg`, which needs `ffmpeg`) before committing them.

## README diagrams

`readme_diagrams.py` is the editable source for the three README diagrams,
including the skill map (`docs/workflow-diagram.png`). The overview video and
the diagrams share one design system and one content list in `method_visuals.py`:
edit `PHASES` or `GUARDRAILS` there and re-render both so they stay in sync.

Type and colour follow the brand guide (`docs/brand/brand.md`): Source Serif 4
titles, IBM Plex Sans prose, IBM Plex Mono skill names, and the Methodsmith
mark beside the skill-map title. Both render scripts download the OFL fonts to
`/tmp` with `fetch-brand-fonts.sh` and register them for the render process
only; nothing is installed system-wide. Render the complete set after an
inventory or workflow change:

```bash
bash website/animations/render-readme-diagrams.sh
```

The script replaces only these checked-in README assets:

- `docs/workflow-diagram.png`
- `docs/methodsmith-package-workflow.png`
- `docs/methodsmith-skill-commands.png`
