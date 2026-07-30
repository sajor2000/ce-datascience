import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const tempRoots: string[] = []
const scriptPath = path.join(
  process.cwd(),
  "plugins",
  "ce-datascience",
  "skills",
  "ce-notebook-edit",
  "scripts",
  "notebook_edit.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

async function makeProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "notebook-edit-"))
  tempRoots.push(root)
  await mkdir(path.join(root, "analysis", "notebook-edits"), { recursive: true })
  await writeFile(
    path.join(root, "analysis", "notebook.ipynb"),
    JSON.stringify({
      cells: [
        {
          cell_type: "markdown",
          metadata: { tags: ["sap-5-1"] },
          source: "# Primary analysis\n",
        },
      ],
      metadata: {
        kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
        language_info: { name: "python", version: "3.11" },
      },
      nbformat: 4,
      nbformat_minor: 5,
    }, null, 1),
  )
  await writeFile(path.join(root, "analysis", "notebook-edits", "new-cell.py"), "print('sensitivity')\n")
  await writeFile(
    path.join(root, "analysis", "notebook-edits", "new-cell.md"),
    "## Sensitivity analysis\n\nUses the reviewed cohort and reports the requested sensitivity result.\n",
  )
  return root
}

describe("notebook edit workflow", () => {
  test("inserts a code cell after a unique tagged notebook cell", async () => {
    const root = await makeProject()
    const notebookPath = path.join(root, "analysis", "notebook.ipynb")
    const original = JSON.parse(await readFile(notebookPath, "utf8"))
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--notebook",
      "analysis/notebook.ipynb",
      "--tag",
      "sap-5-1",
      "--markdown-source",
      "analysis/notebook-edits/new-cell.md",
      "--source",
      "analysis/notebook-edits/new-cell.py",
      "--cell-type",
      "code",
      "--new-tag",
      "sap-5-1-sensitivity",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const notebook = JSON.parse(await readFile(notebookPath, "utf8"))
    const backup = await readFile(path.join(root, "analysis", "notebook.ipynb.bak"), "utf8")
    const report = await readFile(path.join(root, "analysis", "notebook.edit-report.md"), "utf8")

    expect(notebook.cells).toHaveLength(3)
    expect(notebook.cells[1].cell_type).toBe("markdown")
    expect(notebook.cells[1].source).toContain("Sensitivity analysis")
    expect(notebook.cells[1].metadata.tags).toEqual(["sap-5-1-sensitivity-documentation"])
    expect(notebook.cells[2].source).toBe("print('sensitivity')\n")
    expect(notebook.cells[2].metadata.tags).toEqual(["sap-5-1-sensitivity"])
    expect(notebook.metadata).toEqual(original.metadata)
    expect(notebook.cells[0]).toEqual(original.cells[0])
    expect(backup).toContain("# Primary analysis")
    expect(report).toContain("Result: EDITED-WITH-REVIEW")
  })

  test("requires explanatory Markdown for inserted code cells", async () => {
    const root = await makeProject()
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--notebook",
      "analysis/notebook.ipynb",
      "--tag",
      "sap-5-1",
      "--source",
      "analysis/notebook-edits/new-cell.py",
      "--cell-type",
      "code",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(2)
    expect(await new Response(proc.stderr).text()).toContain("--markdown-source is required")
  })

  test("refuses ambiguous anchor tags before writing a backup", async () => {
    const root = await makeProject()
    const notebookPath = path.join(root, "analysis", "notebook.ipynb")
    const notebook = JSON.parse(await readFile(notebookPath, "utf8"))
    notebook.cells.push({
      cell_type: "markdown",
      metadata: { tags: ["sap-5-1"] },
      source: "## Duplicate anchor\n",
    })
    await writeFile(notebookPath, JSON.stringify(notebook, null, 1))

    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--notebook",
      "analysis/notebook.ipynb",
      "--tag",
      "sap-5-1",
      "--markdown-source",
      "analysis/notebook-edits/new-cell.md",
      "--source",
      "analysis/notebook-edits/new-cell.py",
    ], { stdout: "pipe", stderr: "pipe" })
    const [exitCode, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stderr).text(),
      new Response(proc.stdout).text(),
    ]).then(([code, err]) => [code, err] as const)

    expect(exitCode).toBe(1)
    expect(stderr).toContain("matched 2 cells")
    await expect(Bun.file(path.join(root, "analysis", "notebook.ipynb.bak")).exists()).resolves.toBe(false)
  })
})
