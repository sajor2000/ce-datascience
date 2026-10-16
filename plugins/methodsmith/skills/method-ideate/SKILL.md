---
name: method-ideate
description: "Generates and ranks grounded research or analysis ideas from repo, literature, or topic context. Use when the user asks for ideas; developing one idea goes to method-brainstorm."
argument-hint: "[feature, focus area, or constraint]"
---

# Generate Improvement Ideas


## Skill Value

- **Problem it solves:** Idea generation is scattered when the subject, evidence source, or evaluation lens is unclear.
- **Use when:** The user asks for ideas, directions, research opportunities, feature concepts, or surprise-me exploration.
- **Output:** A ranked idea set with warrants and recommended next workflow, usually method-brainstorm for selected ideas.
- **Ask only if:** Only when the subject is too ambiguous for grounded ideation.
- **Do not do:** Do not skip directly to implementation or present ungrounded ideas as validated plans.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

**Resolve the current year at runtime** (`date +%Y`) when dating ideation documents and checking recent ones.

`method-ideate` answers "What are the strongest ideas worth exploring?"; `method-brainstorm` answers "What exactly should one chosen idea mean?"; `method-plan` answers "How should it be built?" This workflow produces a ranked ideation artifact in `docs/ideation/`. It does **not** produce requirements, plans, or code.

## Focus Hint

<focus_hint> #$ARGUMENTS </focus_hint>

Treat any argument as optional context: a concept, path, constraint, or volume hint (`top 3`, `100 ideas`, `raise the bar`). With none, ideate open-ended.

## Core Principles

1. **Ground before ideating** - Scan the actual codebase or supplied context first; no abstract advice detached from it.
2. **Generate many -> critique all -> explain survivors only** - Quality comes from explicit rejection with reasons, not optimistic ranking.
3. **Route action into brainstorming** - `method-brainstorm` defines the selected idea for planning; do not skip from ideation to planning.

**ADHD-inspired, CE-native pattern:** borrow isolated divergence and a separate critic from [ADHD](https://github.com/UditAkhourii/adhd) with a smaller default dispatch; do not import its full high-cost loop or reuse its prose.

## Execution Flow

### Phase 0: Resume and Scope

#### 0.1 Check for Recent Ideation Work

Look in `docs/ideation/` for documents from the last 30 days whose topic or path overlaps the focus (or an obvious recent open doc for an open-ended request). Issue-grounded and non-issue ideation are distinct topics.

If one is relevant, ask: continue from it, or start fresh. To continue: read it, summarize what was explored, preserve idea statuses, and update that file rather than creating a duplicate.

#### 0.2 Subject-Identification Gate

Before classifying mode or dispatching anything, confirm the subject is identifiable.

**Questioning principles (0.2 and 0.4):**

- Ask only for what sub-agents need: an identifiable subject (0.2) and enough substance to say something specific (0.4, elsewhere modes only).
- Never ask about solution direction, constraints, audience, tone, success criteria, or other subject characteristics; those belong to `method-brainstorm`.
- Always keep "Surprise me" as a real option; greenfield ideation is allowed.
- Stop once the subject is identifiable or delegated. More than 3 questions across 0.2 and 0.4 suggests `method-brainstorm` instead.

**Issue-tracker intent (repo mode only).** Flag it only on explicit tracker phrasing (`github issues`, `open issues`, `issue themes`, `bug reports`, `what users are reporting`), not on focus hints like `bug in auth`. When flagged, read `references/issue-tracker-mode.md` and proceed to 0.3.

**Identifiability.** Would a reader, seeing only this prompt, know what to ideate on? A prompt naming only a quality or placeholder (`improvements`, `quick wins`, `bugs` alone, empty) is vague; one naming a specific feature, page, flow, subsystem, document, or concrete topic is identifiable, however short. Being inside a repo does not make a vague prompt identifiable. When the call is not obvious, read `references/subject-identification.md`.

**The scope question** (only when repo scans and user language still leave no coherent subject):

- **Stem:** "What should the agent ideate about?"
- **Options:**
  - "Specify a subject the agent should ideate on"
  - "Surprise me — let the agent decide what to focus on"
  - "Cancel — let me rephrase"

Routing:

- **Specify** → take the follow-up as the subject and re-check identifiability once. If still ambiguous, ask once more with "Surprise me" still offered. Narrow only *what* the subject is, never *how* to solve it.
- **Surprise me** → mark the run as **surprise-me mode** and read `references/surprise-me-mode.md` now; it replaces 0.3 classification and adds rules to 0.4, 0.6, Phase 1, and Phase 2.
- **Cancel** → exit cleanly; tell the user they can rephrase and re-invoke.

#### 0.3 Mode Classification

Classify the **subject** (not the CWD), deciding in order:

**Decision 0 — biomedical research question?** Positive on two or more clinical/biostat terms: population (patients, ICU, sepsis, EHR cohort, claims, omics), exposure/intervention (drug, device, procedure, biomarker), outcome (mortality, readmission, AUC, time-to-event), or design (RCT, cohort, case-control, prediction model, target trial). Negative when the subject is software, naming, narrative, or personal even if healthcare-adjacent ("redesign our patient-portal sign-up page" is elsewhere-software). When positive, skip Decisions 1-2, say "Treating this as a biomedical research question — about X.", and load `references/biomedical-frames.md`; it replaces only Phase 2 frames and the Phase 6 menu. Phase 1 runs normally.

**Decision 1 — repo-grounded vs elsewhere.** Weigh prompt content first, topic-repo coherence second, CWD repo presence only as support. Code, files, modules, tests, workflows, or issue-tracker intent -> repo-grounded. Topics with no code surface (pricing, naming, narrative, brand, personal) -> elsewhere.

**Decision 2 (elsewhere only) — software vs non-software.** A product, app, page, flow, feature, or service is **elsewhere-software**, even when ideas concern its copy, UX, pricing, or design. **Elsewhere-non-software** has no software surface: brand naming, narrative, personal decisions, non-digital business, physical products.

State the approach in one plain sentence, using a domain word from the topic, never the internal label:

- Repo-grounded: "Treating this as a topic in this codebase — about X."
- Elsewhere-software: "Treating this as a product/software topic outside this repo — about X."
- Elsewhere-non-software: "Treating this as a [naming | narrative | business | personal] topic — about X."

Do not prescribe correction phrases; if the user disagrees, reclassify and re-run routing. If classification is genuinely ambiguous, read `references/subject-identification.md` for the one-question confirmation.

**Elsewhere modes:** read `references/elsewhere-mode.md` for the 0.4 gate and Phase 1 dispatch. **Elsewhere-non-software** additionally must load `references/universal-ideation.md` and follow it in place of Phase 2 frame dispatch and the Phase 6 menu; do not improvise those from memory. The §6.5 Proof Failure Ladder in `references/post-ideation-workflow.md` still applies whenever a Proof save fails.

#### 0.4 Context-Substance Gate (Elsewhere Modes Only)

Skip in repo mode. In elsewhere modes, follow the gate in `references/elsewhere-mode.md`.

#### 0.5 Interpret Focus and Volume

Infer the **focus context** (concept, path, constraint, or open-ended) and any **volume override**. Defaults:

- compact divergent mode: 3 sub-agents x 4 ideas (~12 raw candidates), 3-5 survivors
- explicit wide mode: 6 sub-agents x ~6-8 ideas (~36-48 raw), 5-7 survivors
- direct mode: 1-3 warranted options, no ideation fan-out

Honor clear overrides (`top 3`, `100 ideas`, `go deep`, `raise the bar`). **Tactical scope:** `polish`, `typo(s)`, `quick wins`, `small improvements`, `cleanup`, `small fixes` lower the Phase 2 ambition floor (waive the meeting test); otherwise aim for step-function ideas.

#### 0.5b Divergence Gate

Choose the smallest reasoning shape that fits:

- **Direct** — no ideation sub-agents when the request is closed, tactical, canonical, a syntax/lookup question, or a bug with a known root cause. Treat `quick`, `standard`, `canonical`, `textbook`, `just`, and similar as direct-path signals unless the user asks to go wide. Give 1-3 warranted options and continue to the Phase 6 review loop.
- **Compact divergent (default)** — three isolated ideation sub-agents for an open-ended topic with multiple plausible directions.
- **Wide divergent** — six frames only when the user explicitly asks for `ADHD mode`, `go wide`, `wide exploration`, or equivalent broad exploration. Never infer wide mode from a vague or high-stakes topic.

State the selected path in the cost notice. Explicit wide requests override direct-path signals.

#### 0.6 Cost Transparency Notice

Before Phase 1, state the path and agent count in one informational line: grounding agents plus 0/3/6 ideation agents (direct/compact/wide); +1 each for issue intelligence or opted-in Slack; -1 for a web-research skip or cache reuse. Example: "Compact divergent path: will dispatch ~6 agents: codebase scan + learnings + web research + 3 isolated ideation sub-agents. Skip phrases: 'no external research', 'no slack'."

### Phase 1: Mode-Aware Grounding

Generate an 8-hex `<run-id>` once and create the cross-invocation scratch directory directly under `/tmp` (not `$TMPDIR`, not `.context/`):

```bash
SCRATCH_DIR="/tmp/methodsmith/method-ideate/<run-id>"
mkdir -p "$SCRATCH_DIR"
echo "$SCRATCH_DIR"
```

Use the echoed path as `<scratch-dir>` for the cache and checkpoints; never delete it.

Dispatch grounding agents in parallel in the **foreground** with the platform's subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex); run sequentially if parallel dispatch is unavailable. Omit the `mode` parameter.

**Repo mode:**

1. **Quick context scan** — general-purpose sub-agent on the cheapest capable model (e.g., `model: "haiku"` in Claude Code):

   > Read AGENTS.md (CLAUDE.md as fallback, then README.md), then list the top-level layout with the native glob tool (e.g., `Glob` `*` or `*/*`). Return under 30 lines: project shape (language, framework, layout), notable conventions, pain points or gaps, leverage points. Stay shallow: no issues, templates, contribution guides, or deep code search.
   >
   > Focus hint: {focus_hint}

2. **Learnings search** — `method-learnings-researcher` with a brief summary of the focus.
3. **Web research** — below.
4. **Issue intelligence** — only when flagged; see `references/issue-tracker-mode.md`.

**Elsewhere modes:** use the dispatch in `references/elsewhere-mode.md`.

**Web research (V5, V15).** Always on unless the user said "no external research", "skip web research", or equivalent; then omit `method-web-researcher` and note the skip. Before every dispatch, read `references/web-research-cache.md` for the session cache check and append. Pass the focus hint, a one-to-two-sentence planning context, and the mode; never pass codebase content.

**Slack context** is opt-in: dispatch `method-slack-researcher` in parallel only when the user asks and Slack tools exist; otherwise mention availability, or give the install hint if they asked and none are reachable.

**Consolidated grounding summary** (omit empty sections): **Codebase context** (repo) or **Topic context** (elsewhere); **Past learnings**; **Issue intelligence** (when present); **External context** (note "(reused from earlier dispatch)" on cache reuse); **Slack context**.

**Failure handling:** warn and proceed; never block on grounding. Web research failure: "External research unavailable: {reason}. Proceeding with internal grounding only." Note thin elsewhere context so Phase 2 compensates with broader generation.

### Phase 2: Divergent Ideation

Generate the full candidate list before critiquing any idea.

**Direct path:** dispatch no ideation agents. Give the 1-3 warranted options, state why the wider loop was unnecessary, then continue to the Phase 6 review loop.

**Compact and wide paths:** dispatch parallel ideation sub-agents on the inherited model (do not tier down) and omit `mode`. Compact mode dispatches **exactly 3** sub-agents with **4 candidates each**. Wide mode dispatches **6** sub-agents with ~6-8 candidates each. Compact issue-tracker mode still uses exactly 3 theme-derived or padded frames. Adjust per-agent targets only for explicit volume overrides.

Give each sub-agent only the grounding summary, focus hint, its frame, and its volume target. Generator branches are isolated: do not pass one branch's output or critique to another. Instruct every generator to produce raw candidates only -- no ranking, evaluation, or hedging -- to push past its first obvious ideas, and to ground every idea in the grounding summary.

**Frames:** before dispatch, read `references/ideation-frames.md` (frames and compact/wide selection rule).

**Per-idea output contract (all frames, all modes):**

- **title**
- **summary** (2-4 sentences)
- **warrant** (tagged): `direct:` quoted line, file, named issue, or user-supplied context; `external:` named prior art or research with source; or `reasoned:` a written-out first-principles argument
- **why_it_matters** — links warrant to significance
- **meeting_test** — one line on why this warrants team discussion (waived for tactical scope)

Warrant is required, not optional. An idea without articulated warrant does not surface, however plausible. Below the meeting-test floor, it does not surface unless tactical scope applies. Stay within the subject's identity: expansions, new surfaces, retirements, and pivots are fair with warrant; replacing the subject (abandoning the project, becoming a different organization) is out.

After compact or wide agents return:

1. Merge and dedupe into one master list.
2. Synthesize cross-cutting combinations across frames (3-5 additions at most in specified mode).
3. Weight toward any focus without excluding stronger adjacent ideas.
4. Spread across dimensions (workflow, reliability, extensibility, capabilities, knowledge, quality, leverage) when justified.

**Separate critic pass:** the orchestrator, not a generator, critiques the merged list. Score groundedness, novelty, fit, and feasibility; cluster by underlying angle; list attractive-but-unsuitable traps with one concise reason each. In compact mode, explain and deepen only the top 2 non-trap survivors; do not dispatch additional deepening agents. Wide mode may present more survivors but still keeps criticism separate from generation.

Then read `references/evidence-access.md` (PubMed and Paperclip MCP tools, rules) and run its literature pulse per survivor (**Look up here:** prior art, hit count and 2-3 PMIDs, labelled `abstract`, never a systematic search).

**Checkpoint A (V17).** After synthesis, write `<scratch-dir>/raw-candidates.md` with the full list and sub-agent attribution. Best-effort: on write failure, warn and proceed.

After merging and synthesis (or after the direct-path options), and before presenting survivors, load `references/post-ideation-workflow.md` (non-optional; never before Phase 2 dispatch completes). It holds the filtering rubric, artifact template, quality bar, and the Phase 6 menu (Refine, Open and iterate in Proof, Brainstorm, Save and end); none appear here. "Quickly" means fewer sub-agents, not skipping this file.
