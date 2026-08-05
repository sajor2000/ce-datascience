export const SENSITIVE_PATTERN = /key|token|secret|password|credential|api_key/i

type ServerWithEnv = { env?: Record<string, string>; environment?: Record<string, string> }

function envKeys(server: ServerWithEnv): string[] {
  return [...Object.keys(server.env ?? {}), ...Object.keys(server.environment ?? {})]
}

/** Check if any MCP servers have env vars that might contain secrets */
export function hasPotentialSecrets(servers: Record<string, ServerWithEnv>): boolean {
  return Object.values(servers).some((server) =>
    envKeys(server).some((key) => SENSITIVE_PATTERN.test(key)),
  )
}

/** Return names of MCP servers whose env vars may contain secrets */
export function findServersWithPotentialSecrets(
  servers: Record<string, ServerWithEnv>,
): string[] {
  return Object.entries(servers)
    .filter(([, server]) => envKeys(server).some((key) => SENSITIVE_PATTERN.test(key)))
    .map(([name]) => name)
}

/** Warn when MCP env keys that look like secrets are about to be written to a config file */
export function warnServersWithPotentialSecrets(
  servers: Record<string, ServerWithEnv> | undefined,
  configPath: string,
): void {
  if (!servers) return
  const flagged = findServersWithPotentialSecrets(servers)
  if (flagged.length > 0) {
    console.warn(
      `Warning: MCP server(s) ${flagged.join(", ")} define env keys that look like secrets. They are written to ${configPath} with owner-only permissions; prefer referencing environment variables over literal values.`,
    )
  }
}
