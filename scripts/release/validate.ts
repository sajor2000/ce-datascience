#!/usr/bin/env bun
import path from "path"
import { validateReleasePleaseConfig } from "../../src/release/config"
import { getCeDatascienceCounts, syncReleaseMetadata } from "../../src/release/metadata"
import { readJson } from "../../src/utils/files"

type ReleasePleaseManifest = Record<string, string>
type VersionedManifest = { version: string }

const cwd = process.cwd()

const releasePleaseConfig = await readJson<Parameters<typeof validateReleasePleaseConfig>[0]>(
  path.join(cwd, ".github", "release-please-config.json"),
)
const manifest = await readJson<ReleasePleaseManifest>(
  path.join(cwd, ".github", ".release-please-manifest.json"),
)
const configErrors = validateReleasePleaseConfig(releasePleaseConfig)
const counts = await getCeDatascienceCounts(cwd)

// Pass every component's release-please version in, so the plugin/marketplace
// manifests are compared against the release manifest rather than against
// themselves. Omitting a component makes its comparison tautological — that is
// how plugin-version drift previously reached main undetected.
const result = await syncReleaseMetadata({
  write: false,
  componentVersions: {
    "ce-datascience": manifest["plugins/ce-datascience"],
    "coding-tutor": manifest["plugins/coding-tutor"],
    marketplace: manifest[".claude-plugin"],
    "cursor-marketplace": manifest[".cursor-plugin"],
  },
})
const changed = result.updates.filter((update) => update.changed)
const metadataErrors = [...result.errors]

// The CLI component's version lives in package.json and is not covered by
// syncReleaseMetadata, which only walks plugin/marketplace manifests.
const rootPackage = await readJson<VersionedManifest>(path.join(cwd, "package.json"))
const expectedCliVersion = manifest["."]
if (expectedCliVersion && rootPackage.version !== expectedCliVersion) {
  metadataErrors.push(
    `package.json version ${rootPackage.version} does not match .release-please-manifest.json "." (${expectedCliVersion})`,
  )
}

// Component counts appear verbatim in the plugin README's inventory table.
// Asserting them here keeps a removed skill or agent from silently leaving the
// docs overstating the inventory. The counts live in a pipe-delimited table
// (`| Agents | 55 |`) per the AGENTS.md table convention, so the label precedes
// the number; a prose-order pattern (`55 agents`) would never match and would
// turn this guard into a silent no-op. Fail closed when the row is absent — a
// missing count row means the guard can no longer see the claim it protects.
const readmePath = path.join(cwd, "plugins", "ce-datascience", "README.md")
const readme = await Bun.file(readmePath).text()
const countClaims: Array<{ label: string; actual: number; pattern: RegExp }> = [
  { label: "agents", actual: counts.agents, pattern: /\|\s*agents\s*\|\s*(\d+)\s*\|/i },
  { label: "skills", actual: counts.skills, pattern: /\|\s*skills\s*\|\s*(\d+)\s*\|/i },
]
for (const claim of countClaims) {
  const match = claim.pattern.exec(readme)
  if (!match) {
    metadataErrors.push(
      `plugins/ce-datascience/README.md is missing a "${claim.label}" count row; the inventory guard cannot verify it`,
    )
    continue
  }
  const claimed = Number(match[1])
  if (claimed !== claim.actual) {
    metadataErrors.push(
      `plugins/ce-datascience/README.md claims ${claimed} ${claim.label} but the plugin ships ${claim.actual}`,
    )
  }
}

if (configErrors.length === 0 && changed.length === 0 && metadataErrors.length === 0) {
  console.log(
    `Release metadata is in sync. ce-datascience currently has ${counts.agents} agents, ${counts.skills} skills, and ${counts.mcpServers} MCP server${counts.mcpServers === 1 ? "" : "s"}.`,
  )
  process.exit(0)
}

if (configErrors.length > 0) {
  console.error("Release configuration errors detected:")
  for (const error of configErrors) {
    console.error(`- ${error}`)
  }
}

if (metadataErrors.length > 0) {
  console.error("Release metadata structural errors detected:")
  for (const error of metadataErrors) {
    console.error(`- ${error}`)
  }
}

if (changed.length > 0) {
  console.error("Release metadata drift detected:")
  for (const update of changed) {
    console.error(`- ${update.path}`)
  }
  console.error(
    `Current ce-datascience counts: ${counts.agents} agents, ${counts.skills} skills, ${counts.mcpServers} MCP server${counts.mcpServers === 1 ? "" : "s"}.`,
  )
}
process.exit(1)
