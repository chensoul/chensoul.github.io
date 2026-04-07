#!/usr/bin/env python3
"""Quick checks for url-article-to-cn-blog conventions on translation Markdown files."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[1]

FOOTER_NEEDLE = "本文为学习目的的个人翻译"
SUMMARY_HEADING = "## 译者总结"
ORIG_PUB = "originalPublishedAt"


def last_url_path_segment(url: str) -> str | None:
    url = (url or "").strip().strip('"')
    try:
        p = urlparse(url)
        path = (p.path or "").strip("/")
        if not path:
            return None
        return path.split("/")[-1]
    except Exception:
        return None


def parse_frontmatter(text: str) -> tuple[dict[str, str], str] | None:
    if not text.startswith("---"):
        return None
    rest = text[3:].lstrip("\n")
    idx = rest.find("\n---")
    if idx < 0:
        return None
    fm_block = rest[:idx].strip()
    body = rest[idx + 4 :].lstrip("\n")
    meta: dict[str, str] = {}
    for line in fm_block.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    return meta, body


def file_date_prefix(name: str) -> str | None:
    m = re.match(r"^(\d{4}-\d{2}-\d{2})-", name)
    return m.group(1) if m else None


def frontmatter_date_day(meta: dict[str, str]) -> str | None:
    d = meta.get("date", "")
    m = re.match(r"^(\d{4}-\d{2}-\d{2})", d)
    return m.group(1) if m else None


def check_file(path: Path) -> list[str]:
    issues: list[str] = []
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if not parsed:
        return ["缺少有效 YAML frontmatter（以 --- 开头/结束）"]
    meta, body = parsed

    if "canonicalURL" not in meta:
        issues.append("缺少 canonicalURL")

    slug = meta.get("slug", "").strip().strip('"')
    if not slug:
        issues.append("缺少 slug")

    cu = meta.get("canonicalURL", "").strip().strip('"')
    seg = last_url_path_segment(cu)
    if seg and slug and seg != slug:
        issues.append(f"slug「{slug}」与 canonicalURL 路径最后一段「{seg}」不一致")

    draft = meta.get("draft", "").lower()
    if draft not in ("true", "yes"):
        issues.append("缺少 draft: true（技能默认）")

    if SUMMARY_HEADING in body or "## 译者總結" in body:
        issues.append("含「## 译者总结」类章节（技能禁止）")

    if ORIG_PUB in text:
        issues.append("含 originalPublishedAt（技能禁止）")

    # 翻译声明不得出在正文开头：第一个非空行若为三行声明之一
    lines = body.splitlines()
    first_nonempty = next((ln.strip() for ln in lines if ln.strip()), "")
    if first_nonempty.startswith(">") and FOOTER_NEEDLE in first_nonempty:
        issues.append("翻译声明出现在正文开头（应仅在文末）")

    if FOOTER_NEEDLE not in body:
        issues.append("文末缺少技能规定的翻译声明（「本文为学习目的的个人翻译」）")

    # 文末应对齐三行 blockquote（宽松：三行都以 > 开头且含原文链接与版权归原作者）
    tail = "\n".join(lines[-25:])
    if "原文链接：" not in tail or "版权归原作者" not in tail:
        issues.append("文末未找到完整的翻译声明三行（原文链接 / 版权归原作者）")

    pref = file_date_prefix(path.name)
    fd = frontmatter_date_day(meta)
    if pref and fd and pref != fd:
        issues.append(f"文件名日期前缀「{pref}」与 frontmatter date 日期「{fd}」不一致")

    # 配图：相对路径应为仅 NN.webp（允许无前导路径或错误前缀由 remark 去重）
    for m in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)", body):
        u = m.group(1).strip()
        if u.startswith("http") or u.startswith("/"):
            continue
        if u.endswith(".webp") and "/" in u.replace("\\", "/"):
            issues.append(f"配图应用仅文件名 NN.webp，当前为「{u}」（可含重复的 slug/ 前缀）")

    # tags：1–3 个英文词（宽松：不含中文）
    tags_raw = meta.get("tags", "")
    tags_list = re.findall(r'"([^"]+)"', tags_raw) or [t.strip() for t in tags_raw.strip("[]").split(",") if t.strip()]
    tags_list = [t.strip('"') for t in tags_list if t]
    if not tags_list:
        issues.append("缺少 tags")
    elif len(tags_list) > 3:
        issues.append(f"tags 超过 3 个（{len(tags_list)}）")
    for t in tags_list:
        if re.search(r"[\u4e00-\u9fff]", t):
            issues.append(f"tags 应英文技术词，含中文：{t}")

    return issues


def canonical_from_path(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if not parsed:
        return ""
    meta, _ = parsed
    return meta.get("canonicalURL", "").strip().strip('"')


def list_translation_paths(scan_all: bool) -> list[Path]:
    if scan_all:
        return sorted(p for p in REPO.glob("content/translation/*.md") if p.is_file())
    paths = []
    for line in subprocess.run(
        [
            "git",
            "-c",
            "core.quotepath=false",
            "diff",
            "HEAD",
            "--name-only",
            "--",
            "content/translation/",
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
    ).stdout.splitlines():
        line = line.strip().strip('"')
        if line.endswith(".md"):
            paths.append(REPO / line)
    return sorted(set(p for p in paths if p.is_file()))


def main() -> int:
    import argparse

    ap = argparse.ArgumentParser(description="对照 url-article-to-cn-blog 做译文 Markdown 自动校验")
    ap.add_argument(
        "--all",
        action="store_true",
        help="扫描 content/translation/*.md 全部文件（默认仅相对 HEAD 未提交）",
    )
    ap.add_argument(
        "--export-failures",
        metavar="FILE",
        help="将未通过校验的 canonicalURL 写入该 txt（每行一条 UTF-8）",
    )
    args = ap.parse_args()

    paths = list_translation_paths(args.all)
    if not paths:
        print(
            "无待检查文件：工作区无未提交译文时可加 --all；或路径不正确。"
        )
        return 0

    failures: list[tuple[str, list[str]]] = []
    export_urls: list[str] = []
    export_paths_no_canonical: list[str] = []
    ok = 0
    for p in paths:
        rel = p.relative_to(REPO)
        issues = check_file(p)
        if issues:
            failures.append((str(rel), issues))
            cu = canonical_from_path(p)
            if cu:
                export_urls.append(cu)
            else:
                export_paths_no_canonical.append(str(rel))
        else:
            ok += 1

    if args.export_failures:
        out_path = (REPO / args.export_failures).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        unique_sorted = sorted(set(export_urls))
        paths_sorted = sorted(set(export_paths_no_canonical))
        header = (
            "# 未通过 url-article-to-cn-blog 自动校验的译文链接与路径\n"
            f"# 扫描范围: {'content/translation/*.md 全部' if args.all else 'git diff HEAD 未提交'}\n"
            f"# canonicalURL（去重）: {len(unique_sorted)} 条\n"
            f"# 无 canonicalURL 但已失败: {len(paths_sorted)} 个 md 路径（见文件末尾区块）\n"
            "# 生成: python3 scripts/check-translation-skill-compliance.py"
            f"{' --all' if args.all else ''} --export-failures {args.export_failures}\n"
            "\n"
        )
        body_urls = "\n".join(unique_sorted)
        block_paths = (
            "\n# --- 无 canonicalURL 的未达标译文（仓库相对路径） ---\n\n"
            + "\n".join(paths_sorted)
            if paths_sorted
            else ""
        )
        out_path.write_text(
            header + "\n" + body_urls + "\n" + block_paths + "\n", encoding="utf-8"
        )
        print(
            f"已写入 {len(unique_sorted)} 条 URL、{len(paths_sorted)} 条无链接路径 → {out_path.relative_to(REPO)}"
        )

    scope = (
        "content/translation/*.md 全部"
        if args.all
        else "相对 HEAD 未提交"
    )
    print(f"已检查 {len(paths)} 篇译文（{scope}）。")
    print(f"通过（无上述自动规则告警）: {ok}")
    print(f"待处理: {len(failures)}\n")

    # Group by issue type for summary
    from collections import Counter

    ctr: Counter[str] = Counter()
    for _, iss in failures:
        for i in iss:
            key = i.split("「", 1)[0].strip()
            ctr[key] += 1

    print("告警类型 Top 12：")
    for msg, c in ctr.most_common(12):
        print(f"  {c:4d}  {msg}")
    print()

    failures.sort(key=lambda x: x[0])
    for rel, iss in failures[:80]:
        print(rel)
        for i in iss:
            print(f"  - {i}")
        print()

    if len(failures) > 80:
        print(f"... 另有 {len(failures) - 80} 篇未逐条列出，请看上方汇总。")

    return 1 if failures else 0  # 有告警时退出码 1，便于 CI


if __name__ == "__main__":
    sys.exit(main())
