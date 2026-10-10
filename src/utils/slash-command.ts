/**
 * Shared slash-command detection for the plugin converters.
 *
 * The path allowlist below used to be byte-copied into each converter, so one
 * copy could drift from the others. Centralising it keeps them in lockstep.
 */

/** Single-segment roots that read as `/word` but are filesystem paths, not commands. */
export const SLASH_COMMAND_PATH_ALLOWLIST = [
  "dev",
  "tmp",
  "etc",
  "usr",
  "var",
  "bin",
  "home",
] as const

export function isReservedPathRoot(commandName: string): boolean {
  return (SLASH_COMMAND_PATH_ALLOWLIST as readonly string[]).includes(commandName)
}
