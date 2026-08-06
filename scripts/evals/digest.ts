import { createHash } from "crypto"
import { promises as fs } from "fs"
import path from "path"

export async function sha256File(filePath: string): Promise<string> {
  const contents = await fs.readFile(filePath)
  return createHash("sha256").update(contents).digest("hex")
}

/**
 * Digest for a scored target.
 *
 * A skill's behavioral contract is not confined to its SKILL.md — most scored
 * literals live in its `references/` files. Hashing only SKILL.md let those
 * files change without invalidating a recorded run, so the fail-closed check
 * passed while the behavior it scores had drifted. For a SKILL.md target the
 * digest therefore covers every file in the skill directory (relative path +
 * per-file sha256, sorted), not the single file.
 *
 * Producers of run.json and the scorer must both use this function; computing
 * the digest independently is how the two sides drift apart.
 */
export async function sha256Target(targetPath: string): Promise<string> {
  if (path.basename(targetPath) !== "SKILL.md") {
    return sha256File(targetPath)
  }
  const skillDir = path.dirname(targetPath)
  const files: string[] = []
  const walk = async (dir: string): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === "__pycache__" || entry.name === ".DS_Store") continue
      const full = path.join(dir, entry.name)
      // Fail loud on symlinks rather than silently skip them. readdir uses
      // lstat semantics, so a symlinked reference file is neither a file nor a
      // directory here and would drop out of the digest — letting its target's
      // content drift without invalidating a recorded run, the exact silent
      // pass this whole-directory digest exists to prevent.
      if (entry.isSymbolicLink()) {
        throw new Error(`unsupported symlink in scored skill directory: ${full}`)
      }
      if (entry.isDirectory()) await walk(full)
      else if (entry.isFile()) files.push(full)
    }
  }
  await walk(skillDir)
  files.sort()

  const lines: string[] = []
  for (const file of files) {
    lines.push(`${path.relative(skillDir, file)}\t${await sha256File(file)}`)
  }
  return createHash("sha256").update(lines.join("\n")).digest("hex")
}
