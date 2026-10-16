# Subagent Strategy

Read before spawning any subagent (multiple artifacts to investigate, or any Replace). Use subagents for context isolation, not because the task sounds complex. Choose the lightest approach that fits:

| Approach | When to use |
|----------|-------------|
| **Main thread only** | Small scope, short docs |
| **Sequential subagents** | 1-2 artifacts with many supporting files to read |
| **Parallel subagents** | 3+ truly independent artifacts with low overlap |
| **Batched subagents** | Broad sweeps — narrow scope first, then investigate in batches |

Use the platform's subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex, `subagent` in Pi); where parallel dispatch is unavailable, run sequentially. **When spawning any subagent**, omit the `mode` parameter so the user's configured permission settings apply. Include this instruction in its task prompt:

> Use dedicated file search and read tools (Glob, Grep, Read) for all investigation. Do NOT use shell commands (ls, find, cat, grep, test, bash) for file operations. This avoids permission prompts and is more reliable.
>
> Also scan the "user's auto-memory" block injected into your system prompt (Claude Code only). Check for notes related to the learning's problem domain. Report any memory-sourced drift signals separately from codebase-sourced evidence, tagged with "(auto memory [claude])" in the evidence section. If the block is not present in your context, skip this check.

Two subagent roles:

1. **Investigation subagents** — read-only. They must not edit files, create successors, or delete anything. Each returns: file path, evidence, recommended action, confidence, and open questions. These can run in parallel when artifacts are independent.
2. **Replacement subagents** — write a single new learning to replace a stale one. Run **one at a time, sequentially** (each may read significant code; parallel runs risk context exhaustion). The orchestrator handles all deletions and metadata updates after each replacement completes.

The orchestrator merges investigation results, detects contradictions, coordinates replacement subagents, and performs all deletions/metadata edits centrally. Interactive mode asks the user about ambiguous cases; autofix mode marks them stale. If two artifacts overlap or discuss the same root issue, investigate them together rather than in parallel.
