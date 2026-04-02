# Testing Patterns

**Analysis Date:** 2026-04-02

## Test Framework

### Current State

**No formal testing framework detected.**

The codebase currently has:
- No Jest, Vitest, or other test runner configured
- No test files (`.test.ts`, `.spec.ts`, `.test.astro`, etc.)
- No testing-related dependencies in `package.json`

### Quality Assurance Approach

Instead of automated tests, the project relies on:

1. **TypeScript Strict Mode**: Catches type errors at compile time
2. **ESLint**: Enforces code quality rules
3. **Prettier**: Ensures consistent formatting
4. **Manual verification**: Build and preview commands

## Build-Time Checks

### Available Commands

```bash
# Type checking
pnpm astro check

# Linting
pnpm lint

# Format verification
pnpm format:check

# Markdown linting
pnpm md:check        # Check markdown files
pnpm md:fix          # Fix markdown issues

# Spell checking
pnpm spell           # Run cspell

# Build verification
pnpm build           # Full production build
```

### Astro Check

```json
// package.json scripts
"astro": "astro",
"sync": "astro sync",
```

Run `astro check` for:
- TypeScript type validation
- Astro template type checking
- Import resolution verification

## Content Validation

### Zod Schemas for Frontmatter

Content collections use Zod schemas for runtime validation:

```typescript
// src/content.config.ts
const articleSchema = () =>
  z.object({
    author: z.string().default(SITE.author),
    title: z.string(),
    description: z.string().optional(),
    date: z
      .union([z.date(), z.string()])
      .transform(v =>
        v instanceof Date ? v : new Date(String(v).replace(" ", "T"))
      ),
    tags: z.array(z.string()).default(["Others"]),
    // ... more fields
  });
```

This provides:
- Type-safe frontmatter
- Default values for optional fields
- Date parsing and normalization
- Required field enforcement

## Manual Testing Workflow

### Development Server

```bash
pnpm dev
```

- Hot module replacement enabled
- Local network accessible (`--host`)
- Real-time content updates

### Preview Production Build

```bash
pnpm build
pnpm preview
```

- Tests full build pipeline
- Verifies production optimizations
- Checks redirect configurations

## Markdown Quality

### Markdown Linting

```bash
# Check markdown files
pnpm md:check  # Runs markdownlint-cli2

# Auto-fix issues
pnpm md:fix
```

Configuration likely in `markdownlint-cli2` config file.

### Spell Checking

```bash
pnpm spell  # Runs cspell with custom config
```

Catches typos in:
- Article content
- Code comments
- Configuration files

## Image Handling

### Image Conversion Script

```bash
pnpm convert-to-webp  # Run custom script
```

Converts images to WebP format for optimization.

## Recommendations for Future Testing

### Unit Testing Setup (Recommended)

If testing is added in the future, consider:

```bash
# Install Vitest (recommended for Vite/Astro)
pnpm add -D vitest @vitest/ui

# Add to package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Testable Units

Priority candidates for unit tests:

1. **Utility functions** (`src/utils/postUtils.ts`):
   - `PostUtils.getPath()` - URL generation logic
   - `PostUtils.getDescription()` - Markdown parsing
   - `PostUtils.getPlainTextDescription()` - Text extraction
   - `PostUtils.resolveBlogImageRef()` - URL resolution
   - `formatFeedDate()` - Date formatting

2. **Content utilities** (`src/utils/contentCollections.ts`):
   - `generateLlmsTxt()` - Text generation
   - `readContentPage()` - File parsing

3. **Redirect builder** (`src/legacyRedirects.ts`):
   - `buildLegacyPostsRedirects()` - Path mapping

4. **Image utilities** (`src/utils/blogImages/`):
   - CDN URL generation
   - Path resolution logic

### Example Test Structure

```typescript
// src/utils/__tests__/postUtils.test.ts
import { describe, it, expect } from 'vitest';
import { PostUtils } from '../postUtils';

describe('PostUtils', () => {
  describe('getPath', () => {
    it('should generate correct URL from slug', () => {
      const result = PostUtils.getPath(
        'posts/test-post.md',
        'content/posts/test-post.md',
        true,
        new Date('2026-04-02'),
        undefined,
        'custom-slug',
        'posts'
      );
      expect(result).toBe('/posts/custom-slug');
    });
  });

  describe('getDescription', () => {
    it('should extract content before more tag', () => {
      const content = 'First paragraph.<!-- more -->Rest of content';
      const result = PostUtils.getDescription(content);
      expect(result).toBe('First paragraph.');
    });
  });
});
```

### Integration Testing

Consider testing:
- RSS feed generation (`/rss.xml`)
- Sitemap generation (`/sitemap.xml`)
- OG image generation (`/og/[...slug].png.ts`)
- Content collection queries

### E2E Testing

For critical user flows:
- Article page rendering
- Navigation between pages
- Search functionality
- Comment system (Artalk)

## Coverage

**Current coverage:** Not applicable (no tests configured)

### Future Coverage Goals

If testing is implemented:

| Category | Target | Priority |
|----------|--------|----------|
| Utility functions | 80%+ | High |
| Content processing | 70%+ | High |
| API routes | 60%+ | Medium |
| Astro components | 40%+ | Low |

## Test Data

### Recommended Fixtures

If testing is added, create fixtures for:

```typescript
// src/__fixtures__/posts.ts
export const mockPost = {
  id: 'posts/test-post.md',
  filePath: 'content/posts/test-post.md',
  collection: 'posts' as const,
  data: {
    title: 'Test Post',
    date: new Date('2026-04-02'),
    tags: ['Test', 'Example'],
    // ...
  },
  body: 'Test content...',
};
```

## Continuous Integration

### Current CI Checks

Based on package.json scripts, CI likely runs:
```bash
pnpm lint
pnpm format:check
pnpm astro check
pnpm build
```

### Recommended CI Additions

```yaml
# Add to CI workflow
- name: Run tests
  run: pnpm test:run

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

*Testing analysis: 2026-04-02*
