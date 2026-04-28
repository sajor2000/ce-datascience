---
name: ce-pubmed
description: 'Search PubMed/MEDLINE directly via NCBI E-utilities with MeSH-term expansion, study-type and date filters, and structured result tables. Use when planning a SAP and you need peer-reviewed methods for the proposed study type, when a brainstorm rigor probe asks for prior-art evidence, or when you need PMIDs to feed /ce-method-extract. Distinct from /ce-literature-search (PyPaperBot via Scholar/Crossref/SciHub for PDF retrieval); this skill is biomedical-native, structured, and citation-clean.'
argument-hint: "<query terms>, optional: --years 5 --study-type rct|cohort|case-control|prediction|review --max 50"
---

# PubMed Method Search

Search PubMed/MEDLINE for biomedical literature using NCBI E-utilities. Returns a structured table that downstream skills (`/ce-method-extract`, `/ce-effect-size`) consume.

## When this skill activates

- During `/ce-plan` SAP drafting: "what methods did comparable studies use?"
- During `/ce-ideate` rigor probes: "is there prior art?"
- Manual: `/ce-pubmed sepsis bundle compliance ICU --years 10 --study-type cohort`
- As a precursor to `/ce-method-extract` and `/ce-checklist-match`

## Prerequisites

- Network access (NCBI E-utilities is public, no API key required for < 3 req/sec; recommend `NCBI_API_KEY` env var for higher throughput)
- `python3` with `requests` (stdlib `urllib` fallback acceptable)

## Core workflow

### Step 1: Build the query

Take the user's free-text query and apply MeSH expansion:

1. Run `esearch.fcgi?db=pubmed&term=<query>&usehistory=y&retmode=json` to get a webenv + query_key
2. If `--study-type` is passed, append a publication-type filter:
   - `rct` → `AND ("randomized controlled trial"[Publication Type])`
   - `cohort` → `AND ("cohort studies"[MeSH Terms])`
   - `case-control` → `AND ("case-control studies"[MeSH Terms])`
   - `prediction` → `AND ("prediction"[Title/Abstract] OR "prognostic model"[Title/Abstract])`
   - `review` → `AND ("systematic review"[Publication Type] OR "meta-analysis"[Publication Type])`
3. If `--years N` is passed, append `AND ("last <N> years"[PDat])`
4. Show the user the final query string before running esearch -- transparency about MeSH expansion matters

### Step 2: Fetch results

Run `efetch.fcgi?db=pubmed&WebEnv=<webenv>&query_key=<qk>&rettype=xml&retmax=<max>` (default max 50). Parse MEDLINE XML for each PMID:

| Field | XML path |
|-------|----------|
| `pmid` | PubmedArticle/MedlineCitation/PMID |
| `title` | ArticleTitle |
| `journal` | Journal/Title |
| `year` | Article/Journal/JournalIssue/PubDate/Year |
| `authors` | AuthorList/Author (last + initials, first 3 + et al) |
| `study_type` | PublicationTypeList/PublicationType |
| `mesh_terms` | MeshHeadingList/MeshHeading/DescriptorName |
| `abstract` | Abstract/AbstractText |
| `doi` | ArticleIdList/ArticleId[@IdType="doi"] |
| `pmcid` | ArticleIdList/ArticleId[@IdType="pmc"] (presence indicates free full-text) |

### Step 3: Write structured output

Save the results to `analysis/pubmed/<query-slug>-<YYYYMMDD>.csv` with columns:

`pmid,year,journal,study_type,title,first_author,doi,pmcid,abstract,mesh_terms,query_used`

Also write `analysis/pubmed/<query-slug>-<YYYYMMDD>.md` -- a one-page summary the user can read: top 10 results by year-and-journal-impact heuristic (newer + higher journal-of-medicine score), MeSH terms histogram, study-type histogram, "% with full-text PMC" line.

### Step 4: Emit signal for downstream skills

Print `__CE_PUBMED_RESULTS__ csv=<path> n=<count> query=<query>` so `/ce-method-extract` can pick it up.

## What this skill does NOT do

- Does not download PDFs (use `/ce-literature-search` for that)
- Does not extract methods (use `/ce-method-extract` next)
- Does not do meta-analysis pooling (use `/ce-effect-size`)
- Does not match the study to a reporting checklist (use `/ce-checklist-match`)

## References

@./references/mesh-expansion.md

@./references/eutils-endpoints.md
