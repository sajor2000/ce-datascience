# Issue-Tracker Mode (Repo Only)

Read this when Phase 0.2 flags issue-tracker intent.

## Cost notice

Add 1 agent for issue intelligence. Compact mode still caps ideation at 3; wide mode caps issue-theme ideation at 4.

## Phase 1 dispatch

Dispatch `method-issue-intelligence-analyst` with the focus hint, in parallel with the other grounding agents.

- On error (gh not installed, no remote, auth failure): warn "Issue analysis unavailable: {reason}. Proceeding with standard ideation." and continue with the remaining grounding.
- Fewer than 5 total issues: note "Insufficient issue signal for theme analysis" and use the default frames in Phase 2.
- Add an **Issue intelligence** section to the grounding summary: theme titles, descriptions, issue counts, and trend directions.

## Phase 2 frame override

When usable themes return, each high/medium-confidence theme becomes a frame. Pad from the default frame pool, in listed order, when fewer than 3 theme-derived frames exist. Compact mode caps the set at 3; explicit wide mode caps it at 4.
