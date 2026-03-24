import type { GetStaticPaths, APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { getCategoryMeta, PostUtils } from "@/utils/postUtils";

interface Props {
  post: CollectionEntry<"blog">;
}

function getCanonicalUrl(post: CollectionEntry<"blog">): string {
  if (post.data.canonicalURL?.trim()) {
    return post.data.canonicalURL.trim();
  }

  return new URL(
    PostUtils.getPath(
      post.id,
      post.filePath,
      true,
      post.data.date,
      post.data.timezone,
      post.data.slug
    ),
    SITE.website
  ).toString();
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = PostUtils.getPublishedPosts(await getCollection("blog"));

  return posts.map(post => ({
    params: {
      slug: PostUtils.getPath(
        post.id,
        post.filePath,
        false,
        post.data.date,
        post.data.timezone,
        post.data.slug
      ),
    },
    props: { post },
  }));
};

export const GET: APIRoute<Props> = ({ props }) => {
  const { post } = props;
  const categories =
    post.data.categories.length > 0
      ? post.data.categories
          .map(category => getCategoryMeta(category)?.name ?? category)
          .join(", ")
      : "Uncategorized";
  const tags = post.data.tags.length > 0 ? post.data.tags.join(", ") : "None";
  const description =
    post.data.description?.trim() || PostUtils.getDescription(post.body ?? "");
  const body = (post.body ?? "").trim();
  const content = [
    `# ${post.data.title}`,
    "",
    `Canonical URL: ${getCanonicalUrl(post)}`,
    `Published At: ${new Date(post.data.date).toISOString()}`,
    `Categories: ${categories}`,
    `Tags: ${tags}`,
    `Description: ${description}`,
    "",
    body || "_No content_",
    "",
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
    },
  });
};
