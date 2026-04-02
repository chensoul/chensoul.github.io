# Technology Stack

**Analysis Date:** 2026-04-02

## Languages

**Primary:**
- TypeScript - Primary language for all source code in `src/`
- Markdown/MDX - Content files in `content/posts/`, `content/briefs/`, `content/translation/`, `content/wiki/`

**Secondary:**
- Python 3.14 - Scripts for data fetching (`scripts/fetch-keep-run.py`, `scripts/fetch-feeds.py`)
- CSS - Styling with Tailwind CSS v4

## Runtime

**Environment:**
- Node.js >=24.14.0 (specified in `.nvmrc`)
- Required by Astro 6.x and modern Vite

**Package Manager:**
- pnpm 10.33.0
- Lockfile: `pnpm-lock.yaml` present (lockfileVersion 9.0)

## Frameworks

**Core:**
- Astro 6.1.3 - Static site generation framework
- Vite 7.x - Build tool and dev server (bundled with Astro)

**UI/Styling:**
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- PostCSS - CSS processing with custom `font-display: optional` plugin

**Content:**
- MDX 5.0.3 - Markdown with JSX components
- Remark/Rehype - Markdown processing ecosystem

**Testing:**
- None detected - No testing framework configured

**Build/Dev:**
- ESLint 10.x - Linting with `typescript-eslint` and `eslint-plugin-astro`
- Prettier 3.5.3 - Code formatting with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`
- TypeScript 6.x - Type checking
- Pagefind - Static site search (CLI tool)

## Key Dependencies

**Critical:**
- `@astrojs/rss` 4.0.18 - RSS feed generation
- `@astrojs/mdx` 5.0.3 - MDX content support
- `astro-expressive-code` 0.41.7 - Code block syntax highlighting
- `photosuite` 0.2.1-beta - Image gallery component (custom/fork)

**Infrastructure:**
- `dayjs` 1.11.20 - Date parsing and formatting
- `markdown-it` 14.1.1 - Markdown parsing
- `mermaid` 11.14.0 - Diagram rendering
- `@resvg/resvg-js` 2.6.2 - SVG rendering for OG images
- `satori` 0.26.0 - OG image generation
- `sharp` 0.34.2 - Image processing

**Math/Technical Content:**
- `rehype-katex` 7.0.1 - LaTeX math rendering
- `remark-math` 6.0.0 - Math syntax in Markdown

**Optimization:**
- `astro-compressor` 1.3.0 - Gzip/Brotli compression
- `@zokki/astro-minify` 1.1.0 - HTML/CSS minification
- `@critters-rs/astro` 1.2.0 - Critical CSS inlining
- `@tailwindcss/vite` 4.2.2 - Tailwind Vite plugin

## Configuration

**Environment:**
- No `.env` file detected (configuration in `src/config.ts`)
- CI secrets via GitHub Actions: `KEEP_MOBILE`, `KEEP_PASSWORD`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`

**Build Config Files:**
- `astro.config.ts` - Main Astro configuration
- `tsconfig.json` - TypeScript configuration (extends `astro/tsconfigs/strict`)
- `eslint.config.js` - ESLint flat config
- `.prettierrc.mjs` - Prettier configuration
- `postcss.config.mjs` - PostCSS plugins
- `renovate.json` - Dependency update automation

## Platform Requirements

**Development:**
- Node.js >=24.14.0 (`.nvmrc`)
- pnpm 10.x
- macOS/Linux (assumed; scripts use shell commands)

**Production:**
- Static file hosting (any CDN or static host)
- Build output: `dist/` directory
- Deployed to: Likely Cloudflare Pages or similar (based on Cloudflare R2 usage)

---

*Stack analysis: 2026-04-02*
