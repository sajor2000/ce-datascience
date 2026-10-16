import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const SCRIPTS = ["method-commit", "method-pr"].map((skill) =>
  path.join(process.cwd(), "plugins", "methodsmith", "skills", skill, "scripts", "commit-group.sh"),
)

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com",
  GIT_CONFIG_GLOBAL: "/dev/null",
}

async function sh(cwd: string, cmd: string[]) {
  const proc = Bun.spawn(cmd, { cwd, env: GIT_ENV, stdout: "pipe", stderr: "pipe" })
  const code = await proc.exited
  return { code, out: (await new Response(proc.stdout).text()).trim(), err: await new Response(proc.stderr).text() }
}

async function repo(withHead: boolean) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "commit-group-"))
  await sh(dir, ["git", "init", "-q", "-b", "main"])
  if (withHead) {
    await writeFile(path.join(dir, "base.txt"), "base\n")
    await sh(dir, ["git", "add", "base.txt"])
    await sh(dir, ["git", "commit", "-qm", "base"])
  }
  return dir
}

describe("commit-group.sh", () => {
  test("both skills ship an identical copy", async () => {
    expect(await readFile(SCRIPTS[0], "utf8")).toBe(await readFile(SCRIPTS[1], "utf8"))
  })

  test("commits only the named paths, keeps staged snapshots, and leaves other staged work alone", async () => {
    const dir = await repo(true)
    try {
      await writeFile(path.join(dir, "a.txt"), "a-staged\n")
      await sh(dir, ["git", "add", "a.txt"])
      await writeFile(path.join(dir, "a.txt"), "a-unstaged-edit\n")
      await writeFile(path.join(dir, "b.txt"), "b\n")
      await writeFile(path.join(dir, "other.txt"), "other\n")
      await sh(dir, ["git", "add", "other.txt"])
      const msg = path.join(os.tmpdir(), `msg-${Date.now()}.txt`)
      await writeFile(msg, "feat(x): add a and b\n\nbody with $HOME and `ticks`\n")

      const r = await sh(dir, ["bash", SCRIPTS[0], msg, "a.txt", "b.txt"])
      await rm(msg, { force: true })
      expect(r.code).toBe(0)

      expect((await sh(dir, ["git", "show", "--name-only", "--format=", "HEAD"])).out.split("\n").sort()).toEqual(["a.txt", "b.txt"])
      expect((await sh(dir, ["git", "show", "HEAD:a.txt"])).out).toBe("a-staged")
      expect((await sh(dir, ["git", "log", "-1", "--format=%B"])).out).toContain("body with $HOME and `ticks`")
      expect((await sh(dir, ["git", "diff", "--cached", "--name-only"])).out).toBe("other.txt")
      expect(await readFile(path.join(dir, "a.txt"), "utf8")).toBe("a-unstaged-edit\n")
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  test("works in an unborn repository and refuses a missing message file", async () => {
    const dir = await repo(false)
    try {
      await writeFile(path.join(dir, "first.txt"), "first\n")
      expect((await sh(dir, ["bash", SCRIPTS[1], path.join(dir, "missing.txt"), "first.txt"])).code).toBe(66)

      const msg = path.join(os.tmpdir(), `msg-unborn-${Date.now()}.txt`)
      await writeFile(msg, "chore: first commit\n")
      const r = await sh(dir, ["bash", SCRIPTS[1], msg, "first.txt"])
      await rm(msg, { force: true })
      expect(r.code).toBe(0)
      expect((await sh(dir, ["git", "show", "--name-only", "--format=", "HEAD"])).out).toBe("first.txt")
      expect((await sh(dir, ["git", "status", "--porcelain"])).out).toBe("")
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
