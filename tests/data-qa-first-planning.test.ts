import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const root = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

async function skillFile(relativePath: string): Promise<string> {
  return readFile(path.join(root, relativePath), "utf8")
}

describe("data-first planning invariant", () => {
  test("ce-plan requires column QA before SAP finalization or modeling", async () => {
    const plan = await skillFile("ce-plan/SKILL.md")
    const phase1 = await skillFile("ce-plan/references/phase1-context-gathering.md")
    const sapWorkflow = await skillFile("ce-plan/references/sap-mode-workflow.md")
    const gapChecklist = await skillFile("ce-plan/references/sap-gap-checklist.md")

    expect(plan).toContain("Data shape before SAP, coding, or modeling")
    expect(phase1).toContain("Phase 1.0 Data-Column and QA Preflight")
    expect(phase1).toContain("actual columns and QA evidence come before SAP finalization, coding, or modeling")
    expect(phase1).toContain("<!-- GAP: missing /ce-data-qa column profile; SAP variable/model sections provisional -->")

    expect(sapWorkflow).toContain("SAP Phase 2.5: Data Profile Gate Before SAP Structure")
    expect(sapWorkflow).toContain("__CE_DATA_PROFILE__")
    expect(sapWorkflow).toContain("do not write a final SAP")

    expect(gapChecklist).toContain("No data profile or QA gate before SAP variables/models")
  })

  test("ce-data-qa provides pre-SAP column profile mode", async () => {
    const dataQa = await skillFile("ce-data-qa/SKILL.md")

    expect(dataQa).toContain("pre-SAP column profile mode")
    expect(dataQa).toContain("row count, column count, column names and types")
    expect(dataQa).toContain("__CE_DATA_PROFILE__")
    expect(dataQa).toContain("does not mean SAP-specific checks have passed")
  })

  test("workflow and work execution enforce QA before downstream work", async () => {
    const lifecycle = await skillFile("ce-workflow/references/lifecycle-paths.md")
    const stateDetection = await skillFile("ce-workflow/references/state-detection.md")
    const work = await skillFile("ce-work/SKILL.md")

    expect(lifecycle).toContain("Data-First Planning Invariant")
    expect(lifecycle).toContain("actual columns and QA evidence come before SAP finalization, coding, or modeling")
    expect(lifecycle).toContain("| 1 | `/ce-data-qa` | Trial data column profile + QA gate")
    expect(lifecycle).toContain("reads, writes, transforms, models, or dashboards data tables")

    expect(stateDetection).toContain("reports/data-qa/*.md")
    expect(stateDetection).toContain("__CE_DATA_PROFILE__")

    expect(work).toContain("Data QA gate before coding/modeling")
    expect(work).toContain("stop execution and route to `/ce-data-qa`")
  })

  test("new SAPs require the biostatistics tabular workbook contract", async () => {
    const plan = await skillFile("ce-plan/SKILL.md")
    const sapWorkflow = await skillFile("ce-plan/references/sap-mode-workflow.md")
    const sapTemplate = await skillFile("ce-plan/references/sap-template.md")
    const gapChecklist = await skillFile("ce-plan/references/sap-gap-checklist.md")
    const lifecycle = await skillFile("ce-workflow/references/lifecycle-paths.md")

    expect(plan).toContain("Every new SAP gets a tabular workbook contract")
    expect(plan).toContain("analysis/sap-tables/01-overview.csv")

    expect(sapWorkflow).toContain("SAP Phase 4.5: Biostatistics Tabular SAP Companion")
    expect(sapWorkflow).toContain("Every new SAP must be paired with the biostatistics-style tabular SAP workbook contract")
    expect(sapWorkflow).toContain("Analysis`, `Claim`, `Unit of Analysis`, `Data File(s)`, `Analysis Question`, `Primary Method`, `Secondary Methods`, `Site Script")
    expect(sapWorkflow).toContain("Output File (SITE_ID_ prefix added automatically)")
    expect(sapWorkflow).toContain("Format / Values")
    expect(sapWorkflow).toContain("`/ce-data-qa` followed by `/ce-sap-tabular <slug>`")

    expect(sapTemplate).toContain("Every new SAP must include the biostatistics-style tabular SAP contract")
    expect(gapChecklist).toContain("No tabular SAP workbook contract")
    expect(lifecycle).toContain("Every new SAP must then get the biostatistics-style tabular workbook contract")
  })

  test("ce-plan blocks causal or observational SAP finalization until analysis assumptions are explicit", async () => {
    const plan = await skillFile("ce-plan/SKILL.md")
    const sapWorkflow = await skillFile("ce-plan/references/sap-mode-workflow.md")
    const gapChecklist = await skillFile("ce-plan/references/sap-gap-checklist.md")

    expect(plan).toContain("Causal/observational analysis guardrail")
    expect(plan).toContain("estimand")
    expect(plan).toContain("time zero")
    expect(plan).toContain("unresolved methodological choices block finalization")
    expect(sapWorkflow).toContain("analysis assumptions: estimand, causal assumptions, unit/grain, key fields, time zero, and success criteria")
    expect(gapChecklist).toContain("Unresolved causal/observational analysis assumptions")
  })

  test("ce-data-qa fails loudly on confirmed causal-workflow integrity violations and warns for ambiguous stack risks", async () => {
    const dataQa = await skillFile("ce-data-qa/SKILL.md")
    const checks = await skillFile("ce-data-qa/references/qa-checks.md")

    expect(dataQa).toContain("Causal workflow integrity checks (Python data stacks)")
    expect(dataQa).toContain("confirmed integrity failures are `block`; ambiguous methodological or stack-specific risks are `warn`")
    expect(checks).toContain("QA-17: Join cardinality and row-count reconciliation")
    expect(checks).toContain("QA-18: Key uniqueness before joins")
    expect(checks).toContain("QA-19: Type stability across inputs")
    expect(checks).toContain("QA-20: Pandas index alignment")
    expect(checks).toContain("QA-21: Declared missing-data handling")
    expect(checks).toContain("QA-22: Synthetic or fallback data detection")
    expect(checks).toContain("QA-23: Polars, DuckDB, and large eager-load risks")
    expect(checks).toContain("confirmed integrity violation")
    expect(checks).toContain("warn")
  })

  test("ce-data-qa warns for an unvalidated merge but blocks an observed integrity violation", async () => {
    const checks = await skillFile("ce-data-qa/references/qa-checks.md")

    expect(checks).toMatch(/unvalidated merge.*`warn`/i)
    expect(checks).toMatch(/observed duplicate.*declared.*key.*`block`/i)
  })
})
