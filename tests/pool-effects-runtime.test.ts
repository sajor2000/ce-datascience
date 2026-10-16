import { describe, expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

// Runs pool_effects.R on synthetic rows when Rscript and the meta package are
// available locally; CI has no R, so r-script-guards.test.ts pins the same fixes.
const script = path.join(process.cwd(), "plugins", "methodsmith", "skills", "method-meta-analysis", "scripts", "pool_effects.R")
const hasR =
  spawnSync("Rscript", ["-e", "quit(status = !(requireNamespace('meta', quietly = TRUE) && requireNamespace('ggplot2', quietly = TRUE)))"]).status === 0

const header = "pmid,year,first_author,sample_size,metric,effect,effect_lo,effect_hi,study_type"

function run(rows: string[]) {
  const dir = mkdtempSync(path.join(tmpdir(), "pool-effects-"))
  const input = path.join(dir, "in.csv")
  const out = path.join(dir, "out.md")
  writeFileSync(input, [header, ...rows].join("\n") + "\n")
  const proc = spawnSync("Rscript", [script, "--in", input, "--metric", "HR", "--out", out], { encoding: "utf8" })
  return { stdout: proc.stdout, md: readFileSync(out, "utf8") }
}

describe.skipIf(!hasR)("pool_effects.R on synthetic rows", () => {
  test("keeps studies with a missing sample size when no size filter is set", () => {
    const { stdout } = run([
      "1001,2020,A,,HR,0.80,0.65,0.98,RCT",
      "1002,2021,B,400,HR,0.75,0.60,0.94,RCT",
      "1003,2022,C,500,HR,0.85,0.70,1.03,RCT",
    ])
    expect(stdout).toContain("3 studies enter pooling")
  })

  test("does not anchor on a non-randomized study as if it were an RCT", () => {
    const { md } = run([
      "2001,2023,A,5000,HR,0.70,0.60,0.82,non-randomized cohort",
      "2002,2019,B,300,HR,0.85,0.70,1.03,randomized controlled trial",
    ])
    expect(md).toContain("Anchor study: PMID 2002")
  })
})
