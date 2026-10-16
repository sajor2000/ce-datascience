// Synthetic stand-ins for files a previous methodsmith install wrote.
// Legacy cleanup moves an allow-listed name only when the file's description
// matches one the plugin shipped, so these fixtures carry a real shipped
// description (read from the current method-architecture-strategist agent).
import { readFileSync } from "fs"
import path from "path"

const agentSource = readFileSync(
  path.join(import.meta.dir, "..", "plugins", "methodsmith", "agents", "method-architecture-strategist.md"),
  "utf8",
)

export const SHIPPED_DESCRIPTION = JSON.parse(agentSource.match(/^description: (".*")$/m)![1]) as string

/** Markdown file (SKILL.md, agent, prompt, command) from an old install. */
export function legacyMd(body: string): string {
  return `---\ndescription: ${JSON.stringify(SHIPPED_DESCRIPTION)}\n---\n\n${body}\n`
}

/** TOML command or agent from an old install. */
export function legacyToml(body: string): string {
  return `description = ${JSON.stringify(SHIPPED_DESCRIPTION)}\nprompt = ${JSON.stringify(body)}\n`
}

/** JSON agent config from an old install. */
export function legacyJson(body: string): string {
  return JSON.stringify({ description: SHIPPED_DESCRIPTION, prompt: body }) + "\n"
}
