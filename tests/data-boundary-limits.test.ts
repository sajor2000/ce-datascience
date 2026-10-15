import { describe, expect, test } from "bun:test"
import { mkdirSync, writeFileSync } from "fs"
import path from "path"
import { SCHEMA_ONLY, bash, expectAll, project } from "./data-boundary-harness"

function withFile(root: string, rel: string, content: string) {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
  writeFileSync(path.join(root, rel), content)
  return root
}

// Aggregate table: no identifier headers, no counts from 1 to 10.
export const AGGREGATE_CSV = "group,n,percent\nexposed,120,40.0\nunexposed,180,60.0\nmissing,0,0.0\n"

describe("limit 1a: agent-written scripts that read data (schema-only)", () => {
  test("running a script file that reads a data file is denied", () => {
    const root = withFile(project(SCHEMA_ONLY), "analysis/peek.py", "import pandas as pd\nprint(pd.read_csv('data/cohort.csv').head())\n")
    expectAll(root, "deny", [["Bash", bash("python3 analysis/peek.py")]])
  })

  test("a read call on a variable path counts as reading data, in Python and R", () => {
    const root = project(SCHEMA_ONLY)
    withFile(root, "analysis/argv.py", "import sys, pandas as pd\ndf = pd.read_csv(sys.argv[1])\nprint(df)\n")
    withFile(root, "analysis/argv.R", "args <- commandArgs(TRUE)\nd <- data.table::fread(args[1])\nprint(d)\n")
    withFile(root, "analysis/rds.R", "x <- readRDS(path)\nprint(x)\n")
    expectAll(root, "deny", [
      ["Bash", bash("python3 analysis/argv.py somewhere/x")],
      ["Bash", bash("Rscript analysis/argv.R somewhere/x")],
      ["Bash", bash("Rscript analysis/rds.R")],
    ])
  })

  test("a script that only plots from an aggregate CSV runs without the safe runner", () => {
    const root = project(SCHEMA_ONLY)
    withFile(root, "output/table1.csv", AGGREGATE_CSV)
    withFile(root, "analysis/plot.py",
      "import pandas as pd, matplotlib.pyplot as plt\nt = pd.read_csv('output/table1.csv')\nt.plot.bar(x='group')\nplt.savefig('output/fig1.png')\n")
    withFile(root, "analysis/hello.R", "x <- c(1, 2, 3)\nprint(mean(x))\n")
    expectAll(root, "allow", [["Bash", bash("python3 analysis/plot.py")], ["Bash", bash("Rscript analysis/hello.R")]])
  })
})
