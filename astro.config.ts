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
import expressiveCode, {
  ExpressiveCodeTheme,
  type AstroExpressiveCodeOptions,
} from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import compressor from "astro-compressor";
import { minify } from "@zokki/astro-minify";
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
      "bash,cmd,powershell,ps,sh,shell,zsh,gradle": { frame: "none" },
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
    // Also look for Astro's Responsive Images
    if (node.type === "element" && node.tagName === "img") {
      node.properties = {
        ...node.properties,
        loading: "lazy",
        decoding: "async",
        // fetchpriority: "auto",
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
    photosuite({
      scope: "#article",
      imageBase: "https://cos.lhasa.icu/dist/images/",
      fileDir: true,
    }),
    expressiveCode(expressiveCodeOption),
    mdx(),
    sitemap(sitemapOption),
    minify(),
    // minify({
    //   // Re-enable CSS minification with error recovery to avoid parser crashes
    //   css: { minify: true, errorRecovery: true },
    // }),
    compressor({ gzip: true, brotli: true }),
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
      exclude: ["@resvg/resvg-js"],
    },
  },
  trailingSlash: "never",
  build: {
    format: "file", // generate `page.html` instead of `page/index.html`
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
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
