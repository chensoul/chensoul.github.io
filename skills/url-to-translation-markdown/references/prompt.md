# Translation To Blog Markdown Reference

This reference mirrors the current house rules for turning a source article URL into a Chinese translation post for the blog.

## Output Shape

Return one complete Markdown document that contains:

1. frontmatter
2. opening copyright/disclaimer blockquote
3. translated article body
4. `## 译者总结`
5. optional glossary

Do not include image inventories, save-path notes, git commands, or operations notes in the saved Markdown.

## Frontmatter

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

- `title`: start with `【译】`; use natural Chinese; preserve technical names where useful
- `date`: current `Asia/Shanghai` time, minute precision, seconds fixed as `00`
- `draft`: `true`
- `slug`: lowercase kebab-case; prefer the last useful URL segment
- `categories`: `[ "translation" ]`
- `tags`: 1 to 3 English tags tied to the article topic
- `description`: 1 to 2 Chinese summary sentences
- `canonicalURL`: exactly the input URL

## Opening Blockquote

Use:

```md
> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[原文标题](https://example.com/article)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
```

## Scope Of Extraction

Keep only main-article content:

- title
- intro
- headings
- paragraphs
- lists
- blockquotes
- code blocks
- body images
- image captions and explanatory text tied to those images

Exclude:

- navigation
- headers and footers
- comments
- related posts
- ads and sponsored blocks
- popups
- email capture prompts
- affiliate sections
- unrelated decorative material

When the boundary is ambiguous, drop the content instead of mixing junk into the article.

## Translation Rules

- preserve logic, conditions, negation, and numbers
- preserve heading hierarchy
- translate heading text into Chinese
- generic headings such as `Introduction`, `Conclusion`, and `References` must not remain in English
- only proper nouns, product names, protocol names, and fixed technical terms may remain in English in headings
- keep code, commands, paths, API names, versions, and protocol names in English where appropriate
- prefer paragraph-by-paragraph faithful translation
- do not proactively add editorial smoothing
- unless Chinese would become clearly awkward, do not rewrite the author's sentence progression just to make it read more smoothly
- keep the author's rhetorical pacing and local emphasis whenever Chinese can still carry them
- write restrained, natural Simplified Chinese
- avoid marketing tone and obvious AI phrasing

## Images

Keep all body images that belong to the author’s main article.

Markdown form:

```md
![说明](01.webp)
```

Storage path:

```text
public/images/{slug}/
```

Number by first appearance:

- `01.webp`
- `02.webp`
- `03.webp`

If a stable image URL cannot be obtained, mention that outside the Markdown body instead of inventing it.

## Translator Summary

`## 译者总结` exists only to help readers understand the original.

Allowed:

- briefly summarize the original's core argument
- remind readers of key assumptions, scope limits, or easy-to-misread passages
- add a small glossary when it materially helps understanding
- add highly relevant further reading when needed

Not allowed:

- recommendation copy
- review-style commentary
- guidebook-style lead-in
- turning it into a second article
- replacing the original body with the summary
- invented arguments
- masking your own opinions as the author’s

Recommended size:

- a short section only, sized by necessity rather than a fixed quota

## Failure Handling

If reliable extraction is impossible due to a paywall, login wall, anti-bot measures, or lack of a reliable main article:

- do not fabricate content
- explain the failure clearly
- ask for pasted text or an accessible mirror
- do not output placeholder frontmatter or half-finished article text
