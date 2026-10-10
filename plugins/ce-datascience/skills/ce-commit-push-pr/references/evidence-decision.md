# Evidence Decision

Use in SKILL.md Step 6, after resolving the range and before composition (Step A onward).

Two short-circuits first:

1. **User asked for evidence** ("ship with a demo", "include a screenshot"): go straight to capture. If capture is impossible (no runnable surface, missing credentials, docs-only diff) or clearly not useful, say so and continue without evidence.
2. **Authored in this session and clearly non-observable** (internal plumbing, refactor without visible effect, type-level change): skip without asking.

Otherwise, if the branch diff changes observable behavior (UI, CLI output, API behavior with runnable code, generated artifacts such as tables, figures, or rendered reports, workflow output) and evidence is not blocked (unavailable credentials, paid services, deploy-only infrastructure, hardware, data that cannot leave the secure environment), ask per the SKILL.md interaction rule: "This PR has observable behavior. Capture evidence for the PR description?"

- **Capture now:** use the core Compound Engineering `ce-demo-reel` skill with a target description inferred from the branch diff when that skill is installed. It returns `Tier`, `Description`, `URL`, and `Path`; exactly one of `URL` or `Path` is real and the other is `"none"`. A public `URL` becomes a `## Demo` section. A local `Path` means the user chose local save: note that a demo was recorded but not embedded. `Tier: skipped`, or both `"none"`, means no evidence. If the skill is unavailable, say demo capture is a core Compound Engineering capability (do not pretend ce-datascience ships its own demo-capture skill) and offer "Use existing evidence" or "Skip".
- **Use existing evidence:** ask for the URL or markdown embed and splice it in as a `## Demo` section.
- **Skip:** no evidence section.

Skip without asking when evidence is not possible: docs-only, markdown-only, changelog-only, release metadata, CI/config-only, test-only, or pure internal refactors. Never put PHI, patient-level rows, or small cells in captured evidence.

Then return to SKILL.md Step 6 **Compose.**
