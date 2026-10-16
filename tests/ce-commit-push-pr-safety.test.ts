import { describe, expect, test } from "bun:test"
import { spawnSync } from "child_process"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { readFile, readdir } from "fs/promises"
import os from "os"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins/ce-datascience/skills")

async function read(rel: string): Promise<string> {
  return readFile(path.join(skillsRoot, rel), "utf8")
}

async function skillTree(name: string): Promise<string[]> {
  const root = path.join(skillsRoot, name)
  const out: string[] = []
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.endsWith(".md")) out.push(await readFile(full, "utf8"))
    }
  }
  await walk(root)
  return out
}

const PR_CHECK =
  "gh pr list --head <branch> --state open --json number,url,title,state,headRefName,headRepositoryOwner"

describe("ce-commit and ce-commit-push-pr gather context at runtime", () => {
  for (const name of ["ce-commit", "ce-commit-push-pr"]) {
    test(`${name} has no load-time pre-resolution or fallback block`, async () => {
      const skill = await read(`${name}/SKILL.md`)
      // Load-time `!` commands abort skill load when git exits non-zero
      // (unborn repo, outside a repo). Upstream #1109.
      expect(skill).not.toMatch(/!`(git|gh) /)
      expect(skill).not.toContain("Context fallback")
      expect(skill).not.toContain("pre-populated")
      expect(skill).not.toMatch(/2>\/dev\/null \|\| echo/)
      expect(skill).toMatch(/own\*\* shell call/)
      expect(skill).toContain("| `git status` |")
      expect(skill).toContain("| `git rev-parse --abbrev-ref origin/HEAD` |")
      expect(skill).toMatch(/Non-zero exit \/ empty output means/)
      expect(skill).toMatch(/Unborn repo/)
      expect(skill).toMatch(/handles unborn repos/)
    })
  }

  test("ce-commit re-reads the branch right before committing", async () => {
    const skill = await read("ce-commit/SKILL.md")
    const reRead = skill.indexOf("Re-run `git branch --show-current` immediately before committing")
    const commit = skill.indexOf('scripts/commit-group.sh" <message-file>')
    expect(reRead).toBeGreaterThan(0)
    expect(reRead).toBeLessThan(commit)
  })

  test("ce-commit-push-pr re-reads the branch right before commit and push", async () => {
    const skill = await read("ce-commit-push-pr/SKILL.md")
    expect(skill).toMatch(/Run `git branch --show-current` immediately before committing/)
    const reRead = skill.indexOf("run `git branch --show-current` immediately before pushing")
    const push = skill.indexOf("git push -u origin HEAD")
    expect(reRead).toBeGreaterThan(0)
    expect(reRead).toBeLessThan(push)
  })

  test("both skills keep the data, PHI, and large-output staging check", async () => {
    for (const name of ["ce-commit", "ce-commit-push-pr"]) {
      const skill = await read(`${name}/SKILL.md`)
      expect(skill).toMatch(/PHI/)
      expect(skill).toMatch(/\.sas7bdat/)
      expect(skill).toMatch(/Never (use )?`git add -f`/)
      expect(skill).toMatch(/50 MB/)
    }
  })
})

describe("ce-commit-push-pr PR detection never treats unknown as none", () => {
  test("uses gh pr list with branch-only head and explicit exit semantics", async () => {
    const skill = await read("ce-commit-push-pr/SKILL.md")
    expect(skill).toContain(PR_CHECK)
    expect(skill).not.toMatch(/gh pr view --json url,title,state/)
    expect(skill).not.toContain("NO_OPEN_PR")
    expect(skill).toMatch(/Exit 0 with `\[\]`\*\* is the only result that means "no open PR"/)
    expect(skill).toMatch(/PR state is \*\*unknown\*\*, never "no PR"/)
    expect(skill).toMatch(/Never create a PR while state is unknown/)
    expect(skill).toMatch(/Never pass `<owner>:<branch>`/)
    expect(skill).toMatch(/Detached HEAD \(empty `<branch>`\):\*\* skip the check/)
    expect(skill).toMatch(/do not take index 0/)
  })

  test("re-checks PR presence immediately before gh pr create", async () => {
    const skill = await read("ce-commit-push-pr/SKILL.md")
    const step7 = skill.indexOf("### Step 7")
    const recheck = skill.indexOf("Immediately before creating, re-run the PR check")
    const create = skill.indexOf('gh pr create --title "<TITLE>"')
    expect(step7).toBeGreaterThan(0)
    expect(recheck).toBeGreaterThan(step7)
    expect(create).toBeGreaterThan(recheck)
    expect(skill.slice(recheck, create)).toMatch(/Non-zero exit:\*\* stop\. Do not create a PR/)
  })
})

describe("ce-commit-push-pr body file survives zsh noclobber", () => {
  test("appends to the mktemp'd body file instead of truncating", async () => {
    const files = await skillTree("ce-commit-push-pr")
    const combined = files.join("\n")
    expect(combined).toContain(`cat >> "$BODY_FILE" <<'__CE_PR_BODY_END__'`)
    expect(combined).not.toMatch(/cat > "\$BODY_FILE"/)
  })
})

describe("ce-commit-push-pr branch creation protects ignored data files", () => {
  test("uses --no-overwrite-ignore and stop-and-ask, never stash", async () => {
    const ref = await read("ce-commit-push-pr/references/branch-creation.md")
    expect(ref).toContain('git checkout --no-overwrite-ignore -b <branch-name> "$BASE_REF"')
    expect(ref).not.toMatch(/git stash/)
    expect(ref).not.toMatch(/stash pop/)
    expect(ref).toMatch(/Do not stash, delete, move, or overwrite the colliding paths/)
    expect(ref).toMatch(/PHI/)
    expect(ref).toMatch(/do not retry with a plain `git checkout`/)
  })

  test("--no-overwrite-ignore aborts instead of clobbering a gitignored data file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "ce-branch-ignore-"))
    const git = (...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@example.com", "-c", "user.name=t", ...args], {
        cwd: dir,
        encoding: "utf8",
      })
    try {
      expect(git("init", "-q", "-b", "main", ".").status).toBe(0)
      writeFileSync(path.join(dir, "README.md"), "base\n")
      git("add", "README.md")
      expect(git("commit", "-qm", "base").status).toBe(0)
      git("checkout", "-qb", "other")
      mkdirSync(path.join(dir, "data"))
      writeFileSync(path.join(dir, "data/raw.csv"), "tracked\n")
      git("add", "data/raw.csv")
      expect(git("commit", "-qm", "other").status).toBe(0)
      git("checkout", "-q", "main")
      writeFileSync(path.join(dir, ".gitignore"), "data/\n")
      mkdirSync(path.join(dir, "data"), { recursive: true })
      writeFileSync(path.join(dir, "data/raw.csv"), "synthetic-phi-stand-in\n")

      const result = git("checkout", "--no-overwrite-ignore", "-b", "feature", "other")
      expect(result.status).not.toBe(0)
      expect(readFileSync(path.join(dir, "data/raw.csv"), "utf8")).toBe("synthetic-phi-stand-in\n")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
