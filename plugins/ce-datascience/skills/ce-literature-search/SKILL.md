---
name: ce-literature-search
description: 'Search and download scientific papers via Google Scholar, Crossref, and SciHub using PyPaperBot. Use when evidence is needed for study design, SAP method sections cite prior work, brainstorm rigor probes identify evidence gaps, or the user asks to find papers on a topic.'
argument-hint: "[research query, PICO/PECO question, or DOI list]"
---

# Literature Search for Computational Science

Search, download, and summarize scientific literature to support evidence-based study design and analysis planning. Integrates with the compound engineering workflow so that brainstorm, plan, and review phases can cite relevant prior work.

**Note: The current year is 2026.** Use this when dating search filters.

## Prerequisites

PyPaperBot must be installed. Check availability:

```bash
python3 -m PyPaperBot --help 2>/dev/null && echo "AVAILABLE" || echo "NOT_FOUND"
```

If not found, install:

```bash
pip install PyPaperBot
```

Do not install automatically — prompt the user and let them confirm.

## When This Skill Activates

- User explicitly asks to search for papers or literature
- `/ce-brainstorm` rigor probe identifies an evidence gap (no prior studies cited for a proposed method)
- `/ce-plan` SAP mode needs citations for SAP-C (Literature/Precedent) sections
- User provides DOIs to look up
- User says "find papers about X" or "what does the literature say about Y"

## Core Workflow

### Step 1: Parse the Query

Determine search type from the argument hint:

| Input | Search Mode | PyPaperBot Flags |
|-------|------------|-----------------|
| Research question or keywords | Query search | `--query="..." --scholar-pages=N` |
| Single DOI | DOI lookup | `--doi=10.XXXX/...` |
| File with DOIs (one per line) | Batch DOI | `--doi-file=path.txt` |
| Google Scholar URL | Scholar link | Direct URL parsing |

For PICO/PECO framed questions, extract the core search terms (Population + Intervention/Exposure + Comparison + Outcome) and construct a focused query.

### Step 2: Configure Search Parameters

Read the search config template for defaults: `references/search-config-template.yaml`

Apply filters from the query context:
- **Year range**: default `min-year` from config, or from user's request
- **Citation threshold**: `--max-citations=N` for highly-cited papers first
- **Journal filter**: if user provides a CSV allowlist, pass `--journal-filter=path.csv`
- **Skip words**: extract negation terms from query (e.g., "NOT review" -> `--skip-words="review"`)
- **Download mode**: default to BibTeX + PDF (`--dwnl-method=2`)

### Step 3: Execute Search

Run PyPaperBot via the wrapper script:

```bash
python3 scripts/literature-search.py --query="QUERY" --scholar-pages=PAGES --min-year=YEAR --output-dir=DIR
```

Or for DOI-based lookup:

```bash
python3 scripts/literature-search.py --doi=DOI --output-dir=DIR
```

The output directory defaults to `/tmp/ce-datascience/ce-literature-search/<run-id>/` for cross-invocation reuse, or a user-specified path.

### Step 4: Summarize Results

After download completes, produce a structured literature summary. Read the template: `references/literature-summary-template.md`

Generate a markdown table with columns:
| Title | Authors | Year | Journal | DOI | Citations | Relevance |

Rank by relevance to the original query. For each paper, include a 1-2 sentence relevance note explaining how it connects to the study design question.

### Step 5: Route to Workflow

Offer next-step routing based on the calling context:

**If triggered from `/ce-brainstorm`:**
- Ask: "Cite these papers in the requirements doc?" If yes, insert key citations into the brainstorm artifact's evidence section.

**If triggered from `/ce-plan` SAP mode:**
- Auto-suggest: map relevant papers to SAP-C (Literature/Precedent) sections. Provide DOI and citation text for each mapped paper.

**If standalone:**
- Ask: "Next step?" Options:
  - "Plan analysis with these citations" -> route to `/ce-plan`
  - "Review paper methods" -> route to `/ce-code-review` with methods-review focus
  - "Save and return" -> write summary to user-specified path

## Search Config

The search config template at `references/search-config-template.yaml` defines:

```yaml
sources:
  scholar: true
  crossref: true
  scihub: true
  scidb: true
defaults:
  scholar_pages: 3
  min_year: 2018
  dwnl_method: 2  # 0=BibTeX only, 1=PDF only, 2=both
  max_citations: null
  doi_filename: false
filters:
  journal_filter_path: null
  skip_words: null
chrome:
  chrome_version: null  # First 3 digits if available, avoids bot detection
```

Override defaults based on user context. For systematic reviews, increase `scholar_pages` to 10+ and set `min_year` to cover the review period.

## Error Handling

| Error | Response |
|-------|---------|
| PyPaperBot not installed | Prompt user to `pip install PyPaperBot` |
| Scholar rate-limited (HTTP 429) | Suggest: set `--chrome-version` flag with Chrome installed, or reduce page count |
| No papers found | Broaden query terms, remove skip-words, extend year range |
| PDF download fails for specific paper | Report which papers failed, offer BibTeX-only fallback |
| SciHub mirror unavailable | Auto-select mirror, or pass `--scihub-mirror=URL` |

## Output Artifacts

1. **Literature summary** (markdown) — structured table of found papers with metadata and relevance notes
2. **BibTeX file** — `references.bib` in output directory for citation management
3. **PDFs** — downloaded papers in output directory (when available)
4. **Search log** — query, filters, and results count for reproducibility

All artifacts go in the output directory. The literature summary is the primary artifact for workflow integration.

## Integration Points

### ce-brainstorm

When brainstorm's rigor probes detect that no prior studies support a proposed method, suggest running `/ce-literature-search` with the relevant PICO/PECO terms. The brainstorm requirements doc gains an "Evidence Base" section citing the search results.

### ce-plan (SAP mode)

In SAP-C (Literature/Precedent) sections, cite relevant papers found by this skill. Include DOI, year, and a one-line summary of what the prior study found and how it informs the current SAP.

### ce-compound

New `literature_pattern` problem_type for compounding search strategies: effective query formulations, source-specific coverage patterns, and filter combinations that produce high-relevance results for specific domains.

## Constraints

- Do not download papers the user already has (check before re-downloading)
- Do not store papers in the repo directory — use `/tmp/ce-datascience/` or a user-specified path
- Respect copyright: note that SciHub-sourced PDFs may not be legally available in all jurisdictions; the skill provides the tool but the user is responsible for compliance
- Keep search queries under Google Scholar's practical limits (~100 results per session before rate-limiting)
