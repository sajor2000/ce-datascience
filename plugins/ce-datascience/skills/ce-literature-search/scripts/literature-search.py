#!/usr/bin/env python3
"""Literature search wrapper around PyPaperBot.

Provides structured output (summary table, BibTeX, search log) for
the ce-literature-search skill.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import yaml
from datetime import datetime
from pathlib import Path


def load_config(config_path=None):
    """Load search config, falling back to defaults."""
    defaults = {
        "sources": {"scholar": True, "crossref": True, "scihub": True, "scidb": True},
        "defaults": {
            "scholar_pages": 3,
            "min_year": 2018,
            "dwnl_method": 2,
            "max_citations": None,
            "doi_filename": False,
        },
        "filters": {
            "journal_filter_path": None,
            "skip_words": None,
        },
        "chrome": {"chrome_version": None},
        "output": {"dir_pattern": "/tmp/ce-datascience/ce-literature-search"},
    }
    if config_path and os.path.isfile(config_path):
        with open(config_path) as f:
            user_config = yaml.safe_load(f) or {}
        for section in defaults:
            if section in user_config:
                if isinstance(defaults[section], dict):
                    defaults[section].update(user_config[section])
                else:
                    defaults[section] = user_config[section]
    return defaults


def build_pypaperbot_args(args, config):
    """Construct PyPaperBot command-line arguments."""
    cmd = [sys.executable, "-m", "PyPaperBot"]

    # Search type
    if args.query:
        cmd.append(f'--query={args.query}')
        scholar_pages = args.scholar_pages or config["defaults"]["scholar_pages"]
        cmd.append(f'--scholar-pages={scholar_pages}')
    elif args.doi:
        cmd.append(f'--doi={args.doi}')
    elif args.doi_file:
        cmd.append(f'--doi-file={args.doi_file}')

    # Output directory
    output_dir = args.output_dir or os.path.join(
        config["output"]["dir_pattern"],
        datetime.now().strftime("%Y%m%d-%H%M%S"),
    )
    os.makedirs(output_dir, exist_ok=True)
    cmd.append(f'--dwn-dir={output_dir}')

    # Year filter
    min_year = args.min_year or config["defaults"]["min_year"]
    if min_year:
        cmd.append(f'--min-year={min_year}')

    # Citation limit
    max_citations = args.max_citations or config["defaults"]["max_citations"]
    if max_citations:
        cmd.append(f'--max-citations={max_citations}')

    # Download method
    dwnl_method = config["defaults"]["dwnl_method"]
    if args.bibtex_only:
        dwnl_method = 0
    cmd.append(f'--dwnl-method={dwnl_method}')

    # Journal filter
    journal_filter = config["filters"]["journal_filter_path"]
    if journal_filter:
        cmd.append(f'--journal-filter={journal_filter}')

    # Skip words
    skip_words = config["filters"]["skip_words"]
    if skip_words:
        cmd.append(f'--skip-words={skip_words}')

    # Chrome version for Selenium
    chrome_version = config["chrome"]["chrome_version"]
    if chrome_version:
        cmd.append(f'--chrome-version={chrome_version}')

    # DOI as filename
    if config["defaults"]["doi_filename"]:
        cmd.append("--doi-filename")

    return cmd, output_dir


def parse_bibtex(bibtex_path):
    """Extract paper metadata from BibTeX file."""
    papers = []
    if not os.path.isfile(bibtex_path):
        return papers

    with open(bibtex_path, encoding="utf-8") as f:
        content = f.read()

    entries = re.split(r"@(\w+)\{", content)
    for i in range(1, len(entries) - 1, 2):
        entry_type = entries[i]
        entry_body = entries[i + 1].split("}", 1)[0] if "}" in entries[i + 1] else ""

        paper = {"type": entry_type}
        for field in ["title", "author", "year", "journal", "doi", "url"]:
            match = re.search(
                rf"{field}\s*=\s*{{([^}}]*)}}", entries[i + 1], re.IGNORECASE
            )
            if match:
                paper[field] = match.group(1].strip()
        if paper.get("title"):
            papers.append(paper)

    return papers


def generate_summary(papers, query, output_dir, filters_applied):
    """Generate markdown summary table."""
    summary_path = os.path.join(output_dir, "literature-summary.md")

    lines = [
        f"# Literature Search Summary",
        f"",
        f"**Query:** {query}",
        f"**Date:** {datetime.now().isoformat()}",
        f"**Results:** {len(papers)} papers",
        f"**Filters:** {filters_applied}",
        f"",
        f"| Title | Authors | Year | Journal | DOI |",
        f"|-------|---------|------|---------|-----|",
    ]

    for p in sorted(papers, key=lambda x: int(x.get("year", "0")), reverse=True):
        title = p.get("title", "N/A")
        authors = p.get("author", "N/A")
        if len(authors) > 60:
            authors = authors[:57] + "..."
        year = p.get("year", "N/A")
        journal = p.get("journal", "N/A")
        doi = p.get("doi", "")
        doi_link = f"[{doi}](https://doi.org/{doi})" if doi else "N/A"
        lines.append(f"| {title} | {authors} | {year} | {journal} | {doi_link} |")

    lines.append("")
    lines.append("## Search Log")
    lines.append(f"- Query: {query}")
    lines.append(f"- Filters applied: {filters_applied}")
    lines.append(f"- Papers found: {len(papers)}")
    lines.append(f"- Output directory: {output_dir}")

    with open(summary_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return summary_path


def main():
    parser = argparse.ArgumentParser(description="CE DataScience Literature Search")
    parser.add_argument("--query", help="Search query for Google Scholar")
    parser.add_argument("--doi", help="Single DOI to look up")
    parser.add_argument("--doi-file", help="File with DOIs (one per line)")
    parser.add_argument("--scholar-pages", type=int, help="Number of Scholar pages")
    parser.add_argument("--min-year", type=int, help="Minimum publication year")
    parser.add_argument("--max-citations", type=int, help="Max papers by citation count")
    parser.add_argument("--output-dir", help="Output directory path")
    parser.add_argument("--bibtex-only", action="store_true", help="Download BibTeX only")
    parser.add_argument("--config", help="Path to search config YAML")
    args = parser.parse_args()

    if not any([args.query, args.doi, args.doi_file]):
        parser.error("One of --query, --doi, or --doi-file is required")

    config = load_config(args.config)
    cmd, output_dir = build_pypaperbot_args(args, config)

    print(f"Running PyPaperBot...")
    print(f"  Command: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"PyPaperBot error: {result.stderr}", file=sys.stderr)
            sys.exit(1)
        print(result.stdout)
    except FileNotFoundError:
        print("PyPaperBot not found. Install with: pip install PyPaperBot", file=sys.stderr)
        sys.exit(1)
    except subprocess.TimeoutExpired:
        print("PyPaperBot timed out after 300s", file=sys.stderr)
        sys.exit(1)

    # Parse BibTeX output
    bibtex_path = os.path.join(output_dir, "bibtex.bib")
    if not os.path.isfile(bibtex_path):
        bibtex_files = list(Path(output_dir).glob("*.bib"))
        bibtex_path = str(bibtex_files[0]) if bibtex_files else None

    papers = []
    if bibtex_path:
        papers = parse_bibtex(bibtex_path)

    # Generate summary
    query = args.query or args.doi or args.doi_file
    filters_applied = f"min_year={args.min_year or config['defaults']['min_year']}"
    if args.max_citations:
        filters_applied += f", max_citations={args.max_citations}"

    summary_path = generate_summary(papers, query, output_dir, filters_applied)
    print(f"\nSummary written to: {summary_path}")
    print(f"Output directory: {output_dir}")
    print(f"Papers found: {len(papers)}")


if __name__ == "__main__":
    main()
