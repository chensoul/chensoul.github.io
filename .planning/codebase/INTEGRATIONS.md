# External Integrations

**Analysis Date:** 2026-04-02

## APIs & External Services

**CDN/Object Storage:**
- Cloudflare R2 - Object storage for images, CSS, JS assets
  - Endpoint: Configured via `R2_ENDPOINT` secret
  - Bucket: `cos` (accessed via rclone)
  - Public CDN URL: `https://cos.chensoul.cc`

**Fitness Data:**
- Keep (fitness app) - Running data sync
  - Integration: `scripts/fetch-keep-run.py`
  - Auth: `KEEP_MOBILE`, `KEEP_PASSWORD` GitHub secrets
  - Output: `public/data/running.json`

**RSS Aggregation:**
- feeds-aggregator GitHub Action - Aggregates external RSS feeds
  - Source: `public/data/rss.txt`
  - Output: `public/data/feeds.json`
  - Action: `chensoul/feeds-aggregator@main`

## Data Storage

**Databases:**
- None - Static site with JSON data files

**File Storage:**
- Cloudflare R2 via rclone
  - `images/` - Article images
  - `favicons/` - Site favicons
  - `feeds/` - Aggregated feed data
  - `dist/` - Static assets (KaTeX, Artalk, lazy-list.js)
- Local filesystem: `content/` directory for articles

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- None - Static site, no user authentication

**Comment System:**
- Artalk - Self-hosted comment system
  - Server: `https://artalk.chensoul.cc`
  - Site name: "ChenSoul Blog"
  - Assets served from R2 CDN

## Analytics

**Web Analytics:**
- Umami - Self-hosted analytics
  - Website ID: `2311be4b-ebe4-4a94-9c69-b2e841584d0d`
  - Script URL: `https://umami.chensoul.cc/random-string.js`

**Search:**
- Pagefind - Static site search
  - Index built at build time
  - Search data: `dist/pagefind/`

## CI/CD & Deployment

**Hosting:**
- Static site (build output to `dist/`)
- Likely Cloudflare Pages or similar (based on R2 usage)

**CI Pipeline:**
- GitHub Actions
  - `.github/workflows/ci.yml` - Lint, format, build on PR/merge
  - `.github/workflows/fetch-feeds.yml` - Bi-hourly RSS feed aggregation
  - `.github/workflows/fetch-keep-run.yml` - Bi-hourly Keep running data sync

**Dependency Management:**
- Renovate - Automated dependency updates
  - Config: `renovate.json`
  - Strategy: Auto-merge minor/patch updates via PR

## Environment Configuration

**Required env vars (CI only):**
```
KEEP_MOBILE          # Keep app mobile number
KEEP_PASSWORD        # Keep app password
R2_ACCESS_KEY_ID     # Cloudflare R2 access key
R2_SECRET_ACCESS_KEY # Cloudflare R2 secret key
R2_ENDPOINT          # Cloudflare R2 endpoint
```

**Secrets location:**
- GitHub Repository Secrets (Settings → Secrets and variables → Actions)

**Site Configuration:**
- `src/config.ts` - All site settings (no runtime env vars)
- CDN origin: `https://cos.chensoul.cc` (hardcoded)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- GitHub Actions → Keep API (running data)
- GitHub Actions → External RSS feeds (aggregation)

## Content Collections

**Defined Collections (`src/content.config.ts`):**
- `posts` - Technical/life articles (`content/posts/`)
- `briefs` - Weekly updates (`content/briefs/`)
- `translation` - Translated articles (`content/translation/`)
- `wiki` - Knowledge base (`content/wiki/`)

---

*Integration audit: 2026-04-02*
