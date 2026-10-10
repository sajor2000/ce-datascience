# Site animation source

`ce_datascience_overview.py` is the source for the silent overview shown on the
GitHub Pages home page. Rebuild the committed MP4 from the repository root:

```bash
bash website/animations/render-overview-video.sh
```

The renderer uses an isolated Python 3.12 environment through `uv`; it does
not modify the repository's application dependencies. Review the resulting
`website/static/media/ce-datascience-overview.mp4` before committing it.
