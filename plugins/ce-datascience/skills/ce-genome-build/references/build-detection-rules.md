# Build Detection Rules

How to infer genome build from file contents.

## From contig lengths in BAM/VCF headers

Each build has fixed primary chromosome lengths. A few diagnostic ones:

| Contig | GRCh37 length | GRCh38 length | T2T-CHM13 length |
|--------|---------------|---------------|------------------|
| chr1 | 249,250,621 | 248,956,422 | 248,387,328 |
| chr8 | 146,364,022 | 145,138,636 | 146,259,331 |
| chrM | 16,571 | 16,569 | 16,569 |

In `samtools view -H file.bam`:

```
@SQ SN:chr1 LN:248956422   -> GRCh38 (or GRCh38.p14 if alt contigs match)
@SQ SN:chr1 LN:249250621   -> GRCh37 / hg19
@SQ SN:chr1 LN:248387328   -> T2T-CHM13
```

## From contig naming

| Style | Convention |
|-------|-----------|
| UCSC | `chr1`, `chr2`, ..., `chrX`, `chrY`, `chrM` |
| Ensembl/NCBI | `1`, `2`, ..., `X`, `Y`, `MT` |

Same build, different naming. Tools that expect one and get the other silently produce empty output (e.g., bedtools intersect). Always normalize before tool boundaries.

## From annotation files

GENCODE (human):
- v19 → GRCh37
- v44, v45, v46 → GRCh38

Ensembl release → build:
- 75 (final GRCh37 release) and lower → GRCh37
- 76+ → GRCh38

Filename hints:
- `gencode.v44.annotation.gtf.gz` → GENCODE 44 → GRCh38
- `Homo_sapiens.GRCh38.111.gtf.gz` → Ensembl 111 → GRCh38

## From RNA-seq counts files

Gene IDs:
- `ENSG00000XXXXXX` → Ensembl/GENCODE; check version separately
- `ENSG00000XXXXXX.NN` → Ensembl/GENCODE with version suffix; the `.NN` is the gene-version in that release

Symbol-only files (`HGNC` symbols) lose build/version info; flag as P1 -- adds risk because gene symbols change.

## From VCF

```
##reference=file:///path/to/GRCh38.fa     -> declared
##contig=<ID=chr1,length=248956422,assembly=GRCh38>   -> declared
```

If neither present: infer from `##contig` lengths.

## Mismatch examples (real)

1. BAM with `@SQ SN:chr1 LN:248956422` (GRCh38) fed to a variant annotator pre-loaded with GRCh37 cache → all annotations wrong; published as ground truth.
2. RNA-seq counts using GENCODE v44 (GRCh38) merged with public TCGA counts (GENCODE v22; older GRCh38 patch with different gene_id versions) → silent gene-by-gene mismatch; differential expression nonsense.
3. ATAC-seq peaks called against `chr1` style; downstream motif analysis tool expects `1` style → empty motif hits, reported as biological signal.

These are common enough that the audit step needs to flag them automatically.
