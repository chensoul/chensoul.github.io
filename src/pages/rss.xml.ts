/**
 * RSS 订阅端点
 *
 * @fileoverview 生成 RSS 2.0 订阅源，包含最近 10 篇非草稿文章；摘要优先取 <!-- more --> 前内容，否则由 PostUtils.getDescription 截取。
 */
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { PostUtils } from "@/utils/postUtils";
import { SITE } from "@/config";

export async function GET() {
  const posts = PostUtils.getPublishedPosts(await getCollection("blog"));
  const sortedPosts = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 10);

  const iconUrl = `${SITE.website.replace(/\/$/, "")}/favicon.ico`;
  const titleEscaped = SITE.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    customData: `<language>zh-CN</language><image><url>${iconUrl}</url><title>${titleEscaped}</title><link>${SITE.website}</link></image>`,
    items: sortedPosts.map(({ data, id, body, filePath }) => {
      const description = PostUtils.getDescription(body ?? "");
      return {
        link: PostUtils.getPath(id, filePath, true, data.date, data.timezone),
        title: data.title,
        description,
        categories: data.categories,
        pubDate: new Date(data.date),
      };
    }),
  });
}
