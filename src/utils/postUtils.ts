/**
 * 博客与文章集合相关工具（原多文件合并：摘要正则、slug、分类元数据、PostUtils、llms.txt 生成）
 *
 * @fileoverview 文章过滤/排序/路径、标签与分类、描述提取、分类显示与排序、LLMs 站点地图文案
 */

import type { CollectionEntry } from "astro:content";
import kebabcase from "lodash.kebabcase";
import { BLOG_PATH } from "@/content.config";
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

export const slugifyStr = (str: string) =>
  kebabcase(str).replace(/\b([a-z])-([0-9]+)-([a-z])\b/g, "$1$2$3");

const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

// --- 分类元信息 ---

export interface CategoryMeta {
  slug: string;
  name: string;
  image?: string;
  order?: number;
}

const CATEGORY_META: CategoryMeta[] = [
  { slug: "tech", name: "技术", image: "", order: 1 },
  { slug: "weekly", name: "周报", image: "", order: 2 },
  { slug: "translation", name: "翻译", order: 3 },
  { slug: "wiki", name: "知识库", order: 4 },
];

export function getCategoryMeta(nameOrSlug?: string): CategoryMeta | undefined {
  if (!nameOrSlug) return undefined;

  const slug = slugifyStr(nameOrSlug);
  return CATEGORY_META.find(
    item => item.slug === slug || item.name === nameOrSlug
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

  static getUniqueTags(posts: CollectionEntry<"blog">[]): Tag[] {
    const tagCountMap = new Map<string, Tag>();

    this.getPublishedPosts(posts)
      .flatMap(post => post.data.tags)
      .forEach(tag => {
        const slugTag = slugifyStr(tag);

        if (tagCountMap.has(slugTag)) {
          const existingTag = tagCountMap.get(slugTag)!;
          existingTag.count += 1;
        } else {
          tagCountMap.set(slugTag, {
            tag: slugTag,
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
        const slugName = slugifyStr(cat);
        const displayName = getCategoryMeta(cat)?.name ?? cat;

        if (catCountMap.has(slugName)) {
          const existing = catCountMap.get(slugName)!;
          existing.count += 1;
        } else {
          catCountMap.set(slugName, {
            category: slugName,
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
      posts.filter(post => slugifyAll(post.data.tags).includes(tag))
    );
  }

  static getPostsByCategory(
    posts: CollectionEntry<"blog">[],
    category: string
  ): CollectionEntry<"blog">[] {
    return this.sort(
      posts.filter(post => slugifyAll(post.data.categories).includes(category))
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

  static getPath(
    id: string,
    filePath: string | undefined,
    includeBase = true,
    date?: Date,
    timeZone?: string
  ): string {
    const basePath = includeBase ? "/posts" : "";
    const blogId = id.split("/");
    const fileName = blogId.length > 0 ? blogId.slice(-1)[0] : id;
    let slug = fileName.replace(/\.(md|mdx)$/, "");
    const datePrefixMatch = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (datePrefixMatch) {
      slug = datePrefixMatch[2];
    }

    if (date) {
      const [yyyy, mm, dd] = PostUtils.getLocalDateString(
        new Date(date),
        timeZone ?? SITE.timezone
      ).split("-");
      return [basePath, yyyy, mm, dd, slug].filter(Boolean).join("/");
    }

    const pathSegments = filePath
      ?.replace(BLOG_PATH, "")
      .split("/")
      .filter(path => path !== "")
      .filter(path => !path.startsWith("_"))
      .slice(0, -1)
      .map(segment => slugifyStr(segment));

    if (!pathSegments || pathSegments.length < 1) {
      return [basePath, slug].filter(Boolean).join("/");
    }
    return [basePath, ...pathSegments, slug].filter(Boolean).join("/");
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
    post.data.timezone
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
