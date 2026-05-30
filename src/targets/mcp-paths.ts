import path from "path"
import { sanitizePathName } from "../utils/files"

type SkillDir = {
  name: string
  sourceDir: string
}

type ServerWithArgs = {
  command?: string
  args?: string[]
}

type OpenCodeLocalServer = {
  command?: string[]
}

export function rewriteMcpServerPaths<T extends ServerWithArgs>(
  servers: Record<string, T> | undefined,
  skillDirs: SkillDir[],
  targetSkillsRoot: string,
): Record<string, T> | undefined {
  if (!servers || skillDirs.length === 0) return servers

  const rewritten: Record<string, T> = {}
  for (const [name, server] of Object.entries(servers)) {
    rewritten[name] = {
      ...server,
      command: server.command
        ? rewriteInstalledSkillPath(server.command, skillDirs, targetSkillsRoot)
        : server.command,
      args: server.args?.map((arg) =>
        rewriteInstalledSkillPath(arg, skillDirs, targetSkillsRoot),
      ),
    }
  }
  return rewritten
}

export function rewriteOpenCodeMcpCommandPaths<T extends OpenCodeLocalServer>(
  servers: Record<string, T> | undefined,
  skillDirs: SkillDir[],
  targetSkillsRoot: string,
): Record<string, T> | undefined {
  if (!servers || skillDirs.length === 0) return servers

  const rewritten: Record<string, T> = {}
  for (const [name, server] of Object.entries(servers)) {
    rewritten[name] = {
      ...server,
      command: server.command?.map((arg) =>
        rewriteInstalledSkillPath(arg, skillDirs, targetSkillsRoot),
      ),
    }
  }
  return rewritten
}

function rewriteInstalledSkillPath(
  value: string,
  skillDirs: SkillDir[],
  targetSkillsRoot: string,
): string {
  const suffix = findInstalledSkillSuffix(value, skillDirs)
  if (!suffix) return value
  return path.join(
    targetSkillsRoot,
    sanitizePathName(suffix.skillName),
    ...suffix.parts,
  )
}

function findInstalledSkillSuffix(
  value: string,
  skillDirs: SkillDir[],
): { skillName: string; parts: string[] } | null {
  for (const skill of skillDirs) {
    const sourceDir = path.resolve(skill.sourceDir)
    const absoluteCandidate = path.resolve(value)
    if (absoluteCandidate === sourceDir || absoluteCandidate.startsWith(sourceDir + path.sep)) {
      const relative = path.relative(sourceDir, absoluteCandidate)
      if (relative && !relative.startsWith("..")) {
        return { skillName: skill.name, parts: relative.split(path.sep) }
      }
    }

    const normalizedValue = value.replace(/\\/g, "/").replace(/^\.\//, "")
    const sourceSkillDirName = path.basename(sourceDir)
    for (const marker of [`skills/${sourceSkillDirName}/`, `${sourceSkillDirName}/`]) {
      const markerIndex = normalizedValue.lastIndexOf(marker)
      if (markerIndex === -1) continue
      const relative = normalizedValue.slice(markerIndex + marker.length)
      if (!relative || relative.startsWith("../") || relative.includes("/../")) continue
      return {
        skillName: skill.name,
        parts: relative.split("/").filter(Boolean),
      }
    }
  }

  return null
}
