# STREGA Checklist for Genetic Association Studies

STrengthening the REporting of Genetic Association Studies (STREGA).
Extension of STROBE for observational studies reporting on gene-disease associations.

**Primary reference:** Little J, Higgins JP, Ioannidis JP, Moher D, Gagnon F, von Elm E, Khoury MJ, Cohen B, Davey Smith G, Grimshaw J, Scheet P, Gwinn M, Williamson RE, Zou GY, Hutchings K, Johnson CY, Tait V, Wiens M, Golding J, van Duijn C, McLaughlin J, Paterson A, Wells G, Fortier I, Freedman M, Zecevic M, King R, Infante-Rivard C, Stewart A, Birkett N. STrengthening the REporting of Genetic Association Studies (STREGA)--an extension of the STROBE statement. Genet Epidemiol. 2009;33(7):581-598. doi:10.1002/gepi.20410. PMID: 19278015.

**Also published in:** Eur J Epidemiol. 2009;24(1):37-55. PMID: 19082745.

This checklist supplements STROBE. Apply alongside the base STROBE 22-item checklist when reporting genetic association studies (GWAS, candidate gene, or gene-environment interaction).

---

## Methods

### STREGA 3 -- Objectives (genetic-specific)

**Description:** State whether the study is a discovery (hypothesis-generating) or replication (hypothesis-testing) study. If replication, identify the original study.

**What to look for in code/outputs:**
- Study classified as discovery GWAS, candidate gene, replication, or meta-analysis
- If replication: original study cited, same SNPs and outcome definitions used
- Hypothesis stated if candidate gene study

### STREGA 6 -- Participants (genetic-specific)

**Description:** Describe the source population, sampling strategy, and any population stratification concerns. Report ancestry/ethnicity of participants.

**What to look for in code/outputs:**
- Ancestry or ethnicity of study participants reported
- Population stratification assessment (genomic inflation factor, principal components)
- Sample recruitment strategy described (population-based, clinic-based, family-based)
- Related individuals handling documented (kinship pruning, mixed models)

### STREGA 7 -- Variables (genetic-specific)

**Description:** Report the genotyping platform, SNP selection criteria, quality control filters, and imputation methods.

**What to look for in code/outputs:**
- Genotyping platform and array specified (e.g., Illumina Global Screening Array, Affymetrix Axiom)
- SNP selection: candidate gene rationale, or genome-wide with significance threshold
- Quality control filters: call rate (per-sample and per-SNP), HWE threshold, MAF threshold, heterozygosity, sex check
- Imputation: reference panel (1000 Genomes, TOPMed, HRC), software (IMPUTE2, Minimac4, BEAGLE), imputation quality filter (INFO > 0.3 or R2 > 0.3)

### STREGA 8 -- Data sources (genetic-specific)

**Description:** Describe the laboratory methods for genotyping, including DNA extraction, genotyping protocol, and quality assurance.

**What to look for in code/outputs:**
- DNA source (blood, saliva, buccal) documented
- Genotyping batch and plate design documented
- Genotype calling algorithm specified (GenomeStudio, zCall, optiCall)
- Quality control concordance for duplicated samples

### STREGA 11 -- Quantitative variables (genetic-specific)

**Description:** Describe how genetic variants were modeled: additive, dominant, recessive, or genotypic model.

**What to look for in code/outputs:**
- Genetic model specified (additive coding per-allele, dominant, recessive, or all three tested)
- Rationale for model choice if not additive (which is standard for GWAS)
- Haplotype analysis methods if used

### STREGA 12 -- Statistical methods (genetic-specific)

**Description:** (a) Describe methods for multiple testing correction. (b) Report methods for population stratification adjustment. (c) Report methods for gene-environment interaction testing.

**What to look for in code/outputs:**
- Multiple testing correction: Bonferroni, FDR (Benjamini-Hochberg), permutation testing, or genome-wide significance threshold (5e-8)
- Population stratification: principal component adjustment, genomic control, mixed models (BOLT-LMM, SAIGE, REGENIE)
- Gene-environment interaction: interaction terms, stratified analyses, G x E testing framework
- Software documented (PLINK, REGENIE, SAIGE, BOLT-LMM, GCTA)

---

## Results

### STREGA 13 -- Participants (genetic-specific)

**Description:** Report the number of participants with genotype data available after quality control, and the number of SNPs analyzed.

**What to look for in code/outputs:**
- Sample size before and after QC
- Number of genotyped SNPs, number after QC, number after imputation
- Genomic inflation factor (lambda) reported
- QQ plot included

### STREGA 16 -- Main results (genetic-specific)

**Description:** Report effect estimates (odds ratios, beta coefficients) with confidence intervals for each genetic variant. Report allele frequencies in cases and controls.

**What to look for in code/outputs:**
- Per-SNP effect estimates with 95% CI and p-values
- Effect allele and other allele specified for each reported SNP
- Allele frequencies in cases and controls (or exposed and unexposed)
- Manhattan plot and QQ plot included
- Regional association plots (LocusZoom) for significant loci

---

## Discussion

### STREGA 19 -- Limitations (genetic-specific)

**Description:** Discuss limitations specific to genetic studies: winner's curse, population stratification residual, cryptic relatedness, and genotyping error.

**What to look for in code/outputs:**
- Winner's curse (effect size inflation in discovery) acknowledged
- Residual population stratification discussed
- Linkage disequilibrium patterns and fine-mapping limitations
- Generalizability to other ancestries discussed
- Functional annotation of associated variants (or lack thereof)
