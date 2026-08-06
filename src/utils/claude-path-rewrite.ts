/**
 * Guard for per-line `.claude/` path rewriting.
 *
 * Skill prose sometimes enumerates per-platform paths ("Claude Code:
 * `~/.claude/...`, Codex: `~/.codex/...`") or describes Claude Code behavior
 * explicitly. Blindly rewriting `.claude/` on those lines produces output that
 * is factually wrong about Claude Code (e.g. "Claude Code: ~/.codex/plugins/").
 * A line is preserved verbatim when it names Claude Code alongside the path or
 * already references another platform's home directory.
 */
const PLATFORM_ENUMERATION_GUARD =
  /Claude Code|~\/\.(?:codex|cursor|gemini|kiro|pi)\/|~\/\.config\/opencode\//

export function rewriteClaudePathsPerLine(
  body: string,
  rewriteLine: (line: string) => string,
): string {
  return body
    .split("\n")
    .map((line) => (PLATFORM_ENUMERATION_GUARD.test(line) ? line : rewriteLine(line)))
    .join("\n")
}
