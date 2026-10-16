# 03: Traceable Word numbers with editable Zotero fields preserved

**What to build:** A Word author uses the same number placeholders and registry.
Rendering and checking cover the declared DOCX text parts, retain formatting and
editable Zotero fields, and reject tampered or unsupported numeric content.

**Blocked by:** 02: Registry-backed publication workflows and blocking submission
checks, for the requested linear PR stack. The numeric runtime also depends on 01.

**Status:** implemented in the combined PR stack; see the parent completion note for final validation.

**Parent plan:** ../2026-10-16-number-registry-plan.md

## Acceptance criteria

- [ ] A DOCX body paragraph renders a registry placeholder with the expected text
      and retains a verifiable occurrence-to-registry chain.
- [ ] A placeholder split across runs renders correctly without flattening the
      paragraph, losing style information, or swallowing unrelated content.
- [ ] Table cells use the same gate and coverage contract.
- [ ] Supported additional text-bearing parts are declared and checked; unsupported
      parts with numeric content block rather than disappear from coverage.
- [ ] Agree the treatment of headers, footers, footnotes, endnotes, text boxes and
      tracked changes before claiming whole-document coverage.
- [ ] Existing Zotero field instructions, relationships and bibliography structures
      are preserved. Rendered text never masquerades as an editable citation field.
- [ ] Unknown placeholders, stale sources, manually typed matching values, edited
      rendered results, malformed DOCX and zero coverage all fail closed.
- [ ] A failed render preserves the original master and leaves no misleading output.
- [ ] Package, audit and verification report the DOCX gate result consistently.
- [ ] Text-format regression contracts remain green alongside the DOCX behavior.
- [ ] Tests use synthetic DOCX archives with known expected text and real field XML;
      application-level Word behavior is separately checked or explicitly unverified.

## Test-first slices

1. One paragraph and one registry entry through the public DOCX render/check API.
2. Split-run placeholder and table cell preservation.
3. Declared additional parts and explicit rejection of unsupported structures.
4. Zotero field-bearing master preservation.
5. Output tampering and failure propagation through publication workflows.

## Delivery rules

Use synthetic fixtures only. Keep all installation checks in a disposable home and
temporary target roots; never touch real agent configuration directories. Record
one failing behavioral test followed by the passing implementation for each slice.
Use the public interfaces approved in the parent plan. Run affected deterministic
tests and repository validation. Skill behavior changes also require fresh-context
skill-creator evaluations under the repository rules.
