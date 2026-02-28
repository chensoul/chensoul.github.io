/**
 * 国际化（i18n）语言配置
 *
 * @fileoverview 定义博客的多语言文本内容，支持页面标题、描述、日期格式等
 *
 * 核心逻辑：
 * - 使用 TypeScript 的 typeof 确保所有语言对象结构一致
 * - 每个语言对象包含相同的键，确保切换语言时不会出现字段缺失
 * - 当前启用简体中文（zhCN），其他语言已注释保留
 *
 * 依赖关系：
 * - 被所有页面和布局组件导入使用（import from "@/scripts/lang"）
 * - 通过 _t 变量统一导出当前启用的语言配置
 * - 日期格式化依赖 dayjs 库
 *
 * @see https://day.js.org/docs/en/display/format
 */

import type dayjs from "dayjs";

// ============================================================================
// 英文配置
// ============================================================================

/**
 * 英文语言配置
 *
 * 包含所有页面和组件的英文文本
 */
const _en = {
  // ---------- 页面配置 ----------
  /**
   * 归档页配置
   */
  archives: {
    /** 页面标题 */
    title: "Archives",
    /** 页面描述 */
    desc: "All the articles I've posted.",
  },

  /**
   * 文章列表页配置
   */
  posts: {
    title: "Posts",
    desc: "All the articles I've posted.",
  },

  /**
   * 标签索引页配置
   */
  tags: {
    title: "Tags",
    desc: "All the tags used in posts.",
  },

  /**
   * 标签详情页配置
   */
  tag: {
    /** 标签页标题前缀 */
    title: "Tag: ",
    /**
     * 标签页描述生成函数
     *
     * @param tag - 当前标签名称
     * @returns 包含标签名称的描述文本
     */
    desc: (tag: string) => `All the articles with the tag "${tag}".`,
  },

  /**
   * 分类索引页配置
   */
  categories: {
    title: "Categories",
    desc: "All the categories.",
  },

  /**
   * 分类详情页配置
   */
  category: {
    /** 分类页标题前缀 */
    title: "Category: ",
    /**
     * 分类页描述生成函数
     *
     * @param category - 当前分类名称
     * @returns 包含分类名称的描述文本
     */
    desc: (category: string) =>
      `All the articles in the category "${category}".`,
  },

  /**
   * 关于页配置
   */
  about: {
    title: "About",
  },

  /**
   * 链接页配置
   */
  links: {
    title: "Links",
    desc: "My favorite tools and websites.",
  },

  /**
   * Running 页配置
   */
  running: {
    title: "Running",
    desc: "Running stats and recent activities.",
  },

  /**
   * 搜索页配置
   */
  search: {
    title: "Search",
    desc: "Search any article ...",
  },

  // ---------- 404 页面配置 ----------
  /**
   * 404 错误页配置
   */
  notFoundPage: {
    /** 页面标题（大字提示） */
    title: "You seem to have come to a wasteland where there is no knowledge.",
    /** 返回首页按钮文本 */
    toHome: "Go back home",
    /** 前往搜索页按钮文本 */
    toSearch: "Try searching",
    /** 404 动图 URL */
    images: "https://cos.lhasa.icu/StylePictures/404.gif",
    /** 404 静态图 URL（备用） */
    staticImages: "https://cos.lhasa.icu/StylePictures/404.webp",
  },

  // ---------- 日期格式化配置 ----------
  /**
   * 日期显示格式配置
   *
   * 提供多种日期格式化函数，统一管理站点中的日期显示
   */
  date: {
    /**
     * 短日期格式
     *
     * 用于文章列表、卡片等空间有限的场景
     *
     * @param datetime - dayjs 日期对象
     * @returns 格式化后的短日期字符串（如：Jan 1, 2024）
     */
    shortFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("MMM D, YYYY");
    },

    /**
     * 完整日期格式
     *
     * 用于文章详情页等需要显示完整时间的场景
     *
     * @param datetime - dayjs 日期对象
     * @returns 格式化后的完整日期字符串（如：January 1, 2024 12:00 PM）
     */
    fullFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("MMMM D, YYYY hh:mm A");
    },

    /**
     * 发布日期前缀文本
     *
     * @param strDate - 已格式化的日期字符串
     * @returns 带有"Published:"前缀的文本
     */
    published(strDate: string): string {
      return `Published: ${strDate}`;
    },

    /**
     * 更新日期前缀文本
     *
     * @param strDate - 已格式化的日期字符串
     * @returns 带有"Updated:"前缀的文本
     */
    updated(strDate: string): string {
      return `Updated: ${strDate}`;
    },
  },

  // ---------- 分页配置 ----------
  /**
   * 分页按钮文本配置
   */
  pagination: {
    /** 下一页按钮 */
    next: "Next",
    /** 上一页按钮 */
    previous: "Prev",
  },

  // ---------- 版权信息配置 ----------
  /**
   * 版权和许可信息配置
   */
  license: {
    /** 版权声明前缀 */
    copyright: "Copyright",
    /** 版权声明内容 */
    statement: "All rights reserved",
    /** ICP 备案号（中国大陆特有） */
    icp: "",
  },

  // ---------- 通用文本配置 ----------
  /**
   * 全站通用文本配置
   */
  common: {
    /** 首页（面包屑等） */
    home: "Home",
    /** 返回顶部按钮文本 */
    backToTop: "Back to Top",
    /** 主题切换按钮的 title 属性 */
    themeBtn: "Toggle light & dark mode",
    /** 浅色模式名称 */
    light: "Light",
    /** 深色模式名称 */
    dark: "Dark",
    /** "所有文章"筛选按钮 */
    allPosts: "All Posts",
    /** "最新文章"筛选按钮 */
    recentPosts: "Recent Posts",
    /** "更多"按钮/链接 */
    more: "More",
  },
};

// ============================================================================
// 简体中文配置
// ============================================================================

/**
 * 简体中文语言配置
 *
 * 类型与 en 保持一致，确保所有字段完整
 */
const zhCN: typeof _en = {
  archives: {
    title: "归档",
    desc: "所有文章。",
  },
  posts: {
    title: "文章",
    desc: "我发过的所有文章。",
  },
  tags: {
    title: "标签",
    desc: "文章中使用的所有标签。",
  },
  tag: {
    title: "标签：",
    desc: (tag: string) => `所有带有标签「${tag}」的文章。`,
  },
  categories: {
    title: "分类",
    desc: "所有文章的分类。",
  },
  category: {
    title: "分类：",
    desc: (category: string) => `所有属于分类「${category}」的文章。`,
  },
  about: {
    title: "关于",
  },
  links: {
    title: "链接",
    desc: "我收藏的工具和网站。",
  },
  running: {
    title: "跑步",
    desc: "跑步统计与最近活动。",
  },
  search: {
    title: "搜索",
    desc: "搜索文章 ...",
  },
  notFoundPage: {
    title: " 404，您访问的页面不存在～",
    toHome: "Go back home",
    toSearch: "Try searching",
    images: "https://cos.lhasa.icu/StylePictures/404.gif",
    staticImages: "https://cos.lhasa.icu/StylePictures/404.webp",
  },
  date: {
    shortFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("MMM D, YYYY");
    },
    fullFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("MMMM D, YYYY hh:mm A");
    },
    published(strDate: string): string {
      return `Published: ${strDate}`;
    },
    updated(strDate: string): string {
      return `Updated: ${strDate}`;
    },
  },
  pagination: {
    next: "下一页",
    previous: "上一页",
  },
  license: {
    copyright: "版权所有",
    statement: "保留所有权利",
    icp: "",
  },
  common: {
    home: "首页",
    backToTop: "回到顶部",
    themeBtn: "切换深色模式",
    light: "浅色",
    dark: "深色",
    allPosts: "所有文章",
    recentPosts: "New",
    more: "更多",
  },
};

// ============================================================================
// 其他语言配置（已注释保留）
// ============================================================================

// 繁體中文
/*
const zhHant: typeof _en = {
  archives: {
    title: "歸檔",
    desc: "所有文章。",
  },
  posts: {
    title: "文章",
    desc: "我發過的所有文章。",
  },
  tags: {
    title: "標籤",
    desc: "文章中使用的所有標籤。",
  },
  tag: {
    title: "標籤：",
    desc: (tag: string) => `所有帶有標籤「${tag}」的文章。`,
  },
  categories: {
    title: "分類",
    desc: "所有文章的分類。",
  },
  category: {
    title: "分類：",
    desc: (category: string) => `所有屬於分類「${category}」的文章。`,
  },
  about: {
    title: "關於",
  },
  search: {
    title: "搜尋",
    desc: "搜尋文章 ...",
  },
  notFoundPage: {
    title: "頁面不存在",
    toHome: "回主畫面",
    toSearch: "嘗試搜尋",
  },
  date: {
    shortFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("YYYY/MM/DD");
    },
    fullFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("YYYY/MM/DD hh:mm A");
    },
    published(strDate: string): string {
      return `${strDate} 發佈`;
    },
    updated(strDate: string): string {
      return `${strDate} 更新`;
    },
  },
  pagination: {
    next: "下一頁",
    previous: "上一頁",
  },
  license: {
    copyright: "版權所有",
    statement: "保留所有權利",
  },
  common: {
    backToTop: "回到頂部",
    themeBtn: "切換深色模式",
    allPosts: "所有文章",
    recentPosts: "最新文章",
  },
};
*/

// 日本語 (machine translation)
/*
const ja: typeof _en = {
  archives: {
    title: "アーカイブ",
    desc: "投稿したすべての記事。",
  },
  posts: {
    title: "記事",
    desc: "投稿したすべての記事。",
  },
  tags: {
    title: "タグ",
    desc: "記事で使用されたすべてのタグ。",
  },
  tag: {
    title: "タグ: ",
    desc: (tag: string) => `「${tag}」タグが付いたすべての記事。`,
  },
  categories: {
    title: "カテゴリー",
    desc: "すべてのカテゴリー。",
  },
  category: {
    title: "カテゴリー: ",
    desc: (category: string) => `「${category}」カテゴリーのすべての記事。`,
  },
  about: {
    title: "について",
  },
  search: {
    title: "検索",
    desc: "記事を検索",
  },
  notFoundPage: {
    title: "ページが見つかりません",
    toHome: "ホームに戻る",
    toSearch: "検索してみる",
  },
  date: {
    shortFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("YYYY年MM月DD日");
    },
    fullFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("YYYY年MM月DD日 HH:mm");
    },
    published(strDate: string): string {
      return `公開日: ${strDate}`;
    },
    updated(strDate: string): string {
      return `更新日: ${strDate}`;
    },
  },
  pagination: {
    next: "次へ",
    previous: "前へ",
  },
  license: {
    copyright: "Copyright",
    statement: "All rights reserved",
  },
  common: {
    backToTop: "トップに戻る",
    themeBtn: "ライト/ダークモード切替",
    allPosts: "すべての記事",
    recentPosts: "最新記事",
  },
};
*/

// cspell:disable
// Español (machine translation)
/*
const es: typeof _en = {
  archives: {
    title: "Archivos",
    desc: "Todos los artículos que he publicado.",
  },
  posts: {
    title: "Artículos",
    desc: "Todos los artículos que he publicado.",
  },
  tags: {
    title: "Etiquetas",
    desc: "Todas las etiquetas utilizadas en los artículos.",
  },
  tag: {
    title: "Etiqueta: ",
    desc: (tag: string) => `Todos los artículos con la etiqueta "${tag}".`,
  },
  categories: {
    title: "Categorías",
    desc: "Todas las categorías.",
  },
  category: {
    title: "Categoría: ",
    desc: (category: string) =>
      `Todos los artículos en la categoría "${category}".`,
  },
  about: {
    title: "Acerca de",
  },
  search: {
    title: "Buscar",
    desc: "Buscar cualquier artículo ...",
  },
  notFoundPage: {
    title: "Página no encontrada",
    toHome: "Volver a inicio",
    toSearch: "Intenta buscar",
  },
  date: {
    shortFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("DD/MM/YYYY");
    },
    fullFormat(datetime: dayjs.Dayjs): string {
      return datetime.format("DD/MM/YYYY HH:mm");
    },
    published(strDate: string): string {
      return `Publicado: ${strDate}`;
    },
    updated(strDate: string): string {
      return `Actualizado: ${strDate}`;
    },
  },
  pagination: {
    next: "Siguiente",
    previous: "Anterior",
  },
  license: {
    copyright: "Copyright",
    statement: "All rights reserved",
  },
  common: {
    backToTop: "Volver arriba",
    themeBtn: "Alternar modo claro/oscuro",
    allPosts: "Todos los artículos",
    recentPosts: "Artículos recientes",
  },
};
*/
// cspell:enable

// ============================================================================
// 语言选择导出
// ============================================================================

/**
 * 当前启用的语言配置
 *
 * 切换语言时，修改此导出即可
 * - zhCN: 简体中文（当前启用）
 * - zhHant: 繁体中文（已注释）
 * - en: 英文（已注释）
 * - ja: 日语（已注释）
 * - es: 西班牙语（已注释）
 */
// export const _t = zhHant;
export const _t = zhCN;
