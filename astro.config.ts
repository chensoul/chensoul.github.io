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
      "bash,cmd,powershell,ps,sh,shell,zsh,gradle,java": { frame: "none" },
    },
  },
  styleOverrides: {
    codeFontFamily: "var(--font-mono), var(--font-emoji)",
    uiFontFamily: "var(--font-sans), var(--font-emoji)",
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
    // 链接：统一在新标签页打开（文章与页面正文内）
    if (node.tagName === "a") {
      node.properties = {
        ...node.properties,
        target: "_blank",
        rel: "noopener noreferrer",
      };
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
      theme: "default",
      autoTheme: true,
      mermaidConfig: {
        securityLevel: "loose",
      },
    }),
    expressiveCode(expressiveCodeOption),
    mdx(),
    sitemap(sitemapOption),
    minify({
      css: { minify: true, errorRecovery: true },
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
      include: ["@pagefind/default-ui"],
      exclude: ["@resvg/resvg-js"],
    },
  },
  trailingSlash: "never",
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
