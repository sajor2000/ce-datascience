#!/usr/bin/env python3
"""Numbers locked to raw data: a registry of reportable aggregates.

Library (import from analysis code; stdlib only):
  register_number(id, value, kind, ...)  one entry
  register_table(table_id, cells, ...)   many entries, ids "<table_id>.<cell>"

Each entry records the value, its formatted text, the source files and their
SHA-256, the producing script with its SHA-256 and git commit, the SAP output
ID, and a timestamp. Aggregates only.
"""

import argparse
import csv
import datetime
import hashlib
import io
import json
import math
import os
import re
import subprocess
import sys

REGISTRY_REL = os.path.join("analysis", "numbers", "registry.json")
ALLOWLIST_REL = os.path.join("analysis", "numbers", "allowlist.txt")


def _project_root():
    try:
        out = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True)
        return os.path.realpath(out.stdout.strip())
    except (OSError, subprocess.CalledProcessError):
        return os.path.realpath(os.getcwd())


def _commit(root):
    try:
        out = subprocess.run(["git", "-C", root, "rev-parse", "HEAD"], capture_output=True, text=True, check=True)
        return out.stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def _committed(root, rel):
    """Whether the script is tracked and matches HEAD, so its commit names the code that ran."""
    for args in (["ls-files", "--error-unmatch", "--", rel], ["diff", "--quiet", "HEAD", "--", rel]):
        try:
            if subprocess.run(["git", "-C", root, *args], capture_output=True).returncode != 0:
                return False
        except OSError:
            return False
    return True


def _sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _rel(root, path):
    return os.path.relpath(os.path.realpath(os.path.join(root, path)), root).replace(os.sep, "/")


def _script(script):
    """The producing script as an absolute path: the given one, else the running __main__ file."""
    script = script or getattr(sys.modules.get("__main__"), "__file__", None)
    return os.path.abspath(script) if script else None


def _finite(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def _fmt(value, digits):
    return f"{value:.{digits}f}"


STYLES = ("jama", "generic-biomedical")
KINDS = ("count", "n", "percent", "estimate", "ci", "p")
COUNT_KINDS = ("count", "n")
SMALL_CELL = 11  # counts from 1 to SMALL_CELL - 1 are suppressed, as in the data-boundary guard


def _p(value, style):
    jama = style == "jama"
    label = "P" if jama else "p"
    if value < 0.001:
        bound = ".001" if jama else "0.001"
        return f"{label} < {bound}"
    if jama and value > 0.99:
        return f"{label} > .99"
    text = _fmt(value, 3 if value < 0.01 else 2)
    return f"{label} = {text[1:] if jama else text}"


def format_number(value, kind, ci=None, digits=2, denominator=None, style="jama"):
    """The journal-style text for one aggregate."""
    if style not in STYLES:
        raise ValueError(f"unknown style profile {style!r}; expected one of {', '.join(STYLES)}")
    if kind == "p":
        return _p(value, style)
    if kind in COUNT_KINDS:
        text = f"{int(value):,}"
        if denominator:
            text += f" ({_fmt(100 * value / denominator, 1)}%)"
        return text
    if kind == "percent":
        return f"{_fmt(value, digits)}%"
    interval = None
    if ci is not None:
        lo, hi = (_fmt(v, digits) for v in ci)
        interval = f"{lo}{' to ' if min(ci) < 0 else '-'}{hi}"
    if kind == "ci":
        if interval is None:
            raise ValueError("kind 'ci' needs ci=(lower, upper)")
        return interval
    text = _fmt(value, digits)
    return f"{text} (95% CI, {interval})" if interval else text


def _entry(root, script, id, value, kind, ci=None, digits=2, denominator=None, style="jama", sources=(),
           sap_output=None, table=None):
    if kind not in KINDS:
        raise ValueError(f"unknown kind; expected one of {', '.join(KINDS)}")
    if not _finite(value) or not all(_finite(v) for v in (ci or ())):
        raise ValueError(f"{id}: the registry holds finite numeric aggregates only")
    suppressed = kind in COUNT_KINDS and 1 <= value < SMALL_CELL
    entry = {
        "id": id,
        "value": None if suppressed else value,
        "kind": kind,
        "text": f"<{SMALL_CELL}" if suppressed else format_number(value, kind, ci, digits, denominator, style),
        "suppressed": suppressed,
        "sources": [{"path": _rel(root, s), "sha256": _sha256(os.path.join(root, s))} for s in sources],
        "script": {"path": _rel(root, script), "sha256": _sha256(script), "commit": _commit(root),
                   "committed": _committed(root, _rel(root, script))} if script else None,
        "sap_output": sap_output,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    }
    if table:
        entry["table"] = table
    return entry


def _write(root, registry, entries):
    path = os.path.join(root, registry or REGISTRY_REL)
    data = {"version": 1, "entries": {}}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    for entry in entries:
        data["entries"][entry["id"]] = entry
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.{os.getpid()}.tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, sort_keys=True)
        fh.write("\n")
    os.replace(tmp, path)


def register_number(id, value, kind, ci=None, digits=2, denominator=None, style="jama", sources=(),
                    sap_output=None, script=None, registry=None):
    """Register one aggregate. Counts from 1 to 10 are stored suppressed, without their value."""
    root = _project_root()
    entry = _entry(root, _script(script), id, value, kind, ci, digits, denominator, style,
                   sources, sap_output)
    _write(root, registry, [entry])
    return entry


def register_table(table_id, cells, style="jama", sources=(), sap_output=None, script=None, registry=None):
    """Register every cell of a table as "<table_id>.<cell>"; cells map a cell id to register_number arguments."""
    root = _project_root()
    script = _script(script)
    entries = [_entry(root, script, f"{table_id}.{cell}", **{"style": style, **spec}, sources=sources,
                      sap_output=sap_output, table=table_id)
               for cell, spec in cells.items()]
    _write(root, registry, entries)
    return [entry["id"] for entry in entries]


# ------------------------------------------------------------------ gate (CLI)

PLACEHOLDER = re.compile(r"\{\{\s*num:([^}\s]+)\s*\}\}")
NUMBER = re.compile(r"(?<![\w.])(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)(?:\s?%)?")
SIGN_BEFORE = re.compile(r"(?:^|[\s(\[,;:=<>])[-\u2212]$")


def numbers(text):
    """(start, token) for each numeric token, signed when a minus sign stands alone before it.

    Skips numbers glued to letters (CD4, COVID-19, 2A, 1st) and compound adjectives (28-day, 2-sided).
    """
    for match in NUMBER.finditer(text):
        start, end = match.span()
        after = text[end:end + 2]
        if after[:1].isalpha() or (after[:1] == "-" and after[1:2].isalpha()):
            continue
        before = text[max(0, start - 2):start]
        if before.endswith(("-", "\u2212")):
            if before[:1].isalpha():
                continue  # a name such as IL-6
            if SIGN_BEFORE.search(before):
                start -= 1  # a minus sign, not a range dash
        yield start, _key(text[start:end])


def _key(token):
    return token.replace("\u2212", "-").replace(" ", "")


MONTH = (r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|"
         r"Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?")
REFERENCE = (r"(?:e?(?:Fig(?:ure)?s?\.?|Tables?|Supplements?|Appendi(?:x|ces)|Items?|Sections?|Box(?:es)?|"
             r"Panels?|Chapters?|Steps?|Equations?|Eq\.)|Supplementary\s+(?:Figure|Table)s?)")
QUOTED = r"\u201c[^\u201d\n]*\u201d|\"[^\"\n]*\""
# Spans that are not reportable results, in the order they are blanked out.
ALLOWED = [re.compile(p, f) for p, f in (
    (r"\A---\n.*?\n(?:---|\.\.\.)[ \t]*$", re.S | re.M),                 # YAML front matter
    (r"^([ \t]*)(`{3,}|~{3,}).*?^\1\2[ \t]*$", re.S | re.M),                 # fenced code
    (r"<!--.*?-->", re.S),                                                  # HTML comments
    (r"`[^`\n]*`", 0),                                                      # inline code
    (r"\]\([^)\s]*(?:\s+\"[^\"]*\")?\)|<?https?://[^\s>)]+>?", 0),              # link targets, URLs
    (r"^[ \t]*>.*$", re.M),                                                 # block quotes (quoted guideline text)
    (QUOTED, 0),                                                            # quoted text
    (r"\[\s*\d+(?:\s*[-\u2013,]\s*\d+)*\s*\]|\[@[^\]]*\]|\^[\d,\s\u2013-]+\^|<sup>[^<]*</sup>", 0),  # citations
    (r"^[ \t]*#{1,6}[ \t]+[\d.]+|^[ \t]*\d+[.)][ \t]", re.M),                     # heading and list numbers
    (r"\b" + REFERENCE + r"[ \t]*\d+(?:\.\d+)*[A-Za-z]?(?:[ \t]*(?:,|and|to|-|\u2013)[ \t]*\d+(?:\.\d+)*[A-Za-z]?)*",
     re.I),                                                                 # figure, table, item, section numbers
    (r"\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b", 0),                       # numeric dates
    (r"\b" + MONTH + r"[ \t]+\d{1,2}(?:st|nd|rd|th)?,?[ \t]+\d{4}\b|\b\d{1,2}[ \t]+" + MONTH + r"[ \t]+\d{4}\b"
     r"|\b" + MONTH + r"[ \t]+\d{4}\b", 0),                                  # written dates
    (r"(?<![\d,.])\b(?:19|20)\d{2}\b(?![,.]?\d)", 0),                           # years
    (r"\b(?:90|95|99)%[ \t]*(?:CIs?|confidence intervals?|credible intervals?|prediction intervals?)\b", re.I),
)]


TABLE_EXTS = {"csv": ",", "tsv": "\t"}
INLINE_CODE = 3  # ALLOWED patterns before this index hide code-free regions; inline code comes next
INLINE_COMPUTED = re.compile(r"`(?:r|\{r\}|\{python\}|\{julia\})[ \t][^`\n]*`")


def _blank(match):
    return re.sub(r"[^\n]", " ", match.group(0))


def read_allowlist(path):
    """Declared units and phrases; lines are `unit: mg` or `phrase: two-sided P < .05`."""
    patterns = []
    try:
        with open(path, encoding="utf-8") as fh:
            lines = fh.read().splitlines()
    except OSError:
        return patterns
    for line in lines:
        kind, _, value = line.partition(":")
        value = value.strip()
        if kind.strip() == "unit" and value:
            patterns.append(re.compile(r"(?<![\w.])[\d.,]+[ \t]?" + re.escape(value) + r"(?![\w/])"))
        elif kind.strip() == "phrase" and value:
            patterns.append(re.compile(re.escape(value)))
    return patterns


def inline_computed(text):
    """(line, code) for inline R/Python/Julia expressions outside front matter, code blocks, and comments."""
    for pattern in ALLOWED[:INLINE_CODE]:
        text = pattern.sub(_blank, text)
    for match in INLINE_COMPUTED.finditer(text):
        yield text.count("\n", 0, match.start()) + 1, match.group(0)


def mask(text, declared=(), quotes=True):
    """The text with allowlisted spans blanked (line numbers kept) and placeholders removed."""
    text = PLACEHOLDER.sub(_blank, text)
    for pattern in [*declared, *ALLOWED]:
        if quotes or pattern.pattern != QUOTED:
            text = pattern.sub(_blank, text)
    return text


def lines(rel, text, declared):
    """(line number, original, masked) for a manuscript or table file. Table cells keep their quotes."""
    ext = rel.rsplit(".", 1)[-1].lower()
    if ext in TABLE_EXTS:
        reader = csv.reader(io.StringIO(text), delimiter=TABLE_EXTS[ext])
        start = 1
        for row in reader:
            joined = " | ".join(row)
            yield start, joined, mask(joined, declared, quotes=False)
            start = reader.line_num + 1
        return
    yield from ((n, line, masked) for n, (line, masked) in
                enumerate(zip(text.splitlines(), mask(text, declared).splitlines()), 1))


def registry_tokens(entries):
    """Every numeric token the registry produces, from each entry's formatted text."""
    return {token for entry in entries.values() for _, token in numbers(str(entry.get("text", "")))}


CHECKED_EXTS = {"md", "qmd", "rmd", "markdown", *TABLE_EXTS}


def expand(paths):
    """Files to check: directories expand (sorted) to manuscript and table files; files pass through."""
    for path in paths:
        if os.path.isdir(path):
            for base, dirs, names in os.walk(path):
                dirs[:] = sorted(d for d in dirs if not d.startswith("."))
                for name in sorted(names):
                    if name.rsplit(".", 1)[-1].lower() in CHECKED_EXTS:
                        yield os.path.join(base, name)
        else:
            yield path


def _read(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return None


def load_registry(path):
    """The registry's entries, or None when the file is missing or unreadable."""
    try:
        with open(path, encoding="utf-8") as fh:
            entries = json.load(fh).get("entries")
    except (OSError, ValueError, AttributeError):
        return None
    return entries if isinstance(entries, dict) else None


def stale(entries, root):
    """(location, reason, path) for each entry whose source files or script no longer match their hashes."""
    hashes = {}

    def current(rel):
        if rel not in hashes:
            path = os.path.join(root, rel)
            hashes[rel] = _sha256(path) if os.path.isfile(path) else None
        return hashes[rel]

    for id, entry in sorted(entries.items()):
        files = [("source", s) for s in entry.get("sources") or []]
        if entry.get("script"):
            files.append(("script", entry["script"]))
        for role, recorded in files:
            now = current(recorded.get("path", ""))
            if now != recorded.get("sha256"):
                state = "missing" if now is None else "changed"
                yield f"registry:{id}", "stale", f"{role} {recorded.get('path')} {state}"


def untraceable(entries):
    """Entries whose chain to the SAP output, a committed script, and source hashes is incomplete."""
    for id, entry in sorted(entries.items()):
        script = entry.get("script")
        problems = [] if entry.get("sources") else ["no source files"]
        problems += [] if entry.get("sap_output") else ["no SAP output"]
        if not script:
            problems.append("no producing script")
        elif not (script.get("committed") and script.get("commit")):
            problems.append(f"script {script.get('path')} was not committed when it ran")
        yield from ((f"registry:{id}", "untraceable", problem) for problem in problems)


def small_cells(entries, threshold=SMALL_CELL):
    """Registered counts from 1 to threshold - 1 that are not suppressed. Never yields the value."""
    for id, entry in sorted(entries.items()):
        value = entry.get("value")
        if entry.get("kind") in COUNT_KINDS and _finite(value) and 1 <= value < threshold:
            yield f"registry:{id}", "small cell", f"a count from 1 to {threshold - 1} is not suppressed"


def check(files, registry_path, allowlist_path, threshold=SMALL_CELL):
    """(failures, checked): failures are (location, reason, token) and never carry registry values."""
    entries = load_registry(registry_path) or {}
    produced = registry_tokens(entries)
    declared = read_allowlist(allowlist_path)
    failures, checked = [], 0
    for rel in expand(files):
        ext = rel.rsplit(".", 1)[-1].lower() if "." in os.path.basename(rel) else ""
        if os.path.exists(rel) and ext not in CHECKED_EXTS:
            failures.append((rel, "unsupported file type", f".{ext}" if ext else "no extension"))
            continue
        text = _read(rel)
        if text is None:
            failures.append((rel, "unreadable file", "missing" if not os.path.exists(rel) else "not readable"))
            continue
        for number, code in inline_computed(text):
            checked += 1
            failures.append((f"{rel}:{number}", "inline computed value", code))
        for number, line, masked in lines(rel, text, declared):
            for match in PLACEHOLDER.finditer(line):
                checked += 1
                if match.group(1) not in entries:
                    failures.append((f"{rel}:{number}", "unknown registry id", match.group(0)))
            for _, token in numbers(masked):
                checked += 1
                if token not in produced:
                    failures.append((f"{rel}:{number}", "untraced number", token))
    failures.extend(stale(entries, _project_root()))
    failures.extend(untraceable(entries))
    failures.extend(small_cells(entries, threshold))
    if not entries or not checked:
        failures.append(("-", "nothing to check", "no registry entries" if not entries else "no numbers found"))
    return failures, checked


def render(source, out, registry_path):
    """Substitute each placeholder with its entry's text. Fails (writes nothing) on unknown or stale ids."""
    entries = load_registry(registry_path) or {}
    text = _read(source)
    if text is None:
        return [(source, "unreadable file", "missing")]
    failures, used = [], set()
    for number, line in enumerate(text.splitlines(), 1):
        for match in PLACEHOLDER.finditer(line):
            used.add(match.group(1))
            if match.group(1) not in entries:
                failures.append((f"{source}:{number}", "unknown registry id", match.group(0)))
    failures.extend(stale({id: entries[id] for id in used if id in entries}, _project_root()))
    if failures:
        return failures
    rendered = PLACEHOLDER.sub(lambda m: entries[m.group(1)]["text"], text)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(rendered)
    return []


def trace(files, registry_path):
    """One line per placeholder: sentence <- entry <- script@commit <- source#hash <- SAP output. No values."""
    entries = load_registry(registry_path) or {}
    out, failures = [], []
    for rel in expand(files):
        text = _read(rel)
        if text is None:
            failures.append((rel, "unreadable file", "missing"))
            continue
        for number, line in enumerate(text.splitlines(), 1):
            for match in PLACEHOLDER.finditer(line):
                entry = entries.get(match.group(1))
                if entry is None:
                    failures.append((f"{rel}:{number}", "unknown registry id", match.group(0)))
                    continue
                script = entry.get("script") or {}
                chain = [f"{rel}:{number} {match.group(0)}", f"registry {match.group(1)} ({entry.get('kind')})",
                         f"{script.get('path', 'no script')}@{(script.get('commit') or 'uncommitted')[:12]}"]
                chain += [f"{s.get('path')}#{str(s.get('sha256'))[:12]}" for s in entry.get("sources") or []]
                chain.append(f"SAP {entry.get('sap_output') or 'unmapped'}")
                out.append(" <- ".join(chain))
    return out, failures


def report(failures, summary):
    for location, reason, token in failures:
        print(f"{location}: {reason}: {token}")
    print(summary)
    return 1 if failures else 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="Check and render numbers locked to the registry.")
    sub = parser.add_subparsers(dest="command", required=True)
    gate = sub.add_parser("check", help="fail when a manuscript number cannot be traced to the registry")
    gate.add_argument("files", nargs="*")
    gate.add_argument("--registry", help=f"default: {REGISTRY_REL} in the project root")
    gate.add_argument("--allowlist", help=f"declared units and phrases (default: {ALLOWLIST_REL} in the project root)")
    gate.add_argument("--small-cell", type=int, default=SMALL_CELL, help="counts below this (from 1) must be suppressed")
    draw = sub.add_parser("render", help="substitute {{num:id}} placeholders with registry text")
    draw.add_argument("source")
    draw.add_argument("--out", required=True)
    draw.add_argument("--registry", help=f"default: {REGISTRY_REL} in the project root")
    chain = sub.add_parser("trace", help="show each placeholder's chain back to the SAP output (no values)")
    chain.add_argument("files", nargs="+")
    chain.add_argument("--registry", help=f"default: {REGISTRY_REL} in the project root")
    listing = sub.add_parser("ids", help="list registry ids with kind and SAP output (no values)")
    listing.add_argument("--registry", help=f"default: {REGISTRY_REL} in the project root")
    args = parser.parse_args(argv)
    root = _project_root()
    args.registry = args.registry or os.path.join(root, REGISTRY_REL)
    if args.command == "ids":
        entries = load_registry(args.registry)
        if not entries:
            print("FAIL: nothing to check (no registry entries)")
            return 1
        for id, entry in sorted(entries.items()):
            print(f"{id}\t{entry.get('kind')}\tSAP {entry.get('sap_output') or 'unmapped'}")
        return 0
    if args.command == "check":
        args.allowlist = args.allowlist or os.path.join(root, ALLOWLIST_REL)
    if args.command == "trace":
        out, failures = trace(args.files, args.registry)
        print("\n".join(out))
        return report(failures, f"{'FAIL' if failures else 'TRACED'}: {len(out)} placeholders")
    if args.command == "render":
        failures = render(args.source, args.out, args.registry)
        return report(failures, f"FAIL: {args.out} not written" if failures else f"RENDERED: {args.out}")
    if not args.files:
        print("FAIL: nothing to check (no manuscript or table files given)")
        return 1
    failures, checked = check(args.files, args.registry, args.allowlist, args.small_cell)
    return report(failures, f"{'FAIL' if failures else 'PASS'}: {checked} numbers checked, {len(failures)} problems")


if __name__ == "__main__":
    sys.exit(main())
