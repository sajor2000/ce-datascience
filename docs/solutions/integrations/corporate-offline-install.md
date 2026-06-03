# Corporate Offline Install Pattern

Claude plugin skills and plugin commands are namespaced. A CE DataScience plugin
loaded with `claude --plugin-dir` should be documented as
`/ce-datascience:ce-setup`, `/ce-datascience:ce-workflow`, and so on.

Bare `/ce-*` commands are a separate local-command alias layer. Install them
into `~/.claude/commands` or project `.claude/commands` only when a demo or
team workflow needs short command names. The alias installer writes only files
with the `CE_DATASCIENCE_ALIAS_MANAGED` marker and skips user-owned command
files.

For locked-down laptops, ship approved local artifacts instead of requiring
source tooling:

- `ce-datascience-plugin.zip`: Claude-ready plugin folder.
- `ce-datascience-claude-aliases.zip`: optional local command aliases.
- `ce-datascience-codex-local.zip`: Codex local marketplace package plus
  generated agent bridge.

Bun, Git, and GitHub CLI are contributor/release tooling. Quarto is optional
unless the user selected a Quarto manuscript or render workflow. Basic setup
should continue to work when those tools are unavailable.
