import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const clifRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-clif")
const setupRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-setup")

async function readClif(relativePath: string): Promise<string> {
  return readFile(path.join(clifRoot, relativePath), "utf8")
}

async function readSetup(relativePath: string): Promise<string> {
  return readFile(path.join(setupRoot, relativePath), "utf8")
}

function expectContainsAll(text: string, snippets: string[]): void {
  for (const snippet of snippets) {
    expect(text).toContain(snippet)
  }
}

describe("CLIF guidance", () => {
  test("selects an explicit matching CLIF and mCIDE version family", async () => {
    const files = await Promise.all([
      readClif("SKILL.md"),
      readClif("references/clif-rules.md"),
      readClif("references/mcide-vocab.md"),
      readClif("references/version-families.md"),
      readClif("references/r-template-recipes.md"),
    ])
    const combined = files.join("\n")

    expectContainsAll(combined, [
      "CLIF 2.1 + mCIDE 2.1",
      "CLIF 3.0 + mCIDE 3.0",
      "/ce-clif --version 2.1.0  -> CLIF 2.1.0 + mCIDE 2.1.0",
      "/ce-clif --version 3.0.0  -> CLIF 3.0.0 + mCIDE 3.0.0",
      "selection=explicit",
      "mcide_version=",
      "Which CLIF and mCIDE version family should this project use?",
      "Never silently choose a family",
      "Do not validate against the bundled v2.1 cache",
    ])
    expect(combined).toMatch(/Never\s+infer `3\.0\.0` merely from an/)
    expect(combined).toMatch(/lowercase\s+snake_case mCIDE permissible values/)
    expect(combined).not.toContain("last verified 2026-06-02")
    expect(combined).toContain("https://clif-icu.com/")
    expect(combined).toContain("Core source")
    expect(combined).not.toContain("2.1.1")
    expect(combined).not.toContain("2.2.0")
    expect(combined).not.toContain("Default `version=2.1.0`")
  })

  test("points Python users at current clifpy install guidance", async () => {
    const recipes = await readClif("references/clifpy-recipes.md")

    expectContainsAll(recipes, [
      "python3 -m pip install --upgrade clifpy",
      "uv add clifpy",
      "https://clif-icu.com/",
      "Always prefer the latest clifpy release",
      "Package profile from current CLIF repos",
      "Core CLIF runtime: `clifpy`, `duckdb`, `pyarrow`, `polars`, `pandas`",
      "Validation and pipeline support: `pyyaml`, `pandera`, `sf-hamilton`, `psutil`, `tqdm`",
      "Analysis and reporting: `tableone`, `statsmodels`, `scipy`, `lifelines`, `plotly`, `upsetplot`, `reportlab`",
    ])
    expect(recipes).not.toContain("0.4.9")
    expect(recipes).not.toContain("clifpy==")
    expect(recipes).toContain("Python >=3.9")
  })

  test("setup workflow exposes CLIF-aware package and uv defaults", async () => {
    const setupSkill = await readSetup("SKILL.md")
    const configTemplate = await readSetup("references/config-template.yaml")
    const stackTemplate = await readSetup("references/stack-profile-template.yaml")
    const healthScript = await readSetup("scripts/check-health")

    expectContainsAll(setupSkill.replace(/\s+/g, " "), [
      "clif_profile_active=true",
      "Weak CLIF signals require two or more matches",
      "profile: clif",
      "mcide_version",
      "Which CLIF and mCIDE version family should this project use?",
      "CLIF Parquet files (recommended)",
      "clifpy (recommended official CLIF client)",
      "polars (recommended for large CLIF tables)",
      "duckdb",
      "pyarrow",
      "pandera (schema validation; used in CLIF-MIMIC)",
      "sf-hamilton (pipeline DAGs; used in CLIF-MIMIC)",
      "tableone (Table 1; used in CLIF project repos)",
      "gtsummary (Table 1 and summaries; CLIF template)",
      "cmprsk (competing risks; used in CLIF mobilization analyses)",
      "uv (recommended for current CLIF Python repos and reproducible uv.lock files)",
      "Marimo (recommended for current CLIF Python examples)",
    ])
    expectContainsAll(configTemplate, ["mcide_version", "python: uv", "python: [clifpy, polars]"])
    expectContainsAll(stackTemplate, [
      "CLIF + uv + clifpy/polars + Marimo/Jupyter",
      "mcide_version",
      "python: [uv, venv, conda, poetry, pixi, none]",
    ])
    expect(healthScript).toContain("uv|command -v uv|optional")
  })
})
