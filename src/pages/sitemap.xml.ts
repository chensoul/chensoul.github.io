import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/config";
import { PostUtils } from "@/utils/postUtils";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastmod(value: string): string {
  return value.replace("Z", "+00:00");
}

export const GET: APIRoute = async () => {
  const posts = PostUtils.getPublishedPosts(await getCollection("blog"));
  const sortedPosts = PostUtils.sort(posts);
  const categories = PostUtils.getUniqueCategories(posts);
  const tags = PostUtils.getUniqueTags(posts);

  const latestPostUpdatedAt = sortedPosts[0]
    ? new Date(
        sortedPosts[0].data.updated ?? sortedPosts[0].data.date
      ).toISOString()
    : new Date().toISOString();

  const staticPages = [
    { path: "/", lastmod: latestPostUpdatedAt, priority: "1.00" },
    { path: "/about", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/links", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/posts", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/categories", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/tags", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/search", lastmod: latestPostUpdatedAt, priority: "0.64" },
    { path: "/feeds", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/running", lastmod: latestPostUpdatedAt, priority: "0.80" },
    { path: "/rss.xml", lastmod: latestPostUpdatedAt, priority: "0.48" },
    { path: "/llms.txt", lastmod: latestPostUpdatedAt, priority: "0.48" },
  ];

  const categoryPages = categories.map(category => {
    const categoryPosts = PostUtils.getPostsByCategory(
      posts,
      category.category
    );
    const lastmod = categoryPosts[0]
      ? new Date(
          categoryPosts[0].data.updated ?? categoryPosts[0].data.date
        ).toISOString()
      : latestPostUpdatedAt;

    return {
      path: `/categories/${category.category}`,
      lastmod,
      priority: "0.64",
    };
  });

  const tagPages = tags.map(tagItem => {
    const tagPosts = PostUtils.getPostsByTag(posts, tagItem.tag);
    const lastmod = tagPosts[0]
      ? new Date(
          tagPosts[0].data.updated ?? tagPosts[0].data.date
        ).toISOString()
      : latestPostUpdatedAt;

    return {
      path: `/tags/${tagItem.tag}`,
      lastmod,
      priority: "0.64",
    };
  });

  const postPages = sortedPosts.map(post => ({
    path: PostUtils.getPath(
      post.id,
      post.filePath,
      true,
      post.data.date,
      post.data.timezone,
      post.data.slug
    ),
    lastmod: new Date(post.data.updated ?? post.data.date).toISOString(),
    priority: "0.64",
  }));

  const urls = [...staticPages, ...categoryPages, ...tagPages, ...postPages];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    entry => `  <url>
    <loc>${escapeXml(new URL(entry.path, SITE.website).toString())}</loc>
    <lastmod>${formatLastmod(entry.lastmod)}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
