# Modality-Specific QC Checks

## WGS / WES (whole-genome / whole-exome)

| Metric | Tool | Pass threshold | Warn | Fail |
|--------|------|----------------|------|------|
| Mean depth (WGS) | mosdepth | ≥ 30× | 20-30× | < 20× |
| Mean depth (WES) | mosdepth + bed | ≥ 80× target | 50-80× | < 50× |
| % bases ≥ Q30 | FastQC | ≥ 85% | 80-85% | < 80% |
| Mapping rate | flagstat | ≥ 99% | 97-99% | < 97% |
| Duplicate rate | Picard MarkDuplicates | ≤ 25% | 25-40% | > 40% |
| Insert size SD | Picard CollectInsertSizeMetrics | < 100 | 100-150 | > 150 |
| Cross-contamination | verifyBamID2 | < 0.02 | 0.02-0.05 | > 0.05 |
| Sex check (somalier) | somalier relate | concordant | -- | discordant |

## RNA-seq

| Metric | Tool | Pass | Warn | Fail |
|--------|------|------|------|------|
| Reads aligned | STAR/salmon | ≥ 70% | 60-70% | < 60% |
| % rRNA | RSeQC | ≤ 10% | 10-20% | > 20% |
| % intergenic | Picard | ≤ 10% | 10-15% | > 15% |
| 5'/3' bias | Picard | ratio 0.7-1.3 | 0.5-0.7 or 1.3-1.5 | < 0.5 or > 1.5 |
| # detected genes | edgeR filterByExpr | ≥ 12,000 | 8,000-12,000 | < 8,000 |
| Strand-specificity | RSeQC | matches protocol | mixed | inverted |

## Methylation array (450k / EPIC)

| Metric | Tool | Pass | Warn | Fail |
|--------|------|------|------|------|
| Detection p median | minfi | < 0.005 | 0.005-0.01 | > 0.01 |
| Bisulfite conversion | minfi | ≥ 95% | 90-95% | < 90% |
| Probes failing detP | minfi | < 1% | 1-5% | > 5% |
| Sex prediction | sesame inferSex | concordant | -- | discordant |

## ChIP-seq / ATAC-seq

| Metric | Tool | Pass | Warn | Fail |
|--------|------|------|------|------|
| NSC | ChIPQC / phantompeakqualtools | ≥ 1.05 | 1.0-1.05 | < 1.0 |
| RSC | phantompeakqualtools | ≥ 1.0 | 0.8-1.0 | < 0.8 |
| FRiP (ATAC) | bedtools + custom | ≥ 0.2 | 0.1-0.2 | < 0.1 |
| TSS enrichment (ATAC) | ATACseqQC | ≥ 6 | 4-6 | < 4 |

## Single-cell RNA-seq

| Metric | Tool | Pass | Warn | Fail |
|--------|------|------|------|------|
| Median genes/cell | Seurat / Scanpy | ≥ 1500 | 800-1500 | < 800 |
| % mitochondrial | Seurat | < 10% | 10-20% | > 20% |
| Doublet rate (Scrublet) | Scrublet | < 5% | 5-10% | > 10% |
| Median UMI/cell | -- | ≥ 3000 | 1000-3000 | < 1000 |

## Variant calling output (VCF)

| Metric | Tool | Sanity check |
|--------|------|--------------|
| Ti/Tv ratio (SNVs) | bcftools stats | 2.0-2.1 (WGS); 3.0-3.3 (WES) |
| Het/Hom ratio | bcftools stats | 1.5-2.0 (autosomal) |
| Novel variant fraction | -- | > 5% suggests contamination or pipeline bug |
| HWE p < 1e-6 fraction | -- | < 0.01 expected; higher → pop stratification or genotyping artifact |
