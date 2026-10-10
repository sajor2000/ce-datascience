# PROSPERO Registration Template (Systematic Reviews)

## Contents

- 1. Review title
- 2. Original language title
- 3. Anticipated or actual start date
- 4. Anticipated completion date
- 5. Stage of review at submission
- 6. Named contact
- 7. Named contact organisation
- 8. Funding sources / sponsors
- 9. Conflicts of interest
- 10. Collaborators
- 11. Review question
- 12. Searches
- 13. URL to search strategy (if applicable)
- 14. Condition or domain being studied
- 15. Participants / population
- 16. Intervention(s) / exposure(s)
- 17. Comparator(s) / control
- 18. Types of study to be included
- 19. Context
- 20. Main outcome(s)
- 21. Additional outcome(s)
- 22. Data extraction (selection and coding)
- 23. Risk of bias (quality) assessment
- 24. Strategy for data synthesis
- 25. Analysis of subgroups or subsets
- 26. Type and method of review
- 27. Country, language, dissemination

For systematic reviews of human / animal studies. Submit at https://www.crd.york.ac.uk/PROSPERO/

Placeholders: `{{ SAP-N.M: ... }}` is that section of the `ce-plan` SAP; `{{ SAP title }}` is the SAP H1; `{{ user: ... }}` comes from the user or project study metadata (never SAP frontmatter; ask, never invent); `{{ protocol: ... }}` marks a field that is not in the SAP template; take it from the systematic-review protocol.

## 1. Review title

{{ SAP title }}

## 2. Original language title

(Same as above unless translated)

## 3. Anticipated or actual start date

{{ user: review start date }}

## 4. Anticipated completion date

{{ user: review completion date }}

## 5. Stage of review at submission

{{ "Preliminary searches" / "Piloting of selection process" / "Formal screening of search results against eligibility criteria" / "Data extraction" / "Completed but not published" }}

## 6. Named contact

{{ user: contact name }}, {{ user: contact email }}

## 7. Named contact organisation

{{ user: affiliation }}

## 8. Funding sources / sponsors

{{ user: funding }}

## 9. Conflicts of interest

{{ user: conflicts | default("None declared") }}

## 10. Collaborators

{{ user: authors / collaborators }}

## 11. Review question

{{ SAP-1.1: primary objective / review question }}

## 12. Searches

Not in the SAP template; take from the systematic-review protocol.

Databases:
{{ protocol: databases }} (list every database the protocol names; there is no default list)

Search dates: from {{ protocol: search start | default("inception") }} to {{ protocol: search end }}.

Language restrictions: {{ protocol: language restrictions | default("English") }}

Search strategy: see `analysis/pubmed/<query>-<date>.md` (output of `ce-pubmed`)

## 13. URL to search strategy (if applicable)

{{ protocol: search strategy URL | default("Stored in repository at analysis/pubmed/") }}

## 14. Condition or domain being studied

{{ SAP-1.1 and SAP-2.2: condition or domain }}

## 15. Participants / population

{{ SAP-2.2: study population }}

## 16. Intervention(s) / exposure(s)

{{ SAP-2.3: exposure / intervention }}

## 17. Comparator(s) / control

{{ SAP-2.4: comparator }}

## 18. Types of study to be included

{{ SAP-2.2: eligible study designs (inclusion / exclusion criteria) }}

## 19. Context

{{ SAP-2.2: setting and source population }}

## 20. Main outcome(s)

{{ SAP-3.1: primary endpoints }}

## 21. Additional outcome(s)

{{ SAP-3.2: secondary endpoints }}

## 22. Data extraction (selection and coding)

Not in the SAP template; take from the systematic-review protocol.

{{ protocol: selection and extraction process }} -- two reviewers, disagreements resolved by consensus or third reviewer.

## 23. Risk of bias (quality) assessment

Not in the SAP template; take from the systematic-review protocol.

{{ protocol: risk-of-bias tools }} -- e.g., Cochrane RoB 2 for RCTs, ROBINS-I for non-randomized, QUADAS-2 for diagnostic accuracy.

## 24. Strategy for data synthesis

{{ SAP-5.1: pooling model }} -- meta-analysis (random-effects, REML; heterogeneity by I^2; subgroup pre-specified). Sensitivity analyses: {{ SAP-9: sensitivity analyses }}. If pooling is not feasible, take the narrative-synthesis rules from the systematic-review protocol when the SAP does not state them.

## 25. Analysis of subgroups or subsets

{{ SAP-5.3: subgroup analyses }}

## 26. Type and method of review

{{ "Systematic review" / "Systematic review and meta-analysis" / "Network meta-analysis" / "Diagnostic test accuracy review" }}

## 27. Country, language, dissemination

{{ user: country }} | {{ user: publication language }} | {{ user: dissemination plan }}
