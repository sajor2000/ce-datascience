/**
 * Names from the ce-datascience -> Methodsmith rename (5.0), read from the same // rebrand:keep
 * mapping the rename script uses. Legacy cleanup uses these to recognize
 * artifacts that a pre-rename install wrote under the old names.
 */
import rebrand from "../../scripts/rebrand/mapping.json"

export const PLUGIN_NAME: string = rebrand.plugin.new
export const PRE_REBRAND_PLUGIN_NAME: string = rebrand.plugin.old

const skills: Record<string, string> = rebrand.skills
const agents: Record<string, string> = rebrand.agents
const pending = new Set<string>(rebrand.pending.skills)

const PRE_REBRAND_PLUGIN_PREFIX = Object.keys(agents)[0].split("-")[0] + "-"

/** Pre-rename skill names that shipped (pending names never did). */
export const PRE_REBRAND_SKILL_NAMES: string[] = Object.keys(skills).filter((name) => !pending.has(name))
/** Pre-rename agent names, with their prefix. */
export const PRE_REBRAND_AGENT_NAMES: string[] = Object.keys(agents)

/** The current name for a pre-rename skill name; other names pass through. */
export function currentSkillName(name: string): string {
  return skills[name] ?? name
}

/** The current name for a pre-rename agent, given with or without its old prefix. */
export function currentAgentName(name: string): string {
  return agents[name] ?? agents[`${PRE_REBRAND_PLUGIN_PREFIX}${name}`] ?? `method-${name}`
}

const NEW_TO_OLD = new Map<string, string>(
  [...Object.entries(skills), ...Object.entries(agents)].map(([oldName, newName]) => [newName, oldName]),
)
const NEW_NAMES_BY_LENGTH = [...NEW_TO_OLD.keys()].sort((a, b) => b.length - a.length)
const NEW_NAME_PATTERN = new RegExp(
  `(?<![A-Za-z0-9_.-])(${NEW_NAMES_BY_LENGTH.map((name) => name.replace(/-/g, "\\-")).join("|")})(?![A-Za-z0-9-])`,
  "g",
)

/**
 * Text as a pre-rename release would have written it. Applied to both sides of
 * a description comparison, so an old install's description still matches the
 * renamed skill's current one.
 */
export function toPreRebrandText(text: string): string {
  return text
    .replace(NEW_NAME_PATTERN, (name) => NEW_TO_OLD.get(name) ?? name)
    .replace(new RegExp(`${rebrand.plugin.new}:`, "g"), `${rebrand.plugin.old}:`)
    .replace(new RegExp(rebrand.plugin.displayName, "g"), rebrand.plugin.oldDisplayName)
}
