import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

async function readSkill(name: string): Promise<string> {
  return readFile(path.join(skillsRoot, name, "SKILL.md"), "utf8")
}

describe("Fabric and Marimo workflow skills", () => {
  test("ships a complete Fabric routing family", async () => {
    const names = [
      "ce-fabric",
      "ce-fabric-coding",
      "ce-fabric-pipelines",
      "ce-fabric-semantic-models",
      "ce-fabric-ml",
      "ce-fabric-kql",
    ]
    const skills = await Promise.all(names.map(readSkill))

    expect(skills[0]).toContain("Microsoft Fabric Router")
    expect(skills[0]).toContain("/ce-fabric-coding")
    expect(skills[0]).toContain("/ce-fabric-pipelines")
    expect(skills[0]).toContain("/ce-fabric-semantic-models")
    expect(skills[0]).toContain("/ce-fabric-ml")
    expect(skills[0]).toContain("/ce-fabric-kql")
    expect(skills.join("\n")).toContain("data_layer: fabric")
    expect(skills.join("\n")).toContain("fail-loud")
    expect(skills.join("\n")).toContain("SQL analytics endpoint")
  })

  test("keeps Marimo notebooks text-native and validation-first", async () => {
    const marimo = await readSkill("ce-marimo")

    expect(marimo).toContain("import marimo as mo")
    expect(marimo).toContain("@app.cell")
    expect(marimo).toContain("marimo check <notebook.py>")
    expect(marimo).toContain("/ce-data-qa")
    expect(marimo).toContain("Do not silently convert a Jupyter notebook")
    expect(marimo).toContain("Do not wrap ordinary reactive dependencies in broad")
  })

  test("ships original R workflows for the curated R-statistics categories", async () => {
    const names = [
      "ce-rstats",
      "ce-r-review",
      "ce-r-tidyverse",
      "ce-r-event-studies",
      "ce-r-package-development",
      "ce-r-package-testing",
      "ce-r-cran",
      "ce-r-performance",
      "ce-r-targets",
    ]
    const skills = await Promise.all(names.map(readSkill))
    const combined = skills.join("\n")

    expect(skills[0]).toContain("R Statistics Router")
    expect(combined).toContain("staggered adoption")
    expect(combined).toContain("R CMD check")
    expect(combined).toContain("testthat")
    expect(combined).toContain("_targets.R")
    expect(combined).toContain("fail-loud")
  })
})
