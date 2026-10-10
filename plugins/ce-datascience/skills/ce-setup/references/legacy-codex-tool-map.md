# Remove the retired Compound Codex tool map

Older Bun `convert` / `install --to codex` runs, and the upstream Compound
Engineering converter, added this managed block to
`${CODEX_HOME:-$HOME/.codex}/AGENTS.md`:

```text
<!-- BEGIN COMPOUND CODEX TOOL MAP -->
...
<!-- END COMPOUND CODEX TOOL MAP -->
```

Native plugin installs do not use it. Current ce-datascience installers write a
separate `CE DATASCIENCE CODEX TOOL MAP` block, which is not reported by the
health check; re-running `install --to codex` for the same `CODEX_HOME`
replaces the retired block with the current one. Offer that re-install first
when the user still uses the Bun agent bridge, and manual removal otherwise.

Before changing anything, show the user the exact block and obtain approval.

Delete only the complete block from the `BEGIN` line through the next `END`
line. If either marker is absent or malformed, leave the file unchanged. Do
not modify project `AGENTS.md` files or add a replacement map. If the file is
otherwise empty after removal, offer to delete it.
