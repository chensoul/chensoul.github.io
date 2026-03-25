/**
 * Rehype：正文 `img` 的 CDN、`loading`、缺省 alt。
 */

import { siteImageHref } from "./cdnUrls";

type HastElement = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children?: HastChild[];
};

type HastChild =
  | HastElement
  | { type: string; children?: HastChild[] }
  | unknown;

type HastRoot = { type: "root"; children?: HastChild[] };

function walkRehypeImg(
  node: HastChild | HastRoot | undefined,
  state: { first: boolean }
): void {
  if (!node || typeof node !== "object") return;
  const n = node as Record<string, unknown>;
  if (n.type === "element" && n.tagName === "img" && n.properties) {
    const propsEl = n as HastElement;
    const props: Record<string, unknown> = {
      ...(propsEl.properties as Record<string, unknown>),
      decoding: "async",
    };
    const srcRaw = props.src;
    if (typeof srcRaw === "string" && srcRaw.trim()) {
      props.src = siteImageHref(srcRaw.trim());
    }
    const altRaw = props.alt;
    const altMissing =
      altRaw === undefined || altRaw === null || String(altRaw).trim() === "";
    if (altMissing) {
      const src = String(props.src ?? "");
      const file =
        src
          .split("/")
          .pop()
          ?.replace(/\.(webp|png|jpe?g|gif)$/i, "") ?? "";
      props.alt = file.replace(/[-_]+/g, " ").trim() || "文章配图说明图";
    }
    if (state.first) {
      state.first = false;
      props.fetchpriority = "high";
      props.loading = "eager";
    } else {
      props.loading = "lazy";
    }
    propsEl.properties = props;
  }
  const kids = n.children as HastChild[] | undefined;
  if (Array.isArray(kids)) for (const c of kids) walkRehypeImg(c, state);
}

/** 正文 Markdown 图片：首张 LCP、其余懒加载、缺 alt 补全；`/images/` prod 走 {@link siteImageHref} */
export function rehypeArticleContentImages() {
  return (tree: HastRoot) => {
    walkRehypeImg(tree, { first: true });
  };
}
