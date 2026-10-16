#!/usr/bin/env bash
# Rebuild every Methodsmith brand asset from source.
#
#   bash docs/brand/scripts/render-brand.sh
#
# Needs: uv, curl, and Google Chrome (headless, for SVG -> PNG). Fonts are
# OFL-licensed and downloaded to /tmp; nothing is installed system-wide.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
scripts="$repo_root/docs/brand/scripts"
out="$repo_root/website/static/brand"
fonts="/tmp/methodsmith/brand/fonts"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
gf="https://github.com/google/fonts/raw/bf7c667ae010c0ffb39944ae85097021478cb91d/ofl"
py=(uv run --python 3.12 --with fonttools==4.67.0 --with uharfbuzz==0.56.3 --with pillow==12.3.0 python)

mkdir -p "$fonts" "$out"
fetch() { [ -s "$fonts/$1" ] || curl -sfL -o "$fonts/$1" "$gf/$2"; }
fetch SourceSerif4.ttf "sourceserif4/SourceSerif4%5Bopsz%2Cwght%5D.ttf"
fetch IBMPlexSans.ttf "ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf"
fetch IBMPlexMono-Medium.ttf "ibmplexmono/IBMPlexMono-Medium.ttf"

"${py[@]}" "$scripts/build_brand.py" "$fonts" "$out"
"${py[@]}" "$scripts/build_demo.py" "$out"

work="$(mktemp -d -t methodsmith-brand-XXXXXX)"
trap 'rm -rf "$work"' EXIT

# raster <svg> <png> <width> <height> [background]
raster() {
  local src="$1" dst="$2" w="$3" h="$4" bg="${5:-transparent}"
  cat > "$work/page.html" <<HTML
<!doctype html><html><body style="margin:0;background:$bg">
<img src="file://$src" width="$w" height="$h" style="display:block"></body></html>
HTML
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --window-size="$w,$h" \
    --screenshot="$dst" "file://$work/page.html" >/dev/null 2>&1
}

# Clear previous raster exports so renamed or retired sizes do not linger.
rm -f "$out"/*.png "$out"/favicon.ico

# Transparent mark for documents and slides.
for size in 64 128 256 512 1024; do
  raster "$out/mark-light.svg" "$out/mark-$size.png" "$size" "$size"
done
# Square tile: the small form (M only) up to 32 px, the full hallmark above.
for size in 16 32; do
  raster "$out/icon-small.svg" "$out/icon-$size.png" "$size" "$size"
done
for size in 48 64 128 256 512 1024; do
  raster "$out/icon.svg" "$out/icon-$size.png" "$size" "$size"
done
for size in 16 32 48; do
  raster "$out/favicon.svg" "$out/favicon-$size.png" "$size" "$size"
done
raster "$out/icon.svg" "$out/apple-touch-icon.png" 180 180
raster "$out/icon.svg" "$out/avatar.png" 500 500
for name in lockup-light lockup-dark lockup-stacked-light lockup-stacked-dark; do
  # Export each lockup at 3x its intrinsic size, keeping its aspect ratio.
  lw="$(sed -n 's/^<svg[^>]* width="\([0-9]*\)".*/\1/p' "$out/$name.svg")"
  lh="$(sed -n 's/^<svg[^>]* height="\([0-9]*\)".*/\1/p' "$out/$name.svg")"
  raster "$out/$name.svg" "$out/$name.png" "$((lw * 3))" "$((lh * 3))"
done
raster "$out/hero-light.svg" "$out/hero-light.png" 1600 560
raster "$out/hero-dark.svg" "$out/hero-dark.png" 1600 560
raster "$out/social-preview.svg" "$out/social-preview.png" 1280 640
raster "$out/human-loop-light.svg" "$out/human-loop-light.png" 1200 560
raster "$out/human-loop-dark.svg" "$out/human-loop-dark.png" 1200 560
demo_h="$(sed -n 's/^<svg[^>]* height="\([0-9]*\)".*/\1/p' "$out/demo-poster.svg")"
raster "$out/demo-poster.svg" "$out/demo-poster.png" 1200 "$demo_h"

"${py[@]}" "$scripts/finish_png.py" "$out"

# Directory listing assets inside the plugin folder (Claude `icon`, Codex
# `logo`/`composerIcon`/`screenshots`). Only PNG/SVG: the Claude directory
# holds other binary types, such as .ico, for manual review.
plugin_assets="$repo_root/plugins/methodsmith/assets"
mkdir -p "$plugin_assets"
cp "$out/icon.svg" "$plugin_assets/icon.svg"
cp "$out/icon-small.svg" "$plugin_assets/icon-small.svg"
cp "$out/icon-512.png" "$plugin_assets/icon.png"
cp "$out/demo-poster.png" "$plugin_assets/screenshot.png"
