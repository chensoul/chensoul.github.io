/**
 * 文章排序工具函数
 *
 * @fileoverview 将文章按更新时间（或发布时间）降序排序
 *
 * 核心逻辑：
 * 1. 先通过 postFilter 过滤掉草稿和未到发布时间的文章
 * 2. 按更新时间/发布时间的降序排列（最新的在前）
 * 3. 使用秒级时间戳进行比较，避免毫秒级差异导致的排序不稳定
 *
 * 依赖关系：
 * - 被几乎所有列表页面（首页、归档、分类、标签）调用
 * - 依赖 postFilter 进行文章过滤
 *
 * @param posts - 文章集合数组
 * @returns 排序后的文章数组
 */

import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

/**
 * 获取排序后的文章列表
 *
 * 排序规则：
 * - 优先使用 updated 字段（更新时间）
 * - 若没有 updated，则使用 date 字段（发布时间）
 * - 降序排列（最新的在前）
 *
 * @param posts - 原始文章集合
 * @returns 过滤并排序后的文章数组
 */
const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts
    // 步骤1：过滤掉草稿和未到发布时间的文章
    .filter(postFilter)
    // 步骤2：按时间降序排序
    .sort(
      (a, b) =>
        // 获取文章B的时间（更新时间或发布时间），转换为秒级时间戳
        Math.floor(new Date(b.data.updated ?? b.data.date).getTime() / 1000) -
        // 获取文章A的时间（更新时间或发布时间），转换为秒级时间戳
        Math.floor(new Date(a.data.updated ?? a.data.date).getTime() / 1000)
    );
};

export default getSortedPosts;
