import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

// Pins power-reference fixes recomputed in R 4.6.1 (base stats, pwr 1.3.0,
// gsDesign 3.11.0) and statsmodels; see the PR #66 review replies.
const powerRoot = path.join(process.cwd(), "plugins", "methodsmith", "skills", "method-power")

describe("method-power formula references", () => {
  test("two-proportion formula names the solver it matches and separates arcsine solvers", async () => {
    const text = await readFile(path.join(powerRoot, "references", "formula-cheatsheet.md"), "utf8")
    expect(text).not.toContain("matches `pwr.2p.test` / `NormalIndPower` to within 1")
    expect(text).toContain("`power.prop.test`")
    expect(text).toMatch(/arcsine[\s\S]{0,400}249\.8/)
  })

  test("survival event probability weights arms by allocation", async () => {
    const text = await readFile(path.join(powerRoot, "references", "formula-cheatsheet.md"), "utf8")
    expect(text).not.toContain("mean_over_arms")
    expect(text).toMatch(/P_event = 1 - sum_j p_j/)
  })

  test("completion check compares like with like for t-tests", async () => {
    const text = await readFile(path.join(powerRoot, "SKILL.md"), "utf8")
    expect(text).toContain("z_{1-alpha/2}^2 / 4")
  })
})
