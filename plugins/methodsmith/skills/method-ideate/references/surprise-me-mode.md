# Surprise-Me Mode

Read this as soon as the user picks "Surprise me" in Phase 0.2. These rules override the matching steps in `SKILL.md` for the rest of the run.

## Routing (replaces Phase 0.3 classification)

- Skip Decisions 0, 1, and 2 and the mode-ambiguity confirmation: there is no user subject to weigh.
- CWD inside a git repo -> repo-grounded (the codebase supplies substance).
- Otherwise -> elsewhere-software. Surprise-me never routes to elsewhere-non-software.
- State the chosen mode in one plain sentence and proceed. The user can correct by interrupting and re-invoking with a named subject.

## Context gate (Phase 0.4, no-repo runs)

At least one piece of substance (URL, description, draft, or paste) is required. Dismissive responses are not acceptable here. If the user still has no context after one ask, say the run needs a URL, description, or paste to proceed and end cleanly so they can re-invoke with material.

## Cost notice

Append "(surprise-me mode: deeper exploration per agent)" to the Phase 0.6 line.

## Grounding depth (Phase 1)

Phase 2 agents discover their own subjects from Phase 1 output, so produce richer texture than specified mode:

- **Repo:** the codebase-scan agent samples a few representative files per top-level area (not just layout + AGENTS.md), surfaces recent PR/commit activity as signal of active work, and, when issue intelligence runs, passes issue themes as first-class input. Keep the scan representative, not exhaustive.
- **Elsewhere:** user-context synthesis extracts themes, recurring language, tensions, and omissions rather than restating; web research broadens from single-subject prior art toward the domain landscape.

## Generator addendum (Phase 2)

Add this to each ideation sub-agent's dispatch prompt:

> No user-specified subject. Through your frame's lens, explore the Phase 1 material and identify the subject(s) you find most interesting for this frame. Different frames finding different subjects is the feature — cross-subject divergence is what makes surprise-me valuable. Each idea still carries warrant; warrant may include identification of the subject itself (why *this* subject is worth ideating on through your lens, citing what in the Phase 1 material signals it).

## Cross-cutting synthesis

Cross-cutting is the main value layer: expect 5-8 combinations (versus 3-5 in specified mode) and give the step more attention. Surface combinations that span multiple frame-chosen subjects.
