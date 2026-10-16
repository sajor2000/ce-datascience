# STREGA Checklist for Genetic Association Studies

## Contents

- Introduction
- Methods
- Results

STrengthening the REporting of Genetic Association Studies (STREGA).
Extension of STROBE for observational studies reporting on gene-disease associations. STREGA adds recommendations to 12 of the 22 STROBE items: 3, 6(a), 7(b), 8(b), 9(b), 11, 12(a) and 12(f)-(j), 13(a), 14(a), 15, 16(d), 17(b)-(c). Items without a STREGA addition use the STROBE text unchanged.

**Primary reference:** Little J, Higgins JP, Ioannidis JP, Moher D, Gagnon F, von Elm E, Khoury MJ, Cohen B, Davey Smith G, Grimshaw J, Scheet P, Gwinn M, Williamson RE, Zou GY, Hutchings K, Johnson CY, Tait V, Wiens M, Golding J, van Duijn C, McLaughlin J, Paterson A, Wells G, Fortier I, Freedman M, Zecevic M, King R, Infante-Rivard C, Stewart A, Birkett N. STrengthening the REporting of Genetic Association Studies (STREGA)--an extension of the STROBE statement. Genet Epidemiol. 2009;33(7):581-598. doi:10.1002/gepi.20410. PMID: 19278015.

**Also published in:** PLoS Med. 2009;6(2):e22. doi:10.1371/journal.pmed.1000022. PMID: 19192942. PMCID: PMC2634792. Eur J Epidemiol. 2009;24(1):37-55. doi:10.1007/s10654-008-9302-y. PMID: 19189221. PMCID: PMC2764094.

**Source and licence:** Item text is quoted verbatim from Table 1 ("STREGA reporting recommendations, extended from STROBE Statement"). The PLoS Med publication is dedicated to the public domain (CC0, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2634792/); the text was transcribed from the identical table in the Eur J Epidemiol copy because the PLoS Med table is an image. The "What to look for in code/outputs" bullets are review cues added by this plugin, not checklist text.

This checklist supplements STROBE. Apply alongside the base STROBE 22-item checklist when reporting genetic association studies (GWAS, candidate gene, or gene-environment interaction).

---

## Introduction

### STREGA 3 -- Objectives (genetic-specific)

**Description:** State if the study is the first report of a genetic association, a replication effort, or both.

**What to look for in code/outputs:**
- Discovery and replication stages labelled in analysis code and outputs
- Criteria for claiming successful replication documented

---

## Methods

### STREGA 6(a) -- Participants (genetic-specific)

**Description:** Give information on the criteria and methods for selection of subsets of participants from a larger study, when relevant.

**What to look for in code/outputs:**
- Sub-sampling logic (which participants were genotyped) and whether it was a priori or post hoc

### STREGA 7(b) -- Variables (genetic-specific)

**Description:** Clearly define genetic exposures (genetic variants) using a widely used nomenclature system. Identify variables likely to be associated with population stratification (confounding by ethnic origin).

**What to look for in code/outputs:**
- Variants identified by dbSNP rsIDs or HGVS nomenclature, with genome build
- Ancestry or ethnicity variables and genetic principal components defined
- Rationale for the genes and variants studied (for GWAS: platform and how variants were taken forward to later stages)

### STREGA 8(b) -- Data sources/measurement (genetic-specific)

**Description:** Describe laboratory methods, including source and storage of DNA, genotyping methods and platforms (including the allele calling algorithm used, and its version), error rates and call rates. State the laboratory/centre where genotyping was done. Describe comparability of laboratory methods if there is more than one group. Specify whether genotypes were assigned using all of the data from the study simultaneously or in smaller batches.

**What to look for in code/outputs:**
- Genotyping platform, calling algorithm and version, call-rate and error-rate QC thresholds
- Batch structure of genotype calling; whether genotyping was blind to case-control status

### STREGA 9(b) -- Bias (genetic-specific)

**Description:** For quantitative outcome variables, specify if any investigation of potential bias resulting from pharmacotherapy was undertaken. If relevant, describe the nature and magnitude of the potential bias, and explain what approach was used to deal with this.

**What to look for in code/outputs:**
- Treatment-adjusted phenotypes (e.g., adding a constant for lipid-lowering medication users) or sensitivity analyses excluding treated participants

### STREGA 11 -- Quantitative variables (genetic-specific)

**Description:** If applicable, describe how effects of treatment were dealt with.

**What to look for in code/outputs:**
- Treatment-effect correction code for quantitative traits

### STREGA 12 -- Statistical methods (genetic-specific)

**Description:** (a) State software version used and options (or settings) chosen. (f) State whether Hardy-Weinberg equilibrium was considered and, if so, how. (g) Describe any methods used for inferring genotypes or haplotypes. (h) Describe any methods used to assess or address population stratification. (i) Describe any methods used to address multiple comparisons or to control risk of false positive findings. (j) Describe any methods used to address and correct for relatedness among subjects.

**What to look for in code/outputs:**
- Software and versions pinned (PLINK, REGENIE, SAIGE, BOLT-LMM) with settings; genetic model coding (additive, dominant, recessive)
- HWE test and exclusion threshold
- Imputation or phasing method and reference panel; imputation quality filter (INFO/R2)
- Principal components, mixed models, or genomic control for stratification
- Multiple-testing threshold (e.g., 5e-8, Bonferroni, FDR)
- Relatedness estimation (kinship, IBD) and how related individuals were handled

---

## Results

### STREGA 13(a) -- Participants (genetic-specific)

**Description:** Report numbers of individuals in whom genotyping was attempted and numbers of individuals in whom genotyping was successful.

**What to look for in code/outputs:**
- Sample QC waterfall: attempted, passed call-rate, sex-check, heterozygosity, and relatedness filters

### STREGA 14(a) -- Descriptive data (genetic-specific)

**Description:** Consider giving information by genotype.

**What to look for in code/outputs:**
- Baseline characteristics stratified by genotype

### STREGA 15 -- Outcome data (genetic-specific)

**Description:** Cohort study -- Report outcomes (phenotypes) for each genotype category over time. Case-control study -- Report numbers in each genotype category. Cross-sectional study -- Report outcomes (phenotypes) for each genotype category.

**What to look for in code/outputs:**
- Genotype counts or phenotype summaries per genotype category (by case-control status where relevant)

### STREGA 16(d) -- Main results (genetic-specific)

**Description:** Report results of any adjustments for multiple comparisons.

**What to look for in code/outputs:**
- Adjusted p-values or significance thresholds reported alongside effect estimates

### STREGA 17 -- Other analyses (genetic-specific)

**Description:** (b) If numerous genetic exposures (genetic variants) were examined, summarize results from all analyses undertaken. (c) If detailed results are available elsewhere, state how they can be accessed.

**What to look for in code/outputs:**
- Full summary statistics, Manhattan and QQ plots, or distributions of p-values and effect sizes
- Summary statistics deposited (e.g., GWAS Catalog) with accession reported
