/**
 * 按条件分组文章
 *
 * @fileoverview 将文章数组按自定义条件分组为对象
 *
 * 核心逻辑：
 * - 接收一个分组函数，对每篇文章执行该函数获取分组 key
 * - 返回一个对象，key 为分组名，value 为该组的文章数组
 * - 常用场景：按年份、按月份、按分类等维度分组
 *
 * 依赖关系：
 * - 被 /archives/[...page].astro 页面调用，用于按年份归档
 * - 通用的分组工具，可用于任何需要分组的场景
 */

import type { CollectionEntry } from "astro:content";

/**
 * 分组 key 的类型
 *
 * 可以是字符串、数字或 Symbol
 * 用于作为分组后对象的键
 */
type GroupKey = string | number | symbol;

/**
 * 分组函数类型
 *
 * @param item - 数组中的当前文章项
 * @param index - 当前文章在数组中的索引
 * @returns 分组的 key
 */
interface GroupFunction<T> {
  (item: T, index?: number): GroupKey;
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
 * const grouped = getPostsByGroupCondition(posts, (post) => {
 *   return new Date(post.data.date).getFullYear();
 * });
 * // 返回：{ 2023: [...], 2024: [...] }
 *
 * @example
 * // 按分类分组
 * const grouped = getPostsByGroupCondition(posts, (post) => {
 *   return post.data.categories[0] || 'Uncategorized';
 * });
 * // 返回：{ '技术': [...], '生活': [...], 'Uncategorized': [...] }
 */
const getPostsByGroupCondition = (
  posts: CollectionEntry<"blog">[],
  groupFunction: GroupFunction<CollectionEntry<"blog">>
) => {
  // 初始化分组结果对象
  const result: Record<GroupKey, CollectionEntry<"blog">[]> = {};

  // 遍历所有文章
  for (let i = 0; i < posts.length; i++) {
    const item = posts[i];
    // 获取当前文章的分组 key
    const groupKey = groupFunction(item, i);

    // 如果该分组不存在，初始化为空数组
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    // 将文章添加到对应分组
    result[groupKey].push(item);
  }

  return result;
};

export default getPostsByGroupCondition;
