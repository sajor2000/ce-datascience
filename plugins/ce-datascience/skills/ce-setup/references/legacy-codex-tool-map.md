# Remove the retired Compound Codex tool map

The old Bun `convert` / `install --to codex` path added this managed block to
`${CODEX_HOME:-$HOME/.codex}/AGENTS.md`:

```text
<!-- BEGIN COMPOUND CODEX TOOL MAP -->
...
<!-- END COMPOUND CODEX TOOL MAP -->
```

Native plugin installs do not use it. Before changing anything, show the user
the exact block and obtain approval.

Delete only the complete block from the `BEGIN` line through the next `END`
line. If either marker is absent or malformed, leave the file unchanged. Do
not modify project `AGENTS.md` files or add a replacement map. If the file is
otherwise empty after removal, offer to delete it.
