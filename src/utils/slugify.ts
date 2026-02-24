/**
 * URL Slug 生成工具
 *
 * @fileoverview 将字符串转换为 URL 友好的 slug 格式
 *
 * 核心逻辑：
 * - 使用 lodash.kebabcase 将字符串转换为 kebab-case 格式
 * - kebab-case 规则：小写、单词间用连字符连接、移除特殊字符
 * - 例如：'Hello World' → 'hello-world', '测试中文' → 'ce-shi-zhong-wen'
 *
 * 依赖关系：
 * - 被 getPath、getUniqueTags、getUniqueCategories 等工具函数调用
 * - 用于生成分类页、标签页的 URL 路径
 *
 * @see https://lodash.com/docs/4.17.15#kebabCase
 */

import kebabcase from "lodash.kebabcase";

/**
 * 将单个字符串转换为 slug 格式
 *
 * 转换规则：
 * - 大写字母 → 小写
 * - 空格/特殊字符 → 连字符（-）
 * - 中文字符 → 拼音（由 kebabcase 处理）
 *
 * @param str - 原始字符串
 * @returns slug 格式的字符串
 *
 * @example
 * slugifyStr("Hello World") // "hello-world"
 * slugifyStr("前端开发") // "qian-duan-kai-fa"
 */
export const slugifyStr = (str: string) => kebabcase(str);

/**
 * 批量转换字符串数组为 slug 格式
 *
 * @param arr - 字符串数组
 * @returns 每个元素都转换成 slug 格式的新数组
 *
 * @example
 * slugifyAll(["React", "Vue.js", "Angular"])
 * // ["react", "vue-js", "angular"]
 */
export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
