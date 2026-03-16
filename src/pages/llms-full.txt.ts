import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateLlmsFullTxt } from "@/utils/llms";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const body = generateLlmsFullTxt(posts);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
