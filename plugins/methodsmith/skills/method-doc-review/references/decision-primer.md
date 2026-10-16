# Decision Primer (Round 2+)

Read this when a second or later review round runs on the same document in the current interactive session. Round 1 uses the literal block in SKILL.md.

## Format

Accumulate prior-round decisions and render them as the `{decision_primer}` slot:

```
<prior-decisions>
Round 1 — applied (N entries):
- {section}: "{title}" ({reviewer}, {confidence})
  Evidence: "{evidence_snippet}"

Round 1 — rejected (M entries):
- {section}: "{title}" — Skipped because {reason}
  Evidence: "{evidence_snippet}"
- {section}: "{title}" — Deferred to Open Questions because {reason or "no reason provided"}
  Evidence: "{evidence_snippet}"
- {section}: "{title}" — Acknowledged without applying because {reason or "no suggested_fix — user acknowledged"}
  Evidence: "{evidence_snippet}"

Round 2 — applied (N entries):
...
</prior-decisions>
```

## Rules

- **Evidence line is required on every entry.** Synthesis R29 (rejected-finding suppression) and R30 (fix-landed verification) in `references/presentation.md` match on an evidence-substring overlap (>50%); without the snippet they fall back to fingerprint-only matching, which re-surfaces rejected findings or over-suppresses.
- **`{evidence_snippet}`** is the finding's first evidence quote, truncated to about 120 characters at a whole-word boundary, with internal quotes escaped. Other evidence entries stay in the run artifact.
- **Accumulate across all rounds in the current session.** Skip, Defer, and Acknowledge all count as "rejected" for suppression (Acknowledge is the no-fix variant, equivalent to Skip). Applied findings stay on the applied list so later-round personas can verify fixes landed.
- **No cross-session persistence.** A new invocation on the same document starts at round 1 with no carried primer, even if prior sessions deferred findings into the document's Open Questions section.
