/**
 * 站点配置
 *
 * @fileoverview 全站唯一配置入口，包含基础信息、分页、功能开关、第三方服务（评论、统计、CDN 等）。被 Layout、组件与工具函数引用。
 */
export const SITE = {
  // ========== 基础信息 ==========
  /** 站点主域名 URL，用于生成绝对路径和 SEO */
  website: "https://blog.chensoul.cc",

  /** 作者名称，显示在文章元数据和页脚 */
  author: "ChenSoul",

  /** 站点描述，用于 SEO 和页面 meta 标签 */
  desc: "Java、Spring、MicroServices、Architecture、Kubernetes、DevOps",

  /** 站点标题，显示在浏览器标签和页眉 */
  title: "ChenSoul Blog",

  /**
   * Google Search Console 站点验证码
   * 在 Search Console 添加资源时选择「HTML 标签」方式，将 content 值填在此处
   * 留空则不输出 meta 标签
   */
  googleSiteVerification: "702mzR8WJvXKVdS3ergTkQEIWAMuwniGMAIeE6wPRhc",

  /** 是否启用浅色/深色模式切换功能 */
  lightAndDarkMode: true,

  // ========== 分页配置 ==========
  /**
   * 首页文章列表每页显示数量
   * 注意：index 表示首页或列表的第一页
   */
  postPerIndex: 12,

  // ========== 内容生成配置 ==========
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
   * 是否在文章详情页显示"返回"按钮
   * false 表示使用浏览器默认后退行为
   */
  showBackButton: true,

  /**
   * 是否生成 OG 分享图
   *
   * true 时：dev 与 prod 均生成 /og/.../slug.png 并在文章页输出 og:image meta
   */
  ogImage: true,

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

  // ========== UI 显示选项 ==========
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
   * 自定义页脚链接
   *
   * 可在页脚添加额外的自定义链接
   */
  customFooterLink: {
    /** 是否启用自定义链接 */
    enabled: false,
    /** 链接显示文本 */
    text: "Stats",
    /** 链接目标地址 */
    url: "https://stats.chensoul.cc/blog.chensoul.cc",
  },

  /**
   * Artalk 评论
   *
   * server 留空则不初始化评论（不注入脚本）
   */
  artalk: {
    /** 评论后端地址 */
    server: "https://artalk.chensoul.cc",
    /** 站点名称（Artalk 后台创建站点时填写） */
    site: "ChenSoul Blog",
    /** 静态资源：Artalk.js 脚本 URL */
    scriptUrl: "https://cos.chensoul.cc/dist/artalk/Artalk.js",
    /** 静态资源：Artalk.css 样式 URL */
    cssUrl: "https://cos.chensoul.cc/dist/artalk/Artalk.css",
    /** 是否显示点赞 */
    vote: false,
  },

  /**
   * Umami 统计
   *
   * 生产环境且 websiteId、scriptUrl 均非空时才会注入脚本（首屏加载后再加载，减少对 LCP 影响）
   * 留空则关闭统计
   */
  umami: {
    /** 站点 ID（Umami 后台创建网站后获得） */
    websiteId: "2311be4b-ebe4-4a94-9c69-b2e841584d0d",
    /** 统计脚本 URL */
    scriptUrl: "https://umami.chensoul.cc/random-string.js",
  },

  /**
   * 懒加载列表脚本 CDN 地址（文章列表、分类、标签页滚动加载）
   * 留空则使用站点同源 /lazy-list.js
   */
  lazyListJsUrl: "https://cos.chensoul.cc/dist/lazy-list/lazy-list.js",

  /**
   * tocbot 目录：CSS/JS CDN（仅文章页启用 TOC 时按需加载）
   */
  tocbot: {
    cssUrl: "https://cos.chensoul.cc/dist/tocbot/tocbot.min.css",
    jsUrl: "https://cos.chensoul.cc/dist/tocbot/tocbot.min.js",
  },

  // ========== 图片组件配置 ==========
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
   *
   * 由 enabled 控制是否启用：关闭后导航不显示、页面提示未开放。
   * 数据源为 rss-lhasa 或自建服务产出的 JSON（格式：{ items: [{ title, link, published, name?, category?, avatar? }] }，avatar 可为裸文件名，会按 /favicons/ 解析）。
   * @see https://github.com/achuanya/lhasaRSS
   */
  feeds: {
    /** 是否启用邻居页（导航入口 + 页面内容） */
    enabled: true,
    /** 导航与页面内显示名称，避免与「RSS 订阅地址」混淆 */
    navLabel: "邻居",
    /** 聚合数据 JSON 的 URL（绝对地址或根相对路径如 /data/feeds.json），留空则列表无数据 */
    dataSourceUrl: "/data/feeds.json",
    /** 首屏展示条数 */
    initialCount: 10,
    /** 点击「加载更多」每次加载条数 */
    perPage: 10,
    /** 无头像时使用的默认图片 URL */
    fallbackAvatarUrl: "/thumbs/rss.svg",
    /** 相对路径 avatar 使用的 host（如 COS/R2 公网域名），为空则用本站 SITE.website */
    cosHost: "https://cos.chensoul.cc/avatars",
  },
} as const;
