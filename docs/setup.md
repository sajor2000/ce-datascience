# CE DataScience Setup Guide

This guide is the fastest path from a fresh machine to a working `ce-datascience`
install. The commands assume a Unix-like shell on macOS, Linux, or WSL.

## 1. Pick The Install Path

### Locked-down laptop or team demo

Use this path when Bun, Git, GitHub CLI, Homebrew, npm, or Quarto are blocked.
Basic plugin use does not require those tools.

Ask IT or the release owner for one of these approved artifacts:

- `ce-datascience-plugin.zip` for Claude Code
- `ce-datascience-claude-aliases.zip` for optional bare `/ce-*` aliases
- `ce-datascience-codex-local.zip` for Codex local marketplace installs

Claude Code can load either an approved folder or ZIP:

```bash
claude --plugin-dir /approved/path/ce-datascience
claude --plugin-dir /approved/path/ce-datascience.zip
```

Use namespaced Claude plugin commands:

```text
/ce-datascience:ce-setup --locked-down
/ce-datascience:ce-workflow
```

Bare `/ce-setup` is not guaranteed by Claude plugin loading. It works only when
optional local aliases are installed into `~/.claude/commands` or a project's
`.claude/commands`.

To install optional aliases from an approved plugin folder:

```bash
bash scripts/install/install-claude-aliases.sh --plugin-dir /approved/path/ce-datascience --scope user
```

For project-only aliases, run from the project root:

```bash
bash scripts/install/install-claude-aliases.sh --plugin-dir /approved/path/ce-datascience --scope project
```

To remove only managed CE aliases:

```bash
bash scripts/install/install-claude-aliases.sh --scope user --uninstall
```

For Codex without Bun, unpack `ce-datascience-codex-local.zip` and run:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
bash install-codex-offline.sh --source /approved/path/ce-datascience-codex-local --codex-home "$CODEX_HOME"
```

Then restart Codex, run `/plugins`, install CE DataScience from the local
marketplace, and restart again. The installer also writes generated agent bridge
files into the selected `CODEX_HOME` and rewrites MCP paths to the installed
local plugin copy.

### Source checkout for contributors

Bun and Git are required only when building, validating, converting, or
developing the plugin from source.

## 2. Install Source Prerequisites

Install Bun if it is not already available:

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart the shell, then verify:

```bash
bun --version
```

## 3. Clone Once

Clone the repo and install dependencies:

```bash
export CE_DS_REPO="$HOME/ce-datascience"
git clone https://github.com/sajor2000/ce-datascience.git "$CE_DS_REPO"
cd "$CE_DS_REPO"
bun install
```

Optional sanity check:

```bash
bun run release:validate
```

Expected result: release metadata is in sync, with the current agent, skill, and
MCP server counts.

## 4. Pick Your Agent

### Claude Code

Load the plugin directly from the checkout:

```bash
claude --plugin-dir "$CE_DS_REPO/plugins/ce-datascience"
```

Optional shell shortcut:

```bash
printf "\nalias claude-ds='claude --plugin-dir %s/plugins/ce-datascience'\n" "$CE_DS_REPO" >> ~/.zshrc
source ~/.zshrc
```

Then run `claude-ds` from any project.

In Claude Code, use namespaced plugin commands such as
`/ce-datascience:ce-setup`. Install optional local aliases only if you need bare
demo commands such as `/ce-setup`.

### Codex, Recommended Mode

Use Codex native plugin install for skills, then add generated agents with the
Bun installer. Use the same `CODEX_HOME` for both commands.

```bash
export CE_DS_REPO="$HOME/ce-datascience"
export CODEX_HOME="$HOME/.codex"

codex plugin marketplace add "$CE_DS_REPO"
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME"
codex
```

Inside Codex, run `/plugins`, select the local marketplace, install
`ce-datascience`, then restart Codex.

For a separate research profile:

```bash
export CODEX_HOME="$HOME/.codex/profiles/research"
codex plugin marketplace add "$CE_DS_REPO"
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME"
CODEX_HOME="$CODEX_HOME" codex
```

### Codex, Standalone Generated Mode

Use this when native Codex plugin install is unavailable:

```bash
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to codex --codex-home "$CODEX_HOME" --include-skills
```

Standalone mode writes generated skills, agents, MCP config, and managed Codex
hooks. Managed hooks preserve manual hooks and hooks from other plugins.

### OpenCode

Install into the workspace where OpenCode should load the plugin:

```bash
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to opencode --output /path/to/workspace
```

This writes `opencode.json` plus `.opencode/agents`, `.opencode/skills`, and
`.opencode/plugins` under the workspace. If the output directory itself is named
`opencode` or `.opencode`, the writer treats it as a global OpenCode config root
and writes a flat layout instead.

### Gemini CLI

```bash
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to gemini --output /path/to/gemini-workspace
```

This writes `.gemini/skills`, `.gemini/agents`, and `.gemini/settings.json`.

### Kiro

```bash
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to kiro --output /path/to/kiro-workspace
```

This writes `.kiro/skills`, `.kiro/agents`, steering files, and MCP settings.

### Pi

Install the external Pi subagent prerequisite, then generate Pi files:

```bash
pi install npm:pi-subagents
cd "$CE_DS_REPO"
bun run src/index.ts install ./plugins/ce-datascience --to pi --pi-home "$HOME/.pi/agent"
```

### Qwen Code

Qwen Code uses its native extension installer:

```bash
qwen extensions install sajor2000/ce-datascience:ce-datascience
```

Qwen is not a generated `--to qwen` target. `--to all` only writes generated
targets that are detected on the machine.

## 5. First Run In A Project

Start in the project or study repo where you want help, then run:

```text
/ce-datascience:ce-setup
/ce-datascience:ce-workflow
```

`ce-setup` records the project stack profile. `ce-workflow` shows the next
recommended skill sequence for the project type, data layer, and language.
If optional aliases are installed, the bare forms `/ce-setup` and
`/ce-workflow` work too.

Good first workflows:

```text
/ce-research-question "sepsis bundles and 30-day mortality in ICU"
/ce-plan
/ce-work
/ce-code-review
```

For publication artifacts:

```text
/ce-table1
/ce-figure
/ce-manuscript-package
/ce-review-pack
```

For locked-down laptops, run setup in no-install mode:

```text
/ce-datascience:ce-setup --locked-down
```

This reports missing tools but does not offer Homebrew, pip, npm, GitHub CLI, or
Quarto install commands.

## 6. Update An Existing Checkout

```bash
cd "$CE_DS_REPO"
git pull
bun install
bun run release:validate
```

Then restart the agent. For generated targets, rerun the install command for
that target so generated files and MCP paths refresh.

## 7. Build Offline Artifacts

Release owners with a working source checkout can build the corporate ZIPs:

```bash
bun run package:corporate
```

The build writes:

- `dist/corporate/ce-datascience-plugin.zip`
- `dist/corporate/ce-datascience-claude-aliases.zip`
- `dist/corporate/ce-datascience-codex-local.zip`

## Troubleshooting

| Symptom | Fix |
|---|---|
| `bun: command not found` | Re-run the Bun install command, restart the shell, and check `bun --version`. |
| Claude says `/ce-setup` is unknown | Use `/ce-datascience:ce-setup`, or install optional local aliases. Restart Claude Code after installing a plugin or aliases. |
| Corporate laptop blocks Bun, GitHub CLI, Git, or Quarto | Use the approved Claude plugin folder/ZIP or Codex local marketplace package. Bun and Git are source-build tooling; GitHub CLI is only for GitHub helper skills; Quarto is only for Quarto render workflows. |
| Local install says it cannot find `plugins/ce-datascience` remotely | Use `./plugins/ce-datascience` from the repo root, including the leading `./`. |
| Codex installed into the wrong profile | Set `CODEX_HOME` and pass the same value to `--codex-home`. |
| Codex has duplicate or stale CE files | Rerun the Codex installer for the same `CODEX_HOME`; managed artifacts are namespaced and stale managed files are cleaned. |
| OpenCode did not create `.opencode/` | Do not use an output directory named `opencode` or `.opencode` when you want workspace nesting. Use a normal workspace path. |
| MCP writes reports into the plugin cache | Set `CE_DATASCIENCE_PROJECT_ROOT=/absolute/path/to/project` or pass `project_root` where the MCP tool supports it. |
