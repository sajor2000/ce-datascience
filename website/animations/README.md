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

`readme_diagrams.py` is the editable source for the three workflow diagrams
shown in the root README. Render the complete set after an inventory or
workflow change:

```bash
bash website/animations/render-readme-diagrams.sh
```

The script replaces only these checked-in README assets:

- `docs/workflow-diagram.png`
- `docs/ce-datascience-package-workflow.png`
- `docs/ce-datascience-skill-commands.png`
