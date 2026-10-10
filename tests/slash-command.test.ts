import { describe, expect, test } from "bun:test"
import { SLASH_COMMAND_PATH_ALLOWLIST, isReservedPathRoot } from "../src/utils/slash-command"
import { transformContentForCopilot } from "../src/converters/claude-to-copilot"
import { transformContentForDroid } from "../src/converters/claude-to-droid"
import { transformContentForPi } from "../src/converters/claude-to-pi"
import { transformContentForCodex } from "../src/utils/codex-content"

describe("isReservedPathRoot", () => {
  test("matches every reserved single-segment path root", () => {
    for (const root of SLASH_COMMAND_PATH_ALLOWLIST) {
      expect(isReservedPathRoot(root)).toBe(true)
    }
  })

  test("does not match real command names", () => {
    expect(isReservedPathRoot("plan")).toBe(false)
    expect(isReservedPathRoot("workflows:plan")).toBe(false)
    expect(isReservedPathRoot("etcetera")).toBe(false)
  })
})

describe("converters share the reserved path guard", () => {
  const transforms = {
    copilot: transformContentForCopilot,
    droid: transformContentForDroid,
    pi: transformContentForPi,
    codex: (body: string) => transformContentForCodex(body),
  }

  for (const [target, transform] of Object.entries(transforms)) {
    test(`${target} leaves filesystem roots untouched`, () => {
      for (const root of SLASH_COMMAND_PATH_ALLOWLIST) {
        expect(transform(`Check /${root} first.`)).toBe(`Check /${root} first.`)
      }
    })
  }
})
