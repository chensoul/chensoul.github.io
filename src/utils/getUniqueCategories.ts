/**
 * 获取唯一分类列表及统计
 *
 * @fileoverview 从文章集合中提取所有分类，并统计每个分类的文章数量
 *
 * 核心逻辑：
 * 1. 过滤掉草稿和未发布的文章
 * 2. 展开所有文章的 categories 数组
 * 3. 使用 Map 统计每个分类出现的次数
 * 4. 按分类名称字母顺序排序
 *
 * 数据结构：
 * - category: URL 友好的 slug（如 "qi-cheng"）
 * - categoryName: 原始分类名称（如 "骑行"）
 * - count: 文章数量
 *
 * 依赖关系：
 * - 被 /categories/index.astro 页面调用，用于显示分类列表
 * - 依赖 postFilter 进行文章过滤
 * - 依赖 slugifyStr 生成 URL slug
 */

import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

/**
 * 分类对象接口
 *
 * @property category - URL 友好的 slug（用于分类页 URL）
 * @property categoryName - 原始分类名称（用于显示）
 * @property count - 该分类下的文章数量
 */
interface Category {
  category: string;
  categoryName: string;
  count: number;
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
 */
const getUniqueCategories = (posts: CollectionEntry<"blog">[]): Category[] => {
  // 使用 Map 存储分类统计，key 为 slug
  const catCountMap = new Map<string, Category>();

  // 遍历所有文章
  posts
    .filter(postFilter) // 过滤掉草稿和未发布的文章
    .flatMap(post => post.data.categories) // 将所有文章的 categories 数组展平为一维数组
    .forEach(cat => {
      // 将分类名转换为 slug
      const slugName = slugifyStr(cat);

      if (catCountMap.has(slugName)) {
        // 分类已存在：计数 +1
        const existing = catCountMap.get(slugName)!;
        existing.count += 1;
      } else {
        // 新分类：初始化计数为 1
        catCountMap.set(slugName, {
          category: slugName,
          categoryName: cat,
          count: 1,
        });
      }
    });

  // 将 Map 转为数组，按分类名称字母顺序排序
  const categories = Array.from(catCountMap.values()).sort((catA, catB) =>
    catA.categoryName.localeCompare(catB.categoryName, "zh-CN")
  );

  return categories;
};

export default getUniqueCategories;
