# Elsewhere-Mode Intake and Grounding

Read this when Phase 0.3 classifies the subject as elsewhere-software or elsewhere-non-software. It covers the Phase 0.4 context gate and the Phase 1 elsewhere dispatch. Never run the repo codebase scan in these modes.

## Phase 0.4 Context-Substance Gate

Phase 1 agents depend on user-supplied substance here.

- When the user gave rich context up front (paste, brief, draft, URL), confirm understanding in one line and skip this gate.
- Otherwise apply the discrimination test: would swapping one piece of stated context for a contrasting alternative materially change which ideas survive? If yes, proceed. If no, ask 1-3 narrow questions that **supply substance, not characterize the subject**: a URL or file to read, a brief description of the current state, or a paste of an existing draft or brief.
- Build on what the user already provided. Default to free-form questions; use single-select only for small discrete answer spaces. Re-apply the test after each answer.
- Stop on dismissive responses ("idk just go"); treat genuine "no context" as a real answer and record that context is thin so Phase 2 compensates with broader generation.
- If the answers shift the subject itself, re-run Phase 0.2 and 0.3 on the refined scope before Phase 1.

## Phase 1 elsewhere dispatch (parallel, foreground)

1. **User-context synthesis** — general-purpose sub-agent on the cheapest capable model. Read the Phase 0.4 intake plus rich-prompt material and return a summary mirroring the codebase-scan shape: topic shape, stated constraints, user-named pain points, opportunity hooks.
2. **Learnings search** — elsewhere-software only: dispatch `method-learnings-researcher` with the topic summary. Skip by default for elsewhere-non-software; engineering patterns in `docs/solutions/` rarely transfer and pollute generation.
3. **Web research** — as in `SKILL.md` Phase 1.

Issue intelligence does not apply. Slack research stays opt-in.
