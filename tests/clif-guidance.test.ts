import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const clifRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-clif")

async function readClif(relativePath: string): Promise<string> {
  return readFile(path.join(clifRoot, relativePath), "utf8")
}

describe("CLIF guidance", () => {
  test("uses the refreshed CLIF 2.1.0 default instead of stale version claims", async () => {
    const files = await Promise.all([
      readClif("SKILL.md"),
      readClif("references/clif-rules.md"),
      readClif("references/mcide-vocab.md"),
      readClif("references/r-template-recipes.md"),
    ])
    const combined = files.join("\n")

    expect(combined).toContain("2.1.0")
    expect(combined).toContain("last verified 2026-05-30")
    expect(combined).not.toContain("2.1.1")
    expect(combined).not.toContain("2.2.0")
    expect(combined).not.toContain("latest stable release")
  })

  test("points Python users at current clifpy install guidance", async () => {
    const recipes = await readClif("references/clifpy-recipes.md")

    expect(recipes).toContain("python3 -m pip install clifpy")
    expect(recipes).toContain("0.4.9")
    expect(recipes).toContain("Python >=3.9")
  })
})
