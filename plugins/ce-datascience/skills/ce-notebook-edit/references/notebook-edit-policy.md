# Notebook Edit Policy

Use `.ipynb` edits only when preserving an existing notebook is the user's explicit need or the project standard. For new analysis work, prefer text-native formats (`.py`, `.qmd`, `.Rmd`, or marimo `.py`) because they diff and validate more reliably.

## Required Anchors

Every edit must target exactly one existing cell metadata tag:

```json
{
  "cell_type": "markdown",
  "metadata": {
    "tags": ["sap-5-1"]
  },
  "source": "..."
}
```

Do not target a cell by visible heading text alone. Headings change during drafting; metadata tags are the stable anchor.

## Review Checklist

- The backup file exists and contains the pre-edit notebook.
- The inserted cell appears immediately after the intended tagged cell.
- The inserted cell has a metadata tag that ties it to the SAP section, review finding, or publication artifact.
- The notebook validates structurally.
- A top-to-bottom run was attempted, or the inability to run it is documented.
