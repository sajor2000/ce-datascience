# Subject Identification and Mode Classification Detail

Read this when Phase 0.2 identifiability or Phase 0.3 mode classification is not obvious from the prompt.

## Identifiability test

Would a reader, seeing only this prompt, know what subject the agent should ideate on? Judge what the words *refer to*, not their length or surface form.

- **Vague — ask the scope question.** The prompt names a quality, category, or placeholder; reasonable readers would pick different subjects. Illustrative: `improvements`, `ideas`, `things to fix`, `quick wins`, `what to build`, `bugs` (as the whole prompt, not "bugs in auth"), an empty prompt. Recognize the pattern (a catch-all quality), not the specific words.
- **Identifiable — proceed to 0.3.** The prompt names or plausibly names a specific feature, concept, document, subsystem, page, flow, or concrete topic. Illustrative: `authentication system`, `our sign-up page`, `browser sniff`, `dark mode`, `cache invalidation`, `a unicorn cake for my 7-year-old`, `plot ideas for a short story`.
- Short is not vague: `browser sniff` plausibly names a feature (identifiable); `quick wins` names only a quality (vague).
- Being inside a repo does not settle vagueness. `improvements` in any repo still scatters across DX, reliability, features, docs, tests, and architecture. Do not silently interpret a vague prompt as "about this repo."
- **Genuine ambiguity (repo mode):** when a short phrase could be a named feature or a vague concept, run one cheap check: native glob for the phrase in filenames, or content search in README/docs. Any footprint -> identifiable. No footprint and still vague -> ask the scope question.
- Otherwise, when in doubt, ask: one question is cheap compared with dispatching many agents on a scattered interpretation.

## Issue-tracker intent detail

Trigger only on explicit tracker phrasing: `github issues`, `open issues`, `issue patterns`, `issue themes`, `what users are reporting`, `bug reports`. Do NOT trigger on focus hints that merely mention bugs: `bug in auth`, `fix the login issue`, `the signup bug`, `top 3 bugs in authentication`. When combined (`top 3 issue themes in authentication`, `biggest bug reports about checkout`): detect issue-tracker intent first, take the volume override in 0.5, and treat the remainder as the focus hint that narrows which issues matter.

## Decision 1 signals

- **Repo-grounded:** prompt references repo files, code, architecture, modules, tests, or workflows; topic is bounded by the current codebase. Issue-tracker intent is always repo-grounded.
- **Elsewhere:** prompt names things absent from the repo (pricing, naming, narrative, business model, personal decisions, brand, content, market positioning); topic is creative, business, or personal with no code surface.

## Decision 2 samples (software vs non-software)

Classify by whether the *subject* is a software artifact, not where ideas land. Ideas about copy, UX, CRO, pricing, onboarding, visual design, or positioning *for a software product* are still elsewhere-software.

| Prompt | Mode | Subject |
| --- | --- | --- |
| Improve conversion on our sign-up page | elsewhere-software | a page |
| Redesign the onboarding flow | elsewhere-software | a flow |
| Pricing page A/B test ideas | elsewhere-software | a page |
| Features to add to our note-taking app | elsewhere-software | an app |
| Name my new coffee shop | elsewhere-non-software | a brand |
| Plot ideas for a short story | elsewhere-non-software | a narrative |
| Options for my next career move | elsewhere-non-software | a personal decision |

## Mode ambiguity confirmation

Fire only when classification is genuinely ambiguous after 0.2 settled the subject (e.g., "our docs" could be repo docs or public marketing docs). Ask one blocking question with two self-contained labels naming the interpretations in plain language (e.g., "Treat as repo docs in this codebase" vs "Treat as public marketing docs"). Never leak internal mode names. Otherwise the one-sentence mode statement suffices.
