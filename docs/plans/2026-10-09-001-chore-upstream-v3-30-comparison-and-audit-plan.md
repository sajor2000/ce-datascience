---
title: "chore: Compare with upstream CE v3.30.4 and plan a code audit"
type: chore
status: active
date: 2026-10-09
---

# chore: Compare with upstream CE v3.30.4 and plan a code audit

## Summary

This plan compares `ce-datascience` (plugin and CLI at 3.7.0) with upstream
[EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
at `compound-engineering-v3.30.4` (HEAD `67035e9`, 2026-10-09). It records the
CLI fixes ported in the same PR and lays out a phased audit. The audit covers
the converter CLI, shared workflow skills, repository guardrails, and the
data-science-specific surface that upstream does not have.

Last broad sync: upstream `v3.9.3` (May 2026). Since then there have been two
curated refreshes: 2026-07-31 (`ce-handoff`, `ce-babysit-pr`, `ce-retune`) and
2026-09-05 (the 3.24 safeguards, PR #57). Upstream has landed about 617
commits since `v3.9.3`, about 470 of them `feat`/`fix`.

---

## Comparison Snapshot

| Dimension | ce-datascience | Upstream v3.30.4 |
|---|---|---|
| Layout | `plugins/ce-datascience/` with a marketplace catalog | Plugin at the repo root (`plugin.json`, `skills/`), #967 |
| Skills / agents | 79 skills, 55 agents | 37 skills, 0 agents (personas live in `skills/*/references/`) |
| Shared skills | 18: babysit-pr, brainstorm, code-review, commit, commit-push-pr, compound, compound-refresh, debug, doc-review, handoff, ideate, optimize, plan, resolve-pr-feedback, retune, setup, work, worktree | Same 18, mostly slimmed to thin SKILL.md routers plus `references/` and `scripts/` |
| Converter targets | codex, opencode, pi, copilot, droid, gemini, kiro | codex, opencode, pi, copilot, droid, antigravity, plus host-native installs (14 hosts); gemini and kiro were removed |
| Cross-model peers | None | acpx transport and peer job runner in review, plan, work, setup |
| Compound Packs | None | `packs-resolve.py` and setup pack assets |
| Eval surface | `evals/` digest-pinned cases and scorer | `tests/skill-eval-cell/` harness |
| Repo guardrails | Frontmatter, portability, value-contract and legacy-registry tests; branch-maintenance workflow | Plus a skill-conventions linter, Codex prompt-budget ratchet, line-ending guard, scratch-root contract, test watchdog, CI timeouts, `plugin validate --strict`, CODING_STANDARDS files |
| Governance docs | README, AGENTS | Plus SECURITY, CONTRIBUTING, PRIVACY, CODING_STANDARDS |

The fork is ahead of upstream in these places:

- CI concurrency and frozen-lockfile installs.
- The legacy-registry coverage test.
- Evals with digest-pinned inputs.
- Weekly branch maintenance.
- The whole health data science surface: SAP, reporting checklists, PHI review, R/targets, CLIF, Fabric, and manuscript workflows.

---

## Ported In This PR

All of these are mechanical, are exercised by `bun test`, and keep the fork's
own guards.

| Upstream | Change | Fork files |
|---|---|---|
| 47f784eb (#1215) | Quote string scalars that YAML would read as another type (`"true"`, `"null"`, `"123"`, dates) so frontmatter keeps its types on round-trip | `src/utils/frontmatter.ts`, `tests/frontmatter.test.ts` |
| b2753126 (#1055) | Expand `~/` on Windows as well as `~\` | `src/utils/resolve-home.ts`, `tests/resolve-home.test.ts` |
| a60bd828 (#1176) | Droid tool inference matches whole words (prose like "already" no longer grants Read) and keys on `askuserquestion` | `src/converters/claude-to-droid.ts`, `tests/droid-converter.test.ts` |
| 6158fc0c (#1254) | The Codex content transform leaves `http(s)://` URLs and email-like `@` text alone | `src/utils/codex-content.ts`, `tests/codex-content.test.ts` |
| ea2b65c5 (#1227) | One reserved-path allowlist (`isReservedPathRoot`) replaces four copies | `src/utils/slash-command.ts`, the copilot/droid/pi converters, `codex-content.ts`, `tests/slash-command.test.ts` |
| b498e7a8, 82b7a975, 5e3aee1a | `sonnet` resolves to `claude-sonnet-5-5` and `opus` to `claude-opus-5-5`. OpenCode primary agents on models that reject sampling parameters no longer get an inferred `temperature`, which caused HTTP 400 | `src/utils/model.ts`, `src/converters/claude-to-opencode.ts`, `tests/model-utils.test.ts`, `tests/converter.test.ts` |
| abc75c73 (#1407) | `ce-setup` health check no longer uses here-strings, which need a writable temp dir and fail in read-only sandboxes | `skills/ce-setup/scripts/check-health`, `tests/ce-setup-check-health.test.ts` |

Fork-specific adaptation: the Codex `.claude/` to `.codex/` rewrite still runs
through `rewriteClaudePathsPerLine` on whole lines. Lines that enumerate
platforms ("Claude Code: `~/.claude/...`") are therefore still protected when
a URL splits the line. A dedicated test covers this.

---

## Audit Plan

Each phase is meant to land as its own PR. Behavioral changes to skills
follow AGENTS.md: validate with `skill-creator`, then run any affected
`evals/` case twice in fresh contexts.

### Phase 1: Shared-skill reliability ports (high priority, small)

These are concrete bugs that upstream later fixed and that are still present
in the fork's copies.

1. **Load-time `!` pre-resolution aborts skills** (upstream #1109).
   - `ce-commit/SKILL.md` and `ce-commit-push-pr/SKILL.md` run `git diff HEAD`, `git log` and `git status`, which exit non-zero in an unborn repo or outside one. Claude Code then refuses to load the skill.
   - `ce-compound/SKILL.md` has the same problem with its repo-name and branch lines.
   - Fix: replace with runtime single-command context gathering, where each non-zero exit has a stated meaning.
2. **PR detection treats gh failures as "no PR"** (`ce-commit-push-pr`). Switch to `gh pr list --head <branch> --state open --json ...`. An exit-0 `[]` means no PR; a non-zero exit means unknown. Re-check just before `gh pr create`.
3. **The frontmatter validator is silently skipped** (#935/#947/#1255).
   - `ce-compound` and `ce-compound-refresh` call `python3 scripts/validate-frontmatter.py` relative to the project root, not the skill directory.
   - Fix: anchor on `SKILL_DIR`, probe for `python3`/`python`/`py`, and fall back to a manual checklist.
   - Also correct the AGENTS.md "relative paths resolve from the skill directory" claim for *executed* scripts.
4. **PR replies vanish into pending reviews** (`ce-resolve-pr-feedback`).
   - Reply over REST with `pending_review` detection (#1196/#1491) and multiline bodies via quoted heredoc (#1199).
   - Use temp-file GraphQL pagination instead of `--argjson` (#1244, ARG_MAX on large PRs).
   - Stop dropping the PR author's own comments (#1467).
5. **One-liners:**
   - `cat >>` for mktemp'd PR bodies under zsh noclobber (#1008).
   - `git checkout --no-overwrite-ignore -b`, with stop-and-ask in place of stash/pop (#1647). This protects gitignored data files.
6. **`ce-optimize` script anchoring** (#1009) and the Python probe in `parallel-probe.sh` and `measure.sh` (#1255).

### Phase 2: Repository guardrails (adopt from upstream infra)

1. **Review standards.**
   - Add `CODING_STANDARDS.md` at the root, under `plugins/ce-datascience/skills/`, and under `tests/`.
   - `ce-code-review` and `ce-project-standards-reviewer` already look for these files and currently find none.
   - Adapt upstream's rubric and add data-science rules: PHI handling, the SAP-before-modeling gate, and a small-cell suppression floor.
2. **Skill-conventions linter.**
   - Port upstream `tests/skill-conventions.test.ts` (#930): skill-local paths must exist, platform variables need fallbacks, name and description limits, no host-specific tool names.
   - Fix what it flags.
3. **Codex prompt budget.** Add a ratchet test at 8000 bytes. 25 of 79 fork SKILL.md files are over budget today; the list may only shrink.
4. **Real-plugin conversion smoke test.** Convert `plugins/ce-datascience` to every target and assert skill and agent counts.
5. **Tighter `!` pre-resolution checks** (upstream `skill-shell-safety.test.ts`). This catches the Phase 1 class of bug in new skills.
6. **Scratch-root contract.**
   - Decide whether to move from shared `/tmp/ce-datascience/` to per-user `/tmp/ce-datascience-$(id -u)` with umask 077 (#1177/#1398).
   - Recommended for shared HPC and multi-user hosts, where review artifacts may hold sensitive data.
   - Update the AGENTS.md convention in the same change.
7. **CI hardening:**
   - `timeout-minutes` on jobs.
   - `claude plugin validate --strict`.
   - `.gitattributes` plus a line-ending test for bundled `.sh`/`.py` files.
   - A test watchdog for bun timeout flakes, optional.
8. **Governance.** Add `SECURITY.md` and `PRIVACY.md`, which are important for a PHI-adjacent plugin, plus `CONTRIBUTING.md`.

### Phase 3: CLI hardening (moderate)

1. **Symlink safety** (upstream bfa9dd49, 406ead1d, a2318092). Keep user-managed symlinks, and refuse writes through symlinked parent folders in the pi, codex and opencode writers and in cleanup. This lands as one PR with tests.
2. **OpenCode slash commands per skill** (46352ac9). The fork ships no `commands/`, so OpenCode users currently cannot run `/ce-*`.
3. **The Codex AGENTS.md tool map** (ca474429). Decide whether install should keep writing the legacy map into `~/.codex/AGENTS.md`. This changes user files and needs a migration note.
4. **Release classification** (ded28b0c). Decide whether `refactor:` should still imply a patch bump.

### Phase 4: Fork-specific audit (no upstream equivalent)

This is the part of the plugin upstream cannot audit for us.

1. **Inventory and overlap.** Review 79 skills and 55 agents for overlap, for example:
   - `ce-r-*` (8 skills) against `ce-rstats`.
   - `ce-fabric-*` (6).
   - `ce-scientific-anti-slop` against `ce-clinical-research-voice`.
   - The three security reviewers (`ce-security-reviewer`, `ce-security-lens-reviewer`, `ce-security-sentinel`).

   Merge or retire overlaps, and register removals in both legacy-cleanup registries.
2. **Single-use agents.** 27 agents are used by only one skill. Move them into that skill's `references/personas/` as upstream did. Keep the shared safety and statistics reviewers (`ce-phi-leak-reviewer`, `ce-reporting-checklist-reviewer`, `ce-methods-reviewer` and others) as standalone agents, and add byte-parity tests before duplicating any persona.
3. **Safety invariants.** Assert in tests that every data-touching skill keeps:
   - data QA before SAP or modeling;
   - human checkpoints before inferential analysis;
   - PHI and small-cell gates (CLIF `output/final_no_phi/`, n < 10 suppression).
4. **Stale references.**
   - Gate or remove references to skills the fork does not ship: `ce-proof`, `ce-demo-reel`, `slfg`, `lfg`, `ce-frontend-design`, `ce-agent-native-architecture`.
   - Update `tests/upstream-ce-curation.test.ts` for current upstream names: `ce-dogfood` (was `ce-dogfood-beta`), `ce-bakeoff`, `ce-explain`, `ce-noslop`, `ce-pov`, `ce-prototype`, `ce-sweep`, `wtf`.
5. **Long-skill quality.** Re-run the 2026-06-06 skill QA method on the largest skills (`ce-code-review` 1012 lines, `ce-optimize` 682, `ce-plan` 576). Split them into `references/` where that helps Codex budgets and readability.

### Phase 5: Candidate new skills (product decision required)

| Upstream skill | Verdict | Notes |
|---|---|---|
| `ce-explain` | Adopt | Evidence-backed "why is it like this" for pipelines, SAP choices and code |
| `wtf` | Adopt | Plain-language re-explanation for PIs and clinical collaborators |
| `ce-simplify-code` | Adapt | Add R/tidyverse/Quarto/targets cues and a "numerical results unchanged" check |
| `ce-pov` | Adapt, single-model only | Method and package choices; keep the multi-model panel deferred |
| `ce-bakeoff` | Adapt, low priority | Compare competing analysis strategies or estimands |
| `ce-noslop` | Mine only | Fold its patterns into `ce-scientific-anti-slop` |
| Others | Skip | Product, browser, iOS, Slack, Proof (PHI risk) and autonomous LFG |

### Deferred (plan only, no port)

- Moving the plugin to the repo root, and making it skills-only wholesale. This would break marketplace paths, gemini and kiro, and direct reviewer invocation.
- Cross-model acpx peers, Compound Packs, the upstream babysit watcher, ce-work unit workspaces, and plan/brainstorm unification. These have high churn and are software-product oriented. Revisit once Phases 1 and 2 have landed.

---

## Validation

- `bun test` (1247 pass after the CLI port commit), `bun run typecheck`, and `bun run release:validate`.
- For each Phase 1 skill port, the `skill-creator` eval workflow, plus `bun run eval:validate` and two fresh-context runs per affected case.
- Re-run this comparison at each future sync: diff `src/` and `skills/` against the latest upstream tag, and update `docs/solutions/workflow/upstream-ce-feature-curation.md`.
