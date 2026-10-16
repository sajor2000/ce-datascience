import { describe, expect, test } from "bun:test"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import os from "os"
import path from "path"

const skillRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-clif-meta-analysis")
const pythonScript = path.join(skillRoot, "scripts", "aggregate_meta.py")
const rScript = path.join(skillRoot, "scripts", "aggregate_meta.R")
const examplePath = path.join(skillRoot, "assets", "aggregate_meta_input.example.json")
const python = Bun.which("python3")
const rscript = Bun.which("Rscript")

function run(command: string[], cwd = process.cwd(), env: Record<string, string | undefined> = {}) {
  const proc = Bun.spawnSync(command, { cwd, env: { ...process.env, ...env }, stdout: "pipe", stderr: "pipe" })
  return {
    code: proc.exitCode,
    stdout: proc.stdout.toString(),
    stderr: proc.stderr.toString(),
  }
}

function withInput(mutator?: (input: Record<string, unknown>) => void) {
  const temp = mkdtempSync(path.join(os.tmpdir(), "ce-clif-meta-"))
  const input = JSON.parse(readFileSync(examplePath, "utf8")) as Record<string, unknown>
  mutator?.(input)
  const inputPath = path.join(temp, "input.json")
  writeFileSync(inputPath, JSON.stringify(input, null, 2))
  return { temp, input, inputPath }
}

function unit(input: Record<string, unknown>, index: number): Record<string, unknown> {
  return (input.units as Record<string, unknown>[])[index]
}

describe("ce-clif-meta-analysis aggregate contract and templates", () => {
  test.skipIf(!python)("validates the retained failure row and matches an independent common-effect calculation", () => {
    const { temp, inputPath } = withInput()
    try {
      const outputPath = path.join(temp, "result.json")
      const tsvPath = path.join(temp, "validated.tsv")
      const result = run([python!, pythonScript, "--input", inputPath, "--output", outputPath, "--validated-tsv", tsvPath])
      expect(result.code).toBe(0)
      const output = JSON.parse(readFileSync(outputPath, "utf8"))
      expect(output.k_usable).toBe(3)
      expect(output.retained_nonusable_units).toEqual([
        { analysis_unit_id: "unit-004", status: "failed", status_reason: "synthetic example: convergence failure" },
      ])
      // Independent calculation: (100*0.10 + 25*0.20 + 100*0.15) / 225 = 2/15.
      expect(output.result.pooled_effect).toBeCloseTo(2 / 15, 14)
      expect(output.result.standard_error).toBeCloseTo(1 / 15, 14)
      expect(output.result.confidence_interval_95[0]).toBeCloseTo(0.002669067697329733, 14)
      expect(output.result.confidence_interval_95[1]).toBeCloseTo(0.2639975989693369, 14)
      expect(output.result.diagnostics.q).toBeCloseTo(0.25, 14)
      expect(output.result.diagnostics.degrees_freedom).toBe(2)
      expect(output.result.diagnostics.i2_percent).toBe(0)
      expect(output.result.diagnostics.weights).toEqual([
        { analysis_unit_id: "unit-001", relative_weight: 4 / 9 },
        { analysis_unit_id: "unit-002", relative_weight: 1 / 9 },
        { analysis_unit_id: "unit-003", relative_weight: 4 / 9 },
      ])
      expect(output.result.warnings).toContain("k <= 4: heterogeneity estimates and normal-approximation inference are especially unstable.")
      expect(readFileSync(tsvPath, "utf8").trim().split("\n")).toHaveLength(4)
    } finally {
      rmSync(temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python)("rejects an incompatible effect contract without dropping the unit", () => {
    const { temp, inputPath } = withInput((input) => {
      unit(input, 1).effect_measure = "risk difference"
    })
    try {
      const result = run([python!, pythonScript, "--input", inputPath, "--validate-only"])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain("incompatible with analysis_contract.effect_measure")
    } finally {
      rmSync(temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python)("rejects duplicate independent identifiers and unreviewed dependence", () => {
    const duplicate = withInput((input) => {
      unit(input, 1).site_id = "site-001"
    })
    const dependent = withInput((input) => {
      const contract = input.analysis_contract as Record<string, unknown>
      contract.independence_assertion = "independence_unknown"
      for (const row of input.units as Record<string, unknown>[]) row.independence_assertion = "independence_unknown"
    })
    try {
      const duplicateResult = run([python!, pythonScript, "--input", duplicate.inputPath, "--validate-only"])
      expect(duplicateResult.code).toBe(2)
      expect(duplicateResult.stderr).toContain("site_id duplicates")
      const dependentResult = run([python!, pythonScript, "--input", dependent.inputPath, "--validate-only"])
      expect(dependentResult.code).toBe(2)
      expect(dependentResult.stderr).toContain("unknown or unreviewed overlap is not poolable")
    } finally {
      rmSync(duplicate.temp, { recursive: true, force: true })
      rmSync(dependent.temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python)("rejects NaN, failed-site zero fill, and unstable inverse variances", () => {
    const nan = withInput()
    const zeroFilledFailed = withInput((input) => {
      unit(input, 3).effect = 0
      unit(input, 3).standard_error = 1
    })
    const unstable = withInput((input) => {
      unit(input, 0).standard_error = 1e-200
    })
    try {
      const nanText = readFileSync(nan.inputPath, "utf8").replace('"effect": 0.1', '"effect": NaN')
      writeFileSync(nan.inputPath, nanText)
      const nanResult = run([python!, pythonScript, "--input", nan.inputPath, "--validate-only"])
      expect(nanResult.code).toBe(2)
      expect(nanResult.stderr).toContain("without NaN or Infinity")
      const zeroFilledResult = run([python!, pythonScript, "--input", zeroFilledFailed.inputPath, "--validate-only"])
      expect(zeroFilledResult.code).toBe(2)
      expect(zeroFilledResult.stderr).toContain("never zero-fill")
      const unstableResult = run([python!, pythonScript, "--input", unstable.inputPath, "--validate-only"])
      expect(unstableResult.code).toBe(2)
      expect(unstableResult.stderr).toContain("numerically unsafe")
    } finally {
      rmSync(nan.temp, { recursive: true, force: true })
      rmSync(zeroFilledFailed.temp, { recursive: true, force: true })
      rmSync(unstable.temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python)("rejects duplicate keys and unhashable statuses without writing output", () => {
    const duplicateKeys = withInput()
    const unhashableStatus = withInput((input) => {
      unit(input, 0).status = ["usable"]
    })
    const overflowingResult = withInput((input) => {
      unit(input, 0).effect = 1e308
    })
    try {
      const duplicateText = readFileSync(duplicateKeys.inputPath, "utf8").replace(
        '  "schema_version": "1.0",',
        '  "schema_version": "1.0",\n  "schema_version": "1.0",',
      )
      writeFileSync(duplicateKeys.inputPath, duplicateText)
      const duplicateResult = run([python!, pythonScript, "--input", duplicateKeys.inputPath, "--validate-only"])
      expect(duplicateResult.code).toBe(2)
      expect(duplicateResult.stderr).toContain("duplicate JSON key")
      const statusResult = run([python!, pythonScript, "--input", unhashableStatus.inputPath, "--validate-only"])
      expect(statusResult.code).toBe(2)
      expect(statusResult.stderr).toContain("status must be a non-empty string")
      const outputPath = path.join(overflowingResult.temp, "must-not-exist.json")
      const overflowResult = run([python!, pythonScript, "--input", overflowingResult.inputPath, "--output", outputPath])
      expect(overflowResult.code).toBe(2)
      expect(overflowResult.stderr).toContain("weighted effects overflow")
      expect(existsSync(outputPath)).toBe(false)
    } finally {
      rmSync(duplicateKeys.temp, { recursive: true, force: true })
      rmSync(unhashableStatus.temp, { recursive: true, force: true })
      rmSync(overflowingResult.temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python)("preserves missing-unit dispositions and rejects source-path collisions", () => {
    const missing = withInput((input) => {
      unit(input, 3).status = "missing"
      unit(input, 3).status_reason = "synthetic example: no site return"
    })
    const collisions = withInput()
    try {
      const outputPath = path.join(missing.temp, "result.json")
      const missingResult = run([python!, pythonScript, "--input", missing.inputPath, "--output", outputPath])
      expect(missingResult.code).toBe(0)
      expect(JSON.parse(readFileSync(outputPath, "utf8")).unit_dispositions[3]).toEqual({
        analysis_unit_id: "unit-004",
        site_id: "site-004",
        study_id: "study-004",
        status: "missing",
        status_reason: "synthetic example: no site return",
      })
      const sourceBefore = readFileSync(collisions.inputPath, "utf8")
      const sourceCollision = run([python!, pythonScript, "--input", collisions.inputPath, "--output", collisions.inputPath])
      expect(sourceCollision.code).toBe(2)
      expect(sourceCollision.stderr).toContain("source input will not be overwritten")
      expect(readFileSync(collisions.inputPath, "utf8")).toBe(sourceBefore)
      const sharedOutput = path.join(collisions.temp, "shared.json")
      const outputCollision = run([
        python!, pythonScript,
        "--input", collisions.inputPath,
        "--output", sharedOutput,
        "--validated-tsv", sharedOutput,
      ])
      expect(outputCollision.code).toBe(2)
      expect(outputCollision.stderr).toContain("resolve to the same path")
      const validatedInputCollision = run([
        python!, pythonScript,
        "--input", collisions.inputPath,
        "--validate-only",
        "--validated-tsv", collisions.inputPath,
      ])
      expect(validatedInputCollision.code).toBe(2)
      expect(validatedInputCollision.stderr).toContain("source input will not be overwritten")
    } finally {
      rmSync(missing.temp, { recursive: true, force: true })
      rmSync(collisions.temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python)("states the Python PM boundary and does not silently substitute REML", () => {
    const script = readFileSync(pythonScript, "utf8")
    expect(script).toContain('method_re="iterated"')
    expect(script).toContain("Paule-Mandel")
    expect(script).toContain("not REML")
    expect(script).toContain("conf_int(use_t=True)[3]")
    const { temp, inputPath } = withInput()
    try {
      const result = run([python!, pythonScript, "--input", inputPath, "--output", path.join(temp, "pm.json"), "--method", "pm"])
      if (result.code === 0) {
        const output = JSON.parse(readFileSync(path.join(temp, "pm.json"), "utf8"))
        expect(output.result.tau2_estimator).toContain("Paule-Mandel")
        expect(output.result.tau2_estimator).toContain("not REML")
        expect(output.result.interval_method).toContain("HKSJ/WLS")
      } else {
        expect(result.code).toBe(2)
        expect(result.stderr).toContain("requires installed numpy and statsmodels")
      }
    } finally {
      rmSync(temp, { recursive: true, force: true })
    }
  })

  test.skipIf(!python || !rscript)("uses the same Python validator boundary before the R metafor call, including paths with spaces", () => {
    const { temp, inputPath } = withInput()
    const spaceTemp = mkdtempSync(path.join(os.tmpdir(), "ce clif meta r-"))
    try {
      const spacedInput = path.join(spaceTemp, "input with spaces.json")
      const spacedValidator = path.join(spaceTemp, "aggregate meta validator.py")
      writeFileSync(spacedInput, readFileSync(inputPath, "utf8"))
      writeFileSync(spacedValidator, readFileSync(pythonScript, "utf8"))
      const result = run(
        [
          rscript!, rScript,
          "--input", spacedInput,
          "--validator", spacedValidator,
          "--validated-dir", spaceTemp,
          "--validate-only",
        ],
        process.cwd(),
      )
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("validated aggregate input through Python contract boundary")
      const script = readFileSync(rScript, "utf8")
      expect(script).toContain('method = "REML"')
      expect(script).toContain('test = "knha"')
      expect(script).toContain("metafor")
      expect(script).toContain("shQuote(args$validator)")
      expect(script).toContain("shQuote(args$input)")
      expect(script).toContain("shQuote(validated_tsv)")
      expect(script).toContain("on.exit(unlink")
      expect(script).toContain("--validated-manifest")
      expect(script).toContain("provenance_lines")
      expect(script).toContain('"diagnostics"')
      expect(existsSync(path.join(spaceTemp, "aggregate-meta-validated.tsv"))).toBe(false)
      expect(existsSync(path.join(spaceTemp, "aggregate-meta-manifest.json"))).toBe(false)
      const sourceBefore = readFileSync(spacedInput, "utf8")
      const collision = run([
        rscript!, rScript,
        "--input", spacedInput,
        "--validator", spacedValidator,
        "--output", spacedInput,
      ])
      expect(collision.code).toBe(2)
      expect(collision.stderr).toContain("source input will not be overwritten")
      expect(readFileSync(spacedInput, "utf8")).toBe(sourceBefore)
    } finally {
      rmSync(temp, { recursive: true, force: true })
      rmSync(spaceTemp, { recursive: true, force: true })
    }
  })
})
