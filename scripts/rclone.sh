#!/usr/bin/env bash
# Sync only git-changed files under public/images（含 _favicons/：分类图标与订阅站点图标）to R2.
# Compares refs: base = ${RCLONE_REF_BASE:-HEAD~1}, head = ${RCLONE_REF_HEAD:-HEAD}.
# Run from repo root (e.g. in CI after build, or after committing new images).

set -e
cd "$(dirname "$0")/.."

BASE="${RCLONE_REF_BASE:-HEAD~1}"
HEAD="${RCLONE_REF_HEAD:-HEAD}"

# rclone sync public/images r2:cos/images -P

# 文章配图 + _favicons（分类/列表图标与 RSS 站点图标）: copy only changed files
changed_images=$(git diff --name-only --diff-filter=ACMR "$BASE" "$HEAD" -- public/images)
if [[ -n "$changed_images" ]]; then
  echo "$changed_images" | sed 's|^public/images/||' | rclone copy public/images r2:cos/images --files-from - -P
else
  echo "No changed files in public/images, skip sync."
fi
