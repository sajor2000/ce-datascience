#!/usr/bin/env bash
# Download the OFL brand fonts used by the diagrams and video to /tmp.
# Prints the directory. Nothing is installed system-wide: method_visuals.py
# registers these files for the render process only.
set -euo pipefail

dir="${BRAND_FONT_DIR:-/tmp/methodsmith/brand/manim-fonts}"
gf="https://github.com/google/fonts/raw/bf7c667ae010c0ffb39944ae85097021478cb91d/ofl/ibmplexmono"
plex="https://github.com/IBM/plex/raw/71f558992315a12ca1f06a2215d57962a1992162/packages/plex-sans/fonts/complete/ttf"
serif="https://github.com/adobe-fonts/source-serif/raw/4.005R/OTF"

mkdir -p "$dir"
fetch() { [ -s "$dir/$1" ] || curl -sfL -o "$dir/$1" "$2/$1"; }
fetch IBMPlexSans-Regular.ttf "$plex"
fetch IBMPlexSans-Bold.ttf "$plex"
fetch IBMPlexMono-Regular.ttf "$gf"
fetch IBMPlexMono-Bold.ttf "$gf"
fetch SourceSerif4-Semibold.otf "$serif"
echo "$dir"
