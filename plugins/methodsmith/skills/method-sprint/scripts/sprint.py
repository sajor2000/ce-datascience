"""Sprint open / close / status for the /method-sprint skill.

Sprints are bounded analysis units with a named human reviewer and explicit
SAP-section scope. The on-disk artifact is `analysis/sprint-log.yaml`; THIS
file is the audit trail.

Subcommands:
    open NAME [--scope SAP-3.1,SAP-3.2] [--reviewer jcr]
    close [NAME]            (defaults to the currently open sprint)
    status [--name NAME]
    signoff NAME --by REVIEWER

State machine (statuses written to sprint-log.yaml):
    open                   -> `open NAME` writes status=open and captures git HEAD
                              as commit_open; refuses while another sprint is open
    pending_review         -> `close NAME` captures commit_close and waits for the
                              method-sprint-audit-reviewer verdict
    closed_pending_signoff -> set by the skill when the audit passes; a failing
                              audit sets the sprint back to open
    signed_off             -> `signoff NAME --by REVIEWER` after the named human
                              reviewer signs off; refuses unless the sprint is
                              closed_pending_signoff and REVIEWER matches
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
    sys.exit("PyYAML is required: run with `uv run --with pyyaml python3 sprint.py ...` "
             "or install pyyaml in the project environment")


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


def close_sprint(name: str | None) -> int:
    log = load_log()
    if name is None:
        open_sprints = [s for s in log["sprints"] if s.get("status") == "open"]
        if not open_sprints:
            print("no sprint is currently open; pass the sprint name explicitly", file=sys.stderr)
            return 1
        name = open_sprints[0]["name"]
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

    # Machine-parseable dispatch hint. The skill body in method-sprint/SKILL.md tells
    # the orchestrator to use this line to fire the Task tool with
    # subagent_type=method-sprint-audit-reviewer. The reviewer's verdict gates whether
    # status moves to closed_pending_signoff (pass) or back to open (fail).
    print(f"__CE_SPRINT_AUDIT_DISPATCH__ "
          f"sprint={name} "
          f"reviewer=method-sprint-audit-reviewer "
          f"human_reviewer={sprint['reviewer']} "
          f"scope={scope_csv} "
          f"commit_open={sprint.get('commit_open') or ''} "
          f"commit_close={sprint['commit_close'] or ''}")
    print(f"next: dispatch method-sprint-audit-reviewer per the line above; "
          f"on pass, status becomes closed_pending_signoff until the human reviewer "
          f"({sprint['reviewer']}) signs off (status signed_off).")
    return 0


def signoff_sprint(name: str, by: str) -> int:
    log = load_log()
    sprint = find(log, name)
    if not sprint:
        print(f"no such sprint: {name}", file=sys.stderr); return 1
    if sprint.get("status") != "closed_pending_signoff":
        print(f"sprint '{name}' is {sprint.get('status')}, not closed_pending_signoff; "
              f"sign-off needs a passing audit first", file=sys.stderr)
        return 1
    if by != sprint.get("reviewer"):
        print(f"sign-off must come from the named reviewer "
              f"'{sprint.get('reviewer')}', not '{by}'", file=sys.stderr)
        return 1
    sprint["status"]        = "signed_off"
    sprint["signed_off_by"] = by
    sprint["signed_off_at"] = now_iso()
    save_log(log)
    print(f"__CE_SPRINT__ action=signoff name={name} reviewer={by} status=signed_off")
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
    c.add_argument("name", nargs="?", default=None,
                   help="sprint to close; defaults to the currently open sprint")

    s = sub.add_parser("status")
    s.add_argument("--name", default=None)

    g = sub.add_parser("signoff")
    g.add_argument("name")
    g.add_argument("--by", required=True, help="the sprint's named human reviewer")

    args = ap.parse_args()
    if args.cmd == "open":
        scope = [x.strip() for x in args.scope.split(",") if x.strip()]
        sys.exit(open_sprint(args.name, scope, args.reviewer))
    elif args.cmd == "close":
        sys.exit(close_sprint(args.name))
    elif args.cmd == "signoff":
        sys.exit(signoff_sprint(args.name, args.by))
    else:
        sys.exit(status_sprint(args.name))


if __name__ == "__main__":
    main()
