# PROSPERO Registration Template (Systematic Reviews)

For systematic reviews of human / animal studies. Submit at https://www.crd.york.ac.uk/PROSPERO/

## 1. Review title

{{ sap.title }}

## 2. Original language title

(Same as above unless translated)

## 3. Anticipated or actual start date

{{ sap.frontmatter.review_start }}

## 4. Anticipated completion date

{{ sap.frontmatter.review_completion }}

## 5. Stage of review at submission

{{ "Preliminary searches" / "Piloting of selection process" / "Formal screening of search results against eligibility criteria" / "Data extraction" / "Completed but not published" }}

## 6. Named contact

{{ sap.frontmatter.contact_name }}, {{ sap.frontmatter.contact_email }}

## 7. Named contact organisation

{{ sap.frontmatter.affiliation }}

## 8. Funding sources / sponsors

{{ sap.frontmatter.funding }}

## 9. Conflicts of interest

{{ sap.frontmatter.conflicts | default("None declared") }}

## 10. Collaborators

{{ sap.frontmatter.authors }}

## 11. Review question

{{ sap.section_1_1_research_question }}

## 12. Searches

Databases:
{{ sap.section_2_1_databases | default("PubMed, Embase, Cochrane CENTRAL, Web of Science") }}

Search dates: from {{ sap.section_2_1_search_from | default("inception") }} to {{ sap.section_2_1_search_to }}.

Language restrictions: {{ sap.section_2_1_language | default("English") }}

Search strategy: see `analysis/pubmed/<query>-<date>.md` (output of `/ce-pubmed`)

## 13. URL to search strategy (if applicable)

{{ sap.section_2_1_search_strategy_url | default("Stored in repository at analysis/pubmed/") }}

## 14. Condition or domain being studied

{{ sap.section_3_condition }}

## 15. Participants / population

{{ sap.section_2_2_population }}

## 16. Intervention(s) / exposure(s)

{{ sap.section_2_3_intervention }}

## 17. Comparator(s) / control

{{ sap.section_2_4_comparator }}

## 18. Types of study to be included

{{ sap.section_2_5_study_types }}

## 19. Context

{{ sap.section_1_2_context }}

## 20. Main outcome(s)

{{ sap.section_3_1_primary_outcomes }}

## 21. Additional outcome(s)

{{ sap.section_3_2_secondary_outcomes }}

## 22. Data extraction (selection and coding)

{{ sap.section_4_1_extraction }} -- two reviewers, disagreements resolved by consensus or third reviewer.

## 23. Risk of bias (quality) assessment

{{ sap.section_4_2_risk_of_bias }} -- e.g., Cochrane RoB 2 for RCTs, ROBINS-I for non-randomized, QUADAS-2 for diagnostic accuracy.

## 24. Strategy for data synthesis

{{ sap.section_4_3_synthesis }} -- meta-analysis (random-effects, REML; heterogeneity by I^2; subgroup pre-specified) or narrative synthesis if pooling not feasible.

## 25. Analysis of subgroups or subsets

{{ sap.section_4_4_subgroups }}

## 26. Type and method of review

{{ "Systematic review" / "Systematic review and meta-analysis" / "Network meta-analysis" / "Diagnostic test accuracy review" }}

## 27. Country, language, dissemination

{{ sap.frontmatter.country }} | {{ sap.frontmatter.publication_language }} | {{ sap.frontmatter.dissemination_plan }}
