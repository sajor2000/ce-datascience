import path from "path"
import { backupFile, copySkillDir, ensureDir, injectManualInvocationGuard, pathExists, readJson, sanitizePathName, writeJson, writeJsonSecure, writeText } from "../utils/files"
import { warnServersWithPotentialSecrets } from "../utils/secrets"
import { transformContentForKiro } from "../converters/claude-to-kiro"
import type { KiroBundle } from "../types/kiro"
import { cleanupStaleSkillDirs, cleanupStaleAgents } from "../utils/legacy-cleanup"
import { getLegacyKiroArtifacts } from "../data/plugin-legacy-artifacts"
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

export async function writeKiroBundle(outputRoot: string, bundle: KiroBundle): Promise<void> {
  const pluginName = bundle.pluginName ? sanitizeManagedPluginName(bundle.pluginName) : undefined
  const paths = resolveKiroPaths(outputRoot, pluginName)
  const manifest = pluginName
    ? await readManagedInstallManifestWithLegacyFallback(paths.managedDir, pluginName)
    : null
  const currentSkills = [
    ...bundle.generatedSkills.map((skill) => sanitizePathName(skill.name)),
    ...bundle.skillDirs.map((skill) => sanitizePathName(skill.name)),
  ]
  const currentAgents = bundle.agents.map((agent) => `${sanitizePathName(agent.name)}.json`)
  const currentAgentPrompts = bundle.agents.map((agent) => `${sanitizePathName(agent.name)}.md`)
  const currentSteeringFiles = bundle.steeringFiles.map((file) => `${sanitizePathName(file.name)}.md`)
  await ensureDir(paths.kiroDir)

  // TODO(cleanup): Remove after v3 transition (circa Q3 2026)
  await cleanupStaleSkillDirs(paths.skillsDir)
  await cleanupStaleAgents(path.join(paths.agentsDir, "prompts"), ".md")
  await cleanupStaleAgents(paths.agentsDir, ".json")
  await cleanupRemovedManagedDirectories(paths.skillsDir, manifest, "skills", currentSkills)
  await cleanupRemovedManagedFiles(paths.agentsDir, manifest, "agents", currentAgents)
  await cleanupRemovedManagedFiles(
    path.join(paths.agentsDir, "prompts"),
    manifest,
    "agentPrompts",
    currentAgentPrompts,
  )
  await cleanupRemovedManagedFiles(paths.steeringDir, manifest, "steering", currentSteeringFiles)

  // Write agents
  if (bundle.agents.length > 0) {
    for (const agent of bundle.agents) {
      // Validate name doesn't escape agents directory
      validatePathSafe(agent.name, "agent")

      // Write agent JSON config
      await writeJson(
        path.join(paths.agentsDir, `${sanitizePathName(agent.name)}.json`),
        agent.config,
      )

      // Write agent prompt file
      await writeText(
        path.join(paths.agentsDir, "prompts", `${sanitizePathName(agent.name)}.md`),
        agent.promptContent + "\n",
      )
    }
  }

  // Write generated skills (from commands)
  if (bundle.generatedSkills.length > 0) {
    for (const skill of bundle.generatedSkills) {
      validatePathSafe(skill.name, "skill")
      await cleanupCurrentManagedDirectory(
        path.join(paths.skillsDir, sanitizePathName(skill.name)),
        manifest,
        "skills",
        sanitizePathName(skill.name),
      )
      await writeText(
        path.join(paths.skillsDir, sanitizePathName(skill.name), "SKILL.md"),
        skill.content + "\n",
      )
    }
  }

  // Copy skill directories (pass-through)
  if (bundle.skillDirs.length > 0) {
    for (const skill of bundle.skillDirs) {
      validatePathSafe(skill.name, "skill directory")
      const destDir = path.join(paths.skillsDir, sanitizePathName(skill.name))

      // Validate destination doesn't escape skills directory
      const resolvedDest = path.resolve(destDir)
      if (!resolvedDest.startsWith(path.resolve(paths.skillsDir))) {
        console.warn(`Warning: Skill name "${skill.name}" escapes .kiro/skills/. Skipping.`)
        continue
      }

      const knownAgentNames = bundle.agents.map((a) => a.name)
      const knownSkillNames = [
        ...bundle.skillDirs.map((s) => s.name),
        ...bundle.generatedSkills.map((s) => s.name),
      ]
      await cleanupCurrentManagedDirectory(
        destDir,
        manifest,
        "skills",
        sanitizePathName(skill.name),
      )
      await copySkillDir(skill.sourceDir, destDir, (content) =>
        transformContentForKiro(content, knownAgentNames, knownSkillNames),
      )
      if (skill.disableModelInvocation) {
        await injectManualInvocationGuard(path.join(destDir, "SKILL.md"))
      }
    }
  }

  // Write steering files
  if (bundle.steeringFiles.length > 0) {
    for (const file of bundle.steeringFiles) {
      validatePathSafe(file.name, "steering file")
      await writeText(
        path.join(paths.steeringDir, `${sanitizePathName(file.name)}.md`),
        file.content + "\n",
      )
    }
  }

  // Write MCP servers to mcp.json
  const mcpServers = rewriteMcpServerPaths(bundle.mcpServers, bundle.skillDirs, paths.skillsDir) ?? bundle.mcpServers
  if (Object.keys(mcpServers).length > 0) {
    const mcpPath = path.join(paths.settingsDir, "mcp.json")
    const backupPath = await backupFile(mcpPath)
    if (backupPath) {
      console.log(`Backed up existing mcp.json to ${backupPath}`)
    }

    // Merge with existing mcp.json if present
    let existingConfig: Record<string, unknown> = {}
    if (await pathExists(mcpPath)) {
      try {
        existingConfig = await readJson<Record<string, unknown>>(mcpPath)
      } catch {
        // mcp.json is user-authored; replacing it wholesale on a parse error
        // would destroy user configuration.
        throw new Error(
          `Existing ${mcpPath} is not valid JSON. Refusing to overwrite it — fix or remove the file (a timestamped .bak copy was just written next to it) and re-run.`,
        )
      }
    }

    const existingServers =
      existingConfig.mcpServers && typeof existingConfig.mcpServers === "object"
        ? (existingConfig.mcpServers as Record<string, unknown>)
        : {}
    const merged = { ...existingConfig, mcpServers: { ...existingServers, ...mcpServers } }
    warnServersWithPotentialSecrets(mcpServers, mcpPath)
    await writeJsonSecure(mcpPath, merged)
  }

  if (pluginName) {
    await writeManagedInstallManifest(paths.managedDir, {
      version: 1,
      pluginName,
      groups: {
        skills: currentSkills,
        agents: currentAgents,
        agentPrompts: currentAgentPrompts,
        steering: currentSteeringFiles,
      },
    })
    await archiveLegacyInstallManifestIfOwned(paths.managedDir, pluginName)
    await cleanupKnownLegacyKiroArtifacts(paths, bundle)
  }
}

function resolveKiroPaths(outputRoot: string, pluginName?: string) {
  const managedSegment = resolveManagedSegment(pluginName)
  const base = path.basename(outputRoot)
  // If already pointing at .kiro, write directly into it
  if (base === ".kiro") {
    return {
      kiroDir: outputRoot,
      managedDir: path.join(outputRoot, managedSegment),
      agentsDir: path.join(outputRoot, "agents"),
      skillsDir: path.join(outputRoot, "skills"),
      steeringDir: path.join(outputRoot, "steering"),
      settingsDir: path.join(outputRoot, "settings"),
    }
  }
  // Otherwise nest under .kiro
  const kiroDir = path.join(outputRoot, ".kiro")
  return {
    kiroDir,
    managedDir: path.join(kiroDir, managedSegment),
    agentsDir: path.join(kiroDir, "agents"),
    skillsDir: path.join(kiroDir, "skills"),
    steeringDir: path.join(kiroDir, "steering"),
    settingsDir: path.join(kiroDir, "settings"),
  }
}

async function cleanupKnownLegacyKiroArtifacts(
  paths: ReturnType<typeof resolveKiroPaths>,
  bundle: KiroBundle,
): Promise<void> {
  const legacyArtifacts = getLegacyKiroArtifacts(bundle)
  for (const skillName of legacyArtifacts.skills) {
    await moveLegacyArtifactToBackup(paths.managedDir, "skills", paths.skillsDir, skillName, "Kiro skill")
  }
  for (const agentName of legacyArtifacts.agents) {
    await moveLegacyArtifactToBackup(paths.managedDir, "agents", paths.agentsDir, `${agentName}.json`, "Kiro agent")
    await moveLegacyArtifactToBackup(
      paths.managedDir,
      "agents",
      path.join(paths.agentsDir, "prompts"),
      `${agentName}.md`,
      "Kiro agent prompt",
    )
  }
}

function validatePathSafe(name: string, label: string): void {
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error(`${label} name contains unsafe path characters: ${name}`)
  }
}
