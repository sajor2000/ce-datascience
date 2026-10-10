# Figure Manifest Specification

Each figure entry must be traceable to the analysis and manuscript contract.

| Field | Required | Meaning |
|---|---|---|
| `figure_id` | Yes | Stable figure identifier, such as `fig1` |
| `sap_section` | Yes | SAP section the figure supports |
| `source_data` | Yes | Repo-relative data file used to render the figure |
| `source_code` | Yes | Repo-relative script or notebook that renders the figure |
| `output_path` | Yes | Repo-relative exported figure path |
| `caption` | Yes | Manuscript-ready caption draft |
| `alt_text` | Yes | Accessibility text for HTML/manuscript packages |
| `style_profile` | Yes | Figure style profile: `clinical-standard` (default) or a journal override such as `jama` or `generic-biomedical` |
| `checklist_items` | Recommended | Reporting-guideline items this figure supports |

Do not package native statistical-software figures as the only deliverable. Export vector or high-resolution raster files alongside the source code and source data.
