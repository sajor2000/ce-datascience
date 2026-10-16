"""Optimise the exported PNGs and pack favicon.ico from the small marks."""

import sys
from pathlib import Path

from PIL import Image

out = Path(sys.argv[1])
for png in sorted(out.glob("*.png")):
    with Image.open(png) as im:
        im.load()
        im.save(png, optimize=True)
icons = [Image.open(out / f"favicon-{s}.png").convert("RGBA") for s in (16, 32, 48)]
icons[2].save(out / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:2])
for f in sorted(out.iterdir()):
    print(f"{f.stat().st_size:>9,}  {f.name}")
