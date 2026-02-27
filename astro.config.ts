import { SITE } from "./src/config";
import { defineConfig } from "astro/config";
import fs from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import sitemap, { type SitemapOptions } from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeRewrite, { type RehypeRewriteOptions } from "rehype-rewrite";
import rehypeWrapAll from "rehype-wrap-all";
import rehypeExternalLinks from "rehype-external-links";
import mermaid from "astro-mermaid";
import expressiveCode, {
  ExpressiveCodeTheme,
  type AstroExpressiveCodeOptions,
} from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import compressor from "astro-compressor";
import { minify } from "@zokki/astro-minify";
import critters from "@critters-rs/astro";
import photosuite from "photosuite";

// Import custom theme
const themeJsoncString = fs.readFileSync(
  new URL("./theme/mod-min-light.jsonc", import.meta.url),
  "utf-8"
);
const modMinLightTheme = ExpressiveCodeTheme.fromJSONString(themeJsoncString);

// Expressive Code syntax highlighting, https://expressive-code.com/reference/configuration/
const expressiveCodeOption: AstroExpressiveCodeOptions = {
  plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
  themes: ["one-dark-pro", modMinLightTheme],
  themeCssSelector: theme => {
    if (theme.name === "one-dark-pro") {
      return "[data-theme='dark']";
    }
    return "[data-theme='light']";
  },
  defaultProps: {
    wrap: true,
    showLineNumbers: false,
    overridesByLang: {
      "bash,cmd,powershell,ps,sh,shell,zsh": { frame: "none" },
    },
  },
  styleOverrides: {
    codeFontFamily: "var(--font-mono), var(--font-emoji)",
    uiFontFamily: "var(--font-sans), var(--font-emoji)",
    uiFontSize: "0.75rem",
    uiPaddingBlock: "0.15rem",
    uiPaddingInline: "0.4rem",
    borderWidth: "0",
    textMarkers: {
      backgroundOpacity: "33%",
      inlineMarkerBorderWidth: "0.1px",
    },
    frames: {
      editorTabBarBackground: "transparent",
      frameBoxShadowCssValue: "transparent",
      tooltipSuccessBackground: "#6b7280",
    },
  },
};

// Rehype rewrite options, https://github.com/jaywcjlove/rehype-rewrite
const rehypeRewriteOption: RehypeRewriteOptions = {
  rewrite: node => {
    if (node.type !== "element" || !node.properties) return;
    // 图片：懒加载
    if (node.tagName === "img") {
      node.properties = {
        ...node.properties,
        loading: "lazy",
        decoding: "async",
      };
      return;
    }
  },
};

// Sitemap options, https://docs.astro.build/en/guides/integrations-guide/sitemap/
const sitemapOption: SitemapOptions = {
  serialize(item) {
    if (/\/(tags|categories|archives|page|search)/.test(item.url)) {
      item.priority = 0.2;
    } else if (/\/posts\/\d+\/?$/.test(item.url)) {
      item.priority = 0.3;
    } else if (/\/posts\//.test(item.url)) {
      // Main blog page
      item.priority = 0.8;
    } else {
      // Default priority for all other pages
      item.priority = 0.5;
    }

    return item;
  },
};

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    mermaid({
      theme: "base",
      autoTheme: true,
      mermaidConfig: {
        securityLevel: "loose",
      },
    }),
    photosuite({
      scope: '#article',
      imageBase: "https://cos.chensoul.cc/images",
      exif: {
          enabled: false,
          fields: [
            'Model',            // Camera Model
            'LensModel',        // Lens Model
            'FocalLength',      // Focal Length
            'FNumber',          // Aperture
            'ExposureTime',     // Shutter Speed
            'ISO',              // ISO
            'DateTimeOriginal'  // Date Original
          ],
          separator: ' · '      // Separator
        },
    }),
    expressiveCode(expressiveCodeOption),
    mdx(),
    sitemap(sitemapOption),
    minify({
      css: { minify: true, errorRecovery: true },
      // 关闭 SVG 压缩，避免 astro:build:done 时 public 尚未完全复制到 dist 导致 ENOENT
      svg: false,
    }),
    compressor({ gzip: true, brotli: true }),
    critters({
      publicPath: SITE.website,
      external: true,
      mergeStylesheets: true,
      // 禁用字体 preload，避免 "preloaded but not used within a few seconds" 警告
      preloadFonts: false,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }],
      [
        rehypeWrapAll,
        {
          selector: "table",
          wrapper: "div.responsive-table",
        },
      ],
      [rehypeRewrite, rehypeRewriteOption],
    ],
    // Use ExpressiveCode instead of shiki
    syntaxHighlight: false,
    // shikiConfig: {
    //   // For more themes, visit https://shiki.style/themes
    //   themes: { light: "min-light", dark: "night-owl" },
    //   wrap: true,
    // },
  },
  vite: {
    plugins: [tailwindcss()],
    css: {
      postcss: {
        plugins: [
          // 自定义插件：替换 @fontsource 中的 font-display: swap → fallback
          {
            postcssPlugin: "postcss-font-display-fallback",
            Declaration(decl: { prop: string; value: string }) {
              if (decl.prop === "font-display" && decl.value === "swap") {
                decl.value = "fallback";
              }
            },
          },
        ],
      },
    },
    optimizeDeps: {
      include: ["@pagefind/default-ui", "mermaid"],
      exclude: ["@resvg/resvg-js"],
    },
  },
  trailingSlash: "ignore",
  build: {
    format: "file", // generate `page.html` instead of `page/index.html`
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false, // 仅预取 hover 链接，减少首屏请求与带宽
  },
  // image: {
  //   // Used for all Markdown images; not configurable per-image
  //   // Used for all `<Image />` and `<Picture />` components unless overridden with a prop
  //   experimentalLayout: "constrained",
  // },
  // experimental: {
  //   responsiveImages: true,
  //   preserveScriptOrder: true,
  // },
});
