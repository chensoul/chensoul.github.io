/**
 * 文章处理工具类
 *
 * @fileoverview 统一管理所有文章相关的处理逻辑
 *
 * 核心功能：
 * 1. 文章过滤：判断文章是否应该显示（草稿、发布时间）
 * 2. 文章排序：按更新时间或发布时间降序排列
 * 3. 标签提取：获取所有唯一标签及统计
 * 4. 分类提取：获取所有唯一分类及统计
 * 5. 按标签筛选：获取包含指定标签的文章
 * 6. 分组：按自定义条件分组文章
 *
 * 优势：
 * - 统一管理：所有文章处理逻辑集中在一个类中
 * - 减少重复：避免多次调用 filter
 * - 易于维护：修改逻辑只需改一处
 * - 类型安全：完整的 TypeScript 类型定义
 *
 * 依赖关系：
 * - 被所有需要处理文章的页面和组件调用
 * - 依赖 SITE 配置、slugify 工具函数
 */

import type { CollectionEntry } from "astro:content";
import { BLOG_PATH } from "@/content.config";
import { SITE } from "@/config";
import { slugifyStr, slugifyAll } from "./slugify";
import { tagMoreRegex, regexReplacers } from "./descriptionRegex";

/**
 * 标签对象接口
 */
export interface Tag {
  /** URL 友好的 slug（用于标签页 URL） */
  tag: string;
  /** 原始标签名称（用于显示） */
  tagName: string;
  /** 使用该标签的文章数量 */
  count: number;
}

/**
 * 分类对象接口
 */
export interface Category {
  /** URL 友好的 slug（用于分类页 URL） */
  category: string;
  /** 原始分类名称（用于显示） */
  categoryName: string;
  /** 该分类下的文章数量 */
  count: number;
}

/**
 * 分组 key 的类型
 */
type GroupKey = string | number | symbol;

/**
 * 分组函数类型
 */
interface GroupFunction<T> {
  (item: T, index?: number): GroupKey;
}

/**
 * 文章处理工具类
 *
 * 提供静态方法处理文章集合的各种操作
 */
export class PostUtils {
  /**
   * 过滤文章
   *
   * 过滤规则：
   * 1. draft = true 的文章会被过滤掉
   * 2. 生产环境下，发布时间早于（当前时间 - 容差）的文章才会显示
   * 3. 开发环境下（import.meta.env.DEV），忽略发布时间限制
   *
   * @param post - 文章对象
   * @returns true 表示文章应该显示，false 表示应该过滤
   */
  static filter(post: CollectionEntry<"blog">): boolean {
    const { data } = post;

    // 计算文章发布时间是否已到达
    // 当前时间 > 文章发布时间 - 容差（15分钟）
    const isPublishTimePassed =
      Date.now() > new Date(data.date).getTime() - SITE.scheduledPostMargin;

    // 返回条件：
    // 1. 文章不是草稿（!data.draft）
    // 2. 且满足以下条件之一：
    //    - 当前是开发环境（import.meta.env.DEV）
    //    - 文章发布时间已到达（isPublishTimePassed）
    return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
  }

  /**
   * 排序文章
   *
   * 排序规则：
   * - 优先使用 updated 字段（更新时间）
   * - 若没有 updated，则使用 date 字段（发布时间）
   * - 降序排列（最新的在前）
   * - 使用秒级时间戳避免毫秒级差异
   *
   * @param posts - 原始文章集合
   * @returns 过滤并排序后的文章数组
   */
  static sort(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] {
    return posts
      .filter(this.filter)
      .sort(
        (a, b) =>
          Math.floor(
            new Date(b.data.updated ?? b.data.date).getTime() / 1000
          ) -
          Math.floor(new Date(a.data.updated ?? a.data.date).getTime() / 1000)
      );
  }

  /**
   * 获取唯一标签列表及统计
   *
   * 处理流程：
   * 1. 过滤有效文章（非草稿、已发布）
   * 2. 展开所有文章的 tags 数组
   * 3. 统计每个标签出现的次数
   * 4. 按标签字母顺序排序
   *
   * @param posts - 文章集合
   * @returns 标签对象数组，已按字母顺序排序
   *
   * @example
   * const tags = PostUtils.getUniqueTags(allPosts);
   * // [
   * //   { tag: "javascript", tagName: "JavaScript", count: 5 },
   * //   { tag: "vue", tagName: "Vue.js", count: 3 }
   * // ]
   */
  static getUniqueTags(posts: CollectionEntry<"blog">[]): Tag[] {
    const tagCountMap = new Map<string, Tag>();

    posts
      .filter(this.filter)
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

  /**
   * 获取唯一分类列表及统计
   *
   * 处理流程：
   * 1. 过滤有效文章（非草稿、已发布）
   * 2. 展开所有文章的 categories 数组
   * 3. 统计每个分类出现的次数
   * 4. 按分类名称字母顺序排序
   *
   * @param posts - 文章集合
   * @returns 分类对象数组，已按字母顺序排序
   *
   * @example
   * const categories = PostUtils.getUniqueCategories(allPosts);
   * // [
   * //   { category: "ji-shu", categoryName: "技术", count: 10 },
   * //   { category: "sheng-huo", categoryName: "生活", count: 5 }
   * // ]
   */
  static getUniqueCategories(posts: CollectionEntry<"blog">[]): Category[] {
    const catCountMap = new Map<string, Category>();

    posts
      .filter(this.filter)
      .flatMap(post => post.data.categories)
      .forEach(cat => {
        const slugName = slugifyStr(cat);

        if (catCountMap.has(slugName)) {
          const existing = catCountMap.get(slugName)!;
          existing.count += 1;
        } else {
          catCountMap.set(slugName, {
            category: slugName,
            categoryName: cat,
            count: 1,
          });
        }
      });

    return Array.from(catCountMap.values()).sort((catA, catB) =>
      catA.categoryName.localeCompare(catB.categoryName, "zh-CN")
    );
  }

  /**
   * 按标签筛选文章
   *
   * 处理流程：
   * 1. 将每篇文章的 tags 数组转换为 slug 格式
   * 2. 筛选出 slug 数组中包含目标标签的文章
   * 3. 对结果进行过滤和排序
   *
   * @param posts - 文章集合
   * @param tag - 目标标签的 slug（URL 格式）
   * @returns 包含该标签的文章数组，已按时间排序
   *
   * @example
   * const jsPosts = PostUtils.getPostsByTag(allPosts, "javascript");
   */
  static getPostsByTag(
    posts: CollectionEntry<"blog">[],
    tag: string
  ): CollectionEntry<"blog">[] {
    return this.sort(
      posts.filter(post => slugifyAll(post.data.tags).includes(tag))
    );
  }

  /**
   * 按分类筛选文章
   *
   * @param posts - 文章集合
   * @param category - 目标分类的 slug（URL 格式）
   * @returns 该分类下的文章数组，已按时间排序
   *
   * @example
   * const techPosts = PostUtils.getPostsByCategory(allPosts, "ji-shu");
   */
  static getPostsByCategory(
    posts: CollectionEntry<"blog">[],
    category: string
  ): CollectionEntry<"blog">[] {
    return this.sort(
      posts.filter(post =>
        slugifyAll(post.data.categories).includes(category)
      )
    );
  }

  /**
   * 按条件分组文章
   *
   * 使用场景：
   * - 按年份分组：post => new Date(post.data.date).getFullYear()
   * - 按月份分组：post => new Date(post.data.date).toLocaleString('default', { month: 'long' })
   * - 按分类分组：post => post.data.categories[0]
   *
   * @param posts - 文章集合
   * @param groupFunction - 分组函数，接收文章返回分组 key
   * @returns 分组后的对象，key 为分组名，value 为文章数组
   *
   * @example
   * // 按年份分组
   * const grouped = PostUtils.groupBy(posts, (post) => {
   *   return new Date(post.data.date).getFullYear();
   * });
   * // 返回：{ 2023: [...], 2024: [...] }
   */
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

  /**
   * 按指定时区将 Date 格式化为 YYYY-MM-DD
   *
   * 避免使用 UTC/本地 getDate() 导致 +08:00 等日期显示为前一天
   *
   * @param date - 日期对象
   * @param timeZone - IANA 时区（如 Asia/Shanghai），默认 SITE.timezone
   */
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
   * 获取博客文章的 URL 路径
   *
   * @param id - 文章 ID（如 "content/posts/article.md"）
   * @param filePath - 文章完整文件路径（可选）
   * @param includeBase - 是否包含 `/posts` 前缀，默认 true
   * @param date - 发布日期（可选），提供则生成 /posts/YYYY/MM/DD/slug
   * @param timeZone - 时区（可选），用于按该时区取日期，默认 SITE.timezone
   * @returns 文章的 URL 路径
   */
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

  /**
   * 从 Markdown 内容中提取文章描述（摘要）
   *
   * 优先使用 `<!-- more -->` 前的内容，否则取前 N 字符并移除 Markdown 语法。
   *
   * @param markdownContent - 原始 Markdown 内容
   * @returns 纯文本描述
   */
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
