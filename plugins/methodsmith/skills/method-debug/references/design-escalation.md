# When to Suggest Rethinking the Design (`method-brainstorm`)

Read when deciding whether to offer "Rethink the design" in Phase 2, or when smart escalation points to an architecture problem.

Suggest it only when investigation shows the bug cannot be properly fixed within the current design. Concrete signals observable during debugging:

- **The root cause is a wrong responsibility or interface**, not wrong logic. The module should not be doing this at all, or the boundary between components is in the wrong place. (Observable: the fix requires moving responsibility between modules, not correcting code within one.)
- **The requirements are wrong or incomplete.** The system behaves as designed, but the design does not match what users need; the "bug" is a product gap. (Observable: the code does exactly what it was written to do — the spec is the problem.)
- **Every fix is a workaround.** The symptom can be patched, but no clean fix can be articulated because the surrounding code was built on an assumption that no longer holds. (Observable: you keep wanting to add special cases or flags rather than a direct correction.)

Do not suggest brainstorm for bugs that are large but have a clear fix — size alone does not make something a design problem.
