---
title: "feat: Port high-value engineering features to ce-datascience for data scientists"
type: feat
status: active
date: 2026-04-29
---

# feat: Port high-value engineering features to ce-datascience for data scientists

## Overview

Competitive audit of ce-datascience against compound-engineering (CE), BMAD, and Superpowers revealed that ce-datascience already leads all three in scientific domain coverage. Neither BMAD nor Superpowers has any data science, statistics, or ML primitives. The gaps worth filling come from CE (3 skills to port with DS adaptations) and one pattern from Superpowers (mid-workflow verification gates).

---

## Problem Frame

Data scientists using ce-datascience have the full biomedical lifecycle but miss three engineering-discipline features that CE provides: (1) metric-driven optimization loops for model/threshold tuning, (2) systematic PR feedback resolution for methodology review, and (3) mid-workflow verification gates that catch analysis errors before the reporting-checklist phase. Superpowers' `verification-before-completion` pattern validates that the verification-gate concept has traction.

---

## Requirements Trace

- R1. Port `ce-optimize` from CE with data-science adaptations (cross-validation, leakage guards, experiment tracking)
- R2. Port `ce-resolve-pr-feedback` from CE for methodology review resolution
- R3. Create `ce-verify` — lightweight mid-workflow analysis verification gate (inspired by Superpowers pattern)

---

## Scope Boundaries

- No BMAD features — BMAD's Analyst role is business-domain, not quantitative; Party Mode risks context collision in statistical analysis
- No session memory / vector search (Superpowers `remembering-conversations`) — complex infrastructure; ce-compound + ce-sessions already serve this purpose
- No `lfg` autonomous pipeline — statistical analysis requires human oversight at key decision points
- No `ce-frontend-design`, `ce-test-browser`, `ce-test-xcode`, `ce-dhh-rails-style` — not relevant to data scientists
- No `ce-gemini-imagegen` — image generation is not analysis
- No `ce-agent-native-architecture` — agent building, not data science
- No `ce-demo-reel` — available via parent CE plugin; no DS-specific adaptation needed
- No `ce-proof` — available via parent CE plugin; works for SAPs/manuscripts without adaptation

---

## Context & Research

### Competitive Audit Summary

| Plugin | Data Science Features | Engineering Discipline | Key Insight |
|---|---|---|---|
| **CE (compound-engineering)** | None | Best-in-class: optimize, proof, resolve-pr-feedback, demo-reel, lfg, polish-beta | Port ce-optimize + ce-resolve-pr-feedback with DS adaptations |
| **BMAD** | None | Role-based agents, scale-adaptive planning, 34+ workflows | Scale-adaptive already covered by ce-plan depth classification |
| **Superpowers** | None | TDD enforcement, systematic-debugging, verification-before-completion, session memory | verification-before-completion pattern is the key takeaway |
| **ce-datascience** | 20+ domain skills | Fork of CE core | Already ahead; fill engineering gaps |

### Skills in CE not in ce-datascience (relevant subset)

| CE Skill | Relevance to DS | Decision |
|---|---|---|
| `ce-optimize` | HIGH — model tuning, threshold optimization, feature selection | Port with DS adaptations (U1) |
| `ce-resolve-pr-feedback` | HIGH — methodology review threads | Port as-is (U2) |
| `ce-proof` | MEDIUM — SAP/manuscript collaboration | Skip — works via parent CE plugin |
| `ce-demo-reel` | MEDIUM — capturing analysis figures | Skip — works via parent CE plugin |
| `ce-polish-beta` | LOW — HITL polish for manuscripts | Skip — beta, available via CE |
| `lfg` | LOW — autonomous pipeline | Skip — statistical analysis needs human oversight |

### Anti-pattern insight (Superpowers)

Jesse Vincent's principle: "Skills must encode anti-patterns explicitly or agents route around them." ce-datascience already does this well via reporting checklists and specialized reviewers (ce-data-leakage-reviewer, ce-causal-inference-reviewer, etc.). The gap is that anti-pattern checking only fires at code-review time, not mid-workflow.

---

## Key Technical Decisions

- **Port by duplication, not shared reference** — ce-datascience skills must be self-contained per AGENTS.md ("File References in Skills" section). Copy and adapt, don't cross-reference CE skills.
- **DS-specific naming** — Ported skills keep the `ce-` prefix but add DS-specific description text so the trigger conditions reference data science concepts.
- **ce-verify is new, not a port** — No exact equivalent exists in CE, BMAD, or Superpowers. The concept comes from Superpowers' verification-before-completion but the implementation is original.

---

## Implementation Units

- U1. **Port ce-optimize with DS adaptations**

**Goal:** Bring metric-driven optimization loops to ce-datascience, adapted for model development, threshold tuning, and feature selection.

**Dependencies:** None

**Files:**
- Create: `plugins/ce-datascience/skills/ce-optimize/SKILL.md`
- Create: `plugins/ce-datascience/skills/ce-optimize/references/ds-experiment-spec.md`
- Create: `plugins/ce-datascience/skills/ce-optimize/references/ds-judge-spec.md`
- Source: CE's `plugins/compound-engineering/skills/ce-optimize/` (read for adaptation, not shared reference)

**Approach:**

Start from CE's ce-optimize SKILL.md and adapt:
- Add cross-validation awareness: optimization loops must respect train/val/test splits and never optimize on test data
- Add data leakage guard: check that feature engineering in each experiment doesn't use future information
- Add experiment tracking integration: log runs to mlflow/wandb/dvc (per ce-ml-experiment-track setup)
- Add SAP alignment check: if a SAP exists, verify that the optimization target aligns with the pre-registered primary endpoint
- Replace CE's generic "hard gate" examples with DS examples: AUC threshold, calibration slope, Brier score gate
- Replace CE's generic "LLM-as-judge" examples with DS examples: clinical plausibility of feature importance, interpretability of model decisions
- Keep CE's parallel experiment dispatch and worktree isolation patterns unchanged

**Patterns to follow:**
- CE's `plugins/compound-engineering/skills/ce-optimize/SKILL.md` — overall structure and experiment loop
- CE's `plugins/compound-engineering/skills/ce-optimize/references/` — spec schemas and templates
- `plugins/ce-datascience/skills/ce-ml-experiment-track/SKILL.md` — experiment tracking conventions

**Test scenarios:**
- Test expectation: none -- skill is instruction-prose (SKILL.md), not executable code. Validated by `bun test tests/frontmatter.test.ts`.

**Verification:** Frontmatter passes validation. Description < 1024 chars. No angle brackets in description. References use backtick paths, not markdown links. README updated with new skill.

---

- U2. **Port ce-resolve-pr-feedback for methodology review**

**Goal:** Bring systematic PR feedback resolution to ce-datascience for handling statistical methodology review comments.

**Dependencies:** None

**Files:**
- Create: `plugins/ce-datascience/skills/ce-resolve-pr-feedback/SKILL.md`
- Create: `plugins/ce-datascience/skills/ce-resolve-pr-feedback/scripts/get-pr-comments` (copy from CE)
- Create: `plugins/ce-datascience/skills/ce-resolve-pr-feedback/scripts/get-thread-for-comment` (copy from CE)
- Create: `plugins/ce-datascience/skills/ce-resolve-pr-feedback/scripts/reply-to-pr-thread` (copy from CE)
- Create: `plugins/ce-datascience/skills/ce-resolve-pr-feedback/scripts/resolve-pr-thread` (copy from CE)
- Source: CE's `plugins/compound-engineering/skills/ce-resolve-pr-feedback/`

**Approach:**

Copy CE's ce-resolve-pr-feedback with minimal changes:
- Update the description to mention "statistical methodology review", "SAP feedback", "reporting checklist comments"
- Add trigger phrases for DS context: "reviewer asked about the estimand", "reviewer flagged the sample size", "reviewer wants sensitivity analysis"
- Keep the scripts unchanged — they interact with GitHub API and are domain-agnostic
- Update the ce-pr-comment-resolver agent reference if ce-datascience has its own version

**Patterns to follow:**
- CE's `plugins/compound-engineering/skills/ce-resolve-pr-feedback/SKILL.md`
- CE's scripts (shell scripts for gh API interaction)

**Test scenarios:**
- Test expectation: none -- skill is instruction-prose + shell scripts. Validated by `bun test tests/frontmatter.test.ts`.

**Verification:** Frontmatter passes validation. Scripts are executable. README updated with new skill.

---

- U3. **Create ce-verify — mid-workflow analysis verification gate**

**Goal:** A lightweight verification skill that data scientists run between analysis steps to catch errors before the full reporting-checklist review at manuscript time. Inspired by Superpowers' verification-before-completion pattern, adapted for statistical analysis.

**Dependencies:** None

**Files:**
- Create: `plugins/ce-datascience/skills/ce-verify/SKILL.md`
- Create: `plugins/ce-datascience/skills/ce-verify/references/check-catalog.md`

**Approach:**

The skill runs a quick verification pass on analysis outputs. It is NOT a reporting checklist (that's ce-checklist-match + ce-reporting-checklist-reviewer). It is a mid-workflow sanity check.

Check catalog (in `references/check-catalog.md`):

1. **Sample size check** — Does N match the cohort definition? Does N match what ce-data-qa reported? If a SAP exists, does N meet the minimum from ce-power?
2. **Data leakage scan** — Are train/test splits respected? Is normalization fit on training data only? Are temporal splits honored?
3. **Effect direction check** — Does the observed effect direction match the hypothesis in `analysis/research-question.yaml`? If opposite, flag for review (not necessarily wrong, but requires attention).
4. **Missing data audit** — What percentage of key variables is missing? Does the imputation strategy match the SAP?
5. **PHI scan** — Quick check that output files in `output/` or `analysis/` don't contain patient-level identifiers (delegate to ce-phi-leak-reviewer agent if available).
6. **Figure quality** — Do generated figures follow JAMA style rules? (Arial font, 8pt minimum, no overlap, legends outside plot area.) Read the figure files and visually inspect.
7. **Reproducibility** — Are random seeds set? Are package versions locked (renv.lock / requirements.txt / pyproject.toml)?

The skill reads the stack profile to determine language (R/Python) and adjusts checks accordingly. It reads the research question YAML and SAP if they exist for context-aware checks.

Output format:
```
## Verification Report

 1. [PASS] Sample size: N=8,234 matches cohort definition
 2. [PASS] No leakage signals detected
 3. [WARN] Effect direction: OR=0.72 (protective) — hypothesis predicted harmful
 4. [PASS] Missing data: max 3.2% (BMI), within SAP threshold
 5. [PASS] No PHI in output/
 6. [WARN] Figure analysis/figures/fig1.png: legend overlaps data region
 7. [PASS] Seeds set, renv.lock present

Result: 5 PASS, 2 WARN, 0 FAIL
```

FAIL on any check blocks `/ce-work` from marking a task complete (when ce-verify is invoked by ce-work). WARN surfaces for human review but doesn't block.

**Patterns to follow:**
- `plugins/ce-datascience/skills/ce-data-qa/SKILL.md` — GO/NO-GO pattern
- `plugins/ce-datascience/skills/ce-data-qa/references/qa-checks.md` — numbered check catalog format

**Test scenarios:**
- Test expectation: none -- skill is instruction-prose. Validated by `bun test tests/frontmatter.test.ts`.

**Verification:** Frontmatter passes validation. Check catalog is complete and non-overlapping with ce-data-qa (which runs pre-modeling, not mid-workflow). README updated with new skill.

---

- U4. **Update README with new skills and counts**

**Goal:** Add ce-optimize, ce-resolve-pr-feedback, and ce-verify to README tables. Update skill count.

**Dependencies:** U1, U2, U3

**Files:**
- Modify: `plugins/ce-datascience/README.md`

**Approach:**

Add to appropriate table sections:
- `ce-optimize` → ML / AI table (alongside ce-ml-experiment-track)
- `ce-resolve-pr-feedback` → Git Workflow table (alongside ce-commit-push-pr)
- `ce-verify` → Core Workflow table (between ce-data-qa and ce-sprint, since it runs mid-analysis)

Update skill count: 37 → 40

**Test scenarios:**
- Test expectation: none -- documentation change. Validated by `bun run release:validate`.

**Verification:** `bun run release:validate` passes. README tables include all 3 new skills with accurate descriptions.

---

## System-Wide Impact

- **No existing skill behavior changes** — all 3 units are additive (new skills, not modifications)
- **ce-work integration** — ce-verify can be called by ce-work between analysis steps; ce-work already has extensibility for this via its Phase 2 task loop
- **ce-code-review integration** — ce-resolve-pr-feedback is complementary to ce-code-review (review finds issues, resolve-pr-feedback fixes them from PR comment threads)
- **ce-plan SAP integration** — ce-optimize's SAP alignment check reads the same SAP file that ce-plan writes

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| ce-optimize adaptation is too thin — just renaming examples | Require at minimum: CV-aware experiment design, leakage guard, mlflow integration, SAP alignment check |
| ce-verify overlaps with ce-data-qa | ce-data-qa runs pre-modeling (GO/NO-GO gate between extraction and analysis). ce-verify runs mid-workflow (between analysis steps). Different timing, different checks. |
| ce-resolve-pr-feedback scripts rely on `gh` CLI | Same dependency ce-commit-push-pr already has; no new risk |

---

## Sources & References

- CE plugin: `/Users/JCR/.claude/plugins/cache/compound-engineering-plugin/compound-engineering/3.2.0/`
- BMAD: [github.com/bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) — role-based agent orchestration; no DS features
- Superpowers: [github.com/obra/superpowers](https://github.com/obra/superpowers) — verification-before-completion pattern; no DS features
- Related plan: `docs/plans/2026-04-27-001-feat-ce-datascience-fork-plan.md`
