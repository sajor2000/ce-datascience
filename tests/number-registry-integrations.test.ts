import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const skills = path.join(process.cwd(), "plugins", "methodsmith", "skills")
const read = (rel: string) => readFile(path.join(skills, rel), "utf8")

// The one number-gate clause. Every submission gate carries it word for word.
export const NUMBER_GATE =
  "**Number gate.** Load the `method-numbers` skill and run its `check` on the manuscript sources, rendered copies, and tables " +
  "(it reads `analysis/numbers/registry.json`). A `FAIL` exit, or a gate that could not run, blocks readiness: quote its " +
  "`file:line: reason: token` lines as printed, and never add a result to the allowlist or edit the registry to make it pass."

const GATES = ["method-presubmit/SKILL.md", "method-submission-package/SKILL.md", "method-verify/SKILL.md"]

describe("numbers locked to the registry across skills", () => {
  test("every submission gate runs the number gate and fails closed", async () => {
    for (const rel of GATES) {
      const content = await read(rel)
      expect({ rel, hasClause: content.includes(NUMBER_GATE) }).toEqual({ rel, hasClause: true })
    }
    expect(await read("method-verify/references/check-catalog.md")).toContain("method-numbers")
  })

  test("drafting cites placeholders and never types a result", async () => {
    const writing = await read("method-write/SKILL.md")
    expect(writing).toContain("{{num:<id>}}")
    expect(writing).toContain("never type a result number")
    expect(writing).toContain("`ids`")
  })

  test("Table 1, figure captions, and model-card metrics are registered and cited by id", async () => {
    const table1 = await read("method-table1/SKILL.md")
    expect(table1).toContain("register_table")
    expect(table1).toContain("{{num:table1.<variable>.overall}}")
    expect(table1).toContain("`registry.sap_output`")

    const figure = await read("method-figure/SKILL.md")
    expect(figure).toContain("{{num:<id>}}")
    expect(figure).toContain("captions")

    const card = await read("method-model-card/SKILL.md")
    expect(card).toContain("register_number")
    expect(card).toContain("{{num:<id>}}")
  })

  test("SAP output file names are the registry's SAP output IDs", async () => {
    const sap = await read("method-sap-workbook/SKILL.md")
    expect(sap).toContain("`sap_output`")
    expect(sap).toContain("method-numbers")
  })

  test("the workflow status shows the number registry and gate", async () => {
    const detection = await read("method-workflow/references/state-detection.md")
    expect(detection).toContain("analysis/numbers/registry.json")
    expect(detection).toContain("method-numbers")
  })
})

describe("number registry docs", () => {
  test("README, plugin README, and setup guide carry the same section with a worked example", async () => {
    const section = (text: string) => text.slice(text.indexOf("### Numbers locked to raw data"), text.indexOf("It does not read numbers inside images"))
    expect(section(await readFile(path.join(process.cwd(), "README.md"), "utf8"))).toContain("Word manuscripts")
    const root = await readFile(path.join(process.cwd(), "README.md"), "utf8")
    const plugin = await readFile(path.join(process.cwd(), "plugins", "methodsmith", "README.md"), "utf8")
    const setup = await readFile(path.join(process.cwd(), "docs", "setup.md"), "utf8")
    expect(section(root)).toContain("{{num:primary.hr}}")
    expect(section(root)).toContain("rigor signal")
    expect(section(plugin)).toBe(section(root))
    expect(section(setup)).toBe(section(root))
  })
})

describe("number registry in Word manuscripts", () => {
  test("method-numbers renders and checks DOCX fields, and the Word citation workflow runs the gate on the master", async () => {
    const numbers = await read("method-numbers/SKILL.md")
    expect(numbers).toContain("`.docx`")
    expect(numbers).toContain("ADDIN CE_NUM")
    expect(numbers).toContain("field result differs from registry")
    const citations = await read("method-citations/SKILL.md")
    expect(citations).toContain("method-numbers")
    expect(citations).toContain("ADDIN CE_NUM")
  })
})
