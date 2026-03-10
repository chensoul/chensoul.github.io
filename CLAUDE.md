# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **ChenSoul Blog**, a personal technical blog built with Astro 5 + Tailwind CSS 4. It's a static site generator (SSG) setup targeting Chinese tech content (Java, Spring, Microservices, Architecture, Kubernetes, DevOps).

- Package manager: **pnpm**
- Node version: 20+ (see `.nvmrc`)

## Commands

```bash
pnpm dev              # Start local dev server (hot reload, binds to all hosts)
pnpm build            # Type check + build + generate Pagefind search index
pnpm preview          # Preview the production build locally

pnpm lint             # ESLint on .ts and .astro files
pnpm format           # Apply Prettier formatting
pnpm format:check     # Check formatting without writing

pnpm md:check         # Lint Markdown in content/posts/
pnpm md:fix           # Auto-fix Markdown issues
pnpm spell            # Spell check with cspell

pnpm compress-images  # Compress image assets
pnpm convert-to-webp  # Convert images to WebP
```

The `pnpm build` command runs three steps in sequence: `astro check && astro build && pagefind --site dist`.

## Architecture

### Content Collections

Content lives in `content/posts/` organized into three subfolders:
- `tech/` — technical posts
- `translation/` — translated articles
- `life/` — personal/lifestyle posts

Posts are `.md` or `.mdx` files. Files prefixed with `_` are treated as drafts and excluded from builds. The schema is defined in `src/content.config.ts` using Zod.

**Post frontmatter** (key fields):
```yaml
title: "Article Title"
date: 2026-02-26 08:00:00+08:00
tags: [Java, Spring]
categories: [tech]
draft: false          # exclude from build
toc: true             # table of contents
math: false           # KaTeX rendering
mermaid: false        # Mermaid diagrams
comments: false       # Artalk comments
```

### Routing

- Posts: `/posts/{year}/{month}/{day}/{slug}/` — the URL is derived from the `date` field + filename slug
- Dynamic routes use `[...slug]` patterns under `src/pages/posts/`
- Category/tag pages auto-generated under `src/pages/categories/` and `src/pages/tags/`

### Site Configuration

All global settings are in `src/config.ts` as the `SITE` export object — including author info, pagination sizes, enabled features (dark mode, archives, year progress), CDN URLs, external services (Artalk comments, Umami analytics, Pagefind), and social links.

### Post Utilities

`src/utils/postUtils.ts` is the central utility for post data: filtering out drafts/future posts, sorting by date, extracting/counting tags and categories, grouping posts, and generating URL paths.

### Styling

- Tailwind CSS v4 (configured as a Vite plugin, not PostCSS)
- CSS variables for light/dark theming in `src/styles/base.css`
- Theme persisted to `localStorage`, with system preference as fallback
- Path alias `@/` maps to `./src/`

### Markdown Pipeline

Remark/rehype plugins extend markdown rendering:
- **remark-math** + **rehype-katex**: LaTeX math support
- **rehype-slug** + **rehype-autolink-headings**: heading anchors
- **rehype-external-links**: external link handling
- **rehype-wrap-all**: responsive table wrapping
- **rehype-rewrite**: image lazy loading
- **astro-expressive-code**: syntax highlighting with line numbers

### Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Site-wide configuration and feature flags |
| `src/content.config.ts` | Content collection Zod schemas |
| `astro.config.ts` | Build config, integrations, markdown plugins |
| `src/utils/postUtils.ts` | Post filtering, sorting, URL generation |
| `src/layouts/Layout.astro` | Root HTML layout with SEO, analytics |
| `src/layouts/PostDetails.astro` | Article layout with TOC, comments |

## Code Quality

ESLint enforces `no-console` (errors) and flags unused variables unless prefixed with `_`. Prettier uses 80-char line width with Astro and Tailwind plugins. The CI pipeline (`.github/workflows/ci.yml`) runs `lint → format:check → build` on every push and PR.

## Commit Conventions

Follow conventional commits: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`, `docs(scope): ...`, etc.
