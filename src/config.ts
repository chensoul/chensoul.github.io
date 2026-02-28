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
  postPerIndex: 10,

  /**
   * 文章列表翻页时每页显示数量
   * 用于 /posts/[page] 路由的分页
   */
  postPerPage: 10,

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

  // ========== 功能开关 ==========
  /** 是否显示归档页面入口 */
  showArchives: true,

  /**
   * 是否在文章详情页显示"返回"按钮
   * false 表示使用浏览器默认后退行为
   */
  showBackButton: true,

  /**
   * 是否在文章详情页显示页面描述
   */
  showPageDesc: false,

  /**
   * 是否生成 OG 分享图（仅生产环境生效）
   *
   * 生产构建（astro build）时：true 则生成 /og/.../slug.png 并输出 og:image meta
   * 开发环境（astro dev）时：不生成 OG 图、不输出 og:image
   */
  ogImage: false,

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
    scriptUrl: "https://cos.chensoul.cc/dist/umami/random-string.js",
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

    tags: {
      defaultStyle: "l" as "l" | "s" | false,
    },

    loading: {
      lazy: true,

      quality: {
        enabled: true,
      },
    },
  },
} as const;
