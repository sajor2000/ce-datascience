#!/usr/bin/env bash
# rebrand:keep-start -- this script looks for the plugin's pre-5.0 name on purpose.
# Read-only: finds installs of ce-datascience (Methodsmith's name before 5.0)
# and prints the exact commands that switch each one to Methodsmith.
# It never changes anything. Exit 0 whether or not an old install exists.

set -u

OLD="ce-datascience"
OLD_MARKETPLACE="ce-datascience-plugin"
REPO="sajor2000/methodsmith"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
found=0

claude_dir="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
codex_home="${CODEX_HOME:-$HOME/.codex}"
opencode_dir="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}"
pi_dir="$HOME/.pi/agent"
qwen_dir="$HOME/.qwen/extensions"

section() {
  if [ "$found" -eq 0 ]; then
    echo "Found a $OLD install. Methodsmith is the same plugin under its 5.0 name."
    echo "Your own skills are never removed: the new install backs up only files the old plugin wrote."
  fi
  found=1
  echo
  echo "## $1"
}

# Claude Code: the old plugin id is ce-datascience@<marketplace>.
claude_ids=""
if [ -f "$claude_dir/plugins/installed_plugins.json" ]; then
  claude_ids="$(grep -o "\"$OLD@[A-Za-z0-9._-]*\"" "$claude_dir/plugins/installed_plugins.json" | tr -d '"' | sort -u)"
fi
if [ -n "$claude_ids" ]; then
  section "Claude Code"
  for id in $claude_ids; do
    echo "claude plugin uninstall $id"
    marketplace="${id#*@}"
    if [ "$marketplace" = "$OLD_MARKETPLACE" ]; then
      echo "claude plugin marketplace remove $OLD_MARKETPLACE"
    fi
  done
  echo "claude plugin marketplace add $REPO"
  echo "claude plugin install methodsmith@methodsmith"
  echo "Then run /reload-plugins or restart Claude Code."
fi
if ls "$claude_dir/commands"/ce-*.md >/dev/null 2>&1 && grep -lq "CE_DATASCIENCE_ALIAS_MANAGED" "$claude_dir/commands"/ce-*.md 2>/dev/null; then
  section "Claude Code bare aliases"
  echo "Re-run the alias installer from a methodsmith checkout. It replaces the old /ce-* aliases with"
  echo "deprecated ones that point at the new skills, and adds /method-* aliases:"
  echo "bash install.sh claude --aliases"
fi

# Codex: the old marketplace, the old managed folder, or old generated agents.
if grep -q "^\[marketplaces\.$OLD_MARKETPLACE\]" "$codex_home/config.toml" 2>/dev/null \
  || [ -d "$codex_home/$OLD" ] || [ -d "$codex_home/agents/$OLD" ]; then
  section "Codex"
  if grep -q "^\[marketplaces\.$OLD_MARKETPLACE\]" "$codex_home/config.toml" 2>/dev/null; then
    echo "codex plugin marketplace remove $OLD_MARKETPLACE"
  fi
  echo "codex plugin marketplace add $REPO"
  echo "bunx methodsmith@latest install methodsmith --to codex --codex-home \"$codex_home\""
  echo "Then open /plugins in Codex, install Methodsmith, and restart Codex."
fi

if [ -d "$opencode_dir/$OLD" ]; then
  section "OpenCode"
  echo "bunx methodsmith@latest install methodsmith --to opencode"
fi

if [ -d "$pi_dir/$OLD" ]; then
  section "Pi"
  echo "bunx methodsmith@latest install methodsmith --to pi --pi-home \"$pi_dir\""
fi

for workspace_target in gemini kiro; do
  if [ -d "./.$workspace_target/$OLD" ]; then
    case "$workspace_target" in gemini) label="Gemini CLI" ;; *) label="Kiro" ;; esac
    section "$label (this workspace)"
    echo "bunx methodsmith@latest install methodsmith --to $workspace_target --output ."
  fi
done

if [ -d "$qwen_dir/$OLD" ]; then
  section "Qwen Code"
  echo "qwen extensions uninstall $OLD"
  echo "qwen extensions install $REPO:methodsmith"
fi

if [ "$found" -eq 0 ]; then
  echo "No $OLD install found. Nothing to migrate."
  exit 0
fi

echo
echo "## Project folders"
echo "Keep any .$OLD/ folder in your projects. Methodsmith 5.0 still reads its config there,"
echo "including the PHI-boundary settings in .$OLD/config.local.yaml."
echo
echo "## Renamed commands"
echo "Every command and agent now starts with method- instead of ce-. The full table:"
echo
sed -n '/^| /p' "$script_dir/../references/renamed-commands.md"
exit 0
# rebrand:keep-end
