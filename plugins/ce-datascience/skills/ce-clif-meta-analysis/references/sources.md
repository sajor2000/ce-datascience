# Primary methods and software sources

Audit date: 2026-10-15. These are method and reporting references, not evidence
that a particular CLIF analysis has consortium approval. Recheck live guidance
and record its exact version when adopting a protocol or generating code.

| Source | Use |
| --- | --- |
| [PRISMA 2020](https://www.prisma-statement.org/prisma-2020) | Reporting checklist, flow diagrams and explanation. |
| [PRISMA extensions](https://www.prisma-statement.org/extensions) | Select the extension matching the design or review component. |
| [MOOSE original statement](https://doi.org/10.1001/jama.283.15.2008) | Reporting meta-analysis of observational epidemiology. |
| [Cochrane Handbook](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current) | Conduct guidance, particularly chapters 4, 5, 7, 10, 13, 14 and 25. |
| [Cochrane chapter 10](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10) | Statistical synthesis, heterogeneity, HKSJ and prediction intervals. |
| [PROSPERO](https://www.crd.york.ac.uk/prospero/) | Current eligibility, timing and registration policy. |
| [Risk of bias tools](https://www.riskofbias.info/) | Official design-specific tools, versions and guidance. |
| [GRADE](https://www.gradeworkinggroup.org/) | Outcome-level certainty of evidence. |
| [SWiM](https://www.bmj.com/content/368/bmj.l6890) | Reporting synthesis without meta-analysis. |
| [CLIF Project Template](https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template) | Local site configuration and reproducible consortium project layout. |
| [metafor rma.uni](https://wviechtb.github.io/metafor/reference/rma.uni.html) | Explicit REML/PM estimator and `test="knha"` inference. |
| [metafor recommendations](https://wviechtb.github.io/metafor/reference/misc-recs.html) | Method selection and recommended inference. |
| [metafor predict](https://wviechtb.github.io/metafor/reference/predict.rma.html) | CI/PI construction and degrees of freedom. |
| [statsmodels combine_effects](https://www.statsmodels.org/stable/generated/statsmodels.stats.meta_analysis.combine_effects.html) | Paule-Mandel (`iterated`/`pm`) and DerSimonian-Laird (`chi2`/`dl`), not REML. |
| [statsmodels implementation](https://www.statsmodels.org/stable/_modules/statsmodels/stats/meta_analysis.html) | Estimated-scale HKSJ versus scale-one intervals and API limitations. |

The documentation URLs above are primary resources. The dated audit reports
separately record which pages were retrieved, access limits, and the resulting
claims. A link alone does not establish source verification.

Access limit: PROSPERO's current eligibility/timing policy was not verified
because the reader received a JavaScript shell and Browserbase remote startup
failed. Do not infer current policy from an older registered protocol. Follow
the live official guidance at the time of a registration decision.
