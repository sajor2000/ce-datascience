#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRAND_FONT_DIR="$(bash "$repo_root/website/animations/fetch-brand-fonts.sh")"
export BRAND_FONT_DIR
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
# Poster frame for the docs page: the finished skill map, before the close.
ffmpeg -v error -y -ss 14.5 -i "$output" -frames:v 1 -q:v 3 "${output%.mp4}-poster.jpg"
