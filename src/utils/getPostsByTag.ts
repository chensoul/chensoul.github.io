/**
 * 按标签筛选文章
 *
 * @fileoverview 获取包含指定标签的所有文章，并按时间排序
 *
 * 核心逻辑：
 * 1. 将所有文章的标签转换为 slug 格式
 * 2. 筛选出包含指定标签 slug 的文章
 * 3. 使用 getSortedPosts 进行排序（已包含过滤和排序逻辑）
 *
 * 依赖关系：
 * - 被 /tags/[tag]/[...page].astro 页面调用
 * - 依赖 getSortedPosts 进行排序
 * - 依赖 slugifyAll 进行标签 slug 转换
 */

import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";

/**
 * 获取包含指定标签的所有文章
 *
 * 处理流程：
 * 1. 将每篇文章的 tags 数组转换为 slug 格式
 * 2. 筛选出 slug 数组中包含目标标签的文章
 * 3. 对结果进行过滤（排除草稿）和排序（按时间降序）
 *
 * @param posts - 文章集合
 * @param tag - 目标标签的 slug（URL 格式）
 * @returns 包含该标签的文章数组，已按时间排序
 *
 * @example
 * // 假设 tag = "javascript"
 * // 会筛选出 tags 中包含 "JavaScript"、"javascript" 等的所有文章
 * // 因为这些标签都会被 slugify 为 "javascript"
 */
const getPostsByTag = (posts: CollectionEntry<"blog">[], tag: string) =>
  getSortedPosts(
    // 筛选条件：文章的 tags 数组转换为 slug 后，包含目标标签
    posts.filter(post => slugifyAll(post.data.tags).includes(tag))
  );

export default getPostsByTag;
