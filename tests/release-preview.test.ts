import { describe, expect, test } from "bun:test"
import { buildReleasePreview, bumpVersion, loadCurrentVersions } from "../src/release/components"

describe("release preview", () => {
  test("uses changed files to determine affected components and next versions", async () => {
    const versions = await loadCurrentVersions()
    const preview = await buildReleasePreview({
      title: "fix: adjust method-plan wording",
      files: ["plugins/methodsmith/skills/method-plan/SKILL.md"],
    })

    expect(preview.components).toHaveLength(1)
    expect(preview.components[0].component).toBe("methodsmith")
    expect(preview.components[0].inferredBump).toBe("patch")
    expect(preview.components[0].nextVersion).toBe(bumpVersion(versions["methodsmith"], "patch"))
  })

  test("supports per-component overrides", async () => {
    const versions = await loadCurrentVersions()
    const preview = await buildReleasePreview({
      title: "fix: update methodsmith prompts",
      files: ["plugins/methodsmith/README.md"],
      overrides: {
        "methodsmith": "minor",
      },
    })

    expect(preview.components).toHaveLength(1)
    expect(preview.components[0].component).toBe("methodsmith")
    expect(preview.components[0].inferredBump).toBe("patch")
    expect(preview.components[0].effectiveBump).toBe("minor")
    expect(preview.components[0].nextVersion).toBe(bumpVersion(versions["methodsmith"], "minor"))
  })

  test("docs-only changes remain non-releasable by default", async () => {
    const preview = await buildReleasePreview({
      title: "docs: update release planning notes",
      files: ["docs/plans/2026-03-17-001-feat-release-automation-migration-beta-plan.md"],
    })

    expect(preview.components).toHaveLength(0)
  })
})
