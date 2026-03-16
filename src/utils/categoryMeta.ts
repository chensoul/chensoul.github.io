/**
 * 分类元信息
 *
 * @fileoverview 统一维护分类的 slug、显示名、描述、封面图与排序信息。
 */

import { slugifyStr } from "./slugify";

export interface CategoryMeta {
  slug: string;
  name: string;
  description: string;
  image?: string;
  order?: number;
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    slug: "tech",
    name: "技术",
    description: "Java、Spring、架构、AI 编码工具与工程实践相关内容。",
    image: "",
    order: 1,
  },
  {
    slug: "weekly",
    name: "周报",
    description: "每周在折腾什么、学到什么、分享了什么的周报记录。",
    image: "",
    order: 2,
  },
  {
    slug: "translation",
    name: "翻译",
    description: "整理和翻译过的技术文章与资料。",
    order: 3,
  },
  {
    slug: "wiki",
    name: "知识库",
    description: "偏索引、概念整理和知识沉淀的内容。",
    order: 4,
  },
];

export function getCategoryMeta(nameOrSlug?: string): CategoryMeta | undefined {
  if (!nameOrSlug) return undefined;

  const slug = slugifyStr(nameOrSlug);
  return CATEGORY_META.find(item => item.slug === slug || item.name === nameOrSlug);
}

export function getCategoryImageUrl(nameOrSlug?: string): string | undefined {
  return getCategoryMeta(nameOrSlug)?.image;
}

export function getCategoryDescription(nameOrSlug?: string): string | undefined {
  return getCategoryMeta(nameOrSlug)?.description;
}

export function getCategoryOrder(nameOrSlug?: string): number {
  return getCategoryMeta(nameOrSlug)?.order ?? Number.MAX_SAFE_INTEGER;
}
