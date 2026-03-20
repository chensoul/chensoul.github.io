import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/config";
import { PostUtils } from "@/utils/postUtils";
import { generateOgImage } from "../../utils/og-image";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = PostUtils.getPublishedPosts(await getCollection("blog"));

  return posts.map(post => {
    const date = new Date(post.data.date);
    const fullSlug = PostUtils.getPath(
      post.id,
      post.filePath,
      false,
      post.data.date,
      post.data.timezone
    );
    const author = (post.data as { author?: string }).author ?? SITE.author;

    return {
      params: { slug: fullSlug },
      props: { title: post.data.title, date: date, author },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, date, author } = props as {
    title: string;
    date: Date;
    author: string;
  };

  const png = await generateOgImage({
    title,
    date,
    author,
    siteTitle: SITE.title,
    description: SITE.desc,
  });

  return new Response(Buffer.from(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
