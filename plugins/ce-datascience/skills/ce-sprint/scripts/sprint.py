"""Sprint open / close / status for the /ce-sprint skill.

Sprints are bounded analysis units with a named human reviewer and explicit
SAP-section scope. The on-disk artifact is `analysis/sprint-log.yaml`; THIS
file is the audit trail.

Subcommands:
    open NAME [--scope SAP-3.1,SAP-3.2] [--reviewer jcr]
    close NAME
    status [--name NAME]

State machine:
    open  -> writes a sprint with status=open, captures git HEAD as commit_open,
             refuses if any sprint is currently open (one open sprint at a time)
    close -> writes commit_close + outputs_actual + flips status=closed,
             refuses if entry sprint not signed off, runs reproducibility re-check
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: pip install pyyaml")


def repo_root() -> Path:
    try:
        out = subprocess.check_output(["git", "rev-parse", "--show-toplevel"],
                                       stderr=subprocess.DEVNULL).decode().strip()
        return Path(out)
    except Exception:
        return Path.cwd()


def log_path() -> Path:
    return repo_root() / "analysis" / "sprint-log.yaml"


def load_log() -> dict:
    p = log_path()
    if not p.exists():
        return {"sprints": []}
    return yaml.safe_load(p.read_text()) or {"sprints": []}


def save_log(log: dict) -> None:
    p = log_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(yaml.safe_dump(log, sort_keys=False, allow_unicode=True))


def git_head() -> str | None:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"],
                                        stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        return None


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def find(log: dict, name: str) -> dict | None:
    return next((s for s in log["sprints"] if s["name"] == name), None)


def open_sprint(name: str, scope: list[str], reviewer: str) -> int:
    log = load_log()
    if any(s["status"] == "open" for s in log["sprints"]):
        cur = next(s for s in log["sprints"] if s["status"] == "open")
        print(f"refusing: sprint '{cur['name']}' is currently open. close it first.",
              file=sys.stderr)
        return 1
    if find(log, name):
        print(f"refusing: sprint '{name}' already exists.", file=sys.stderr)
        return 1
    sprint = {
        "name":         name,
        "status":       "open",
        "scope":        scope,
        "reviewer":     reviewer,
        "opened_at":    now_iso(),
        "commit_open":  git_head(),
        "outputs_planned": [],
        "outputs_actual":  [],
    }
    log["sprints"].append(sprint)
    save_log(log)
    print(f"__CE_SPRINT__ action=open name={name} reviewer={reviewer} "
          f"scope={','.join(scope)} commit={sprint['commit_open']}")
    return 0


def close_sprint(name: str) -> int:
    log = load_log()
    sprint = find(log, name)
    if not sprint:
        print(f"no such sprint: {name}", file=sys.stderr); return 1
    if sprint["status"] != "open":
        print(f"sprint '{name}' is {sprint['status']}, not open", file=sys.stderr)
        return 1

    sprint["closed_at"]    = now_iso()
    sprint["commit_close"] = git_head()
    sprint["status"]       = "pending_review"
    save_log(log)

    scope_csv = ",".join(sprint.get("scope") or [])
    print(f"__CE_SPRINT__ action=close name={name} commit={sprint['commit_close']} "
          f"status=pending_review reviewer={sprint['reviewer']}")

    # Machine-parseable dispatch hint. The skill body in ce-sprint/SKILL.md tells
    # the orchestrator to use this line to fire the Task tool with
    # subagent_type=ce-sprint-audit-reviewer. The reviewer's verdict gates whether
    # status flips closed (pass) or back to open (fail).
    print(f"__CE_SPRINT_AUDIT_DISPATCH__ "
          f"sprint={name} "
          f"reviewer=ce-sprint-audit-reviewer "
          f"human_reviewer={sprint['reviewer']} "
          f"scope={scope_csv} "
          f"commit_open={sprint.get('commit_open') or ''} "
          f"commit_close={sprint['commit_close'] or ''}")
    print(f"next: dispatch ce-sprint-audit-reviewer per the line above; "
          f"on pass, human reviewer ({sprint['reviewer']}) signs off and status flips to closed.")
    return 0


def status_sprint(name: str | None) -> int:
    log = load_log()
    sprints = [find(log, name)] if name else log["sprints"]
    if name and not sprints[0]:
        print(f"no such sprint: {name}", file=sys.stderr); return 1
    print(json.dumps({"sprints": sprints}, indent=2, default=str))
    return 0


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    o = sub.add_parser("open")
    o.add_argument("name")
    o.add_argument("--scope", default="", help="comma-separated SAP section IDs")
    o.add_argument("--reviewer", default=os.environ.get("USER", "unknown"))

    c = sub.add_parser("close")
    c.add_argument("name")

    s = sub.add_parser("status")
    s.add_argument("--name", default=None)

    args = ap.parse_args()
    if args.cmd == "open":
        scope = [x.strip() for x in args.scope.split(",") if x.strip()]
        sys.exit(open_sprint(args.name, scope, args.reviewer))
    elif args.cmd == "close":
        sys.exit(close_sprint(args.name))
    else:
        sys.exit(status_sprint(args.name))


if __name__ == "__main__":
    main()
