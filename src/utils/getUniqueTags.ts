/**
 * 获取唯一标签列表及统计
 *
 * @fileoverview 从文章集合中提取所有标签，并统计每个标签的文章数量
 *
 * 核心逻辑：
 * 1. 过滤掉草稿和未发布的文章
 * 2. 展开所有文章的 tags 数组
 * 3. 使用 Map 统计每个标签出现的次数
 * 4. 按 tag 字母顺序排序返回
 *
 * 数据结构：
 * - tag: URL 友好的 slug（如 "javascript"）
 * - tagName: 原始标签名称（如 "JavaScript"）
 * - count: 文章数量
 *
 * 依赖关系：
 * - 被 /tags/index.astro 页面调用，用于显示标签云
 * - 依赖 postFilter 进行文章过滤
 * - 依赖 slugifyStr 生成 URL slug
 */

import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

/**
 * 标签对象接口
 *
 * @property tag - URL 友好的 slug（用于标签页 URL）
 * @property tagName - 原始标签名称（用于显示）
 * @property count - 使用该标签的文章数量
 */
interface Tag {
  tag: string;
  tagName: string;
  count: number;
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
 * // 返回示例
 * [
 *   { tag: "javascript", tagName: "JavaScript", count: 5 },
 *   { tag: "vue", tagName: "Vue.js", count: 3 }
 * ]
 */
const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
  // 使用 Map 存储标签统计，key 为 slug
  const tagCountMap = new Map<string, Tag>();

  // 遍历所有文章
  posts
    .filter(postFilter) // 过滤掉草稿和未发布的文章
    .flatMap(post => post.data.tags) // 将所有文章的 tags 数组展平为一维数组
    .forEach(tag => {
      // 将标签名转换为 slug
      const slugTag = slugifyStr(tag);

      if (tagCountMap.has(slugTag)) {
        // 标签已存在：计数 +1
        const existingTag = tagCountMap.get(slugTag)!;
        existingTag.count += 1;
      } else {
        // 新标签：初始化计数为 1
        tagCountMap.set(slugTag, {
          tag: slugTag,
          tagName: tag,
          count: 1,
        });
      }
    });

  // 将 Map 转为数组，并按 tag 字母顺序排序
  const tags = Array.from(tagCountMap.values()).sort((tagA, tagB) =>
    tagA.tag.localeCompare(tagB.tag)
  );

  return tags;
};

export default getUniqueTags;
