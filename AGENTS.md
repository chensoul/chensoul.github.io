# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro-based personal blog.

- `src/`: app source (pages, layouts, components, styles, utilities).
- `content/`: Markdown content; posts are grouped by domain (`tech`, `translation`, `life`), plus standalone pages in `content/pages/`.
- `public/`: static assets (images, thumbs, redirects/headers, generated search index under `public/pagefind/`).
- `scripts/`: asset maintenance scripts (image compression and WebP conversion).
- `.github/workflows/ci.yml`: CI checks for lint, format, and build.

## Build, Test, and Development Commands
Use `pnpm` (lockfile is `pnpm-lock.yaml`).

- `pnpm dev`: run local dev server (`astro dev --host`).
- `pnpm build`: run type/content checks, build site, and generate Pagefind index.
- `pnpm preview`: preview production build locally.
- `pnpm lint`: run ESLint for TS/Astro files.
- `pnpm format:check` / `pnpm format`: check or apply Prettier formatting.
- `pnpm md:check` / `pnpm md:fix`: lint/fix Markdown in `content/posts/**`.

There is no dedicated unit test suite in this repo currently; quality gate is lint + format + build.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; line width: 80; semicolons enabled (`.prettierrc.mjs`).
- Formatting: Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`.
- Linting: ESLint (`eslint.config.js`), including Astro + TypeScript rules.
- Keep filenames and route segments consistent with existing patterns (e.g., `src/pages/categories/[category]/[...page].astro`).
- Content post files should follow date-led names, e.g. `content/posts/tech/YYYY-MM-DD-title.md`.

## Testing Guidelines
- Before opening a PR, run:
  - `pnpm lint`
  - `pnpm format:check`
  - `pnpm build`
- For content-heavy changes, also run `pnpm md:check`.
- Treat build warnings/errors as blockers.

## Commit & Pull Request Guidelines
- Follow observed conventional style: `feat(scope): ...`, `fix(scope): ...`, `chore: ...`, `format`.
- Keep commits focused and atomic (code vs content vs assets).
- PRs should include:
  - clear summary and motivation,
  - linked issue (if any),
  - screenshots or preview notes for UI/content-visible changes,
  - confirmation that CI checks pass.
