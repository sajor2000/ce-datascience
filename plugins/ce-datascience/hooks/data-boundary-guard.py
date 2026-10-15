#!/usr/bin/env python3
"""ce-datascience sensitive-data boundary guard (Claude Code PreToolUse hook).

Two functions carry the policy and are unit-tested in-process:

  resolve_mode(context) -> the project's boundary for this tool call
  classify(call, mode)  -> None (allow) or {"kind", "reason"} (deny)

Modes come from `phi_environment.mode` in the machine-local
`.ce-datascience/config.local.yaml` (worktree first, then the main checkout):

  approved           endpoint approved for the data -> no access limits
  no-sensitive-data  public or synthetic data       -> no access limits
  schema-only        endpoint not approved          -> data values stay out
  off                not a ce-datascience project    -> hook does nothing

Legacy keys map onto it: compliant: true -> approved, compliant: false ->
schema-only, sensitive_data: false -> no-sensitive-data. Any explicit
schema-only signal wins a conflict. An unreadable or misspelled value, or no
saved answer, also resolves to schema-only, with a deny reason that says why.

Egress (every mode except off): MCP tool arguments must not carry identifiers
(SSN, email, phone, keyword-anchored MRN/patient/member/claim IDs, DOB) or data
files, and Bash must not upload data files (curl/wget/scp/rsync and similar).
An endpoint approval does not cover third-party services.

Schema-only access: Read/Grep/NotebookRead on data files, Bash/Monitor/
PowerShell commands whose text references a data path (any program except a
metadata allowlist), inline interpreter code that opens data, and recursive
content searches are denied. Running an existing script file is allowed.
Limits: a script file can still print values; obfuscation the parser cannot
see is out of scope; this is defense in depth, not a sandbox.

Fail mode: config problems resolve to schema-only. An unexpected internal error
denies only calls that mention a data-like path or an upload; anything else is
allowed with a one-line stderr warning. Stdlib only; silent on allow.
"""

import json
import os
import re
import shlex
import sys

# One definition of a data file. schema-peek.py embeds an identical list (tested).
DATA_EXTS = (
    "csv", "tsv", "psv", "tab", "dat", "parquet", "feather", "arrow", "orc",
    "avro", "xlsx", "xlsm", "xlsb", "xls", "ods", "sas7bdat", "sas7bcat",
    "xpt", "dta", "sav", "zsav", "por", "rds", "rdata", "rda", "fst", "pkl",
    "pickle", "npy", "npz", "h5", "hdf5", "sqlite", "sqlite3", "db", "duckdb",
    "jsonl", "ndjson",
)
# Suffixes that wrap a data extension (data.csv.gz, data.csv.bak).
WRAP_EXTS = ("gz", "bz2", "xz", "zst", "zip", "7z", "bak", "orig", "old", "tmp", "part")
# Anything under data_root is data, including .json/.txt/.xml and archives.
DATA_REF = re.compile(
    r"(?<!pyarrow)(?<!pandas)(?<!polars)\.(?:"
    + "|".join(sorted(DATA_EXTS, key=len, reverse=True))
    + r")(?:\.(?:" + "|".join(WRAP_EXTS) + r"))*(?!\w|\.\w)",
    re.IGNORECASE,
)
DATAISH_DIRS = {"data", "raw", "rawdata", "restricted", "phi", "extract", "extracts",
                "private", "secure", "source_data", "sourcedata"}
CODE_EXTS = {
    "py", "r", "rmd", "qmd", "jl", "sh", "bash", "zsh", "sql", "js", "mjs", "cjs",
    "ts", "tsx", "jsx", "rb", "go", "rs", "java", "c", "h", "cc", "cpp", "hpp",
    "cs", "swift", "kt", "scala", "lua", "pl", "php", "do", "ado", "sas", "m",
    "md", "rst", "tex", "bib", "yaml", "yml", "toml", "cfg", "ini", "html", "css",
}
CODE_TYPES = {
    "py", "python", "r", "sh", "bash", "js", "ts", "typescript", "rust", "go",
    "java", "c", "cpp", "ruby", "lua", "julia", "sql", "md", "markdown", "yaml",
    "toml", "tex", "html", "css", "php", "perl", "swift", "kotlin", "scala",
}
SCRIPT_EXTS = {"py", "r", "sh", "bash", "zsh", "jl", "qmd", "rmd", "js", "mjs", "ts", "rb", "pl", "php", "lua", "do", "sas"}
MODES = ("approved", "schema-only", "no-sensitive-data")
AGGREGATE_DIRS = ("output", "results", "analysis/publication", "analysis/sap-tables")
CONFIG_REL = os.path.join(".ce-datascience", "config.local.yaml")

METADATA_VERBS = {
    "ls", "du", "stat", "file", "wc", "mkdir", "rmdir", "rm", "touch", "test", "[",
    "realpath", "readlink", "basename", "dirname", "md5", "md5sum", "shasum",
    "sha1sum", "sha256sum", "chmod", "chown", "chgrp", "cd", "pushd", "popd",
    "tree", "exa", "eza", "nbstripout", "unlink",
}
COPY_VERBS = {"cp", "mv", "ln", "rsync", "install"}
GREP_VERBS = {"grep", "egrep", "fgrep", "zgrep", "rg", "ag", "ack"}
SCRIPT_RUNNERS = re.compile(
    r"^(?:python(?:\d+(?:\.\d+)?)?|pypy\d?|rscript|bash|sh|zsh|julia|node|bun|deno|ruby|perl|php)$")
INTERPRETERS = re.compile(
    r"^(?:python(?:\d+(?:\.\d+)?)?|ipython\d?|pypy\d?|rscript|r|node|bun|deno|perl|ruby|"
    r"julia|php|nu|lua|duckdb|sqlite3|psql|sh|bash|zsh|fish|dash|ksh|pwsh|powershell|osascript)$")
INLINE_FLAG = re.compile(r"^(?:-[A-Za-z]*[ceEr]|-p|-ne|-pe|-cmd|--command|--commands|--eval|--expr|--print|eval|-|<<<)$")
LISTING_FUNCS = re.compile(r"\b(?:glob|iglob|listdir|scandir|walk|iterdir|rglob|list\.files|dir|Sys\.glob|readdir|fs\.ls|dir_ls)\s*\(")
EXEC_CONSUMERS = {"xargs", "parallel", "sh", "bash", "zsh", "while", "until", "source", ".", "eval", "exec"}
WRAPPERS = {"sudo", "time", "nice", "nohup", "command", "builtin", "exec", "stdbuf", "caffeinate", "env"}
RUN_WRAPPERS = {"uv": "run", "poetry": "run", "pipenv": "run", "pixi": "run", "conda": "run",
                "mamba": "run", "micromamba": "run", "hatch": "run", "rye": "run"}
SEPARATORS = {";", "&", "&&", "||", "|", "|&", "(", ")", ";;"}
REDIRECTS = {"<", ">", ">>", "<>", ">|", "&>", "&>>", ">&", "<&"}

# Egress: identifier patterns for MCP arguments. Keyword-anchored where digits alone are ambiguous.
IDENTIFIER_PATTERNS = (
    ("an SSN", re.compile(r"(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)")),
    ("an email address", re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")),
    ("a phone number", re.compile(r"(?<![\d/.])(?:\+?1[-. ]?)?(?:\(\d{3}\)\s?|\d{3}[-. ])\d{3}[-. ]\d{4}(?![\d/])")),
    ("a record identifier", re.compile(
        r"\b(?:mrn|medical[\s_-]*record(?:[\s_-]*(?:number|num|no|#))?|patient[\s_-]*(?:id|identifier|number|no)|"
        r"member[\s_-]*(?:id|number|no)|subscriber[\s_-]*id|claim[\s_-]*(?:number|num|no|id|#)|encounter[\s_-]*id)"
        r"[\s:=#._-]{0,4}[A-Za-z]{0,6}\d{4,}", re.IGNORECASE)),
    ("a date of birth", re.compile(
        r"\b(?:dob|d\.o\.b\.?|date[\s_-]*of[\s_-]*birth|birth[\s_-]*date)\b[\s:=#-]{0,4}"
        r"\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}", re.IGNORECASE)),
)
DOI_OR_PMC = re.compile(r"\b10\.\d{4,9}/\S+|\bPMC\d+\b", re.IGNORECASE)
EXEMPT_KEYS = {"pmid", "pmids", "pmcid", "pmcids", "doi", "dois", "id", "ids", "upload_id"}
RECIPIENT_KEYS = {"email", "emails", "recipient", "recipients", "to", "cc"}
UPLOADISH_TOOL = re.compile(r"upload|import|share|attach|send|export|publish|put|create-file", re.IGNORECASE)
UPLOAD_VERBS = {"curl", "wget", "scp", "sftp", "rsync", "http", "https", "xh", "aws", "gsutil",
                "gcloud", "rclone", "azcopy", "nc", "ncat", "ftp", "lftp"}
FALLBACK_RISK = re.compile(DATA_REF.pattern + r"|upload|--data|-T\s|=@|\s@[\w./~]", re.IGNORECASE)


class ConfigError(Exception):
    pass


# ---------------------------------------------------------------- resolve_mode

def _git_common_dir(top):
    import subprocess  # only linked worktrees need it

    try:
        out = subprocess.run(["git", "-C", top, "rev-parse", "--path-format=absolute", "--git-common-dir"],
                             capture_output=True, text=True, timeout=3)
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        pass
    try:  # git missing or old: parse the gitfile directly
        with open(os.path.join(top, ".git"), encoding="utf-8") as fh:
            line = fh.readline().strip()
        gitdir = os.path.normpath(os.path.join(top, line.split(":", 1)[1].strip()))
        with open(os.path.join(gitdir, "commondir"), encoding="utf-8") as fh:
            return os.path.normpath(os.path.join(gitdir, fh.read().strip()))
    except (OSError, IndexError):
        return None


def _locate(anchor, cache):
    """Return (ce_root, main_root) for the project containing anchor, or None."""
    probe = anchor
    while probe and not os.path.isdir(probe):
        parent = os.path.dirname(probe)
        if parent == probe:
            return None
        probe = parent
    if probe in cache:
        return cache[probe]
    ce_root, top, main = None, None, None
    walk = probe
    while True:
        if ce_root is None and os.path.isdir(os.path.join(walk, ".ce-datascience")):
            ce_root = walk
        if os.path.exists(os.path.join(walk, ".git")):
            top = walk
            break
        parent = os.path.dirname(walk)
        if parent == walk:
            break
        walk = parent
    if top and os.path.isfile(os.path.join(top, ".git")):
        common = _git_common_dir(top)
        if common and os.path.basename(common.rstrip(os.sep)) == ".git":
            main = os.path.dirname(common.rstrip(os.sep))
    if ce_root is None and main and os.path.isdir(os.path.join(main, ".ce-datascience")):
        ce_root = top
    result = (ce_root, main) if ce_root else None
    cache[probe] = result
    return result


def _scalar(raw):
    return raw.split(" #", 1)[0].strip().strip("'\"")


def _parse_bool(raw):
    value = _scalar(raw).lower()
    if value in ("true", "yes", "on"):
        return True
    if value in ("false", "no", "off"):
        return False
    if value in ("", "null", "~"):
        return None
    raise ConfigError


def read_config(path):
    """Parse only phi_environment and data_root. Returns (phi dict or None, data_root, error)."""
    try:
        with open(path, encoding="utf-8") as fh:
            lines = fh.read().splitlines()
    except UnicodeDecodeError:
        return None, None, "it is not UTF-8 text"
    except OSError:
        return None, None, "it cannot be opened"
    phi, data_root, in_phi = None, None, False
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" \t"))
        if indent == 0:
            in_phi = False
            if stripped.startswith("phi_environment:"):
                phi = {}
                rest = stripped[len("phi_environment:"):].strip()
                if rest.startswith("{"):
                    if not rest.rstrip().endswith("}"):
                        return None, data_root, "the phi_environment inline map is not closed"
                    for part in rest.strip()[1:-1].split(","):
                        if ":" in part:
                            key, value = part.split(":", 1)
                            phi[key.strip()] = value
                elif rest and not rest.startswith("#") and _scalar(rest).lower() not in ("null", "~"):
                    return None, data_root, "phi_environment is not a map"
                else:
                    in_phi = True
                continue
        elif in_phi and ":" in stripped:
            key, value = stripped.split(":", 1)
            phi[key.strip()] = value
            continue
        match = re.match(r"^data_root:\s*(.*)$", stripped)
        if match:
            value = _scalar(match.group(1))
            if value and value.lower() not in ("null", "~"):
                data_root = value
    return phi, data_root, None


def mode_from_config(phi, error):
    """Map phi_environment to (mode, why, detail). Any schema-only signal wins."""
    if error:
        return "schema-only", "unreadable", error
    if not phi:
        return "schema-only", "unset", ""
    signals, bad = [], []
    if "mode" in phi:
        value = _scalar(phi["mode"]).lower().replace("_", "-")
        if value in MODES:
            signals.append(value)
        elif value not in ("", "null", "~"):
            bad.append("mode")
    for key, mapping in (("compliant", {True: "approved", False: "schema-only"}),
                         ("sensitive_data", {False: "no-sensitive-data"})):
        if key in phi:
            try:
                value = _parse_bool(phi[key])
            except ConfigError:
                bad.append(key)
                continue
            if value in mapping:
                signals.append(mapping[value])
    if "schema-only" in signals:
        return "schema-only", "configured", ""
    if bad:
        return "schema-only", "unreadable", f"phi_environment.{bad[0]} has an unrecognized value"
    if "approved" in signals:
        return "approved", "configured", ""
    if "no-sensitive-data" in signals:
        return "no-sensitive-data", "configured", ""
    return "schema-only", "unset", ""


def _project_mode(ce_root, main):
    config = os.path.join(ce_root, CONFIG_REL)
    if not os.path.isfile(config) and main and os.path.isfile(os.path.join(main, CONFIG_REL)):
        config = os.path.join(main, CONFIG_REL)
    if os.path.isfile(config):
        phi, data_root, error = read_config(config)
    else:
        phi, data_root, error = None, None, None
    mode, why, detail = mode_from_config(phi, error)
    runs = os.path.join(ce_root, ".ce-datascience", "runs")  # ce-safe-run logs hold raw output
    data_roots = {runs, os.path.realpath(runs)}
    if data_root:
        expanded = os.path.expanduser(data_root)
        bases = [ce_root] + ([main] if main else [])
        for base in bases:
            path = os.path.normpath(expanded if os.path.isabs(expanded) else os.path.join(base, expanded))
            data_roots.update({path, os.path.realpath(path)})
    aggregate = set()
    for rel in AGGREGATE_DIRS:
        path = os.path.normpath(os.path.join(ce_root, rel))
        aggregate.update({path, os.path.realpath(path)})
    aggregate = sorted(aggregate)
    return {"mode": mode, "why": why, "detail": detail, "roots": [ce_root], "data_roots": sorted(data_roots),
            "aggregate_dirs": aggregate}


RANK = {"off": 0, "approved": 1, "no-sensitive-data": 1, "schema-only": 2}


def _anchors(context):
    cwd = context.get("cwd") or os.getcwd()
    tool_input = context.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        raise TypeError("tool_input is not an object")
    anchors = [cwd]
    for key in ("file_path", "notebook_path", "path"):
        value = tool_input.get(key)
        if isinstance(value, str) and value:
            anchors.append(_resolve(value, cwd))
    command = tool_input.get("command")
    if isinstance(command, str):
        for chunk in re.findall(r"(?:^|[\s'\"=:(<>@])((?:/|~/)[^\s'\";|&<>()`]+)", command)[:20]:
            anchors.append(_resolve(chunk, cwd))
    return cwd, anchors


def resolve_mode(context):
    """Resolve the boundary for a tool call from cwd and the paths it targets. Strictest project wins."""
    cwd, anchors = _anchors(context)
    cache, best, data_roots, roots, aggregate = {}, None, set(), [], set()
    for anchor in anchors:
        found = _locate(anchor, cache)
        if not found:
            continue
        project = _project_mode(*found)
        data_roots.update(project["data_roots"])
        aggregate.update(project["aggregate_dirs"])
        roots.extend(r for r in project["roots"] if r not in roots)
        if best is None or RANK[project["mode"]] > RANK[best["mode"]]:
            best = project
    if best is None:
        return {"mode": "off", "why": None, "detail": "", "roots": [], "data_roots": [], "aggregate_dirs": [], "cwd": cwd}
    return dict(best, roots=roots, data_roots=sorted(data_roots), aggregate_dirs=sorted(aggregate), cwd=cwd)


# ------------------------------------------------------------------- data refs

def _resolve(path, cwd):
    path = os.path.expanduser(path)
    if not os.path.isabs(path):
        path = os.path.join(cwd, path)
    return os.path.normpath(path)


def _under(path, roots):
    return any(path == r or path.startswith(r.rstrip(os.sep) + os.sep) for r in roots)


def expand_braces(text, limit=64):
    out, queue = [], [text]
    while queue and len(out) < limit:
        item = queue.pop()
        match = re.search(r"\{([^{}]*,[^{}]*)\}", item)
        if not match:
            out.append(item)
            continue
        for option in match.group(1).split(","):
            queue.append(item[:match.start()] + option + item[match.end():])
    return out or [text]


def notebook_has_outputs(path):
    try:
        with open(path, encoding="utf-8") as fh:
            notebook = json.load(fh)
        return any(cell.get("outputs") for cell in notebook.get("cells", []) if isinstance(cell, dict))
    except FileNotFoundError:
        return False
    except (OSError, ValueError, AttributeError):
        return True  # cannot verify the outputs are empty


def is_data_path(raw, cwd, mode):
    """True when a path names a data file: extension, data_root, symlink target, or a notebook with outputs."""
    if not raw:
        return False
    for variant in expand_braces(raw):
        if DATA_REF.search(variant):
            return True
        path = _resolve(variant, cwd)
        if _under(path, mode["data_roots"]):
            return True
        if any(ch in variant for ch in "*?["):
            parts = [p for p in variant.replace("\\", "/").split("/")[:-1] if p not in ("", ".", "..")]
            if parts and parts[-1].lower() in DATAISH_DIRS:
                return True
            continue
        if os.path.lexists(path):
            real = os.path.realpath(path)
            if real != path and (DATA_REF.search(real) or _under(real, mode["data_roots"])):
                return True
            if real.lower().endswith(".ipynb") and mode["mode"] == "schema-only" and notebook_has_outputs(real):
                return True
    return False


def _chunks(token):
    yield token
    for chunk in re.split(r"[=:,@<>()\"'`]", token):
        if chunk and chunk != token:
            yield chunk


def token_ref(token, cwd, mode, tainted):
    if tainted and re.search(r"\$\{?(" + "|".join(map(re.escape, tainted)) + r")\b", token):
        return True
    for chunk in _chunks(token):
        if not chunk or chunk.startswith("-") and "=" not in chunk:
            continue
        has_path_shape = "/" in chunk or "." in chunk or "*" in chunk
        if has_path_shape or os.path.lexists(_resolve(chunk, cwd)):
            if is_data_path(chunk, cwd, mode):
                return True
    return False


def text_ref(text, cwd, mode):
    """Data reference anywhere in free text (inline code, heredoc bodies)."""
    if any(DATA_REF.search(v) for v in expand_braces(text)):
        return True
    for root in mode["data_roots"]:
        if root in text:
            return True
    for chunk in re.findall(r"[\w.~/*?{},\[\]-]+", text):
        if ("/" in chunk or "*" in chunk) and is_data_path(chunk, cwd, mode):
            return True
    return False


def lists_dataish_dir(text, cwd, mode):
    if not LISTING_FUNCS.search(text):
        return False
    for literal in re.findall(r"['\"]([^'\"]+)['\"]", text):
        head = literal.replace("\\", "/").rstrip("/*").rstrip("/")
        name = head.rsplit("/", 1)[-1].lower()
        if name in DATAISH_DIRS or (head and _under(_resolve(head, cwd), mode["data_roots"])):
            return True
    return False


# -------------------------------------------------------------- shell parsing

def scan_shell(command):
    """Quote-aware pass: drop comments, turn unquoted newlines into ';', and lift heredoc bodies out.

    Returns (shell_text, bodies) where bodies is a list of (header_line, body_text).
    """
    out, bodies, pending = [], [], []
    i, n, quote, line_start = 0, len(command), None, 0
    while i < n:
        ch = command[i]
        if quote:
            out.append(ch)
            if ch == "\\" and quote == '"' and i + 1 < n:
                out.append(command[i + 1])
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch == "\\" and i + 1 < n:
            if command[i + 1] == "\n":
                i += 2
                continue
            out.append(command[i:i + 2])
            i += 2
            continue
        if ch in ("'", '"'):
            quote = ch
            out.append(ch)
            i += 1
            continue
        if ch == "#" and (i == 0 or command[i - 1] in " \t\n;&|("):
            while i < n and command[i] != "\n":
                i += 1
            continue
        if command.startswith("<<", i) and not command.startswith("<<<", i):
            match = re.match(r"<<-?\s*(?:'([^']*)'|\"([^\"]*)\"|\\?([A-Za-z_][\w-]*))", command[i:])
            if match:
                pending.append(match.group(1) or match.group(2) or match.group(3))
                out.append("<< ")
                i += match.end()
                continue
        if ch == "\n":
            header = "".join(out)[line_start:]
            out.append(" ; ")
            i += 1
            for delim in pending:
                body = []
                while i < n:
                    end = command.find("\n", i)
                    line = command[i:] if end == -1 else command[i:end]
                    i = n if end == -1 else end + 1
                    if line.strip() == delim:
                        break
                    body.append(line)
                bodies.append((header, "\n".join(body)))
            pending = []
            line_start = len("".join(out))
            continue
        out.append(ch)
        i += 1
    return "".join(out), bodies


def tokenize(text):
    try:
        lexer = shlex.shlex(text, posix=True, punctuation_chars=";&|<>()")
        lexer.whitespace_split = True
        return list(lexer), True
    except ValueError:
        return text.split(), False


def substitutions(text):
    return [m.group(1) or m.group(2) for m in re.finditer(r"[$<>]\(([^()]*)\)|`([^`]*)`", text)]


def segments(tokens):
    """Split tokens into pipelines (lists of segments). Each segment is a token list."""
    pipelines, pipeline, current = [], [], []
    for token in tokens:
        if token in SEPARATORS:
            if current:
                pipeline.append(current)
            current = []
            if token not in ("|", "|&"):
                if pipeline:
                    pipelines.append(pipeline)
                pipeline = []
            continue
        current.append(token)
    if current:
        pipeline.append(current)
    if pipeline:
        pipelines.append(pipeline)
    return pipelines


def program(token):
    return os.path.basename(token).lower()


def unwrap(tokens):
    """Strip assignments and wrappers. Returns (assignments, command tokens)."""
    assignments, rest = [], list(tokens)
    while rest:
        head = rest[0]
        if re.match(r"^[A-Za-z_]\w*=", head):
            assignments.append(head)
            rest.pop(0)
        elif program(head) in ("export", "declare", "local", "readonly", "typeset") and len(rest) > 1:
            rest.pop(0)
            while rest and rest[0].startswith("-"):
                rest.pop(0)
        elif program(head) in WRAPPERS:
            rest.pop(0)
            while rest and rest[0].startswith("-"):
                rest.pop(0)
        elif program(head) == "timeout" and len(rest) > 2:
            rest = rest[2:]
        elif program(head) in RUN_WRAPPERS and len(rest) > 1 and rest[1] == RUN_WRAPPERS[program(head)]:
            rest = rest[2:]
            while rest and rest[0].startswith("-"):
                flag = rest.pop(0)
                if flag in ("-n", "--name", "-p", "--prefix", "--with", "--python", "-e", "--env") and rest:
                    rest.pop(0)
        elif program(head) in ("uvx", "npx", "bunx", "pipx") and len(rest) > 1:
            rest.pop(0)
            if rest and rest[0] == "run":
                rest.pop(0)
        else:
            break
    return assignments, rest


def operands(args):
    """Non-option, non-redirect arguments."""
    out, skip = [], False
    for token in args:
        if skip:
            skip = False
            continue
        if token in REDIRECTS:
            skip = True
            continue
        if token.startswith("-") and token != "-":
            continue
        out.append(token)
    return out


# ------------------------------------------------------------ egress (Bash)

def _remote(token):
    return bool(re.match(r"^(?:[\w.-]+@)?[\w.-]+:(?!//)", token)) or bool(re.match(r"^(?:s3|gs|az|rsync|sftp|ftp)://", token))


def upload_violation(cmd, cwd, mode):
    verb = program(cmd[0])
    args = cmd[1:]
    if verb not in UPLOAD_VERBS:
        return None
    sources = []
    if verb in ("curl", "http", "https", "xh"):
        for index, token in enumerate(args):
            nxt = args[index + 1] if index + 1 < len(args) else ""
            if token in ("-T", "--upload-file"):
                sources.append(nxt)
            elif token.startswith("--upload-file="):
                sources.append(token.split("=", 1)[1])
            elif token in ("-F", "--form", "-d", "--data", "--data-binary", "--data-raw", "--data-urlencode", "--json"):
                sources.extend(re.findall(r"[@<]([^;,\s]+)", nxt))
            elif re.match(r"^--(?:data[\w-]*|form|json)=", token):
                sources.extend(re.findall(r"[@<]([^;,\s]+)", token.split("=", 1)[1]))
            elif verb != "curl" and re.match(r"^[\w-]*[@:]?=?@", token):
                sources.extend(re.findall(r"@([^\s]+)", token))
    elif verb == "wget":
        for index, token in enumerate(args):
            if token.startswith(("--post-file=", "--body-file=")):
                sources.append(token.split("=", 1)[1])
            elif token in ("--post-file", "--body-file") and index + 1 < len(args):
                sources.append(args[index + 1])
    else:
        ops = operands(args)
        if any(_remote(t) for t in ops):
            sources.extend(t for t in ops if not _remote(t))
    for source in sources:
        if source and is_data_path(source, cwd, mode):
            return f"`{verb}` would upload a data file"
    return None


# ------------------------------------------------------- schema-only (Bash)

def grep_violation(verb, args, cwd, mode, tainted):
    pattern_seen, files, includes = False, [], []
    recursive = verb in ("rg", "ag", "ack")
    listing = False
    i = 0
    if verb == "git-grep":
        recursive = True
    value_opts = {"-e", "--regexp", "-f", "--file", "-m", "--max-count", "-A", "-B", "-C", "--context",
                  "-d", "--directories", "-D", "--devices", "--include", "--exclude", "--exclude-dir",
                  "-g", "--glob", "--iglob", "-t", "--type", "-T", "--type-not", "--color", "--colour",
                  "-M", "--max-columns", "-j", "--threads", "--label", "--sort", "--sortr"}
    while i < len(args):
        token = args[i]
        if token in REDIRECTS:
            i += 2
            continue
        if token.startswith("--") and "=" in token:
            key, value = token.split("=", 1)
            if key in ("--include", "--glob", "--iglob", "--type"):
                includes.append(value)
            elif key in ("--file",):
                files.append(value)
            elif key == "--directories" and value == "recurse":
                recursive = True
            elif key == "--regexp":
                pattern_seen = True
            i += 1
            continue
        if token in value_opts:
            value = args[i + 1] if i + 1 < len(args) else ""
            if token in ("-e", "--regexp"):
                pattern_seen = True
            elif token in ("-f", "--file"):
                files.append(value)
            elif token in ("--include", "-g", "--glob", "--iglob", "-t", "--type"):
                includes.append(value)
            elif token in ("-d", "--directories") and value == "recurse":
                recursive = True
            i += 2
            continue
        if token.startswith("-") and token != "-":
            if token in ("--recursive", "--dereference-recursive"):
                recursive = True
            elif token in ("--count", "--files-with-matches", "--files-without-match", "--quiet", "--silent", "--files", "--count-matches"):
                listing = True
            elif not token.startswith("--"):
                flags = token[1:]
                if verb not in ("rg", "ag", "ack", "git-grep") and ("r" in flags or "R" in flags):
                    recursive = True
                if any(f in flags for f in "lLcq"):
                    listing = True
            i += 1
            continue
        if not pattern_seen:
            pattern_seen = True
        else:
            files.append(token)
        i += 1
    if listing:
        return None
    if recursive and (not files or any(os.path.isdir(_resolve(f, cwd)) for f in files)):
        code_only = includes and all(_is_code_glob(inc) for inc in includes)
        if not code_only:
            return "a recursive content search can print data rows; add --include/-g/-t limited to code types"
    if any(token_ref(f, cwd, mode, tainted) for f in files):
        return f"`{verb.replace('git-grep', 'git grep')}` on a data file prints its rows"
    return None


def _is_code_glob(value):
    value = value.strip()
    if re.match(r"^[A-Za-z]+$", value):
        return value.lower() in CODE_TYPES
    for variant in expand_braces(value):
        ext = variant.rsplit(".", 1)[-1].lower() if "." in variant else ""
        if ext not in CODE_EXTS:
            return False
    return True


def git_violation(args, cwd, mode, tainted):
    rest = list(args)
    while rest and rest[0].startswith("-"):
        flag = rest.pop(0)
        if flag in ("-C", "-c", "--git-dir", "--work-tree") and rest:
            rest.pop(0)
    if not rest:
        return None
    sub, sub_args = rest[0], rest[1:]
    if sub == "grep":
        return grep_violation("git-grep", sub_args, cwd, mode, tainted)
    if sub in ("add", "rm", "mv", "status", "ls-files", "check-ignore", "check-attr", "commit", "lfs", "stash"):
        return None
    if sub == "log" and not any(t in ("-p", "-u", "--patch", "--full-diff", "--word-diff") or t.startswith("-L")
                                for t in sub_args):
        return None
    if sub in ("diff", "show") and any(t in ("--stat", "--name-only", "--name-status", "--numstat", "--shortstat",
                                               "--summary", "--dirstat", "--quiet", "--exit-code") for t in sub_args):
        return None
    return f"`git {sub}` on a data path prints its contents"


def sed_ok(args, cwd, mode, tainted):
    script, files, i = None, [], 0
    while i < len(args):
        token = args[i]
        if token in ("-e", "--expression"):
            if script is not None:
                return False
            script = args[i + 1] if i + 1 < len(args) else ""
            i += 2
            continue
        if token.startswith("-") or token == "":
            i += 1
            continue
        if script is None:
            script = token
        else:
            files.append(token)
        i += 1
    if script is None or not re.match(r"^s(.)(?:(?!\1).)*\1(?:(?!\1).)*\1[gIip0-9]*$", script):
        return False
    return not any(token_ref(f, cwd, mode, tainted) for f in files)


SCRIPT_CAP = 1 << 20
LITERAL = re.compile(r"'([^'\n]{1,500})'|\"([^\"\n]{1,500})\"")
# Read calls (pandas, polars, pyarrow, readr, haven, readxl, data.table, base R, arrow, duckdb, sqlite).
READ_CALL = re.compile(
    r"(?:\b(?:read_(?:csv|tsv|table|delim|fwf|parquet|feather|ipc|excel|xlsx|xls|sas|stata|dta|spss|sav|xpt|json|rds|orc)"
    r"|read\.(?:csv2?|table|delim2?|dta|xport)|scan_(?:csv|parquet|ipc)|fread|vroom|readRDS|open_dataset|ParquetFile"
    r"|dbConnect)|\barrow::\w+|\bduckdb(?:\.|::)\w+|\bsqlite3?(?:\.|::)\w+)\s*\(\s*([^)\s]?)")


PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))


SAFE_RUNNER = os.path.join(PLUGIN_ROOT, "scripts", "ce-safe-run")


def is_safe_runner(token, cwd):
    """The plugin's own ce-safe-run (same file or byte-identical copy), never a look-alike."""
    path = os.path.realpath(_resolve(os.path.expandvars(token), cwd))
    if path == os.path.realpath(SAFE_RUNNER):
        return True
    try:
        with open(path, "rb") as a, open(SAFE_RUNNER, "rb") as b:
            return a.read(1 << 16) == b.read(1 << 16)
    except OSError:
        return False


_SCANNING = set()


def script_reads_data(path, cwd, mode):
    """Static, heuristic: does the script file name a data path? Reads at most 1 MB. Plugin scripts are trusted."""
    if _under(os.path.realpath(path), [PLUGIN_ROOT]):
        return False
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            text = fh.read(SCRIPT_CAP)
    except OSError:
        return False
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "ipynb":
        try:
            cells = json.loads(text).get("cells", [])
            text = "\n".join("".join(c.get("source", "")) for c in cells if isinstance(c, dict))
        except (ValueError, AttributeError, TypeError):
            return True  # cannot verify
    if ext in ("sh", "bash", "zsh") and path not in _SCANNING and len(_SCANNING) < 8:
        _SCANNING.add(path)
        try:
            if bash_violations(text, cwd, mode, 1)[1]:
                return True
        finally:
            _SCANNING.discard(path)
    if lists_dataish_dir(text, cwd, mode):
        return True
    if any(first not in ("'", '"', "") for first in READ_CALL.findall(text)):
        return True  # reads a path held in a variable or argument
    return any(is_data_path(lit, cwd, mode) and not in_aggregate_dir(lit, cwd, mode)
               for lit in (a or b for a, b in LITERAL.findall(text)))


def in_aggregate_dir(raw, cwd, mode):
    """A path under a configured aggregate directory and outside data_root (data_root always wins)."""
    path = _resolve(raw, cwd)
    real = os.path.realpath(path)
    return (_under(path, mode.get("aggregate_dirs", [])) and _under(real, mode.get("aggregate_dirs", []))
            and not _under(path, mode["data_roots"]) and not _under(real, mode["data_roots"]))


def script_file(verb, args):
    """The script, Quarto document, or executed notebook a command runs, or None."""
    ops = [t for t in args if not t.startswith("-")]
    if verb == "quarto":
        return ops[1] if ops[:1] == ["render"] and len(ops) > 1 else None
    if verb == "jupyter":
        if ops[:1] == ["nbconvert"] and "--execute" in args:
            return next((t for t in ops[1:] if t.lower().endswith(".ipynb")), None)
        return None
    if not SCRIPT_RUNNERS.match(verb):
        return None
    script = ops[0] if ops else ""
    ext = script.rsplit(".", 1)[-1].lower() if "." in os.path.basename(script) else ""
    return script if ext in SCRIPT_EXTS else None


def judge(cmd, cwd, mode, tainted, written):
    """Classify one unwrapped command. Returns (reason or None, listed_data)."""
    if not cmd:
        return None, False
    verb = program(cmd[0])
    args = cmd[1:]
    if verb in GREP_VERBS:
        return grep_violation(verb, args, cwd, mode, tainted), False
    if verb == "git":
        refs = any(token_ref(t, cwd, mode, tainted) for t in args)
        sub = [t for t in args if not t.startswith("-")][:1]
        if sub == ["grep"]:
            return git_violation(args, cwd, mode, tainted), False
        return (git_violation(args, cwd, mode, tainted) if refs else None), refs
    refs = any(token_ref(t, cwd, mode, tainted) for t in cmd)
    inline_index = next((i for i, t in enumerate(args) if INLINE_FLAG.match(t)), None)
    if INTERPRETERS.match(verb) and inline_index is not None:
        code = " ".join(args[inline_index + 1:inline_index + 2])
        if refs or text_ref(code, cwd, mode) or lists_dataish_dir(code, cwd, mode):
            return f"inline `{verb}` code that opens data returns its values", False
        return None, False
    script = script_file(verb, args)
    if script and script_reads_data(_resolve(script, cwd), cwd, mode):
        return f"the script `{script}` reads data and can print its values", False
    if not refs:
        return None, False
    if verb in METADATA_VERBS:
        return None, True
    if verb == "find":
        if any(t in ("-exec", "-execdir", "-ok", "-okdir", "-fprint", "-fprint0", "-fprintf", "-fls") for t in args):
            return "`find -exec` on data files can print their values", False
        return None, True
    if verb in COPY_VERBS:
        ops = operands(args)
        if ops and all(token_ref(t, cwd, mode, tainted) for t in ops):
            return None, True
        return f"`{verb}` would copy a data file to a non-data path", False
    if verb == "sed" and sed_ok(args, cwd, mode, tainted):
        return None, False
    if any(os.path.basename(t) == "schema-peek.py" for t in cmd[:3]) and re.match(r"^python", verb):
        return None, False
    if verb in ("jupyter",) and args[:1] == ["nbconvert"] and "--clear-output" in args:
        return None, False
    if verb in ("make", "quarto", "snakemake", "nextflow", "dvc", "pytest", "targets"):
        return None, False
    if SCRIPT_RUNNERS.match(verb):
        ops = [t for t in args if not t.startswith("-")]
        script = ops[0] if ops else ""
        ext = script.rsplit(".", 1)[-1].lower() if "." in os.path.basename(script) else ""
        if script and ext in SCRIPT_EXTS and not token_ref(script, cwd, mode, tainted):
            if _resolve(script, cwd) in written:
                return "writing a script that opens data and running it in one command returns its values", False
            return None, False
        if verb == "rscript" and ext == "r":
            return None, False
    return f"`{verb}` on a data file prints its values", False


def bash_violations(command, cwd, mode, depth=0):
    """Return (egress reason, access reason) for a shell command."""
    if depth > 3:
        return None, None
    shell, bodies = scan_shell(command)
    egress = access = None
    for inner in substitutions(shell):
        e, a = bash_violations(inner, cwd, mode, depth + 1)
        egress, access = egress or e, access or a
    tokens, _ = tokenize(shell)
    pipelines = segments(tokens)
    commands = [unwrap(seg) for pipeline in pipelines for seg in pipeline]
    runs_code = any(rest and (INTERPRETERS.match(program(rest[0])) or SCRIPT_RUNNERS.match(program(rest[0])))
                    for _, rest in commands)
    written = set()
    for index, token in enumerate(tokens[:-1]):
        if token in (">", ">>", ">|"):
            written.add(_resolve(tokens[index + 1], cwd))
    for header, body in bodies:
        header_tokens, _ = tokenize(header)
        feeders = [program(t) for t in header_tokens]
        if any(f in ("bash", "sh", "zsh", "dash", "ksh") for f in feeders):
            e, a = bash_violations(body, cwd, mode, depth + 1)
            egress, access = egress or e, access or a
        elif text_ref(body, cwd, mode) or lists_dataish_dir(body, cwd, mode):
            if any(INTERPRETERS.match(f) for f in feeders):
                access = access or "inline code that opens a data file returns its values"
            elif runs_code:
                access = access or "writing a script that opens data and running it in one command returns its values"
    tainted, cur = set(), cwd
    for pipeline in pipelines:
        listed = False
        for seg in pipeline:
            assignments, cmd = unwrap(seg)
            for assignment in assignments:
                name, value = assignment.split("=", 1)
                if token_ref(value, cur, mode, tainted):
                    tainted.add(name)
            if not cmd:
                continue
            safe = False
            if program(cmd[0]) == "ce-safe-run" and "--" in cmd:
                safe = is_safe_runner(cmd[0], cur)
                _, cmd = unwrap(cmd[cmd.index("--") + 1:])
                if not cmd:
                    continue
            egress = egress or upload_violation(cmd, cur, mode)
            if mode["mode"] != "schema-only" or safe:
                continue
            verb = program(cmd[0])
            if listed and verb in EXEC_CONSUMERS:
                sub = [t for t in cmd[1:] if not t.startswith("-")]
                if verb != "xargs" or not sub or program(sub[0]) not in METADATA_VERBS:
                    access = access or f"`{verb}` runs a command on listed data files"
            reason, listing = judge(cmd, cur, mode, tainted, written)
            access = access or reason
            listed = listed or listing
            if verb in ("cd", "pushd") and len(cmd) > 1:
                cur = _resolve(cmd[1], cur)
    return egress, access


# --------------------------------------------------------------- MCP egress

def _strings(value, key=""):
    if isinstance(value, str):
        yield key, value
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from _strings(v, str(k).lower())
    elif isinstance(value, list):
        for v in value:
            yield from _strings(v, key)


def mcp_violation(tool, tool_input, cwd, mode):
    uploadish = bool(UPLOADISH_TOOL.search(tool.split("__")[-1]))
    for key, value in _strings(tool_input):
        if key in EXEMPT_KEYS:
            continue
        text = DOI_OR_PMC.sub(" ", value)
        for label, pattern in IDENTIFIER_PATTERNS:
            if label == "an email address" and key in RECIPIENT_KEYS:
                continue
            if pattern.search(text):
                return f"an argument contains {label}"
        if uploadish and not value.startswith(("/clipboard", "http://", "https://")) and is_data_path(value.strip(), cwd, mode):
            return "the tool would send a local data file"
    return None


# ----------------------------------------------------------------- classify

def classify(call, mode):
    """Return None to allow, or {"kind": "egress"|"access", "reason": ...} to deny."""
    if mode["mode"] == "off":
        return None
    tool = call.get("tool_name", "") or ""
    tool_input = call.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        raise TypeError("tool_input is not an object")
    cwd = mode.get("cwd") or call.get("cwd") or os.getcwd()
    command = tool_input.get("command") if tool in ("Bash", "Monitor", "PowerShell") else None
    if tool.startswith("mcp__"):
        reason = mcp_violation(tool, tool_input, cwd, mode)
        return {"kind": "egress", "reason": reason} if reason else None
    egress, access = (bash_violations(command, cwd, mode) if isinstance(command, str) else (None, None))
    if egress:
        return {"kind": "egress", "reason": egress}
    if mode["mode"] != "schema-only":
        return None
    reason = access
    if tool in ("Read", "NotebookRead"):
        path = tool_input.get("file_path") or tool_input.get("notebook_path") or ""
        resolved = _resolve(path, cwd) if path else ""
        if resolved.lower().endswith(".ipynb") and os.path.exists(resolved) and notebook_has_outputs(resolved):
            reason = ("the notebook has saved outputs that may hold data values; clear them first with "
                      "`jupyter nbconvert --clear-output --inplace <notebook>`")
        elif is_data_path(path, cwd, mode):
            reason = "reading a data file returns its values"
    elif tool == "Grep":
        reason = grep_tool_violation(tool_input, cwd, mode)
    return {"kind": "access", "reason": reason} if reason else None


def grep_tool_violation(tool_input, cwd, mode):
    if (tool_input.get("output_mode") or "files_with_matches") != "content":
        return None
    path = tool_input.get("path") or ""
    target = _resolve(path or ".", cwd)
    if is_data_path(path or ".", cwd, mode) or _under(target, mode["data_roots"]):
        return "searching data files in content mode returns their rows"
    if path and os.path.isfile(target):
        return None
    glob, file_type = tool_input.get("glob") or "", (tool_input.get("type") or "").lower()
    if file_type and file_type in CODE_TYPES and not glob:
        return None
    if glob and _is_code_glob(glob) and (not file_type or file_type in CODE_TYPES):
        return None
    return "a content search that is not limited to code files can return data rows; set glob or type to code files"


# --------------------------------------------------------------------- main

def deny_message(result, mode, helper):
    reason = result["reason"]
    if result["kind"] == "egress":
        return (f"ce-datascience egress guard: {reason}. MCP tools and uploads receive search terms, MeSH terms, "
                "PMIDs, DOIs, and titles only, never data values, identifiers, row text, or data files. This holds "
                "in every mode: an endpoint approval does not cover third-party services.")
    if mode.get("why") == "unset":
        return ("ce-datascience: no sensitive-data boundary is recorded for this project, so data values stay out "
                f"of the model context ({reason}). Run the ce-setup skill and choose a boundary, or set "
                "phi_environment.mode in .ce-datascience/config.local.yaml.")
    if mode.get("why") == "unreadable":
        return ("ce-datascience: the phi_environment block in .ce-datascience/config.local.yaml cannot be read "
                f"({mode.get('detail')}), so schema-only mode applies ({reason}). Set phi_environment.mode to "
                "approved, schema-only, or no-sensitive-data, or re-run ce-setup.")
    return ("ce-datascience schema-only mode: the model endpoint is not approved for this project's sensitive "
            f"data ({reason}). Inspect structure with `python3 \"{helper}\" <file>` (headings, types, counts, "
            f"% missing only). Run scripts that read data through `{SAFE_RUNNER} -- <command>`: it keeps their "
            "output in a local log and prints only the exit code, files written, and a masked stderr tail. If the endpoint is "
            "approved, re-run ce-setup or set phi_environment.mode in .ce-datascience/config.local.yaml.")


def emit(message):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": message,
    }}))


def main():
    raw = sys.stdin.read()
    helper = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts", "schema-peek.py")
    try:
        payload = json.loads(raw or "{}")
        mode = resolve_mode(payload)
        result = classify(payload, mode)
    except Exception as exc:  # internal error: deny only risky calls
        if FALLBACK_RISK.search(raw):
            emit("ce-datascience data-boundary guard hit an internal error on a call that mentions a data file "
                 f"or an upload ({type(exc).__name__}), so it was blocked. Retry with a simpler command.")
        else:
            print(f"ce-datascience data-boundary guard skipped this call after an internal error: {type(exc).__name__}",
                  file=sys.stderr)
        return 0
    if result is not None:
        emit(deny_message(result, mode, helper))
    return 0


if __name__ == "__main__":
    sys.exit(main())
