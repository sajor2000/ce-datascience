import { describe, expect, test } from "bun:test"
import { readdir, readFile } from "fs/promises"
import path from "path"

// R is not installed in CI, so these guards pin fixes that were verified against
// the package documentation (Context7 / OHDSI reference pages) instead of a run.
const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

async function bundledRScripts(): Promise<string[]> {
  const files: string[] = []
  for (const skill of await readdir(skillsRoot)) {
    const dir = path.join(skillsRoot, skill, "scripts")
    const entries = await readdir(dir).catch(() => [] as string[])
    for (const entry of entries) if (entry.endsWith(".R")) files.push(path.join(dir, entry))
  }
  return files
}

describe("bundled R scripts", () => {
  test("define %||% when they use it (base R only has it from 4.4)", async () => {
    const offenders: string[] = []
    for (const file of await bundledRScripts()) {
      const source = await readFile(file, "utf8")
      if (source.includes("%||%") && !/`%\|\|%`\s*<-\s*function/.test(source)) offenders.push(path.relative(skillsRoot, file))
    }
    expect(offenders).toEqual([])
  })

  test("pmsampsize runner passes Cox-Snell R^2 (not rsquared) for binary and survival outcomes", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-power", "scripts", "pmsampsize_runner.R"), "utf8")
    expect(source).toContain("csrsquared")
    expect(source).toContain("nagrsquared")
    expect(source).toContain("cstatistic")
    expect(source).not.toMatch(/type = "[bs]", rsquared = /)
  })

  test("meta pooling maps adjusted ratio labels to a summary measure meta back-transforms", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-effect-size", "scripts", "pool_effects.R"), "utf8")
    expect(source).toMatch(/aOR = "OR"/)
    expect(source).toMatch(/aHR = "HR"/)
    expect(source).not.toContain("sm        <- a$metric  # used by meta for axis labels")
  })

  test("Capr concept-set script honors descendants per concept and emits real cs() code", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-cohort-build", "scripts", "concept_set_to_capr.R"), "utf8")
    expect(source).not.toContain("sys.call(0)")
    expect(source).not.toContain("primary_concepts[[1]]$include_descendants")
    expect(source).toContain("exclude(%s)")
    expect(source).toContain("vocabulary_version")
  })
})
