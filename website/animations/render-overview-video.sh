#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
scene="$repo_root/website/animations/methodsmith_overview.py"
output="$repo_root/website/static/media/methodsmith-overview.mp4"
render_dir="$(mktemp -d -t methodsmith-manim-XXXXXX)"
trap 'rm -rf "$render_dir"' EXIT

mkdir -p "$(dirname "$output")"
uv run --python 3.12 --with 'manim==0.19.0' manim "$scene" \
  MethodsmithOverview --quality=h --fps 24 --media_dir "$render_dir" \
  --output_file methodsmith-overview.mp4

rendered_video="$(find "$render_dir" -name methodsmith-overview.mp4 -type f -print -quit)"
test -n "$rendered_video"
cp "$rendered_video" "$output"
