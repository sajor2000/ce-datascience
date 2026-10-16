#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
scene="$repo_root/website/animations/readme_diagrams.py"
render_dir="$(mktemp -d -t methodsmith-readme-diagrams-XXXXXX)"
trap 'rm -rf "$render_dir"' EXIT

render_scene() {
  local scene_name="$1"
  local output_name="$2"
  uv run --python 3.12 --with 'manim==0.19.0' manim "$scene" "$scene_name" \
    --quality=h --save_last_frame --media_dir "$render_dir" --output_file "$output_name"
  local rendered_png
  rendered_png="$(find "$render_dir" -name "$output_name" -type f -print -quit)"
  test -n "$rendered_png"
  cp "$rendered_png" "$repo_root/docs/$output_name"
}

render_scene ResearchWorkflow workflow-diagram.png
render_scene PackageWorkflow methodsmith-package-workflow.png
render_scene SkillCommands methodsmith-skill-commands.png
