---
name: ce-brainstorm
description: 'Explore research questions and study designs through collaborative dialogue before writing a right-sized requirements document and planning analysis. Use for research ideas, study framing, when the user says ''let''s brainstorm'', or when they want to think through options before deciding what to study. Also use when a user describes a vague or ambitious research question, asks ''what should we study'', ''help me think through X'', presents a problem with multiple valid designs, or seems unsure about scope or direction — even if they don''t explicitly ask to brainstorm.'
argument-hint: "[research question or study idea to explore]"
---

# Brainstorm a Research Question or Study

**Note: The current year is 2026.** Use this when dating requirements documents.

Brainstorming helps answer **WHAT** to study through collaborative dialogue. It precedes `/ce-plan`, which answers **HOW** to execute the analysis.

The durable output of this workflow is a **requirements document**. In other workflows this might be called a study protocol or analysis brief. In compound engineering for data science, keep the workflow name `brainstorm`, but make the written artifact strong enough that planning does not need to invent study design, scope boundaries, or success criteria/endpoints.

This skill does not implement analysis code. It explores, clarifies, and documents decisions for later planning or execution.

**IMPORTANT: All file references in generated documents must use repo-relative paths (e.g., `src/models/user.rb`), never absolute paths. Absolute paths break portability across machines, worktrees, and teammates.**

## Core Principles

1. **Assess scope first** - Match the amount of ceremony to the size and ambiguity of the work.
2. **Be a thinking partner** - Suggest alternatives, challenge assumptions, and explore what-ifs instead of only extracting requirements.
3. **Resolve study design decisions here** - Research questions, study populations, exposures, outcomes, scope boundaries, and success criteria/endpoints belong in this workflow. Detailed analysis implementation belongs in planning.
4. **Keep implementation out of the requirements doc by default** - Do not include specific packages, SQL queries, model specifications, file layouts, or code-level design unless the brainstorm itself is inherently about a methodological or analytical architecture decision.
5. **Right-size the artifact** - Simple work gets a compact requirements document or brief alignment. Larger work gets a fuller document. Do not add ceremony that does not help planning.
6. **Apply YAGNI to carrying cost, not coding effort** - Prefer the simplest study design that delivers meaningful evidence. Avoid speculative complexity and hypothetical future-proofing, but low-cost analytical rigor is worth including when its ongoing cost is small and easy to maintain.

## Interaction Rules

These rules apply to every brainstorm, including the universal (non-software) flow routed to `references/universal-brainstorming.md`.

1. **Ask one question at a time** - One question per turn, even when sub-questions feel related. Stacking several questions in a single message produces diluted answers; pick the single most useful one and ask it.
2. **Prefer single-select multiple choice** - Use single-select when choosing one direction, one priority, or one next step.
3. **Use multi-select rarely and intentionally** - Use it only for compatible sets such as goals, constraints, non-goals, or success criteria that can all coexist. If prioritization matters, follow up by asking which selected item is primary.
4. **Default to the platform's blocking question tool** - Use `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini, `ask_user` in Pi (requires the `pi-ask-user` extension). These tools include a free-text fallback (e.g., "Other" in Claude Code), so options scaffold the answer without confining it — well-chosen options surface dimensions the user may not have separated, and pick-plus-optional-note is lower activation energy than composing prose from scratch. This default holds for opening and elicitation questions too, not only narrowing. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors (e.g., Codex edit modes) — not because a schema load is required. Never silently skip the question.
5. **Use prose only when the question is genuinely open** - Drop the blocking tool only when (a) the answer is inherently narrative ("walk me through how you got here"), (b) the question is diagnostic or introspective and presented options would leak your priors and bias the answer (e.g., "what concerns you most?" where a 4-option menu signals which axes matter), or (c) you cannot write 3-4 genuinely distinct, plausibly-correct options that cover the space without padding or strawmen. The test: if you'd be straining to fill the option slots, the question is open — use prose. Rule 1 still applies: still one question per turn.

## Output Guidance

- **Keep outputs concise** - Prefer short sections, brief bullets, and only enough detail to support the next decision.
- **Use repo-relative paths** - When referencing files, use paths relative to the repo root (e.g., `src/models/user.rb`), never absolute paths. Absolute paths make documents non-portable across machines and teammates.

## Research Question Description

<research_description> #$ARGUMENTS </research_description>

**If the research description above is empty, ask the user:** "What would you like to explore? Please describe the research question, hypothesis, or study idea you're thinking about."

Do not proceed until you have a research question description from the user.

## Execution Flow

### Phase 0: Resume, Assess, and Route

#### 0.1 Resume Existing Work When Appropriate

If the user references an existing brainstorm topic or document, or there is an obvious recent matching `*-requirements.md` file in `docs/brainstorms/`:
- Read the document
- Confirm with the user before resuming: "Found an existing requirements doc for [topic]. Should I continue from this, or start fresh?"
- If resuming, summarize the current state briefly, continue from its existing decisions and outstanding questions, and update the existing document instead of creating a duplicate

#### 0.1b Classify Task Domain

Before proceeding to Phase 0.2, classify whether this is a data science or study design task. The key question is: **does the task involve designing, analyzing, or architecting a research study or data analysis?** -- not whether the task *mentions* data or research topics.

**Data science / study design** (continue to Phase 0.2) -- the task references research questions, hypotheses, datasets, study populations, exposures, outcomes, statistical analyses, or asks to design/execute/interpret a study or analysis.

**Non-study brainstorming** (route to universal brainstorming) -- BOTH conditions must be true:
- None of the data science signals above are present
- The task describes something the user wants to explore, decide, or think through in a non-research domain

**Neither** (respond directly, skip all brainstorming phases) -- the input is a quick-help request, error message, factual question, or single-step task that doesn't need a brainstorm.

**If non-study brainstorming is detected:** Read `references/universal-brainstorming.md` and use those facilitation principles. Skip Phases 0.2–4 below — the **Core Principles and Interaction Rules above still apply unchanged**, including one-question-per-turn and the default to the platform's blocking question tool.

#### 0.2 Assess Whether Brainstorming Is Needed

**Clear requirements indicators:**
- Specific success criteria or endpoints provided
- Referenced existing study designs or prior analyses to follow
- Described exact expected outcomes and populations
- Constrained, well-defined scope

**If requirements are already clear:**
Keep the interaction brief. Confirm understanding and present concise next-step options rather than forcing a long brainstorm. Only write a short requirements document when a durable handoff to planning or later review would be valuable. Skip Phase 1.1 and 1.2 entirely — go straight to Phase 1.3 or Phase 3.

#### 0.3 Assess Scope

Use the research question description plus a light repo scan to classify the work:
- **Lightweight** - small, well-bounded, low ambiguity (e.g., descriptive analysis, single-table query)
- **Standard** - normal study or bounded analysis with some design decisions to make
- **Deep** - cross-cutting, multi-dataset, strategic, or highly ambiguous research

If the scope is unclear, ask one targeted question to disambiguate and then proceed.

**Deep sub-mode: analysis vs program.** For Deep scope, also classify whether the brainstorm must establish research program shape or inherit it:

- **Deep — analysis** (default): existing research program anchors decisions. Primary investigators, core research question, prior work, and study workflows are already established. The brainstorm extends or refines within that program.
- **Deep — program**: the brainstorm must establish research program shape rather than inherit it. Primary investigators, core research questions, positioning against existing literature, or primary study workflows are materially unresolved. Existing analyses lower the odds of program-tier but do not by themselves rule it out — a half-completed study with ambiguous scope is still program-tier.

Program-tier triggers additional Phase 1.2 questions and additional sections in the requirements document. Analysis-tier uses the current Deep behavior unchanged.

### Phase 1: Understand the Idea

#### 1.1 Existing Context Scan

Scan the repo before substantive brainstorming. Match depth to scope:

**Lightweight** — Search for the topic, check if something similar already exists, and move on.

**Standard and Deep** — Two passes:

*Constraint Check* — Check project instruction files (`AGENTS.md`, and `CLAUDE.md` only if retained as compatibility context) for workflow, product, or scope constraints that affect the brainstorm. If these add nothing, move on.

*Topic Scan* — Search for relevant terms. Read the most relevant existing artifact if one exists (brainstorm, plan, spec, prior analysis, study protocol). Skim adjacent examples covering similar research.

If nothing obvious appears after a short scan, say so and continue. Two rules govern technical depth during the scan:

1. **Verify before claiming** — When the brainstorm touches checkable infrastructure (data tables, existing datasets, config files, dependencies, variable definitions), read the relevant source files to confirm what actually exists. Any claim that something is absent — a missing variable, a dataset that doesn't exist, a dependency not installed, a data field with no current support — must be verified against the codebase first; if not verified, label it as an unverified assumption. This applies to every brainstorm regardless of topic.

2. **Defer analysis decisions to planning** — Implementation details like specific statistical methods, query optimization, notebook structure, or pipeline architecture belong in planning, not here — unless the brainstorm is itself about a methodological or analytical architecture decision, in which case those details are the subject of the brainstorm and should be explored.

**Slack context** (opt-in, Standard and Deep only) — never auto-dispatch. Route by condition:

- **Tools available + user asked**: Dispatch `ce-slack-researcher` with a brief summary of the brainstorm topic alongside Phase 1.1 work. Incorporate findings into constraint and context awareness.
- **Tools available + user didn't ask**: Note in output: "Slack tools detected. Ask me to search Slack for organizational context at any point, or include it in your next prompt."
- **No tools + user asked**: Note in output: "Slack context was requested but no Slack tools are available. Install and authenticate the Slack plugin to enable organizational context search."

#### 1.2 Study Design Pressure Test

Before generating approaches, scan the user's opening for rigor gaps. Match depth to scope.

This is agent-internal analysis, not a user-facing checklist. Read the opening, note which gaps actually exist, and raise only those as questions during Phase 1.3 — folded into the normal flow of dialogue, not fired as a pre-flight gauntlet. A fuzzy opening may earn three or four probes; a concrete, well-framed one may earn zero because no scope-appropriate gaps were found.

**Lightweight:**
- Is this answering a real clinical or scientific question?
- Are we duplicating an analysis that already covers this?
- Is there a clearly better framing with near-zero extra cost?

**Standard — scan for these gaps:**

- **Prior evidence gap.** The opening asserts a research question or hypothesis, but doesn't point to existing evidence — published studies, pilot data, preliminary analyses, clinical observations — that would make the question grounded. When present, ask what existing evidence supports this research question and whether there is pilot data or prior literature.

- **Population specificity gap.** The opening describes the study population at a level of abstraction where the agent couldn't design without silently inventing who is included. When present, ask the user to describe the specific study population — inclusion/exclusion criteria, clinical setting, timeframe.

- **Equipoise / comparison gap.** The opening doesn't make visible what the current standard of care or comparison group is, nor whether clinical equipoise is established, nor what happens if nothing changes. When present, ask what the current standard of care or comparison group is, even if imperfect — and what changes if this study is never done.

- **Design appropriateness gap.** The opening treats a particular study design as the approach, rather than the evidence that design is supposed to generate, and hasn't been examined against simpler designs that might answer the same question. When present, ask whether this is the right study design for the question — could a simpler design (cross-sectional vs. longitudinal, existing data vs. new collection) answer it.

**Standard and Deep — domain-specific probes (scan alongside the gap lenses above):**

- **PICO/PECO framing.** Has the user specified all elements? Population (who), Intervention or Exposure (what), Comparison (against what), Outcome (measured how). When incomplete, probe for the missing elements.

- **Comparison group validity.** Is the proposed comparison group appropriate? Is it a true control, or could selection bias confound the comparison?

- **Confounding strategy.** Has the user considered how confounders will be handled — adjustment, matching, restriction, stratification, or instrumental variables? When absent, ask what the key potential confounders are and how they plan to address them.

- **Outcome measurement validity.** How is the outcome operationalized and measured? Is there a validated measure, an ICD/CPT definition, a lab threshold, or a clinical assessment tool?

- **Data access feasibility.** Is the data available, accessible, and of sufficient quality? Are there IRB, data use agreement, or data linkage barriers? Is the sample size likely sufficient?

Plus these synthesis questions — not gap lenses, study-design judgment the agent weighs in its own reasoning:
- Is there a nearby framing that generates more actionable evidence without more analytical cost? If so, what complexity does it add?
- Given the current data availability, research goals, and constraints, what is the single highest-leverage move right now: the question as framed, a reframing, one adjacent analysis, a simplification, or doing nothing?

Favor moves that compound evidence, reduce future analytical carrying cost, or make the study meaningfully more rigorous or compelling. Use the result to sharpen the conversation, not to bulldoze the user's intent.

**Deep** — Standard lenses, domain-specific probes, and synthesis questions plus:
- Is this an isolated analysis, or does it move the broader research program toward where it wants to be?

**Deep — program** — Deep plus:

- **Durability gap.** The opening's research significance rests on a current state of clinical practice or evidence that may shift in predictable ways within the horizon the user cares about. When present, ask how the research question holds under the most plausible near-term shifts — new treatments, guideline changes, data availability changes — and push past answers every research group could make.

- What adjacent study could we accidentally design instead, and why is that the wrong one?
- What would have to be true in the clinical or scientific landscape for this study to be irrelevant?

These questions force an explicit research thesis and feed the Scope Boundaries subsections ("Deferred for later" and "Outside this study's scope") and Dependencies / Assumptions in the requirements document.

#### 1.3 Collaborative Dialogue

Follow the Interaction Rules above. Use the platform's blocking question tool when available.

**Guidelines:**
- Ask what the user is already thinking before offering your own ideas. This surfaces hidden context and prevents fixation on AI-generated framings.
- Start broad (research question, population, clinical significance) then narrow (inclusion/exclusion, confounders, edge cases)
- **Rigor probes fire before Phase 2 and are prose, not menus.** Narrowing is legitimate, but Phase 1 cannot end with un-probed rigor gaps. Each scope-appropriate gap from Phase 1.2 fires as a **separate** direct prose probe — one probe satisfies one gap, not multiple. Standard brainstorms scan four gap lenses (prior evidence, population specificity, equipoise/comparison, design appropriateness) plus domain-specific probes (PICO/PECO, comparison validity, confounding, outcome measurement, data feasibility); Deep-program adds durability (five core gaps total), but only the gaps actually present in the opening must be probed. Surface those probes progressively across the conversation — interleaving with narrowing moves is fine, as long as every scope-appropriate gap that was found in Phase 1.2 has been probed in prose before Phase 2. Rigor probes map to Interaction Rule 5(b): a 4-option menu signals which kinds of evidence count and lets the user pick rather than produce. Prose forces them to produce real observation or surface their uncertainty. Examples (one per gap): *evidence — "What's the strongest prior evidence — published study, pilot data, clinical observation — that this research question is worth pursuing?"* / *specificity — "Can you name the specific patient population and setting, or are you reasoning from a general category?"* / *counterfactual — "What do clinicians or researchers do today when this question arises — is there a current standard, even if imperfect?"* / *design appropriateness — "Before we commit to a study design — what's the simplest version that would still generate actionable evidence?"* — **design appropriateness is the final rigor probe before Phase 2 when the design appropriateness gap is present. Fire it regardless of whether a specific design has emerged through narrowing; its job is to pressure-test the user's implicit framing of the study before Phase 2 inherits it** / *durability — "Under the most plausible near-term shifts in clinical practice or evidence, how does this research question hold?"* If the answer reveals genuine uncertainty, record it as an explicit assumption in the requirements document rather than skipping the probe.
- Clarify the problem frame, validate assumptions, and ask about success criteria/endpoints
- Make requirements concrete enough that planning will not need to invent study design decisions
- Surface dependencies or prerequisites only when they materially affect scope (IRB, data access, sample size)
- Resolve study design decisions here; leave specific analytical implementation choices for planning
- Bring ideas, alternatives, and challenges instead of only interviewing

**Exit condition:** Continue until the idea is clear OR the user explicitly wants to proceed.

### Phase 2: Explore Study Design Approaches

If multiple plausible directions remain, propose **2-3 concrete study design approaches** based on the literature and conversation. Otherwise state the recommended direction directly.

Frame alternatives as meaningfully different study design options, such as:
- Different study designs (RCT vs. observational vs. quasi-experimental)
- Different analysis strategies (regression vs. matching vs. time-series)
- Different populations or data sources (single-center vs. multi-center, EHR vs. claims vs. registry)
- Different outcome definitions or timeframes

Use at least one non-obvious angle — inversion (what if we studied the inverse outcome?), constraint removal (what if we had access to a linked dataset?), or analogy from how another clinical domain answered a similar question. The first approaches that come to mind are usually variations on the same axis.

Present approaches first, then evaluate. Let the user see all options before hearing which one is recommended — leading with a recommendation before the user has seen alternatives anchors the conversation prematurely.

When useful, include one deliberately higher-upside alternative:
- Identify what adjacent addition or reframing would most increase scientific rigor, compounding evidence, or clinical relevance without disproportionate analytical cost. Present it as a challenger option alongside the baseline, not as the default. Omit it when the study is already obviously over-scoped or the baseline design is clearly the right move.

At program tier, alternatives should differ on *what* is studied (research question, population, exposure), not *how* the analysis is run. Analysis-variant alternatives belong at analysis tier.

For each approach, provide:
- Brief description (2-3 sentences)
- Pros and cons
- Key risks or unknowns (data availability, bias, confounding)
- When it's best suited

After presenting all approaches, state your recommendation and explain why. Prefer simpler study designs when added complexity creates real analytical carrying cost, but do not reject low-cost, high-value analytical rigor just because it is not strictly necessary.

If one approach is clearly best and alternatives are not meaningful, skip the menu and state the recommendation directly.

If relevant, call out whether the choice is:
- Replicate an existing study design or prior analysis
- Extend an existing analysis with new data or methods
- Design something net new

### Phase 3: Capture the Requirements

Write or update a requirements document only when the conversation produced durable decisions worth preserving. Read `references/requirements-capture.md` for the document template, formatting rules, visual aid guidance, and completeness checks.

For **Lightweight** brainstorms, keep the document compact. Skip document creation when the user only needs brief alignment and no durable decisions need to be preserved.

### Phase 4: Handoff

Present next-step options and execute the user's selection. Read `references/handoff.md` for the option logic, dispatch instructions, and closing summary format.
