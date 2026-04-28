---
name: ce-bioinfo-qc
description: 'Run sequencing and omics data quality assessment before any downstream analysis. Wraps FastQC / MultiQC / per-sample genotype concordance / batch-effect screen (PCA + ComBat candidate flag) into a single QC gate. Produces a GO/NO-GO report parallel to /ce-data-qa but for FASTQ, BAM, count matrices, methylation arrays, and other omics inputs. Use whenever a bioinformatics data wave is registered, before running differential analysis or model training.'
argument-hint: "<data dir or sample sheet>, optional: --modality wgs|wes|rnaseq|chipseq|methyl|atac|microarray"
---

# Bioinformatics Data QA Gate

The omics counterpart to `/ce-data-qa`. Sequencing and array data fail in domain-specific ways (low base quality, adapter contamination, sample swaps, batch confounds with condition); this skill runs the right QC for the modality.

## When this skill activates

- A new sequencing run / array batch was just registered as a data wave
- Before differential expression / variant calling / methylation analysis
- After a re-sequence following a sample-quality-fail
- Before sharing data to a collaborator (sanity check)
- Manual: `/ce-bioinfo-qc /data/runs/run_2025_04 --modality rnaseq`

## Prerequisites

- A sample sheet (CSV/TSV) listing samples, files, and at minimum a `condition` and `batch` column
- Tools available locally OR via Conda: `fastqc`, `multiqc`, `samtools`, `picard`, `mosdepth`, `somalier` (sample swap), `picard CrosscheckFingerprints`
- For methylation: `minfi` / `sesame` (R)
- For RNA-seq: `salmon` or `STAR` outputs (or raw FASTQ)

## Core workflow

### Step 1: Modality detection

If `--modality` not passed, sniff the file extensions and tool outputs:
- `*.fastq.gz` only → fastq stage
- `*.bam` / `*.cram` → alignment stage
- counts matrix (`counts.tsv`, `salmon.sf`) → quantification stage
- `.idat` / `_Methylation_*.csv` → methylation array
- VCF → variant calling stage

Different modality → different checks. Refuse to proceed if conflicting signals (mixed FASTQ + count matrix without explicit modality).

### Step 2: Run modality-specific checks

| Modality | Tool | Check |
|----------|------|-------|
| FASTQ (any) | FastQC | per-base quality, adapter content, GC distribution, kmer content |
| FASTQ (any) | MultiQC | aggregate report; sample-to-sample outliers |
| BAM (WGS/WES) | samtools flagstat | mapping rate, duplicate rate, paired-properly rate |
| BAM (WGS/WES) | mosdepth | coverage uniformity, mean depth, % on-target |
| BAM (RNA-seq) | RSeQC / Picard CollectRnaSeqMetrics | strand specificity, intronic/intergenic % |
| BAM (any) | somalier extract + relate | sample swap detection (genotype concordance to expected sex / pedigree) |
| BAM (any) | Picard CrosscheckFingerprints | sample swap via fingerprint VCF if available |
| Counts matrix | edgeR / DESeq2 PCA | sample clustering vs declared condition / batch |
| Counts matrix | RUVSeq / sva / ComBat-Seq | batch-effect candidate detection (DOES NOT remove; just flags) |
| Methylation IDAT | minfi qcReport | bisulfite conversion efficiency, detection p-value |
| Methylation array | sesame | sex-prediction discordance |
| VCF | bcftools stats | Ti/Tv ratio, het/hom ratio, novel variant fraction |

### Step 3: Batch-effect screening (no removal)

Run PCA on the count or beta matrix. Color points by `batch` (date / lane / plate / center) and `condition` (the experimental variable). If the first 2 PCs separate by batch AND condition is not orthogonal to batch (Pearson correlation between batch indicator and condition indicator > 0.3), emit a P0 finding:

> Batch is confounded with condition. Removing the batch effect (ComBat / RUV / SVA) will also remove condition signal. Re-block the experiment or add explicit batch correction in the model.

### Step 4: Sample swap screening

For BAM data, run somalier `relate` against the expected pedigree (or against declared sample sex). For each sample where the predicted sex / kinship doesn't match the sample sheet → P0 finding `sample-swap-suspected`.

### Step 5: Report

Write `reports/bioinfo-qa/<wave_id>.html` (MultiQC-rendered) and `reports/bioinfo-qa/<wave_id>.md` summary:

1. Modality and N samples
2. Per-sample pass/warn/fail table
3. Batch confound assessment
4. Sample swap assessment
5. Aggregate metrics (mean coverage, mean Q score, % aligned, etc.)
6. Sign-off block

### Step 6: Emit GO/NO-GO

`__CE_BIOINFO_QC_PASS__` or `__CE_BIOINFO_QC_FAIL__ wave=<id> blockers=<count>`

## What this skill does NOT do

- Does not modify the data (read-only)
- Does not remove batch effects (only flags; removal is a downstream choice)
- Does not call variants or quantify expression (use a pipeline reviewed by `ce-bioinfo-pipeline-reviewer`)
- Does not de-identify (genomic data has its own re-identification rules; consult IRB)

## References

@./references/modality-checks.md

@./references/batch-confound-rules.md
