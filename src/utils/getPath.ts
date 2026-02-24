/**
 * 文章路径生成工具
 *
 * @fileoverview 根据文章的文件路径和 ID 生成 URL 路径
 *
 * 核心逻辑：
 * - 支持文章存放在子目录中的情况（如 content/posts/tech/article.md）
 * - 自动排除以下划线开头的目录（私有文件）
 * - 将路径中的每个段落转换为 slug 格式
 * - 支持是否包含 /posts 前缀
 * - 如果提供了日期，生成包含年/月/日的路径格式：/posts/YYYY/MM/DD/slug
 *
 * 依赖关系：
 * - 被所有需要生成文章链接的地方调用
 * - 依赖 content.config.ts 中的 BLOG_PATH 常量
 * - 依赖 slugifyStr 进行路径 slug 转换
 */

import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * 获取博客文章的完整路径
 *
 * 处理规则：
 * 1. 如果提供了 date，生成格式：/posts/YYYY/MM/DD/slug
 * 2. 否则，使用原有的目录结构逻辑
 * 3. 从文件名中提取 slug（去掉日期前缀，如果有）
 * 4. 去除 BLOG_PATH 前缀，获取相对路径
 * 5. 排除以下划线 _ 开头的目录（视为私有）
 *
 * @param id - 文章 ID（通常是文件的相对路径，如 "content/posts/article.md"）
 * @param filePath - 文章的完整文件路径（可选）
 * @param includeBase - 是否在返回值中包含 `/posts` 前缀，默认 true
 * @param date - 文章发布日期（可选），如果提供则生成包含年/月/日的路径
 * @returns 文章的 URL 路径
 *
 * @example
 * // 带日期的文章：content/posts/2026-02-09-spring-ai.md，date: 2026-02-09
 * getPath("content/posts/2026-02-09-spring-ai.md", "content/posts/2026-02-09-spring-ai.md", true, new Date("2026-02-09"))
 * // 返回："/posts/2026/02/09/spring-ai"
 *
 * @example
 * // 子目录文章（无日期）：content/posts/tech/deep-dive.md
 * getPath("content/posts/tech/deep-dive.md", "content/posts/tech/deep-dive.md")
 * // 返回："/posts/tech/deep-dive"
 *
 * @example
 * // 不包含前缀
 * getPath("content/posts/article.md", "content/posts/article.md", false, new Date("2026-02-09"))
 * // 返回："/2026/02/09/article"
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true,
  date?: Date
) {
  // 设置基础路径（/posts 或空字符串）
  const basePath = includeBase ? "/posts" : "";

  // 处理文章 ID（slug）
  // ID 可能包含目录，如 "tech/article"，需要提取最后一段（文件名）
  const blogId = id.split("/");
  const fileName = blogId.length > 0 ? blogId.slice(-1)[0] : id;
  
  // 从文件名中提取 slug（去掉 .md 或 .mdx 扩展名）
  let slug = fileName.replace(/\.(md|mdx)$/, "");
  
  // 如果文件名以日期格式开头（YYYY-MM-DD-），去掉日期前缀
  const datePrefixMatch = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (datePrefixMatch) {
    slug = datePrefixMatch[2];
  }

  // 如果提供了日期，生成包含年/月/日的路径
  if (date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    
    // 对 slug 进行 slugify 处理
    const slugifiedSlug = slugifyStr(slug);
    
    return [basePath, yyyy, mm, dd, slugifiedSlug].join("/");
  }

  // 原有的逻辑：处理文件路径，提取目录结构
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "") // 去除 BLOG_PATH 前缀（"content/posts"）
    .split("/") // 按斜杠分割成数组
    .filter(path => path !== "") // 移除空字符串段
    .filter(path => !path.startsWith("_")) // 排除以下划线开头的目录（私有目录）
    .slice(0, -1) // 移除最后一段（文件名），只保留目录结构
    .map(segment => slugifyStr(segment)); // 将每一段转换为 slug 格式

  // 对 slug 进行 slugify 处理
  const slugifiedSlug = slugifyStr(slug);

  // 如果没有子目录，直接返回基础路径 + slug
  if (!pathSegments || pathSegments.length < 1) {
    return [basePath, slugifiedSlug].join("/");
  }

  // 如果有子目录，返回完整路径：/posts/parent-dir/child-dir/slug
  return [basePath, ...pathSegments, slugifiedSlug].join("/");
}
