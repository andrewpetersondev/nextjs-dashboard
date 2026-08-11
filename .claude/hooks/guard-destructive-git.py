#!/usr/bin/env python3
"""PreToolUse(Bash) hook — backstop for destructive git commands.

`permissions.deny` in settings.json matches command PREFIXES only. That leaves
holes wide enough to drive a history rewrite through, as happened on 2026-08-11:

    git -C /path push --force-with-lease   # doesn't start with "git push"
    bash rewrite-history.sh                # git filter-branch hidden in a script
    cd /repo && git reset --hard           # guarded call isn't first
    GIT_DIR=x git branch -D lane           # env assignment shifts the prefix

This hook sees the whole command string instead of its first characters, and
for `bash some-script.sh` invocations it also reads the script.

DECISION must stay "deny". Verified 2026-08-11: a PreToolUse hook returning
"ask" is silently swallowed by this project's blanket `Bash(*)` allow rule —
the guarded command runs with no prompt at all. Only "deny" is authoritative
over an explicit allow. An "ask" hook here is decorative, which is the very
failure this file exists to correct, so test end-to-end after any change:
run `git -C /tmp/no-such-repo-xyz push --force-with-lease origin main` and
confirm it is refused rather than reaching git.

Escape hatch: destructive git is Andrew's to run, per the standing rule that
merges and pushes need his explicit per-change approval. Run it from a normal
terminal, where this hook does not apply.

Fails CLOSED: if this script errors, it still denies. A guard that fails open
is the bug it exists to prevent.
"""

from __future__ import annotations  # system python is 3.9; keeps `str | None` lazy

import json
import os
import re
import sys

DECISION = "deny"  # "deny" blocks; "ask" is swallowed by the blanket Bash(*) allow.

MAX_SCRIPT_BYTES = 256 * 1024

# Each entry mirrors a git rule from permissions.deny, plus the two gaps that
# list never covered: `git filter-repo` and the `+refspec` force-push syntax.
# `git\b[^;&|]*` spans intervening flags (-C <path>, --git-dir=…, -c k=v) while
# stopping at a shell separator so two unrelated commands can't be spliced into
# a false positive.
GIT = r"""(?:^|[;&|(`"']|\s)git(?:\b|-)[^;&|]*?"""
RULES: list[tuple[str, str]] = [
    (rf"{GIT}\bpush\b[^;&|]*(?:--force(?:-with-lease)?\b|(?<!-)-f\b|\s\+[\w./^~-]+:)",
     "force-push"),
    (rf"{GIT}\bpush\b[^;&|]*--mirror\b", "mirror-push (overwrites every remote ref)"),
    (rf"{GIT}\bpush\b[^;&|]*--delete\b", "remote branch deletion"),
    (rf"{GIT}\bpush\b[^;&|]*\s:[\w./-]+(?:\s|$)", "remote branch deletion (:refspec)"),
    (rf"{GIT}\bfilter-branch\b", "history rewrite (filter-branch)"),
    (rf"{GIT}\bfilter-repo\b", "history rewrite (filter-repo)"),
    (rf"{GIT}\breset\b[^;&|]*--hard\b", "hard reset (discards working tree)"),
    (rf"{GIT}\bclean\b[^;&|]*\s-[a-zA-Z]*f", "git clean -f (deletes untracked files)"),
    (rf"{GIT}\bbranch\b[^;&|]*\s-[a-zA-Z]*[dD]\b", "branch deletion"),
    (rf"{GIT}\bstash\b\s+(?:drop|clear)\b", "stash drop/clear"),
    (rf"{GIT}\bupdate-ref\b[^;&|]*\s-d\b", "ref deletion"),
    (rf"{GIT}\bcheckout\s+main\b", "checkout of main (work happens on lane branches)"),
]
COMPILED = [(re.compile(p), label) for p, label in RULES]

# `bash foo.sh`, `sh ./foo.sh`, `zsh /abs/foo.sh`, `source foo.sh`, `. foo.sh`
SCRIPT_CALL = re.compile(
    r"(?:^|[;&|(]|\s)(?:bash|sh|zsh|source|\.)\s+(?:-[a-zA-Z]+\s+)*([^\s;&|<>]+)"
)

# Spans that are DATA, not commands, and must be excised before matching —
# otherwise a commit message *describing* `git push --force` is refused, which
# is a hard block on ordinary work. Both forms below are inert to the shell.
HEREDOC_BODY = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_]\w*)\1.*?^\2$", re.DOTALL | re.MULTILINE)
MESSAGE_ARG = re.compile(
    r"(?:-m|--message=?)\s*(['\"])(?:\\.|(?!\1).)*\1", re.DOTALL
)
# ...unless the heredoc is piped into a shell, where the body IS the command.
HEREDOC_TO_SHELL = re.compile(r"(?:^|[;&|])\s*(?:bash|sh|zsh)\b[^<\n]*<<")


def strip_data_spans(text: str) -> str:
    """Blank out heredoc bodies and -m message arguments before scanning."""
    if not HEREDOC_TO_SHELL.search(text):
        text = HEREDOC_BODY.sub(" ", text)
    return MESSAGE_ARG.sub(" ", text)


def scan(text: str) -> list[str]:
    """Return the labels of every guarded operation appearing in text."""
    text = strip_data_spans(text)
    seen: list[str] = []
    for pattern, label in COMPILED:
        if pattern.search(text) and label not in seen:
            seen.append(label)
    return seen


def scan_referenced_scripts(command: str, cwd: str) -> list[str]:
    """Scan shell scripts the command invokes — the wrapper hole."""
    findings: list[str] = []
    for raw in SCRIPT_CALL.findall(command):
        path = os.path.expanduser(raw.strip("\"'"))
        if not os.path.isabs(path):
            path = os.path.join(cwd, path)
        try:
            if os.path.getsize(path) > MAX_SCRIPT_BYTES:
                continue
            with open(path, encoding="utf-8", errors="replace") as handle:
                body = handle.read()
        except OSError:
            continue
        for label in scan(body):
            entry = f"{label} — inside {os.path.basename(path)}"
            if entry not in findings:
                findings.append(entry)
    return findings


def respond(reason: str | None) -> None:
    if reason is not None:
        payload = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": DECISION,
                "permissionDecisionReason": reason,
            }
        }
        json.dump(payload, sys.stdout)
    sys.exit(0)


def main() -> None:
    try:
        event = json.load(sys.stdin)
        command = event.get("tool_input", {}).get("command", "") or ""
        cwd = event.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    except Exception as exc:  # noqa: BLE001 — fail closed, never fail open
        respond(f"git-safety hook could not parse its input ({exc}); confirm manually.")
        return

    hits = scan(command) + scan_referenced_scripts(command, cwd)
    if not hits:
        respond(None)

    respond(
        "Blocked — destructive git operation the prefix deny list does not catch:\n"
        + "\n".join(f"  • {h}" for h in hits)
        + "\n\nThis is Andrew's to run, from his own terminal. Do not work around"
        " this hook; ask him instead."
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        respond(f"git-safety hook errored ({exc}); confirm manually.")
