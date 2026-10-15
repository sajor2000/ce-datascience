#!/usr/bin/env python3
"""ce-datascience sensitive-data boundary guard (Claude Code PreToolUse hook).

Reads the hook payload on stdin and, inside a ce-datascience project whose
machine-local config says the model endpoint is not approved for the project's
sensitive data, denies tool calls that would put data-file contents into the
model context: Read/Grep on data files, Bash commands that dump them, and
inline interpreter code that opens them. Everything else is allowed, including
running analysis scripts and the schema helper.

Decisions:
  - No `.ce-datascience/` directory at the git root or cwd -> allow silently.
  - phi_environment.compliant: true or sensitive_data: false -> allow silently.
  - compliant: false -> schema-only mode, deny data-file reads.
  - phi_environment unset -> deny data-file reads until setup records a boundary.

Defense in depth only: it cannot inspect what an arbitrary script prints.
Fails open (exit 0 plus a one-line stderr warning) on internal errors such as a
malformed config, so a hook bug never blocks unrelated work. Stdlib only.
"""

import json
import os
import re
import shlex
import sys

DATA_EXTS = (
    "csv", "tsv", "parquet", "feather", "arrow", "xlsx", "xls", "sas7bdat",
    "xpt", "dta", "sav", "rds", "rdata", "rda", "pkl", "pickle", "sqlite",
    "db", "duckdb", "jsonl", "ndjson",
)
DATA_REF = re.compile(
    r"\.(?:" + "|".join(DATA_EXTS) + r")(?:\.(?:gz|bz2|xz|zst|zip))?(?![\w.])",
    re.IGNORECASE,
)
DUMP_PROGRAMS = {
    "head", "tail", "cat", "tac", "less", "more", "most", "bat", "nl", "awk",
    "gawk", "mawk", "sed", "cut", "sort", "uniq", "grep", "egrep", "fgrep",
    "rg", "ag", "ack", "csvlook", "csvcut", "csvgrep", "csvstat", "csvsql",
    "in2csv", "xsv", "qsv", "mlr", "sqlite3", "duckdb", "jq", "column", "paste",
    "od", "xxd", "hexdump", "strings", "zcat", "gzcat", "bzcat", "xzcat",
    "zless", "zmore", "zgrep", "parquet-tools", "pqrs", "visidata", "vd",
}
INTERPRETERS = re.compile(
    r"^(?:python(?:\d+(?:\.\d+)?)?|ipython\d?|pypy\d?|rscript|r|node|bun|deno|"
    r"perl|ruby|julia|duckdb|sqlite3|sh|bash|zsh)$",
    re.IGNORECASE,
)
HEREDOC = re.compile(r"<<(?!<)-?\s*['\"]?([A-Za-z_]\w*)['\"]?")
INLINE_FLAGS = {"-c", "-e", "-p", "--command", "--eval", "--expr", "eval"}
CONFIG_REL = os.path.join(".ce-datascience", "config.local.yaml")


class ConfigError(Exception):
    pass


def find_project_root(cwd):
    """Return the ce-datascience project root for cwd, or None."""
    git_root = None
    probe = cwd
    while True:
        if os.path.exists(os.path.join(probe, ".git")):
            git_root = probe
            break
        parent = os.path.dirname(probe)
        if parent == probe:
            break
        probe = parent
    for candidate in (git_root, cwd):
        if candidate and os.path.isdir(os.path.join(candidate, ".ce-datascience")):
            return candidate
    return None


def main_checkout(root):
    """For a linked worktree, return the main checkout root (else None)."""
    dot_git = os.path.join(root, ".git")
    if not os.path.isfile(dot_git):
        return None
    with open(dot_git, encoding="utf-8") as fh:
        line = fh.readline().strip()
    if not line.startswith("gitdir:"):
        return None
    gitdir = os.path.normpath(os.path.join(root, line.split(":", 1)[1].strip()))
    commondir_file = os.path.join(gitdir, "commondir")
    if not os.path.isfile(commondir_file):
        return None
    with open(commondir_file, encoding="utf-8") as fh:
        common = os.path.normpath(os.path.join(gitdir, fh.read().strip()))
    return os.path.dirname(common)


def scalar(raw):
    value = raw.split(" #", 1)[0].strip().strip("'\"")
    return value


def parse_bool(raw, key):
    value = scalar(raw).lower()
    if value in ("true", "yes", "on"):
        return True
    if value in ("false", "no", "off"):
        return False
    if value in ("", "null", "~"):
        return None
    raise ConfigError(f"phi_environment.{key} is not true/false")


def read_config(root):
    """Parse only phi_environment and data_root from config.local.yaml."""
    path = os.path.join(root, CONFIG_REL)
    if not os.path.isfile(path):
        fallback = main_checkout(root)
        if fallback and os.path.isfile(os.path.join(fallback, CONFIG_REL)):
            path = os.path.join(fallback, CONFIG_REL)
        else:
            return {"present": False, "data_root": None}
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().splitlines()
    phi = {}
    present = False
    data_root = None
    in_phi = False
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        if indent == 0:
            in_phi = False
            if stripped.startswith("phi_environment:"):
                present = True
                rest = stripped[len("phi_environment:"):].strip()
                if rest.startswith("{"):
                    if not rest.endswith("}"):
                        raise ConfigError("phi_environment inline map is not closed")
                    for part in rest[1:-1].split(","):
                        if ":" in part:
                            key, value = part.split(":", 1)
                            phi[key.strip()] = value
                elif rest and not rest.startswith("#"):
                    raise ConfigError("phi_environment is not a map")
                else:
                    in_phi = True
                continue
        elif in_phi and ":" in stripped:
            key, value = stripped.split(":", 1)
            phi[key.strip()] = value
            continue
        match = re.match(r"^data_root:\s*(.*)$", stripped)
        if match:
            value = scalar(match.group(1))
            if value and value.lower() not in ("null", "~"):
                data_root = value
    compliant = parse_bool(phi["compliant"], "compliant") if "compliant" in phi else None
    sensitive = parse_bool(phi["sensitive_data"], "sensitive_data") if "sensitive_data" in phi else None
    if present and compliant is None and sensitive is None:
        present = False
    return {
        "present": present,
        "compliant": compliant,
        "sensitive_data": sensitive,
        "data_root": data_root,
    }


def resolve(path, cwd):
    path = os.path.expanduser(path)
    if not os.path.isabs(path):
        path = os.path.join(cwd, path)
    return os.path.normpath(path)


def under(path, root):
    return root is not None and (path == root or path.startswith(root.rstrip(os.sep) + os.sep))


def is_data_path(raw, cwd, data_root_abs):
    if not raw:
        return False
    if DATA_REF.search(raw):
        return True
    return under(resolve(raw, cwd), data_root_abs)


def mentions_data(text, data_root, data_root_abs):
    if DATA_REF.search(text):
        return True
    if data_root_abs and data_root_abs in text:
        return True
    if data_root and not os.path.isabs(data_root):
        rel = re.escape(data_root.rstrip("/"))
        return re.search(r"(?:^|[\s'\"(=,])(?:\./)?" + rel + r"(?:/|[\s'\")]|$)", text) is not None
    return False


def program_name(token):
    return os.path.basename(token).lower()


def split_heredocs(command):
    """Separate heredoc bodies from the shell text that feeds them."""
    lines = command.split("\n")
    shell_lines, bodies, index = [], [], 0
    while index < len(lines):
        line = lines[index]
        shell_lines.append(line)
        index += 1
        for match in HEREDOC.finditer(line):
            body = []
            while index < len(lines) and lines[index].strip() != match.group(1):
                body.append(lines[index])
                index += 1
            index += 1
            bodies.append((line, "\n".join(body)))
    return "\n".join(shell_lines), bodies


def tokenize(text):
    try:
        lexer = shlex.shlex(text, posix=True, punctuation_chars=";&|<>()")
        lexer.whitespace_split = True
        return list(lexer)
    except ValueError:
        return text.split()


def bash_violation(command, data_root, data_root_abs):
    """Return a short reason when a Bash command would expose data-file contents."""
    shell, bodies = split_heredocs(command)
    for line, body in bodies:
        feeds_interpreter = any(INTERPRETERS.match(program_name(t)) for t in tokenize(line))
        if feeds_interpreter and mentions_data(body, data_root, data_root_abs):
            return "inline code that opens a data file returns its values"
    if not mentions_data(shell, data_root, data_root_abs):
        return None
    tokens = tokenize(shell)
    for index, token in enumerate(tokens):
        name = program_name(token)
        if name in DUMP_PROGRAMS:
            return f"`{name}` on a data file prints its values"
        if INTERPRETERS.match(name):
            rest = tokens[index + 1:]
            if any(t in INLINE_FLAGS or t in ("-", "<<<") for t in rest):
                return f"inline `{name}` code that opens a data file returns its values"
    return None


def deny(reason, unset, helper):
    if unset:
        message = (
            "ce-datascience: no sensitive-data boundary is recorded for this project, so data-file "
            f"contents stay out of the model context ({reason}). Run the ce-setup skill and choose a "
            "boundary, or set phi_environment in .ce-datascience/config.local.yaml."
        )
    else:
        message = (
            "ce-datascience schema-only mode: the model endpoint is not approved for this project's "
            f"sensitive data ({reason}). Inspect structure with `python3 \"{helper}\" <file>` "
            "(headings, types, counts, % missing only), or write code the user runs locally that "
            "returns aggregates. If the endpoint is approved, re-run ce-setup or edit "
            "phi_environment in .ce-datascience/config.local.yaml."
        )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": message,
        }
    }))


def decide(payload):
    cwd = payload.get("cwd") or os.getcwd()
    root = find_project_root(cwd)
    if root is None:
        return None
    config = read_config(root)
    if config["present"] and (config["compliant"] is True or config["sensitive_data"] is False):
        return None
    data_root = config["data_root"]
    data_root_abs = resolve(data_root, root) if data_root else None
    tool = payload.get("tool_name", "")
    tool_input = payload.get("tool_input") or {}
    reason = None
    if tool == "Read":
        if is_data_path(tool_input.get("file_path", ""), cwd, data_root_abs):
            reason = "reading a data file returns its values"
    elif tool == "Grep":
        targets = [tool_input.get("path") or "", tool_input.get("glob") or ""]
        file_type = (tool_input.get("type") or "").lower()
        if file_type in DATA_EXTS or any(is_data_path(t, cwd, data_root_abs) for t in targets if t):
            reason = "searching a data file returns its values"
    elif tool == "Bash":
        reason = bash_violation(tool_input.get("command", ""), data_root, data_root_abs)
    if reason is None:
        return None
    return reason, not config["present"]


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        result = decide(payload)
    except Exception as exc:  # fail open on internal errors only
        print(f"ce-datascience data-boundary guard inactive for this call: {type(exc).__name__}: {exc}",
              file=sys.stderr)
        return 0
    if result is not None:
        helper = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                              "scripts", "schema-peek.py")
        deny(result[0], result[1], helper)
    return 0


if __name__ == "__main__":
    sys.exit(main())
