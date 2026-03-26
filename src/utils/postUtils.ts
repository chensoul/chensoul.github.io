/**
 * 博客与文章集合相关工具（原多文件合并：摘要正则、slug、分类元数据、PostUtils、llms.txt 生成）
 *
 * @fileoverview 文章过滤/排序/路径、标签与分类、描述提取、分类显示与排序、LLMs 站点地图文案；订阅卡片日期、content/pages 极简 frontmatter 读取
 */

import fs from "node:fs";
import path from "node:path";

import type { CollectionEntry } from "astro:content";

import { SITE } from "@/config";

// --- 描述提取（Markdown → 纯文本摘要）---

/** 匹配 `<!-- more -->` 之前的内容，捕获组 $1 为摘要 */
const tagMoreRegex = /^(.*?)<!--\s*more\s*-->/s;

/** Markdown 语法替换规则，按顺序应用 */
const regexReplacers: Record<string, [RegExp, string]> = {
  header: [/#{1,6} (.*?)/g, "$1 "],
  star: [/\*{1,3}(.*?)\*{1,3}/g, "$1"],
  underscore: [/_{1,3}(.*?)_{1,3}/g, "$1"],
  strikeout: [/~~~[\s\S]*?~~~/g, ""],
  horizontalRule: [/^(-{3,}|\*{3,})$/gm, ""],
  quote: [/> (.*?)/g, "$1"],
  codeInline: [/`(.*?)`/g, "$1"],
  codeBlock: [/```[\s\S]*?```/g, ""],
  latexInline: [/\$(.*?)\$/g, ""],
  latexBlock: [/\$\$[\s\S]*?\$\$/g, ""],
  image1: [/!\[(.*?)\]\((.*?)\)/g, ""],
  image2: [/!\[(.*?)\]\[(.*?)\]/g, ""],
  link1: [/\[(.*?)\]\((.*?)\)/g, "$1 "],
  link2: [/\[(.*?)\]\[(.*?)\]/g, "$1 "],
  linkRef: [/\[(.*?)\]: (.*?)/g, ""],
};

// --- Slug（URL 路径）---

/**
 * 标签/分类 URL 段、索引用键等：与 frontmatter 字面一致，仅 `trim`（不做 kebab-case 等变换）。
 */
export function trimUrlSegment(str: string): string {
  return String(str).trim();
}

const trimAll = (arr: string[]) => arr.map(s => trimUrlSegment(s));

// --- 分类元信息 ---

export interface CategoryMeta {
  slug: string;
  name: string;
  /** 分类索引卡片用的小图 URL（可与文章 `favicon` 一样指向 `/images/_favicons/...`） */
  image?: string;
  order?: number;
}

const CATEGORY_META: CategoryMeta[] = [
  { slug: "tech", name: "技术", image: "", order: 1 },
  { slug: "weekly", name: "周报", image: "", order: 2 },
  { slug: "translation", name: "翻译", order: 3 },
  { slug: "wiki", name: "知识库", order: 4 },
  { slug: "life", name: "生活", order: 5 },
];

export function getCategoryMeta(nameOrSlug?: string): CategoryMeta | undefined {
  if (!nameOrSlug) return undefined;

  const key = trimUrlSegment(nameOrSlug);
  return CATEGORY_META.find(
    item => item.slug === key || item.name === nameOrSlug
  );
}

export function getCategoryImageUrl(nameOrSlug?: string): string | undefined {
  return getCategoryMeta(nameOrSlug)?.image;
}

export function getCategoryOrder(nameOrSlug?: string): number {
  return getCategoryMeta(nameOrSlug)?.order ?? Number.MAX_SAFE_INTEGER;
}

// --- PostUtils ---

export interface Tag {
  tag: string;
  tagName: string;
  count: number;
}

export interface Category {
  category: string;
  categoryName: string;
  count: number;
}

type GroupKey = string | number | symbol;

interface GroupFunction<T> {
  (item: T, index?: number): GroupKey;
}

export class PostUtils {
  static filter(post: CollectionEntry<"blog">): boolean {
    const { data } = post;
    const isPublishTimePassed =
      Date.now() > new Date(data.date).getTime() - SITE.scheduledPostMargin;
    return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
  }

  static getPublishedPosts(
    posts: CollectionEntry<"blog">[]
  ): CollectionEntry<"blog">[] {
    return posts.filter(this.filter);
  }

  static sort(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] {
    return this.getPublishedPosts(posts).sort(
      (a, b) =>
        Math.floor(new Date(b.data.updated ?? b.data.date).getTime() / 1000) -
        Math.floor(new Date(a.data.updated ?? a.data.date).getTime() / 1000)
    );
  }

  /**
   * 按发布时间 `date` 降序（不使用 `updated`），与文章列表「最近更新」逻辑区分。
   * 用于 RSS 等需与 `pubDate` 一致的排序。
   */
  static sortByPublishedDate(
    posts: CollectionEntry<"blog">[]
  ): CollectionEntry<"blog">[] {
    return this.getPublishedPosts(posts).sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
  }

  static getUniqueTags(posts: CollectionEntry<"blog">[]): Tag[] {
    const tagCountMap = new Map<string, Tag>();

    this.getPublishedPosts(posts)
      .flatMap(post => post.data.tags)
      .forEach(tag => {
        const tagKey = trimUrlSegment(tag);

        if (tagCountMap.has(tagKey)) {
          const existingTag = tagCountMap.get(tagKey)!;
          existingTag.count += 1;
        } else {
          tagCountMap.set(tagKey, {
            tag: tagKey,
            tagName: tag,
            count: 1,
          });
        }
      });

    return Array.from(tagCountMap.values()).sort((tagA, tagB) =>
      tagA.tag.localeCompare(tagB.tag)
    );
  }

  static getUniqueCategories(posts: CollectionEntry<"blog">[]): Category[] {
    const catCountMap = new Map<string, Category>();

    this.getPublishedPosts(posts)
      .flatMap(post => post.data.categories)
      .forEach(cat => {
        const catKey = trimUrlSegment(cat);
        const displayName = getCategoryMeta(cat)?.name ?? cat;

        if (catCountMap.has(catKey)) {
          const existing = catCountMap.get(catKey)!;
          existing.count += 1;
        } else {
          catCountMap.set(catKey, {
            category: catKey,
            categoryName: displayName,
            count: 1,
          });
        }
      });

    return Array.from(catCountMap.values()).sort((catA, catB) =>
      catA.categoryName.localeCompare(catB.categoryName, "zh-CN")
    );
  }

  static getPostsByTag(
    posts: CollectionEntry<"blog">[],
    tag: string
  ): CollectionEntry<"blog">[] {
    return this.sort(
      posts.filter(post => trimAll(post.data.tags).includes(tag))
    );
  }

  static getPostsByCategory(
    posts: CollectionEntry<"blog">[],
    category: string
  ): CollectionEntry<"blog">[] {
    return this.sort(
      posts.filter(post => trimAll(post.data.categories).includes(category))
    );
  }

  static groupBy(
    posts: CollectionEntry<"blog">[],
    groupFunction: GroupFunction<CollectionEntry<"blog">>
  ): Record<GroupKey, CollectionEntry<"blog">[]> {
    const result: Record<GroupKey, CollectionEntry<"blog">[]> = {};

    for (let i = 0; i < posts.length; i++) {
      const item = posts[i];
      const groupKey = groupFunction(item, i);

      if (!result[groupKey]) {
        result[groupKey] = [];
      }

      result[groupKey].push(item);
    }

    return result;
  }

  static getLocalDateString(
    date: Date,
    timeZone: string = SITE.timezone
  ): string {
    const f = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = f.formatToParts(date);
    const y = parts.find(p => p.type === "year")!.value;
    const m = parts.find(p => p.type === "month")!.value;
    const d = parts.find(p => p.type === "day")!.value;
    return `${y}-${m}-${d}`;
  }

  /**
   * 文章 URL：`/posts/{slug}`。frontmatter `slug` 按元数据原样使用（仅 trim）；未指定时由文件名去掉 `YYYY-MM-DD-` 前缀，整段再 trim（不作 kebab-case）。
   *
   * @param explicitSlug - frontmatter `slug`
   * @param _date - 保留参数（排序/展示仍用）；不再参与 URL，避免破坏既有调用签名
   * @param _timeZone - 同上
   */
  static getPath(
    id: string,
    _filePath: string | undefined,
    includeBase = true,
    _date?: Date,
    _timeZone?: string,
    explicitSlug?: string | null
  ): string {
    const basePath = includeBase ? "/posts" : "";
    const blogId = id.split("/");
    const fileName = blogId.length > 0 ? blogId.slice(-1)[0] : id;
    let slug = fileName.replace(/\.(md|mdx)$/, "").trim();
    const datePrefixMatch = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (datePrefixMatch) {
      slug = datePrefixMatch[2].trim();
    }

    const fromFrontmatter = explicitSlug?.trim();
    if (fromFrontmatter) {
      slug = fromFrontmatter;
    }

    return [basePath, slug].filter(Boolean).join("/");
  }

  /**
   * 文章配图在 `public/images/{目录}/` 下的目录名（与 {@link PostUtils.getPath} 末段相同，即 `slug` 语义）。
   *
   * 对外 URL：`astro dev` 同源 `/images/...`，生产 CDN，见 `src/utils/blogImages/`。
   */
  static getPostImageDirName(
    id: string,
    filePath: string | undefined,
    date?: Date,
    timeZone?: string,
    explicitSlug?: string | null
  ): string {
    const pathNoPosts = PostUtils.getPath(
      id,
      filePath,
      false,
      date,
      timeZone,
      explicitSlug
    );
    const segments = pathNoPosts.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "post";
  }

  /**
   * 将 frontmatter 中的图片引用解析为根相对 URL。
   *
   * - `http(s)://...`：原样返回
   * - 以 `/` 开头：根相对路径原样返回（旧式 `/images/foo/01.webp` 等）
   * - 否则视为相对文章配图目录的文件名（可含子路径段），解析为 `/images/{imageDirName}/{ref}`
   */
  static resolveBlogImageRef(
    raw: string | undefined | null,
    imageDirName: string
  ): string | undefined {
    const t = typeof raw === "string" ? raw.trim() : "";
    if (!t) return undefined;
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    if (t.startsWith("/")) return t;
    const rel = t.replace(/\\/g, "/").replace(/^(\.\/)+/, "");
    if (!rel || rel.split("/").some(s => s === ".." || s === "")) {
      return undefined;
    }
    const dir = imageDirName.trim() || "post";
    return `/images/${dir}/${rel}`;
  }

  /**
   * 列表卡片用站点/分类图标：`public/images/_favicons/`。
   *
   * - `http(s)://...`：原样
   * - 以 `/` 开头：根相对原样；`/images/_thumbnails/` 历史路径会改为 `/images/_favicons/`
   * - 否则视为 `_favicons` 内文件名（可含子路径段），解析为 `/images/_favicons/{ref}`
   */
  static resolveFaviconRef(raw: string | undefined | null): string | undefined {
    const t = typeof raw === "string" ? raw.trim() : "";
    if (!t) return undefined;
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    if (t.startsWith("/")) {
      if (t.startsWith("/images/_thumbnails/")) {
        return t.replace(/^\/images\/_thumbnails\//, "/images/_favicons/");
      }
      return t;
    }
    const rel = t.replace(/\\/g, "/").replace(/^(\.\/)+/, "");
    if (!rel || rel.split("/").some(s => s === ".." || s === "")) {
      return undefined;
    }
    return `/images/_favicons/${rel}`;
  }

  static getDescription(markdownContent: string): string {
    const lines = markdownContent
      .split(/\r?\n/)
      .slice(0, SITE.genDescriptionMaxLines);
    const processedContent = lines.join("");
    const moreTagMatch = processedContent.match(tagMoreRegex);
    let short = moreTagMatch
      ? moreTagMatch[1]
      : processedContent.substring(0, SITE.genDescriptionCount) + " ...";

    for (const patternKey in regexReplacers) {
      const [pattern, replacement] = regexReplacers[patternKey];
      short = short.replace(pattern, replacement);
    }
    return short;
  }

  /**
   * 获取纯文本描述（去除 HTML 标签）
   * 用于相关文章卡片等场景
   * @param markdownContent Markdown 内容
   * @param maxLength 最大字符数，默认 80
   */
  static getPlainTextDescription(
    markdownContent: string,
    maxLength: number = 80
  ): string {
    const lines = markdownContent
      .split(/\r?\n/)
      .slice(0, SITE.genDescriptionMaxLines);
    const processedContent = lines.join("");
    const moreTagMatch = processedContent.match(tagMoreRegex);
    let short = moreTagMatch
      ? moreTagMatch[1]
      : processedContent.substring(0, SITE.genDescriptionCount);

    // 移除 HTML 标签
    short = short.replace(/<[^>]+>/g, "");

    // 移除 Markdown 语法
    for (const patternKey in regexReplacers) {
      const [pattern, replacement] = regexReplacers[patternKey];
      short = short.replace(pattern, replacement);
    }

    // 清理多余空白
    short = short.replace(/\s+/g, " ").trim();

    // 截断
    if (short.length > maxLength) {
      short = short.slice(0, maxLength) + "…";
    }

    return short;
  }
}

// --- llms.txt ---

function toAbsoluteUrl(path: string): string {
  return new URL(path, SITE.website).toString();
}

function getPostMarkdownUrl(post: CollectionEntry<"blog">): string {
  const slugPath = PostUtils.getPath(
    post.id,
    post.filePath,
    false,
    post.data.date,
    post.data.timezone,
    post.data.slug
  );
  return toAbsoluteUrl(`/posts/${slugPath}.md`);
}

function getPostDescription(post: CollectionEntry<"blog">): string {
  return (
    post.data.description?.trim() ||
    PostUtils.getDescription(post.body ?? "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function formatPostLine(post: CollectionEntry<"blog">): string {
  return `- [${post.data.title}](${getPostMarkdownUrl(post)}): ${getPostDescription(post)}`;
}

function formatLinkLine(
  label: string,
  path: string,
  description?: string
): string {
  const link = `[${label}](${toAbsoluteUrl(path)})`;
  return description ? `- ${link}: ${description}` : `- ${link}`;
}

export function generateLlmsTxt(posts: CollectionEntry<"blog">[]): string {
  const allPosts = PostUtils.sort(posts);
  const categories = PostUtils.getUniqueCategories(posts).sort(
    (a, b) =>
      getCategoryOrder(a.category) - getCategoryOrder(b.category) ||
      a.categoryName.localeCompare(b.categoryName, "zh-CN")
  );

  const lines = [
    `# ${SITE.title}`,
    "",
    `> ${SITE.description}. Personal blog by ${SITE.author}.`,
    "",
    "## Site",
    formatLinkLine("Home", "/", "Main entry point"),
    formatLinkLine("About", "/about", "Author profile and site background"),
    formatLinkLine("Posts", "/posts", "All canonical articles"),
    formatLinkLine("Categories", "/categories", "Topic entry points"),
    ...categories.map(category =>
      formatLinkLine(category.categoryName, `/categories/${category.category}`)
    ),
    "",
    "## All Posts",
    ...allPosts.map(formatPostLine),
    "",
    "## Feeds",
    formatLinkLine("RSS", "/rss.xml"),
    formatLinkLine("Sitemap", "/sitemap.xml"),
    formatLinkLine("Robots", "/robots.txt"),
    "",
    "## Notes For LLMs",
    "- Prefer canonical post URLs under /posts/.",
    "- Posts are the primary source of truth; tag, archive, feed, and search pages are navigational.",
    "- Category pages provide useful topical entry points, especially /categories/tech and /categories/weekly.",
  ];

  return `${lines.join("\n")}\n`;
}

// --- 订阅条目日期（与 public/feeds.js 的 getDisplayDate 保持一致；改动时请两边同步）---

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 今年内返回相对时间（中文），否则返回 YYYY-MM-DD */
export function formatFeedDate(
  value: string | number | null | undefined
): string {
  if (value == null || value === "") return "日期未知";
  const d = new Date(value);
  if (Number.isNaN(d.getTime()))
    return typeof value === "string" ? value : "日期未知";
  const now = new Date();
  if (d.getFullYear() !== now.getFullYear()) return formatDateYYYYMMDD(d);
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return formatDateYYYYMMDD(d);
  if (diffMs < 60 * 1000) return "刚刚";
  if (diffMs < 60 * 60 * 1000)
    return `${Math.floor(diffMs / (60 * 1000))} 分钟前`;
  if (diffMs < 24 * 60 * 60 * 1000)
    return `${Math.floor(diffMs / (60 * 60 * 1000))} 小时前`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return "昨天";
  }
  return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))} 天前`;
}

// --- content/pages（about、links 等静态 Markdown 页）---

export interface ContentPageData {
  frontmatter: Record<string, string>;
  content: string;
}

/** 读取 `content/pages/{fileName}`，解析单行 `key: value` frontmatter（与 about/links 页约定一致） */
export function readContentPage(fileName: string): ContentPageData {
  const filePath = path.join(process.cwd(), "content/pages", fileName);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const frontmatterMatch = fileContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  );

  if (!frontmatterMatch) {
    throw new Error(`Invalid content page frontmatter: ${fileName}`);
  }

  const frontmatterStr = frontmatterMatch[1];
  const content = frontmatterMatch[2];
  const frontmatter: Record<string, string> = {};

  frontmatterStr.split("\n").forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (!match) return;

    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  });

  return { frontmatter, content };
}
