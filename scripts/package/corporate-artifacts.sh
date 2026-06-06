#!/usr/bin/env bash
# Build offline/corporate install artifacts for ce-datascience.

set -euo pipefail

output_dir="dist/corporate"
staging_dir=""
skip_zip="no"
keep_staging="no"

usage() {
  cat <<'USAGE'
Usage: bash scripts/package/corporate-artifacts.sh [options]

Options:
  --output-dir PATH     Directory for ZIP files (default: dist/corporate)
  --staging-dir PATH    Use this staging directory instead of mktemp
  --skip-zip            Build staging folders only; do not create ZIP files
  --keep-staging        Keep mktemp staging folders after creating ZIP files
  --help                Show this help

Artifacts:
  ce-datascience-plugin.zip
  ce-datascience-claude-aliases.zip
  ce-datascience-codex-local.zip
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --output-dir)
      [ "$#" -ge 2 ] || { echo "Missing value for --output-dir" >&2; exit 2; }
      output_dir="$2"
      shift 2
      ;;
    --staging-dir)
      [ "$#" -ge 2 ] || { echo "Missing value for --staging-dir" >&2; exit 2; }
      staging_dir="$2"
      keep_staging="yes"
      shift 2
      ;;
    --skip-zip)
      skip_zip="yes"
      shift
      ;;
    --keep-staging)
      keep_staging="yes"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
plugin_src="$repo_root/plugins/ce-datascience"

if [ ! -d "$plugin_src/skills" ]; then
  echo "Plugin source not found at $plugin_src" >&2
  exit 2
fi

if [ -z "$staging_dir" ]; then
  staging_dir="$(mktemp -d -t ce-corporate-artifacts-XXXXXX)"
fi
staging_dir="$(mkdir -p "$staging_dir" && cd "$staging_dir" && pwd)"
case "$output_dir" in
  /*) output_dir="$(mkdir -p "$output_dir" && cd "$output_dir" && pwd)" ;;
  *) output_dir="$(mkdir -p "$repo_root/$output_dir" && cd "$repo_root/$output_dir" && pwd)" ;;
esac

if [ "$keep_staging" != "yes" ]; then
  trap 'rm -rf "$staging_dir"' EXIT
fi

copy_filtered_dir() {
  local src="$1"
  local dest="$2"
  rm -rf "$dest"
  mkdir -p "$(dirname "$dest")"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a \
      --exclude '.git/' \
      --exclude 'node_modules/' \
      --exclude 'tests/' \
      --exclude '.context/' \
      --exclude '__pycache__/' \
      --exclude '*.pyc' \
      --exclude '*.pyo' \
      --exclude '.DS_Store' \
      "$src/" "$dest/"
  else
    local parent base
    parent="$(dirname "$src")"
    base="$(basename "$src")"
    mkdir -p "$(dirname "$dest")"
    tar \
      --exclude '.git' \
      --exclude 'node_modules' \
      --exclude 'tests' \
      --exclude '.context' \
      --exclude '__pycache__' \
      --exclude '*.pyc' \
      --exclude '*.pyo' \
      --exclude '.DS_Store' \
      -cf - -C "$parent" "$base" | tar -xf - -C "$(dirname "$dest")"
    if [ "$(basename "$dest")" != "$base" ]; then
      mv "$(dirname "$dest")/$base" "$dest"
    fi
  fi
}

zip_dir() {
  local zip_path="$1"
  local root_dir="$2"
  local entry="$3"
  [ "$skip_zip" = "no" ] || return 0
  command -v zip >/dev/null 2>&1 || { echo "zip is required to create $zip_path" >&2; exit 2; }
  rm -f "$zip_path"
  (cd "$root_dir" && zip -qr "$zip_path" "$entry")
}

plugin_stage="$staging_dir/ce-datascience-plugin"
alias_stage="$staging_dir/ce-datascience-claude-aliases"
codex_stage="$staging_dir/ce-datascience-codex-local"

rm -rf "$plugin_stage" "$alias_stage" "$codex_stage"
mkdir -p "$plugin_stage" "$alias_stage" "$codex_stage"

copy_filtered_dir "$plugin_src" "$plugin_stage/ce-datascience"

mkdir -p "$alias_stage/commands"
bash "$repo_root/scripts/install/install-claude-aliases.sh" \
  --plugin-dir "$plugin_src" \
  --commands-dir "$alias_stage/commands"
cp "$repo_root/scripts/install/install-claude-aliases.sh" "$alias_stage/install-claude-aliases.sh"

mkdir -p "$codex_stage/plugins" "$codex_stage/.agents/plugins" "$codex_stage/codex-agent-bridge"
copy_filtered_dir "$plugin_src" "$codex_stage/plugins/ce-datascience"
cp "$repo_root/.agents/plugins/marketplace.json" "$codex_stage/.agents/plugins/marketplace.json"
cp "$repo_root/scripts/install/install-codex-offline.sh" "$codex_stage/install-codex-offline.sh"

bridge_home="$staging_dir/codex-bridge-home"
rm -rf "$bridge_home"
if command -v bun >/dev/null 2>&1; then
  (cd "$repo_root" && bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$bridge_home" >/dev/null)
  if [ -d "$bridge_home/agents/ce-datascience" ]; then
    mkdir -p "$codex_stage/codex-agent-bridge/agents"
    cp -R "$bridge_home/agents/ce-datascience" "$codex_stage/codex-agent-bridge/agents/ce-datascience"
  fi
else
  echo "bun not found; Codex bridge agents were not generated for this package." >&2
fi

cat > "$codex_stage/codex-agent-bridge/config.toml.template" <<'TOML'
# BEGIN CE DataScience plugin MCP -- do not edit this block
[mcp_servers.ce-datascience]
command = "python3"
args = ["__CE_DATASCIENCE_MCP_RUN_PY__"]
# END CE DataScience plugin MCP
TOML

zip_dir "$output_dir/ce-datascience-plugin.zip" "$plugin_stage" "ce-datascience"
zip_dir "$output_dir/ce-datascience-claude-aliases.zip" "$staging_dir" "ce-datascience-claude-aliases"
zip_dir "$output_dir/ce-datascience-codex-local.zip" "$staging_dir" "ce-datascience-codex-local"

echo "Corporate artifacts staged at $staging_dir"
if [ "$skip_zip" = "no" ]; then
  echo "ZIP artifacts written to $output_dir"
else
  echo "ZIP creation skipped"
fi
