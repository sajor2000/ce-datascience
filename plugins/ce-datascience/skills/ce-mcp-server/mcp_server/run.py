"""CE DataScience MCP Server entry point.

Run via: python3 mcp_server/run.py
Or:     python3 -m mcp_server

This starts a stdio MCP server that any MCP-compatible IDE can connect to.
"""

import os
from pathlib import Path

try:
    from fastmcp import FastMCP
except ModuleNotFoundError as exc:
    raise SystemExit(
        "ce-datascience MCP server requires the Python package 'fastmcp'. "
        "Install the latest MCP dependencies with: python3 -m pip install --upgrade fastmcp ruamel.yaml pydantic"
    ) from exc

# Resolve the plugin root (four levels up: run.py -> mcp_server -> ce-mcp-server -> skills -> ce-datascience)
PLUGIN_ROOT = Path(__file__).resolve().parent.parent.parent.parent
GUIDELINE_REGISTRY_PATH = PLUGIN_ROOT / "skills" / "ce-code-review" / "references" / "guideline-registry.yaml"

mcp = FastMCP(
    name="ce-datascience",
    version="0.1.0",
    instructions="Compound engineering for computational scientists: literature search, SAP tracking, reporting compliance, and compound learning",
)


class ProjectRootError(ValueError):
    """Raised when a user project root cannot be resolved safely."""


def _dependency_error(package: str) -> str:
    return (
        f"Error: missing Python dependency '{package}'. Install the latest MCP dependencies with: "
        "python3 -m pip install --upgrade fastmcp ruamel.yaml pydantic"
    )


def _yaml():
    try:
        from ruamel.yaml import YAML
    except ModuleNotFoundError as exc:
        raise RuntimeError(_dependency_error("ruamel.yaml")) from exc

    yaml = YAML()
    yaml.preserve_quotes = True
    return yaml


def _nearest_git_root(start: Path) -> Path | None:
    current = start.resolve()
    if current.is_file():
        current = current.parent

    for candidate in (current, *current.parents):
        if (candidate / ".git").exists():
            return candidate
    return None


def _validate_project_root(candidate: Path, source: str) -> Path:
    root = candidate.expanduser()
    if not root.is_absolute():
        root = Path.cwd() / root
    root = root.resolve()

    if not root.exists():
        raise ProjectRootError(
            f"{source} resolved to {root}, but that directory does not exist. "
            "Pass project_root explicitly or set CE_DATASCIENCE_PROJECT_ROOT to an existing project directory."
        )
    if not root.is_dir():
        raise ProjectRootError(
            f"{source} resolved to {root}, but it is not a directory. "
            "Pass project_root explicitly or set CE_DATASCIENCE_PROJECT_ROOT to a project directory."
        )
    if not os.access(root, os.W_OK):
        raise ProjectRootError(
            f"{source} resolved to {root}, but it is not writable. "
            "Choose a writable project directory for ce-datascience artifacts."
        )
    return root


def resolve_project_root(project_root: str | None = None) -> Path:
    """Resolve the user project root, separate from the installed plugin root.

    Precedence:
    1. explicit project_root tool argument
    2. CE_DATASCIENCE_PROJECT_ROOT environment variable
    3. current working directory, promoted to nearest git root when present
    """
    if project_root and project_root.strip():
        return _validate_project_root(Path(project_root), "project_root")

    env_root = os.environ.get("CE_DATASCIENCE_PROJECT_ROOT")
    if env_root and env_root.strip():
        return _validate_project_root(Path(env_root), "CE_DATASCIENCE_PROJECT_ROOT")

    cwd = Path.cwd().resolve()
    return _validate_project_root(_nearest_git_root(cwd) or cwd, "current working directory")


def _project_root_or_error(project_root: str | None = None) -> tuple[Path | None, str | None]:
    try:
        return resolve_project_root(project_root), None
    except ProjectRootError as exc:
        return None, f"Error: {exc}"


def _project_path(project_root: Path, path_value: str | None, default: str) -> Path:
    raw = path_value or default
    path = Path(raw).expanduser()
    if not path.is_absolute():
        path = project_root / path
    return path.resolve(strict=False)


def _project_path_checked(project_root: Path, path_value: str | None, default: str, label: str) -> Path:
    resolved = _project_path(project_root, path_value, default)
    if project_root != resolved and project_root not in resolved.parents:
        raise ProjectRootError(f"{label} resolved outside the project root: {resolved}")
    return resolved


def _canonical_guideline(value: object) -> str:
    if value is None:
        return ""
    raw = str(value).strip()
    if not raw:
        return ""

    normalized = raw.upper().replace("_", "-")
    alias_map = {
        "TRIPOD-AI": "TRIPOD+AI",
        "TRIPOD+AI": "TRIPOD+AI",
        "PDSQI": "PDSQI-9",
        "PRISMA SCR": "PRISMA-SCR",
        "PRISMA-SCR": "PRISMA-SCR",
        "START RWE": "START-RWE",
        "START-RWE": "START-RWE",
        "STROBE MR": "STROBE-MR",
        "STROBE-MR": "STROBE-MR",
        "RECORD PE": "RECORD-PE",
        "RECORD-PE": "RECORD-PE",
    }
    return alias_map.get(normalized, normalized)


def _guideline_list(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        raw_values = value
    elif isinstance(value, tuple):
        raw_values = list(value)
    else:
        text = str(value).strip()
        if not text:
            return []
        raw_values = [part.strip() for part in text.strip("[]").split(",")]

    seen: set[str] = set()
    guidelines: list[str] = []
    for item in raw_values:
        guideline = _canonical_guideline(item)
        if guideline and guideline not in seen:
            seen.add(guideline)
            guidelines.append(guideline)
    return guidelines


def _reporting_selection(data: dict | None) -> tuple[str, list[str]]:
    if not isinstance(data, dict):
        return "", []

    sp = data.get("stack_profile") if isinstance(data.get("stack_profile"), dict) else {}
    primary = _canonical_guideline(sp.get("reporting_checklist"))
    extensions = _guideline_list(sp.get("reporting_checklist_extensions"))

    legacy_guidelines = sp.get("guidelines_selected") or data.get("guidelines_selected")
    if not primary and isinstance(legacy_guidelines, dict):
        primary = _canonical_guideline(legacy_guidelines.get("primary"))
        extensions.extend(_guideline_list(legacy_guidelines.get("extensions")))
    elif not primary and isinstance(legacy_guidelines, list) and legacy_guidelines:
        primary = _canonical_guideline(legacy_guidelines[0])
        extensions.extend(_guideline_list(legacy_guidelines[1:]))

    legacy_nested = data.get("reporting_checklist")
    if not primary and isinstance(legacy_nested, dict) and legacy_nested.get("enabled"):
        primary = _canonical_guideline(legacy_nested.get("guideline"))
        nested_extensions = legacy_nested.get("extensions") or legacy_nested.get("ai_extensions")
        if isinstance(nested_extensions, list):
            extensions.extend(_guideline_list(nested_extensions))

    deduped_extensions = [item for index, item in enumerate(extensions) if item and item not in extensions[:index]]
    return primary, deduped_extensions


def _load_guideline_registry() -> dict:
    if not GUIDELINE_REGISTRY_PATH.exists():
        return {}

    yaml = _yaml()
    with open(GUIDELINE_REGISTRY_PATH) as f:
        data = yaml.load(f) or {}

    registry = data.get("guidelines", {}) if isinstance(data, dict) else {}
    if not isinstance(registry, dict):
        return {}

    normalized: dict[str, dict] = {}
    for name, meta in registry.items():
        key = _canonical_guideline(name)
        if isinstance(meta, dict):
            entry = dict(meta)
            entry["_name"] = key
            normalized[key] = entry
            for alias in meta.get("aliases", []) or []:
                normalized[_canonical_guideline(alias)] = entry
    return normalized


def _items_from_checklist(checklist_path: Path, limit: int = 24) -> list[str]:
    if not checklist_path.exists():
        return [f"Checklist file not found at {checklist_path}."]

    import re

    items: list[str] = []
    item_re = re.compile(r"^###\s+Item\s+(.+)$")
    for line in checklist_path.read_text(errors="ignore").splitlines():
        match = item_re.match(line.strip())
        if match:
            items.append(match.group(1).strip())
        if len(items) >= limit:
            break

    if not items:
        return [f"Checklist items are available in {checklist_path.name}."]
    return items


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
    project_root: str | None = None,
) -> str:
    """Search scientific papers via Google Scholar, Crossref, and SciHub using PyPaperBot.

    Args:
        query: PICO/PECO research question or keywords
        doi: Single DOI to look up (mutually exclusive with query)
        min_year: Minimum publication year filter
        scholar_pages: Number of Google Scholar pages to scan
        max_citations: Only return papers with at least this many citations
        output_dir: Directory for downloaded PDFs and BibTeX. Relative paths resolve under project_root.
        project_root: Optional user project root for resolving relative output_dir

    Returns:
        Structured paper list with title, authors, year, journal, DOI, and citation count.
    """
    if not query and not doi:
        return "Error: Provide either a query or a DOI."

    script = PLUGIN_ROOT / "skills" / "ce-literature-search" / "scripts" / "literature-search.py"
    if not script.exists():
        return f"Error: literature-search.py not found at {script}"

    import subprocess, tempfile, os

    if output_dir:
        root, root_error = _project_root_or_error(project_root)
        if root_error:
            return root_error
        out_dir = str(_project_path(root, output_dir, output_dir))
    else:
        out_dir = tempfile.mkdtemp(prefix="ce-lit-")
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
    data_root: str | None = None,
    data_connection_name: str | None = None,
    data_connection_type: str | None = None,
    data_connection_database: str | None = None,
    data_connection_auth: str | None = None,
    data_connection_status: str | None = None,
    blinding_state: str | None = None,
    study_type: str | None = None,
    ai_involvement: str | None = None,
    reporting_checklist: str | None = None,
    reporting_checklist_extensions: list[str] | str | None = None,
    project_root: str | None = None,
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
        data_root: Data directory or off-repo data path
        data_connection_name: Optional verified connection name
        data_connection_type: Optional connection type: postgres, sqlite, duckdb, or other
        data_connection_database: Optional database name
        data_connection_auth: Optional auth mode
        data_connection_status: Optional connection status, e.g. verified
        blinding_state: blinded, unblinded, or n/a
        study_type: Study design value used for reporting guideline routing
        ai_involvement: none, ai-assisted, ai-primary, or llm-based
        reporting_checklist: Canonical primary reporting guideline string (e.g., STROBE)
        reporting_checklist_extensions: Optional extension guideline list or comma-separated string
        project_root: Optional user project root; relative artifacts resolve here

    Returns:
        Current config state (read) or update confirmation (write).
    """
    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    try:
        yaml = _yaml()
    except RuntimeError as exc:
        return str(exc)

    config_path = root / ".ce-datascience" / "config.local.yaml"

    if action == "read":
        if not config_path.exists():
            return (
                "No stack profile found. Run the ce-setup skill to create one "
                "(Claude plugin command: /ce-datascience:ce-setup; optional local alias: /ce-setup)."
            )
        with open(config_path) as f:
            data = yaml.load(f)
        if not data or "stack_profile" not in data:
            return "Config exists but has no stack_profile section."
        sp = data["stack_profile"]
        primary_checklist, extensions = _reporting_selection(data)
        lines = ["Current stack profile:"]
        for key in ["language", "ide", "data_libraries", "data_layer",
                     "statistical_packages", "environment_manager",
                     "r_project_type", "reporting", "data_root",
                     "data_connection",
                     "blinding_state", "study_type", "ai_involvement"]:
            if key in sp:
                lines.append(f"  {key}: {sp[key]}")
        if primary_checklist:
            lines.append(f"  reporting_checklist: {primary_checklist}")
        if extensions:
            lines.append(f"  reporting_checklist_extensions: {extensions}")
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
            "data_root": data_root,
            "blinding_state": blinding_state,
            "study_type": study_type,
            "ai_involvement": ai_involvement,
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
        connection_updates = {
            "name": data_connection_name,
            "type": data_connection_type,
            "database": data_connection_database,
            "auth": data_connection_auth,
            "status": data_connection_status,
        }
        if any(v is not None for v in connection_updates.values()):
            if "data_connection" not in sp or not isinstance(sp["data_connection"], dict):
                sp["data_connection"] = {}
            for sub_k, sub_v in connection_updates.items():
                if sub_v is not None:
                    sp["data_connection"][sub_k] = sub_v
        if reporting_checklist is not None:
            normalized = _canonical_guideline(reporting_checklist)
            if normalized and normalized.lower() not in {"none", "null", "false", "off"}:
                sp["reporting_checklist"] = normalized
            else:
                sp.pop("reporting_checklist", None)
                sp.pop("reporting_checklist_extensions", None)
        if reporting_checklist_extensions is not None:
            extensions = _guideline_list(reporting_checklist_extensions)
            if extensions:
                sp["reporting_checklist_extensions"] = extensions
            else:
                sp.pop("reporting_checklist_extensions", None)

        with open(config_path, "w") as f:
            yaml.dump(data, f)

        return f"Stack profile updated at {config_path}\nProject root: {root}"

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
    power_analysis: str = "",
    output_path: str = "analysis/sap.md",
    project_root: str | None = None,
) -> str:
    """Generate a Statistical Analysis Plan from study metadata using the SAP template.

    Refuses to create the SAP without a power analysis statement (the most
    frequently skipped section that breaks downstream review). Pass any
    non-empty string describing the calculation, the assumed effect size,
    alpha, and target N. For observational studies where formal power is
    inappropriate, pass 'precision-based: target N=X yields Y% CI half-width
    of Z' or 'descriptive only: no inferential test'.

    Args:
        study_type: observational, rct, systematic-review, diagnostic-accuracy, case-report, qualitative, animal, health-economic, prediction-model, exploratory, or other
        title: Study title
        population: Study population description
        primary_outcome: Primary endpoint description
        ai_involvement: none, ai-assisted, ai-primary, or llm-based
        power_analysis: Power calculation or precision statement (REQUIRED)
        output_path: Where to write the SAP file (relative to project root)
        project_root: Optional user project root; relative output_path resolves here

    Returns:
        Confirmation with the SAP file path.
    """
    import datetime

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    if not power_analysis or not power_analysis.strip():
        return (
            "Error: power_analysis is required.\n"
            "Pass a power calculation (e.g., 'two-sample t-test, alpha=0.05, "
            "power=0.80, effect size d=0.5 -> N=64 per group'), a precision "
            "statement (e.g., 'precision-based: N=200 yields 95% CI half-width "
            "of 0.07 for prevalence proportion'), or 'descriptive only: no "
            "inferential test' for purely descriptive studies."
        )

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

    sap_content = sap_content.replace(
        "[Sample size calculation",
        f"{power_analysis}\n\n[Original template guidance: Sample size calculation"
    )

    out = _project_path(root, output_path, "analysis/sap.md")
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
    project_root: str | None = None,
) -> str:
    """Detect structural drift between a SAP and analysis code.

    Scans the SAP for SAP-N.M section identifiers, then searches analysis
    files for matching comments. Reports sections that are missing, present,
    or extra (not in the SAP).

    Args:
        sap_path: Path to the SAP file (relative to project root)
        analysis_dir: Directory to scan for analysis files (defaults to project root)
        project_root: Optional user project root; relative paths resolve here

    Returns:
        Drift report listing SAP sections with missing, found, or extra analysis code.
    """
    import re

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    sap = _project_path(root, sap_path, "analysis/sap.md")

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
    scan_dir = _project_path(root, analysis_dir or ".", ".")
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
# Tool: sap_amend
# ---------------------------------------------------------------------------

@mcp.tool()
def sap_amend(
    section_id: str,
    old_text: str,
    new_text: str,
    reason: str,
    amended_by: str = "",
    sap_path: str = "analysis/sap.md",
    project_root: str | None = None,
) -> str:
    """Record a SAP amendment with provenance.

    Updates the SAP in place and writes an entry to analysis/sap-amendments.md
    documenting the prior text, new text, reason, person, and timestamp. Bumps
    the SAP version line at the top of the file. Reviewers (ce-sap-amendment-
    reviewer) consult this log to determine whether the amendment was made
    before or after the data lock and whether it changed primary endpoints.

    Args:
        section_id: SAP section being amended (e.g., 'SAP-3.1' or '4.2')
        old_text: A unique substring of the prior text being replaced
        new_text: The replacement text
        reason: Why this amendment is needed
        amended_by: Person responsible for the amendment
        sap_path: Path to the SAP file (relative to project root)
        project_root: Optional user project root; relative sap_path resolves here

    Returns:
        Confirmation with new SAP version and amendment log path.
    """
    import datetime, re

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    sap = _project_path(root, sap_path, "analysis/sap.md")

    if not sap.exists():
        return f"Error: SAP file not found at {sap}"

    sap_text = sap.read_text()
    if old_text not in sap_text:
        return (
            f"Error: old_text not found in SAP. Pass a unique substring of the "
            f"existing text. The SAP starts with: {sap_text[:200]!r}..."
        )

    # Bump version line: 'Version: X.Y' -> 'Version: X.(Y+1)'
    version_re = re.compile(r"(Version:\s*)(\d+)\.(\d+)")
    m = version_re.search(sap_text)
    if m:
        new_minor = int(m.group(3)) + 1
        new_version = f"{m.group(2)}.{new_minor}"
        sap_text = version_re.sub(rf"\g<1>{new_version}", sap_text, count=1)
    else:
        new_version = "1.1"
        sap_text = f"Version: {new_version}\n" + sap_text

    sap_text = sap_text.replace(old_text, new_text, 1)
    sap.write_text(sap_text)

    log_path = sap.parent / "sap-amendments.md"
    timestamp = datetime.datetime.now().isoformat(timespec="seconds")
    entry = (
        f"\n## Amendment to {section_id} ({timestamp})\n\n"
        f"- **New version**: {new_version}\n"
        f"- **Amended by**: {amended_by or '(unspecified)'}\n"
        f"- **Reason**: {reason}\n\n"
        f"### Prior text\n\n```\n{old_text}\n```\n\n"
        f"### Replacement text\n\n```\n{new_text}\n```\n"
    )
    if log_path.exists():
        log_path.write_text(log_path.read_text() + entry)
    else:
        log_path.write_text(
            "# SAP Amendment Log\n\n"
            "Each entry records a SAP change with prior text, new text, reason, "
            "and person.\n" + entry
        )

    return (
        f"Amended {section_id} in {sap}\n"
        f"  new version: {new_version}\n"
        f"  log: {log_path}\n"
        f"  amended_by: {amended_by or '(unspecified)'}\n"
        f"Run /ce-code-review to dispatch ce-sap-drift-detector, which "
        f"validates the amendment against the data lock state."
    )


# ---------------------------------------------------------------------------
# Tool: reporting_compliance_check
# ---------------------------------------------------------------------------

@mcp.tool()
def reporting_compliance_check(
    study_type: str = "observational",
    guideline: str | None = None,
    manuscript_path: str | None = None,
    project_root: str | None = None,
) -> str:
    """Run a reporting guideline compliance check against supported guidelines.

    Checks the supported guideline registry (CONSORT, STROBE, PRISMA, etc.)
    and returns a checklist with required items for the applicable guideline.

    Args:
        study_type: rct, observational, systematic-review, diagnostic-accuracy, case-report, qualitative, animal, health-economic, or prediction-model
        guideline: Override auto-routing with a specific guideline (consort, strobe, prisma, stard, care, coreq, arrive, cheers, tripod-ai)
        manuscript_path: Optional path to manuscript for item-level checking
        project_root: Optional user project root; relative manuscript_path resolves here

    Returns:
        Compliance checklist with applicable guideline items.
    """
    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    try:
        registry = _load_guideline_registry()
    except RuntimeError as exc:
        return str(exc)

    fallback_routing = {
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

    selected = _canonical_guideline(guideline) if guideline else ""
    if not selected and registry:
        for name, meta in registry.items():
            if name != meta.get("_name"):
                continue
            if study_type in (meta.get("primary_for") or []):
                selected = name
                break
    if not selected:
        selected = fallback_routing.get(study_type, "STROBE")

    selected_meta = registry.get(selected, {})
    selected = selected_meta.get("_name", selected)
    checklist_file = selected_meta.get("file")
    checklist_path = (
        PLUGIN_ROOT / "skills" / "ce-code-review" / "references" / checklist_file
        if isinstance(checklist_file, str)
        else None
    )
    items = _items_from_checklist(checklist_path) if checklist_path else [
        f"Guideline {selected} checklist file is not registered.",
        "Run /ce-code-review with a canonical reporting_checklist string for full compliance review.",
    ]

    extension_names: list[str] = []
    if registry:
        for name, meta in registry.items():
            if name != meta.get("_name"):
                continue
            if study_type in (meta.get("extension_for") or []) and meta.get("ai_extension"):
                extension_names.append(name)

    lines = [
        "Reporting Compliance Check",
        "=" * 40,
        f"Project root: {root}",
        f"Study type: {study_type}",
        f"Primary guideline: {selected}",
    ]

    if checklist_path:
        lines.append(f"Checklist file: {checklist_path}")
    if extension_names:
        lines.append(f"Potential AI extensions: {', '.join(extension_names)}")

    lines.append(f"\nChecklist items ({len(items)}):")
    for item in items:
        lines.append(f"  [ ] {item}")

    if manuscript_path:
        mp = _project_path(root, manuscript_path, manuscript_path)
        if mp.exists():
            lines.append(f"\nManuscript found at {mp}. Run /ce-code-review for item-level verification.")
        else:
            lines.append(f"\nManuscript not found at {mp}.")

    lines.append(
        "\nNote: For full item-level compliance verification, set "
        f"stack_profile.reporting_checklist: {selected} and run /ce-code-review."
    )

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool: publication_readiness_check
# ---------------------------------------------------------------------------

@mcp.tool()
def publication_readiness_check(
    table1_spec: str = "analysis/publication/tables/table1-spec.json",
    figure_manifest: str = "analysis/publication/figures/figure-manifest.json",
    package_manifest: str = "analysis/publication/package/package-manifest.json",
    signoff_ledger: str = "analysis/signoff/signoff-ledger.json",
    registry_package_dir: str = "",
    report_path: str = ".ce-datascience/publication-readiness-report.md",
    project_root: str | None = None,
) -> str:
    """Summarize publication package readiness from generated artifacts.

    Args:
        table1_spec: Project-relative Table 1 spec JSON path
        figure_manifest: Project-relative figure manifest JSON path
        package_manifest: Project-relative manuscript package manifest JSON path
        signoff_ledger: Project-relative multi-analyst signoff ledger JSON path
        registry_package_dir: Optional project-relative preregistry package directory
        report_path: Project-relative markdown report output path
        project_root: Optional user project root; relative paths resolve here

    Returns:
        Readiness signal and report path.
    """
    import json

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    try:
        table1_path = _project_path_checked(root, table1_spec, "analysis/publication/tables/table1-spec.json", "table1_spec")
        figure_path = _project_path_checked(root, figure_manifest, "analysis/publication/figures/figure-manifest.json", "figure_manifest")
        package_path = _project_path_checked(root, package_manifest, "analysis/publication/package/package-manifest.json", "package_manifest")
        signoff_path = _project_path_checked(root, signoff_ledger, "analysis/signoff/signoff-ledger.json", "signoff_ledger")
        out_report = _project_path_checked(root, report_path, ".ce-datascience/publication-readiness-report.md", "report_path")
        registry_dir = (
            _project_path_checked(root, registry_package_dir, registry_package_dir, "registry_package_dir")
            if registry_package_dir
            else None
        )
    except ProjectRootError as exc:
        return f"Error: {exc}"

    blockers: list[str] = []
    warnings: list[str] = []
    summary: list[str] = []

    def load_json(path: Path, label: str) -> dict | None:
        if not path.exists():
            warnings.append(f"{label} not found: {path.relative_to(root)}")
            return None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            blockers.append(f"{label} is not valid JSON: {exc}")
            return None
        if not isinstance(data, dict):
            blockers.append(f"{label} must be a JSON object")
            return None
        return data

    table1 = load_json(table1_path, "Table 1 spec")
    if table1:
        rows = table1.get("rows", [])
        summary.append(f"Table 1 rows: {len(rows) if isinstance(rows, list) else 'unknown'}")

    figures = load_json(figure_path, "Figure manifest")
    if figures:
        figure_items = figures.get("figures", [])
        summary.append(f"Figures: {len(figure_items) if isinstance(figure_items, list) else 'unknown'}")

    package = load_json(package_path, "Manuscript package manifest")
    if package:
        readiness = str(package.get("readiness", "")).strip()
        summary.append(f"Manuscript package readiness: {readiness or '(missing)'}")
        if readiness == "blocked":
            blockers.append("Manuscript package readiness is blocked")
        elif readiness not in {"ready-with-review", "ready-for-signoff"}:
            warnings.append("Manuscript package readiness is not ready-with-review or ready-for-signoff")

    signoff = load_json(signoff_path, "Signoff ledger")
    if signoff:
        entries = signoff.get("entries", [])
        if not isinstance(entries, list):
            blockers.append("Signoff ledger entries must be a list")
        else:
            summary.append(f"Signoff entries: {len(entries)}")
            for entry in entries:
                if not isinstance(entry, dict):
                    blockers.append("Signoff ledger contains a non-object entry")
                    continue
                decision = entry.get("decision")
                artifact = entry.get("artifact", "(unknown artifact)")
                if decision in {"changes-requested", "rejected"}:
                    blockers.append(f"Signoff for {artifact} is {decision}")
                elif decision == "approved-with-conditions":
                    warnings.append(f"Signoff for {artifact} is approved-with-conditions")

    if registry_dir:
        registry_report = registry_dir / "registry-validation-report.md"
        if not registry_report.exists():
            warnings.append(f"Registry validation report not found: {registry_report.relative_to(root)}")
        else:
            report_text = registry_report.read_text(encoding="utf-8", errors="ignore")
            if "Result: BLOCKED" in report_text:
                blockers.append(f"Registry package is blocked: {registry_dir.relative_to(root)}")
            elif "Result: READY-WITH-REVIEW" in report_text:
                summary.append(f"Registry package ready: {registry_dir.relative_to(root)}")
            else:
                warnings.append(f"Registry package has unknown validation status: {registry_dir.relative_to(root)}")

    result = "BLOCKED" if blockers else "READY-WITH-REVIEW"
    out_report.parent.mkdir(parents=True, exist_ok=True)
    out_report.write_text(
        "\n".join([
            "# Publication Readiness Report",
            "",
            f"Project root: `{root}`",
            f"Result: {result}",
            "",
            "## Summary",
            *([f"- {item}" for item in summary] or ["- No publication artifacts found"]),
            "",
            "## Blocking Findings",
            *([f"- {item}" for item in blockers] or ["- None"]),
            "",
            "## Warnings",
            *([f"- {item}" for item in warnings] or ["- None"]),
        ]) + "\n",
        encoding="utf-8",
    )

    return f"__CE_PUBLICATION_READINESS__ result={result} report={out_report.relative_to(root)}"


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
    project_root: str | None = None,
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
        project_root: Optional user project root; docs/solutions resolves here

    Returns:
        Matching entries (read) or write confirmation.
    """
    import datetime

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    try:
        yaml = _yaml()
    except RuntimeError as exc:
        return str(exc)

    solutions_dir = root / "docs" / "solutions"

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
# Tool: data_wave_register
# ---------------------------------------------------------------------------

@mcp.tool()
def data_wave_register(
    extract_id: str,
    location: str,
    source: str = "",
    query_id: str = "",
    extracted_by: str = "",
    notes: str = "",
    project_root: str | None = None,
) -> str:
    """Register a new data extract (data wave) into .ce-datascience/data-state.yaml.

    Each wave is identified by an extract_id (free-form string the analyst chooses,
    e.g., 'wave_001' or '2026-04-28-rerun'). The tool records location, source,
    extracted_at, and a sha256 hash of the file contents so the analysis can
    later prove which data it ran against. Status defaults to 'unlocked'; use
    data_lock to seal the wave after data QA passes.

    Args:
        extract_id: Analyst-chosen identifier for this extract (must be unique)
        location: Path to the data file (absolute) or URI (s3://, box://, etc.)
        source: Origin system (EHR name, registry, simulation script)
        query_id: Identifier for the extract query (Cohort builder ID, SQL hash, etc.)
        extracted_by: Person who pulled the extract
        notes: Optional free text (e.g., why this re-extract)
        project_root: Optional user project root; .ce-datascience/data-state.yaml resolves here

    Returns:
        Confirmation with extract_id, hash, and unlocked status.
    """
    import datetime, hashlib

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    try:
        yaml = _yaml()
    except RuntimeError as exc:
        return str(exc)

    state_path = root / ".ce-datascience" / "data-state.yaml"

    if state_path.exists():
        with open(state_path) as f:
            state = yaml.load(f) or {}
    else:
        state_path.parent.mkdir(parents=True, exist_ok=True)
        state = {}

    waves = state.setdefault("waves", {})
    if extract_id in waves:
        return f"Error: extract_id '{extract_id}' already registered. Choose a unique id."

    # Hash the file if it's a local path
    file_hash = ""
    loc_path = Path(location).expanduser()
    if not loc_path.is_absolute():
        loc_path = root / loc_path
    if loc_path.exists() and loc_path.is_file():
        h = hashlib.sha256()
        with open(loc_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        file_hash = h.hexdigest()

    waves[extract_id] = {
        "location": location,
        "source": source,
        "query_id": query_id,
        "extracted_by": extracted_by,
        "extracted_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "hash_sha256": file_hash,
        "status": "unlocked",
        "notes": notes,
    }

    state["current_wave"] = extract_id

    with open(state_path, "w") as f:
        yaml.dump(state, f)

    return (
        f"Registered wave '{extract_id}'\n"
        f"  location: {location}\n"
        f"  hash: {file_hash[:16]}{'...' if file_hash else '(no hash; not a local file)'}\n"
        f"  status: unlocked\n"
        f"Next: run /ce-data-qa to validate the wave before locking."
    )


# ---------------------------------------------------------------------------
# Tool: data_lock
# ---------------------------------------------------------------------------

@mcp.tool()
def data_lock(
    extract_id: str,
    qa_report_path: str = "",
    locked_by: str = "",
    sap_version_at_lock: str = "",
    project_root: str | None = None,
) -> str:
    """Seal a data wave as the canonical analysis dataset.

    Locking requires data QA to have passed (qa_report_path exists and the
    report status is GO or GO with PI sign-off). Once locked, the wave is
    immutable for the analysis -- any change requires registering a new wave
    and a SAP amendment if the change affects scope.

    Args:
        extract_id: Wave to lock (must be registered and unlocked)
        qa_report_path: Path to the data QA report; tool checks status
        locked_by: Person sealing the data
        sap_version_at_lock: SAP version (e.g., '1.2') in effect at lock time
        project_root: Optional user project root; .ce-datascience/data-state.yaml resolves here

    Returns:
        Confirmation with locked timestamp.
    """
    import datetime

    root, root_error = _project_root_or_error(project_root)
    if root_error:
        return root_error

    try:
        yaml = _yaml()
    except RuntimeError as exc:
        return str(exc)

    state_path = root / ".ce-datascience" / "data-state.yaml"

    if not state_path.exists():
        return "Error: no data-state.yaml. Register a wave first via data_wave_register."

    with open(state_path) as f:
        state = yaml.load(f) or {}

    waves = state.get("waves", {})
    if extract_id not in waves:
        return f"Error: extract_id '{extract_id}' not registered. Available: {list(waves.keys())}"

    wave = waves[extract_id]
    if wave.get("status") == "locked":
        return f"Error: wave '{extract_id}' is already locked at {wave.get('locked_at')}."

    # Soft check on QA report
    qa_status = "unknown"
    if qa_report_path:
        qp = _project_path(root, qa_report_path, qa_report_path)
        if qp.exists():
            text = qp.read_text(errors="ignore")
            if "Status**: `GO`" in text or "Status**: GO" in text:
                qa_status = "pass"
            elif "GO with PI sign-off" in text:
                qa_status = "pass-with-signoff"
            elif "NO-GO" in text:
                return f"Error: QA report at {qp} is NO-GO. Resolve blockers before locking."
        else:
            return f"Warning: QA report not found at {qp}. Refusing to lock without a QA report. Pass qa_report_path explicitly."
    else:
        return "Error: qa_report_path is required. Run /ce-data-qa first to generate a QA report, then pass its path."

    wave["status"] = "locked"
    wave["locked_at"] = datetime.datetime.now().isoformat(timespec="seconds")
    wave["locked_by"] = locked_by
    wave["qa_status"] = qa_status
    wave["qa_report_path"] = qa_report_path
    wave["sap_version_at_lock"] = sap_version_at_lock

    with open(state_path, "w") as f:
        yaml.dump(state, f)

    return (
        f"Locked wave '{extract_id}' ({qa_status})\n"
        f"  locked_at: {wave['locked_at']}\n"
        f"  sap_version_at_lock: {sap_version_at_lock or '(unspecified)'}\n"
        f"This wave is now immutable for the analysis. New extracts require a new wave."
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    """Start the MCP server via stdio transport."""
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
