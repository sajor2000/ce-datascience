#!/usr/bin/env bash
# Install CE DataScience through the simplest native path for each agent.

set -euo pipefail

PLUGIN_NAME="ce-datascience"
MARKETPLACE_NAME="ce-datascience-plugin"

target=""
source_root=""
scope="user"
aliases="no"
codex_home="${CODEX_HOME:-$HOME/.codex}"
agents_home="${AGENTS_HOME:-$HOME/.agents}"
dry_run="no"

usage() {
  cat <<'USAGE'
Usage:
  bash install.sh claude [options]
  bash install.sh codex [options]
  bash install.sh doctor [options]
  bash scripts/install/easy-install.sh --target claude [options]
  bash scripts/install/easy-install.sh --target codex [options]

Options:
  --target claude|codex  Agent platform to configure
  --source PATH          Repo root, unpacked offline package, plugin folder, or plugin ZIP
  --scope user|project   Claude marketplace/alias scope (default: user)
  --aliases              Also install safe bare /ce-* Claude aliases
  --codex-home PATH      Codex profile root (default: $CODEX_HOME or ~/.codex)
  --agents-home PATH     Codex .agents root for marketplace.json (default: $AGENTS_HOME or ~/.agents)
  --dry-run              Print commands without running them
  --help                 Show this help

Examples:
  bash install.sh doctor
  bash install.sh claude --aliases
  bash install.sh codex --codex-home "${CODEX_HOME:-$HOME/.codex}"
  bash install.sh codex --source /approved/path/ce-datascience-codex-local
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    claude|codex|doctor)
      target="$1"
      shift
      ;;
    --target)
      [ "$#" -ge 2 ] || { echo "Missing value for --target" >&2; exit 2; }
      target="$2"
      shift 2
      ;;
    --source)
      [ "$#" -ge 2 ] || { echo "Missing value for --source" >&2; exit 2; }
      source_root="$2"
      shift 2
      ;;
    --scope)
      [ "$#" -ge 2 ] || { echo "Missing value for --scope" >&2; exit 2; }
      scope="$2"
      shift 2
      ;;
    --aliases)
      aliases="yes"
      shift
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

case "$target" in
  claude|codex|doctor) ;;
  "") echo "Choose a target: bash install.sh claude, bash install.sh codex, or bash install.sh doctor" >&2; usage >&2; exit 2 ;;
  *) echo "--target must be claude, codex, or doctor" >&2; exit 2 ;;
esac

case "$scope" in
  user|project) ;;
  *) echo "--scope must be user or project" >&2; exit 2 ;;
esac

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"

if [ -z "$source_root" ]; then
  source_root="$repo_root"
fi

abs_path() {
  case "$1" in
    /*|[A-Za-z]:/*|[A-Za-z]:\\*) printf '%s\n' "$1" ;;
    *) printf '%s/%s\n' "$PWD" "$1" ;;
  esac
}

source_root="$(abs_path "$source_root")"
codex_home="$(abs_path "$codex_home")"
agents_home="$(abs_path "$agents_home")"

run_or_echo() {
  if [ "$dry_run" = "yes" ]; then
    printf '[dry-run] %s\n' "$*"
  else
    "$@"
  fi
}

require_command() {
  if [ "$dry_run" = "yes" ]; then
    return
  fi
  command -v "$1" >/dev/null 2>&1 || {
    echo "$1 is required for this install path." >&2
    exit 2
  }
}

command_status() {
  if command -v "$1" >/dev/null 2>&1; then
    printf 'available (%s)' "$(command -v "$1")"
  else
    printf 'not found'
  fi
}

source_status() {
  if [ -f "$source_root/.claude-plugin/marketplace.json" ] && [ -d "$source_root/plugins/$PLUGIN_NAME" ]; then
    printf 'source checkout (standard Claude and Codex installer paths available)'
  elif [ -f "$source_root/install-codex-offline.sh" ]; then
    printf 'unpacked Codex offline package'
  elif [ -d "$source_root/skills" ] && [ -d "$source_root/.claude-plugin" ]; then
    printf 'unpacked Claude plugin folder'
  elif [[ "$source_root" == *.zip ]]; then
    printf 'Claude plugin ZIP'
  else
    printf 'unrecognized; expected a source checkout or approved offline artifact'
  fi
}

print_doctor() {
  echo "CE DataScience install check"
  echo "Source: $source_root"
  echo "Source type: $(source_status)"
  echo "Claude Code CLI: $(command_status claude)"
  echo "Codex CLI: $(command_status codex)"
  echo "Bun (optional for Codex agent bridge): $(command_status bun)"
  echo ""
  echo "Standard laptop:"
  echo "  bash install.sh claude --aliases"
  echo "  bash install.sh codex"
  echo ""
  echo "Locked-down or corporate laptop:"
  echo "  Claude: claude --plugin-dir /approved/path/ce-datascience.zip"
  echo "  Codex:  bash install-codex-offline.sh --source /approved/path/ce-datascience-codex-local"
  echo ""
  echo "Codex always requires the final host step: restart Codex, open /plugins,"
  echo "install CE DataScience from the local marketplace, then restart once more."
}

install_claude_aliases() {
  local plugin_dir="$1"
  if [ "$aliases" != "yes" ]; then
    return
  fi
  if [ ! -d "$plugin_dir/skills" ]; then
    echo "Cannot install aliases because this source is not an unpacked plugin folder: $plugin_dir" >&2
    return
  fi
  run_or_echo bash "$repo_root/scripts/install/install-claude-aliases.sh" \
    --plugin-dir "$plugin_dir" \
    --scope "$scope"
}

install_claude() {
  if [ -f "$source_root/.claude-plugin/marketplace.json" ] && [ -d "$source_root/plugins/$PLUGIN_NAME" ]; then
    require_command claude
    run_or_echo claude plugin marketplace add "$source_root" --scope "$scope"
    run_or_echo claude plugin install "$PLUGIN_NAME@$MARKETPLACE_NAME" --scope "$scope"
    install_claude_aliases "$source_root/plugins/$PLUGIN_NAME"
    echo ""
    echo "Claude install complete."
    echo "Start Claude Code in a project and run:"
    if [ "$aliases" = "yes" ]; then
      echo "  /ce-setup"
    else
      echo "  /$PLUGIN_NAME:ce-setup"
    fi
    return
  fi

  if [ -d "$source_root/skills" ] && [ -d "$source_root/.claude-plugin" ]; then
    install_claude_aliases "$source_root"
    echo "Launch Claude Code with:"
    echo "  claude --plugin-dir \"$source_root\""
    echo "Then run /$PLUGIN_NAME:ce-setup"
    return
  fi

  case "$source_root" in
    *.zip)
      echo "Launch Claude Code with:"
      echo "  claude --plugin-dir \"$source_root\""
      echo "Then run /$PLUGIN_NAME:ce-setup"
      return
      ;;
  esac

  echo "Could not find a CE DataScience Claude marketplace or plugin folder at $source_root" >&2
  exit 2
}

install_codex() {
  if [ -f "$source_root/install-codex-offline.sh" ]; then
    run_or_echo bash "$source_root/install-codex-offline.sh" \
      --source "$source_root" \
      --codex-home "$codex_home" \
      --agents-home "$agents_home"
    return
  fi

  if [ -f "$source_root/.agents/plugins/marketplace.json" ] && [ -d "$source_root/plugins/$PLUGIN_NAME" ]; then
    require_command codex
    run_or_echo codex plugin marketplace add "$source_root"
    if command -v bun >/dev/null 2>&1; then
      if [ "$dry_run" = "yes" ]; then
        echo "[dry-run] cd \"$source_root\" && bun run src/index.ts install ./plugins/$PLUGIN_NAME --to codex --codex-home \"$codex_home\""
      else
        (cd "$source_root" && bun run src/index.ts install "./plugins/$PLUGIN_NAME" --to codex --codex-home "$codex_home")
      fi
    else
      echo "bun not found; registered the native Codex plugin marketplace only."
      echo "Install CE DataScience from /plugins, or run the Bun bridge later for generated agents."
    fi
    echo ""
    echo "Codex install prepared."
    echo "Restart Codex, open /plugins, install CE DataScience, then start a new thread."
    return
  fi

  echo "Could not find a CE DataScience Codex marketplace or offline package at $source_root" >&2
  exit 2
}

case "$target" in
  claude) install_claude ;;
  codex) install_codex ;;
  doctor) print_doctor ;;
esac
