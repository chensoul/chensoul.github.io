/**
 * 站点核心配置文件
 *
 * @fileoverview 定义博客的全局配置项，包括站点信息、分页设置、功能开关等
 *
 * 核心逻辑：
 * - 使用 `as const` 确保配置对象为只读类型，防止运行时被意外修改
 * - 所有配置项按功能模块分组，便于维护和扩展
 *
 * 依赖关系：
 * - 被几乎所有组件、布局和页面导入使用
 * - 在构建时被 Astro 读取以生成静态页面
 * - 被 content.config.ts、工具函数等多个模块依赖
 */

/**
 * 站点配置对象
 *
 * 包含博客的全局配置，每个配置项都有其特定用途：
 * - 基础信息：网站 URL、作者、标题等元数据
 * - 分页配置：控制不同列表页的分页大小
 * - 功能开关：控制评论、编辑按钮等功能的启用状态
 * - UI 配置：返回顶部按钮、图片组件等界面相关设置
 */
export const SITE = {
  // ========== 基础信息 ==========
  /** 站点主域名 URL，用于生成绝对路径和 SEO */
  website: "https://blog.chensoul.cc",

  /** 作者名称，显示在文章元数据和页脚 */
  author: "chensoul",

  /** 作者主页/个人资料链接 */
  profile: "https://github.com/chensoul",

  /** 站点描述，用于 SEO 和页面 meta 标签 */
  desc: "Java、Spring、MicroServices、Architecture、Kubernetes、DevOps",

  /** 站点标题，显示在浏览器标签和页眉 */
  title: "ChenSoul Blog",

  /**
   * 默认社交分享图（Open Graph / Twitter Card）
   * 放在 public 下，如 "og.png"；留空则使用 "/og.png"
   * 文章可覆盖为自定义图（见 PostDetails 传 ogImage）
   */
  ogImage: "og.png",

  /** 是否启用浅色/深色模式切换功能 */
  lightAndDarkMode: false,

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
