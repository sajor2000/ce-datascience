#!/usr/bin/env bash
# Convenience installer for Methodsmith.

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$script_dir/scripts/install/easy-install.sh" "$@"
