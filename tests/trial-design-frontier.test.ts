import { mkdtemp, readFile, rm, writeFile } from "fs/promises"
import { createHash } from "crypto"
import os from "os"
import path from "path"
import { afterEach, describe, expect, test } from "bun:test"

const script = path.join(
  process.cwd(),
  "plugins/ce-datascience/skills/ce-trial-design/scripts/build_frontier.py",
)
const tempRoots = new Set<string>()

afterEach(async () => {
  await Promise.all([...tempRoots].map((root) => rm(root, { recursive: true, force: true })))
  tempRoots.clear()
})

async function makeTempRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "ce-trial-frontier-"))
  tempRoots.add(root)
  return root
}

async function runFrontier(
  root: string,
  spec: unknown,
  results: string,
  runtimeOverrides: Record<string, unknown> = {},
) {
  const specPath = path.join(root, "design-spec.json")
  const resultsPath = path.join(root, "engine-results.csv")
  const engineScriptPath = path.join(root, "engine-run.R")
  const engineLogPath = path.join(root, "engine-run.log")
  const sessionInfoPath = path.join(root, "session-info.txt")
  const runtimeProvenancePath = path.join(root, "runtime-provenance.json")
  const outputDir = path.join(root, "frontier")
  await writeFile(specPath, JSON.stringify(spec), "utf8")
  await writeFile(resultsPath, results, "utf8")
  await writeFile(engineScriptPath, "# synthetic test engine script\n", "utf8")
  await writeFile(engineLogPath, "synthetic test engine log\n", "utf8")
  await writeFile(sessionInfoPath, "R version test\n", "utf8")
  await writeFile(runtimeProvenancePath, JSON.stringify({
    schema_version: 1,
    engine: (spec as { engine: { name: string } }).engine.name,
    engine_version: (spec as { engine: { version: string } }).engine.version,
    r_version: "R version test",
    completed: true,
    results_md5: createHash("md5").update(results).digest("hex"),
    ...runtimeOverrides,
  }), "utf8")

  const proc = Bun.spawn([
    "python3",
    script,
    "--spec",
    specPath,
    "--results",
    resultsPath,
    "--engine-script",
    engineScriptPath,
    "--engine-log",
    engineLogPath,
    "--session-info",
    sessionInfoPath,
    "--runtime-provenance",
    runtimeProvenancePath,
    "--output-dir",
    outputDir,
  ], { stdout: "pipe", stderr: "pipe" })

  return { proc, outputDir }
}

const spec = {
  schema_version: 1,
  design_id: "demo-gsd",
  engine: { name: "rpact", version: "4.3.0" },
  endpoint: {
    type: "continuous",
    name: "primary endpoint",
    estimand: "treatment-policy mean difference",
    effect_scale: "standardized mean difference",
    null: 0,
  },
  hypothesis: { type: "superiority", sided: 1, direction: "upper" },
  target: { alpha: 0.025, power: 0.9, type1_error_tolerance: 0.0001 },
  design: {
    information_unit: "participants",
    allocation_ratio: 1,
  },
  candidates: [
    candidate("base", "base-a"),
    candidate("base", "base-b", "Pocock"),
    candidate("base", "base-dominated"),
    candidate("conservative", "cons-a"),
    candidate("conservative", "cons-b", "Pocock"),
  ],
  scenarios: [
    { id: "base", alternative: 0.35, provenance: "protocol" },
    { id: "conservative", alternative: 0.25, provenance: "sensitivity analysis" },
  ],
  simulation: null as null | {
    algorithm: string
    iterations: number
    seed: number
    monte_carlo_criterion: string
  },
  review: { statistician: null as string | null, status: "pending" },
  unresolved: [] as string[],
}

const header = [
  "scenario_id", "candidate_id", "engine", "engine_version", "analyses",
  "achieved_power", "type1_error", "max_information",
  "expected_information_null", "expected_information_alt",
].join(",")

function candidate(scenario_id: string, id: string, efficacy_rule = "O'Brien-Fleming") {
  return {
    scenario_id,
    id,
    parameters: {
      information_rates: [0.5, 0.75, 1],
      efficacy_rule,
      futility_rule: "beta spending",
      futility_binding: false,
      engine_arguments: { typeOfDesign: efficacy_rule === "Pocock" ? "P" : "OF" },
    },
  }
}

describe("trial-design frontier builder", () => {
  test("emits feasible and Pareto rows plus a provenance receipt", async () => {
    const root = await makeTempRoot()
    const results = [
      header,
      "base,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350",
      "base,base-b,rpact,4.3.0,3,0.93,0.0250,520,390,330",
      "base,base-dominated,rpact,4.3.0,3,0.91,0.0250,540,430,360",
      "conservative,cons-a,rpact,4.3.0,3,0.895,0.0249,700,610,580",
      "conservative,cons-b,rpact,4.3.0,3,0.91,0.0252,720,620,590",
    ].join("\n")
    const { proc, outputDir } = await runFrontier(root, spec, results)

    expect(await proc.exited).toBe(0)
    const frontier = await readFile(path.join(outputDir, "frontier.csv"), "utf8")
    expect(frontier).toContain("base-a")
    expect(frontier).toContain("base-b")
    expect(frontier).not.toContain("base-dominated")
    expect(frontier).not.toContain("cons-a")
    expect(frontier).not.toContain("cons-b")

    const receipt = JSON.parse(await readFile(path.join(outputDir, "receipt.json"), "utf8"))
    expect(receipt).toMatchObject({
      schema_version: 1,
      design_id: "demo-gsd",
      engine: { name: "rpact", version: "4.3.0" },
      counts: { input_rows: 5, feasible_rows: 3, frontier_rows: 2 },
      statistical_engine_validated_by_ce: false,
    })
    expect(receipt.inputs.spec_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(receipt.inputs.results_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(receipt.inputs.engine_script_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(receipt.inputs.engine_log_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(receipt.inputs.session_info_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(receipt.inputs.runtime_provenance_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(receipt.runtime).toMatchObject({ engine: "rpact", engine_version: "4.3.0", completed: true })

    const handoff = await readFile(path.join(outputDir, "sap-handoff.md"), "utf8")
    expect(handoff).toContain("does not validate the statistical mathematics")
    expect(handoff).toContain("Estimand: treatment-policy mean difference")
    expect(handoff).toContain("Information unit: participants")
    expect(handoff).toContain("base/base-b: information rates")
    expect(handoff).toContain("efficacy = Pocock")
    expect(handoff).toContain("base-a")
  })

  test("fails closed when results do not match the pinned engine version", async () => {
    const root = await makeTempRoot()
    const results = [
      header,
      "base,base-a,rpact,4.2.0,3,0.91,0.0249,500,420,350",
      "conservative,cons-a,rpact,4.2.0,3,0.91,0.0249,700,610,580",
    ].join("\n")
    const { proc } = await runFrontier(root, spec, results)

    expect(await proc.exited).toBe(2)
    expect(await new Response(proc.stderr).text()).toContain("engine version")
  })

  test("fails closed when a declared scenario has no engine output", async () => {
    const root = await makeTempRoot()
    const results = [
      header,
      "base,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350",
    ].join("\n")
    const { proc } = await runFrontier(root, spec, results)

    expect(await proc.exited).toBe(2)
    expect(await new Response(proc.stderr).text()).toContain("missing scenario/candidate pairs")
  })

  test("accepts an empty frontier as a valid negative result", async () => {
    const root = await makeTempRoot()
    const noFeasibleSpec = structuredClone(spec)
    noFeasibleSpec.candidates = [
      candidate("base", "base-a"),
      candidate("conservative", "cons-a"),
    ]
    const results = [
      header,
      "base,base-a,rpact,4.3.0,3,0.89,0.0249,500,420,350",
      "conservative,cons-a,rpact,4.3.0,3,0.91,0.026,700,610,580",
    ].join("\n")
    const { proc, outputDir } = await runFrontier(root, noFeasibleSpec, results)

    expect(await proc.exited).toBe(0)
    const frontier = await readFile(path.join(outputDir, "frontier.csv"), "utf8")
    expect(frontier.trim().split("\n")).toHaveLength(1)
    const receipt = JSON.parse(await readFile(path.join(outputDir, "receipt.json"), "utf8"))
    expect(receipt.counts).toMatchObject({ feasible_rows: 0, frontier_rows: 0 })
    const handoff = await readFile(path.join(outputDir, "sap-handoff.md"), "utf8")
    expect(handoff).toContain("No candidate met the declared power and type I error thresholds")
  })

  test("runs the shipped design and normalized-result examples", async () => {
    const root = await makeTempRoot()
    const referenceRoot = path.join(
      process.cwd(),
      "plugins/ce-datascience/skills/ce-trial-design/references",
    )
    const exampleSpec = JSON.parse(
      await readFile(path.join(referenceRoot, "design-spec.example.json"), "utf8"),
    )
    const exampleResults = await readFile(
      path.join(referenceRoot, "engine-results.example.csv"),
      "utf8",
    )
    const { proc, outputDir } = await runFrontier(root, exampleSpec, exampleResults)

    expect(await proc.exited).toBe(0)
    expect(await readFile(path.join(outputDir, "frontier.csv"), "utf8")).toContain("of-3-look")
  })

  test("requires an explicit type I error tolerance", async () => {
    const root = await makeTempRoot()
    const missingTolerance = structuredClone(spec)
    delete (missingTolerance.target as Partial<typeof missingTolerance.target>).type1_error_tolerance
    const { proc } = await runFrontier(root, missingTolerance, `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`)

    expect(await proc.exited).toBe(2)
    expect(await new Response(proc.stderr).text()).toContain("type1_error_tolerance is required")
  })

  test("rejects scenarios without candidates and boolean numeric fields", async () => {
    const missingCandidateRoot = await makeTempRoot()
    const missingCandidate = structuredClone(spec)
    missingCandidate.candidates = missingCandidate.candidates.filter(
      (item) => item.scenario_id === "base",
    )
    const first = await runFrontier(
      missingCandidateRoot,
      missingCandidate,
      `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`,
    )
    expect(await first.proc.exited).toBe(2)
    expect(await new Response(first.proc.stderr).text()).toContain("scenarios without candidates")

    const booleanRoot = await makeTempRoot()
    const booleanSided = structuredClone(spec)
    booleanSided.hypothesis.sided = true as unknown as number
    const second = await runFrontier(
      booleanRoot,
      booleanSided,
      `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`,
    )
    expect(await second.proc.exited).toBe(2)
    expect(await new Response(second.proc.stderr).text()).toContain("hypothesis.sided must be 1 or 2")

    const rateRoot = await makeTempRoot()
    const booleanRate = structuredClone(spec)
    booleanRate.candidates[0].parameters.information_rates[0] = true as unknown as number
    const third = await runFrontier(
      rateRoot,
      booleanRate,
      `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`,
    )
    expect(await third.proc.exited).toBe(2)
    expect(await new Response(third.proc.stderr).text()).toContain("information_rates[0] must be numeric")
  })

  test("rejects undeclared candidates and impossible expected information", async () => {
    const root = await makeTempRoot()
    const narrowSpec = structuredClone(spec)
    narrowSpec.candidates = [candidate("base", "base-a")]
    narrowSpec.scenarios = [narrowSpec.scenarios[0]]
    const undeclared = `${header}\nbase,other,rpact,4.3.0,3,0.91,0.0249,500,420,350`
    const first = await runFrontier(root, narrowSpec, undeclared)
    expect(await first.proc.exited).toBe(2)
    expect(await new Response(first.proc.stderr).text()).toContain("undeclared scenario/candidate pair")

    const secondRoot = await makeTempRoot()
    const impossible = `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,520,350`
    const second = await runFrontier(secondRoot, narrowSpec, impossible)
    expect(await second.proc.exited).toBe(2)
    expect(await new Response(second.proc.stderr).text()).toContain("must not exceed max_information")
  })

  test("supports a pinned gsDesign result identity", async () => {
    const root = await makeTempRoot()
    const gsSpec = structuredClone(spec)
    gsSpec.engine = { name: "gsDesign", version: "3.7.0" }
    gsSpec.scenarios = [gsSpec.scenarios[0]]
    gsSpec.candidates = [candidate("base", "base-a")]
    const results = `${header}\nbase,base-a,gsDesign,3.7.0,3,0.9,0.0251,500,420,350`
    const { proc } = await runFrontier(root, gsSpec, results)

    expect(await proc.exited).toBe(0)
  })

  test("rejects inconsistent runtime provenance", async () => {
    const narrowSpec = structuredClone(spec)
    narrowSpec.scenarios = [narrowSpec.scenarios[0]]
    narrowSpec.candidates = [candidate("base", "base-a")]
    const results = `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`
    const cases = [
      { overrides: { engine_version: "4.2.0" }, error: "runtime provenance engine version" },
      { overrides: { results_md5: "0".repeat(32) }, error: "results_md5 does not match" },
      { overrides: { completed: false }, error: "completed must be true" },
    ]
    for (const testCase of cases) {
      const root = await makeTempRoot()
      const { proc } = await runFrontier(root, narrowSpec, results, testCase.overrides)
      expect(await proc.exited).toBe(2)
      expect(await new Response(proc.stderr).text()).toContain(testCase.error)
    }
  })

  test("renders simulation, reviewer, and unresolved design controls", async () => {
    const root = await makeTempRoot()
    const simulated = structuredClone(spec)
    simulated.scenarios = [simulated.scenarios[0]]
    simulated.candidates = [candidate("base", "base-a")]
    simulated.simulation = {
      algorithm: "seeded Monte Carlo",
      iterations: 10000,
      seed: 42,
      monte_carlo_criterion: "upper 95% bound below alpha limit",
    }
    simulated.review = { statistician: "Named statistician", status: "pending" }
    simulated.unresolved = ["Confirm recruitment feasibility"]
    const results = `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`
    const { proc, outputDir } = await runFrontier(root, simulated, results)

    expect(await proc.exited).toBe(0)
    const handoff = await readFile(path.join(outputDir, "sap-handoff.md"), "utf8")
    expect(handoff).toContain("algorithm = seeded Monte Carlo")
    expect(handoff).toContain("Named statistician")
    expect(handoff).toContain("Confirm recruitment feasibility")
  })

  test("fails closed on invalid simulation controls", async () => {
    const base = structuredClone(spec)
    base.scenarios = [base.scenarios[0]]
    base.candidates = [candidate("base", "base-a")]
    const results = `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`
    const cases = [
      { field: "algorithm", value: "", error: "simulation.algorithm" },
      { field: "iterations", value: 0, error: "simulation.iterations" },
      { field: "seed", value: true, error: "simulation.seed" },
      { field: "monte_carlo_criterion", value: "", error: "simulation.monte_carlo_criterion" },
    ]
    for (const testCase of cases) {
      const root = await makeTempRoot()
      const invalid = structuredClone(base) as typeof base & { simulation: Record<string, unknown> }
      invalid.simulation = {
        algorithm: "seeded Monte Carlo",
        iterations: 10000,
        seed: 42,
        monte_carlo_criterion: "upper 95% bound below alpha limit",
        [testCase.field]: testCase.value,
      }
      const { proc } = await runFrontier(root, invalid, results)
      expect(await proc.exited).toBe(2)
      expect(await new Response(proc.stderr).text()).toContain(testCase.error)
    }
  })

  test("fails closed on malformed design-spec structures", async () => {
    const results = `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`
    const cases = [
      {
        mutate: (value: any) => { delete value.endpoint.estimand },
        error: "endpoint.estimand",
      },
      {
        mutate: (value: any) => { value.scenarios.push(structuredClone(value.scenarios[0])) },
        error: "scenario ids must be unique",
      },
      {
        mutate: (value: any) => { value.candidates.push(structuredClone(value.candidates[0])) },
        error: "scenario/candidate pairs must be unique",
      },
      {
        mutate: (value: any) => { value.candidates[0].parameters.information_rates = [0.75, 0.5, 1] },
        error: "information_rates must be unique, increasing, and end at 1",
      },
      {
        mutate: (value: any) => { value.review.status = "" },
        error: "review.status",
      },
      {
        mutate: (value: any) => { value.unresolved = "none" },
        error: "unresolved must be an array",
      },
    ]
    for (const testCase of cases) {
      const root = await makeTempRoot()
      const invalid = structuredClone(spec) as any
      invalid.scenarios = [invalid.scenarios[0]]
      invalid.candidates = [candidate("base", "base-a")]
      testCase.mutate(invalid)
      const { proc } = await runFrontier(root, invalid, results)
      expect(await proc.exited).toBe(2)
      expect(await new Response(proc.stderr).text()).toContain(testCase.error)
    }
  })

  test("refuses to mix a rerun into an existing output directory", async () => {
    const root = await makeTempRoot()
    const narrowSpec = structuredClone(spec)
    narrowSpec.scenarios = [narrowSpec.scenarios[0]]
    narrowSpec.candidates = [candidate("base", "base-a")]
    const results = `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`
    const first = await runFrontier(root, narrowSpec, results)
    expect(await first.proc.exited).toBe(0)
    const originalReceipt = await readFile(path.join(first.outputDir, "receipt.json"), "utf8")

    const second = await runFrontier(root, narrowSpec, results)
    expect(await second.proc.exited).toBe(2)
    expect(await new Response(second.proc.stderr).text()).toContain("output directory already exists")
    expect(await readFile(path.join(second.outputDir, "receipt.json"), "utf8")).toBe(originalReceipt)
  })

  test("keeps exact feasibility boundaries and Pareto ties", async () => {
    const root = await makeTempRoot()
    const boundarySpec = structuredClone(spec)
    boundarySpec.scenarios = [boundarySpec.scenarios[0]]
    boundarySpec.candidates = [
      candidate("base", "tie-a"),
      candidate("base", "tie-b"),
    ]
    const results = [
      header,
      "base,tie-a,rpact,4.3.0,3,0.9,0.0251,500,420,350",
      "base,tie-b,rpact,4.3.0,3,0.9,0.0251,500,420,350",
    ].join("\n")
    const { proc, outputDir } = await runFrontier(root, boundarySpec, results)

    expect(await proc.exited).toBe(0)
    const frontier = await readFile(path.join(outputDir, "frontier.csv"), "utf8")
    expect(frontier).toContain("tie-a")
    expect(frontier).toContain("tie-b")
  })

  test("fails closed across malformed normalized-result values", async () => {
    const narrowSpec = structuredClone(spec)
    narrowSpec.scenarios = [narrowSpec.scenarios[0]]
    narrowSpec.candidates = [candidate("base", "base-a")]
    const cases = [
      {
        name: "missing column",
        results: `${header.replace(",expected_information_alt", "")}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420`,
        error: "columns must exactly equal",
      },
      {
        name: "extra column",
        results: `${header},unexpected\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350,value`,
        error: "columns must exactly equal",
      },
      {
        name: "duplicate column",
        results: `${header},achieved_power\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350,0.91`,
        error: "columns must exactly equal",
      },
      {
        name: "duplicate candidate",
        results: `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420,350`,
        error: "duplicate candidate",
      },
      {
        name: "nonnumeric value",
        results: `${header}\nbase,base-a,rpact,4.3.0,3,not-a-number,0.0249,500,420,350`,
        error: "achieved_power must be numeric",
      },
      {
        name: "nonfinite value",
        results: `${header}\nbase,base-a,rpact,4.3.0,3,nan,0.0249,500,420,350`,
        error: "achieved_power must be finite",
      },
      {
        name: "fractional analyses",
        results: `${header}\nbase,base-a,rpact,4.3.0,2.5,0.91,0.0249,500,420,350`,
        error: "analyses must be a positive integer",
      },
      {
        name: "out-of-range probability",
        results: `${header}\nbase,base-a,rpact,4.3.0,3,1.1,0.0249,500,420,350`,
        error: "achieved_power must be between 0 and 1",
      },
      {
        name: "non-positive objective",
        results: `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,0,0,0`,
        error: "max_information must be positive",
      },
      {
        name: "short row",
        results: `${header}\nbase,base-a,rpact,4.3.0,3,0.91,0.0249,500,420`,
        error: "expected_information_alt must not be missing",
      },
    ]

    for (const testCase of cases) {
      const root = await makeTempRoot()
      const { proc } = await runFrontier(root, narrowSpec, testCase.results)
      expect(await proc.exited, testCase.name).toBe(2)
      expect(await new Response(proc.stderr).text(), testCase.name).toContain(testCase.error)
    }
  })
})
