import { describe, expect, test } from "bun:test"
import path from "path"
import { STALE_AGENT_NAMES, STALE_SKILL_DIRS } from "../src/utils/legacy-cleanup"
import { EXTRA_LEGACY_ARTIFACTS_BY_PLUGIN } from "../src/data/plugin-legacy-artifacts"

const repoRoot = path.join(import.meta.dir, "..")

/**
 * AGENTS.md requires that a removed skill or agent be added to the cleanup
 * registries, so a stale flat-install artifact is swept on upgrade. Only the
 * reverse direction (a re-added component still listed as stale) was enforced,
 * which let a deletion ship without its registry entry and leave a permanent
 * orphan on every user's machine.
 *
 * This test walks git history for deleted components and requires each one to
 * be registered — unless it is explicitly exempted below.
 */

/**
 * Components deleted before they ever shipped in a tagged release. They cannot
 * exist in any user install, so no cleanup entry is warranted. Each entry
 * records the commit that removed it.
 */
const NEVER_RELEASED_EXEMPTIONS = new Set([
  // Removed in ad7e5aa6 (2026-04-28) while plugin.json was still at 0.1.0;
  // every release tag postdates that commit.
  "ce-freeze",
  "ce-pilot",
  "ce-revise",
  "ce-sap-amendment-reviewer",
])

function runGit(args: string[]): string {
  const proc = Bun.spawnSync(["git", ...args], { cwd: repoRoot, stdout: "pipe", stderr: "pipe" })
  if (proc.exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${new TextDecoder().decode(proc.stderr)}`)
  }
  return new TextDecoder().decode(proc.stdout)
}

function deletedPaths(pathspec: string): string[] {
  // --no-renames is load-bearing: git's default rename detection reclassifies a
  // deletion paired with a similar-content addition as a rename (R) and drops it
  // from --diff-filter=D. Persona agents and skills share enough boilerplate that
  // a same-directory rename reads as >50% similar, so the deletion of the old
  // name would be invisible here and its flat-install artifact would never be
  // required in the cleanup registries — the exact orphan this guard prevents.
  const out = runGit([
    "log",
    "--diff-filter=D",
    "--no-renames",
    "--name-only",
    "--pretty=format:",
    "--",
    pathspec,
  ])
  return [...new Set(out.split("\n").map((line) => line.trim()).filter(Boolean))]
}

/**
 * A basename still present as a live component was moved/re-added, not removed,
 * so it produces no stale flat-install artifact and needs no registry entry.
 * Without this, --no-renames surfaces every historical directory move (a skill
 * or agent whose file was recreated under the same name) as a phantom orphan.
 */
function componentStillExists(name: string): boolean {
  const skill = Bun.file(path.join(repoRoot, "plugins/ce-datascience/skills", name, "SKILL.md"))
  const agent = Bun.file(path.join(repoRoot, "plugins/ce-datascience/agents", `${name}.md`))
  return skill.size + agent.size > 0
}

function registeredNames(): Set<string> {
  const extras = EXTRA_LEGACY_ARTIFACTS_BY_PLUGIN["ce-datascience"] ?? {}
  return new Set([
    ...STALE_SKILL_DIRS,
    ...STALE_AGENT_NAMES,
    ...(extras.skills ?? []),
    ...(extras.agents ?? []),
    ...(extras.commands ?? []),
  ].map((name) => name.replace(/\.md$/, "")))
}

describe("cleanup registry coverage", () => {
  test("every deleted skill is registered for cleanup or exempted", () => {
    const registered = registeredNames()
    const missing = deletedPaths("plugins/ce-datascience/skills/*/SKILL.md")
      .map((p) => p.split("/").at(-2))
      .filter((name): name is string => Boolean(name))
      .filter(
        (name) =>
          !registered.has(name) &&
          !NEVER_RELEASED_EXEMPTIONS.has(name) &&
          !componentStillExists(name),
      )

    expect(missing).toEqual([])
  })

  test("every deleted agent is registered for cleanup or exempted", () => {
    const registered = registeredNames()
    const missing = deletedPaths("plugins/ce-datascience/agents/*.md")
      .map((p) => path.basename(p).replace(/\.agent\.md$|\.md$/, ""))
      .filter(Boolean)
      .filter(
        (name) =>
          !registered.has(name) &&
          !NEVER_RELEASED_EXEMPTIONS.has(name) &&
          !componentStillExists(name),
      )

    expect(missing).toEqual([])
  })

  test("exemptions name components that no longer exist", () => {
    // An exemption for a component that still ships would silently disable
    // coverage for it if it were later removed.
    for (const name of NEVER_RELEASED_EXEMPTIONS) {
      const skill = Bun.file(path.join(repoRoot, "plugins/ce-datascience/skills", name, "SKILL.md"))
      const agent = Bun.file(path.join(repoRoot, "plugins/ce-datascience/agents", `${name}.md`))
      expect(skill.size + agent.size).toBe(0)
    }
  })
})
