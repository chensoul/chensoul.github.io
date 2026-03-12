#!/usr/bin/env bash
# Sync only git-changed files under public/thumbs and public/images to R2.
# Compares refs: base = ${RCLONE_REF_BASE:-HEAD~1}, head = ${RCLONE_REF_HEAD:-HEAD}.
# Run from repo root (e.g. in CI after build, or after committing new thumbs/images).

set -e
cd "$(dirname "$0")/.."

BASE="${RCLONE_REF_BASE:-HEAD~1}"
HEAD="${RCLONE_REF_HEAD:-HEAD}"

# Thumbs: copy only changed files
changed_thumbs=$(git diff --name-only --diff-filter=ACMR "$BASE" "$HEAD" -- public/thumbs)
if [[ -n "$changed_thumbs" ]]; then
  echo "$changed_thumbs" | sed 's|^public/thumbs/||' | rclone copy public/thumbs r2:cos/thumbs --files-from - -P
else
  echo "No changed files in public/thumbs, skip sync."
fi

# Images: copy only changed files
changed_images=$(git diff --name-only --diff-filter=ACMR "$BASE" "$HEAD" -- public/images)
if [[ -n "$changed_images" ]]; then
  echo "$changed_images" | sed 's|^public/images/||' | rclone copy public/images r2:cos/images --files-from - -P
else
  echo "No changed files in public/images, skip sync."
fi
