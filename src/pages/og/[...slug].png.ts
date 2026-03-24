import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/config";
import { getCategoryOrder, PostUtils } from "@/utils/postUtils";
import { generateOgImage } from "@/utils/og-image";

interface StaticPageMetaModule {
  pageSlug?: string;
  pageTitle?: string;
  pageDescription?: string;
  getPageMeta?: () => {
    title: string;
    description?: string;
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (!SITE.og.enabled || !SITE.og.dynamic) {
    return [];
  }

  const posts = PostUtils.getPublishedPosts(await getCollection("blog"));
  const articlePosts = posts.filter(post => post.data.date);
  const categories = PostUtils.getUniqueCategories(posts).sort(
    (a, b) =>
      getCategoryOrder(a.category) - getCategoryOrder(b.category) ||
      a.categoryName.localeCompare(b.categoryName, "zh-CN")
  );
  const tags = PostUtils.getUniqueTags(posts).sort(
    (a, b) => b.count - a.count || a.tagName.localeCompare(b.tagName, "zh-CN")
  );
  const pageModules = import.meta.glob<StaticPageMetaModule>("../**/*.astro", {
    eager: true,
  });
  const staticPages = Object.values(pageModules)
    .map(module => {
      const pageMeta = module.getPageMeta?.();
      return {
        slug: module.pageSlug?.trim(),
        title: pageMeta?.title?.trim() ?? module.pageTitle?.trim(),
        description:
          pageMeta?.description?.trim() ?? module.pageDescription?.trim(),
      };
    })
    .filter(page => page.slug && page.title)
    .map(page => ({
      slug: page.slug!,
      title: page.title!,
      description: page.description,
    }));

  const pageEntries = [
    ...staticPages,
    ...categories.map(category => ({
      title: category.categoryName,
      description: SITE.description,
      slug: `categories/${category.category}`,
    })),
    ...tags.map(tag => ({
      title: tag.tagName,
      description: SITE.description,
      slug: `tags/${tag.tag}`,
    })),
  ];

  return [
    ...articlePosts.map(post => {
      const date = new Date(post.data.date);
      const fullSlug = PostUtils.getPath(
        post.id,
        post.filePath,
        false,
        post.data.date,
        post.data.timezone,
        post.data.slug
      );
      const author = (post.data as { author?: string }).author ?? SITE.author;

      return {
        params: { slug: fullSlug },
        props: {
          title: post.data.title,
          description:
            post.data.description?.trim() ||
            PostUtils.getDescription(post.body ?? ""),
          date,
          author,
        },
      };
    }),
    ...pageEntries.map(entry => ({
      params: { slug: entry.slug },
      props: {
        title: entry.title,
        description: entry.description,
        author: SITE.author,
      },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, author } = props as {
    title: string;
    description?: string;
    author: string;
  };

  const png = await generateOgImage({
    title,
    author,
    siteTitle: SITE.title,
    description: description?.trim() || SITE.description,
  });

  return new Response(Buffer.from(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
