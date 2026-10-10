# AsPredicted Pre-Registration Template

Lightweight 9-question pre-registration. Suitable for behavioral / decision-science / lab-experimental work. Submit at https://aspredicted.org/

Placeholders: `{{ SAP-N.M: ... }}` is that section of the `ce-plan` SAP; `{{ user: ... }}` comes from the user or project study metadata (never SAP frontmatter; ask, never invent).

## 1. Have any data been collected for this study already?

- ☐ No, no data have been collected yet
- ☐ It's complicated -- partial data collection (explain in 9)

## 2. What's the main question being asked or hypothesis being tested in this study?

{{ SAP-1.1: primary objective / hypothesis }}

## 3. Describe the key dependent variable(s) specifying how they will be measured.

{{ SAP-3.1: primary endpoint }}
{{ SAP-3.2: secondary endpoints, if any }}

For each outcome: name, measurement instrument, scale / units, time of assessment.

## 4. How many and which conditions will participants be assigned to?

{{ SAP-2.3: intervention }} vs {{ SAP-2.4: comparator }}

(Number of arms, names of arms, allocation ratio, blinding.)

## 5. Specify exactly which analyses you will conduct to examine the main question / hypothesis.

{{ SAP-5.1: primary analysis }}

(One sentence describing the model, with all covariates, the test statistic, and the alpha level.)

## 6. Describe exactly how outliers will be defined and handled, and your precise rule(s) for excluding observations.

{{ SAP-2.2: exclusion criteria }}
{{ SAP-4.1: primary analysis population }}

(Define outlier rule BEFORE looking at the data. "We will exclude observations more than 3 SD from the mean of the relevant variable, computed within condition.")

## 7. How many observations will be collected or what will determine sample size?

{{ SAP-6: sample size and power }}

(With power analysis output: target N, alpha, power, effect size assumption, citation for the assumption.)

## 8. Anything else you would like to pre-register?

{{ SAP-1.3 and SAP-3.3: exploratory objectives and endpoints | default("Exploratory analyses (not pre-registered): subgroup analyses by sex, age, and recruitment site -- to be reported with explicit 'exploratory' labeling.") }}
{{ SAP-9: sensitivity analyses }}

## 9. Name the type of study you are pre-registering.

{{ "Class I -- pre-registration of analyses for confirmatory study, no data collected" }}

(Or other class as applicable.)
