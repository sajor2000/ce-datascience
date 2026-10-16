import path from "path"
import { ensureDir, pathExists, readText, writeText } from "./files"

export const CODEX_AGENTS_BLOCK_START = "<!-- BEGIN METHODSMITH CODEX TOOL MAP -->"
export const CODEX_AGENTS_BLOCK_END = "<!-- END METHODSMITH CODEX TOOL MAP -->"

/**
 * Markers written by the upstream Compound Engineering converter and by
 * methodsmith releases before the native Codex plugin path. The method-setup
 * health check reports this block as retired, so the installer migrates it
 * into the current managed block instead of leaving both behind.
 */
export const CODEX_AGENTS_BLOCK_START_LEGACY = "<!-- BEGIN COMPOUND CODEX TOOL MAP -->"
export const CODEX_AGENTS_BLOCK_END_LEGACY = "<!-- END COMPOUND CODEX TOOL MAP -->"

const CODEX_AGENTS_BLOCK_BODY = `## Methodsmith Codex Tool Mapping (Claude Compatibility)

This section maps Claude Code plugin tool references to Codex behavior.
Only this block is managed automatically by the methodsmith installer.

Tool mapping:
- Read: use shell reads (cat/sed) or rg
- Write: create files via shell redirection or apply_patch
- Edit/MultiEdit: use apply_patch
- Bash: use shell_command
- Grep: use rg (fallback: grep)
- Glob: use rg --files or find
- LS: use ls via shell_command
- WebFetch/WebSearch: use curl or Context7 for library docs
- AskUserQuestion/Question: use request_user_input when it is available; otherwise present choices as a numbered list in chat and wait for a reply number. For multi-select (multiSelect: true), accept comma-separated numbers. Never skip or auto-configure — always wait for the user's response before proceeding.
- Task (subagent dispatch) / Subagent / Parallel: use spawn_agent with the generated custom agents under agents/methodsmith/ when it is available; otherwise run the work sequentially in the main thread and use multi_tool_use.parallel for independent tool calls
- TaskCreate/TaskUpdate/TaskList/TaskGet/TaskStop/TaskOutput (Claude Code task-tracking, current): use update_plan (Codex's task-tracking primitive)
- TodoWrite/TodoRead (Claude Code task-tracking, legacy — deprecated, replaced by Task* tools): use update_plan
- Skill: open the referenced SKILL.md and follow it
- ExitPlanMode: ignore
`

export async function ensureCodexAgentsFile(codexHome: string): Promise<void> {
  await ensureDir(codexHome)
  const filePath = path.join(codexHome, "AGENTS.md")
  const block = buildCodexAgentsBlock()

  if (!(await pathExists(filePath))) {
    await writeText(filePath, block + "\n")
    return
  }

  const existing = await readText(filePath)
  const updated = upsertBlock(existing, block)
  if (updated !== existing) {
    await writeText(filePath, updated)
  }
}

function buildCodexAgentsBlock(): string {
  return [CODEX_AGENTS_BLOCK_START, CODEX_AGENTS_BLOCK_BODY.trim(), CODEX_AGENTS_BLOCK_END].join("\n")
}

function upsertBlock(existing: string, block: string): string {
  // Replace the current managed block when present; otherwise migrate the
  // retired Compound block in place so a re-install clears the method-setup
  // health-check warning instead of stacking a second map below it.
  const replaced =
    replaceBlock(existing, CODEX_AGENTS_BLOCK_START, CODEX_AGENTS_BLOCK_END, block) ??
    replaceBlock(existing, CODEX_AGENTS_BLOCK_START_LEGACY, CODEX_AGENTS_BLOCK_END_LEGACY, block)
  if (replaced !== null) return replaced

  if (existing.trim().length === 0) {
    return block + "\n"
  }

  return existing.trimEnd() + "\n\n" + block + "\n"
}

function replaceBlock(existing: string, startMarker: string, endMarker: string, block: string): string | null {
  const startIndex = existing.indexOf(startMarker)
  const endIndex = existing.indexOf(endMarker)
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return null

  const before = existing.slice(0, startIndex).trimEnd()
  const after = existing.slice(endIndex + endMarker.length).trimStart()
  return [before, block, after].filter(Boolean).join("\n\n") + "\n"
}
