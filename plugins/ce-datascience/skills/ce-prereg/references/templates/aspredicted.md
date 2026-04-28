# AsPredicted Pre-Registration Template

Lightweight 9-question pre-registration. Suitable for behavioral / decision-science / lab-experimental work. Submit at https://aspredicted.org/

## 1. Have any data been collected for this study already?

- ☐ No, no data have been collected yet
- ☐ It's complicated -- partial data collection (explain in 9)

## 2. What's the main question being asked or hypothesis being tested in this study?

{{ sap.section_3_1_primary_hypothesis }}

## 3. Describe the key dependent variable(s) specifying how they will be measured.

{{ sap.section_2_3_outcomes }}

For each outcome: name, measurement instrument, scale / units, time of assessment.

## 4. How many and which conditions will participants be assigned to?

{{ sap.section_1_3_design_detail }}

(Number of arms, names of arms, allocation ratio, blinding.)

## 5. Specify exactly which analyses you will conduct to examine the main question / hypothesis.

{{ sap.section_4_1_primary_model }}

(One sentence describing the model, with all covariates, the test statistic, and the alpha level.)

## 6. Describe exactly how outliers will be defined and handled, and your precise rule(s) for excluding observations.

{{ sap.section_2_3_exclusions }}

(Define outlier rule BEFORE looking at the data. "We will exclude observations more than 3 SD from the mean of the relevant variable, computed within condition.")

## 7. How many observations will be collected or what will determine sample size?

{{ sap.section_2_5_sample_size }}

(With power analysis output: target N, alpha, power, effect size assumption, citation for the assumption.)

## 8. Anything else you would like to pre-register?

{{ sap.section_4_exploratory | default("Exploratory analyses (not pre-registered): subgroup analyses by sex, age, and recruitment site -- to be reported with explicit 'exploratory' labeling.") }}

## 9. Name the type of study you are pre-registering.

{{ "Class I -- pre-registration of analyses for confirmatory study, no data collected" }}

(Or other class as applicable.)
