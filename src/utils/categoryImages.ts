/**
 * 分类图片映射工具
 *
 * @fileoverview 为每个分类配置对应的封面图片 URL
 *
 * 核心逻辑：
 * 1. 定义分类名称到图片 URL 的映射表
 * 2. 提供函数根据分类名称或 slug 获取图片 URL
 * 3. 支持中文分类名和 slug 双向查询
 *
 * 依赖关系：
 * - 被分类页、文章卡片等需要显示分类封面图的地方使用
 * - 依赖 slugifyStr 进行 slug 转换
 */

import { slugifyStr } from "./slugify";

/**
 * 分类图片 URL 映射类型
 *
 * key: 分类的 slug 或原始名称
 * value: 图片的完整 URL
 */
export type CategoryImageMap = Record<string, string>;

/**
 * 分类图片 URL 映射表
 *
 * 每个分类配置一张封面图
 * 图片存储在腾讯云 COS CDN 上
 */
export const CATEGORY_IMAGE_URLS: CategoryImageMap = {
  技术: "https://cos.lhasa.icu/dist/images/categories/3ca.jpg",
  生活: "https://cos.lhasa.icu/dist/images/categories/c7a.jpg",
};

/**
 * 根据分类名称或 slug 获取图片 URL
 *
 * 支持两种输入格式：
 * 1. 中文分类名（如 "技术"）
 * 2. URL slug 格式（如 "ji-shu"）
 *
 * 查找顺序：
 * 1. 先尝试将输入转换为 slug 并查找
 * 2. 如果未找到，尝试直接用原始输入查找
 *
 * @param nameOrSlug - 分类名称或 slug
 * @returns 图片 URL，未找到则返回 undefined
 *
 * @example
 * // 使用中文分类名
 * getCategoryImageUrl("技术")
 * // 返回："https://cos.lhasa.icu/dist/images/categories/3ca.jpg"
 *
 * @example
 * // 使用 slug
 * getCategoryImageUrl("ji-shu")
 * // 返回："https://cos.lhasa.icu/dist/images/categories/3ca.jpg"
 *
 * @example
 * // 不存在的分类
 * getCategoryImageUrl("不存在的分类")
 * // 返回：undefined
 */
export function getCategoryImageUrl(nameOrSlug?: string): string | undefined {
  if (!nameOrSlug) return undefined;

  // 先尝试将输入转换为 slug 并查找
  const slug = slugifyStr(nameOrSlug);
  return CATEGORY_IMAGE_URLS[slug] || CATEGORY_IMAGE_URLS[nameOrSlug];
}
