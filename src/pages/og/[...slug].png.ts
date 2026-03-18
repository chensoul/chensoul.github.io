import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/config";
import { generateOgImage } from "../../utils/og-image";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return posts.map(post => {
    const date = new Date(post.data.date);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const slugPart = post.data.slug;
    const fullSlug = `${year}/${month}/${day}/${slugPart}`;
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
