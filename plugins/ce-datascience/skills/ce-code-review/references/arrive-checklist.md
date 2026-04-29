# ARRIVE 2.0 Checklist for Animal Research

Animal Research: Reporting of In Vivo Experiments (ARRIVE 2.0).
21-item checklist (10 essential + 11 recommended) applicable to animal research reporting.

**Primary reference:** Percie du Sert N, Hurst V, Ahluwalia A, et al. The ARRIVE guidelines 2.0: Updated guidelines for reporting animal research. PLoS Biol. 2020;18(7):e3000410. doi:10.1371/journal.pbio.3000410. PMID: 32663219.

**Explanation and elaboration:** Percie du Sert N, Ahluwalia A, Alam S, et al. Reporting animal research: Explanation and elaboration for the ARRIVE guidelines 2.0. PLoS Biol. 2020;18(7):e3000411. doi:10.1371/journal.pbio.3000411. PMID: 32663221.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Essential 10

### Item 1 -- Study design

**Description:** For each experiment, provide brief details of the study design including (a) the groups being compared, including control groups; (b) the experimental unit (e.g., a single animal, litter, cage of animals).

**What to look for in code/outputs:**
- Experimental groups clearly defined in code (treatment, control, sham, vehicle)
- Experimental unit explicitly specified (individual animal, litter, cage)
- Group assignments documented in data structure or metadata
- Study design diagram or description in protocol or documentation

### Item 2 -- Sample size

**Description:** (a) Specify the exact number of experimental units allocated to each group and the total number in each experiment. (b) Explain how the sample size was decided. Provide details of any power analysis, if done.

**What to look for in code/outputs:**
- Sample size per group clearly stated in analysis code or documentation
- Power analysis code with effect size, alpha, power, and resulting N
- Justification for sample size if no formal power calculation (pilot data, resource constraints)
- Final analyzed N per group reported (accounting for any losses)

### Item 3 -- Inclusion and exclusion criteria

**Description:** (a) Describe any criteria used for including and excluding animals (or experimental units) during the experiment, and data points during the analysis. Specify whether criteria were established a priori. (b) Report any deviations from the original plan.

**What to look for in code/outputs:**
- Pre-specified inclusion/exclusion criteria documented in protocol or analysis plan
- Data filtering code that applies exclusion criteria with documented rationale
- Outlier removal procedures with justification (statistical threshold, biological implausibility)
- Deviations from planned exclusion criteria noted with reasons

### Item 4 -- Randomisation

**Description:** (a) State whether randomisation was used to allocate experimental units to control and treatment groups. If done, provide the method of randomisation. (b) Describe the strategy used to minimise confounders such as order of treatments, animal/cage location.

**What to look for in code/outputs:**
- Randomisation method documented (simple random, block, stratified, computer-generated)
- Random seed or randomisation sequence recorded for reproducibility
- Code implementing randomisation or reference to randomisation tool/software
- Strategies to minimise confounders (counterbalancing, Latin square, cage position rotation) documented

### Item 5 -- Blinding

**Description:** Describe who was aware of the group allocation at the different stages of the experiment (during allocation, conduct of experiment, outcome assessment, data analysis).

**What to look for in code/outputs:**
- Blinding status documented for each stage (allocation, intervention, assessment, analysis)
- Coded group labels in data (Group A/B rather than Treatment/Control) indicating blinding during analysis
- Unblinding procedures and timing documented
- Documentation of personnel who were blinded vs. unblinded at each phase

### Item 6 -- Outcome measures

**Description:** (a) Clearly define all outcome measures assessed (e.g., cell count, organ weight, tumour volume). (b) For hypothesis-testing studies, specify the primary outcome measure.

**What to look for in code/outputs:**
- Outcome variables clearly defined with measurement units and methods
- Primary outcome distinguished from secondary outcomes in analysis code or protocol
- Outcome measurement procedures documented (timing, method, equipment)
- Variable naming in code that maps to defined outcome measures

### Item 7 -- Statistical methods

**Description:** (a) Provide details of the statistical methods used for each analysis. (b) Specify the unit of analysis for each dataset. (c) Describe any methods used to assess whether data met the assumptions of the statistical approach.

**What to look for in code/outputs:**
- Statistical tests specified for each comparison (t-test, ANOVA, mixed model, non-parametric)
- Unit of analysis confirmed to match the experimental unit (not pseudoreplication)
- Assumption checking code (normality tests, homogeneity of variance, independence)
- Post-hoc test methods and multiple comparison corrections documented
- Statistical software and version documented

### Item 8 -- Experimental animals

**Description:** (a) Provide species-appropriate details (e.g., species, strain, substrain, sex, age/weight, source, genetic modification status, genotype). (b) Describe any previous procedures the animals may have undergone.

**What to look for in code/outputs:**
- Species, strain, and substrain documented in metadata or methods section
- Animal demographics (sex, age, weight at study start) summarized in baseline characteristics table
- Source or vendor of animals documented
- Genetic modification status and genotyping confirmation described
- Previous experimental procedures or treatments documented

### Item 9 -- Experimental procedures

**Description:** For each experimental group, describe the procedures in enough detail to allow replication, including (a) what was done, how, and what was used; (b) when and how often; (c) where (including detail of any acclimatisation); (d) why (provide rationale for procedures).

**What to look for in code/outputs:**
- Experimental procedures documented with sufficient detail for replication
- Timing, frequency, and duration of interventions recorded
- Drug doses, routes of administration, formulation, and vehicle composition specified
- Acclimatisation period and housing conditions during procedures noted
- Rationale for procedural choices referenced

### Item 10 -- Results

**Description:** For each experiment conducted, including independent replications, report (a) summary/descriptive statistics for each experimental group with a measure of variability (e.g., mean and SD, median and range); (b) if applicable, the effect size with a confidence interval.

**What to look for in code/outputs:**
- Summary statistics (mean, SD or SEM, median, IQR) reported per group
- Effect sizes with confidence intervals calculated and reported
- Individual data points displayed (dot plots, scatter plots) alongside summary statistics
- Results of each independent replication reported separately or as part of pooled analysis
- Statistical test results (test statistic, degrees of freedom, exact p-value) fully reported

---

## Recommended Set

### Item 11 -- Abstract

**Description:** Provide an accurate summary of the research objectives, animal species, strain and sex, key methods, principal findings, and study interpretation.

**What to look for in code/outputs:**
- Abstract or summary section identifying species, strain, and sex
- Key methods and principal findings concisely described
- Study interpretation stated in the abstract without overstatement
- Abstract template covering all required elements

### Item 12 -- Background

**Description:** (a) Include sufficient scientific background to understand the rationale and context for the study, and explain the experimental approach. (b) Explain how the animal species and model were chosen and their relevance to the research question.

**What to look for in code/outputs:**
- Background section with citations establishing the scientific context
- Rationale for the animal model selection documented
- Relevance of the chosen species/model to the human condition or biological question explained
- Prior studies using the same model referenced

### Item 13 -- Objectives

**Description:** Clearly describe the research question, research objectives, and, where appropriate, specific hypotheses being tested.

**What to look for in code/outputs:**
- Research questions or objectives explicitly stated in protocol or report
- Hypotheses formulated as testable predictions
- Primary vs. exploratory objectives distinguished
- Objectives linked to specific outcome measures

### Item 14 -- Ethical review

**Description:** Provide the name of the ethical review committee or equivalent body that approved the use of animals and any relevant licence or protocol numbers.

**What to look for in code/outputs:**
- IACUC or ethics committee approval statement with protocol number
- Institutional review body name and approval date documented
- Compliance with national regulations (e.g., UK Animals Act, EU Directive, US PHS Policy)
- Ethical approval documentation referenced in project files

### Item 15 -- Housing and husbandry

**Description:** Provide details of housing and husbandry conditions, including (a) housing (type of facility, cage or housing type, bedding, enrichment); (b) husbandry (access to food and water, light/dark cycle, temperature, quality of water).

**What to look for in code/outputs:**
- Housing conditions documented (cage type, group vs. individual, bedding, enrichment)
- Environmental parameters recorded (temperature, humidity, light/dark cycle)
- Diet and water access described (ad libitum vs. restricted, diet composition)
- Facility type (barrier, conventional, SPF) noted in methods documentation

### Item 16 -- Animal care and monitoring

**Description:** (a) Describe any interventions or steps taken to reduce pain, suffering, and distress. (b) Report any adverse events.

**What to look for in code/outputs:**
- Analgesia, anaesthesia, and humane endpoint criteria documented
- Monitoring schedules and welfare assessment methods described
- Adverse events recorded with severity and resolution
- Humane endpoints and criteria for early termination specified
- Refinement measures documented (3Rs compliance)

### Item 17 -- Interpretation/scientific implications

**Description:** (a) Interpret the results, taking into account the study objectives, limitations, multiplicity of analyses, and other relevant studies. (b) Comment on the clinical/scientific/3Rs implications of the findings and how they might advance scientific knowledge.

**What to look for in code/outputs:**
- Discussion section interpreting results relative to study objectives
- Limitations acknowledged (sample size, model limitations, generalizability)
- Implications for clinical translation or scientific advancement discussed
- 3Rs implications addressed where relevant
- Overgeneralization from animal data to human outcomes avoided

### Item 18 -- Generalisability/translation

**Description:** Comment on whether the findings can be generalised to other species or experimental conditions, including any relevance to human biology.

**What to look for in code/outputs:**
- Generalisability of findings discussed with respect to species, strain, sex
- Translational relevance to human biology assessed
- Differences between the animal model and the human condition acknowledged
- External validity considerations documented

### Item 19 -- Protocol registration

**Description:** Provide a statement indicating whether a protocol (including the research question, key design features, and analysis plan) was prepared before the study, and if and where this protocol was registered.

**What to look for in code/outputs:**
- Protocol registration statement (preclinicaltrials.eu, OSF, institutional registry)
- Registration number and URL documented
- Timing of registration relative to study commencement noted
- Pre-registered analysis plan referenced in documentation

### Item 20 -- Data access

**Description:** Provide a statement describing if and where study data are available.

**What to look for in code/outputs:**
- Data availability statement in report output
- Data repository references (Figshare, Dryad, Zenodo, institutional repository)
- Raw data files included or referenced in the project
- Data sharing restrictions or embargo periods documented

### Item 21 -- Declaration of interests

**Description:** (a) Declare any potential conflicts of interest, including financial and non-financial. If none exist, this should be stated. (b) List all funding sources and the role of the funder(s) in the design, analysis, and reporting of the study.

**What to look for in code/outputs:**
- Conflict of interest statements in report templates
- Funding sources listed with grant numbers
- Funder role in study design, conduct, and reporting documented
- Industry relationships or in-kind support disclosed
