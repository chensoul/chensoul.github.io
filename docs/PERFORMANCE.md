# 博客性能分析与主要瓶颈

基于构建产物与代码的静态分析（未跑 Lighthouse），主要瓶颈与优化建议如下。

**已实施的优化**（见下文「已做优化」）：
- TOC：tocbot 的 CSS/JS 改为按需注入，进一步移出首屏请求链。
- 字体：站点正文已去掉 `Noto Sans SC` 在线字体切片，回退到系统中文字体，仅保留少量拉丁字体文件。

---

## 一、主要瓶颈概览

| 类型 | 问题 | 影响 | 优先级 |
|------|------|------|--------|
| **CSS 体积** | 首页主 CSS 仍是共享 chunk，但已从约 276KB 降到约 44KB | LCP、FCP、阻塞渲染 | 中 |
| **Mermaid 包** | 文章页启用 mermaid 时加载 ~484KB `mermaid.core.js` + 多图 diagram 子包 | 仅 mermaid 文章首屏 JS 大 | 高 |
| **字体** | 仍有少量拉丁字体文件，但中文正文已不再走 WebFont 子集 | 首屏请求和字体阻塞已明显下降 | 低 |
| **TOC/KaTeX** | 文章页按需加载 tocbot、KaTeX；其中 TOC 已移出首屏请求链 | 有 TOC/公式的文章仍有额外请求 | 中 |
| **构建与压缩** | Brotli 压缩 ~25s、总构建 ~90s | 本地/CI 构建慢 | 低 |

---

## 二、瓶颈详解与建议

### 1. 共享 CSS 仍值得持续控制（中）

- **现象**：首页主 CSS 已从约 276KB 降到约 44KB，但仍是较大的共享样式 chunk。
- **原因**：Tailwind 全量 + 全站组件样式被打进一个共享 chunk，critters 只内联了“关键 CSS”，其余仍通过 `<link>` 加载。
- **建议**：
  - 用 Tailwind 的 **content 白名单** 再收紧，确保只包含实际用到的类，减少未使用样式。
  - 若可行，对“首屏不可见”的页面（如 /search、/running）拆分 CSS，或路由级 code-split，避免首屏为首页却带上全站 CSS 体量。
  - 确认 `@critters-rs/astro` 的 `mergeStylesheets`、`pruneSource` 等是否适合再开一档裁剪（当前 `pruneSource: false` 是为避免误伤）。

### 2. Mermaid 仅在需要的文章加载，但单次体积大（高）

- **现象**：启用 mermaid 的文章会加载 `mermaid.core.CJ6B4ard.js`（~484KB）以及 treemap、cytoscape、各 diagram 等子 chunk（单个体积数十 KB 到上百 KB）。
- **原因**：astro-mermaid 会按需加载，但 mermaid 本身 + 多种图表类型导致单次加载的 JS 仍然很大。
- **建议**：
  - 在内容上**减少不必要的 mermaid 文章**，或仅对“确实需要图表”的文章设 `mermaid: true`。
  - 若 astro-mermaid 支持，可只注册用到的 diagram 类型，减少未使用 diagram 的 chunk。
  - 考虑对 mermaid 块使用 **client:visible** 或 **client:idle**，延后到进入视口或空闲时再加载/渲染，减轻首屏 JS。

### 3. 字体问题已大幅缓解，但 OG 仍依赖本地中文字库（低）

- **现象**：站点页面已去掉中文 WebFont 子集，仅保留少量拉丁字体；`@fontsource/noto-sans-sc` 目前主要用于 OG 图生成。
- **影响**：首页首屏字体请求已显著减少，这一项不再是主要瓶颈。
- **现状**：已用 postcss 将 `font-display: swap` 改为 `fallback`；critters 已关 `preloadFonts`，避免“预加载但未及时用”的警告。
- **建议**：
  - 保持页面侧继续依赖系统中文字体，避免重新引入大量子集文件。
  - 若后续继续优化构建，可评估 OG 图是否需要继续使用当前中文字库方案。

### 4. 文章页按需资源：TOC、KaTeX、photosuite（中）

- **TOC**：启用 `toc: true` 时才加载 tocbot，且 CSS/JS 已改成运行时按需注入。
- **KaTeX**：启用 `math: true` 时通过 preload + onload 加载 CDN 的 KaTeX CSS，无 JS 在首屏（公式由 Expressive Code 或服务端处理则更好）。
- **photosuite**：图片相关样式已改为只有正文里实际存在图片时才注入。
- **评论**：Artalk 已改为接近评论区时才懒加载。
- **建议**：保持当前按需策略；若后续还要继续压，可再看 Mermaid 图表是否还能按视口延后渲染。

### 5. 首页与列表页 JS（中低）

- **现象**：首页还引用了 `_astro/page.S-2RJtHy.js`（约 8KB），体量可接受；YearProgress、BackToTop、BackButton 等已内联，无额外大 chunk。
- **建议**：维持现状；若后续在首页增加重交互，再考虑 code-split 或 client:* 指令。

### 6. 构建与压缩耗时（低）

- **现象**：Brotli 压缩约 25s，总构建约 90s，minify 约 30.5MB → 25.3MB。
- **建议**：CI 中若磁盘/CPU 允许，可保留 gzip + brotli；若需加速，可仅保留 gzip 或降低 brotli 档位；长期可看 astro-compressor 是否支持并行或增量。

### 7. 已做得较好的点

- **Critters**：关键 CSS 内联，首屏渲染路径短。
- **图片**：文章内 img 已 `loading="lazy"`、`decoding="async"`；rehype-rewrite 统一处理。
- **Umami**：已延后到真实交互后才加载，避免拖累 LCP。
- **prefetch**：已关，避免预取加重带宽与解析。
- **HTML**：compressHTML、minify、compressor 已开，输出体积可控。

---

## 三、建议的优化顺序

1. **继续审 Mermaid** → 它仍是重文章页最明显的单项 JS 成本。
2. **继续收共享 CSS** → 虽已明显缩小，但仍有继续裁剪空间。
3. **保持 TOC/评论/搜索的按需策略** → 避免后续改动把它们重新拖回首屏。

如需基于真实访问的 LCP/FCP/TBT 数据再细化，可在部署后对首页和一篇“带 mermaid + TOC”的文章跑一次 Lighthouse（或 WebPageTest），对照上述项逐条验证。
