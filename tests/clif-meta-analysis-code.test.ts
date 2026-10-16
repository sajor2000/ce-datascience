import { describe, expect, test } from "bun:test"
import { existsSync, linkSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
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

const metaforAvailable = !!rscript && run([rscript, "-e", 'quit(status=if(requireNamespace("metafor", quietly=TRUE)) 0 else 1)']).code === 0

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
      unit(input, 3).release_status = "not_applicable"
      unit(input, 3).release_review_reference = null
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

  test.skipIf(!python)("blocks submissions without recorded release approval", () => {
    const {temp,inputPath} = withInput(input => { unit(input,0).release_status = "pending" })
    try {
      const result = run([python!, pythonScript, "--input", inputPath, "--validate-only"])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain("before central synthesis")
    } finally { rmSync(temp, {recursive:true,force:true}) }
  })

  test.skipIf(!python)("preserves executable source and rolls back failed multi-artifact output", () => {
    const { temp, inputPath } = withInput()
    try {
      const copiedSource = path.join(temp, "validator.py")
      const source = readFileSync(pythonScript, "utf8")
      writeFileSync(copiedSource, source)
      const overwrite = run([python!, copiedSource, "--input", inputPath, "--output", copiedSource])
      expect(overwrite.code).toBe(2)
      expect(overwrite.stderr).toContain("destination already exists")
      expect(readFileSync(copiedSource, "utf8")).toBe(source)
      const output = path.join(temp, "result.json")
      const tsv = path.join(temp, "verified.tsv")
      const manifest = path.join(temp, "absent", "manifest.json")
      const failure = run([python!, pythonScript, "--input", inputPath, "--output", output,
        "--validated-tsv", tsv, "--validated-manifest", manifest])
      expect(failure.code).toBe(2)
      for (const artifact of [output, tsv, manifest]) expect(existsSync(artifact)).toBe(false)
      if (rscript) {
        const copiedR = path.join(temp, "template.R")
        const rSource = readFileSync(rScript, "utf8")
        writeFileSync(copiedR, rSource)
        const rOverwrite = run([rscript, copiedR, "--input", inputPath, "--validator", copiedSource,
          "--output", copiedR, "--validate-only"])
        expect(rOverwrite.code).toBe(2)
        expect(readFileSync(copiedR, "utf8")).toBe(rSource)
      }
    } finally { rmSync(temp, { recursive: true, force: true }) }
  }, 30000)

  test.skipIf(!python || !metaforAvailable)("fits R REML and parses result provenance when metafor is available", () => {
    const { temp, inputPath } = withInput()
    try {
      const outputPath = path.join(temp, "reml.json")
      const result = run([rscript!, rScript, "--input", inputPath, "--validator", pythonScript, "--output", outputPath])
      expect(result.code).toBe(0)
      const output = JSON.parse(readFileSync(outputPath, "utf8"))
      expect(output.input_sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(output.usable_analysis_unit_ids).toEqual(["unit-001", "unit-002", "unit-003"])
      expect(output.result.method).toBe("random_effects_REML")
      expect(output.result.interval_method).toContain("Knapp-Hartung")
      expect(Number.isFinite(output.result.pooled_effect)).toBe(true)
      expect(output.result.diagnostics.weights.map((row: {analysis_unit_id: string}) => row.analysis_unit_id)).toEqual(output.usable_analysis_unit_ids)
    } finally { rmSync(temp, { recursive: true, force: true }) }
  }, 30000)

  test.skipIf(!python)("removes staged TSV on a mid-write I/O failure", () => {
    const temp = mkdtempSync(path.join(os.tmpdir(), "ce-clif-meta-write-failure-"))
    try {
      const code = `import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location("aggregate_meta", ${JSON.stringify(pythonScript)})
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
class FailingWriter:
    def __init__(self, handle, **kwargs): self.handle=handle
    def writeheader(self): self.handle.write("partial header")
    def writerows(self, rows): raise OSError("synthetic disk full")
m.csv.DictWriter=FailingWriter
try: m.write_validated_tsv(Path(${JSON.stringify(path.join(temp, "verified.tsv"))}), [])
except m.ContractError: print("failure contained")`
      const result = run([python!, "-c", code])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("failure contained")
      expect(run([python!, "-c", `from pathlib import Path; assert not list(Path(${JSON.stringify(temp)}).iterdir())`]).code).toBe(0)
    } finally { rmSync(temp, { recursive: true, force: true }) }
  })

  test.skipIf(!python)("reports Cochran Q from common weights even for an RE fit", () => {
    const code = `import importlib.util, json
spec=importlib.util.spec_from_file_location("aggregate_meta", ${JSON.stringify(pythonScript)})
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
units=[{"analysis_unit_id":"a","effect":0.,"standard_error":1.},{"analysis_unit_id":"b","effect":4.,"standard_error":2.}]
print(json.dumps(m.diagnostics(units,[0.5,0.2],1.5)))`
    const result = run([python!, "-c", code])
    expect(result.code).toBe(0)
    const output = JSON.parse(result.stdout)
    // Common mean=.8, Q=1*(0-.8)^2 + .25*(4-.8)^2 = 3.2.
    expect(output.q).toBeCloseTo(3.2, 12)
    expect(output.i2_percent).toBeCloseTo(68.75, 12)
    expect(output.weights[0].relative_weight).toBeCloseTo(5 / 7, 12)
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
      const existingArtifact = path.join(spaceTemp, "aggregate-meta-validated.tsv")
      writeFileSync(existingArtifact, "existing user content")
      const repeated = run([rscript!, rScript, "--input", spacedInput, "--validator", spacedValidator,
        "--validated-dir", spaceTemp, "--validate-only"])
      expect(repeated.code).toBe(0)
      expect(readFileSync(existingArtifact, "utf8")).toBe("existing user content")
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
      const hardlinkOutput = path.join(spaceTemp, "hardlinked-output.json")
      linkSync(spacedInput, hardlinkOutput)
      const hardlinkCollision = run([rscript!, rScript, "--input", spacedInput,
        "--validator", spacedValidator, "--output", hardlinkOutput, "--validate-only"])
      expect(hardlinkCollision.code).toBe(2)
      expect(hardlinkCollision.stderr).toContain("source input will not be overwritten")
      expect(readFileSync(spacedInput, "utf8")).toBe(sourceBefore)
    } finally {
      rmSync(temp, { recursive: true, force: true })
      rmSync(spaceTemp, { recursive: true, force: true })
    }
  }, 20000)

  test.skipIf(!rscript)("preserves numeric-looking and NA identifiers in the R data boundary", () => {
    const temp = mkdtempSync(path.join(os.tmpdir(), "ce-clif-meta-ids-"))
    try {
      const tsv = path.join(temp, "ids.tsv")
      writeFileSync(tsv, "analysis_unit_id\tsite_id\tstudy_id\teffect\tstandard_error\n001\tNA\t002\t0.1\t0.2\n")
      // Load function definitions without running the command-line entry point.
      const code = `expressions <- parse(${JSON.stringify(rScript)}); for (expr in head(expressions, -1)) eval(expr); d <- read_validated_data(${JSON.stringify(tsv)}); stopifnot(identical(d$analysis_unit_id, "001"), identical(d$site_id, "NA"), identical(d$study_id, "002"), is.numeric(d$effect)); cat("identifiers preserved")`
      const result = run([rscript!, "-e", code])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("identifiers preserved")
    } finally { rmSync(temp, { recursive: true, force: true }) }
  })
})
