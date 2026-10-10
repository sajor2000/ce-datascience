---
name: ce-checklist-match
description: "Select reporting guidelines before SAP writing. Routes studies to CONSORT, STROBE, RECORD, PRISMA, TRIPOD+AI, CLAIM, STARD, and related extensions. Use when the user asks which checklist applies, mentions EQUATOR/reporting standards, or starts a study without a guideline."
argument-hint: "[study description, optional --interactive]"
---

# Reporting Checklist Match


## Skill Value

- **Problem it solves:** Reporting requirements are often discovered too late, after the SAP or manuscript misses required design-specific items.
- **Use when:** The user asks which checklist applies, mentions EQUATOR/reporting standards, or starts a study without a guideline.
- **Output:** Canonical stack-profile fields for primary reporting_checklist and reporting_checklist_extensions, resolved through the evidence-backed guideline registry.
- **Ask only if:** Only for routing facts that cannot be inferred from the research question, design, data source, or existing profile.
- **Do not do:** Do not score a finished manuscript; reporting-checklist review happens during code/document review.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Picks the right reporting checklist(s) at PLAN time so the SAP is written against them, not corrected after the fact. Distinct from `ce-reporting-checklist-reviewer` which validates AT REVIEW time -- this skill makes the upfront choice.

## When this skill activates

- During `ce-ideate` after the study premise is solidified
- During `ce-plan` BEFORE drafting the SAP
- Whenever the user asks "which checklist do I follow?"
- When `stack_profile.reporting_checklist` is empty AND a SAP exists

## Prerequisites

- A one-line study description (or `ce-ideate` output)
- Stack profile exists (the user has run the `ce-setup` command; if not, ask them to, or infer the stack from the repository and confirm)

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** the target journal's required checklist (journal author guidelines via web search, URL kept) and the current version of each selected guideline: confirm the statement citation by PMID with the metadata tool before it is written into the `analysis/checklists/` placeholder. The guideline registry's citations themselves are owned by `ce-code-review`.

## Core workflow

### Step 0: Context inputs (scan chat first)

Before asking routing questions, scan the most recent ~50 chat turns for `__CE_RESEARCH_QUESTION__ yaml=<path> design=<...> checklist=<...>`. If found, read the YAML and pre-fill these routing answers from the structured fields, then ask only the questions still unanswered:

| Routing question | Pre-fill from YAML field |
|---|---|
| Design | `suggested_design` (cohort / case-control / RCT / prediction model / target trial / etc.) |
| Direction (prospective / retrospective) | infer from `pico.population` time frame |
| AI involvement | infer from `pico.intervention_or_exposure` and `suggested_design` |
| Population | `pico.population` |

Pre-fills are starting points, not answers — the model must surface them and let the user override before writing to stack profile. Example:

```
[research-question] pre-filled from analysis/research-question.yaml:
  design: cohort_retrospective
  ai_involvement: none                         # none | ai-assisted | ai-primary | llm-based
  population: human
  primary checklist (suggested): STROBE
  extensions (suggested): RECORD
Confirm or correct any of these? (or say "go" to accept all)
```

When `__CE_RESEARCH_QUESTION__` is absent, fall through to step 1 and ask all questions.

**CLIF profile**: when chat context contains `__CE_CLIF__ active=true`, pre-fill `data_source = EHR (CLIF)` and bias the routing toward:

- Observational cohort → STROBE + RECORD (always; CLIF is EHR-derived).
- Prediction model → TRIPOD+AI.
- Target trial emulation → TARGET as primary, with STROBE + RECORD as companions (CLIF is EHR-derived).
- RCT using CLIF for outcome ascertainment → CONSORT (and RECORD if outcomes are EHR-defined).

Surface these defaults to the user and let them override before writing to stack profile.

### Step 1: Ask the routing questions

If `--interactive` or the study description is too sparse, ask 4-6 questions one at a time:

1. **Design**: RCT / observational cohort / case-control / cross-sectional / qualitative / systematic review / meta-analysis / case report / animal study / economic evaluation / diagnostic accuracy / prediction model
2. **Direction** (if observational): prospective / retrospective
3. **Aim**: causal / descriptive / predictive / qualitative-exploratory / mixed
4. **AI involvement** (canonical `ai_involvement` values shared with `ce-code-review` and `ce-plan`): `none` / `ai-assisted` (AI as a tool within traditional methods, e.g., data cleaning or a classifier in the pipeline) / `ai-primary` (the AI model is the primary analytical approach or the object being evaluated) / `llm-based` (the study uses or evaluates a large language model). Older answers map as: none -> `none`; data-cleaning only -> `ai-assisted`; model-as-tool -> `ai-assisted`; model-as-study-object -> `ai-primary`, or `llm-based` when the model under study is an LLM. Write only the canonical values.
5. **Pre-registration**: planned / not planned / already done
6. **Population**: human / animal / cell / in-silico

If the description already answers some of these, skip those questions. When a target journal is known, look up its author guidelines by web search for a mandated checklist and record the URL; never ask the user to recall it.

### Step 2: Apply the routing rules

Use `references/routing-map.md` to map answers to a checklist set. Apply only evidence-backed entries and preserve provisional or unverified status instead of presenting it as authoritative.

| Design | Direction | Aim | AI | Primary checklist | Extensions |
|--------|-----------|-----|----|-----|------|
| RCT | n/a | causal | none | CONSORT | -- (SPIRIT protocols are not in the registry) |
| RCT | n/a | causal | ai-primary / llm-based (AI is the intervention) | CONSORT | CONSORT-AI; SPIRIT-AI (protocol stage) |
| Observational cohort | prospective | causal | none | STROBE | RECORD if EHR/claims/registry |
| Observational cohort | retrospective | causal | none | STROBE | RECORD if EHR/claims/registry; RECORD-PE if claims pharmacoepidemiology |
| Target trial emulation | n/a | causal | none | TARGET | STROBE (always, companion); RECORD if EHR/claims/registry |
| Case-control | n/a | causal | none | STROBE | RECORD if EHR/claims/registry |
| Cross-sectional | n/a | descriptive | none | STROBE | RECORD if EHR/claims/registry |
| Prediction model | n/a | predictive | ai-assisted / ai-primary / llm-based | TRIPOD+AI | REFORMS if ai-primary / llm-based (ML-based science); CHARMS (appraisal) only for systematic reviews of prediction models |
| Prediction model | n/a | predictive | none | TRIPOD | CHARMS (appraisal) only for systematic reviews of prediction models |
| Diagnostic accuracy | n/a | n/a | none | STARD | QUADAS-2 (appraisal) only for systematic reviews |
| Diagnostic accuracy | n/a | n/a | AI index test | STARD | STARD-AI; + CLAIM if imaging |
| Imaging study | n/a | n/a | AI index test or model | STARD or TRIPOD+AI (by aim) | CLAIM; + STARD-AI if diagnostic accuracy |
| Qualitative | n/a | exploratory | n/a | COREQ | -- (SRQR is not in the registry) |
| Mixed methods | n/a | mixed | n/a | Quantitative strand's primary (route it through this table) | GRAMMS (provisional; never primary) |
| Quality improvement | n/a | n/a | n/a | SQUIRE 2.0 | -- |
| Animal | n/a | n/a | n/a | ARRIVE | -- |
| Systematic review | n/a | n/a | n/a | PRISMA | PRISMA-DTA / PRISMA-NMA |
| Case report | n/a | descriptive | n/a | CARE | -- |
| Economic evaluation | n/a | n/a | n/a | CHEERS | -- |
| ML-based science (AI prediction model) | n/a | predictive | ai-primary / llm-based | TRIPOD+AI (or the design's primary if not a prediction model) | REFORMS |
| Chatbot health advice (generative AI) | n/a | n/a | llm-based | CHART | Ask before applying any provisional or unverified domain tool |

If the answers don't fit a row, ask a clarifying question rather than guessing.

### Step 3: Write the selection to stack profile

Resolve the repository root with `git rev-parse --show-toplevel` and update `<repo-root>/.ce-datascience/config.local.yaml`; never write relative to the current subdirectory. The shape that `ce-code-review` and `ce-plan` read is the canonical surface — keep these field names exact:

```yaml
stack_profile:
  # existing fields unchanged
  study_type: cohort_retrospective
  ai_involvement: none                         # none | ai-assisted | ai-primary | llm-based
  reporting_checklist: STROBE                  # canonical primary; non-null string turns on ce-reporting-checklist-reviewer
  reporting_checklist_extensions:              # zero or more strings
    - RECORD
```

If a legacy `guidelines_selected` block already exists, leave it in place for compatibility unless the user asks to clean the config. Do not create that legacy block for new configs.

The string form (`reporting_checklist: STROBE`) is what `ce-code-review` Stage 3 conditional dispatches on and what `ce-plan` SAP frontmatter reads from. Never write the old boolean form because it was ambiguous (which checklist?) and is deprecated.

### Step 4: Drop the checklist into the project

For each selected guideline, write a placeholder file at `analysis/checklists/<guideline>.md` containing the checklist items as a fillable table. Head it with the guideline statement's citation (PMID/DOI confirmed with the metadata tool) and the version, taken from the matching `references/checklist-snippets/` file when one exists. For a guideline without a snippet, write the confirmed citation and an empty table to be filled from the published checklist; never invent items. The user (or `ce-work`) fills these as the SAP and analysis develop.

### Step 5: Emit signal for downstream skills

Print one line so `ce-plan` SAP mode and `ce-code-review` Stage 3 can pick the selection up from chat context:

```
__CE_CHECKLIST__ primary=STROBE extensions=[RECORD]
```

The bracket-list form mirrors how `ce-plan` parses signals in its SAP-Phase 3 step 2 lookup table.

## What this skill does NOT do

- Does not validate against the checklist (dispatch the `ce-reporting-checklist-reviewer` agent at review time)
- Does not write the SAP (use the `ce-plan` skill)
- Does not pre-register (use the `ce-prereg` skill)
- Does not explain WHY a checklist was missed -- just which one applies; the validating reviewer handles compliance scoring

## References

@./references/routing-map.md

@./references/checklist-snippets/
