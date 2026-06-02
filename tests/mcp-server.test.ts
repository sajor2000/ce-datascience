import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")
const runPy = path.join(
  repoRoot,
  "plugins",
  "ce-datascience",
  "skills",
  "ce-mcp-server",
  "mcp_server",
  "run.py",
)
const pluginRoot = path.join(repoRoot, "plugins", "ce-datascience")

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function runPythonHarness(script: string, args: string[] = []): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ce-mcp-harness-"))
  const scriptPath = path.join(tempDir, "harness.py")
  await fs.writeFile(scriptPath, script)

  const proc = Bun.spawn(["python3", scriptPath, runPy, ...args], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  if (exitCode !== 0) {
    throw new Error(`python harness failed (exit ${exitCode}).\nstdout: ${stdout}\nstderr: ${stderr}`)
  }
  return stdout
}

describe("ce-datascience MCP server", () => {
  test("writes user artifacts under the resolved project root", async () => {
    const projectRoot = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "ce-mcp-project-")))
    await fs.mkdir(path.join(projectRoot, ".git"))
    await fs.mkdir(path.join(projectRoot, "data"))
    await fs.writeFile(path.join(projectRoot, "data", "extract.csv"), "id,value\n1,2\n")
    await fs.mkdir(path.join(projectRoot, "reports"))
    await fs.writeFile(path.join(projectRoot, "reports", "qa.md"), "Status**: `GO`\n")

    const script = String.raw`
import importlib.util
import json
import pathlib
import sys
import types

run_py = pathlib.Path(sys.argv[1])
project_root = pathlib.Path(sys.argv[2])

class FakeMCP:
    def __init__(self, *args, **kwargs):
        pass
    def tool(self, *args, **kwargs):
        def decorate(fn):
            return fn
        return decorate
    def run(self, *args, **kwargs):
        pass

class FakeYAML:
    preserve_quotes = False
    def load(self, stream):
        text = stream.read() if hasattr(stream, "read") else str(stream)
        return json.loads(text) if text.strip() else None
    def dump(self, data, stream):
        json.dump(data, stream, indent=2)

sys.modules["fastmcp"] = types.SimpleNamespace(FastMCP=FakeMCP)
sys.modules["ruamel"] = types.ModuleType("ruamel")
sys.modules["ruamel.yaml"] = types.SimpleNamespace(YAML=FakeYAML)

spec = importlib.util.spec_from_file_location("ce_mcp_run", run_py)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

write_result = module.stack_profile(
    action="write",
    language="python",
    reporting="jupyter",
    reporting_checklist="strobe",
    reporting_checklist_extensions=["record"],
    project_root=str(project_root),
)
read_result = module.stack_profile(action="read", project_root=str(project_root))
sap_result = module.sap_create(
    title="Temp root study",
    power_analysis="descriptive only: no inferential test",
    project_root=str(project_root),
)
wave_result = module.data_wave_register(
    extract_id="wave1",
    location="data/extract.csv",
    project_root=str(project_root),
)
lock_result = module.data_lock(
    extract_id="wave1",
    qa_report_path="reports/qa.md",
    locked_by="test",
    sap_version_at_lock="1.0",
    project_root=str(project_root),
)

print(json.dumps({
    "write_result": write_result,
    "read_result": read_result,
    "sap_result": sap_result,
    "wave_result": wave_result,
    "lock_result": lock_result,
    "resolved_root": str(module.resolve_project_root(str(project_root))),
}))
`

    const stdout = await runPythonHarness(script, [projectRoot])
    const result = JSON.parse(stdout) as Record<string, string>

    expect(result.resolved_root).toBe(projectRoot)
    expect(result.write_result).toContain(path.join(projectRoot, ".ce-datascience", "config.local.yaml"))
    expect(result.read_result).toContain("reporting_checklist: STROBE")
    expect(result.read_result).toContain("reporting_checklist_extensions: ['RECORD']")
    expect(result.sap_result).toContain(path.join(projectRoot, "analysis", "sap.md"))
    expect(result.wave_result).toContain("Registered wave 'wave1'")
    expect(result.lock_result).toContain("Locked wave 'wave1'")

    expect(await exists(path.join(projectRoot, ".ce-datascience", "config.local.yaml"))).toBe(true)
    expect(await exists(path.join(projectRoot, ".ce-datascience", "data-state.yaml"))).toBe(true)
    expect(await exists(path.join(projectRoot, "analysis", "sap.md"))).toBe(true)
    expect(await exists(path.join(pluginRoot, ".ce-datascience", "config.local.yaml"))).toBe(false)
    expect(await exists(path.join(pluginRoot, ".ce-datascience", "data-state.yaml"))).toBe(false)
    expect(await exists(path.join(pluginRoot, "analysis", "sap.md"))).toBe(false)
  })

  test("rejects invalid explicit project roots with actionable text", async () => {
    const missingRoot = path.join(os.tmpdir(), "ce-mcp-missing-project-root")
    const script = String.raw`
import importlib.util
import json
import pathlib
import sys
import types

run_py = pathlib.Path(sys.argv[1])
missing_root = pathlib.Path(sys.argv[2])

class FakeMCP:
    def __init__(self, *args, **kwargs):
        pass
    def tool(self, *args, **kwargs):
        def decorate(fn):
            return fn
        return decorate
    def run(self, *args, **kwargs):
        pass

sys.modules["fastmcp"] = types.SimpleNamespace(FastMCP=FakeMCP)

spec = importlib.util.spec_from_file_location("ce_mcp_run", run_py)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

print(json.dumps({
    "result": module.sap_create(power_analysis="descriptive only", project_root=str(missing_root))
}))
`

    const stdout = await runPythonHarness(script, [missingRoot])
    const result = JSON.parse(stdout) as { result: string }
    expect(result.result).toContain("does not exist")
    expect(result.result).toContain("CE_DATASCIENCE_PROJECT_ROOT")
  })

  test("writes a publication readiness report under the user project root", async () => {
    const projectRoot = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "ce-mcp-publication-")))
    await fs.mkdir(path.join(projectRoot, ".git"))
    await fs.mkdir(path.join(projectRoot, "analysis", "publication", "tables"), { recursive: true })
    await fs.mkdir(path.join(projectRoot, "analysis", "publication", "figures"), { recursive: true })
    await fs.mkdir(path.join(projectRoot, "analysis", "publication", "package"), { recursive: true })
    await fs.mkdir(path.join(projectRoot, "analysis", "signoff"), { recursive: true })
    await fs.writeFile(
      path.join(projectRoot, "analysis", "publication", "tables", "table1-spec.json"),
      JSON.stringify({ artifact_type: "table1", rows: [{ variable: "age" }] }),
    )
    await fs.writeFile(
      path.join(projectRoot, "analysis", "publication", "figures", "figure-manifest.json"),
      JSON.stringify({ figures: [{ figure_id: "fig1" }] }),
    )
    await fs.writeFile(
      path.join(projectRoot, "analysis", "publication", "package", "package-manifest.json"),
      JSON.stringify({ package_id: "pkg1", readiness: "ready-with-review" }),
    )
    await fs.writeFile(
      path.join(projectRoot, "analysis", "signoff", "signoff-ledger.json"),
      JSON.stringify({
        ledger_id: "ledger1",
        study_id: "study1",
        entries: [{
          entry_id: "e1",
          reviewer: "pi",
          artifact: "package",
          decision: "approved",
          timestamp: "2026-05-30T00:00:00",
        }],
      }),
    )

    const script = String.raw`
import importlib.util
import json
import pathlib
import sys
import types

run_py = pathlib.Path(sys.argv[1])
project_root = pathlib.Path(sys.argv[2])

class FakeMCP:
    def __init__(self, *args, **kwargs):
        pass
    def tool(self, *args, **kwargs):
        def decorate(fn):
            return fn
        return decorate
    def run(self, *args, **kwargs):
        pass

sys.modules["fastmcp"] = types.SimpleNamespace(FastMCP=FakeMCP)

spec = importlib.util.spec_from_file_location("ce_mcp_run", run_py)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

print(json.dumps({
    "result": module.publication_readiness_check(project_root=str(project_root))
}))
`

    const stdout = await runPythonHarness(script, [projectRoot])
    const result = JSON.parse(stdout) as { result: string }
    const reportPath = path.join(projectRoot, ".ce-datascience", "publication-readiness-report.md")
    const report = await fs.readFile(reportPath, "utf8")

    expect(result.result).toContain("__CE_PUBLICATION_READINESS__ result=READY-WITH-REVIEW")
    expect(report).toContain("Table 1 rows: 1")
    expect(report).toContain("Figures: 1")
    expect(report).toContain("Signoff entries: 1")
    expect(await exists(path.join(pluginRoot, ".ce-datascience", "publication-readiness-report.md"))).toBe(false)
  })
})
