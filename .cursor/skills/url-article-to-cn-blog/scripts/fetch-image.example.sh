#!/usr/bin/env bash
# 示例：将单张远程图片下载并转为 webp，供 Agent 按 01.webp、02.webp 命名落盘。
# 用法: ./fetch-image.example.sh <图片URL> <输出路径/01.webp>
set -euo pipefail
[[ "${1:-}" && "${2:-}" ]] || { echo "Usage: $0 <url> <out.webp>"; exit 1; }
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
curl -fsSL "$1" -o "$tmp"
if command -v cwebp >/dev/null 2>&1; then
  cwebp -quiet -q 85 "$tmp" -o "$2"
else
  echo "cwebp not found. Install webp tools first (e.g. macOS: brew install webp), then re-run." >&2
  echo "Do not copy raw PNG/JPEG to a .webp path; extension must match WebP bytes." >&2
  exit 1
fi
