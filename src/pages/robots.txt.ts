/**
 * Robots.txt 端点
 *
 * @fileoverview 生成爬虫规则文件，指导搜索引擎爬虫如何抓取网站
 *
 * 核心逻辑：
 * 1. 允许所有爬虫访问（User-agent: *）
 * 2. 允许抓取所有路径（Allow: /）
 * 3. 指定 Sitemap 位置
 *
 * Robots.txt 规则：
 * - User-agent: * - 适用于所有爬虫
 * - Allow: / - 允许抓取根目录及所有子路径
 * - Sitemap - 告知爬虫网站地图的位置
 *
 * 依赖关系：
 * - 被 /robots.txt 路径访问
 * - 引用 sitemap.xml（构建时由 sitemap-0.xml 重命名，参考 zdyxry）
 */

import type { APIRoute } from "astro";

/**
 * 生成 Robots.txt 内容
 *
 * @param sitemapURL - Sitemap 的完整 URL
 * @returns Robots.txt 文本内容
 */
const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

/**
 * GET 处理函数
 *
 * 生成并返回 Robots.txt 文件
 *
 * @param site - Astro 的 site 配置（SITE.website）
 * @returns Robots.txt 文本响应
 */
export const GET: APIRoute = ({ site }) => {
  // 构建 Sitemap URL
  const sitemapURL = new URL("sitemap.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
