# Corporate Offline Install Pattern

Claude plugin skills and plugin commands are namespaced. A Methodsmith plugin
loaded with `claude --plugin-dir` should be documented as
`/methodsmith:method-setup`, `/methodsmith:method-workflow`, and so on.

Bare `/method-*` commands are a separate local-command alias layer. Install them
into `~/.claude/commands` or project `.claude/commands` only when a demo or
team workflow needs short command names. The alias installer writes only files
with the `METHODSMITH_ALIAS_MANAGED` marker and skips user-owned command
files.

For locked-down laptops, ship approved local artifacts instead of requiring
source tooling:

- `methodsmith.zip`: Claude-ready plugin folder.
- `methodsmith-claude-aliases.zip`: optional local command aliases.
- `methodsmith-codex-local.zip`: Codex local marketplace package plus
  generated agent bridge.

For Codex personal/offline installs, keep the marketplace file at
`.agents/plugins/marketplace.json`, but point its local `source.path` at a
plugin directory under the marketplace root, such as
`./.codex/plugins/methodsmith`. Codex resolves `source.path` relative to the
marketplace root, not relative to the `.agents/plugins/` folder.

Bun, Git, and GitHub CLI are contributor/release tooling. Quarto is optional
unless the user selected a Quarto manuscript or render workflow. Basic setup
should continue to work when those tools are unavailable.
