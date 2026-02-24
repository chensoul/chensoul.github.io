/**
 * 博客指标统计工具
 *
 * @fileoverview 计算博客运行天数、文章数量和总字数
 *
 * 文件用途：
 * - 提供博客运行数据的统计功能，用于在首页、关于页等位置展示博客信息
 * - 通过运行天数展示博客的创建时长
 * - 通过文章总数展示博客的内容产出
 * - 通过总字数展示博客的内容规模
 *
 * 核心逻辑：
 * 1. 从固定起始日期（2018-08-31）计算到当前日期的运行天数
 * 2. 从内容集合中获取所有非草稿文章，统计文章总数
 * 3. 估算文章总字数：按每篇 1500 字的经验值计算
 * 4. 将总字数转换为"万"单位，保留一位小数
 *
 * 依赖关系：
 * - 被首页、关于页等需要展示博客统计信息的页面调用
 * - 依赖 Astro 的 getCollection API 获取文章数据
 *
 * 注意事项：
 * - 字数统计为估算值，非精确统计
 * - 起始日期硬编码为 2018-08-31，如需修改请更新此日期
 */

import { getCollection } from "astro:content";

/**
 * 博客指标数据接口
 *
 * @property runningDays - 博客运行天数（从 2018-08-31 到当前日期）
 * @property totalPosts - 文章总数（排除草稿）
 * @property totalWords - 总字数（估算值）
 * @property totalWordsInWan - 总字数（万为单位，保留一位小数）
 */
export interface BlogMetrics {
  runningDays: number;
  totalPosts: number;
  totalWords: number;
  totalWordsInWan: string;
}

/**
 * 获取博客运行指标
 *
 * 计算规则：
 * 1. 运行天数：从 2018-08-31 00:00:00 到当前日期的完整天数
 * 2. 文章总数：排除 draft=true 的文章数量
 * 3. 总字数估算：按每篇文章 1500 字计算
 * 4. 总字数（万）：总字数除以 10000，保留一位小数
 *
 * @returns Promise<BlogMetrics> 博客指标对象
 *
 * @example
 * const metrics = await getBlogMetrics();
 * console.log(`运行 ${metrics.runningDays} 天，共 ${metrics.totalPosts} 篇文章，${metrics.totalWordsInWan} 万字`);
 */
export async function getBlogMetrics(): Promise<BlogMetrics> {
  // 博客创建日期：2018年8月31日
  const startDate = new Date("2018-08-31");
  // 当前日期和时间
  const currentDate = new Date();

  /**
   * 计算运行天数
   *
   * 处理步骤：
   * 1. 计算两个日期之间的毫秒数差值
   * 2. 将毫秒转换为天：毫秒数 / (1000毫秒 × 3600秒 × 24小时)
   * 3. 使用 Math.floor 向下取整，得到完整的运行天数
   */
  const timeDiff = currentDate.getTime() - startDate.getTime();
  const runningDays = Math.floor(timeDiff / (1000 * 3600 * 24));

  /**
   * 获取所有非草稿文章
   *
   * 使用 getCollection 的过滤器参数，排除 data.draft = true 的文章
   */
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const totalPosts = posts.length;

  /**
   * 估算文章总字数
   *
   * 估算策略：
   * - 使用经验值：按每篇文章 1500 字估算
   * - 这个值基于中文博客文章的平均长度经验
   */
  let totalWords = posts.length * 1500;

  /**
   * 将总字数转换为"万"单位
   *
   * 处理步骤：
   * 1. 总字数除以 10000，得到以万为单位的数值
   * 2. 使用 toFixed(1) 保留一位小数
   * 3. 返回字符串类型，便于直接渲染到页面
   *
   * @example
   * 12345 字节 → "1.2"
   * 15000 字节 → "1.5"
   */
  const totalWordsInWan = (totalWords / 10000).toFixed(1);

  /**
   * 返回博客指标对象
   *
   * 包含四个字段：
   * - runningDays: 运行天数（数字类型）
   * - totalPosts: 文章总数（数字类型）
   * - totalWords: 总字数（数字类型）
   * - totalWordsInWan: 总字数万单位（字符串类型，如 "12.5"）
   */
  return {
    runningDays,
    totalPosts,
    totalWords,
    totalWordsInWan,
  };
}
