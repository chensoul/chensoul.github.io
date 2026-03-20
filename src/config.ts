/**
 * 站点配置
 *
 * @fileoverview 全站唯一配置入口，包含基础信息、分页、功能开关、第三方服务（评论、统计、CDN 等）。被 Layout、组件与工具函数引用。
 */
export const SITE = {
  website: "https://blog.chensoul.cc",
  author: "ChenSoul",
  description: "Java、Spring、MicroServices、Architecture、Kubernetes、DevOps",
  title: "ChenSoul Blog",

  googleSiteVerification: "702mzR8WJvXKVdS3ergTkQEIWAMuwniGMAIeE6wPRhc",
  bingSiteVerification: "5995FAD202DE5A364D652266E4C4E0E0",

  /** 是否启用浅色/深色模式切换功能 */
  lightAndDarkMode: true,

  /**
   * 首页文章列表每页显示数量
   * 注意：index 表示首页或列表的第一页
   */
  postPerIndex: 10,

  /**
   * 定时文章发布的时间容差（毫秒）
   *
   * 作用：判断一篇文章是否"即将发布"
   * - 如果当前时间 + 容差 > 文章发布时间，则显示该文章
   * - 默认 15 分钟，避免因服务器时间差异导致文章提前显示
   */
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes

  /**
   * 自动生成描述时处理的最大行数
   *
   * 用于从文章内容提取摘要：
   * - 优先查找 <!--more--> 标记
   * - 若未找到，则处理前 N 行内容
   */
  genDescriptionMaxLines: 3,

  /**
   * 当未找到 more 标记时，提取的字符数量
   *
   * 作为自动生成描述的备选方案
   */
  genDescriptionCount: 200,

  /** 是否在顶栏下方显示年度进度条 */
  showYearProgress: true,

  /**
   * HTML 页面的 lang 属性值
   *
   * 影响：
   * - 浏览器的翻译功能
   * - 屏幕阅读器的语言选择
   * - 搜索引擎的语言识别
   */
  lang: "zh-CN",

  /**
   * Open Graph 的 locale 标签
   *
   * 格式：language_TERRITORY（如 zh_CN、en_US）
   * 用于社交媒体分享时显示正确的语言环境
   * @see https://ogp.me/#optional
   */
  langOg: "zh_CN",

  /**
   * 全局默认时区
   *
   * 格式：IANA 时区标识符（如 Asia/Shanghai、Asia/Taipei）
   * 用于统一所有日期时间的显示格式
   * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   */
  timezone: "Asia/Shanghai",

  /**
   * 中国大陆 ICP 备案号
   *
   * 根据中国法律，托管在大陆的网站必须显示备案号
   */
  icp: "",

  /**
   * Open Graph / Twitter 分享图
   *
   * - **enabled**：为 false 时不输出 og:image、twitter:image 及 JSON-LD 中的文章 image
   * - **dynamic**：为 true 时在构建阶段用 Satori 生成 `/og/` 下各路由 PNG，且未传 `ogImage` 时默认图按当前页 URL 指向 `/og/...`；为 false 时不生成 PNG，默认一律用 **defaultImage**
   * - **defaultImage**：相对 `public` 的静态图路径（可写 `images/og.webp` 或 `/images/og.webp`）
   */
  og: {
    enabled: true,
    dynamic: false,
    defaultImage: "https://cos.chensoul.cc/images/og.webp",
  },

  /**
   * 返回顶部按钮配置
   *
   * 控制按钮的显示时机和滚动行为
   */
  backToTop: {
    /**
     * 移动端断点（像素）
     *
     * <= 此宽度时使用移动端优化样式
     */
    mobileBreakpoint: 1024,

    /**
     * 滚动比例阈值
     *
     * 当页面滚动超过此比例（0-1）时显示按钮
     * 0.1 表示滚动 10% 后显示
     */
    showAfterRatio: 0.1,

    /**
     * 最小溢出高度（像素）
     *
     * 当内容超出视口此高度时才启用返回顶部功能
     * 避免在短页面上显示无意义的按钮
     */
    minOverflowPx: 200,

    /**
     * 最小滚动距离（像素）
     *
     * 从顶部向下滚动超过此距离后显示按钮
     */
    minScrollTopPx: 300,
  },

  /**
   * 页脚社交链接（图标 + 链接）
   *
   * icon 需与 SocialIcon 支持的 name 一致：github | rss | twitter | x | linkedin | facebook | mail | telegram | whatsapp | pinterest
   */
  socialLinks: [
    { name: "GitHub", url: "https://github.com/chensoul", icon: "github" },
    { name: "Twitter", url: "https://twitter.com/ichensoul", icon: "twitter" },
    { name: "Telegram", url: "https://t.me/ichensoul", icon: "telegram" },
    { name: "Email", url: "mailto:ichensoul@gmail.com", icon: "mail" },
    { name: "RSS", url: "/rss.xml", icon: "rss" },
  ],

  /**
   * Artalk 评论
   *
   * - **enabled**：为 false 时不渲染评论区、不加载 Artalk 脚本（与单篇 `comments: true` 无关，全局关则整站无评论）
   * - **server** 留空时同样不初始化
   */
  artalk: {
    enabled: false,
    server: "https://artalk.chensoul.cc",
    site: "ChenSoul Blog",
    scriptUrl: "https://cos.chensoul.cc/dist/artalk/Artalk.js",
    cssUrl: "https://cos.chensoul.cc/dist/artalk/Artalk.css",
    vote: false,
  },

  /**
   * Umami 统计
   *
   */
  umami: {
    enabled: false,
    websiteId: "2311be4b-ebe4-4a94-9c69-b2e841584d0d",
    scriptUrl: "https://umami.chensoul.cc/random-string.js",
  },

  lazyListJsUrl: "https://cos.chensoul.cc/dist/lazy-list.js",

  tocbot: {
    cssUrl: "https://cos.chensoul.cc/dist/tocbot/tocbot.min.css",
    jsUrl: "https://cos.chensoul.cc/dist/tocbot/tocbot.min.js",
  },

  /**
   * 图片相关配置
   *
   * 控制项目中所有图片的加载和显示
   */
  imageConfig: {
    imagesUrl: "https://cos.chensoul.cc",
    loading: {
      lazy: true,
    },
  },

  /**
   * 邻居 / Feeds 页（友联博客最新文章聚合，非本站 RSS 订阅地址）
   */
  feeds: {
    enabled: true,
    navLabel: "邻居",
    dataSourceUrl: "/data/feeds.json",
    /** 首屏展示条数 */
    initialCount: 10,
    /** 点击「加载更多」每次加载条数 */
    perPage: 10,
    /** 无头像时使用的默认图片 URL */
    fallbackAvatarUrl: "https://cos.chensoul.cc/thumbs/rss.svg",
    /** 相对路径 avatar 使用的 host（如 COS/R2 公网域名），为空则用本站 SITE.website */
    cosHost: "https://cos.chensoul.cc/avatars",
  },
} as const;
