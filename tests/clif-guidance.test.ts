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
    expect(combined).not.toContain("last verified 2026-06-02")
    expect(combined).toContain("https://clif-icu.com/")
    expect(combined).toContain("Core source")
    expect(combined).not.toContain("2.1.1")
    expect(combined).not.toContain("2.2.0")
    expect(combined).not.toContain("latest stable release")
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

    expectContainsAll(setupSkill, [
      "clif_profile_active=true",
      "Weak CLIF signals require two or more matches",
      "profile: clif",
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
    expectContainsAll(configTemplate, ["python: uv", "python: [clifpy, polars]"])
    expectContainsAll(stackTemplate, [
      "CLIF + uv + clifpy/polars + Marimo/Jupyter",
      "python: [uv, venv, conda, poetry, pixi, none]",
    ])
    expect(healthScript).toContain("uv|command -v uv|optional")
  })
})
