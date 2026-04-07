---
name: url-article-to-cn-blog
description: >-
  Translate an English canonical article URL (any site—blogs, docs, newsletters, etc.—not limited to
  a specific publisher) into a Chinese Markdown post for this Astro blog:
  slug = last path segment of the URL (kebab-case); dedupe by slug in content/translation/ before
  translating; write content/translation/{YYYY-MM-DD}-【译】{title}.md (date prefix from frontmatter date)
  with frontmatter (draft true by default),
  prose body, and a copyright / source-link blockquote at the end only; save images as
  public/images/{slug}/01.webp, 02.webp… in reading order and do not download images that belong to
  removed blocks (ads, sponsorship, promotion). 
  Frontmatter date: prefer original article publish/creation time from the source page; if unavailable
  use current time; always Asia/Shanghai (+08:00). Do not add frontmatter field originalPublishedAt.
  Download body images from source HTML (skip ad/sponsor
  assets), cwebp to public/images/{slug}/NN.webp. Git steps optional in references/execution.md. 
---

# 翻译英文文章保存为博客 md 文件

英文 canonical URL → 生成 `content/translation/` 译文、`public/images/{slug}/` 配图，可选 git 同步。

**适用范围**：面向**任意来源**的单篇英文原文（博客、技术文档、通讯稿、媒体站点等均可）。不同站点的 HTML 结构、元数据、配图方式可能不同，执行时以用户给出的 **canonical URL** 对应页面为准，并遵守下表与本仓库版式约定。

## 仓库约定

| 项           | 约定                                                                                                                                                                                                                                              |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 路径 / 文件名    | `content/translation/{YYYY-MM-DD}-【译】{中文标题}.md`；**`YYYY-MM-DD`** 取自本文件 frontmatter **`date`** 的日历日（上海时区换算后取年-月-日）；与 `date` 一致、可排序                                                                                                               |
| slug        | 从 canonical URL **路径取最后一段**（去掉 `?query` 与 `#hash`）；小写 **kebab-case** ASCII；与 `canonicalURL`、frontmatter `slug` 一致；禁止按中文标题自造                                                                                                                     |
| 去重          | 检索 `slug:`；已存在则停（除非用户要求覆盖）                                                                                                                                                                                                                      |
| frontmatter | 原文时间只体现在 **`date`**（见下）                                                                                                                                                                                                                         |
| draft       | 默认 `true`                                                                                                                                                                                                                                       |
| 配图          | `public/images/{slug}/`；正文 `![alt](01.webp)` 仅文件名；**文中首次出现**依次为 `01`、`02`…；同源复用同号；磁盘与引用一致；**不译区块**（见下「正文」）里的图**不下载、不保存**；落盘应为**真实 WebP**，若本机无 `cwebp` **先安装**再转码（见 [`references/execution.md`](references/execution.md)），勿用 PNG/JPEG 冒充 `.webp` |

## 工作流程

### 步骤 1：预检 slug

从原文 URL 解析 slug：**路径最后一段**（例：`https://example.com/p/ep209-foo` → `ep209-foo`）。用 slug
判断是否已存在译文；若已译且用户未要求重译，则停止并告知已有文件路径。

### 步骤 2：翻译

**翻译原则**：

- **准确性至上**：事实、数据和逻辑必须与原文完全一致。
- **意译重于字面意思**：翻译时要理解作者的意图，而不仅仅是照搬字面意思。当直译听起来不自然或无法传达预期效果时，应灵活调整措辞，用目标语言的惯用表达方式来表达相同的含义。
- **比喻性语言**：理解比喻、习语和比喻性表达时，应着重把握其本意，而非逐字翻译。当源语言中的意象在目标语言中无法传达相同的含义时，应使用自然流畅、表达相同思想和情感效果的词语来代替。
- **情感忠实度**：保留词语选择的情感内涵，而不仅仅是它们的字典释义。带有主观感受的词语（例如，“令人震惊的”、“萦绕心头的”）应该以能够唤起目标语言读者相同感受的方式呈现。
- **自然流畅**：使用目标语言的惯用语序和句型；当源语言结构在目标语言中不自然时，可以自由地拆分或重组句子。
- **术语**：使用标准翻译；首次出现时，用括号注明原文。
- **保留格式**：保留所有 Markdown 格式（标题、粗体、斜体、图像、链接、代码块）；**围栏代码与行内代码**字面与原文一致，不译。
- **图像语言意识**：翻译过程中要完整保留图像引用，翻译完成后，检查引用的图像，确认其主要文本语言是否仍然与译文语言一致（仅针对会落盘、会出现在译文中的图）。
- **尊重原文**：保持原文的含义和意图；去掉导航、页脚、评论、**广告、赞助、推广**、订阅等**不译**
  区块，除此之外，不得添加、删除或编辑——但句子结构和意象可以自由调整以服务于含义。
- **译者注**：对于目标读者可能因专业术语、文化差异或领域知识不足而难以理解的术语、概念或文化典故，请在术语后立即添加括号内的简明解释。解释应使用通俗易懂的语言阐述其
  *含义*，而不仅仅是提供英文原文。格式：`译文（英文原文，通俗解释）`
  。注释的深度应根据目标受众进行调整：普通读者需要的注释比技术读者更多。对于短文本（少于5句话），应进一步减少注释——仅注释目标受众不太可能了解的非常用术语；省略那些广为人知或在上下文中不言自明的术语。仅在真正需要的地方添加注释；不要对显而易见的术语进行过度注释。

**不写「译者总结」小节**（无 `## 译者总结` 及类似读后感结构）。

### 步骤 3：输出文件

1. 将内容保存到 `content/translation/{YYYY-MM-DD}-【译】{中文标题}.md`（**日期前缀**规则见上表）。文件**开头**仅为
   Frontmatter：

```yaml
---
title: "【译】自然中文标题"
date: YYYY-MM-DD HH:mm:00+08:00
draft: true
slug: "from-url-only"
categories: [ "translation" ]
tags: [ "tag1", "tag2" ]
description: "一两句中文摘要"
canonicalURL: "https://exact-source-url"
---
```

**`date`（必填）**：时区固定为 **Asia/Shanghai（东八区）**，写入 ISO 风格字符串 **`YYYY-MM-DD HH:mm:00+08:00`**（秒固定为 `00`
即可）。

- **优先**：从**原文页面**解析首次发布或创建时间（例如 `article:published_time` / `og:published_time`、JSON-LD
  `datePublished`、`time[datetime]`、文章元数据中的可见日期等），换算为上海时区后写入 `date`。若来源仅有**日期**没有时刻，可用当日
  **`00:00:00`** 或 **`08:00:00`**，与仓库既有译文保持一致即可。
- **回退**：若无法从页面可靠解析，则使用**生成该 Markdown 时**的**当前时间**（同样按上海时区），格式同上。

**tags**：1～3 个英文技术词。

2. Frontmatter 之后接**译文正文**（标题、段落、列表、配图引用等与翻译结果一致）。

3. **文末**追加 **翻译声明**：学习目的说明、原文链接、版权归原作者及非官方译本声明（语气克制）。**不要**把该翻译声明放在正文中间。

翻译声明模版：

```markdown
> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[原文标题](原文链接)
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
```

4. **配图落盘（固定步骤，不得只写 Markdown 而不保存文件）**
    - 从原文页面解析**仅属于译文正文**的图片 URL（顺序与正文插图一致；**排除**广告、赞助、推广等不译区块内的图）。
    - `mkdir -p public/images/{slug}`；按顺序下载到临时文件，用 **`cwebp`**（缺则**先安装**，见 [
      `references/execution.md`](references/execution.md)）转为 **`01.webp`、`02.webp`…** 写入该目录。
    - 正文使用 `![说明](01.webp)`（仅文件名）。禁止把 PNG/JPEG 直接改名成 `.webp`。

### 步骤 4：审核

请检查以下内容：

- slug / canonicalURL 与用户 URL 一致；slug 为路径最后一段
- 代码与原文一致
- 章节标题层级与原文对应；译文标题自然、不臆造小节
- 图 01→02… 与 `public/images/{slug}/` 中文件一致，且已为真实 WebP（非仅正文占位）
- 无多余「译者总结」类章节；blockquote 仅在文末

## 参考文件

- [`references/execution.md`](references/execution.md) — git 备忘；**默认不跑 pnpm**
- [`scripts/fetch-image.example.sh`](scripts/fetch-image.example.sh) — 单张图下载示例
