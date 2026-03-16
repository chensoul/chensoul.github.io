/**
 * 分类元信息
 *
 * @fileoverview 统一维护分类的 slug、显示名、封面图与排序信息。
 */

import { slugifyStr } from "./slugify";

export interface CategoryMeta {
  slug: string;
  name: string;
  image?: string;
  order?: number;
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    slug: "tech",
    name: "技术",
    image: "",
    order: 1,
  },
  {
    slug: "weekly",
    name: "周报",
    image: "",
    order: 2,
  },
  {
    slug: "translation",
    name: "翻译",
    order: 3,
  },
  {
    slug: "wiki",
    name: "知识库",
    order: 4,
  },
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
