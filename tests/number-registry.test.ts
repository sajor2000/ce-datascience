import { afterAll, describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { createHash } from "crypto"
import os from "os"
import path from "path"

// Synthetic data only. Seams: the Python and R helpers (register_number /
// register_table -> registry.json) and the ce_numbers.py CLI (check, render).
const scriptsDir = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-numbers", "scripts")
const cli = path.join(scriptsDir, "ce_numbers.py")
const roots: string[] = []

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

function git(cwd: string, ...args: string[]) {
  const proc = Bun.spawnSync(["git", "-c", "user.email=t@example.invalid", "-c", "user.name=t", ...args], { cwd })
  if (proc.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${proc.stderr.toString()}`)
  return proc.stdout.toString().trim()
}

// A committed synthetic project: a raw aggregate source file and an analysis script.
function project(analysis: string) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ce-numbers-"))
  roots.push(root)
  git(root, "init", "-q")
  mkdirSync(path.join(root, "data"))
  mkdirSync(path.join(root, "analysis", "numbers"), { recursive: true })
  writeFileSync(path.join(root, "data", "synthetic.csv"), "arm,died\nA,0\nB,1\n")
  writeFileSync(path.join(root, "analysis", "model.py"), `import sys\nsys.path.insert(0, ${JSON.stringify(scriptsDir)})\n${analysis}`)
  git(root, "add", "-A")
  git(root, "commit", "-qm", "synthetic")
  return root
}

function run(cwd: string, cmd: string[]) {
  const proc = Bun.spawnSync(cmd, { cwd })
  return { code: proc.exitCode, out: proc.stdout.toString(), err: proc.stderr.toString() }
}

function registry(root: string) {
  return JSON.parse(readFileSync(path.join(root, "analysis", "numbers", "registry.json"), "utf8"))
}

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex")

describe("Python register_number", () => {
  test("writes a traceable aggregate entry with JAMA-formatted text", () => {
    const root = project(`from ce_numbers import register_number
register_number("primary.hr", 0.781, kind="estimate", ci=(0.664, 0.918), digits=2,
                sources=["data/synthetic.csv"], sap_output="T2")
`)
    const result = run(root, ["python3", "analysis/model.py"])
    expect(result.err).toBe("")
    expect(result.code).toBe(0)

    const entry = registry(root).entries["primary.hr"]
    expect(entry.value).toBe(0.781)
    expect(entry.kind).toBe("estimate")
    expect(entry.text).toBe("0.78 (95% CI, 0.66-0.92)")
    expect(entry.sources).toEqual([{ path: "data/synthetic.csv", sha256: sha256("arm,died\nA,0\nB,1\n") }])
    expect(entry.script.path).toBe("analysis/model.py")
    expect(entry.script.sha256).toBe(sha256(readFileSync(path.join(root, "analysis", "model.py"), "utf8")))
    expect(entry.script.commit).toBe(git(root, "rev-parse", "HEAD"))
    expect(entry.sap_output).toBe("T2")
    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false)
  })
})

describe("Python register_number from a subdirectory", () => {
  test("records the script path relative to the project root", () => {
    const root = project(PRIMARY)
    const result = run(path.join(root, "analysis"), ["python3", "model.py"])
    expect(result.err).toBe("")
    expect(registry(root).entries["primary.hr"].script.path).toBe("analysis/model.py")
  })
})

describe("journal style formatting", () => {
  test("formats P values, counts with percents, and CIs that cross zero per profile", () => {
    const root = project(`from ce_numbers import register_number as r
r("p.main", 0.0312, kind="p")
r("p.tiny", 0.00004, kind="p")
r("p.generic", 0.0312, kind="p", style="generic-biomedical")
r("deaths", 148, kind="count", denominator=412)
r("diff", -1.234, kind="estimate", ci=(-2.5, 0.04), digits=1)
r("pct", 35.92, kind="percent", digits=1)
r("interval", 0.781, kind="ci", ci=(0.664, 0.918))
`)
    const result = run(root, ["python3", "analysis/model.py"])
    expect(result.err).toBe("")
    const e = registry(root).entries
    expect(e["p.main"].text).toBe("P = .03")
    expect(e["p.tiny"].text).toBe("P < .001")
    expect(e["p.generic"].text).toBe("p = 0.03")
    expect(e["deaths"].text).toBe("148 (35.9%)")
    expect(e["diff"].text).toBe("-1.2 (95% CI, -2.5 to 0.0)")
    expect(e["pct"].text).toBe("35.9%")
    expect(e["interval"].text).toBe("0.66-0.92")
  })
})

describe("aggregate-only registry", () => {
  test("suppresses counts from 1 to 10 and keeps no value for them", () => {
    const root = project(`from ce_numbers import register_number as r
r("arm_a.deaths", 7, kind="count", denominator=40)
r("arm_b.deaths", 0, kind="count", denominator=40)
r("arm_c.n", 11, kind="n")
`)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    const e = registry(root).entries
    expect(e["arm_a.deaths"]).toMatchObject({ value: null, text: "<11", suppressed: true })
    expect(JSON.stringify(e["arm_a.deaths"])).not.toContain("17.5")
    expect(e["arm_b.deaths"]).toMatchObject({ value: 0, text: "0 (0.0%)", suppressed: false })
    expect(e["arm_c.n"]).toMatchObject({ value: 11, text: "11", suppressed: false })
  })

  test("rejects non-numeric values and unknown kinds instead of writing them", () => {
    for (const call of [`r("x", "FAKE0001", kind="count")`, `r("x", 1.5, kind="mrn")`, `r("x", float("nan"), kind="estimate")`]) {
      const root = project(`from ce_numbers import register_number as r\n${call}\n`)
      const result = run(root, ["python3", "analysis/model.py"])
      expect(result.code).not.toBe(0)
      const message = result.err.trim().split("\n").at(-1) ?? ""
      expect(message).toStartWith("ValueError")
      expect(message).not.toContain("FAKE0001")
    }
  })
})

describe("Python register_table", () => {
  test("registers each cell under the table id with shared provenance", () => {
    const root = project(`from ce_numbers import register_table
register_table("table1", {
    "age.overall": {"value": 64.2, "kind": "estimate", "digits": 1},
    "female.overall": {"value": 212, "kind": "count", "denominator": 412},
    "female.small_site": {"value": 4, "kind": "count", "denominator": 9},
}, sources=["data/synthetic.csv"], sap_output="T1")
`)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    const e = registry(root).entries
    expect(Object.keys(e).sort()).toEqual(["table1.age.overall", "table1.female.overall", "table1.female.small_site"])
    expect(e["table1.female.overall"]).toMatchObject({ text: "212 (51.5%)", sap_output: "T1", table: "table1" })
    expect(e["table1.female.small_site"]).toMatchObject({ text: "<11", suppressed: true })
    expect(e["table1.age.overall"].script.path).toBe("analysis/model.py")
  })
})

function write(root: string, rel: string, text: string) {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
  writeFileSync(path.join(root, rel), text)
}

function check(root: string, ...args: string[]) {
  return run(root, ["python3", cli, "check", ...args])
}

const PRIMARY = `from ce_numbers import register_number
register_number("primary.hr", 0.781, kind="estimate", ci=(0.664, 0.918), sources=["data/synthetic.csv"], sap_output="T2")
register_number("cohort.n", 412, kind="n", sources=["data/synthetic.csv"], sap_output="F1")
`

describe("numbers gate: fail closed", () => {
  test("fails when there is nothing to check", () => {
    const root = project(PRIMARY)
    write(root, "manuscript/empty.md", "# Results\n\nNo numbers here.\n")

    const noFiles = check(root)
    expect(noFiles.code).toBe(1)
    expect(noFiles.out).toContain("nothing to check")

    const noRegistry = check(root, "manuscript/empty.md")
    expect(noRegistry.code).toBe(1)
    expect(noRegistry.out).toContain("nothing to check")

    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    const noNumbers = check(root, "manuscript/empty.md")
    expect(noNumbers.code).toBe(1)
    expect(noNumbers.out).toContain("nothing to check")
  })

  test("passes a manuscript whose numbers all come from registry placeholders", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/results.qmd", "Among {{num:cohort.n}} patients, the HR was {{num:primary.hr}}.\n")
    const result = check(root, "manuscript/results.qmd")
    expect(result.out).toContain("PASS")
    expect(result.code).toBe(0)
  })
})

describe("numbers gate: untraced numbers", () => {
  test("fails a typed number not produced by the registry and reports file:line and the token", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/rendered.md", [
      "# Results",
      "",
      "Among 412 patients, the HR was 0.78 (95% CI, 0.66-0.92).",
      "Mortality was 23.4% at day 28.",
    ].join("\n"))
    const result = check(root, "manuscript/rendered.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/rendered.md:4: untraced number: 23.4%")
    expect(result.out).not.toContain(":3:")
    expect(result.out).toContain("FAIL")
  })
})

describe("numbers gate: allowlist", () => {
  const MANUSCRIPT = [
    "---",
    "title: Synthetic trial 2",
    "date: 2026-10-16",
    "---",
    "",
    "## 2.1 Study population",
    "",
    "We enrolled adults between 2015 and 2023 at the synthetic site.[12] Prior work agrees [3,4] [1-3].^7^<sup>8</sup>",
    "Follow-up ended January 5, 2024 (data lock 5 January 2024; 01/31/2024; 2024-01-31).",
    "Patients received 5 mg of drug, then 10 mg/kg (see Section 3.2, Figure 2, Fig. 3B, Table 1, eTable 4, Supplement 2, Appendix 3, item 12).",
    "Tests were two-sided P < .05.",
    "",
    "> Item 17: report the number of participants with 95% confidence intervals.",
    "",
    "The guideline asks to “report 2 decimal places” and \"use 3 significant digits\".",
    "",
    "1. Among {{num:cohort.n}} patients, the HR was {{num:primary.hr}}.",
    "",
    "<!-- draft value 0.81 -->",
    "See [the protocol](https://example.org/v2/protocol-17.pdf).",
    "",
    "```r",
    "x <- 42",
    "```",
  ].join("\n")

  test("passes numbers on the explicit allowlist and declared units or phrases", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/methods.md", MANUSCRIPT)
    write(root, "analysis/numbers/allowlist.txt", "# declared by the study team\nunit: mg\nunit: mg/kg\nphrase: two-sided P < .05\n")
    const result = check(root, "manuscript/methods.md")
    expect(result.out).toContain("PASS")
    expect(result.code).toBe(0)
  })

  test("fails undeclared doses and phrases", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/methods.md", MANUSCRIPT)
    const result = check(root, "manuscript/methods.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/methods.md:10: untraced number: 5")
    expect(result.out).toContain("manuscript/methods.md:10: untraced number: 10")
    expect(result.out).toContain("manuscript/methods.md:11: untraced number: .05")
    expect(result.out).not.toMatch(/methods\.md:(?:[1-9]|1[2-9]|2\d):/)
  })
})

describe("numbers gate: inline computed values", () => {
  test("fails inline R or Python expressions that print numbers outside the registry", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/results.Rmd", [
      "Among {{num:cohort.n}} patients the HR was `r round(hr, 2)`.",
      "In Quarto: `{r} n_deaths` and `{python} f\"{auc:.2f}\"`.",
      "Code names such as `model_v2` are fine.",
    ].join("\n"))
    const result = check(root, "manuscript/results.Rmd")
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/results.Rmd:1: inline computed value: `r round(hr, 2)`")
    expect(result.out).toContain("manuscript/results.Rmd:2: inline computed value: `{r} n_deaths`")
    expect(result.out).toContain("manuscript/results.Rmd:2: inline computed value: `{python}")
    expect(result.out).not.toContain(":3:")
  })
})

describe("numbers gate: stale entries", () => {
  function registered() {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/results.md", "Among {{num:cohort.n}} patients, the HR was {{num:primary.hr}}.\n")
    expect(check(root, "manuscript/results.md").code).toBe(0)
    return root
  }

  test("fails when a source file changed after registration", () => {
    const root = registered()
    write(root, "data/synthetic.csv", "arm,died\nA,1\nB,1\n")
    const result = check(root, "manuscript/results.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("registry:primary.hr: stale: source data/synthetic.csv changed")
    expect(result.out).toContain("registry:cohort.n: stale: source data/synthetic.csv changed")
    expect(result.out).not.toContain("A,1")
  })

  test("fails when the producing script changed or a source is gone", () => {
    const root = registered()
    write(root, "analysis/model.py", readFileSync(path.join(root, "analysis", "model.py"), "utf8") + "# edited\n")
    rmSync(path.join(root, "data", "synthetic.csv"))
    const result = check(root, "manuscript/results.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("registry:primary.hr: stale: script analysis/model.py changed")
    expect(result.out).toContain("registry:primary.hr: stale: source data/synthetic.csv missing")
  })
})

describe("numbers gate: registry integrity", () => {
  test("fails a placeholder that names an unknown registry id", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/results.md", "Among {{num:cohort.n}} patients, the HR was {{num:primary.or}}.\n")
    const result = check(root, "manuscript/results.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/results.md:1: unknown registry id: {{num:primary.or}}")
  })

  test("fails a registered count from 1 to 10 without printing it", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    const file = path.join(root, "analysis", "numbers", "registry.json")
    const data = JSON.parse(readFileSync(file, "utf8"))
    data.entries["arm_a.deaths"] = { ...data.entries["cohort.n"], id: "arm_a.deaths", kind: "count", value: 7, text: "7 (17.5%)", suppressed: false }
    writeFileSync(file, JSON.stringify(data))
    write(root, "manuscript/results.md", "Among {{num:cohort.n}} patients, {{num:arm_a.deaths}} died.\n")
    const result = check(root, "manuscript/results.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("registry:arm_a.deaths: small cell: a count from 1 to 10 is not suppressed")
    expect(result.out).not.toContain("17.5")
  })
})

describe("numbers gate: tables", () => {
  test("checks CSV table cells and reports the row line of an untraced cell", () => {
    const root = project(`from ce_numbers import register_table
register_table("table1", {
    "n.overall": {"value": 412, "kind": "n"},
    "age.overall": {"value": 64.2, "kind": "estimate", "digits": 1},
    "female.overall": {"value": 212, "kind": "count", "denominator": 412},
}, sources=["data/synthetic.csv"], sap_output="T1")
`)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "analysis/publication/tables/table1.csv", [
      "Characteristic,Overall (N = 412)",
      "\"Age, mean (SD), y\",64.2 (11.8)",
      "\"Female, No. (%)\",\"212 (51.5%)\"",
      "\"Male, No. (%)\",\"200 (48.5%)\"",
    ].join("\n"))
    const result = check(root, "analysis/publication/tables/table1.csv")
    expect(result.code).toBe(1)
    // Table cells are located by column, never printed (a table may be a run output, which is data).
    expect(result.out).toContain("analysis/publication/tables/table1.csv:2: untraced number: column 2")
    expect(result.out).not.toContain("table1.csv:1:")
    expect(result.out).not.toContain("table1.csv:3:")
    expect(result.out.match(/table1\.csv:4: untraced number: column 2/g)?.length).toBe(1)
    expect(result.out).not.toContain("48.5")
  })
})

describe("numbers renderer", () => {
  test("substitutes formatted registry text and the rendered file passes the gate", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/results.qmd", "Among {{num:cohort.n}} patients, the HR was {{num:primary.hr}}.\n")
    const result = run(root, ["python3", cli, "render", "manuscript/results.qmd", "--out", "manuscript/_rendered/results.qmd"])
    expect(result.err).toBe("")
    expect(result.code).toBe(0)
    expect(readFileSync(path.join(root, "manuscript", "_rendered", "results.qmd"), "utf8"))
      .toBe("Among 412 patients, the HR was 0.78 (95% CI, 0.66-0.92).\n")
    expect(check(root, "manuscript/_rendered/results.qmd").code).toBe(0)
  })

  test("writes nothing when a placeholder is unknown or its entry is stale", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/bad.md", "HR {{num:primary.or}}\n")
    const unknown = run(root, ["python3", cli, "render", "manuscript/bad.md", "--out", "out/bad.md"])
    expect(unknown.code).toBe(1)
    expect(unknown.out).toContain("manuscript/bad.md:1: unknown registry id: {{num:primary.or}}")

    write(root, "manuscript/ok.md", "HR {{num:primary.hr}}\n")
    write(root, "data/synthetic.csv", "changed\n")
    const stale = run(root, ["python3", cli, "render", "manuscript/ok.md", "--out", "out/ok.md"])
    expect(stale.code).toBe(1)
    expect(stale.out).toContain("registry:primary.hr: stale: source data/synthetic.csv changed")
    expect(() => readFileSync(path.join(root, "out", "ok.md"))).toThrow()
    expect(() => readFileSync(path.join(root, "out", "bad.md"))).toThrow()
  })
})

// R is not installed in CI; these run wherever Rscript and jsonlite are available.
const hasR = Bun.which("Rscript") !== null && Bun.spawnSync(["Rscript", "-e", "quit(status = !requireNamespace('jsonlite', quietly = TRUE))"],
  { stderr: "ignore", stdout: "ignore" }).exitCode === 0

describe.skipIf(!hasR)("R register_number and register_table", () => {
  test("write the same registry schema the Python gate checks", () => {
    const root = project("")
    write(root, "analysis/model.R", [
      `source(${JSON.stringify(path.join(scriptsDir, "ce_numbers.R"))})`,
      `register_number("primary.hr", 0.781, kind = "estimate", ci = c(0.664, 0.918), sources = "data/synthetic.csv", sap_output = "T2")`,
      `register_number("p.main", 0.0312, kind = "p", sources = "data/synthetic.csv", sap_output = "T2")`,
      `register_number("interval", -0.5, kind = "ci", ci = c(-1.234, 0.5), sources = "data/synthetic.csv", sap_output = "T3")`,
      `register_table("table1", list(`,
      `  n.overall = list(value = 1412, kind = "n"),`,
      `  female.overall = list(value = 212, kind = "count", denominator = 412),`,
      `  female.small_site = list(value = 4, kind = "count", denominator = 9)`,
      `), sources = "data/synthetic.csv", sap_output = "T1")`,
    ].join("\n"))
    git(root, "add", "-A")
    git(root, "commit", "-qm", "r analysis")
    const result = run(root, ["Rscript", "analysis/model.R"])
    expect(result.err).toBe("")
    expect(result.code).toBe(0)

    const e = registry(root).entries
    expect(e["primary.hr"]).toMatchObject({ value: 0.781, kind: "estimate", text: "0.78 (95% CI, 0.66-0.92)", sap_output: "T2", suppressed: false })
    expect(e["primary.hr"].sources).toEqual([{ path: "data/synthetic.csv", sha256: sha256("arm,died\nA,0\nB,1\n") }])
    expect(e["primary.hr"].script).toEqual({
      path: "analysis/model.R",
      sha256: sha256(readFileSync(path.join(root, "analysis", "model.R"), "utf8")),
      commit: git(root, "rev-parse", "HEAD"),
      committed: true,
    })
    expect(e["p.main"].text).toBe("P = .03")
    expect(e["interval"].text).toBe("-1.23 to 0.50")
    expect(e["table1.n.overall"]).toMatchObject({ text: "1,412", table: "table1", sap_output: "T1" })
    expect(e["table1.female.overall"].text).toBe("212 (51.5%)")
    expect(e["table1.female.small_site"]).toMatchObject({ value: null, text: "<11", suppressed: true })

    write(root, "manuscript/results.md", "Among {{num:table1.n.overall}} patients the HR was {{num:primary.hr}} ({{num:p.main}}).\n")
    expect(check(root, "manuscript/results.md").code).toBe(0)
  })
})

describe("numbers trace", () => {
  test("prints the chain from each sentence to SAP output, script@commit, and source hashes, without values", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/results.md", "# Results\n\nThe HR was {{num:primary.hr}}.\n")
    const result = run(root, ["python3", cli, "trace", "manuscript/results.md"])
    expect(result.code).toBe(0)
    const commit = git(root, "rev-parse", "HEAD").slice(0, 12)
    const source = sha256("arm,died\nA,0\nB,1\n").slice(0, 12)
    expect(result.out).toContain(
      `manuscript/results.md:3 {{num:primary.hr}} <- registry primary.hr (estimate) <- analysis/model.py@${commit} <- data/synthetic.csv#${source} <- SAP T2`,
    )
    expect(result.out).not.toContain("0.78")
  })
})

describe("numbers gate: edge cases", () => {
  test("a sign flip does not trace, while ranges and negative CIs do", () => {
    const root = project(`from ce_numbers import register_number as r
r("diff", -1.234, kind="estimate", ci=(-2.5, 0.04), digits=1)
r("hr", 0.781, kind="estimate", ci=(0.664, 0.918))
`)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/a.md", "Difference -1.2 (95% CI, -2.5 to 0.0); HR 0.78 (95% CI, 0.66-0.92).\nThe reverse, 1.2 and −0.78, is wrong.\n")
    const result = check(root, "manuscript/a.md")
    expect(result.code).toBe(1)
    expect(result.out).not.toContain("manuscript/a.md:1:")
    expect(result.out).toContain("manuscript/a.md:2: untraced number: 1.2")
    expect(result.out).toContain("manuscript/a.md:2: untraced number: -0.78")
  })

  test("runs from a subdirectory against the project registry", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/ok.md", "N = {{num:cohort.n}}\n")
    const result = run(path.join(root, "manuscript"), ["python3", cli, "check", "ok.md"])
    expect(result.out).toContain("PASS")
  })

  test("a missing manuscript file fails closed without a traceback", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/ok.md", "N = {{num:cohort.n}}\n")
    const result = check(root, "manuscript/ok.md", "manuscript/gone.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/gone.md: unreadable file: missing")
    expect(result.err).not.toContain("Traceback")
  })
})

describe("numbers gate: inputs", () => {
  test("a directory expands to its manuscript and table files; unsupported types fail closed", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    write(root, "manuscript/a.md", "N = {{num:cohort.n}}\n")
    write(root, "manuscript/sub/b.qmd", "Untraced 3.14 here.\n")
    write(root, "manuscript/notes.txt", "ignored 9.99\n")
    const dir = check(root, "manuscript")
    expect(dir.code).toBe(1)
    expect(dir.out).toContain("manuscript/sub/b.qmd:1: untraced number: 3.14")
    expect(dir.out).not.toContain("9.99")

    write(root, "manuscript/paper.pdf", "%PDF-1.7")
    const pdf = check(root, "manuscript/a.md", "manuscript/paper.pdf")
    expect(pdf.code).toBe(1)
    expect(pdf.out).toContain("manuscript/paper.pdf: unsupported file type: .pdf")
  })
})

describe("numbers ids", () => {
  test("lists ids with kind and SAP output, never values or text", () => {
    const root = project(PRIMARY)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    const result = run(root, ["python3", cli, "ids"])
    expect(result.code).toBe(0)
    expect(result.out).toBe("cohort.n\tn\tSAP F1\nprimary.hr\testimate\tSAP T2\n")
  })
})

describe.skipIf(!hasR)("R register_number from a subdirectory", () => {
  test("records the script path relative to the project root", () => {
    const root = project("")
    write(root, "analysis/model.R", `source(${JSON.stringify(path.join(scriptsDir, "ce_numbers.R"))})\nregister_number("x", 1.5, kind = "estimate", sources = "data/synthetic.csv")\n`)
    const result = run(path.join(root, "analysis"), ["Rscript", "model.R"])
    expect(result.err).toBe("")
    expect(registry(root).entries["x"].script.path).toBe("analysis/model.R")
  })
})

describe("numbers gate: incomplete chains", () => {
  test("fails entries without sources, SAP output, or a script committed when it ran", () => {
    const root = project(`from ce_numbers import register_number as r
r("no.sources", 1.5, kind="estimate", sap_output="T2")
r("no.sap", 2.5, kind="estimate", sources=["data/synthetic.csv"])
`)
    write(root, "analysis/uncommitted.py", `import sys\nsys.path.insert(0, ${JSON.stringify(scriptsDir)})\nfrom ce_numbers import register_number as r\nr("dirty", 3.5, kind="estimate", sources=["data/synthetic.csv"], sap_output="T3")\n`)
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    expect(run(root, ["python3", "analysis/uncommitted.py"]).err).toBe("")
    git(root, "add", "-A")
    git(root, "commit", "-qm", "commit after the run")
    write(root, "manuscript/a.md", "{{num:no.sources}} {{num:no.sap}} {{num:dirty}}\n")
    const result = check(root, "manuscript/a.md")
    expect(result.code).toBe(1)
    expect(result.out).toContain("registry:no.sources: untraceable: no source files")
    expect(result.out).toContain("registry:no.sap: untraceable: no SAP output")
    expect(result.out).toContain("registry:dirty: untraceable: script analysis/uncommitted.py was not committed when it ran")
    expect(result.out).not.toContain("registry:no.sources: untraceable: script")
  })
})
