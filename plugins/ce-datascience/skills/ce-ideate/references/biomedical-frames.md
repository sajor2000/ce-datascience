# Biomedical Research Question Frames

Loaded by `/ce-ideate` Phase 2 when Decision 0 routes the run to biomedical-research mode. Replaces the six software frames (pain/inversion, leverage, analogy, etc.) with six frames calibrated for clinical and biostatistical research questions. Phase 1 grounding (codebase scan or user context, learnings, web research) still runs unchanged.

The job of these frames is to land on a research question that has a defensible PICO, a feasibility-checked sample size, a clear analytic hypothesis, a chosen reporting checklist, and a known prior-art landscape — not on an engineering idea. The downstream skill `/ce-research-question` will harden whichever survivor the user picks into a structured `analysis/research-question.yaml`; ideation just produces the survivor candidates.

## Frames

Dispatch one parallel sub-agent per frame, default 6 ideas per agent.

### Frame 1 — PICO decomposition

For each candidate research question, attempt a clean PICO (Population, Intervention/Exposure, Comparator, Outcome). Surface candidates where the PICO sharpens an existing fuzzy framing into something testable.

- Bias: `direct:` warrant from prior literature when present in the grounding summary; `reasoned:` warrant when the candidate is novel.
- Failure mode to avoid: questions that look testable but have no defined comparator (a study with no comparator is descriptive, not inferential — surface it as descriptive explicitly, not as a hypothesis test).

### Frame 2 — FINER scoring

Score each candidate on: **F**easible (cohort size, data access, time horizon), **I**nteresting (does the field care?), **N**ovel (does the literature already answer it?), **E**thical (equipoise, IRB-able, consent feasible), **R**elevant (will the answer change practice?).

- Bias: `external:` warrant — explicitly cite the prior art the grounding summary returned.
- Surface candidates that score 4-5 on all five. Mention candidates that fail one criterion (commonly novelty or feasibility) so the user can see what would have to change to make them viable.

### Frame 3 — Equipoise and clinical-relevance check

Generate candidates that survive equipoise — the field is genuinely uncertain about the answer. For interventional / causal questions, this is mandatory. For prediction / association questions, equipoise translates to: would clinicians act differently if the answer turned out one way vs the other?

- Bias: `reasoned:` warrant tied to the practice-change argument.
- Failure mode to avoid: questions whose answer is already known (replication studies are valuable but should be labeled as replication, not novel investigation).

### Frame 4 — Target trial emulation reframing

For observational data, generate candidates as the trial you would run if it were possible — a target trial, with eligibility, treatment strategies, assignment procedures, follow-up, and outcome. The `/ce-checklist-match` skill will later route candidates that surface here to the TARGET checklist.

- Bias: `reasoned:` plus `external:` (Hernán & Robins target-trial framework).
- Surface candidates where the observational design is a credible emulation, and explicitly flag candidates where it is not (e.g., self-selection into the exposure that no IPTW could plausibly correct).

### Frame 5 — Reporting-checklist anchoring

For each candidate, name the reporting checklist it would be written against (CONSORT, STROBE, RECORD, RECORD-PE, TRIPOD+AI, CLAIM, STARD, PRISMA, TARGET, etc.). Candidates whose nature does not map cleanly to any checklist are warning signs — either the design is exotic or the candidate is under-specified.

- Bias: `external:` warrant — cite the EQUATOR network entry.
- The checklist anchor produced here is a hint to `/ce-checklist-match`; the routing decision still happens in that skill.

### Frame 6 — Prior-art landscape

Generate candidates by mapping the literature landscape (use the web-research grounding summary plus any `/ce-pubmed` results in chat context). Surface gaps: what has been studied 50 times in adults but not children? What has been done in claims data but not EHR? What has been validated in one health system but never multi-site?

- Bias: `external:` warrant explicit — every candidate cites at least one paper or class of papers it is differentiated from.
- Failure mode to avoid: gap-spotting that is just absence-of-publication; the gap has to be a *clinically meaningful* gap.

## Per-idea output contract (overrides the default contract)

Each sub-agent returns:

- **title** — a one-line research question
- **pico** — `{population, intervention_or_exposure, comparator, outcome}` filled to whatever depth is possible; comparator may be `null` for descriptive
- **finer** — `{F: 1-5, I: 1-5, N: 1-5, E: 1-5, R: 1-5}` plus a one-line rationale
- **equipoise_or_relevance** — for interventional candidates, an explicit equipoise statement; for prediction/association candidates, a clinical-relevance / would-clinicians-act-differently statement
- **suggested_design** — RCT, cohort (prospective / retrospective), case-control, prediction model (development / external validation / impact), diagnostic accuracy, target-trial emulation, etc.
- **suggested_checklist** — primary checklist plus any AI / specialty extensions
- **prior_art_anchor** — at least one PMID, journal, or class of papers it differentiates from
- **why_it_matters** — one paragraph
- **meeting_test** — one line confirming this is worth team discussion

Warrant is implicit in `prior_art_anchor` (external) and `equipoise_or_relevance` (reasoned). Candidates missing either field do not surface.

## Phase 6 menu (overrides the software wrap-up)

After survivors are presented, the wrap-up menu offers:

1. **Pick one and run `/ce-research-question` on it** (recommended) — hardens the survivor into `analysis/research-question.yaml` with a tested PubMed query, full PICO, and reporting-checklist routing input.
2. **Pick one and go straight to `/ce-pubmed`** — when the user already has a tight enough framing and just wants a literature search.
3. **Save the survivor list and end** — defer everything.
4. **Refine** — re-run ideation with sharper focus.

Do not present software-mode options (Open in Proof, Brainstorm, etc.) — the biomedical lifecycle is the loop these candidates are entering, not a software requirements doc.
