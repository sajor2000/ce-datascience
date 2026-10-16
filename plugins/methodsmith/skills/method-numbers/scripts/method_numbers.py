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
import xml.etree.ElementTree as ET
import zipfile

REGISTRY_REL = os.path.join("analysis", "numbers", "registry.json")
ALLOWLIST_REL = os.path.join("analysis", "numbers", "allowlist.txt")
OUTPUTS_REL = os.path.join("analysis", "sap-tables", "02-outputs.csv")


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


def format_number(value, kind, ci=None, digits=2, denominator=None, style="jama", sd=None, iqr=None):
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
    if interval:
        return f"{text} (95% CI, {interval})"
    if sd is not None:
        return f"{text} ({_fmt(sd, digits)})"
    if iqr is not None:
        return f"{text} ({_fmt(iqr[0], digits)}-{_fmt(iqr[1], digits)})"
    return text


def _entry(root, script, id, value, kind, ci=None, digits=2, denominator=None, style="jama", sources=(),
           sap_output=None, table=None, sd=None, iqr=None):
    if kind not in KINDS:
        raise ValueError(f"unknown kind; expected one of {', '.join(KINDS)}")
    if not all(_finite(v) for v in (value, *(ci or ()), *(iqr or ()), *([] if sd is None else [sd]))):
        raise ValueError(f"{id}: the registry holds finite numeric aggregates only")
    suppressed = kind in COUNT_KINDS and 1 <= value < SMALL_CELL
    entry = {
        "id": id,
        "value": None if suppressed else value,
        "kind": kind,
        "text": f"<{SMALL_CELL}" if suppressed else format_number(value, kind, ci, digits, denominator, style, sd, iqr),
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
                    sap_output=None, script=None, registry=None, sd=None, iqr=None):
    """Register one aggregate. Counts from 1 to 10 are stored suppressed, without their value."""
    root = _project_root()
    entry = _entry(root, _script(script), id, value, kind, ci, digits, denominator, style,
                   sources, sap_output, sd=sd, iqr=iqr)
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
    """(line number, [(column or None, original, masked)]) for a manuscript or table file.
    Table cells keep their quotes and carry their column number, so reports can locate a cell without
    printing it."""
    ext = rel.rsplit(".", 1)[-1].lower()
    if ext in TABLE_EXTS:
        reader = csv.reader(io.StringIO(text), delimiter=TABLE_EXTS[ext])
        start = 1
        for row in reader:
            yield start, [(i, cell, mask(cell, declared, quotes=False)) for i, cell in enumerate(row, 1)]
            start = reader.line_num + 1
        return
    yield from ((n, [(None, line, masked)]) for n, (line, masked) in
                enumerate(zip(text.splitlines(), mask(text, declared).splitlines()), 1))


def registry_tokens(entries):
    """Every numeric token the registry produces, from each entry's formatted text."""
    return {token for entry in entries.values() for _, token in numbers(str(entry.get("text", "")))}


CHECKED_EXTS = {"md", "qmd", "rmd", "markdown", "docx", *TABLE_EXTS}


# The data-boundary guard trusts plugin scripts, so this script keeps data out itself: it never reads a
# path that names a data directory or sits under a configured data_root, and it never prints tokens from
# tables or from files a method-safe-run run wrote (those count as data until checked as aggregates).
DATAISH_DIRS = {"data", "raw", "rawdata", "restricted", "phi", "extract", "extracts", "private", "secure",
                "source_data", "sourcedata"}


def _data_roots(root):
    text = _read(os.path.join(root, ".ce-datascience", "config.local.yaml")) or ""
    return [os.path.realpath(os.path.join(root, value.strip().strip("'\""))) for value in
            re.findall(r"^\s*data_root:\s*([^#\n]+)", text, re.M) if value.strip()]


def is_data_path(path, root):
    """A path inside a data-like directory or a configured data_root (checked without reading it)."""
    real = os.path.realpath(path)
    rel = os.path.relpath(real, root)
    parts = real.split(os.sep) if rel.startswith("..") else rel.split(os.sep)
    if any(part.lower() in DATAISH_DIRS for part in parts):
        return True
    return any(real == r or real.startswith(r + os.sep) for r in _data_roots(root))


def run_outputs(root):
    """Files method-safe-run runs wrote; the guard treats them as data."""
    text = _read(os.path.join(root, ".ce-datascience", "runs", "outputs.txt")) or ""
    return {os.path.realpath(os.path.join(root, line)) for line in text.splitlines() if line}


def expand(paths, root=None):
    """Files to check: directories expand (sorted) to manuscript and table files, skipping data
    directories; files and data paths pass through so the caller can refuse them."""
    root = root or _project_root()
    for path in paths:
        if os.path.isdir(path) and not is_data_path(path, root):
            for base, dirs, names in os.walk(path):
                dirs[:] = sorted(d for d in dirs if not d.startswith(".")
                                 and not is_data_path(os.path.join(base, d), root))
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


def sap_outputs(path):
    """Output IDs declared in the SAP outputs catalog (file names, with and without extension), or None."""
    text = _read(path)
    if text is None:
        return None
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        return set()
    header = [cell.strip().lower() for cell in rows[0]]
    column = next((i for i, name in enumerate(header) if name.startswith(("output id", "output file", "output"))), 0)
    ids = set()
    for row in rows[1:]:
        cell = row[column].strip() if column < len(row) else ""
        if cell and "|" not in cell:  # section banner rows carry "SECTION | script"
            ids.update({cell, os.path.splitext(cell)[0]})
    return ids


def unknown_sap_outputs(entries, declared):
    for id, entry in sorted(entries.items()):
        output = entry.get("sap_output")
        if output and output not in declared:
            yield f"registry:{id}", "unknown SAP output", output


def small_cells(entries, threshold=SMALL_CELL):
    """Registered counts from 1 to threshold - 1 that are not suppressed. Never yields the value."""
    for id, entry in sorted(entries.items()):
        value = entry.get("value")
        if entry.get("kind") in COUNT_KINDS and _finite(value) and 1 <= value < threshold:
            yield f"registry:{id}", "small cell", f"a count from 1 to {threshold - 1} is not suppressed"


def check(files, registry_path, allowlist_path, threshold=SMALL_CELL, outputs_path=None, outputs_required=False):
    """(failures, checked): failures are (location, reason, token) and never carry registry values."""
    entries = load_registry(registry_path) or {}
    produced = registry_tokens(entries)
    declared = read_allowlist(allowlist_path)
    failures, checked = [], 0
    root = _project_root()
    written = run_outputs(root)
    for rel in expand(files, root):
        if is_data_path(rel, root):
            failures.append((rel, "refused", "data path"))
            continue
        ext = rel.rsplit(".", 1)[-1].lower() if "." in os.path.basename(rel) else ""
        if os.path.exists(rel) and ext not in CHECKED_EXTS:
            failures.append((rel, "unsupported file type", f".{ext}" if ext else "no extension"))
            continue
        if ext == "docx" and os.path.exists(rel):
            found, count = check_docx(rel, entries, produced, declared)
            failures.extend(found)
            checked += count
            continue
        text = _read(rel)
        if text is None:
            failures.append((rel, "unreadable file", "missing" if not os.path.exists(rel) else "not readable"))
            continue
        for number, code in inline_computed(text):
            checked += 1
            failures.append((f"{rel}:{number}", "inline computed value", code))
        hidden = os.path.realpath(rel) in written
        for number, cells in lines(rel, text, declared):
            for column, line, masked in cells:
                for match in PLACEHOLDER.finditer(line):
                    checked += 1
                    if match.group(1) not in entries:
                        failures.append((f"{rel}:{number}", "unknown registry id", match.group(0)))
                untraced = []
                for _, token in numbers(masked):
                    checked += 1
                    if token not in produced:
                        untraced.append(token)
                if column and untraced:
                    untraced = [f"column {column}"]  # one report per table cell, located not printed
                elif hidden:
                    untraced = ["value hidden (run output)"] * len(untraced)
                failures.extend((f"{rel}:{number}", "untraced number", shown) for shown in untraced)
    failures.extend(stale(entries, _project_root()))
    failures.extend(untraceable(entries))
    declared_outputs = sap_outputs(outputs_path) if outputs_path else None
    if declared_outputs is not None:
        failures.extend(unknown_sap_outputs(entries, declared_outputs))
    elif outputs_required:
        failures.append((outputs_path, "unreadable file", "missing"))
    failures.extend(small_cells(entries, threshold))
    if not entries or not checked:
        failures.append(("-", "nothing to check", "no registry entries" if not entries else "no numbers found"))
    return failures, checked


# ------------------------------------------------------------------ Word (DOCX)

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"
DOCX_PARTS = ("word/document.xml", "word/footnotes.xml", "word/endnotes.xml")
FIELD = "CE_NUM"  # Word field: { ADDIN CE_NUM <id> }, the way Zotero keeps citations as ADDIN fields
FIELD_INSTR = re.compile(r"^\s*ADDIN\s+" + FIELD + r"\s+(\S+)\s*$")


def _w(tag):
    return f"{{{W}}}{tag}"


def _xml_load(data):
    """(root, prolog, root start tag). The original start tag is kept so namespace declarations
    ElementTree would drop (those named only in mc:Ignorable) survive the round trip."""
    text = data.decode("utf-8")
    start = re.search(r"<(?!\?|!)[^>]+>", text)
    for prefix, uri in re.findall(r'xmlns:([\w.-]+)="([^"]+)"', start.group(0)):
        ET.register_namespace(prefix, uri)
    return ET.fromstring(data), text[:start.start()], start.group(0)


def _xml_dump(root, prolog, start_tag):
    body = ET.tostring(root, encoding="unicode")
    return (prolog + start_tag + body[re.search(r"<[^>]+>", body).end():]).encode("utf-8")


def _docx_parts(path):
    with zipfile.ZipFile(path) as archive:
        return {info.filename: archive.read(info.filename) for info in archive.infolist()}


def _owned_runs(paragraph, parents):
    """Runs whose nearest enclosing paragraph is this one (text-box paragraphs own their own runs)."""
    for run in paragraph.iter(_w("r")):
        node = parents.get(run)
        while node is not None and node.tag != _w("p"):
            node = parents.get(node)
        if node is paragraph:
            yield run


def _simple(run):
    """A run holding only optional formatting and one text node."""
    kids = [k for k in run if k.tag != _w("rPr")]
    return len(kids) == 1 and kids[0].tag == _w("t")


def _run(rpr, child):
    run = ET.Element(_w("r"))
    if rpr is not None:
        run.append(_copy(rpr))
    run.append(child)
    return run


def _copy(element):
    return ET.fromstring(ET.tostring(element))


def _text(value):
    node = ET.Element(_w("t"))
    node.set(XML_SPACE, "preserve")
    node.text = value
    return node


def _field(rpr, id, result):
    begin, separate, end = (ET.Element(_w("fldChar")) for _ in range(3))
    begin.set(_w("fldCharType"), "begin")
    separate.set(_w("fldCharType"), "separate")
    end.set(_w("fldCharType"), "end")
    instr = ET.Element(_w("instrText"))
    instr.set(XML_SPACE, "preserve")
    instr.text = f" ADDIN {FIELD} {id} "
    return [_run(rpr, begin), _run(rpr, instr), _run(rpr, separate), _run(rpr, _text(result)), _run(rpr, end)]


def _groups(paragraph, parents):
    """Consecutive simple runs that share a parent: the spans a placeholder may cross."""
    group = []
    for run in _owned_runs(paragraph, parents):
        if _simple(run) and (not group or parents[group[-1]] is parents[run]):
            group.append(run)
            continue
        if group:
            yield group
        group = [run] if _simple(run) else []
    if group:
        yield group


def _replace_one(paragraph, parents, entries):
    """Replace the first placeholder in the paragraph with a field. Returns the id, or None."""
    for group in _groups(paragraph, parents):
        texts = [run.find(_w("t")).text or "" for run in group]
        match = PLACEHOLDER.search("".join(texts))
        if not match:
            continue
        id = match.group(1)
        offsets, total = [], 0
        for text in texts:
            offsets.append(total)
            total += len(text)
        first = max(i for i, off in enumerate(offsets) if off <= match.start())
        last = max(i for i, off in enumerate(offsets) if off < match.end())
        rpr = group[first].find(_w("rPr"))
        new = []
        before = texts[first][:match.start() - offsets[first]]
        after = texts[last][match.end() - offsets[last]:]
        if before:
            new.append(_run(rpr, _text(before)))
        new += _field(rpr, id, entries[id]["text"])
        if after:
            new.append(_run(group[last].find(_w("rPr")), _text(after)))
        parent = parents[group[first]]
        index = list(parent).index(group[first])
        for run in group[first:last + 1]:
            parent.remove(run)
        for offset, element in enumerate(new):
            parent.insert(index + offset, element)
        return id
    return None


def _paragraph_text(paragraph, parents):
    return "".join(node.text or "" for run in _owned_runs(paragraph, parents) for node in run.iter(_w("t")))


def _location(path, part, number):
    """file.docx:p12 for the body, file.docx:footnotes:p3 for other parts."""
    label = "" if part == "word/document.xml" else f"{os.path.basename(part)[:-4]}:"
    return f"{path}:{label}p{number}"


def _owner(element, parents):
    node = parents.get(element)
    while node is not None and node.tag != _w("p"):
        node = parents.get(node)
    return node


def _pieces(paragraph, parents):
    """(plain text, [(field id or None, cached result)]) for one paragraph. Field instructions and
    deleted text are not text; results of other fields (citations, cross-references, page numbers) are
    kept apart from the plain text and reported with id None."""
    plain, fields, stack, inside_simple = [], [], [], set()
    for node in paragraph.iter():
        if node is paragraph or _owner(node, parents) is not paragraph or node in inside_simple:
            continue
        if node.tag == _w("fldSimple"):
            inside_simple.update(node.iter())
            match = FIELD_INSTR.match(node.get(_w("instr"), ""))
            fields.append((match.group(1) if match else None, "".join(t.text or "" for t in node.iter(_w("t")))))
        elif node.tag == _w("fldChar"):
            kind = node.get(_w("fldCharType"))
            if kind == "begin":
                stack.append({"instr": "", "result": "", "separated": False})
            elif kind == "separate" and stack:
                stack[-1]["separated"] = True
            elif kind == "end" and stack:
                done = stack.pop()
                match = FIELD_INSTR.match(done["instr"])
                fields.append((match.group(1) if match else None, done["result"]))
        elif node.tag == _w("instrText") and stack:
            stack[-1]["instr"] += node.text or ""
        elif node.tag == _w("t"):
            if stack:
                if stack[-1]["separated"]:
                    stack[-1]["result"] += node.text or ""
            else:
                plain.append(node.text or "")
        elif node.tag in (_w("tab"), _w("br"), _w("cr")) and not stack:
            plain.append(" ")
    return "".join(plain), fields


def docx_paragraphs(path):
    """(location, plain text, fields) for each paragraph of the body, footnotes, and endnotes."""
    parts = _docx_parts(path)
    for name in DOCX_PARTS:
        if name not in parts:
            continue
        root = _xml_load(parts[name])[0]
        parents = {child: parent for parent in root.iter() for child in parent}
        for number, paragraph in enumerate(root.iter(_w("p")), 1):
            yield (_location(path, name, number), *_pieces(paragraph, parents))


def check_docx(rel, entries, produced, declared):
    """(failures, checked) for a Word file: CE_NUM fields must hold their entry's current text."""
    failures, checked = [], 0
    try:
        paragraphs = list(docx_paragraphs(rel))
    except (OSError, zipfile.BadZipFile, ET.ParseError):
        return [(rel, "unreadable file", "not a DOCX")], 0
    for location, text, fields in paragraphs:
        for id, result in fields:
            if id is None:
                continue
            checked += 1
            if id not in entries:
                failures.append((location, "unknown registry id", f"{{{{num:{id}}}}}"))
            elif result != entries[id].get("text"):
                failures.append((location, "field result differs from registry", f"{{{{num:{id}}}}}"))
        for match in PLACEHOLDER.finditer(text):
            checked += 1
            if match.group(1) not in entries:
                failures.append((location, "unknown registry id", match.group(0)))
        for _, token in numbers(mask(text, declared)):
            checked += 1
            if token not in produced:
                failures.append((location, "untraced number", token))
    return failures, checked


def _refresh_fields(paragraph, parents, entries):
    """Set each CE_NUM field's cached result to its entry's current text."""
    stack = []
    for node in paragraph.iter():
        if _owner(node, parents) is not paragraph:
            continue
        if node.tag == _w("fldChar"):
            kind = node.get(_w("fldCharType"))
            if kind == "begin":
                stack.append({"instr": "", "separated": False, "texts": []})
            elif kind == "separate" and stack:
                stack[-1]["separated"] = True
            elif kind == "end" and stack:
                done = stack.pop()
                match = FIELD_INSTR.match(done["instr"])
                if match and match.group(1) in entries and done["texts"]:
                    done["texts"][0].text = entries[match.group(1)]["text"]
                    for extra in done["texts"][1:]:
                        extra.text = ""
        elif node.tag == _w("instrText") and stack:
            stack[-1]["instr"] += node.text or ""
        elif node.tag == _w("t") and stack and stack[-1]["separated"]:
            stack[-1]["texts"].append(node)


def render_docx(source, out, registry_path):
    """Placeholders become CE_NUM fields whose result is the entry's text; the source is never modified."""
    entries = load_registry(registry_path) or {}
    try:
        parts = _docx_parts(source)
    except (OSError, zipfile.BadZipFile):
        return [(source, "unreadable file", "not a DOCX")]
    failures, used, trees = [], set(), {}
    for name in DOCX_PARTS:
        if name not in parts:
            continue
        root, prolog, start = trees[name] = _xml_load(parts[name])
        parents = {child: parent for parent in root.iter() for child in parent}
        for number, paragraph in enumerate(root.iter(_w("p")), 1):
            text, fields = _pieces(paragraph, parents)
            ids = [m.group(1) for m in PLACEHOLDER.finditer(text)] + [id for id, _ in fields if id]
            for id in ids:
                used.add(id)
                if id not in entries:
                    failures.append((_location(source, name, number), "unknown registry id", f"{{{{num:{id}}}}}"))
    if not used:
        return [(source, "nothing to render", "no {{num:<id>}} placeholders or CE_NUM fields")]
    failures.extend(stale({id: entries[id] for id in used if id in entries}, _project_root()))
    if failures:
        return failures
    for name, (root, prolog, start) in trees.items():
        for number, paragraph in enumerate(root.iter(_w("p")), 1):
            parents = {child: parent for parent in root.iter() for child in parent}
            _refresh_fields(paragraph, parents, entries)
            while _replace_one(paragraph, parents, entries):
                parents = {child: parent for parent in root.iter() for child in parent}
            left = PLACEHOLDER.search(_paragraph_text(paragraph, parents))
            if left:
                failures.append((_location(source, name, number), "placeholder split across formatting", left.group(0)))
        parts[name] = _xml_dump(root, prolog, start)
    if failures:
        return failures
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in parts.items():
            archive.writestr(name, data)
    return []


def render(source, out, registry_path):
    """Substitute each placeholder with its entry's text. Fails (writes nothing) on unknown or stale ids."""
    if is_data_path(source, _project_root()):
        return [(source, "refused", "data path")]
    if source.lower().endswith(".docx"):
        return render_docx(source, out, registry_path)
    entries = load_registry(registry_path) or {}
    text = _read(source)
    if text is None:
        return [(source, "unreadable file", "missing")]
    if not PLACEHOLDER.search(text):
        return [(source, "nothing to render", "no {{num:<id>}} placeholders")]
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


def _uses(rel):
    """(location, id) for each placeholder, and each CE_NUM field in a Word file. None when unreadable."""
    if rel.lower().endswith(".docx"):
        try:
            return [(location, id) for location, text, fields in docx_paragraphs(rel)
                    for id in [m.group(1) for m in PLACEHOLDER.finditer(text)] + [f for f, _ in fields if f]]
        except (OSError, zipfile.BadZipFile, ET.ParseError):
            return None
    text = _read(rel)
    if text is None:
        return None
    return [(f"{rel}:{number}", m.group(1)) for number, line in enumerate(text.splitlines(), 1)
            for m in PLACEHOLDER.finditer(line)]


def trace(files, registry_path):
    """One line per placeholder: sentence <- entry <- script@commit <- source#hash <- SAP output. No values."""
    entries = load_registry(registry_path) or {}
    out, failures = [], []
    for rel in expand(files):
        uses = _uses(rel)
        if uses is None:
            failures.append((rel, "unreadable file", "missing or not readable"))
            continue
        for location, id in uses:
            entry = entries.get(id)
            if entry is None:
                failures.append((location, "unknown registry id", f"{{{{num:{id}}}}}"))
                continue
            script = entry.get("script") or {}
            chain = [f"{location} {{{{num:{id}}}}}", f"registry {id} ({entry.get('kind')})",
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
    gate.add_argument("--sap-outputs", help=f"SAP outputs catalog (default: {OUTPUTS_REL} in the project root, when present)")
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
        args.outputs_required = bool(args.sap_outputs)
        args.sap_outputs = args.sap_outputs or os.path.join(root, OUTPUTS_REL)
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
    failures, checked = check(args.files, args.registry, args.allowlist, args.small_cell, args.sap_outputs,
                              args.outputs_required)
    return report(failures, f"{'FAIL' if failures else 'PASS'}: {checked} numbers checked, {len(failures)} problems")


if __name__ == "__main__":
    sys.exit(main())
