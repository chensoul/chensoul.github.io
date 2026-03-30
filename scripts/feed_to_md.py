#!/usr/bin/env python3
"""
Download an Atom or RSS 2.0 feed from a URL and write each item to Markdown (HTML → GFM via pandoc).

Output layout:
  <base>/<site-hostname>/
    feed.xml          # saved copy of the feed
    articles/*.md
    README.md

<site-hostname> is urlparse(feed_url).hostname (e.g. stephango.com).
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlparse

ATOM_NS = "{http://www.w3.org/2005/Atom}"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent


def slug_from_url(url: str) -> str:
    if not url:
        return "post"
    return url.rstrip("/").split("/")[-1] or "index"


def safe_filename(date_part: str, slug: str) -> str:
    slug = re.sub(r"[^\w\-]+", "-", slug, flags=re.ASCII).strip("-").lower() or "post"
    return f"{date_part}-{slug}.md"


def html_to_md(html: str) -> str:
    proc = subprocess.run(
        ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none"],
        input=html.encode("utf-8"),
        capture_output=True,
        check=True,
    )
    return proc.stdout.decode("utf-8").strip()


def fetch_feed(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "feed_to_md/1.0 (+https://github.com/chensoul/chensoul.github.io)"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def site_hostname(feed_url: str) -> str:
    p = urlparse(feed_url)
    host = p.hostname or p.netloc.split("@")[-1].split(":")[0]
    if not host:
        raise SystemExit(f"Could not determine hostname from feed URL: {feed_url}")
    return host.lower()


def site_base_url(feed_url: str) -> str:
    p = urlparse(feed_url)
    scheme = p.scheme or "https"
    host = site_hostname(feed_url)
    return f"{scheme}://{host}"


def yaml_escape_title(title: str) -> str:
    return title.replace("\\", "\\\\").replace('"', '\\"')


def parse_rss_date(raw: str | None) -> str:
    if not raw:
        return "1970-01-01"
    raw = raw.strip()
    try:
        dt = parsedate_to_datetime(raw)
        if dt:
            return dt.date().isoformat()
    except (TypeError, ValueError, OverflowError):
        pass
    if len(raw) >= 10 and raw[4] == "-" and raw[7] == "-":
        return raw[:10]
    return "1970-01-01"


def atom_feed_author(feed_el: ET.Element) -> str:
    a = feed_el.find(f"{ATOM_NS}author/{ATOM_NS}name")
    if a is not None and a.text:
        return a.text.strip()
    return ""


def atom_entry_author(entry_el: ET.Element) -> str:
    a = entry_el.find(f"{ATOM_NS}author/{ATOM_NS}name")
    if a is not None and a.text:
        return a.text.strip()
    return ""


def process_atom(feed_el: ET.Element) -> list[dict]:
    rows: list[dict] = []
    default_author = atom_feed_author(feed_el)

    for ent in feed_el.findall(f"{ATOM_NS}entry"):
        title_el = ent.find(f"{ATOM_NS}title")
        link_el = ent.find(f'{ATOM_NS}link[@href]')
        updated_el = ent.find(f"{ATOM_NS}updated")
        published_el = ent.find(f"{ATOM_NS}published")
        content_el = ent.find(f"{ATOM_NS}content")

        title = (title_el.text or "").strip() if title_el is not None else "Untitled"
        url = link_el.get("href", "").strip() if link_el is not None else ""
        date_raw = None
        if updated_el is not None and updated_el.text:
            date_raw = updated_el.text[:10]
        elif published_el is not None and published_el.text:
            date_raw = published_el.text[:10]
        updated = date_raw or "1970-01-01"

        raw = ""
        if content_el is not None and content_el.text:
            raw = content_el.text
        elif content_el is not None and len(content_el):
            raw = "".join(content_el.itertext())

        if not raw.strip():
            continue

        author = atom_entry_author(ent) or default_author
        rows.append(
            {
                "title": title,
                "url": url,
                "updated": updated,
                "html": raw.strip(),
                "author": author,
            }
        )
    return rows


def process_rss(root: ET.Element) -> list[dict]:
    channel = root.find("channel")
    if channel is None:
        return []

    default_author = ""
    it = channel.find("managingEditor")
    if it is not None and it.text:
        default_author = it.text.strip()

    rows: list[dict] = []
    for item in channel.findall("item"):
        title_el = item.find("title")
        link_el = item.find("link")
        pub_el = item.find("pubDate")
        desc_el = item.find("description")
        enc_el = item.find(f"{CONTENT_NS}encoded")

        title = (title_el.text or "").strip() if title_el is not None else "Untitled"
        url = (link_el.text or "").strip() if link_el is not None else ""
        updated = parse_rss_date(pub_el.text if pub_el is not None else None)

        raw = ""
        if enc_el is not None and enc_el.text:
            raw = enc_el.text
        elif desc_el is not None and desc_el.text:
            raw = desc_el.text

        if not raw.strip():
            continue

        rows.append(
            {
                "title": title,
                "url": url,
                "updated": updated,
                "html": raw.strip(),
                "author": default_author,
            }
        )
    return rows


def write_articles(
    rows: list[dict],
    out_dir: Path,
    feed_url: str,
    site: str,
) -> list[tuple[str, str, str]]:
    out_dir.mkdir(parents=True, exist_ok=True)
    written: list[tuple[str, str, str]] = []

    for row in rows:
        slug = slug_from_url(row["url"])
        fname = safe_filename(row["updated"], slug)
        path = out_dir / fname

        body = html_to_md(row["html"])
        meta = [
            "---",
            f'title: "{yaml_escape_title(row["title"])}"',
            f"date: {row['updated']}",
            f"source: {row['url']}",
            f'site: "{site}"',
            f'feed: "{feed_url}"',
        ]
        auth = row.get("author") or ""
        if auth.strip():
            meta.append(f'author: "{yaml_escape_title(auth.strip())}"')
        meta.extend(["---", ""])
        front = "\n".join(meta)

        path.write_text(front + body + "\n", encoding="utf-8")
        written.append((fname, row["title"], row["url"]))

    return written


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download Atom/RSS feed and export entries to Markdown (pandoc)."
    )
    parser.add_argument(
        "feed_url",
        help="Full URL to the feed (Atom or RSS 2.0), e.g. https://example.com/feed.xml",
    )
    parser.add_argument(
        "--base",
        type=Path,
        default=REPO_ROOT / "rss-feed-archives",
        help=f"Directory under which <hostname>/ is created (default: {REPO_ROOT / 'rss-feed-archives'})",
    )
    args = parser.parse_args()

    feed_url = args.feed_url.strip()
    host = site_hostname(feed_url)
    site = site_base_url(feed_url)

    site_root: Path = args.base.expanduser().resolve() / host
    articles_dir = site_root / "articles"
    feed_path = site_root / "feed.xml"
    readme_path = site_root / "README.md"

    site_root.mkdir(parents=True, exist_ok=True)

    raw = fetch_feed(feed_url)
    feed_path.write_bytes(raw)

    tree = ET.parse(feed_path)
    root = tree.getroot()

    if root.tag == f"{ATOM_NS}feed" or root.tag.endswith("}feed"):
        rows = process_atom(root)
    elif root.tag == "rss":
        rows = process_rss(root)
    else:
        raise SystemExit(f"Unsupported feed root element: {root.tag!r}")

    written = write_articles(rows, articles_dir, feed_url, site)

    readme_path.write_text(
        "\n".join(
            [
                f"# {host}",
                "",
                f"Generated from [`{feed_url}`]({feed_url}).",
                "",
                "Respect the source site’s copyright and license.",
                "",
                f"**Entries:** {len(written)}",
                "",
                "## Index",
                "",
            ]
            + [f"- [{t}](articles/{f}) — {u}" for f, t, u in written]
            + ["",]
        ),
        encoding="utf-8",
    )

    print(
        f"Host: {host}\nRoot: {site_root}\nWrote {len(written)} articles → {articles_dir}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
