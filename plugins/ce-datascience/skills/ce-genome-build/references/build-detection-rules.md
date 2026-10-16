# Build Detection Rules

How to infer genome build from file contents.

## From contig lengths in BAM/VCF headers

Each build has fixed primary chromosome lengths. A few diagnostic ones:

| Contig | GRCh37 length | GRCh38 length | T2T-CHM13 length |
|--------|---------------|---------------|------------------|
| chr1 | 249,250,621 | 248,956,422 | 248,387,328 |
| chr8 | 146,364,022 | 145,138,636 | 146,259,331 |
| chrM / MT | 16,571 (hg19 chrM); 16,569 (b37/GRCh37 MT, rCRS) | 16,569 | 16,569 |

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
- v19, and any `vNNlift37` file (e.g., `gencode.v44lift37`) → GRCh37
- v20+ without `lift37` → GRCh38

Ensembl release → build: read the assembly token in the file name (`GRCh37` or `GRCh38`), not the release number. Releases 76+ default to GRCh38, but the GRCh37 archive (grch37.ensembl.org) ships later-numbered files such as `Homo_sapiens.GRCh37.87.gtf.gz`.

Filename hints:
- `gencode.v44.annotation.gtf.gz` → GENCODE 44 → GRCh38
- `Homo_sapiens.GRCh38.111.gtf.gz` → Ensembl 111 → GRCh38
- `Homo_sapiens.GRCh37.87.gtf.gz` → Ensembl 87 GRCh37 archive → GRCh37

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
2. RNA-seq counts using GENCODE v44 (GRCh38) merged with public TCGA/GDC counts (GENCODE v22 through GDC Data Release 31, v36 from DR32) → different gene sets and gene_id versions → silent gene-by-gene mismatch; differential expression nonsense.
3. ATAC-seq peaks called against `chr1` style; downstream motif analysis tool expects `1` style → empty motif hits, reported as biological signal.

These are common enough that the audit step needs to flag them automatically.
