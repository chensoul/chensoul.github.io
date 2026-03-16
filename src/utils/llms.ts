import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { PostUtils } from "@/utils/postUtils";
import { getCategoryOrder } from "@/utils/categoryMeta";

function toAbsoluteUrl(path: string): string {
  return new URL(path, SITE.website).toString();
}

function getPostUrl(post: CollectionEntry<"blog">): string {
  return toAbsoluteUrl(
    PostUtils.getPath(
      post.id,
      post.filePath,
      true,
      post.data.date,
      post.data.timezone
    )
  );
}

function getPostDescription(post: CollectionEntry<"blog">): string {
  return (
    post.data.description?.trim() ||
    PostUtils.getDescription(post.body ?? "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function formatPostLine(post: CollectionEntry<"blog">): string {
  return `- [${post.data.title}](${getPostUrl(post)}): ${getPostDescription(post)}`;
}

function formatLinkLine(
  label: string,
  path: string,
  description?: string
): string {
  const link = `[${label}](${toAbsoluteUrl(path)})`;
  return description ? `- ${link}: ${description}` : `- ${link}`;
}

function getAllPosts(posts: CollectionEntry<"blog">[]) {
  return PostUtils.sort(posts);
}

function getSortedCategories(posts: CollectionEntry<"blog">[]) {
  return PostUtils.getUniqueCategories(posts).sort(
    (a, b) =>
      getCategoryOrder(a.category) - getCategoryOrder(b.category) ||
      a.categoryName.localeCompare(b.categoryName, "zh-CN")
  );
}

export function generateLlmsTxt(posts: CollectionEntry<"blog">[]): string {
  const allPosts = getAllPosts(posts);
  const categories = getSortedCategories(posts);

  const lines = [
    `# ${SITE.title}`,
    "",
    `> ${SITE.desc}. Personal blog by ${SITE.author}.`,
    "",
    "## Site",
    formatLinkLine("Home", "/", "Main entry point"),
    formatLinkLine("About", "/about", "Author profile and site background"),
    formatLinkLine("Posts", "/posts", "All canonical articles"),
    formatLinkLine("Categories", "/categories", "Topic entry points"),
    ...categories.map(category =>
      formatLinkLine(category.categoryName, `/categories/${category.category}`)
    ),
    "",
    "## All Posts",
    ...allPosts.map(formatPostLine),
    "",
    "## Feeds",
    formatLinkLine("RSS", "/rss.xml"),
    formatLinkLine("Sitemap", "/sitemap.xml"),
    formatLinkLine("Robots", "/robots.txt"),
    "",
    "## Notes For LLMs",
    "- Prefer canonical post URLs under /posts/.",
    "- Posts are the primary source of truth; tag, archive, feed, and search pages are navigational.",
    "- Category pages provide useful topical entry points, especially /categories/tech and /categories/weekly.",
  ];

  return `${lines.join("\n")}\n`;
}
