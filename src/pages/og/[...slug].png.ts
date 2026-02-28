/**
 * 动态 OG 图片路由：参考 https://github.com/zdyxry/zdyxry.github.io (astro 分支)
 * 为每篇文章生成 /og/yyyy/mm/dd/slug.png，构建时静态生成
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "@/utils/og-image";
import { PostUtils } from "@/utils/postUtils";
import { SITE } from "@/config";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!SITE.ogImage || !import.meta.env.PROD) return [];
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => {
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
