---
name: ce-genome-build
description: 'Record the genome build (GRCh37/GRCh38/T2T) and annotation version (GENCODE/Ensembl) used for every output in a bioinformatics study. Generates a build-manifest YAML, a per-output traceability table, and a build-consistency check that flags any cross-build mixing (BAM aligned to GRCh38 fed to a tool calling against GRCh37). Use at the start of any bioinformatics study and re-run when references change. Genome-build mismatches are a top cause of bioinformatics retractions.'
argument-hint: "[--ref-fasta path, --annotation-gtf path, --check]"
---

# Genome Build Traceability

Pins the reference genome and annotation versions used in a bioinformatics study, and audits every output for build consistency. Without this, a paper claiming "we used GRCh38" can have outputs silently aligned to GRCh37 because a single tool defaulted to its bundled reference.

## When this skill activates

- Start of a new bioinformatics study (declare the build)
- After a reference update (re-declare and audit)
- Manual: `/ce-genome-build --check` to audit; `/ce-genome-build --ref-fasta refs/GRCh38.fa --annotation-gtf refs/gencode.v44.gtf` to declare

## Prerequisites

- Reference FASTA file (or path to a reference manifest if using shared references)
- Annotation file (GTF / GFF / BED)
- Tools to inspect BAM headers: `samtools view -H`
- Tools to inspect VCF headers: `bcftools view -h`

## Core workflow

### Step 1: Declare the build (--declare mode)

Hash the reference FASTA, parse its first contig name, look up the build:

```yaml
genome_build:
  build: GRCh38
  patch: GRCh38.p14
  source: https://ftp.ensembl.org/pub/release-111/fasta/homo_sapiens/dna/
  fasta_md5: <md5 of unzipped FASTA>
  contigs:
    primary: ["chr1", "chr2", ..., "chrX", "chrY", "chrM"]
    alt_count: 261
  annotation:
    name: GENCODE
    version: 44
    source_url: https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_44/gencode.v44.annotation.gtf.gz
    md5: <md5>
    gene_count: 60660
    transcript_count: 251514
declared_at: <ISO8601>
declared_by: <user>
```

Write to `analysis/genome-build/manifest.yaml`. Commit this; it is the build-truth for the study.

### Step 2: Audit mode (--check)

Walk the project for build artifacts:

| Artifact | Inspect | Expect |
|----------|---------|--------|
| BAM / CRAM | `@SQ` lines (reference contig names + LN lengths) | Match manifest contigs and lengths |
| BAM / CRAM | `@PG` lines | Tool used to align, version |
| VCF | `##contig=<ID=...,length=...,assembly=...>` | Match manifest |
| VCF | `##reference=` | URL or path matches manifest source |
| BED / Interval list | First contig name format (chr1 vs 1) | Consistent with manifest contig style |
| Counts matrix (RNA-seq) | rownames or `gene_id` column format | Match annotation gene_ids (e.g., ENSG00000... if Ensembl) |
| Variant call output | `INFO/CSQ` annotation source if VEP | VEP cache version matches manifest |

For each file, determine its build (often inferable from contig naming + checksums). Flag mismatches:

- **P0:** Different build between BAM and VCF (alignment in GRCh38, called against GRCh37 reference)
- **P0:** Annotation version drift (Counts matrix uses GENCODE 36 but manifest says GENCODE 44)
- **P1:** Contig naming inconsistency (chr1 vs 1) -- usually fixable but breaks tools
- **P1:** Tool version not recorded in `@PG` lines

### Step 3: Per-output traceability table

Produce `analysis/genome-build/traceability.csv`:

| output_file | build | annotation | tool | tool_version | match_manifest |
|-------------|-------|------------|------|--------------|----------------|
| variants/cohort.vcf.gz | GRCh38 | -- | GATK | 4.5.0 | yes |
| counts/gene-counts.tsv | -- | GENCODE 44 | featureCounts | 2.0.6 | yes |
| methylation/beta.csv | -- | EPIC v1 | sesame | 1.20 | yes |

This table goes into the manuscript as a supplementary file -- it answers "what build did you use?" verifiably.

### Step 4: Surface mismatches

If `--check` found any P0 → exit non-zero, print a clear report. The user resolves before proceeding.

## What this skill does NOT do

- Does not re-align or re-call (that's a pipeline run)
- Does not download references (user supplies paths)
- Does not validate reference correctness against external truth -- only internal consistency

## References

@./references/build-detection-rules.md
