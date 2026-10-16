import { describe, expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

// Runs the shipped rpact example when rpact 4.4.0 and jsonlite are installed
// locally; CI has no R, so r-script-guards.test.ts pins the same fixes.
const refs = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-trial-design", "references")
const hasRpact =
  spawnSync("Rscript", ["-e", "quit(status = !(requireNamespace('jsonlite', quietly = TRUE) && requireNamespace('rpact', quietly = TRUE) && packageVersion('rpact') == '4.4.0'))"]).status === 0

function maxInformation(shift: (spec: any) => void): string[] {
  const dir = mkdtempSync(path.join(tmpdir(), "trial-design-example-"))
  const spec = JSON.parse(readFileSync(path.join(refs, "design-spec.example.json"), "utf8"))
  shift(spec)
  writeFileSync(path.join(dir, "design-spec.json"), JSON.stringify(spec))
  const proc = spawnSync("Rscript", [path.join(refs, "engine-run.example.R"), dir], { encoding: "utf8" })
  expect(proc.status).toBe(0)
  return readFileSync(path.join(dir, "engine-results.csv"), "utf8").trim().split("\n").slice(1).map((row) => row.split(",")[7])
}

describe.skipIf(!hasRpact)("ce-trial-design engine-run example", () => {
  test("sizes against the declared null, in either direction", () => {
    const upper = maxInformation((spec) => {
      spec.endpoint.null = 0.5
      for (const sc of spec.scenarios) sc.alternative = 0.5 + sc.alternative
    })
    const lower = maxInformation((spec) => {
      spec.endpoint.null = 0.5
      spec.hypothesis.direction = "lower"
      for (const c of spec.candidates) c.parameters.engine_arguments.directionUpper = false
      for (const sc of spec.scenarios) sc.alternative = 0.5 - sc.alternative
    })
    // Same effect sizes as the shipped example (null 0, alternatives 0.35 and 0.25).
    expect(upper).toEqual(["374", "418", "732", "816"])
    expect(lower).toEqual(["374", "418", "732", "816"])
  })
})
