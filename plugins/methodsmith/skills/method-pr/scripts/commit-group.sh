#!/usr/bin/env bash
# Commit only the named paths through a temporary index so the user's real
# index stays untouched until the commit succeeds. A path's staged snapshot is
# copied when present; otherwise its working-tree content is added to the
# temporary index only. Works in unborn repositories.
#
# Usage: commit-group.sh MESSAGE_FILE PATH [PATH ...]
set -u

if [ "$#" -lt 2 ]; then
  echo "usage: commit-group.sh MESSAGE_FILE PATH [PATH ...]" >&2
  exit 64
fi
message_file=$1
shift
if [ ! -f "$message_file" ]; then
  echo "commit-group: message file not found: $message_file" >&2
  exit 66
fi

group_index_dir=$(mktemp -d -t method-commit-index-XXXXXX) || exit $?
trap 'rm -rf -- "$group_index_dir"' EXIT
group_index="$group_index_dir/index"

if git rev-parse --verify --quiet HEAD >/dev/null; then
  GIT_INDEX_FILE="$group_index" git read-tree HEAD || exit $?
else
  GIT_INDEX_FILE="$group_index" git read-tree --empty || exit $?
fi

for group_path in "$@"; do
  if git diff --cached --quiet -- "$group_path"; then
    GIT_INDEX_FILE="$group_index" git add -- "$group_path" || exit $?
  else
    diff_status=$?
    if [ "$diff_status" -ne 1 ]; then
      echo "commit-group: could not inspect staged state of a named path (exit $diff_status)" >&2
      exit "$diff_status"
    fi
    group_patch="$group_index_dir/staged.patch"
    git diff --cached --binary -- "$group_path" > "$group_patch" || exit $?
    GIT_INDEX_FILE="$group_index" git apply --cached --binary "$group_patch" || exit $?
  fi
done

GIT_INDEX_FILE="$group_index" git commit -F "$message_file" || exit $?
git restore --staged --source=HEAD -- "$@" || exit $?
