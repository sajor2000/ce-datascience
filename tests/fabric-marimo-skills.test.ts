import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { convertClaudeToOpenCode } from "../src/converters/claude-to-opencode"
import { loadClaudePlugin } from "../src/parsers/claude"
import { writeOpenCodeBundle } from "../src/targets/opencode"

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
    expect(skills[0]).toContain("load its named skill")
    expect(skills[0]).toContain("`ce-fabric-coding` skill")
    expect(skills[0]).toContain("`ce-fabric-pipelines` skill")
    expect(skills[0]).toContain("`ce-fabric-semantic-models` skill")
    expect(skills[0]).toContain("`ce-fabric-ml` skill")
    expect(skills[0]).toContain("`ce-fabric-kql` skill")
    expect(skills[0]).toContain("`AskUserQuestion` in Claude Code")
    expect(skills[0]).toContain("`request_user_input` in Codex")
    expect(skills[0]).toContain("`ask_user` in Gemini")
    expect(skills[0]).toContain("`ask_user` in Pi via `pi-ask-user`")
    expect(skills[0]).toContain("`ToolSearch` with `select:AskUserQuestion`")
    expect(skills[0]).toContain("a pending schema load is not a fallback reason")
    expect(skills[0]).toContain("Only when no blocking tool exists or the call errors")
    expect(skills[0]).toContain("free-form input")
    expect(skills.join("\n")).toContain("data_layer: fabric")
    expect(skills.join("\n")).toContain("fail-loud")
    expect(skills.join("\n")).toContain("SQL analytics endpoint")
  })

  test("keeps Marimo notebooks text-native and validation-first", async () => {
    const marimo = await readSkill("ce-marimo")

    expect(marimo).toContain("import marimo as mo")
    expect(marimo).toContain("@app.cell")
    expect(marimo).toContain("marimo check <notebook.py>")
    expect(marimo).toContain("`ce-data-qa`")
    expect(marimo).toContain("Do not silently convert a Jupyter notebook")
    expect(marimo).toContain("Do not wrap ordinary reactive dependencies in broad")
  })

  test("keeps Fabric handoffs usable after OpenCode conversion", async () => {
    const pluginRoot = path.join(process.cwd(), "plugins", "ce-datascience")
    const plugin = await loadClaudePlugin(pluginRoot)
    const bundle = convertClaudeToOpenCode(plugin, {
      agentMode: "subagent",
      inferTemperature: false,
      permissions: "none",
    })
    const outputRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-fabric-opencode-"))

    try {
      await writeOpenCodeBundle(outputRoot, bundle)

      const converted = await fs.readFile(
        path.join(outputRoot, ".opencode", "skills", "ce-fabric", "SKILL.md"),
        "utf8",
      )
      expect(converted).toContain("load its named skill")
      expect(converted).toContain("`ce-fabric-coding` skill")
      expect(converted).toContain("`request_user_input` in Codex")
      expect(converted).toContain("`ToolSearch` with `select:AskUserQuestion`")
      expect(converted).not.toMatch(/`\/ce-[a-z0-9-]+`/)
    } finally {
      await fs.rm(outputRoot, { recursive: true, force: true })
    }
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

  test("keeps R guidance version-aware and evidence-first", async () => {
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

    expect(skills[0]).toContain("Ref MCP")
    expect(skills[0]).toContain("Tavily MCP")
    expect(skills[0]).toContain("verification gap")
    expect(await readSkill("ce-r-tidyverse")).toContain("relationship")
    expect(await readSkill("ce-r-tidyverse")).toContain("unmatched")
    expect(await readSkill("ce-r-targets")).toContain("tar_outdated()")
    expect(await readSkill("ce-r-cran")).toContain("time-sensitive")
    expect(combined).toContain("pinned")
  })
})
