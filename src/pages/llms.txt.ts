import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateLlmsTxt } from "@/utils/llms";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const body = generateLlmsTxt(posts);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
