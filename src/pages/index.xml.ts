import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import getDescription from "@/utils/getDescription";
import { SITE } from "@/config";

/**
 * RSS 订阅源
 *
 * 输出摘要信息（优先 <!-- more --> 前的内容，否则前 N 字符），不输出全文
 */
export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 20);  // 只保留最近 20 篇文章

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    customData: `<language>zh-CN</language>`,
    items: sortedPosts.map(({ data, id, body, filePath }) => {
      const description = getDescription(body ?? "");
      return {
        link: getPath(id, filePath, true, data.date),
        title: data.title,
        description,
        categories: data.categories,
        pubDate: new Date(data.updated ?? data.date),
      };
    }),
  });
}
