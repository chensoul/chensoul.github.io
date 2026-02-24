/**
 * 文章过滤器函数
 *
 * @fileoverview 判断文章是否应该在前台显示
 *
 * 核心逻辑：
 * - 草稿文章永远不显示
 * - 开发环境下显示所有非草稿文章（便于预览）
 * - 生产环境下只显示已到发布时间的文章
 * - 发布时间有容差值（scheduledPostMargin），避免服务器时间差异导致问题
 *
 * 依赖关系：
 * - 被 getSortedPosts、getUniqueTags、getUniqueCategories 等所有需要获取文章列表的工具函数调用
 * - 依赖 config.ts 中的 SITE.scheduledPostMargin 配置
 */

import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

/**
 * 文章过滤函数
 *
 * 过滤规则：
 * 1. draft = true 的文章会被过滤掉
 * 2. 生产环境下，发布时间早于（当前时间 - 容差）的文章才会显示
 * 3. 开发环境下（import.meta.env.DEV），忽略发布时间限制
 *
 * @param post - 文章对象
 * @returns true 表示文章应该显示，false 表示应该过滤
 */
const postFilter = ({ data }: CollectionEntry<"blog">) => {
  // 计算文章发布时间是否已到达
  // 当前时间 > 文章发布时间 - 容差（15分钟）
  // 这样即使服务器时间快几分钟，文章也不会提前显示
  const isPublishTimePassed =
    Date.now() > new Date(data.date).getTime() - SITE.scheduledPostMargin;

  // 返回条件：
  // 1. 文章不是草稿（!data.draft）
  // 2. 且满足以下条件之一：
  //    - 当前是开发环境（import.meta.env.DEV）
  //    - 文章发布时间已到达（isPublishTimePassed）
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
