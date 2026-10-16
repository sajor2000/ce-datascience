import { createHash } from "crypto"
import fs from "fs/promises"
import path from "path"
import { ensureDir, isSafeManagedPath, pathExists, writeJson } from "../utils/files"
import { isKnownPluginArtifact } from "../utils/legacy-cleanup"

export const OWNERSHIP_LEDGER_FILE = "owned-files.json"

/**
 * Install ledger: every file the plugin wrote into a target, keyed by its
 * POSIX path relative to the target root, with the SHA-256 of what was
 * written. It is the ownership record that lets an update remove or replace
 * plugin files without touching anything the user created or edited.
 */
export type OwnershipLedger = {
  version: 1
  pluginName: string
  files: Record<string, string>
}

export function hashContent(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex")
}

async function hashFile(filePath: string): Promise<string | null> {
  try {
    return hashContent(await fs.readFile(filePath))
  } catch {
    return null
  }
}

export async function readOwnershipLedger(
  managedDir: string,
  rootDir: string,
  pluginName: string,
): Promise<OwnershipLedger | null> {
  const ledgerPath = path.join(managedDir, OWNERSHIP_LEDGER_FILE)
  let parsed: Partial<OwnershipLedger>
  try {
    parsed = JSON.parse(await fs.readFile(ledgerPath, "utf8")) as Partial<OwnershipLedger>
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Ignoring unreadable install ledger at ${ledgerPath}.`)
    }
    return null
  }
  if (parsed.version !== 1 || parsed.pluginName !== pluginName || !parsed.files || typeof parsed.files !== "object") {
    return null
  }
  // Entries become fs.rm paths, so drop anything that could escape the root.
  const files: Record<string, string> = {}
  for (const [relativePath, digest] of Object.entries(parsed.files)) {
    if (typeof digest === "string" && isSafeManagedPath(rootDir, relativePath)) {
      files[relativePath] = digest
    } else {
      console.warn(`Dropping unsafe install-ledger entry in ${ledgerPath}: ${JSON.stringify(relativePath)}`)
    }
  }
  return { version: 1, pluginName, files }
}

export async function writeOwnershipLedger(managedDir: string, ledger: OwnershipLedger): Promise<void> {
  await writeJson(path.join(managedDir, OWNERSHIP_LEDGER_FILE), ledger)
}

/**
 * One install or update of one plugin into one target root.
 *
 * Rules, in order of precedence:
 * - A file recorded in the previous ledger is plugin-owned. If its current
 *   hash still matches, it is replaced or removed freely; if the user edited
 *   it, a timestamped copy goes to `<managedDir>/backups/` first.
 * - A path with no ledger record is plugin-owned only with a second signal
 *   (`legacyOwned`: a name-manifest entry from before the ledger existed, or a
 *   description fingerprint). Such a unit is moved to backups, then rewritten.
 * - Anything else belongs to the user and is never modified: the plugin skips
 *   that unit and prints one line.
 */
export class InstallOwnership {
  private readonly previous: Record<string, string>
  private readonly written = new Set<string>()
  private readonly retained = new Set<string>()
  private readonly backedUp: string[] = []
  private readonly stamp = new Date().toISOString().replace(/[:.]/g, "-")

  private constructor(
    readonly rootDir: string,
    readonly managedDir: string,
    readonly pluginName: string,
    previous: OwnershipLedger | null,
  ) {
    this.previous = previous?.files ?? {}
    this.hasLedger = previous !== null
  }

  readonly hasLedger: boolean

  static async open(rootDir: string, managedDir: string, pluginName: string): Promise<InstallOwnership> {
    return new InstallOwnership(rootDir, managedDir, pluginName, await readOwnershipLedger(managedDir, rootDir, pluginName))
  }

  private relative(absolutePath: string): string {
    return path.relative(this.rootDir, absolutePath).split(path.sep).join("/")
  }

  private previousEntriesUnder(absolutePath: string): string[] {
    const unit = this.relative(absolutePath)
    return Object.keys(this.previous).filter((entry) => entry === unit || entry.startsWith(`${unit}/`))
  }

  /** True when the previous ledger recorded any file at or under this path. */
  ownsPath(absolutePath: string): boolean {
    return this.previousEntriesUnder(absolutePath).length > 0
  }

  /**
   * Decide whether the plugin may write a unit (a skill directory or a single
   * agent, command, or prompt file). Returns false when the path holds
   * content the plugin cannot prove it created.
   */
  async claim(absolutePath: string, legacyOwned = false): Promise<boolean> {
    if (!(await pathExists(absolutePath))) return true
    if (this.ownsPath(absolutePath)) return true
    // Once a ledger exists it supersedes the name manifest, which also lists
    // units this writer skipped.
    if ((legacyOwned && !this.hasLedger) || (await isKnownPluginArtifact(absolutePath))) {
      await this.backupPath(absolutePath, true)
      return true
    }
    console.warn(
      `Skipped ${absolutePath}: it already exists and ce-datascience did not create it. Rename it to also get the plugin's version.`,
    )
    return false
  }

  /** Keep a previously owned unit in the ledger without rewriting it. */
  retain(absolutePath: string): void {
    for (const entry of this.previousEntriesUnder(absolutePath)) this.retained.add(entry)
  }

  async writeFile(absolutePath: string, content: string | Buffer): Promise<void> {
    const relativePath = this.relative(absolutePath)
    const currentHash = await hashFile(absolutePath)
    if (currentHash !== null && currentHash !== hashContent(content) && currentHash !== this.previous[relativePath]) {
      await this.backupPath(absolutePath, false)
    }
    await ensureDir(path.dirname(absolutePath))
    await fs.writeFile(absolutePath, content)
    this.written.add(relativePath)
  }

  async copyFile(sourcePath: string, absolutePath: string): Promise<void> {
    await this.writeFile(absolutePath, await fs.readFile(sourcePath))
  }

  /**
   * Remove a unit that a pre-ledger name manifest lists as plugin-owned. With
   * no hashes to compare, the unit is moved to backups instead of deleted.
   */
  async removeLegacyUnit(absolutePath: string): Promise<void> {
    if (this.hasLedger || !(await pathExists(absolutePath))) return
    await this.backupPath(absolutePath, true)
  }

  /** Move a retired plugin location to backups whole, whatever the ledger says. */
  async retireToBackup(absolutePath: string): Promise<void> {
    if (await pathExists(absolutePath)) await this.backupPath(absolutePath, true)
  }

  private async backupPath(absolutePath: string, move: boolean): Promise<void> {
    const backupPath = path.join(this.managedDir, "backups", this.stamp, ...this.relative(absolutePath).split("/"))
    await ensureDir(path.dirname(backupPath))
    if (move) {
      await fs.rename(absolutePath, backupPath)
    } else {
      await fs.copyFile(absolutePath, backupPath)
    }
    this.backedUp.push(absolutePath)
  }

  /**
   * Remove plugin files the previous install wrote and this one did not,
   * then record the new ledger. Edited files are backed up first; files the
   * ledger never recorded are left alone.
   */
  async finish(): Promise<void> {
    for (const [relativePath, digest] of Object.entries(this.previous)) {
      if (this.written.has(relativePath) || this.retained.has(relativePath)) continue
      const absolutePath = path.join(this.rootDir, ...relativePath.split("/"))
      const currentHash = await hashFile(absolutePath)
      if (currentHash === null) continue
      if (currentHash !== digest) await this.backupPath(absolutePath, false)
      await fs.rm(absolutePath, { force: true })
      await this.pruneEmptyParents(path.dirname(absolutePath))
    }

    const files: Record<string, string> = {}
    for (const relativePath of [...this.written, ...this.retained].sort()) {
      const digest = this.written.has(relativePath)
        ? await hashFile(path.join(this.rootDir, ...relativePath.split("/")))
        : this.previous[relativePath]
      if (digest) files[relativePath] = digest
    }
    await writeOwnershipLedger(this.managedDir, { version: 1, pluginName: this.pluginName, files })

    if (this.backedUp.length > 0) {
      console.warn(
        `Backed up ${this.backedUp.length} item(s) to ${path.join(this.managedDir, "backups", this.stamp)}: plugin files you edited, or plugin folders from an install made before ce-datascience tracked file ownership. Copy back anything you still need.`,
      )
    }
  }

  private async pruneEmptyParents(dir: string): Promise<void> {
    let current = dir
    while (current !== this.rootDir && current.startsWith(this.rootDir + path.sep)) {
      try {
        await fs.rmdir(current)
      } catch {
        return
      }
      current = path.dirname(current)
    }
  }
}
