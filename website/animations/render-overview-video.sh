#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
scene="$repo_root/website/animations/ce_datascience_overview.py"
output="$repo_root/website/static/media/ce-datascience-overview.mp4"
render_dir="$(mktemp -d -t ce-datascience-manim-XXXXXX)"
trap 'rm -rf "$render_dir"' EXIT

mkdir -p "$(dirname "$output")"
uv run --python 3.12 --with 'manim==0.19.0' manim "$scene" \
  CEDataScienceOverview --quality=h --fps 24 --media_dir "$render_dir" \
  --output_file ce-datascience-overview.mp4

rendered_video="$(find "$render_dir" -name ce-datascience-overview.mp4 -type f -print -quit)"
test -n "$rendered_video"
cp "$rendered_video" "$output"
