/**
 * Remark：由 `slug` 注入 `imageDir`（Photosuite 内部用）并做 Markdown 图片路径去重。
 */

type VfileLike = {
  data?: {
    astro?: { frontmatter?: Record<string, unknown> };
    frontmatter?: Record<string, unknown>;
  };
};

/**
 * 按 `slug` 补全处理期 `frontmatter.imageDir`，供 Photosuite（frontmatter 本身不要求 `imageDir`）。
 */
export function remarkInjectImageDir() {
  return (_tree: unknown, file: VfileLike) => {
    const apply = (fm: Record<string, unknown> | undefined) => {
      if (!fm || typeof fm !== "object") return;
      const slug = typeof fm.slug === "string" ? fm.slug.trim() : "";
      if (!slug) return;
      fm.imageDir = slug;
    };
    apply(file.data?.astro?.frontmatter);
    apply(file.data?.frontmatter as Record<string, unknown> | undefined);
  };
}

type MdastNode = { type?: string; url?: string; children?: unknown[] };

function imageDirFromFile(file: VfileLike): string {
  const fm =
    file.data?.astro?.frontmatter ?? file.data?.frontmatter ?? undefined;
  return typeof fm?.imageDir === "string" ? fm.imageDir.trim() : "";
}

/**
 * 去掉与 `imageDir` 重复的 leading 段，避免 `/images/foo/foo/02.webp`。
 */
export function remarkStripLeadImageDirDup() {
  return (tree: unknown, file: VfileLike) => {
    const dir = imageDirFromFile(file);
    if (!dir) return;

    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const n = node as MdastNode;
      if (n.type === "image" && typeof n.url === "string") {
        let u = n.url.trim();
        if (
          u &&
          !u.startsWith("/") &&
          !/^https?:\/\//i.test(u) &&
          !u.startsWith("../")
        ) {
          u = u.replace(/^\.\//, "");
          const prefix = `${dir}/`;
          let guard = 0;
          while (u.startsWith(prefix) && guard++ < 16) {
            u = u.slice(prefix.length);
          }
          n.url = u;
        }
      }
      const kids = n.children;
      if (Array.isArray(kids)) for (const c of kids) walk(c);
    };
    walk(tree);
  };
}
