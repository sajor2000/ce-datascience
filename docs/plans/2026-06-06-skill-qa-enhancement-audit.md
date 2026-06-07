# Skill QA Enhancement Audit

Date: 2026-06-06

## Verdict

The 48 `ce-datascience` skills are structurally valid and portable enough to pass the current frontmatter, release, and portability checks. The next reliability risk is workflow quality: several high-value skills are too long, repeat platform-specific question-tool mechanics, or ask broad survey questions instead of using repo/data signals to narrow the path first.

## External Contracts Checked

- Claude Code plugins require plugin skills to be namespaced, for example `/my-plugin:hello`; the plugin manifest `name` is the namespace.
- Claude Code skills live as `skills/<name>/SKILL.md`, can include supporting files, and plugin skills cannot conflict with personal/project skills because they are namespace-prefixed.
- Claude Code plugin paths must remain relative to the plugin root in manifests; bundled runtime references should avoid hardcoded user/cache/source paths.
- Codex skills are process playbooks; Codex plugin skills should be packaged with clear metadata and declare dependencies when they need MCP or external tools.
- Codex enterprise users may need admin-approved apps; plugin skills must not imply that the plugin grants data access by itself.

Sources:

- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/skills
- https://openai.com/academy/codex-plugins-and-skills/
- https://help.openai.com/id-id/articles/20001256-plugins-in-codex

## Audit Method

- Counted all `plugins/ce-datascience/skills/*/SKILL.md` files: 48.
- Checked frontmatter and metadata through the repo tests.
- Checked self-contained references and cache/source path rules through portability tests.
- Scripted a risk scan for line count, question sites, platform-specific question-tool prose, Claude-specific variables, shell/package install guidance, and helper invocation wording.
- Manually inspected the highest-risk workflows: `ce-setup`, `ce-workflow`, `ce-brainstorm`, `ce-code-review`, and `ce-update`.

## Current Validation

Passed:

- `bun test tests/frontmatter.test.ts tests/plugin-content-portability.test.ts`
- `bun run release:validate`

## Cross-Cutting Findings

### P1: Question mechanics are duplicated across skills

Many skills repeat the same paragraph about `AskUserQuestion`, `ToolSearch`, `request_user_input`, `ask_user`, and numbered-list fallback. This makes skills longer and raises drift risk when Claude or Codex question behavior changes.

Fix:

- Create one co-located question contract reference for every interactive skill, or a short standard block that says "Use the repo question contract."
- Add a portability test that interactive skills either import the standard wording or do not mention platform question tools at all.
- Keep each skill focused on what to ask, not how every platform asks.

### P1: The longest skills need progressive disclosure

`ce-code-review`, `ce-optimize`, `ce-setup`, `ce-plan`, `ce-compound-refresh`, `ce-compound`, and `ce-work` are large enough that the model can miss buried instructions. They should keep only routing, top-level invariants, and happy-path steps in `SKILL.md`; rare branches should move to `references/`.

Fix:

- Move optional branches, mode-specific details, examples, and fallback procedures into references.
- Add a test that warns when `SKILL.md` exceeds a chosen line budget unless allowlisted.

### P1: Setup and lifecycle questions should narrow from evidence first

`ce-setup` is now branch-correct for Marimo/Jupyter/RStudio, but it still reads like a survey. For real users, the first pass should use signals: existing config, IDE files, notebooks, lockfiles, database handoff, CLIF/OMOP signals, and requested output type. Questions should ask only for unresolved choices.

Fix:

- Add a "minimum viable setup" mode that asks 3 questions max unless the user requests detailed survey mode.
- Use `ce-workflow` as the navigator after setup so users see the next slash command rather than a long configuration output.

### P2: Descriptions are too long for several skills

Long descriptions improve recall but hurt discoverability. Many frontmatter descriptions approach mini-spec length: `ce-data-qa`, `ce-cohort-build`, `ce-pubmed`, `ce-power`, `ce-sprint`, `ce-sap-tabular`, `ce-plan`, and others.

Fix:

- Convert descriptions to: purpose, top trigger phrases, and one key routing boundary.
- Move detailed trigger examples into `SKILL.md` body or references.

### P2: Platform-specific skills need clearer public fallback

`ce-update` is correctly `ce_platforms: [claude]`, but user-facing setup should also surface the Codex equivalent: local plugin update/reinstall or offline package refresh. `ce-report-bug`, `ce-compound`, `ce-sessions`, and `ce-work` mention Claude paths or behavior and need stronger Codex/Claude separation.

Fix:

- Add "Claude native", "Codex native", and "local alias" notes only where the skill needs platform-specific behavior.
- Prefer generic terms in workflow skills: "plugin install root", "skill scratch path", "session history source."

## Per-Skill Enhancement Matrix

| Skill | Status | Enhancement |
|---|---|---|
| ce-bioinfo-qc | Keep | Shorten frontmatter; add input/output artifact contract. |
| ce-brainstorm | Overhaul | Split rigor probes and rendering modes into references; keep one-question-at-a-time contract. |
| ce-checklist-match | Improve | Use guideline registry as source of truth; shorten checklist inventory in description. |
| ce-clean-gone-branches | Improve | Replace duplicated question-tool prose with shared question contract. |
| ce-clif | Improve | Add current CLIF/clifpy package evidence refresh cadence; keep latest-package guidance. |
| ce-code-review | Overhaul | Move mode details, routing, and fixer queue semantics into references; keep top-level flow short. |
| ce-cohort-build | Improve | Make Q/A sequence explicit: population, index, inclusion/exclusion, follow-up, vocabulary. |
| ce-commit | Improve | Replace duplicated question-tool prose with shared question contract. |
| ce-commit-push-pr | Improve | Shorten frontmatter; keep PR body writing reference as the main detail surface. |
| ce-compound | Overhaul | Separate lightweight/full modes and memory/session handling into references. |
| ce-compound-refresh | Overhaul | Progressive disclosure for action policies; add compact interactive/autofix matrix. |
| ce-data-qa | Keep | Add examples for pre-SAP column QA vs GO/NO-GO QA. |
| ce-debug | Improve | Keep systematic flow; move tracker-specific fetch guidance into reference. |
| ce-doc-review | Improve | Clarify biomedical document review vs code/documentation review routing. |
| ce-effect-size | Improve | Add concise required inputs and output artifact examples. |
| ce-figure | Keep | Add visual inspection checklist link for JAMA-style figure QA. |
| ce-genome-build | Keep | Add current reference genome/source refresh note. |
| ce-ideate | Overhaul | Split grounding modes from ideation output rules; reduce setup questions. |
| ce-language-detect | Keep | Add tests ensuring `ce-setup` uses it only as evidence, not final preference. |
| ce-literature-search | Improve | Clarify PubMed vs Paperclip vs web research routing. |
| ce-manuscript-package | Keep | Add package manifest example and missing-artifact refusal text. |
| ce-mcp-server | Improve | Separate Claude/Codex/Gemini setup snippets; keep runtime paths explicit and generated. |
| ce-method-extract | Improve | Add Paperclip/full-text optional lane for methods not in abstracts. |
| ce-ml-experiment-track | Improve | Replace bare `python` wording with `python3`; add minimal MLflow/W&B optionality language. |
| ce-model-card | Keep | Add clinical prediction model bias/calibration required sections. |
| ce-notebook-edit | Keep | Add anchor examples for Marimo, Jupyter, and Quarto notebooks. |
| ce-optimize | Overhaul | Move scoring loops, sampling, and judge specs into references; keep invocation contract small. |
| ce-phenotype-validate | Keep | Add phenotype source/evidence artifact examples. |
| ce-plan | Overhaul | Split SAP, technical plan, and deepening paths into references; keep "always plan" top-level. |
| ce-power | Improve | Add trial/observational/survival minimum input menus. |
| ce-prereg | Improve | Split OSF, ClinicalTrials.gov, and PROSPERO outputs into separate references. |
| ce-pubmed | Improve | Clarify it is metadata/abstract-first; route full-text follow-up to Paperclip when available. |
| ce-release-notes | Keep | Add Codex local plugin package caveat if update checks are Claude-only. |
| ce-report-bug | Improve | Support no-`gh` corporate mode with markdown issue draft output. |
| ce-research-question | Improve | Add a 3-question max hardening path for demos. |
| ce-resolve-pr-feedback | Keep | Ensure references preserve platform-specific GitHub tool fallbacks. |
| ce-review-pack | Keep | Add signoff ledger example and PI-facing output sample. |
| ce-sap-tabular | Keep | Add one complete workbook example generated from sample CSVs. |
| ce-sas-stata-assess | Keep | Preserve non-overpromise stance; add migration-readiness checklist. |
| ce-sessions | Improve | Replace absolute user path examples with generic session-source labels. |
| ce-setup | Overhaul | Add minimal setup path, evidence-first defaults, and fewer follow-up questions. |
| ce-sprint | Improve | Add reviewer/signoff prompt examples and Codex-friendly no-subagent fallback. |
| ce-table1 | Keep | Add workbook-style Master Variables example in docs. |
| ce-update | Improve | Keep Claude-only gate; add Codex/offline refresh guidance elsewhere. |
| ce-verify | Keep | Add examples of pass/fail output for analysis sanity checks. |
| ce-work | Overhaul | Split SAP execution, generic implementation, and subagent/worktree branches into references. |
| ce-workflow | Improve | Make this the recommended post-setup user entrypoint; add "safe next demo command" output. |
| ce-worktree | Keep | Add worktree cleanup handoff and conflict-safe branch naming examples. |

## Recommended Implementation Phases

### Phase 1: Question Contract and Setup UX

- Add a standard interactive-question reference.
- Refactor `ce-setup`, `ce-workflow`, `ce-brainstorm`, `ce-plan`, `ce-code-review`, `ce-compound`, `ce-compound-refresh`, `ce-ideate`, `ce-debug`, and `ce-report-bug` to use it.
- Add tests for no duplicated platform Q/A boilerplate outside the shared contract.
- Add `ce-setup` minimal path with evidence-first defaults and detailed-survey opt-in.

### Phase 2: Progressive Disclosure for Long Skills

- Refactor `ce-code-review`, `ce-optimize`, `ce-plan`, `ce-setup`, `ce-compound-refresh`, `ce-compound`, and `ce-work`.
- Add a line-budget test with explicit allowlist.
- Keep behavior unchanged except where Phase 1 setup UX changes are intentional.

### Phase 3: Evidence and Literature Routing

- Clarify PubMed/Paperclip/web routing in `ce-literature-search`, `ce-pubmed`, `ce-method-extract`, and `ce-plan`.
- Add "abstract metadata first" vs "full-text methods deepening" language.
- Keep Paperclip optional and corporate-friendly.

### Phase 4: Output Artifact Examples

- Add sample outputs for Table 1, figure QA, manuscript package, PI review pack, preregistration, and tabular SAP workbook.
- Add tests that referenced examples exist and are copied into converted plugin outputs.

## Acceptance Criteria

- All 48 skills pass frontmatter and portability tests.
- Interactive skills use one shared question contract or a tested equivalent.
- `ce-setup` can complete a credible first-run profile in 3 questions or fewer when repo signals are sufficient.
- Long `SKILL.md` files are reduced or explicitly allowlisted.
- Claude namespaced commands and Codex skill invocation guidance are accurate in setup docs and skill text.
