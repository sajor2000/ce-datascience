import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const clifRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-clif")

async function readClif(relativePath: string): Promise<string> {
  return readFile(path.join(clifRoot, relativePath), "utf8")
}

describe("CLIF guidance", () => {
  test("uses the current public CLIF 2.1.0 default instead of stale version claims", async () => {
    const files = await Promise.all([
      readClif("SKILL.md"),
      readClif("references/clif-rules.md"),
      readClif("references/mcide-vocab.md"),
      readClif("references/r-template-recipes.md"),
    ])
    const combined = files.join("\n")

    expect(combined).toContain("2.1.0")
    expect(combined).toContain("last verified 2026-06-06")
    expect(combined).toContain("https://clif-icu.com/")
    expect(combined).toContain("Core source")
    expect(combined).not.toContain("2.1.1")
    expect(combined).not.toContain("2.2.0")
    expect(combined).not.toContain("latest stable release")
  })

  test("points Python users at current clifpy install guidance", async () => {
    const recipes = await readClif("references/clifpy-recipes.md")

    expect(recipes).toContain("python3 -m pip install --upgrade clifpy")
    expect(recipes).toContain("Always prefer the latest clifpy release")
    expect(recipes).toContain("https://clif-icu.com/")
    expect(recipes).not.toContain("0.4.9")
    expect(recipes).not.toContain("clifpy==")
    expect(recipes).toContain("Python >=3.9")
  })
})
