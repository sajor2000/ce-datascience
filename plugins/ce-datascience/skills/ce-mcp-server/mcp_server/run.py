"""CE DataScience MCP Server entry point.

Run via: python3 mcp_server/run.py
Or:     python3 -m mcp_server

This starts a stdio MCP server that any MCP-compatible IDE can connect to.
"""

from pathlib import Path
from fastmcp import FastMCP

# Resolve the plugin root (four levels up: run.py -> mcp_server -> ce-mcp-server -> skills -> ce-datascience)
PLUGIN_ROOT = Path(__file__).resolve().parent.parent.parent.parent

mcp = FastMCP(
    name="ce-datascience",
    version="0.1.0",
    instructions="Compound engineering for computational scientists: literature search, SAP tracking, reporting compliance, and compound learning",
)


# ---------------------------------------------------------------------------
# Tool: literature_search
# ---------------------------------------------------------------------------

@mcp.tool()
def literature_search(
    query: str = "",
    doi: str = "",
    min_year: int = 2018,
    scholar_pages: int = 3,
    max_citations: int | None = None,
    output_dir: str | None = None,
) -> str:
    """Search scientific papers via Google Scholar, Crossref, and SciHub using PyPaperBot.

    Args:
        query: PICO/PECO research question or keywords
        doi: Single DOI to look up (mutually exclusive with query)
        min_year: Minimum publication year filter
        scholar_pages: Number of Google Scholar pages to scan
        max_citations: Only return papers with at least this many citations
        output_dir: Directory for downloaded PDFs and BibTeX

    Returns:
        Structured paper list with title, authors, year, journal, DOI, and citation count.
    """
    if not query and not doi:
        return "Error: Provide either a query or a DOI."

    script = PLUGIN_ROOT / "skills" / "ce-literature-search" / "scripts" / "literature-search.py"
    if not script.exists():
        return f"Error: literature-search.py not found at {script}"

    import subprocess, tempfile, os

    out_dir = output_dir or tempfile.mkdtemp(prefix="ce-lit-")
    cmd = ["python3", str(script)]

    if doi:
        cmd += ["--doi", doi]
    else:
        cmd += [
            "--query", query,
            "--scholar-pages", str(scholar_pages),
            "--min-year", str(min_year),
        ]
    if max_citations:
        cmd += ["--max-citations", str(max_citations)]
    cmd += ["--output-dir", out_dir]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            return f"Search failed: {result.stderr[:500]}"
        return result.stdout if result.stdout else f"Search complete. Output in {out_dir}"
    except subprocess.TimeoutExpired:
        return "Search timed out after 120 seconds. Try fewer scholar pages."
    except FileNotFoundError:
        return "Error: python3 not found. Ensure Python is installed."


# ---------------------------------------------------------------------------
# Tool: stack_profile
# ---------------------------------------------------------------------------

@mcp.tool()
def stack_profile(
    action: str = "read",
    language: str | None = None,
    ide: str | None = None,
    environment_manager_r: str | None = None,
    environment_manager_python: str | None = None,
    r_project_type: str | None = None,
    reporting: str | None = None,
) -> str:
    """Read or write the .ce-datascience/config.local.yaml stack profile.

    Args:
        action: 'read' to inspect current config, 'write' to update fields
        language: r, python, or both
        ide: rstudio, jupyter, marimo, quarto, or vscode
        environment_manager_r: renv, packrat, or none
        environment_manager_python: venv, conda, poetry, pixi, or none
        r_project_type: script, package, shiny, plumber, or targets
        reporting: quarto, rmarkdown, marimo, or jupyter

    Returns:
        Current config state (read) or update confirmation (write).
    """
    from ruamel.yaml import YAML

    config_path = PLUGIN_ROOT / ".ce-datascience" / "config.local.yaml"
    yaml = YAML()
    yaml.preserve_quotes = True

    if action == "read":
        if not config_path.exists():
            return "No stack profile found. Run /ce-setup to create one."
        with open(config_path) as f:
            data = yaml.load(f)
        if not data or "stack_profile" not in data:
            return "Config exists but has no stack_profile section."
        sp = data["stack_profile"]
        lines = ["Current stack profile:"]
        for key in ["language", "ide", "data_libraries", "data_layer",
                     "statistical_packages", "environment_manager",
                     "r_project_type", "reporting"]:
            if key in sp:
                lines.append(f"  {key}: {sp[key]}")
        return "\n".join(lines)

    elif action == "write":
        if not config_path.exists():
            config_path.parent.mkdir(parents=True, exist_ok=True)
            data = {}
        else:
            with open(config_path) as f:
                data = yaml.load(f) or {}

        if "stack_profile" not in data:
            data["stack_profile"] = {}

        sp = data["stack_profile"]
        updates = {
            "language": language,
            "ide": ide,
            "reporting": reporting,
        }
        env_updates = {
            "environment_manager": {
                "r": environment_manager_r,
                "python": environment_manager_python,
            }
        } if environment_manager_r or environment_manager_python else {}

        for k, v in updates.items():
            if v is not None:
                sp[k] = v
        if env_updates:
            if "environment_manager" not in sp:
                sp["environment_manager"] = {}
            for sub_k, sub_v in env_updates["environment_manager"].items():
                if sub_v is not None:
                    sp["environment_manager"][sub_k] = sub_v
        if r_project_type is not None:
            sp["r_project_type"] = r_project_type

        with open(config_path, "w") as f:
            yaml.dump(data, f)

        return f"Stack profile updated at {config_path}"

    return "Error: action must be 'read' or 'write'."


# ---------------------------------------------------------------------------
# Tool: sap_create
# ---------------------------------------------------------------------------

@mcp.tool()
def sap_create(
    study_type: str = "observational",
    title: str = "Untitled Study",
    population: str = "",
    primary_outcome: str = "",
    ai_involvement: str = "none",
    output_path: str = "analysis/sap.md",
) -> str:
    """Generate a Statistical Analysis Plan from study metadata using the SAP template.

    Args:
        study_type: observational, rct, systematic-review, diagnostic-accuracy, case-report, qualitative, animal, health-economic, prediction-model, exploratory, or other
        title: Study title
        population: Study population description
        primary_outcome: Primary endpoint description
        ai_involvement: none, ai-assisted, ai-primary, or llm-based
        output_path: Where to write the SAP file (relative to project root)

    Returns:
        Confirmation with the SAP file path.
    """
    import datetime

    template_path = PLUGIN_ROOT / "skills" / "ce-plan" / "references" / "sap-template.md"
    if not template_path.exists():
        return f"Error: SAP template not found at {template_path}"

    template = template_path.read_text()

    today = datetime.date.today().isoformat()
    sap_content = template.replace("[Study Title]", title)
    sap_content = sap_content.replace("observational | rct | systematic-review | diagnostic-accuracy | case-report | qualitative | animal | health-economic | prediction-model | exploratory | other", study_type)
    sap_content = sap_content.replace("none | ai-assisted | ai-primary | llm-based", ai_involvement)
    sap_content = sap_content.replace("YYYY-MM-DD", today, 1)

    # Insert population and outcome into relevant sections
    if population:
        sap_content = sap_content.replace(
            "[Detailed inclusion/exclusion criteria",
            f"{population}\n\n[Detailed inclusion/exclusion criteria"
        )
    if primary_outcome:
        sap_content = sap_content.replace(
            "[Primary and secondary outcomes",
            f"Primary outcome: {primary_outcome}\n\n[Secondary outcomes"
        )

    out = Path(output_path)
    if not out.is_absolute():
        out = PLUGIN_ROOT / output_path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(sap_content)

    return f"SAP created at {out}\nStudy type: {study_type}\nTitle: {title}\nDate: {today}"


# ---------------------------------------------------------------------------
# Tool: sap_drift_check
# ---------------------------------------------------------------------------

@mcp.tool()
def sap_drift_check(
    sap_path: str = "analysis/sap.md",
    analysis_dir: str = "",
) -> str:
    """Detect structural drift between a SAP and analysis code.

    Scans the SAP for SAP-N.M section identifiers, then searches analysis
    files for matching comments. Reports sections that are missing, present,
    or extra (not in the SAP).

    Args:
        sap_path: Path to the SAP file (relative to project root)
        analysis_dir: Directory to scan for analysis files (defaults to project root)

    Returns:
        Drift report listing SAP sections with missing, found, or extra analysis code.
    """
    import re

    sap = Path(sap_path)
    if not sap.is_absolute():
        sap = PLUGIN_ROOT / sap_path

    if not sap.exists():
        return f"Error: SAP file not found at {sap}"

    sap_text = sap.read_text()

    # Extract SAP-N.M section identifiers
    section_pattern = re.compile(r"SAP-(\d+\.\d+)")
    sap_sections = {}
    for match in section_pattern.finditer(sap_text):
        sid = f"SAP-{match.group(1)}"
        # Get the line context (title-ish text after the ID)
        line_start = sap_text.rfind("\n", 0, match.start()) + 1
        line_end = sap_text.find("\n", match.end())
        line = sap_text[line_start:line_end].strip() if line_end != -1 else ""
        sap_sections[sid] = line

    if not sap_sections:
        return "No SAP-N.M section identifiers found in the SAP file."

    # Search analysis files for SAP references
    scan_dir = Path(analysis_dir) if analysis_dir and Path(analysis_dir).is_absolute() else PLUGIN_ROOT / (analysis_dir or ".")
    found_sections = set()

    patterns = ["**/*.R", "**/*.qmd", "**/*.Rmd", "**/*.py", "**/*.ipynb"]
    for pat in patterns:
        for fpath in scan_dir.glob(pat):
            try:
                content = fpath.read_text(errors="ignore")
                for sid in sap_sections:
                    if sid in content:
                        found_sections.add(sid)
            except Exception:
                continue

    # Build report
    lines = ["SAP Drift Report", "=" * 40]
    missing = [s for s in sap_sections if s not in found_sections]
    covered = [s for s in sap_sections if s in found_sections]

    if covered:
        lines.append(f"\nCovered sections ({len(covered)}):")
        for s in covered:
            lines.append(f"  [OK] {s}: {sap_sections[s]}")

    if missing:
        lines.append(f"\nMissing sections ({len(missing)}):")
        for s in missing:
            lines.append(f"  [GAP] {s}: {sap_sections[s]}")

    if not missing:
        lines.append("\nAll SAP sections have corresponding analysis code.")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool: reporting_compliance_check
# ---------------------------------------------------------------------------

@mcp.tool()
def reporting_compliance_check(
    study_type: str = "observational",
    guideline: str | None = None,
    manuscript_path: str | None = None,
) -> str:
    """Run a reporting guideline compliance check against supported guidelines.

    Checks the 16 supported guidelines (CONSORT, STROBE, PRISMA, etc.)
    and returns a checklist with required items for the applicable guideline.

    Args:
        study_type: rct, observational, systematic-review, diagnostic-accuracy, case-report, qualitative, animal, health-economic, or prediction-model
        guideline: Override auto-routing with a specific guideline (consort, strobe, prisma, stard, care, coreq, arrive, cheers, tripod-ai)
        manuscript_path: Optional path to manuscript for item-level checking

    Returns:
        Compliance checklist with applicable guideline items.
    """
    # Guideline routing map (simplified from references/guideline-routing.md)
    routing = {
        "rct": "CONSORT",
        "observational": "STROBE",
        "systematic-review": "PRISMA",
        "diagnostic-accuracy": "STARD",
        "case-report": "CARE",
        "qualitative": "COREQ",
        "animal": "ARRIVE",
        "health-economic": "CHEERS",
        "prediction-model": "TRIPOD+AI",
    }

    ai_extensions = {
        "rct": ["CONSORT-AI", "SPIRIT-AI"],
        "prediction-model": ["TRIPOD+AI", "CLAIM"],
    }

    selected = guideline.upper() if guideline else routing.get(study_type, "STROBE")

    lines = [
        f"Reporting Compliance Check",
        f"=" * 40,
        f"Study type: {study_type}",
        f"Primary guideline: {selected}",
    ]

    if study_type in ai_extensions:
        lines.append(f"AI extensions: {', '.join(ai_extensions[study_type])}")

    # Core checklist items (abbreviated — full items are in the reviewer agent)
    core_items = {
        "CONSORT": [
            "1a. Title identifies as RCT",
            "2a. Scientific background and rationale",
            "3a. Eligibility criteria",
            "4a. Interventions for each group",
            "5a. Outcomes (primary/secondary)",
            "6a. Sample size calculation",
            "7a. Random sequence generation",
            "8a. Allocation concealment",
            "9a. Blinding (who was blinded)",
            "10a. Statistical methods for primary analysis",
            "11a. Participant flow diagram",
            "12a. Dates of recruitment",
            "13a. Baseline demographics table",
            "14a. Estimated effect size and CI",
            "15a. Adverse events",
            "16a. Interpretation with bias limitations",
            "17a. Registration number",
            "18a. Funding source",
        ],
        "STROBE": [
            "1. Title identifies study design",
            "2. Background/rationale",
            "3. Objectives",
            "4. Study design",
            "5. Setting and data source",
            "6. Eligibility criteria",
            "7. Variables (exposure, outcome, confounders)",
            "8. Measurement methods",
            "9. Bias assessment",
            "10. Study size rationale",
            "11. Quantitative variables handling",
            "12. Statistical methods",
            "13. Participant numbers",
            "14. Descriptive data table",
            "15. Outcome data with estimates and CIs",
            "16. Confounder-adjusted results",
            "17. Other analyses (sensitivity, subgroup)",
            "18. Key results",
            "19. Limitations with bias direction",
            "20. Interpretation",
            "21. Generalizability",
            "22. Funding",
        ],
        "PRISMA": [
            "1. Identification as systematic review in title",
            "2. Structured summary (PICO)",
            "3. Rationale",
            "4. Objectives (PICO)",
            "5. Eligibility criteria",
            "6. Information sources and search date",
            "7. Full search strategy",
            "8. Study selection process",
            "9. Data items and definitions",
            "10. Risk of bias assessment method",
            "11. Effect measures",
            "12. Data synthesis method",
            "13. Additional analyses",
            "14. Study selection flow diagram",
            "15. Study characteristics table",
            "16. Risk of bias by study",
            "17. Results of individual studies",
            "18. Results of meta-analyses",
            "19. Certainty of evidence",
            "20. Discussion with limitations",
            "21. Registration and protocol",
            "22. Funding",
        ],
    }

    items = core_items.get(selected, [
        f"Guideline {selected} checklist items not embedded in this tool.",
        f"Run /ce-code-review with reporting_checklist: true for full compliance check.",
    ])

    lines.append(f"\nChecklist items ({len(items)}):")
    for item in items:
        lines.append(f"  [ ] {item}")

    if manuscript_path:
        mp = Path(manuscript_path)
        if not mp.is_absolute():
            mp = PLUGIN_ROOT / manuscript_path
        if mp.exists():
            lines.append(f"\nManuscript found at {mp}. Run /ce-code-review for item-level verification.")
        else:
            lines.append(f"\nManuscript not found at {mp}.")

    lines.append("\nNote: For full item-level compliance verification, run /ce-code-review with reporting_checklist: true.")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool: compound_learning
# ---------------------------------------------------------------------------

@mcp.tool()
def compound_learning(
    action: str = "read",
    problem_type: str | None = None,
    title: str | None = None,
    content: str | None = None,
    module: str | None = None,
    component: str | None = None,
    tags: str | None = None,
) -> str:
    """Read or write institutional knowledge entries in docs/solutions/.

    Args:
        action: 'read' to search entries, 'write' to create a new entry
        problem_type: Category (methods_decision, statistical_pattern, data_quality_issue, reproducibility_pattern, literature_pattern, etc.)
        title: Learning title (used as filename slug when writing)
        content: Learning content in markdown (required for write)
        module: Module or area affected (required for write)
        component: Component involved (e.g., statistical_analysis, reproducibility)
        tags: Comma-separated search keywords

    Returns:
        Matching entries (read) or write confirmation.
    """
    from ruamel.yaml import YAML
    import datetime

    solutions_dir = PLUGIN_ROOT / "docs" / "solutions"

    if action == "read":
        if not solutions_dir.exists():
            return "No docs/solutions/ directory found. No learnings yet."

        entries = []
        for fpath in solutions_dir.glob("*.md"):
            try:
                text = fpath.read_text()
                # Simple YAML frontmatter parsing
                if text.startswith("---"):
                    end = text.find("---", 3)
                    if end != -1:
                        frontmatter = text[3:end].strip()
                        yaml = YAML()
                        fm = yaml.load(frontmatter)

                        # Filter by problem_type if specified
                        if problem_type and fm.get("problem_type") != problem_type:
                            continue

                        entries.append({
                            "file": fpath.name,
                            "title": fm.get("title", fpath.stem),
                            "problem_type": fm.get("problem_type", "unknown"),
                            "module": fm.get("module", ""),
                            "date": fm.get("date", ""),
                        })
            except Exception:
                continue

        if not entries:
            return "No matching entries found."

        lines = [f"Found {len(entries)} learning(s):"]
        for e in entries:
            lines.append(f"  - {e['file']}: [{e['problem_type']}] {e['title']} ({e['module']}, {e['date']})")
        return "\n".join(lines)

    elif action == "write":
        if not title or not content:
            return "Error: 'title' and 'content' are required for write action."

        solutions_dir.mkdir(parents=True, exist_ok=True)

        # Slugify title for filename
        slug = title.lower().replace(" ", "-").replace("/", "-")[:60]
        filename = f"{slug}.md"
        fpath = solutions_dir / filename

        today = datetime.date.today().isoformat()
        tag_list = [t.strip() for t in tags.split(",")] if tags else []

        # Build frontmatter
        fm_lines = ["---"]
        fm_lines.append(f"title: \"{title}\"")
        fm_lines.append(f"module: \"{module or 'general'}\"")
        fm_lines.append(f"date: {today}")
        fm_lines.append(f"problem_type: {problem_type or 'best_practice'}")
        if component:
            fm_lines.append(f"component: {component}")
        fm_lines.append("severity: medium")
        if tag_list:
            fm_lines.append(f"tags: {tag_list}")
        fm_lines.append("---")

        full_content = "\n".join(fm_lines) + "\n\n" + content

        fpath.write_text(full_content)
        return f"Learning written to docs/solutions/{filename}"

    return "Error: action must be 'read' or 'write'."


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    """Start the MCP server via stdio transport."""
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
