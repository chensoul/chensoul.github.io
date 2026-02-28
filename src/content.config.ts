/**
 * Astro 内容集合配置文件
 *
 * @fileoverview 定义博客文章的内容结构和数据验证规则
 *
 * 核心逻辑：
 * - 使用 Astro 的 Content Collections 功能管理 Markdown/MDX 文章
 * - 通过 Zod schema 定义 frontmatter 的类型和验证规则
 * - 使用 glob loader 从指定目录加载所有符合条件的文件
 *
 * 依赖关系：
 * - 被 Astro 构建系统在构建时读取
 * - 生成的类型被所有页面和工具函数使用（getCollection()）
 * - 导入 config.ts 中的 SITE 配置作为默认值
 *
 * @see https://docs.astro.build/en/guides/content-collections/
 */

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

/**
 * 博客文章存放路径
 *
 * 相对于项目根目录，所有文章存放在 content/posts/ 文件夹下
 */
export const BLOG_PATH = "content/posts";

/**
 * 博客内容集合定义
 *
 * 配置 Astro 如何加载和验证博客文章：
 * 1. loader: 使用 glob 模式加载所有 .md 和 .mdx 文件
 * 2. schema: 使用 Zod 定义 frontmatter 的数据结构
 *
 * 排除规则：以 _ 开头的文件不会被加载（如草稿）
 */
const blog = defineCollection({
  /**
   * Glob Loader 配置
   *
   * - pattern: 匹配所有非下划线开头的 .md 和 .mdx 文件
   *            [^_] 表示排除以 _ 开头的文件
   * - base: 指定文章存放的基础路径
   */
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),

  /**
   * Frontmatter Schema 定义
   *
   * 使用 Zod 定义文章前置元数据的结构和验证规则
   * 这会在构建时对每篇文章的 frontmatter 进行类型检查
   */
  schema: () =>
    z.object({
      // ========== 作者信息 ==========
      /**
       * 文章作者
       *
       * 默认使用 config.ts 中的 SITE.author
       * 可在文章 frontmatter 中覆盖
       */
      author: z.string().default(SITE.author),

      /**
       * 文章标题
       *
       * 必填字段，显示在文章列表、详情页和浏览器标签
       */
      title: z.string(),

      // ========== 日期相关 ==========
      /**
       * 文章发布日期
       *
       * 必填字段，支持格式：
       * - date: 2026-02-26 08:00:00+08:00（推荐，带时区）
       * - date: 2024-07-23（仅日期，会按 08:00:00+08:00 解析）
       *
       * 用于：文章列表排序、元数据区显示、SEO
       */
      date: z
        .union([z.date(), z.string()])
        .transform((v) =>
          v instanceof Date ? v : new Date(String(v).replace(" ", "T"))
        ),

      /**
       * 文章最后更新日期
       *
       * 可选字段，用于：
       * - 显示文章的修改时间
       * - SEO（文章更新时间元数据）
       * - 判断文章是否为"最近更新"
       */
      updated: z
        .union([z.date(), z.string()])
        .optional()
        .nullable()
        .transform((v) => {
          if (v == null) return v;
          return v instanceof Date ? v : new Date(String(v).replace(" ", "T"));
        }),

      /**
       * 文章时区
       *
       * 可选字段，用于覆盖全局时区设置
       * 不指定则使用 config.ts 中的 SITE.timezone
       */
      timezone: z.string().optional(),

      // ========== 分类和标签 ==========
      /**
       * 文章标签数组
       *
       * 默认值为 ["Others"]（未分类）
       * 用于：
       * - 文章详情页显示标签
       * - 标签索引页 (/tags)
       * - 标签详情页 (/tags/[tag])
       */
      tags: z.array(z.string()).default(["Others"]),

      /**
       * 文章分类数组
       *
       * 默认为空数组（无分类）
       * 用于：
       * - 文章详情页显示分类
       * - 分类索引页 (/categories)
       * - 分类详情页 (/categories/[category])
       * - 分类在索引页按字母顺序显示
       */
      categories: z.array(z.string()).default([]),

      // ========== 文章属性 ==========
      /**
       * 是否为草稿
       *
       * 可选布尔值，草稿文章：
       * - 不会在构建时生成静态页面
       * - 不会出现在文章列表中
       *
       * 使用方式：在 frontmatter 中设置 draft: true
       */
      draft: z.boolean().optional(),

      // ========== 功能开关 ==========
      /**
       * 是否显示目录
       *
       * 默认为 true，用于：
       * - 在文章右侧/顶部显示文章目录
       * - 帮助读者快速导航到文章的特定部分
       */
      toc: z.boolean().default(true),

      /**
       * 是否启用评论
       *
       * 默认为 false（不显示评论）
       * 设为 true 后会根据配置的评论系统显示评论框
       */
      comments: z.boolean().default(false),

      /**
       * 是否启用数学公式渲染
       *
       * 默认为 false
       * 设为 true 后会加载 KaTeX 库渲染 LaTeX 公式
       */
      math: z.boolean().default(false),

      /**
       * 是否启用 Mermaid 图表渲染
       *
       * 默认为 false
       * 设为 true 后会在该文章页加载 Mermaid 并渲染 ```mermaid 代码块
       */
      mermaid: z.boolean().default(false),

      // ========== SEO 和元数据 ==========
      /**
       * 文章描述（用于 meta description、SEO）
       *
       * 可选，若在 frontmatter 中设置则作为该文章页的 fullDescription 传给 Layout
       */
      description: z.string().optional(),

      /**
       * 规范链接（Canonical URL）
       *
       * 可选字段，用于：
       * - 告诉搜索引擎这是文章的"官方"版本
       * - 处理内容转载或重复发布的情况
       *
       * 例如：如果文章同时发布在多个平台，设置此字段指向原始版本
       */
      canonicalURL: z.string().optional(),

      /**
       * 文章封面图
       *
       * 可选字段，用于：
       * - 文章详情页的头部封面
       * - 文章列表的缩略图
       * - OG 图片生成（如果启用了动态 OG 图片）
       */
      image: z.string().optional(),
    }),
});

/**
 * 内容集合导出
 *
 * Astro 要求导出一个包含所有集合的对象
 * 此处只定义了一个 blog 集合
 *
 * 在页面中使用方式：
 * ```ts
 * import { getCollection } from 'astro:content';
 *
 * const posts = await getCollection('blog');
 * ```
 */
export const collections = { blog };
