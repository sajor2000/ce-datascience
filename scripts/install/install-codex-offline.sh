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
  --agents-home PATH   Codex local marketplace root (default: $AGENTS_HOME or ~/.agents)
  --dry-run            Print actions without writing files
  --help               Show this help

This installer copies the local plugin marketplace package, installs the
generated Codex agent bridge when present, and writes a bounded MCP config block
whose paths point at the installed local plugin copy.
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

abs_path() {
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

source_root="$(abs_path "$source_root")"
codex_home="$(abs_path "$codex_home")"
agents_home="$(abs_path "$agents_home")"

if [ -d "$source_root/plugins/$PLUGIN_NAME" ]; then
  plugin_src="$source_root/plugins/$PLUGIN_NAME"
elif [ -d "$source_root/.codex-plugin" ] && [ -d "$source_root/skills" ]; then
  plugin_src="$source_root"
else
  echo "Could not find a ce-datascience plugin directory under $source_root" >&2
  echo "Expected either plugins/ce-datascience or a plugin root containing .codex-plugin and skills/." >&2
  exit 2
fi

marketplace_dir="$agents_home/plugins"
plugin_dest="$marketplace_dir/$PLUGIN_NAME"
marketplace_path="$marketplace_dir/marketplace.json"
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
    "source": {"source": "local", "path": "./plugins/ce-datascience"},
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
    echo '{"name":"ce-datascience","source":{"source":"local","path":"./plugins/ce-datascience"},"policy":{"installation":"AVAILABLE","authentication":"ON_INSTALL"},"category":"Data Science"}' >&2
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
        "path": "./plugins/ce-datascience"
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

merge_managed_codex_config() {
  local config_path="$codex_home/config.toml"
  local run_py="$plugin_dest/skills/ce-mcp-server/mcp_server/run.py"

  if [ ! -f "$run_py" ]; then
    echo "Skipping Codex MCP config; server entrypoint is missing at $run_py" >&2
    return
  fi

  run_or_echo mkdir -p "$codex_home"

  if [ "$dry_run" = "yes" ]; then
    echo "[dry-run] write managed MCP block to $config_path"
    return
  fi

  local temp_config new_config
  temp_config="$(mktemp -t ce-codex-config-XXXXXX)"
  new_config="$(mktemp -t ce-codex-config-new-XXXXXX)"

  if [ -f "$config_path" ]; then
    awk -v start="$MANAGED_START" -v end="$MANAGED_END" '
      $0 == start { skip = 1; next }
      $0 == end { skip = 0; next }
      skip != 1 { print }
    ' "$config_path" > "$temp_config"
  else
    : > "$temp_config"
  fi

  sed -e '${/^$/d;}' "$temp_config" > "$new_config"
  if [ -s "$new_config" ]; then
    printf '\n\n' >> "$new_config"
  fi
  {
    printf '%s\n' "$MANAGED_START"
    printf '[mcp_servers.%s]\n' "$PLUGIN_NAME"
    printf 'command = "python3"\n'
    printf 'args = ["%s"]\n' "$run_py"
    printf '%s\n' "$MANAGED_END"
  } >> "$new_config"

  mv "$new_config" "$config_path"
  rm -f "$temp_config"
}

copy_dir_replace "$plugin_src" "$plugin_dest"
write_marketplace_json

if [ -n "$bridge_source" ]; then
  copy_dir_replace "$bridge_source" "$codex_home/agents/$PLUGIN_NAME"
else
  echo "No Codex agent bridge found under $source_root; installed native plugin marketplace only."
fi

merge_managed_codex_config

echo ""
echo "Codex offline install complete."
echo "Marketplace: $marketplace_path"
echo "Plugin:      $plugin_dest"
echo "Codex home:  $codex_home"
echo ""
echo "Restart Codex, open /plugins, install CE DataScience from the local marketplace, then restart again."
