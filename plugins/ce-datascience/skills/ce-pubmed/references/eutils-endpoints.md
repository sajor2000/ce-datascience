# NCBI E-Utilities Endpoints

Base: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`

## esearch

`esearch.fcgi?db=pubmed&term=<term>&usehistory=y&retmode=json`

Returns:
- `WebEnv` and `QueryKey` -- pass to efetch / esummary / elink
- `Count` -- total hits
- `IdList` -- first batch of PMIDs (up to retmax)
- `QueryTranslation` -- the actual query NCBI ran (after MeSH expansion)

## efetch

`efetch.fcgi?db=pubmed&WebEnv=<we>&query_key=<qk>&rettype=xml&retmode=xml&retmax=<n>&retstart=<offset>`

Returns MEDLINE XML. Parse `PubmedArticleSet/PubmedArticle/MedlineCitation/Article`.

## esummary

`esummary.fcgi?db=pubmed&id=<comma-separated-pmids>&retmode=json`

Faster than efetch when you only need title/journal/year/authors. Use when total hit count is high and a one-page summary is enough.

## elink

`elink.fcgi?dbfrom=pubmed&db=pmc&id=<pmid>` -- PMC full-text linkage

`elink.fcgi?dbfrom=pubmed&db=pubmed&id=<pmid>&linkname=pubmed_pubmed_citedin` -- "cited by" lookup

## Rate limiting

- Without API key: 3 requests/second max
- With `NCBI_API_KEY` (free): 10 requests/second max
- Always batch: send up to 200 PMIDs per `efetch` call rather than 200 single calls
- Sleep 350 ms between calls if no API key

## Failure handling

- `<ERROR>` element in response → log it, surface to user, do not retry blindly
- HTTP 429 → back off 5 seconds, retry once
- Network error → save partial results to disk, exit with non-zero code so the user can re-run
