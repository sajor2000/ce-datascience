import { describe, expect, test } from "bun:test"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const script = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-sprint", "scripts", "sprint.py")

// JSON is valid YAML, so a JSON-backed stub stands in for PyYAML.
const YAML_STUB = `
import json
def safe_load(text): return json.loads(text) if text.strip() else None
def safe_dump(obj, **kw): return json.dumps(obj, indent=2, default=str)
`

async function run(cwd: string, stub: string, args: string[]) {
  const proc = Bun.spawn(["python3", script, ...args], {
    cwd,
    env: { ...process.env, PYTHONPATH: stub },
    stdout: "pipe",
    stderr: "pipe",
  })
  const code = await proc.exited
  return { code, stdout: await new Response(proc.stdout).text(), stderr: await new Response(proc.stderr).text() }
}

describe("ce-sprint signoff", () => {
  test("signs off only a closed_pending_signoff sprint, and only as the named reviewer", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "sprint-signoff-"))
    try {
      const stub = path.join(root, "stub")
      const project = path.join(root, "project")
      await mkdir(stub)
      await mkdir(path.join(project, "analysis"), { recursive: true })
      await writeFile(path.join(stub, "yaml.py"), YAML_STUB)
      const logFile = path.join(project, "analysis", "sprint-log.yaml")
      const write = (status: string) =>
        writeFile(logFile, JSON.stringify({ sprints: [{ name: "sprint-01", status, reviewer: "jcr", scope: ["SAP-5.1"] }] }))

      await write("pending_review")
      let r = await run(project, stub, ["signoff", "sprint-01", "--by", "jcr"])
      expect(r.code).toBe(1)
      expect(r.stderr).toContain("not closed_pending_signoff")

      await write("closed_pending_signoff")
      r = await run(project, stub, ["signoff", "sprint-01", "--by", "someone-else"])
      expect(r.code).toBe(1)
      expect(r.stderr).toContain("named reviewer")

      r = await run(project, stub, ["signoff", "sprint-01", "--by", "jcr"])
      expect(r.code).toBe(0)
      expect(r.stdout).toContain("__CE_SPRINT__ action=signoff name=sprint-01 reviewer=jcr status=signed_off")
      const sprint = JSON.parse(await readFile(logFile, "utf8")).sprints[0]
      expect(sprint.status).toBe("signed_off")
      expect(sprint.signed_off_by).toBe("jcr")
      expect(sprint.signed_off_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
