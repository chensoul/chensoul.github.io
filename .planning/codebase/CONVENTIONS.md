# Coding Conventions

**Analysis Date:** 2026-04-02

## Overview

This is an Astro-based static blog with TypeScript, Tailwind CSS v4, and MDX support. The codebase follows modern TypeScript and Astro conventions with strict type checking.

## Naming Patterns

### Files

- **Astro components**: PascalCase with `.astro` extension (e.g., `src/components/Card.astro`, `src/layouts/Layout.astro`)
- **TypeScript utilities**: camelCase with `.ts` extension (e.g., `src/utils/postUtils.ts`, `src/utils/contentCollections.ts`)
- **Configuration files**: Standard names (`astro.config.ts`, `tsconfig.json`, `eslint.config.js`)
- **CSS files**: lowercase with `.css` extension (e.g., `src/styles/global.css`, `src/styles/base.css`)
- **Content files**: `YYYY-MM-DD-title.md` format in `content/` subdirectories

### Functions

- **Utility functions**: camelCase (e.g., `getPostPath`, `formatFeedDate`, `readContentPage`)
- **Class methods**: camelCase (e.g., `PostUtils.filter`, `PostUtils.sort`)
- **Event handlers**: camelCase with "handle" prefix when explicit (e.g., `handleMermaidClientLogs`)

### Variables

- **Constants**: UPPER_SNAKE_CASE for module-level constants (e.g., `CDN_ORIGIN`, `SITE`, `BLOG_LIKE_COLLECTIONS`)
- **Local variables**: camelCase (e.g., `const title`, `const posts`)
- **Type exports**: PascalCase for interfaces/types (e.g., `BlogLikeEntry`, `Tag`, `Props`)

### Types

- **Interfaces**: PascalCase (e.g., `interface Props`, `interface Tag`)
- **Type aliases**: PascalCase (e.g., `type BlogCardProps`, `type GroupFunction<T>`)
- **Generics**: Single uppercase letters (e.g., `<T>`)

## Code Style

### Formatting

- **Tool**: Prettier with Astro and Tailwind plugins
- **Config**: `prettier-plugin-astro` and `prettier-plugin-tailwindcss`
- **Commands**:
  ```bash
  pnpm format:check  # Check formatting
  pnpm format        # Fix formatting
  ```

### Linting

- **Tool**: ESLint v10 with flat config
- **Config**: `eslint.config.js`
- **Plugins**: `eslint-plugin-astro`, `typescript-eslint`
- **Commands**:
  ```bash
  pnpm lint  # Run ESLint
  ```

### ESLint Rules

```javascript
// eslint.config.js
{
  rules: {
    "no-console": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
}
```

- Unused variables prefixed with `_` are allowed
- Console statements are disallowed (except in development utilities)

## TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

- **Strict mode**: Enabled via `astro/tsconfigs/strict`
- **Path alias**: `@/*` maps to `./src/*`
- **JSX**: React JSX with automatic runtime

## Import Organization

### Import Order (conventional)

1. **Astro built-ins**: `astro:content`, `astro:assets`, etc.
2. **External packages**: `import { defineCollection } from "astro:content"`
3. **Path alias imports**: `import { SITE } from "@/config"`
4. **Relative imports**: `import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"`
5. **Local imports**: `import { getImagesAssetBase } from "./utils/blogImages"`
6. **Type imports**: `import type { BlogLikeEntry } from "@/utils/contentCollections"`

### Path Aliases

- `@/*` → `./src/*` (configured in `tsconfig.json`)

## Error Handling

### Patterns

1. **TypeScript for type safety**: Strict mode catches type errors at compile time
2. **Frontmatter validation**: Zod schemas validate content collection data
   ```typescript
   // src/content.config.ts
   const articleSchema = () => z.object({
     author: z.string().default(SITE.author),
     title: z.string(),
     date: z.union([z.date(), z.string()]).transform(/* ... */),
     // ...
   });
   ```
3. **Null/undefined checks**: Explicit checks before accessing properties
   ```typescript
   const raw = typeof favicon === "string" ? favicon.trim() : "";
   if (!raw) return undefined;
   ```
4. **Try-catch for file operations**:
   ```typescript
   try {
     return fs.existsSync(abs) && fs.statSync(abs).isFile();
   } catch {
     return false;
   }
   ```

## Logging

### Framework

- **Production**: No console logging (ESLint `no-console: error`)
- **Development**: Selective logging in build utilities
- **Astro integration logging**: Muted in production builds (e.g., `quietAstroMermaid.ts`)

### Patterns

- Mute third-party logs in production by wrapping with `void 0&&console.log(...)`
- Use Astro's built-in logger for integration output

## Comments

### When to Comment

1. **File headers**: Describe file purpose with `@fileoverview`
   ```typescript
   /**
    * 博客与文章集合相关工具（原多文件合并：摘要正则、slug、分类元数据、PostUtils、llms.txt 生成）
    *
    * @fileoverview 文章过滤/排序/路径、标签、描述提取、LLMs 站点地图文案
    */
   ```

2. **Function JSDoc**: Document purpose, parameters, and return values
   ```typescript
   /**
    * 文章 URL：`/{collection}/{slug}`（如 `/posts/...`、`/briefs/...`）
    * @param explicitSlug - frontmatter slug
    * @param collection - 内容集合名，与 URL 首段一致
    */
   ```

3. **Inline comments**: Explain non-obvious logic, especially for CDN/URL handling

### JSDoc/TSDoc

- Use JSDoc for exported functions and complex utilities
- Include `@see` links for related documentation
- Document deprecated exports with `@deprecated`

## Function Design

### Size

- **Utilities**: Focused on single responsibility (e.g., `trimUrlSegment`, `formatFeedDate`)
- **Class methods**: 10-30 lines typical
- **Complex functions**: Up to 50 lines with clear internal structure

### Parameters

- **Named parameters**: Use object destructuring for 3+ parameters
- **Defaults**: Provide sensible defaults (e.g., `maxLength: number = 80`)
- **Optional**: Use `?` for optional parameters

### Return Values

- **Type annotations**: Always explicit for exports
- **Union types**: For nullable results (e.g., `string | undefined`)
- **Consistent shapes**: Return objects with consistent structure

## Module Design

### Exports

- **Named exports**: Preferred for tree-shaking
  ```typescript
  export function getAllBlogLike() { ... }
  export class PostUtils { ... }
  export const BLOG_LIKE_COLLECTIONS = [...]
  ```
- **Re-exports**: For module aggregation
  ```typescript
  // src/utils/blogImages/index.ts
  export * from "./cdnUrls";
  export * from "./remarkImages";
  export * from "./rehypeArticleImages";
  ```

### Barrel Files

- Used for grouping related utilities: `src/utils/blogImages/index.ts`
- Enables clean imports: `import { siteImageHref } from "@/utils/blogImages"`

## Astro-Specific Conventions

### Component Structure

```astro
---
// Frontmatter with TypeScript types
export interface Props {
  title?: string;
  openInNewTab?: boolean;
}

// Props destructuring with defaults
const { openInNewTab = true } = Astro.props;
---

<!-- Template -->
<article class="post">
  <slot />
</article>

<style is:global>
  /* Scoped or global styles */
</style>
```

### Script Directives

- `is:inline`: Inline scripts (no bundling)
- `define:vars`: Pass server-side values to client
- `data-astro-rerun`: Re-execute on navigation

### Slot Usage

- Named slots for layout composition: `<slot name="head" />`, `<slot name="after-main" />`
- Slot detection: `Astro.slots.has("after-main")`

## CSS/Tailwind Conventions

### Custom Properties

```css
:root,
[data-theme="light"] {
  --accent: #2563eb;
  --background: #fcfdff;
  --text-primary: #0f172a;
  /* ... */
}
```

### Tailwind v4 Integration

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--text-primary);
  /* Maps CSS vars to Tailwind color palette */
}
```

### Utility-First with Component Classes

- Use Tailwind for layout: `flex flex-col gap-4`
- Custom classes for complex components: `.pcard-inner`, `.post-related-card`
- CSS custom properties for theming: `var(--accent)`, `var(--text-secondary)`

## Content Organization

### Content Collections

Four collections in `content/` directory:
- `posts/` - Technical articles
- `briefs/` - Weekly notes
- `translation/` - Translated articles
- `wiki/` - Knowledge base

### Frontmatter Schema

```yaml
---
author: ChenSoul
title: Article Title
description: Optional description
date: 2026-04-02
tags: ["TypeScript", "Astro"]
categories: ["Development"]
draft: false
slug: custom-url-path
---
```

---

*Convention analysis: 2026-04-02*
