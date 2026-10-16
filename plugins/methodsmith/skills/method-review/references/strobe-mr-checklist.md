# STROBE-MR Checklist for Mendelian Randomization Studies

## Contents

- Title and Abstract
- Introduction
- Methods
- Results
- Discussion
- Other Information

Strengthening the Reporting of Observational Studies in Epidemiology Using Mendelian Randomization (STROBE-MR).
Stand-alone extension of STROBE: 20 main items and 30 subitems in six sections (title and abstract, introduction, methods, results, discussion, other information). Covers one-sample and two-sample MR studies of one or more exposures and outcomes, including MR studies that follow a genome-wide association study reported in the same article.

**Primary reference:** Skrivankova VW, Richmond RC, Woolf BAR, Yarmolinsky J, Davies NM, Swanson SA, VanderWeele TJ, Higgins JPT, Timpson NJ, Dimou N, Langenberg C, Golub RM, Loder EW, Gallo V, Tybjaerg-Hansen A, Davey Smith G, Egger M, Richards JB. Strengthening the reporting of observational studies in epidemiology using Mendelian randomization: the STROBE-MR Statement. JAMA. 2021;326(16):1614-1621. doi:10.1001/jama.2021.18236. PMID: 34698778.

**Explanation and elaboration:** Skrivankova VW, Richmond RC, Woolf BAR, et al. Strengthening the reporting of observational studies in epidemiology using mendelian randomisation (STROBE-MR): explanation and elaboration. BMJ. 2021;375:n2233. doi:10.1136/bmj.n2233. PMID: 34702754. PMCID: PMC8546498.

**Source and licence:** Item text is quoted verbatim from Table 3 of the BMJ explanation and elaboration paper (CC BY 4.0, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8546498/). The "What to look for in code/outputs" bullets are review cues added by this plugin, not checklist text.

STROBE-MR is a separate checklist motivated by STROBE but focused on the MR design. Use it instead of, not on top of, the STROBE 22-item checklist when the study is a mendelian randomization study.

---

## Title and Abstract

### STROBE-MR 1 -- Title and abstract

**Description:** Indicate mendelian randomisation (MR) as the study's design in the title and/or the abstract if that is a main purpose of the study.

**What to look for in code/outputs:**
- Report title or abstract template names MR as the design when MR is the main analysis

---

## Introduction

### STROBE-MR 2 -- Background

**Description:** Explain the scientific background and rationale for the reported study. What is the exposure? Is a potential causal association between exposure and outcome plausible? Justify why MR is a helpful method to address the study question.

**What to look for in code/outputs:**
- Rationale for MR over conventional observational analysis
- Prior MR studies on the same topic referenced

### STROBE-MR 3 -- Objectives

**Description:** State specific objectives clearly, including prespecified causal hypotheses (if any). State that MR is a method that, under specific assumptions, intends to estimate causal effects.

**What to look for in code/outputs:**
- Prespecified causal hypotheses recorded in the SAP or analysis header before results were produced

---

## Methods

### STROBE-MR 4 -- Study design and data sources

**Description:** Present key elements of the study design early in the article. Consider including a table listing sources of data for all phases of the study. For each data source contributing to the analysis, describe the following:
- **4a** Setting: Describe the study design and the underlying population, if possible. Describe the setting, locations, and relevant dates, including periods of recruitment, exposure, follow-up, and data collection, when available.
- **4b** Participants: Give the eligibility criteria, and the sources and methods of selection of participants. Report the sample size, and whether any power or sample size calculations were carried out prior to the main analysis.
- **4c** Describe measurement, quality control, and selection of genetic variants.
- **4d** For each exposure, outcome, and other relevant variables, describe methods of assessment and diagnostic criteria for diseases.
- **4e** Provide details of ethics committee approval and participant informed consent, if relevant.

**What to look for in code/outputs:**
- GWAS summary statistics sources named with sample sizes, ancestry, and populations; GWAS catalog accession numbers or URLs
- One-sample vs two-sample design documented
- Instrument selection (4c): p-value threshold (e.g., 5e-8), LD clumping parameters (r2 threshold and window), genome build (GRCh37/GRCh38), number of SNPs before and after clumping, allele harmonisation rules
- Power or sample size calculation code, if any (4b)

### STROBE-MR 5 -- Assumptions

**Description:** Explicitly state the three core instrumental variable assumptions for the main analysis (relevance, independence, and exclusion restriction), as well assumptions for any additional or sensitivity analysis.

**What to look for in code/outputs:**
- The three IV assumptions stated for the specific exposure-outcome pair
- Assumptions of each sensitivity method stated (e.g., InSIDE for MR-Egger, majority valid for weighted median)

### STROBE-MR 6 -- Statistical methods: main analysis

**Description:** Describe statistical methods and statistics used.
- **6a** Describe how quantitative variables were handled in the analyses (that is, scale, units, model).
- **6b** Describe how genetic variants were handled in the analyses and, if applicable, how their weights were selected.
- **6c** Describe the MR estimator (eg, two stage least squares, Wald ratio) and related statistics. Detail the included covariates and, in the case of two sample MR, whether the same covariate set was used for adjustment in the two samples.
- **6d** Explain how missing data were addressed.
- **6e** If applicable, indicate how multiple testing was addressed.

**What to look for in code/outputs:**
- Primary MR estimator stated (inverse-variance weighted, Wald ratio, two-stage least squares) and the rationale for the choice
- Units and scale of exposure and outcome (per SD, per log-unit) documented
- Covariate sets for each sample in two-sample MR

### STROBE-MR 7 -- Assessment of assumptions

**Description:** Describe any methods or prior knowledge used to assess the assumptions or justify their validity.

**What to look for in code/outputs:**
- Instrument strength (F-statistic, R2), pleiotropy checks (MR-Egger intercept, MR-PRESSO global test, Cochran's Q), colocalization, or biological justification documented

### STROBE-MR 8 -- Sensitivity analyses and additional analyses

**Description:** Describe any sensitivity analyses or additional analyses performed (eg, comparison of effect estimates from different approaches, independent replication, bias analytic techniques, validation of instruments, simulations).

**What to look for in code/outputs:**
- Robust methods: MR-Egger, weighted median, weighted mode, MR-PRESSO, CAUSE
- Outlier and leave-one-out analyses, radial MR
- Directionality checks (Steiger test, bidirectional MR); multivariable MR

### STROBE-MR 9 -- Software and pre-registration

**Description:**
- **9a** Name statistical software and package(s), including version and settings used.
- **9b** State whether the study protocol and details were pre-registered (as well as when and where).

**What to look for in code/outputs:**
- Package versions pinned (TwoSampleMR, MendelianRandomization, MR-PRESSO) in a lockfile or session info
- Registration identifier (OSF, PROSPERO) referenced

---

## Results

### STROBE-MR 10 -- Descriptive data

**Description:**
- **10a** Report the numbers of individuals at each stage of included studies and reasons for exclusion. Consider use of a flow diagram.
- **10b** Report summary statistics for phenotypic exposure(s), outcome(s), and other relevant variables (eg, means, SDs, proportions).
- **10c** If the data sources include meta-analyses of previous studies, provide the assessments of heterogeneity across these studies.
- **10d** For two sample MR: (i) Provide justification of the similarity of the genetic variant-exposure associations between the exposure and outcome samples; (ii) Provide information on the number of individuals who overlap between the exposure and outcome studies.

**What to look for in code/outputs:**
- Sample flow counts; summary statistics table for exposures and outcomes
- Sample overlap estimate between exposure and outcome GWAS

### STROBE-MR 11 -- Main results

**Description:**
- **11a** Report the associations between genetic variant and exposure, and between genetic variant and outcome, preferably on an interpretable scale.
- **11b** Report MR estimates of the association between exposure and outcome, and the measures of uncertainty from the MR analysis, on an interpretable scale, such as odds ratio or relative risk per SD difference.
- **11c** If relevant, consider translating estimates of relative risk into absolute risk for a meaningful time period.
- **11d** Consider plots to visualise results (eg, forest plot, scatterplot of associations between genetic variants and outcome v between genetic variants and exposure).

**What to look for in code/outputs:**
- Per-SNP variant-exposure and variant-outcome estimates with standard errors (supplementary table)
- Main MR estimate with 95% CI on an interpretable scale
- Scatter and forest plots

### STROBE-MR 12 -- Assessment of assumptions

**Description:**
- **12a** Report the assessment of the validity of the assumptions.
- **12b** Report any additional statistics (eg, assessments of heterogeneity across genetic variants, such as I2, Q statistic, or E value).

**What to look for in code/outputs:**
- Mean and per-SNP F-statistics, variance explained (R2)
- MR-Egger intercept, Cochran's Q, I2 reported

### STROBE-MR 13 -- Sensitivity analyses and additional analyses

**Description:**
- **13a** Report any sensitivity analyses to assess the robustness of the main results to violations of the assumptions.
- **13b** Report results from other sensitivity analyses or additional analyses.
- **13c** Report any assessment of direction of causal association (eg, bidirectional MR).
- **13d** When relevant, report and compare with estimates from non-MR analyses.
- **13e** Consider additional plots to visualise results (eg, leave-one-out analyses).

**What to look for in code/outputs:**
- Estimates from each robust method with 95% CIs; leave-one-out and funnel plots
- Comparison with conventional observational or trial estimates where available

---

## Discussion

### STROBE-MR 14 -- Key results

**Description:** Summarise key results with reference to study objectives.

### STROBE-MR 15 -- Limitations

**Description:** Discuss limitations of the study, taking into account the validity of the instrumental variable assumptions, other sources of potential bias, and imprecision. Discuss both direction and magnitude of any potential bias and any efforts to address them.

**What to look for in code/outputs:**
- Relevance: weak-instrument bias discussed (F-statistic, R2)
- Independence: population stratification and ancestry confounding addressed
- Exclusion restriction: pleiotropy assessment results and biological pathways of instruments

### STROBE-MR 16 -- Interpretation

**Description:**
- **16a** Meaning: Give a cautious overall interpretation of results in the context of their limitations and in comparison with other studies.
- **16b** Mechanism: Discuss underlying biological mechanisms that could drive a potential causal association between the investigated exposure and the outcome, and whether the gene-environment equivalence assumption is reasonable. Use causal language carefully, clarifying that instrumental variable estimates may provide causal effects only under certain assumptions.
- **16c** Clinical relevance: Discuss whether the results have clinical or public policy relevance, and to what extent they inform effect sizes of possible interventions.

### STROBE-MR 17 -- Generalisability

**Description:** Discuss the generalisability of the study results (a) to other populations, (b) across other exposure periods/timings, and (c) across other levels of exposure.

---

## Other Information

### STROBE-MR 18 -- Funding

**Description:** Describe sources of funding and the role of funders in the present study and, if applicable, sources of funding for the databases and original study or studies on which the present study is based.

### STROBE-MR 19 -- Data and data sharing

**Description:** Provide the data used to perform all analyses or report where and how the data can be accessed, and reference these sources in the article. Provide the statistical code needed to reproduce the results in the article, or report whether the code is publicly accessible and if so, where.

**What to look for in code/outputs:**
- Summary-statistics sources and analysis code in a public repository or a data-availability statement

### STROBE-MR 20 -- Conflicts of interest

**Description:** All authors should declare all potential conflicts of interest.
