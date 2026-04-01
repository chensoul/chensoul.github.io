# ChenSoul Blog

**ChenSoul Blog** 是一个基于 **Astro 6 + Tailwind CSS 4** 构建的个人技术博客，面向中文技术内容（Java、Spring、微服务、架构、Kubernetes、DevOps）。

---

## 技术栈

| 类别     | 技术                            |
| -------- | ------------------------------- |
| 框架     | Astro 6.x                       |
| 样式     | Tailwind CSS 4（via Vite 插件） |
| 包管理   | pnpm                            |
| 语言     | TypeScript                      |
| 节点版本 | Node.js 22+                     |
| 构建输出 | 纯静态站点（SSG）               |

---

## 目录结构

```
chensoul.github.io/
├── content/
│   └── posts/           # 文章内容
│       ├── tech/     # 技术日志
│       ├── translation/ # 翻译文章
│       ├── weekly/   # 周报
│       └── wiki/     # 知识整理
├── src/
│   ├── config.ts        # 站点唯一配置入口
│   ├── content.config.ts # Zod schema 内容集合定义
│   ├── components/      # Astro 组件
│   ├── layouts/         # 布局
│   │   ├── Layout.astro          # 根 HTML 布局
│   │   └── PostDetails.astro     # 文章详情布局
│   ├── pages/           # 路由页面
│   ├── styles/          # CSS 样式
│   └── utils/           # postUtils（文章/分类/llms/订阅日期/content/pages）、og-image、quietAstroMermaid
├── public/              # 静态资源
├── scripts/             # 辅助脚本
└── astro.config.ts      # 构建配置
```

---

## 核心集成与插件

### Astro 集成

- `@astrojs/mdx` — MDX 支持
- `@astrojs/rss` — RSS 订阅
- `astro-expressive-code` — 代码语法高亮（One Dark Pro + One Light 主题）
- `astro-mermaid` — Mermaid 图表
- `astro-compressor` — Gzip + Brotli 压缩
- `@zokki/astro-minify` — CSS/HTML 压缩
- `@critters-rs/astro` — CSS Critical Path 内联
- `photosuite` — 图片展示套件

### Markdown Pipeline

- `remark-math` + `rehype-katex` — LaTeX 数学公式
- `rehype-slug` + `rehype-autolink-headings` — 标题锚点
- `rehype-external-links` — 外链处理（`target="_blank"`）
- `rehype-wrap-all` — 响应式表格包裹
- `rehype-rewrite` — 图片懒加载

---

## 内容结构

### 文章 Frontmatter

```yaml
title: "文章标题" # 必填
slug: "custom-url-slug" # 可选，自定义 URL 路径片段（默认取文件名）
description: "文章描述" # 可选，用于 meta description 和 SEO
date: 2026-02-26 08:00:00+08:00 # 必填，决定 URL 日期前缀
tags: [Java, Spring] # 默认 ["Others"]
categories: [tech] # 默认空数组
draft: false # true 则排除构建
math: false # 启用 KaTeX
mermaid: false # 启用 Mermaid
comments: true # 需 SITE.artalk.enabled 为 true 才显示评论；设为 false 可关单篇
favicon: "tech.svg" # 可选，列表/归档用图标（public/favicons/；无 banner 且解析为 /images 实图且非 favicons 时可作 OG 备选）
banner: "01.webp" # 可选，正文横幅图（拼到 public/images/{slug}/，与文章 URL 末段一致；也可写完整 /images/... 或 URL）
```

### 文章 URL 规则

```
/posts/{year}/{month}/{day}/{slug}
```

---

## 第三方服务

| 服务                          | 用途         |
| ----------------------------- | ------------ |
| Artalk (`artalk.chensoul.cc`) | 评论系统     |
| Umami (`umami.chensoul.cc`)   | 访问统计     |
| Pagefind                      | 本地全文搜索 |

在 [`src/config.ts`](./src/config.ts) 中可用 `SITE.artalk.enabled`、`SITE.umami.enabled` 全站开关（与单篇 `comments`、Umami 的 ID/脚本 URL 一并控制是否加载）。
| COS (`cos.chensoul.cc`) | 图片/静态资源 CDN |

---

## SEO 与机器入口

- 自定义 `sitemap.xml`：由 [src/pages/sitemap.xml.ts](./src/pages/sitemap.xml.ts) 动态生成，不依赖 `@astrojs/sitemap`
- `robots.txt`：由 [src/pages/robots.txt.ts](./src/pages/robots.txt.ts) 动态生成，默认指向 `https://blog.chensoul.cc/sitemap.xml`
- `llms.txt`：由 [src/pages/llms.txt.ts](./src/pages/llms.txt.ts) 动态生成，提供简版机器入口
- 页面级索引控制：低价值聚合页使用 `noindex,follow`，文章页、首页、分类页保持可索引
- 结构化数据：文章页输出 `BlogPosting`，首页输出 `WebSite`，其他页面按需输出 `CollectionPage` / `WebPage` / `AboutPage`

---

## 开发命令

```bash
pnpm dev              # 启动开发服务器（热重载，默认 --host 可局域网访问）
pnpm build            # 类型检查 + 构建 + 生成 Pagefind 搜索索引
pnpm preview          # 预览生产构建（构建后本地看效果，通常比 dev 快）

pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式化
pnpm format:check     # 检查格式（不写入）

pnpm md:check         # Markdown Lint 检查
pnpm md:fix           # Markdown 自动修复
pnpm spell            # cspell 拼写检查

pnpm convert-to-webp  # jpg/png → webp（rotate、长边≤1920 后编码，见 scripts/convert-to-webp.mjs）
```

---

## 功能亮点

- ✅ **深色/浅色模式**（持久化到 `localStorage`，系统偏好为 fallback）
- ✅ **OG 图片自动生成**（生产环境，Satori + Sharp 渲染）
- ✅ **计划发布支持**（15 分钟时间容差，避免时区误差）
- ✅ **全文搜索**（Pagefind，离线本地搜索）
- ✅ **数学公式**（KaTeX）
- ✅ **Mermaid 图表**
- ✅ **响应式表格**
- ✅ **返回顶部按钮**

---

## CI/CD

`.github/workflows/ci.yml` 在每次 push/PR 时运行：`lint → format:check → build`

遵循 **Conventional Commits** 规范：

```
feat(scope): ...
fix(scope): ...
chore(scope): ...
docs(scope): ...
```

---

## 许可证

[MIT](./LICENSE)
