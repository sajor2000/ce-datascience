#!/usr/bin/env bash
# Install ce-datascience into Codex from a local folder without Bun, Git, gh, or Quarto.

set -euo pipefail

PLUGIN_NAME="ce-datascience"
MANAGED_START="# BEGIN CE DataScience plugin MCP -- do not edit this block"
MANAGED_END="# END CE DataScience plugin MCP"

source_root=""
codex_home="${CODEX_HOME:-$HOME/.codex}"
agents_home="${AGENTS_HOME:-$HOME/.agents}"
dry_run="no"

usage() {
  cat <<'USAGE'
Usage: bash scripts/install/install-codex-offline.sh --source PATH [options]

Options:
  --source PATH        Unpacked ce-datascience-codex-local folder or repo root
  --codex-home PATH    Codex profile root (default: $CODEX_HOME or ~/.codex)
  --agents-home PATH   Codex .agents root for marketplace.json (default: $AGENTS_HOME or ~/.agents)
  --dry-run            Print actions without writing files
  --help               Show this help

This installer copies the local plugin marketplace package and installs the
generated Codex agent bridge when present.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --source)
      [ "$#" -ge 2 ] || { echo "Missing value for --source" >&2; exit 2; }
      source_root="$2"
      shift 2
      ;;
    --codex-home)
      [ "$#" -ge 2 ] || { echo "Missing value for --codex-home" >&2; exit 2; }
      codex_home="$2"
      shift 2
      ;;
    --agents-home)
      [ "$#" -ge 2 ] || { echo "Missing value for --agents-home" >&2; exit 2; }
      agents_home="$2"
      shift 2
      ;;
    --dry-run)
      dry_run="yes"
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

[ -n "$source_root" ] || { echo "--source is required" >&2; usage >&2; exit 2; }

abs_existing_path() {
  local target="$1"
  if [ -d "$target" ]; then
    (cd "$target" && pwd)
  else
    local parent base
    parent="$(dirname "$target")"
    base="$(basename "$target")"
    (cd "$parent" && printf '%s/%s\n' "$(pwd)" "$base")
  fi
}

abs_target_path() {
  case "$1" in
    /*|[A-Za-z]:/*|[A-Za-z]:\\*) printf '%s\n' "$1" ;;
    *) printf '%s/%s\n' "$PWD" "$1" ;;
  esac
}

source_root="$(abs_existing_path "$source_root")"
codex_home="$(abs_target_path "$codex_home")"
agents_home="$(abs_target_path "$agents_home")"

if [ -d "$source_root/plugins/$PLUGIN_NAME" ]; then
  plugin_src="$source_root/plugins/$PLUGIN_NAME"
elif [ -d "$source_root/.codex-plugin" ] && [ -d "$source_root/skills" ]; then
  plugin_src="$source_root"
else
  echo "Could not find a ce-datascience plugin directory under $source_root" >&2
  echo "Expected either plugins/ce-datascience or a plugin root containing .codex-plugin and skills/." >&2
  exit 2
fi

marketplace_root="$(dirname "$agents_home")"
marketplace_dir="$agents_home/plugins"
marketplace_path="$marketplace_dir/marketplace.json"
marketplace_plugin_path="./.codex/plugins/$PLUGIN_NAME"
plugin_dest="$marketplace_root/.codex/plugins/$PLUGIN_NAME"
bridge_source=""

if [ -d "$source_root/codex-agent-bridge/agents/$PLUGIN_NAME" ]; then
  bridge_source="$source_root/codex-agent-bridge/agents/$PLUGIN_NAME"
elif [ -d "$source_root/.codex/agents/$PLUGIN_NAME" ]; then
  bridge_source="$source_root/.codex/agents/$PLUGIN_NAME"
elif [ -d "$source_root/codex-home/agents/$PLUGIN_NAME" ]; then
  bridge_source="$source_root/codex-home/agents/$PLUGIN_NAME"
fi

run_or_echo() {
  if [ "$dry_run" = "yes" ]; then
    printf '[dry-run] %s\n' "$*"
  else
    "$@"
  fi
}

copy_dir_replace() {
  local src="$1"
  local dest="$2"
  run_or_echo mkdir -p "$(dirname "$dest")"
  if [ "$dry_run" = "yes" ]; then
    echo "[dry-run] replace $dest from $src"
  else
    rm -rf "$dest"
    mkdir -p "$(dirname "$dest")"
    cp -R "$src" "$dest"
  fi
}

remove_managed_codex_mcp_config() {
  local config_path="$codex_home/config.toml"
  if [ ! -f "$config_path" ]; then
    return
  fi
  if [ "$dry_run" = "yes" ]; then
    echo "[dry-run] remove managed CE DataScience MCP block from $config_path"
    return
  fi
  if ! grep -Fqx "$MANAGED_START" "$config_path" && ! grep -Fqx "$MANAGED_END" "$config_path"; then
    return
  fi
  if ! awk -v start="$MANAGED_START" -v end="$MANAGED_END" '
    $0 == start { if (inside) exit 1; inside = 1; next }
    $0 == end { if (!inside) exit 1; inside = 0; next }
    END { if (inside) exit 1 }
  ' "$config_path" >/dev/null; then
    echo "Cannot remove malformed CE DataScience MCP block from $config_path; leaving config unchanged." >&2
    return 1
  fi
  local temp_config
  temp_config="$(mktemp -t ce-codex-config-clean-XXXXXX)"
  awk -v start="$MANAGED_START" -v end="$MANAGED_END" '
    $0 == start { skip = 1; next }
    $0 == end { skip = 0; next }
    skip != 1 { print }
  ' "$config_path" > "$temp_config"
  mv "$temp_config" "$config_path"
}

write_marketplace_json() {
  run_or_echo mkdir -p "$marketplace_dir"

  if [ -f "$marketplace_path" ] && command -v python3 >/dev/null 2>&1; then
    if [ "$dry_run" = "yes" ]; then
      echo "[dry-run] merge $PLUGIN_NAME into $marketplace_path"
      return
    fi
    python3 - "$marketplace_path" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
try:
    data = json.loads(path.read_text())
except FileNotFoundError:
    data = {}
except json.JSONDecodeError as exc:
    raise SystemExit(f"Cannot parse existing marketplace JSON at {path}: {exc}")

plugins = data.get("plugins")
if not isinstance(plugins, list):
    plugins = []

entry = {
    "name": "ce-datascience",
    "source": {"source": "local", "path": "./.codex/plugins/ce-datascience"},
    "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
    "category": "Data Science",
}

plugins = [plugin for plugin in plugins if not (isinstance(plugin, dict) and plugin.get("name") == "ce-datascience")]
plugins.append(entry)
data["name"] = data.get("name") or "local-codex-plugins"
data["interface"] = data.get("interface") or {"displayName": "Local Codex Plugins"}
data["plugins"] = plugins
path.write_text(json.dumps(data, indent=2) + "\n")
PY
  elif [ -f "$marketplace_path" ]; then
    echo "Cannot safely merge existing $marketplace_path without python3." >&2
    echo "Install python3, remove the existing marketplace file, or merge this entry manually:" >&2
    echo '{"name":"ce-datascience","source":{"source":"local","path":"./.codex/plugins/ce-datascience"},"policy":{"installation":"AVAILABLE","authentication":"ON_INSTALL"},"category":"Data Science"}' >&2
    exit 2
  else
    if [ "$dry_run" = "yes" ]; then
      echo "[dry-run] create $marketplace_path"
    else
      mkdir -p "$marketplace_dir"
      cat > "$marketplace_path" <<'JSON'
{
  "name": "local-codex-plugins",
  "interface": {
    "displayName": "Local Codex Plugins"
  },
  "plugins": [
    {
      "name": "ce-datascience",
      "source": {
        "source": "local",
        "path": "./.codex/plugins/ce-datascience"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Data Science"
    }
  ]
}
JSON
    fi
  fi
}

copy_dir_replace "$plugin_src" "$plugin_dest"
remove_managed_codex_mcp_config
write_marketplace_json

if [ -n "$bridge_source" ]; then
  copy_dir_replace "$bridge_source" "$codex_home/agents/$PLUGIN_NAME"
else
  echo "No Codex agent bridge found under $source_root; installed native plugin marketplace only."
fi

echo ""
echo "Codex offline install complete."
echo "Marketplace: $marketplace_path"
echo "Marketplace root: $marketplace_root"
echo "Marketplace source.path: $marketplace_plugin_path"
echo "Plugin:      $plugin_dest"
echo "Codex home:  $codex_home"
echo ""
echo "Restart Codex, open /plugins, install CE DataScience from the local marketplace, then restart again."
