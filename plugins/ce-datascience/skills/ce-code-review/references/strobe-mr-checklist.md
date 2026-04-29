# STROBE-MR Checklist for Mendelian Randomization Studies

Strengthening the Reporting of Mendelian Randomization Studies (STROBE-MR).
Extension of STROBE for observational studies using genetic variants as instrumental variables to estimate causal effects.

**Primary reference:** Skrivankova VW, Richmond RC, Woolf BAR, Yarmolinsky J, Davies NM, Swanson SA, VanderWeele TJ, Timpson NJ, Higgins JPT, Dimou N, Langenberg C, Golub RM, Loder EW, Gallo V, Tybjaerg-Hansen A, Davey Smith G, Egger M, Richards JB. Strengthening the reporting of observational studies in epidemiology using Mendelian randomization: the STROBE-MR Statement. JAMA. 2021;326(16):1614-1621. doi:10.1001/jama.2021.18236. PMID: 34698778.

This checklist supplements STROBE. Apply alongside the base STROBE 22-item checklist when genetic variants are used as instrumental variables.

---

## Introduction

### STROBE-MR 2 -- Background (MR-specific)

**Description:** Explain the rationale for using MR and the assumptions required (relevance, independence, exclusion restriction).

**What to look for in code/outputs:**
- Rationale for MR over conventional observational analysis
- The three IV assumptions stated and discussed in context of the specific exposure-outcome pair
- Prior MR studies on the same topic referenced

---

## Methods

### STROBE-MR 4 -- Data sources

**Description:** Describe the data sources for exposure GWAS, outcome GWAS, and (if applicable) the sample used for instrument selection. State whether one-sample or two-sample MR was used.

**What to look for in code/outputs:**
- GWAS summary statistics sources named with sample sizes and populations
- One-sample vs two-sample design documented
- If two-sample: non-overlapping samples verified or overlap estimated
- GWAS catalog accession numbers or URLs provided

### STROBE-MR 5 -- Instrument selection

**Description:** Describe the criteria for selecting genetic instruments: p-value threshold, LD clumping parameters, genome build, and number of SNPs retained.

**What to look for in code/outputs:**
- P-value threshold for instrument selection (e.g., 5e-8)
- LD clumping parameters: r2 threshold and distance window (e.g., r2 < 0.001, 10 Mb)
- Genome build specified (GRCh37/GRCh38)
- Number of SNPs before and after clumping
- F-statistic or R2 for instrument strength

### STROBE-MR 7 -- Statistical methods

**Description:** Describe the MR estimation method(s) used and the rationale for their selection.

**What to look for in code/outputs:**
- Primary MR method stated (inverse-variance weighted, Wald ratio, MR-Egger, weighted median, MR-PRESSO, CAUSE)
- Rationale for method choice based on pleiotropy assumptions
- Software and version documented (TwoSampleMR, MendelianRandomization, MR-Base, CAUSE)

### STROBE-MR 8 -- Sensitivity analyses

**Description:** Describe MR-specific sensitivity analyses to assess the robustness of causal estimates to violations of IV assumptions.

**What to look for in code/outputs:**
- Pleiotropy assessment: MR-Egger intercept test, MR-PRESSO global test, Cochran's Q
- Outlier detection: MR-PRESSO outlier test, leave-one-out analysis, radial MR
- Heterogeneity: Cochran's Q statistic, funnel plot
- Directionality: Steiger test for correct causal direction
- Multivariable MR if confounding by LD or horizontal pleiotropy suspected
- Colocalization analysis (coloc, eCAVIAR) to distinguish pleiotropy from shared causal variant

---

## Results

### STROBE-MR 12 -- Instrument characteristics

**Description:** Report the characteristics of the genetic instruments including number of SNPs, variance explained, and F-statistic.

**What to look for in code/outputs:**
- Number of SNPs used as instruments
- Variance explained (R2) in the exposure
- Mean F-statistic (or per-SNP F-statistics)
- Instrument-exposure associations with effect sizes and standard errors

### STROBE-MR 16 -- MR estimates

**Description:** Report causal effect estimates from all MR methods used, with confidence intervals and p-values.

**What to look for in code/outputs:**
- IVW estimate with 95% CI and p-value
- Sensitivity method estimates (MR-Egger, weighted median, MR-PRESSO) with 95% CIs
- Scatter plot of SNP-exposure vs SNP-outcome associations
- Forest plot of individual SNP Wald ratios
- Funnel plot for assessing directional pleiotropy
- Leave-one-out plot

---

## Discussion

### STROBE-MR 19 -- Assumption assessment

**Description:** Discuss the plausibility of the three IV assumptions for the specific exposure-outcome pair studied.

**What to look for in code/outputs:**
- Relevance: F-statistic above 10, biological plausibility of genetic association
- Independence: potential for population stratification, assessment of confounding by ancestry
- Exclusion restriction: pleiotropy assessment results, biological pathways of instruments
- Comparison with conventional observational estimates and/or RCT evidence where available
