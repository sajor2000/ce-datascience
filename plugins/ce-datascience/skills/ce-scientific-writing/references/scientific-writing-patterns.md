# Evidence-Grounded Scientific Writing Patterns

Use these patterns to solve a sentence-level reporting problem after the study design, section, and evidence are established. They are not mandatory wording. Replace brackets only with verified study information, vary the syntax to preserve author voice, and follow the applicable reporting guideline and journal instructions.

## Evidence base

PubMed and PubMed Central records were verified on September 4, 2026.

| Source | Identifier | Use in this guide |
|---|---|---|
| CONSORT 2025 explanation and elaboration | PMID [40228832](https://pubmed.ncbi.nlm.nih.gov/40228832/), PMCID [PMC11995452](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11995452/), DOI [10.1136/bmj-2024-081124](https://doi.org/10.1136/bmj-2024-081124) | Randomized-trial reporting |
| STROBE explanation and elaboration | PMID [17941715](https://pubmed.ncbi.nlm.nih.gov/17941715/), PMCID [PMC2020496](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2020496/), DOI [10.1371/journal.pmed.0040297](https://doi.org/10.1371/journal.pmed.0040297) | Observational-study reporting |
| PRISMA 2020 explanation and elaboration | PMID [33781993](https://pubmed.ncbi.nlm.nih.gov/33781993/), PMCID [PMC8005925](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8005925/), DOI [10.1136/bmj.n160](https://doi.org/10.1136/bmj.n160) | Systematic-review reporting |
| TRIPOD+AI | PMID [38626948](https://pubmed.ncbi.nlm.nih.gov/38626948/), PMCID [PMC11019967](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11019967/), DOI [10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378) | Prediction-model reporting |
| PROCOAG randomized clinical trial | PMID [36942533](https://pubmed.ncbi.nlm.nih.gov/36942533/), PMCID [PMC10031505](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10031505/), DOI [10.1001/jama.2023.4080](https://doi.org/10.1001/jama.2023.4080) | Trial sentence architecture |
| UK Biobank handgrip cohort study | PMID [35737388](https://pubmed.ncbi.nlm.nih.gov/35737388/), PMCID [PMC9227006](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9227006/), DOI [10.1001/jamanetworkopen.2022.18314](https://doi.org/10.1001/jamanetworkopen.2022.18314) | Observational sentence architecture |
| Nurse burnout systematic review and meta-analysis | PMID [39499515](https://pubmed.ncbi.nlm.nih.gov/39499515/), PMCID [PMC11539016](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11539016/), DOI [10.1001/jamanetworkopen.2024.43059](https://doi.org/10.1001/jamanetworkopen.2024.43059) | Review sentence architecture |
| ALS prediction-model development and validation study | PMID [29598923](https://pubmed.ncbi.nlm.nih.gov/29598923/), DOI [10.1016/S1474-4422(18)30089-9](https://doi.org/10.1016/S1474-4422(18)30089-9) | Prediction-model sentence architecture |

The reporting guidelines define minimum content, not a universal manuscript order or a method-quality score. Apply them early enough to expose missing information. Do not use a checklist to certify that the underlying design or analysis was valid.

## Rules that change the prose

### All empirical studies

- Name the design, population, setting, and period early enough for readers to interpret the evidence.
- State an exact objective or research question. Do not substitute a novelty claim or a broad topic sentence.
- Define each primary outcome by measurement variable, analysis metric, aggregation method, and time point when applicable.
- Begin Results with the analyzed denominator or study flow. Then report estimates with uncertainty and group-specific absolute quantities when relevant.
- Keep Results factual. Put mechanisms, implications, alternative explanations, and generalizability in Discussion.
- Align the conclusion with the design, estimand, analyzed population, uncertainty, harms, and limitations.

### Randomized trials

CONSORT 2025 requires transparent reporting of allocation, blinding, intervention delivery, analysis populations, missing-data handling, prespecified and post hoc analyses, participant flow, estimates with precision, and harms. Balance benefits and harms in the interpretation. A nonsignificant primary result is not permission to emphasize a favorable secondary result.

### Observational studies

STROBE requires explicit eligibility, setting and dates, variable definitions, measurement, bias controls, study-size basis, missing-data handling, confounder selection, and sensitivity analyses. Report unadjusted and adjusted estimates with precision when applicable. Limitations should explain the likely direction and magnitude of bias when they can be assessed.

### Systematic reviews

PRISMA 2020 requires an explicit review question, eligibility criteria, every information source and last-search date, reproducible search strategies, reviewer roles, effect measures, synthesis methods, risk of bias, certainty, study flow, and results for all main outcomes. Separate limitations of the included evidence from limitations of the review process.

### Prediction models

TRIPOD+AI applies to regression and machine-learning models. State whether the work develops, evaluates, or updates a model. Report data sources, participants, outcomes, predictors, sample-size basis, missing data, model-building procedures, performance measures, internal and external evaluation, and availability of the model and code. Report calibration with discrimination. Do not present an AUC alone as adequate model performance.

## Published examples and reusable structures

Quoted excerpts below are deliberately short. Learn the information order, then write the study's own sentence.

### Objective

Published trial example: “To investigate the efficacy and safety of 4F-PCC administration in patients at risk of massive transfusion.” (PROCOAG, PMID 36942533)

Structure:

> To [estimate, evaluate, or compare] [prespecified outcome or association] among [population] in [setting or period].

Use one accountable verb and one defined target. For exploratory work, name the exploratory status rather than implying confirmation.

Published cohort example: “To evaluate the association between handgrip strength ... and dementia, reduced cognition, and poorer neuroimaging outcomes...” (PMID 35737388)

The word `association` matches the observational design. Do not replace it with `effect`, `impact`, or `prevents` unless the design and estimand support a causal claim.

### Methods

Structure for design and setting:

> We conducted a [design] among [population] at [sites or data source] from [start] through [end].

Structure for an outcome:

> The primary outcome was [variable], measured as [metric and aggregation] at [time point].

Published systematic-review example: “Two reviewers independently identified studies that reported a quantifiable association...” (PMID 39499515)

That sentence makes the action, independence, and eligibility decision visible. Add the databases, complete search dates, extraction process, effect measure, synthesis model, and risk-of-bias method elsewhere in Methods.

Published prediction-model example: “We assessed the generalisability of the model ... using internal-external cross-validation...” (PMID 29598923)

Name the actual validation design. Avoid the unqualified phrase `the model was validated`, which hides the dataset, resampling scheme, transport setting, and performance criteria.

### Results

Structure for study flow:

> Of [screened N] individuals, [eligible n] met eligibility criteria, [assigned or included n] entered the study, and [analyzed n] were included in the primary analysis.

Structure for a comparative result:

> [Outcome] occurred in [n/N (%)] in [group A] and [n/N (%)] in [group B] ([effect estimate], [confidence interval]).

Structure for an observational estimate:

> [Specified exposure contrast] was associated with [direction of outcome] ([adjusted effect measure], [confidence interval]).

Name the exposure contrast and effect-measure scale exactly. Do not translate a hazard ratio into relative or absolute risk. Do not use the enrolled sample size as the analyzed denominator unless the source confirms they are the same.

Structure for a synthesis:

> Across [k] studies including [N] participants, [exposure or intervention] was associated with [outcome] ([summary estimate], [confidence interval], [heterogeneity measure]).

PROCOAG reports the screened, eligible, randomized, and analyzed counts before its primary estimate, then reports the group values, absolute difference, confidence interval, and P value. Its conclusion also retains the unfavorable harm finding. This order prevents a favorable narrative from outrunning the complete result.

### Discussion and limitations

Structure for the opening synthesis:

> In this [design] of [population], [principal finding with direction and uncertainty]. The finding [addresses or does not resolve] [prespecified question].

Structure for a limitation:

> Because [specific source of bias or imprecision], the estimate may be biased [toward or away from the null, or in an unknown direction], which limits [specific inference].

Structure for a bounded conclusion:

> Among [analyzed population], [intervention, exposure, or model] was [result]. These findings [support, do not support, or leave uncertain] [specific implication].

Do not write `more research is needed` alone. Connect the next study to the unresolved threat, population, measurement problem, or decision.

## Editing checks

- Read paragraph-opening sentences as a reverse outline. Each paragraph should make one identifiable contribution.
- Compare every abstract number and conclusion with the corresponding Results source.
- Keep technical names stable instead of rotating synonyms.
- Preserve warranted hedges. Replace vague uncertainty with the design or evidence boundary that causes it.
- Prefer a precise passive construction in Methods over an active sentence that misstates who performed the action.
- Do not copy a published sentence merely because it sounds authoritative. Its syntax can be useful while its claim remains specific to that study.
