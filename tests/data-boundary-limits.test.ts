import { describe, expect, test } from "bun:test"
import { mkdirSync, writeFileSync } from "fs"
import path from "path"
import { SCHEMA_ONLY, bash, expectAll, project } from "./data-boundary-harness"

function withFile(root: string, rel: string, content: string) {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
  writeFileSync(path.join(root, rel), content)
  return root
}

describe("limit 1a: agent-written scripts that read data (schema-only)", () => {
  test("running a script file that reads a data file is denied", () => {
    const root = withFile(project(SCHEMA_ONLY), "analysis/peek.py", "import pandas as pd\nprint(pd.read_csv('data/cohort.csv').head())\n")
    expectAll(root, "deny", [["Bash", bash("python3 analysis/peek.py")]])
  })
})
