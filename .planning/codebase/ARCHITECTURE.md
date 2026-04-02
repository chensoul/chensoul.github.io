# Architecture

**Analysis Date:** 2026-04-02

## Pattern Overview

**Overall:** Static Site Generation (SSG) with Astro

**Key Characteristics:**
- File-based routing with Astro's page system
- Content collections for type-safe content management
- Component-based UI architecture
- CSS-in-Scoped-Style with Astro's `<style>` blocks
- Tailwind CSS v4 for utility classes
- Markdown/MDX-first content authoring

## Layers

**Content Layer:**
- Purpose: Store and manage blog posts, briefs, translations, and wiki articles
- Location: `content/`
- Contains: Markdown/MDX files with frontmatter metadata
- Depends on: Astro Content Collections API
- Used by: Page routes and static path generation

**Route/Page Layer:**
- Purpose: Define URL endpoints and render page layouts
- Location: `src/pages/`
- Contains: `.astro` page components and API routes (`.ts`)
- Depends on: Content Collections, Layouts, Components
- Used by: End users via HTTP requests

**Layout Layer:**
- Purpose: Provide reusable page structures and meta tag management
- Location: `src/layouts/`
- Contains: `Layout.astro` (base), `PostDetails.astro`, `ListLayout.astro`
- Depends on: Components, Config
- Used by: Page components

**Component Layer:**
- Purpose: Reusable UI building blocks
- Location: `src/components/`
- Contains: `Card.astro`, `Header.astro`, `Footer.astro`, `ArticleToc.astro`, etc.
- Depends on: Utils, Config
- Used by: Pages and Layouts

**Utility Layer:**
- Purpose: Business logic, data transformation, and helpers
- Location: `src/utils/`
- Contains: `postUtils.ts`, `blogImages/`, `articleTime.ts`, `contentCollections.ts`
- Depends on: Config
- Used by: Pages, Layouts, Components

**Configuration Layer:**
- Purpose: Centralized site settings and build configuration
- Location: Root and `src/`
- Contains: `astro.config.ts`, `src/config.ts`, `src/content.config.ts`
- Used by: All layers

## Data Flow

**Page Request Flow (SSG Build Time):**

1. Astro reads `src/pages/[section]/[...slug].md.ts`
2. `getStaticPaths()` fetches all published posts from content collections
3. For each post, generates a static HTML file at `/{collection}/{slug}`
4. Page component renders with `PostDetails.astro` layout
5. Layout wraps content with `Layout.astro` for meta tags and shell

**Content Authoring Flow:**

1. Author creates Markdown file in `content/posts/` (or `briefs/`, `translation/`, `wiki/`)
2. Frontmatter defines metadata: `title`, `date`, `tags`, `slug`, `banner`, etc.
3. Astro Content Collections validates schema via Zod
4. At build, content is transformed to HTML via Markdown/MDX renderer
5. Images in content are processed by `photosuite` integration

**Image Processing Flow:**

1. Markdown images reference files in `public/images/{post-slug}/`
2. `remarkInjectImageDir` injects image directory from post slug
3. `photosuite` integration processes images with lazy loading and lightbox
4. Production builds use CDN (`https://cos.chensoul.cc/images/`)
5. Development uses local paths

**State Management:**
- No client-side state management (pure static site)
- Theme toggle state persisted in `localStorage`
- Day.js used for client-side date formatting

## Key Abstractions

**BlogLikeEntry:**
- Purpose: Unified type for all content collections (posts, briefs, translation, wiki)
- Examples: `src/utils/contentCollections.ts`, `src/utils/postUtils.ts`
- Pattern: TypeScript union type from Astro Content Collections

**ArticleTime:**
- Purpose: Handle publication/updated time display with timezone support
- Examples: `src/utils/articleTime.ts`
- Pattern: Static class with methods for relative/absolute date formatting

**PostUtils:**
- Purpose: Centralized utilities for post path resolution, tag extraction, filtering
- Examples: `src/utils/postUtils.ts`
- Pattern: Static utility class

**Card Component:**
- Purpose: Unified card UI for posts, briefs, feeds, and wiki articles
- Examples: `src/components/Card.astro`
- Pattern: Polymorphic component with `mode` prop for different data sources

## Entry Points

**Main Site Entry:**
- Location: `src/pages/index.astro`
- Triggers: Homepage request
- Responsibilities: Render four sections (recent posts, briefs, translation, wiki)

**Dynamic Article Route:**
- Location: `src/pages/[section]/[...slug].md.ts`
- Triggers: Article page request
- Responsibilities: Generate static paths, serve Markdown content via API

**OG Image Generation:**
- Location: `src/pages/og/[...slug].png.ts`
- Triggers: Build time for each article
- Responsibilities: Generate social sharing images with Satori

**API Routes:**
- Location: `src/pages/rss.xml.ts`, `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts`
- Triggers: Feed reader or crawler requests
- Responsibilities: Generate XML/TXT feeds

## Error Handling

**Strategy:** Build-time validation with graceful degradation

**Patterns:**
- Content schema validation via Zod in `src/content.config.ts`
- Draft posts filtered out in production builds
- Missing images fall back to defaults (e.g., `/favicons/blank.svg`)
- Missing descriptions auto-generated from content excerpt

## Cross-Cutting Concerns

**Logging:** Not applicable (static site, no server runtime)

**Validation:**
- Zod schemas in `src/content.config.ts` validate all content frontmatter
- TypeScript strict mode in `tsconfig.json`
- ESLint and Prettier for code quality

**Authentication:** Not applicable (public static site)

**SEO:**
- JSON-LD structured data in `src/layouts/Layout.astro`
- Open Graph and Twitter Card meta tags
- Sitemap and RSS feed generation
- `robots.txt` for crawler directives

**Performance:**
- HTML minification via `@zokki/astro-minify`
- Gzip and Brotli compression via `astro-compressor`
- Critical CSS extraction via `critters`
- Image optimization via `photosuite` and Astro Image
- Pagefind for client-side search

---

*Architecture analysis: 2026-04-02*
