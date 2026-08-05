import path from "path"
import { assertSafeArtifactName, backupFile, copySkillDir, ensureDir, injectManualInvocationGuard, readExistingJsonForMerge, sanitizePathName, writeJson, writeJsonSecure, writeText } from "../utils/files"
import { warnServersWithPotentialSecrets } from "../utils/secrets"
import { cleanupStaleSkillDirs } from "../utils/legacy-cleanup"
import { transformContentForGemini } from "../converters/claude-to-gemini"
import type { GeminiBundle } from "../types/gemini"
import { getLegacyGeminiArtifacts } from "../data/plugin-legacy-artifacts"
import {
  archiveLegacyInstallManifestIfOwned,
  cleanupCurrentManagedDirectory,
  cleanupRemovedManagedDirectories,
  cleanupRemovedManagedFiles,
  moveLegacyArtifactToBackup,
  readManagedInstallManifestWithLegacyFallback,
  resolveManagedSegment,
  sanitizeManagedPluginName,
  writeManagedInstallManifest,
} from "./managed-artifacts"
import { rewriteMcpServerPaths } from "./mcp-paths"

export async function writeGeminiBundle(outputRoot: string, bundle: GeminiBundle): Promise<void> {
  const pluginName = bundle.pluginName ? sanitizeManagedPluginName(bundle.pluginName) : undefined
  const paths = resolveGeminiPaths(outputRoot, pluginName)
  const manifest = pluginName
    ? await readManagedInstallManifestWithLegacyFallback(paths.managedDir, pluginName)
    : null
  const currentSkills = [
    ...bundle.generatedSkills.map((skill) => sanitizePathName(skill.name)),
    ...bundle.skillDirs.map((skill) => sanitizePathName(skill.name)),
  ]
  const agents = bundle.agents ?? []
  const currentAgents = agents.map((agent) => `${sanitizePathName(agent.name)}.md`)
  const currentCommands = bundle.commands.map((command) => `${command.name}.toml`)

  await ensureDir(paths.geminiDir)
  // TODO(cleanup): Remove after v3 transition (circa Q3 2026)
  await cleanupStaleSkillDirs(paths.skillsDir)

  if (bundle.generatedSkills.length > 0) {
    for (const skill of bundle.generatedSkills) {
      const skillName = sanitizePathName(skill.name)
      assertSafeArtifactName(skillName, "skill")
      const targetDir = path.join(paths.skillsDir, skillName)
      await cleanupCurrentManagedDirectory(targetDir, manifest, "skills", skillName)
      await writeText(path.join(targetDir, "SKILL.md"), skill.content + "\n")
    }
  }

  if (bundle.skillDirs.length > 0) {
    for (const skill of bundle.skillDirs) {
      const skillName = sanitizePathName(skill.name)
      assertSafeArtifactName(skillName, "skill")
      const targetDir = path.join(paths.skillsDir, skillName)
      await cleanupCurrentManagedDirectory(targetDir, manifest, "skills", skillName)
      await copySkillDir(skill.sourceDir, targetDir, transformContentForGemini)
      if (skill.disableModelInvocation) {
        await injectManualInvocationGuard(path.join(targetDir, "SKILL.md"))
      }
    }
  }

  if (agents.length > 0) {
    for (const agent of agents) {
      assertSafeArtifactName(sanitizePathName(agent.name), "agent")
      const agentFile = `${sanitizePathName(agent.name)}.md`
      await writeText(path.join(paths.agentsDir, agentFile), agent.content + "\n")
    }
  }

  if (bundle.commands.length > 0) {
    for (const command of bundle.commands) {
      for (const segment of command.name.split("/")) {
        assertSafeArtifactName(segment, "command")
      }
      const dest = path.join(paths.commandsDir, ...command.name.split("/")) + ".toml"
      await writeText(dest, command.content + "\n")
    }
  }

  // Sweep artifacts dropped since the last install only after the current set
  // has been written. Removed entries are disjoint from the current set, so
  // ordering does not change the end state — but deferring the deletes means a
  // mid-write failure leaves the previously-installed tree intact rather than a
  // half-updated managed directory with the old artifacts already gone.
  await cleanupRemovedManagedDirectories(paths.skillsDir, manifest, "skills", currentSkills)
  await cleanupRemovedManagedFiles(paths.agentsDir, manifest, "agents", currentAgents)
  await cleanupRemovedManagedFiles(paths.commandsDir, manifest, "commands", currentCommands)

  const mcpServers = rewriteMcpServerPaths(bundle.mcpServers, bundle.skillDirs, paths.skillsDir)
  if (mcpServers && Object.keys(mcpServers).length > 0) {
    const settingsPath = path.join(paths.geminiDir, "settings.json")
    const backupPath = await backupFile(settingsPath)
    if (backupPath) {
      console.log(`Backed up existing settings.json to ${backupPath}`)
    }

    // settings.json is user-authored; refuse to clobber it on a parse error.
    const existingSettings =
      (await readExistingJsonForMerge<Record<string, unknown>>(settingsPath)) ?? {}

    const existingMcp = (existingSettings.mcpServers && typeof existingSettings.mcpServers === "object")
      ? existingSettings.mcpServers as Record<string, unknown>
      : {}
    const merged = { ...existingSettings, mcpServers: { ...existingMcp, ...mcpServers } }
    warnServersWithPotentialSecrets(mcpServers, settingsPath)
    await writeJsonSecure(settingsPath, merged)
  }

  if (pluginName) {
    await writeManagedInstallManifest(paths.managedDir, {
      version: 1,
      pluginName,
      groups: {
        skills: currentSkills,
        agents: currentAgents,
        commands: currentCommands,
      },
    })
    await archiveLegacyInstallManifestIfOwned(paths.managedDir, pluginName)
    await cleanupKnownLegacyGeminiArtifacts(paths, bundle)
  }
}

function resolveGeminiPaths(outputRoot: string, pluginName?: string) {
  // Namespace the managed install directory per plugin so multiple plugins
  // installed into the same Gemini root do not share (and overwrite) each
  // other's install manifests. `resolveManagedSegment` falls back to the
  // legacy "compound-engineering" segment when no plugin name is supplied
  // (backward compat: old installs used this segment; ce-datascience is the
  // current name, but LEGACY_MANAGED_SEGMENT preserves the old path).
  const managedSegment = resolveManagedSegment(pluginName)
  const base = path.basename(outputRoot)
  if (base === ".gemini") {
    return {
      geminiDir: outputRoot,
      managedDir: path.join(outputRoot, managedSegment),
      skillsDir: path.join(outputRoot, "skills"),
      agentsDir: path.join(outputRoot, "agents"),
      commandsDir: path.join(outputRoot, "commands"),
    }
  }
  return {
    geminiDir: path.join(outputRoot, ".gemini"),
    managedDir: path.join(outputRoot, ".gemini", managedSegment),
    skillsDir: path.join(outputRoot, ".gemini", "skills"),
    agentsDir: path.join(outputRoot, ".gemini", "agents"),
    commandsDir: path.join(outputRoot, ".gemini", "commands"),
  }
}

async function cleanupKnownLegacyGeminiArtifacts(
  paths: ReturnType<typeof resolveGeminiPaths>,
  bundle: GeminiBundle,
): Promise<void> {
  const legacyArtifacts = getLegacyGeminiArtifacts(bundle)
  for (const skillName of legacyArtifacts.skills) {
    await moveLegacyArtifactToBackup(paths.managedDir, "skills", paths.skillsDir, skillName, "Gemini skill")
  }
  for (const agentPath of legacyArtifacts.agents) {
    await moveLegacyArtifactToBackup(paths.managedDir, "agents", paths.agentsDir, agentPath, "Gemini agent")
  }
  for (const commandPath of legacyArtifacts.commands) {
    await moveLegacyArtifactToBackup(paths.managedDir, "commands", paths.commandsDir, commandPath, "Gemini command")
  }
}
