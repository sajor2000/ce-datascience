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
fonts="/tmp/ce-datascience/brand/fonts"
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

for size in 16 32 48 64 128 180 192 256 512 1024; do
  raster "$out/mark.svg" "$out/mark-$size.png" "$size" "$size"
done
cp "$out/mark-180.png" "$out/apple-touch-icon.png"
for theme in light dark; do
  # Export the lockup at 3x its intrinsic size, keeping its aspect ratio.
  lw="$(sed -n 's/^<svg[^>]* width="\([0-9]*\)".*/\1/p' "$out/lockup-$theme.svg")"
  raster "$out/lockup-$theme.svg" "$out/lockup-$theme.png" "$((lw * 3))" 246
done
raster "$out/hero-light.svg" "$out/hero-light.png" 1600 560
raster "$out/hero-dark.svg" "$out/hero-dark.png" 1600 560
raster "$out/social-preview.svg" "$out/social-preview.png" 1280 640
demo_h="$(sed -n 's/^<svg[^>]* height="\([0-9]*\)".*/\1/p' "$out/demo-poster.svg")"
raster "$out/demo-poster.svg" "$out/demo-poster.png" 1200 "$demo_h"

"${py[@]}" "$scripts/finish_png.py" "$out"
