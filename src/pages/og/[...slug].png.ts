/**
 * 动态 OG 图路由
 *
 * @fileoverview 为最近的非草稿文章生成 /og/yyyy/mm/dd/slug.png。GET 时调用 generateOgImage 返回 PNG 并带长期缓存头。
 *
 * @see utils/og-image.ts
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "@/utils/og-image";
import { PostUtils } from "@/utils/postUtils";
import { SITE } from "@/config";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!SITE.ogImage) return [];
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return PostUtils.sort(posts)
    .slice(0, SITE.ogImageLimit)
    .map(post => {
      const slug = PostUtils.getPath(
        post.id,
        post.filePath,
        false,
        post.data.date,
        post.data.timezone
      );
      const pubDate = new Date(post.data.date);
      const author = (post.data as { author?: string }).author ?? SITE.author;
      return {
        params: { slug },
        props: { title: post.data.title, pubDate, author },
      };
    });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, pubDate, author } = props as {
    title: string;
    pubDate: Date;
    author: string;
  };
  const png = await generateOgImage({
    title,
    date: pubDate,
    author,
    siteTitle: SITE.title,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
