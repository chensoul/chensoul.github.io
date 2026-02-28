/**
 * Sitemap 端点
 *
 * @fileoverview 生成 sitemap.xml，开发与构建时均可访问
 *
 * 与 @astrojs/sitemap 的 priority 逻辑一致，单文件输出，无需构建后重命名。
 */

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/config";
import { PostUtils } from "@/utils/postUtils";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function urlEntry(loc: string, lastmod?: string, priority?: number): string {
  const locEl = `<loc>${escapeXml(loc)}</loc>`;
  const lastmodEl = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  const priorityEl = priority != null ? `<priority>${priority}</priority>` : "";
  return `<url>${locEl}${lastmodEl}${priorityEl}</url>`;
}

export const GET: APIRoute = async ({ site }) => {
  const siteStr = typeof site === "string" ? site : (site instanceof URL ? site.href : SITE.website);
  const base = siteStr.replace(/\/$/, "");
  const entries: string[] = [];

  // 静态页面（与 astro.config 中 serialize 的 priority 一致）
  const staticPages: { path: string; priority: number }[] = [
    { path: "", priority: 0.5 },
    { path: "about", priority: 0.5 },
    { path: "categories", priority: 0.2 },
    { path: "tags", priority: 0.2 },
    { path: "archives", priority: 0.2 },
    { path: "search", priority: 0.2 },
    { path: "links", priority: 0.5 },
    { path: "running", priority: 0.5 },
    { path: "posts", priority: 0.8 },
  ];
  for (const { path, priority } of staticPages) {
    entries.push(urlEntry(`${base}/${path || ""}`, undefined, priority));
  }

  // 文章列表
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const sortedPosts = PostUtils.sort(posts);
  for (const post of sortedPosts) {
    const path = PostUtils.getPath(post.id, post.filePath, true, post.data.date, post.data.timezone);
    const lastmod = (post.data.updated ?? post.data.date) instanceof Date
      ? (post.data.updated ?? post.data.date).toISOString().slice(0, 10)
      : new Date(post.data.updated ?? post.data.date).toISOString().slice(0, 10);
    entries.push(urlEntry(`${base}${path}`, lastmod, 0.8));
  }

  // 分类页
  const categories = PostUtils.getUniqueCategories(posts);
  for (const { category } of categories) {
    entries.push(urlEntry(`${base}/categories/${category}`, undefined, 0.2));
  }

  // 标签页
  const tags = PostUtils.getUniqueTags(posts);
  for (const { tag } of tags) {
    entries.push(urlEntry(`${base}/tags/${tag}`, undefined, 0.2));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
