import type { APIRoute } from "astro";
import { getAllBlogLike } from "@/utils/contentCollections";
import { generateLlmsTxt, PostUtils } from "@/utils/postUtils";

export const GET: APIRoute = async () => {
  const posts = PostUtils.getPublishedPosts(await getAllBlogLike());
  const body = generateLlmsTxt(posts);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
