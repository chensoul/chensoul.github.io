#!/usr/bin/env python3
"""Fetch all ByteByteGo Substack archive post URLs via public API."""
import json
import subprocess
import sys
from pathlib import Path

BASE = "https://blog.bytebytego.com/api/v1/archive?sort=new&offset="


def fetch_batch(offset: int) -> list:
    url = BASE + str(offset)
    out = subprocess.run(
        ["curl", "-sL", "-A", "Mozilla/5.0", url],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return json.loads(out.stdout)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    docs = root / "docs"
    docs.mkdir(exist_ok=True)

    allp: list = []
    off = 0
    while True:
        batch = fetch_batch(off)
        if not batch:
            break
        allp.extend(batch)
        off += len(batch)
        print(off, "posts", file=sys.stderr, flush=True)

    seen: set[str] = set()
    ordered: list[tuple[str, str]] = []
    for p in allp:
        slug = (p.get("slug") or "").strip()
        if not slug or slug in seen:
            continue
        seen.add(slug)
        title = (p.get("title") or "").replace("\n", " ").strip()
        ordered.append((title, f"https://blog.bytebytego.com/p/{slug}"))

    md = docs / "bytebytego-archive-urls.md"
    txt = docs / "bytebytego-archive-urls.txt"
    with md.open("w", encoding="utf-8") as f:
        f.write("# ByteByteGo Newsletter 归档文章链接\n\n")
        f.write(
            "来源：[Archive（sort=new）](https://blog.bytebytego.com/archive?sort=new)。\n\n"
        )
        f.write(
            "数据来自 Substack 公开接口 "
            "`GET https://blog.bytebytego.com/api/v1/archive?sort=new&offset=N`，\n"
        )
        f.write("`offset` 为已累积篇数，直至返回空数组。\n\n")
        f.write(
            f"共 **{len(ordered)}** 篇（按 `sort=new`，新文在前；slug 去重）。\n\n"
        )
        for i, (title, u) in enumerate(ordered, 1):
            f.write(f"{i}. [{title}]({u})\n")
    with txt.open("w", encoding="utf-8") as f:
        for _, u in ordered:
            f.write(u + "\n")
    print(f"WROTE {md} and {txt} count={len(ordered)}", file=sys.stderr)


if __name__ == "__main__":
    main()
