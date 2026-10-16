---
name: ce-update
description: "Checks whether the installed ce-datascience plugin is current and gives the exact update command for the harness in use: Claude Code, Codex, OpenCode, Pi, Gemini CLI, Kiro, or Qwen Code. Use when the user asks if ce-datascience is up to date or how to update it."
disable-model-invocation: true
---

# Check And Update ce-datascience


## Skill Value

- **Problem it solves:** Users keep running an old copy of the plugin without knowing a newer version exists or which command updates their harness.
- **Use when:** The user asks whether ce-datascience is up to date, or how to update it, in any supported harness.
- **Output:** An installed-vs-upstream verdict where the harness exposes the installed version, and the one update command for that harness.
- **Ask only if:** The harness cannot be identified from the session and the install location; ask which agent app they use.
- **Do not do:** Do not run the update for the user, edit plugin caches, or move files. Updates keep the user's own skills, so never tell them to delete or move their skills first.
- **Interaction:** No user question normally; proceed from the provided inputs and local evidence.

Report whether ce-datascience is current and give the exact command that
updates it. Updates never delete or overwrite your own skills: the plugin only
replaces files it installed, and it backs up any plugin file you edited before
replacing it.

## 1. Identify the harness

Use the harness you are running in. Claude Code resolves the **Skill
directory** line below to a real path; every other harness leaves it empty or
shows the literal command text.

## 2. Claude Code

### Pre-resolved context

Only the **Skill directory** determines whether this session is Claude Code —
if empty or unresolved, this is another harness; go to section 3. The other sections may
contain error sentinels even in valid Claude Code sessions; the decision logic
below handles those cases.

`${CLAUDE_SKILL_DIR}` is a Claude Code-documented substitution that resolves
at skill-load time. For a marketplace-cached install it looks like
`~/.claude/plugins/cache/<marketplace>/ce-datascience/<version>/skills/ce-update`,
so the currently-loaded version is the basename two `dirname` levels up.

Compare against `plugins/ce-datascience/.claude-plugin/plugin.json` on `main`
HEAD, not release tags; the marketplace installs from `main`.

**Skill directory:**
!`echo "${CLAUDE_SKILL_DIR}"`

**Latest upstream version:**
!`version=$(gh api repos/sajor2000/ce-datascience/contents/plugins/ce-datascience/.claude-plugin/plugin.json --jq '.content | @base64d | fromjson | .version' 2>/dev/null) && [ -n "$version" ] && echo "$version" || echo '__CE_UPDATE_VERSION_FAILED__'`

**Currently loaded version:**
!`echo "${CLAUDE_SKILL_DIR}" | grep -q "/plugins/cache/.*ce-datascience/.*/skills/ce-update$" && basename "$(dirname "$(dirname "${CLAUDE_SKILL_DIR}")")" || echo '__CE_UPDATE_NOT_MARKETPLACE__'`

**Marketplace name:**
!`echo "${CLAUDE_SKILL_DIR}" | grep -q "/plugins/cache/.*ce-datascience/.*/skills/ce-update$" && basename "$(dirname "$(dirname "$(dirname "$(dirname "${CLAUDE_SKILL_DIR}")")")")" || echo '__CE_UPDATE_NOT_MARKETPLACE__'`

### Claude Code decision logic

If **Skill directory** is empty or unresolved, skip to section 3.

If **Latest upstream version** contains `__CE_UPDATE_VERSION_FAILED__`: tell
the user the upstream version could not be fetched (gh may be unavailable or
rate-limited), give the update command below anyway, and stop.

If **Currently loaded version** contains `__CE_UPDATE_NOT_MARKETPLACE__`: this
session loaded the skill from outside the standard marketplace cache (typical
when using `claude --plugin-dir` for local development, or for a non-standard
install). Tell the user (substituting the actual path):

> "Skill is loaded from `{skill-directory}` — not the standard marketplace
> cache at `~/.claude/plugins/cache/`. This is normal when using
> `claude --plugin-dir` for local development. No action for this session.
> Your marketplace install (if any) is unaffected — load the `ce-update` skill in a
> regular Claude Code session (no `--plugin-dir`) to check that cache."

Then stop.

**Up to date** — `{currently loaded} == {latest upstream}`:

> "ce-datascience **v{version}** is installed and up to date."

**Out of date** — `{currently loaded} != {latest upstream}`:

> "ce-datascience is on **v{currently loaded}** but **v{latest upstream}** is available.
>
> Update with:
> ```
> claude plugin update ce-datascience@{marketplace-name}
> ```
> Then run `/reload-plugins` or restart Claude Code."

Derive `{marketplace-name}` from the skill path; never hardcode it, because the
plugin ships under more than one marketplace name.

In both cases add one line about automatic updates: Claude Code updates
third-party marketplaces in the background only when auto-update is on for
that marketplace. To turn it on, run `/plugin`, open **Marketplaces**, select
`{marketplace-name}`, and choose **Enable auto-update**. The repository's
`install.sh claude` turns it on by default.

## 3. Other harnesses

These harnesses do not expose the installed plugin version to a skill, so do
not claim a version comparison. Optionally report the latest upstream version
(read-only; skip silently when offline):

```bash
curl -fsSL https://raw.githubusercontent.com/sajor2000/ce-datascience/main/plugins/ce-datascience/.claude-plugin/plugin.json
```

Then give the one command for the harness in use. Re-running an install is
safe: it replaces only plugin-owned files and keeps your own skills.

| Harness | Update command | Then |
|---|---|---|
| Codex (plugin from the GitHub marketplace) | `codex plugin marketplace upgrade ce-datascience-plugin` | Restart Codex. Codex does not update plugins automatically. |
| Codex (generated CE agents) | `bunx ce-datascience-plugin@latest install ce-datascience --to codex --codex-home "${CODEX_HOME:-$HOME/.codex}"` | Restart Codex. |
| OpenCode | `bunx ce-datascience-plugin@latest install ce-datascience --to opencode` | Add `--output <workspace>` for a project install. Restart OpenCode. |
| Pi | `bunx ce-datascience-plugin@latest install ce-datascience --to pi --pi-home "$HOME/.pi/agent"` | Restart Pi. |
| Gemini CLI | `bunx ce-datascience-plugin@latest install ce-datascience --to gemini --output <workspace>` | Restart Gemini CLI. |
| Kiro | `bunx ce-datascience-plugin@latest install ce-datascience --to kiro --output <workspace>` | Restart Kiro. |
| Qwen Code | `qwen extensions update ce-datascience` | Restart Qwen Code. |

To tell which Codex marketplace is in use, run the read-only
`codex plugin marketplace list`. If `ce-datascience-plugin` points at a local
folder instead of GitHub, the update is `git pull` in that folder followed by
re-running `bash install.sh codex` there.

If the harness is not in this table, say so and point the user to the
"Keep CE DataScience updated" section of the repository's `docs/setup.md`.
