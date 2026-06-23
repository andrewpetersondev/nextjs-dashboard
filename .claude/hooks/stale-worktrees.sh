#!/usr/bin/env bash
# SessionStart hook — read-only nudge about stale worktree lanes.
#
# Flags worktrees whose branch is either an "empty lane" (no commits beyond
# origin/main) or has a deleted upstream ([gone]). Skips this session's own
# worktree, main/master, and archive/* branches. Prints nothing when clean,
# so it stays quiet unless there's actually something to prune.
#
# Deliberately offline (no `git fetch`, no `gh`) so it never slows session
# start or hangs on the network — it reads the last-fetched refs. Run
# /clean-worktrees for the authoritative, network-checked pass.

set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
current="$root"

stale=""
wt=""
while IFS= read -r line; do
	case "$line" in
	"worktree "*)
		wt="${line#worktree }"
		;;
	"branch "*)
		br="${line#branch }"
		br="${br#refs/heads/}"
		# Skip the session's own worktree and protected branches.
		[ "$wt" = "$current" ] && continue
		case "$br" in
		main | master | archive/*) continue ;;
		esac
		# Empty/merged lane: nothing on this branch is absent from origin/main.
		ahead=$(git rev-list --count "origin/main..$br" 2>/dev/null || echo x)
		# Upstream gone: tracking ref configured but its remote ref is missing.
		gone=no
		if up=$(git rev-parse --abbrev-ref --symbolic-full-name "$br@{upstream}" 2>/dev/null); then
			git rev-parse --verify --quiet "refs/remotes/$up" >/dev/null 2>&1 || gone=yes
		fi
		if [ "$ahead" = "0" ] || [ "$gone" = "yes" ]; then
			stale="${stale}  - ${br}"$'\n'
		fi
		;;
	"")
		wt=""
		;;
	esac
done < <(git worktree list --porcelain 2>/dev/null)

if [ -n "$stale" ]; then
	printf 'Stale worktree lanes (merged or empty, not this session):\n'
	printf '%s' "$stale"
	printf 'Run /clean-worktrees to prune them safely.\n'
fi

exit 0
