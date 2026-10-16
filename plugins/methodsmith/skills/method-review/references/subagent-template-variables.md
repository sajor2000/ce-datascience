# Sub-agent Template Variables

Slot sources for `references/subagent-template.md`. The orchestrator fills each slot at spawn time.

## Variable Reference

| Variable | Source | Description |
|----------|--------|-------------|
| `{persona_file}` | Agent markdown file content | The full persona definition (identity, failure modes, calibration, suppress conditions) |
| `{diff_scope_rules}` | `references/diff-scope.md` content | Primary/secondary/pre-existing tier rules |
| `{schema}` | `references/findings-schema.json` content | The JSON schema reviewers must conform to |
| `{intent_summary}` | Stage 2 output | 2-3 line description of what the change is trying to accomplish |
| `{pr_metadata}` | Stage 1 output | PR title, body, and URL when reviewing a PR. Empty string when reviewing a branch or standalone checkout |
| `{file_list}` | Stage 1 output | List of changed files from the scope step |
| `{diff}` | Stage 1 output | The actual diff content to review |
| `{run_id}` | Stage 4 output | Unique review run identifier for the artifact directory |
| `{reviewer_name}` | Stage 3 output | Persona or agent name used as the artifact filename stem |
