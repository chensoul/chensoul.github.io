/**
 * 动态 OG 图路由
 *
 * @fileoverview 为每篇非草稿文章生成 /og/yyyy/mm/dd/slug.png，仅在生产构建时生成（getStaticPaths 在 DEV 或 ogImage 关闭时返回空）。GET 时调用 generateOgImage 返回 PNG 并带长期缓存头。
 *
 * @see utils/og-image.ts
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "@/utils/og-image";
import { PostUtils } from "@/utils/postUtils";
import { SITE } from "@/config";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!SITE.ogImage || !import.meta.env.PROD) return [];
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map(post => {
    const slug = PostUtils.getPath(
      post.id,
      post.filePath,
      false,
      post.data.date,
      post.data.timezone
    );
    const pubDate = new Date(post.data.date);
    return {
      params: { slug },
      props: { title: post.data.title, pubDate },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, pubDate } = props as { title: string; pubDate: Date };
  const png = await generateOgImage({
    title,
    date: pubDate,
    siteTitle: SITE.title,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
