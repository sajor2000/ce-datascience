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

  test("pmsampsize runner states three criteria for binary/survival and four for continuous", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-power", "scripts", "pmsampsize_runner.R"), "utf8")
    expect(source).not.toContain("four-criterion")
    expect(source).toMatch(/a\$type == "c"[\s\S]{0,40}"four criteria/)
    expect(source).toContain("three criteria")
  })

  test("meta pooling pins REML, HKSJ CI, k-1 prediction interval, and no default size filter", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-effect-size", "scripts", "pool_effects.R"), "utf8")
    expect(source).toContain('method.tau       = "REML"')
    expect(source).toContain('fit_re("HK")')
    expect(source).toContain('method.predict   = "V"')
    expect(source).toMatch(/is\.null\(a\$`min-n`\)\) 0 else/)
  })

  test("R templates and examples stop instead of installing packages", async () => {
    const files = [
      ...(await bundledRScripts()),
      path.join(skillsRoot, "ce-power", "references", "sensitivity-sweep-template.R"),
      path.join(skillsRoot, "ce-trial-design", "references", "engine-run.example.R"),
    ]
    const offenders: string[] = []
    for (const file of files) {
      const code = (await readFile(file, "utf8")).split("\n").filter((line) => !/^\s*#/.test(line))
      if (code.some((line) => /(?<!['"])install\.packages\(/.test(line.replace(/"[^"]*"|'[^']*'/g, '""')))) {
        offenders.push(path.relative(skillsRoot, file))
      }
    }
    expect(offenders).toEqual([])
  })

  test("trial-design example reads type I error from alpha spent, not the futility-applied null rejection", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-trial-design", "references", "engine-run.example.R"), "utf8")
    expect(source).toContain("type1_error = design$alphaSpent[design$kMax]")
    expect(source).not.toMatch(/type1_error = [^\n]*pow_null\$overallReject/)
  })

  test("Capr concept-set script honors descendants per concept and emits real cs() code", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-cohort-build", "scripts", "concept_set_to_capr.R"), "utf8")
    expect(source).not.toContain("sys.call(0)")
    expect(source).not.toContain("primary_concepts[[1]]$include_descendants")
    expect(source).toContain("exclude(%s)")
    expect(source).toContain("vocabulary_version")
  })

  test("trial-design example keeps full precision, honors the declared direction, and logs warnings", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-trial-design", "references", "engine-run.example.R"), "utf8")
    expect(source).not.toMatch(/(achieved_power|type1_error|expected_information_\w+) = round\(/)
    expect(source).toMatch(/getDesignGroupSequential\([\s\S]*directionUpper = direction_upper/)
    expect(source).toMatch(/record_warning <- function\(w\) \{[\s\S]*message\([\s\S]*muffleWarning/)
  })

  test("meta pooling keeps rows with missing sample size when no size filter is set and skips negated randomization", async () => {
    const source = await readFile(path.join(skillsRoot, "ce-effect-size", "scripts", "pool_effects.R"), "utf8")
    expect(source).toContain("if (min_n > 0) !is.na(dat$sample_size)")
    expect(source).toContain("non[- ]?random")
  })

  test("gsDesign adapter names the non-binding field the 3.11.0 object actually has", async () => {
    const text = await readFile(path.join(skillsRoot, "ce-trial-design", "references", "engine-adapters.md"), "utf8")
    expect(text).toContain("sum(x$falseposnb)")
    expect(text).toContain("`x$falseprobnb` is `NULL`")
  })
})
