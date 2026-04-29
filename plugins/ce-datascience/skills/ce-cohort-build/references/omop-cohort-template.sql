-- OMOP cohort template
-- Replace {{...}} placeholders with concept-set IDs and study-window dates.
-- Vocabulary version pinning happens via concept_set table; this query is
-- replayable as long as the concept_set table is itself version-stamped.

WITH primary_dx AS (
  SELECT person_id, MIN(condition_start_date) AS first_dx_date
  FROM condition_occurrence
  WHERE condition_concept_id IN (SELECT concept_id FROM concept_set WHERE concept_set_name = '{{primary_dx_set}}')
  GROUP BY person_id
),
index_event AS (
  SELECT de.person_id, MIN(de.drug_exposure_start_date) AS index_date
  FROM drug_exposure de
  JOIN primary_dx p ON p.person_id = de.person_id
  WHERE de.drug_concept_id IN (SELECT concept_id FROM concept_set WHERE concept_set_name = '{{index_drug_set}}')
    AND de.drug_exposure_start_date >= p.first_dx_date
    AND de.drug_exposure_start_date BETWEEN '{{study_start}}' AND '{{study_end}}'
  GROUP BY de.person_id
),
exclusions AS (
  SELECT de.person_id
  FROM drug_exposure de
  JOIN index_event i ON i.person_id = de.person_id
  WHERE de.drug_concept_id IN (SELECT concept_id FROM concept_set WHERE concept_set_name = '{{washout_drug_set}}')
    AND de.drug_exposure_start_date BETWEEN i.index_date - INTERVAL '365 days' AND i.index_date - INTERVAL '1 day'
),
continuous_enroll AS (
  SELECT op.person_id, i.index_date
  FROM observation_period op
  JOIN index_event i ON i.person_id = op.person_id
  WHERE op.observation_period_start_date <= i.index_date - INTERVAL '365 days'
    AND op.observation_period_end_date >= i.index_date
)
SELECT ce.person_id, ce.index_date
FROM continuous_enroll ce
WHERE ce.person_id NOT IN (SELECT person_id FROM exclusions)
ORDER BY ce.person_id;

-- Waterfall capture: run each CTE alone with COUNT(DISTINCT person_id)
-- and write the result to analysis/cohort/<cohort>-waterfall.csv
