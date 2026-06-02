# CE DataScience Setup Guide

This guide is the fastest path from a fresh machine to a working `ce-datascience`
install. The commands assume a Unix-like shell on macOS, Linux, or WSL.

## 1. Install Prerequisites

Install Bun if it is not already available:

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart the shell, then verify:

```bash
bun --version
```

## 2. Clone Once

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

## 3. Pick Your Agent

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

## 4. First Run In A Project

Start in the project or study repo where you want help, then run:

```text
/ce-setup
/ce-workflow
```

`/ce-setup` records the project stack profile. `/ce-workflow` shows the next
recommended skill sequence for the project type, data layer, and language.

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

## 5. Update An Existing Checkout

```bash
cd "$CE_DS_REPO"
git pull
bun install
bun run release:validate
```

Then restart the agent. For generated targets, rerun the install command for
that target so generated files and MCP paths refresh.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `bun: command not found` | Re-run the Bun install command, restart the shell, and check `bun --version`. |
| Claude says `/ce-setup` is unknown | Restart Claude Code. Plugins load at session start. |
| Local install says it cannot find `plugins/ce-datascience` remotely | Use `./plugins/ce-datascience` from the repo root, including the leading `./`. |
| Codex installed into the wrong profile | Set `CODEX_HOME` and pass the same value to `--codex-home`. |
| Codex has duplicate or stale CE files | Rerun the Codex installer for the same `CODEX_HOME`; managed artifacts are namespaced and stale managed files are cleaned. |
| OpenCode did not create `.opencode/` | Do not use an output directory named `opencode` or `.opencode` when you want workspace nesting. Use a normal workspace path. |
| MCP writes reports into the plugin cache | Set `CE_DATASCIENCE_PROJECT_ROOT=/absolute/path/to/project` or pass `project_root` where the MCP tool supports it. |

