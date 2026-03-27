---
name: url-to-translation-markdown
description: Generate a Chinese translation blog post in Markdown from a source article URL. Use when the user provides a URL and wants a full Markdown article with YAML frontmatter, translated body, translator notes, and article image handling for an Astro blog.
---

# URL To Translation Markdown

Use this skill when the user gives a source article URL and wants a complete Chinese translation post that can be stored as a Markdown file in the blog.

## What To Produce

Produce one complete Markdown article suitable for an Astro blog post:

1. YAML frontmatter
2. Opening copyright/disclaimer blockquote
3. Chinese translated body
4. `## 译者解读`
5. Optional glossary

Do not output setup notes, save-path suggestions, git commands, HTML comments, or image inventory inside the Markdown body.

## Input Contract

Default input is:

- one source article URL

Do not ask the user for slug, tags, date, image directory, or file name unless the user explicitly wants to override them.

## Core Workflow

1. Fetch only the author’s main article content.
2. Exclude navigation, footer, comments, related posts, ads, sponsored blocks, popups, email capture blocks, and other site chrome.
3. Translate the article into natural Simplified Chinese.
4. Preserve the original argument order, heading hierarchy, code, commands, API names, paths, versions, and product/protocol names where appropriate.
5. Add `## 译者解读` to make the original easier to understand. It may be more explicit than the original, but it must still explain the original rather than turning into a second article.
6. Keep article images in body order and reference them as `NN.webp`.

If content extraction is unreliable, do not invent content. Explain the failure and ask the user for the full text or an accessible mirror.

## Frontmatter Rules

Use this structure:

```yaml
---
title: "【译】中文标题"
date: YYYY-MM-DD HH:mm:00+08:00
draft: true
slug: "derived-slug"
categories: [ "translation" ]
tags: [ "tag1", "tag2" ]
description: "一两句中文摘要"
canonicalURL: "https://original-url"
---
```

Rules:

- `title`
  - Start with `【译】`
  - Use natural Chinese
  - Preserve original tone
  - Keep product names and technical proper nouns in English when useful

- `date`
  - Use current `Asia/Shanghai` time
  - Format as `YYYY-MM-DD HH:mm:00+08:00`
  - If current time cannot be obtained reliably, say so instead of guessing

- `draft`
  - Always `true` unless the user explicitly asks otherwise

- `slug`
  - Prefer the last meaningful URL path segment
  - Remove noise such as `.html`, `.htm`, `index`, date prefixes, or meaningless suffixes
  - Fall back to title-derived kebab-case if needed
  - Must be lowercase ASCII with hyphens

- `categories`
  - Always `[ "translation" ]`

- `tags`
  - Use 1 to 3 English tags
  - Prefer concrete technical topics from the article
  - Avoid vague tags

- `description`
  - Write 1 to 2 Chinese sentences
  - Keep it factual and concise

- `canonicalURL`
  - Must equal the input URL exactly

## Opening Blockquote

Immediately after frontmatter, insert this blockquote pattern:

```md
> 本文为学习目的的个人翻译，译文及后文「译者解读」仅供参考。
>
> 原文链接：[原文标题](https://example.com/article)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
```

Keep the tone restrained. Do not add a heading like `## 翻译说明`.

## Image Rules

For images that belong to the main article body:

- keep all of them
- preserve original body order
- reference them in Markdown as:

```md
![说明](01.webp)
![说明](02.webp)
```

- use filenames only in Markdown
- do not use leading `/`
- do not embed the original hotlinked image URL as the long-term article URL

Expected storage path:

```text
public/images/{slug}/
```

Numbering:

- `01.webp`, `02.webp`, `03.webp`, ...
- if the same image appears again, reuse the same filename instead of renumbering it

Do not keep ads, sponsor images, or decorative images unrelated to the article body.

If stable image URLs cannot be obtained, say so outside the Markdown article body.

## Translator Notes Rules

Use heading:

```md
## 译者解读
```

Requirements:

- 3 to 6 items or short paragraphs
- each point must directly help readers understand the original
- allowed:
  - clarify terminology
  - surface hidden assumptions
  - explain why a conclusion follows
  - restate abstract passages in plainer language
  - point out likely time-sensitive claims
- not allowed:
  - unrelated background essays
  - large topic expansion
  - inventing arguments the author never made
  - presenting your own opinion as the author’s view

## Failure Mode

If extraction fails because of a paywall, login wall, anti-bot protection, low-quality page structure, or lack of a reliable main article:

- do not fabricate anything
- output only the failure explanation and the next-step request
- ask the user to paste the full text or provide an accessible mirror
- do not output fake frontmatter or partial article content

## Quality Bar

Before responding, verify:

- the body really comes from the main article
- headings were preserved instead of re-authored
- logic, negation, conditions, and numbers stayed intact
- images use `NN.webp`
- translator notes explain the article rather than replacing it
- tags are 1 to 3 English items tied to the article

## Reference

For the full house style and the latest wording details, read:

- [prompt.md](references/prompt.md)
