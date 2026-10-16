import { afterAll, describe, expect, test } from "bun:test"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import os from "os"
import path from "path"

const script = path.join(
  process.cwd(),
  "plugins/methodsmith/skills/method-phenotype/scripts/validate_phenotype.py",
)
const python3 = Bun.which("python3")
const tmp = mkdtempSync(path.join(os.tmpdir(), "method-phenotype-test-"))
afterAll(() => rmSync(tmp, { recursive: true, force: true }))

/** Synthetic 2x2 (no real subjects): TP=94, FP=6, FN=15, TN=85, as in the SKILL.md example. */
function writeMerged(name: string, cells = { tp: 94, fp: 6, fn: 15, tn: 85 }): string {
  const lines = ["subject_id,chart_label,algo_label,sex"]
  let id = 0
  const add = (n: number, chart: number, algo: number) => {
    for (let i = 0; i < n; i++) lines.push(`s${id++},${chart},${algo},${i % 2 ? "F" : "M"}`)
  }
  add(cells.tp, 1, 1)
  add(cells.fp, 0, 1)
  add(cells.fn, 1, 0)
  add(cells.tn, 0, 0)
  const file = path.join(tmp, name)
  writeFileSync(file, lines.join("\n") + "\n")
  return file
}

function run(args: string[]) {
  const proc = Bun.spawnSync([python3!, script, ...args], { stdout: "pipe", stderr: "pipe" })
  return { code: proc.exitCode, out: proc.stdout.toString(), err: proc.stderr.toString() }
}

const signal = (out: string) =>
  Object.fromEntries(
    (out.match(/__CE_PHENOTYPE_VALIDATE__ (.*)/)?.[1] ?? "")
      .split(" ")
      .map((kv) => kv.split("=") as [string, string]),
  )

describe.skipIf(!python3)("method-phenotype script", () => {
  test("algo-stratified sample without cohort counts reports Se/Sp as not estimable", () => {
    const csv = writeMerged("a.csv")
    const r = run(["T2DM", csv, "--out", path.join(tmp, "a/report.md")])
    expect(r.code).toBe(0)
    const s = signal(r.out)
    expect(s.ppv).toBe("0.94")
    expect(s.npv).toBe("0.85")
    expect(s.sens).toBe("NA")
    expect(s.spec).toBe("NA")
    expect(readFileSync(path.join(tmp, "a/report.md"), "utf8")).toContain("not estimable")
  })

  test("weights each algorithm stratum by its inverse sampling fraction (Begg & Greenes)", () => {
    // pi = P(algo+) = 0.2 in the cohort: Se = .94*.2/(.94*.2 + .15*.8) = 0.610; Sp = 0.983.
    const csv = writeMerged("b.csv")
    const out = path.join(tmp, "b/report.md")
    // FP=6 is below the default floor of 11, which would withhold the CSV metrics.
    const r = run(["T2DM", csv, "--out", out, "--n-algo-pos-pop", "2000", "--n-algo-neg-pop", "8000", "--disclosure-floor", "5"])
    expect(r.code).toBe(0)
    const s = signal(r.out)
    expect(s.sens).toBe("0.61")
    expect(s.spec).toBe("0.98")
    const row = readFileSync(path.join(tmp, "b/report.csv"), "utf8").split("\n")[1].split(",")
    expect(Number(row[9])).toBeCloseTo(0.6104, 3)
    expect(Number(row[10])).toBeCloseTo(0.9827, 3)
  })

  test("equal sampling fractions reproduce the naive estimates", () => {
    const csv = writeMerged("c.csv")
    const r = run(["T2DM", csv, "--out", path.join(tmp, "c/report.md"), "--n-algo-pos-pop", "100", "--n-algo-neg-pop", "100"])
    expect(signal(r.out).sens).toBe("0.86")
    expect(signal(r.out).spec).toBe("0.93")
  })

  test("simple random sample estimates Se/Sp directly", () => {
    const csv = writeMerged("d.csv")
    const r = run(["T2DM", csv, "--out", path.join(tmp, "d/report.md"), "--design", "srs"])
    expect(signal(r.out).sens).toBe("0.86")
  })

  test("suppresses the whole 2x2 when any cell is below the disclosure floor", () => {
    const csv = writeMerged("e.csv")
    run(["T2DM", csv, "--out", path.join(tmp, "e/report.md")])
    const report = readFileSync(path.join(tmp, "e/report.md"), "utf8")
    expect(report).not.toMatch(/\|\s+<11 \|/) // the small cell is not singled out
    expect(report).not.toMatch(/\|\s+94 \|/)
    const agg = readFileSync(path.join(tmp, "e/report.csv"), "utf8")
    expect(agg).not.toContain("s0")
    expect(agg.split("\n")[1]).toContain("suppressed")
  })

  test("rejects cohort counts smaller than the sampled stratum and unpaired counts", () => {
    const csv = writeMerged("f.csv")
    expect(run(["T2DM", csv, "--out", path.join(tmp, "f/r.md"), "--n-algo-pos-pop", "50", "--n-algo-neg-pop", "500"]).code).not.toBe(0)
    expect(run(["T2DM", csv, "--out", path.join(tmp, "f/r.md"), "--n-algo-pos-pop", "500"]).code).not.toBe(0)
  })

  test("error messages never echo subject identifiers", () => {
    const file = path.join(tmp, "bad.csv")
    writeFileSync(file, "subject_id,chart_label,algo_label\nMRN123456,yes,1\n")
    const r = run(["T2DM", file, "--out", path.join(tmp, "g/r.md")])
    expect(r.code).not.toBe(0)
    expect(r.err + r.out).not.toContain("MRN123456")
  })

  test("withholds n and every derived metric from shared outputs when a cell is suppressed", () => {
    // n=200 with PPV 0.94, NPV 0.85 and Wilson CIs reconstructs (94, 6, 15, 85).
    const csv = writeMerged("h.csv")
    const r = run(["T2DM", csv, "--out", path.join(tmp, "h/report.md"), "--design", "srs"])
    expect(r.code).toBe(0)
    const md = readFileSync(path.join(tmp, "h/report.md"), "utf8")
    const agg = readFileSync(path.join(tmp, "h/report.csv"), "utf8")
    const yaml = readFileSync(path.join(tmp, "h/report.yaml"), "utf8")
    for (const text of [md, agg, yaml]) {
      expect(text).not.toMatch(/0\.94|0\.85|0\.86|0\.93|\b200\b/)
      expect(text).not.toMatch(/\(0\.\d\d, 0\.\d\d\)|\[0\.\d\d, 0\.\d\d\]/)
    }
  })

  test("drops a whole subgroup axis when any group is below the floor or has a small cell", () => {
    // Overall cells all >= 11. Sex X has 5 rows, so showing M and F lets X be
    // recovered from the overall table by subtraction.
    const lines = ["subject_id,chart_label,algo_label,sex"]
    let id = 0
    const add = (n: number, chart: number, algo: number, sex: (i: number) => string) => {
      for (let i = 0; i < n; i++) lines.push(`s${id++},${chart},${algo},${sex(i)}`)
    }
    const mf = (i: number) => (i % 2 ? "F" : "M")
    add(40, 1, 1, mf)
    add(30, 0, 1, (i) => (i < 5 ? "X" : mf(i)))
    add(30, 1, 0, mf)
    add(40, 0, 0, mf)
    const file = path.join(tmp, "i.csv")
    writeFileSync(file, lines.join("\n") + "\n")
    const r = run(["T2DM", file, "--out", path.join(tmp, "i/report.md")])
    expect(r.code).toBe(0)
    expect(readFileSync(path.join(tmp, "i/report.md"), "utf8")).not.toContain("Performance by sex")
    expect(readFileSync(path.join(tmp, "i/report.csv"), "utf8")).not.toMatch(/^sex,/m)
    expect(readFileSync(path.join(tmp, "i/report.yaml"), "utf8")).not.toContain("sex:")

    // Every group has n >= 11 but F has FP = 6: the subgroup row would expose it.
    const small = writeMerged("j.csv", { tp: 60, fp: 12, fn: 20, tn: 60 })
    run(["T2DM", small, "--out", path.join(tmp, "j/report.md")])
    expect(readFileSync(path.join(tmp, "j/report.md"), "utf8")).not.toContain("Performance by sex")
  })
})
