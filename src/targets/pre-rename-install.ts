import fs from "fs/promises"
import path from "path"
import { ensureDir, isSafeManagedPath, pathExists } from "../utils/files"
import { PLUGIN_NAME, PRE_REBRAND_PLUGIN_NAME } from "../utils/rebrand-names"

const UNIT_GROUPS = ["skills", "agents", "prompts", "commands", "extensions", "plugins", "workflows", "steering"]

/** Names listed in a pre-rename name manifest, by group (top level or under `groups`). */
function manifestUnits(manifest: Record<string, unknown>): Array<[string, string]> {
  const units: Array<[string, string]> = []
  const groups = { ...manifest, ...(typeof manifest.groups === "object" && manifest.groups ? manifest.groups : {}) } as Record<string, unknown>
  for (const group of UNIT_GROUPS) {
    const names = groups[group]
    if (!Array.isArray(names)) continue
    for (const name of names) if (typeof name === "string" && name) units.push([group, name])
  }
  return units
}

async function readJson(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(filePath, "utf8"))
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

/**
 * rebrand:keep-start
 * The 5.0 rename turned the ce-datascience plugin into methodsmith. A 4.x
 * install left its files under the old name: a managed folder
 * `<root>/ce-datascience/` holding a name manifest (and, for installs made
 * after the ownership ledger existed, a ledger), the units that manifest or
 * ledger lists, and namespace folders such as `agents/ce-datascience/`.
 * rebrand:keep-end
 *
 * All of these are plugin-owned by construction, so the first methodsmith
 * install moves them into `<managedDir>/backups/<stamp>/pre-rename/`. Nothing
 * is deleted, and a unit the user created is in neither the manifest nor the
 * ledger, so it stays where it is.
 *
 * Returns the moved paths (absolute, at their old location).
 */
export async function retirePreRenameInstall(rootDir: string, managedDir: string, pluginName: string): Promise<string[]> {
  if (pluginName !== PLUGIN_NAME) return []
  const oldManagedDir = path.join(path.dirname(managedDir), PRE_REBRAND_PLUGIN_NAME)
  const candidates = new Set<string>()

  const manifest = await readJson(path.join(oldManagedDir, "install-manifest.json"))
  if (manifest?.pluginName === PRE_REBRAND_PLUGIN_NAME) {
    for (const [group, name] of manifestUnits(manifest)) {
      candidates.add(path.join(group, name))
      candidates.add(path.join(group, PRE_REBRAND_PLUGIN_NAME, name))
    }
  }
  const ledger = await readJson(path.join(oldManagedDir, "owned-files.json"))
  if (ledger?.pluginName === PRE_REBRAND_PLUGIN_NAME && ledger.files && typeof ledger.files === "object") {
    for (const relativePath of Object.keys(ledger.files)) candidates.add(relativePath)
  }
  for (const group of UNIT_GROUPS) candidates.add(path.join(group, PRE_REBRAND_PLUGIN_NAME))

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupRoot = path.join(managedDir, "backups", stamp, "pre-rename")
  const moved: string[] = []
  const move = async (absolutePath: string) => {
    if (!(await pathExists(absolutePath))) return
    const relativePath = path.relative(rootDir, absolutePath)
    const destination = path.join(backupRoot, relativePath)
    await ensureDir(path.dirname(destination))
    await fs.rename(absolutePath, destination)
    moved.push(absolutePath)
  }

  // Shortest first, so a namespace folder moves whole before its children are probed.
  for (const relativePath of [...candidates].sort((a, b) => a.length - b.length)) {
    if (!isSafeManagedPath(rootDir, relativePath)) continue
    await move(path.join(rootDir, relativePath))
  }
  await move(oldManagedDir)

  if (moved.length > 0) {
    console.warn(
      `Moved ${moved.length} item(s) from the ${PRE_REBRAND_PLUGIN_NAME} install (the plugin's name before 5.0) to ${backupRoot}. ` +
        `Your own skills were not touched. Copy back anything you still need.`,
    )
  }
  return moved
}
