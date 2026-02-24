/**
 * 文章描述生成工具
 *
 * @fileoverview 从 Markdown 内容中提取或生成文章描述
 *
 * 文件用途：
 * - 为博客文章生成适合展示的纯文本描述
 * - 支持从 Markdown 正文自动提取摘要，无需手动编写 description 字段
 * - 清理 Markdown 语法，生成适合在列表页、RSS 订阅源等场景显示的纯文本
 *
 * 核心逻辑：
 * 1. 优先使用 `<!-- more -->` 标签之前的内容作为描述（作者可控的摘要分割点）
 * 2. 若无 more 标签，取前 N 个字符作为描述（N 由 SITE.genDescriptionCount 配置）
 * 3. 移除各种 Markdown 语法标记：
 *    - 标题标记（# ## ###）
 *    - 文本格式（*粗体* _斜体_ ~~删除线~~）
 *    - 链接和图片语法
 *    - 代码块（行内代码和代码块）
 *    - LaTeX 公式（行内和块级）
 *    - 引用、水平线等
 * 4. 限制处理的行数，避免处理超长文章导致性能问题
 *
 * 依赖关系：
 * - 被文章详情页、RSS 订阅源生成等需要获取描述的场景调用
 * - 依赖 SITE 配置中的 genDescriptionMaxLines（最大处理行数）和 genDescriptionCount（默认字符数）
 *
 * 使用场景：
 * - 文章列表页的卡片摘要
 * - SEO meta description 标签
 * - RSS 订阅源的 description 字段
 * - 社交媒体分享时的描述文本
 */

import { SITE } from "@/config";

/**
 * `<!-- more -->` 标签的正则表达式
 *
 * 匹配规则：
 * - ^(...) 匹配字符串开头，捕获任意字符（非贪婪）
 * - <!--\s*more\s*--> 匹配 more 标签，允许标签内有空格
 * - /s 标志使 . 匹配包括换行符在内的所有字符
 *
 * 捕获组：
 * - $1: more 标签之前的内容
 *
 * @example
 * // 输入: "这是摘要\n<!-- more -->\n这是正文"
 * // 匹配结果: $1 = "这是摘要\n"
 */
const tagMoreRegex = /^(.*?)<!--\s*more\s*-->/s;

/**
 * Markdown 语法替换规则映射表
 *
 * 定义了需要移除或替换的 Markdown 语法模式
 * 键名是规则的标识符，值是 [正则表达式, 替换字符串] 的元组
 *
 * 替换规则说明：
 * - $1, $2 等表示正则表达式的捕获组
 * - 空字符串表示完全移除该语法
 * - "$1 " 表示保留内容并添加空格
 */
const regexReplacers: { [key: string]: [RegExp, string] } = {
  // 标题：# Header / ## Header / ### Header ...
  // 移除 # 号，保留标题文本
  header: [/#{1,6} (.*?)/g, "$1 "],

  // 星号格式：*italic* / **bold** / ***bold italic***
  // 移除星号，保留文本
  star: [/\*{1,3}(.*?)\*{1,3}/g, "$1"],

  // 下划线格式：_italic_ / __bold__ / ___bold italic___
  // 移除下划线，保留文本
  underscore: [/_{1,3}(.*?)_{1,3}/g, "$1"],

  // 删除线：~~strikethrough~~
  // 完全移除删除线文本
  strikeout: [/~~~[\s\S]*?~~~/g, ""],

  // 水平线：--- 或 ***
  // 完全移除
  horizontalRule: [/^(-{3,}|\*{3,})$/gm, ""],

  // 引用块：> quote text
  // 移除 > 号，保留引用文本
  quote: [/> (.*?)/g, "$1"],

  // 行内代码：`code`
  // 移除反引号，保留代码文本
  codeInline: [/`(.*?)`/g, "$1"],

  // 代码块：```code```
  // 完全移除代码块
  codeBlock: [/```[\s\S]*?```/g, ""],

  // 行内 LaTeX 公式：$formula$
  // 完全移除
  latexInline: [/\$(.*?)\$/g, ""],

  // 块级 LaTeX 公式：$$formula$$
  // 完全移除
  latexBlock: [/\$\$[\s\S]*?\$\$/g, ""],

  // 行内图片：![alt text](url)
  // 完全移除（图片在文本描述中无意义）
  image1: [/!\[(.*?)\]\((.*?)\)/g, ""],

  // 引用式图片：![alt text][ref]
  // 完全移除
  image2: [/!\[(.*?)\]\[(.*?)\]/g, ""],

  // 行内链接：[link text](url)
  // 移除链接语法，保留链接文本
  link1: [/\[(.*?)\]\((.*?)\)/g, "$1 "],

  // 引用式链接：[link text][ref]
  // 移除链接语法，保留链接文本
  link2: [/\[(.*?)\]\[(.*?)\]/g, "$1 "],

  // 链接引用定义：[ref]: url
  // 完全移除（这些是定义，不是显示内容）
  linkRef: [/\[(.*?)\]: (.*?)/g, ""],
};

/**
 * 从 Markdown 内容中提取文章描述
 *
 * 处理规则：
 * 1. 限制处理的行数（genDescriptionMaxLines），避免处理超长文章
 * 2. 优先使用 `<!-- more -->` 标签之前的内容作为摘要
 * 3. 若无 more 标签，截取前 genDescriptionCount 个字符并添加省略号
 * 4. 遍历 regexReplacers，移除所有 Markdown 语法
 * 5. 返回清理后的纯文本描述
 *
 * @param markdownContent - 原始 Markdown 内容
 * @returns 处理后的纯文本描述
 *
 * @example
 * // 有 more 标签的情况
 * getDescription("这是摘要\n<!-- more -->\n这是正文")
 * // 返回: "这是摘要"
 *
 * @example
 * // 无 more 标签的情况
 * getDescription("这是一段很长的文章内容...", { genDescriptionCount: 10 })
 * // 返回: "这是一段很 ..."（截取前10个字符）
 */
const getDescription = (markdownContent: string): string => {
  /**
   * 步骤1：限制处理的行数
   *
   * 为什么要限制：
   * - 超长文章可能有数千行，处理全部内容会影响性能
   * - 通常摘要在前几段，后续内容对摘要贡献不大
   * - 使用 genDescriptionMaxLines 配置控制处理范围
   *
   * 处理流程：
   * 1. 按换行符分割（兼容 \n 和 \r\n）
   * 2. 只取前 N 行（slice 不会修改原数组）
   * 3. 重新拼接成字符串
   */
  const lines = markdownContent
    .split(/\r?\n/) // 兼容 Unix (\n) 和 Windows (\r\n) 换行符
    .slice(0, SITE.genDescriptionMaxLines); // 只取前 N 行
  const processedContent = lines.join(""); // 拼接回字符串（不带换行符）

  /**
   * 步骤2：查找 more 标签
   *
   * 使用正则表达式匹配 `<!-- more -->` 标签
   * - match 返回 null（未匹配）或匹配结果数组
   * - 匹配结果的 [1] 是第一个捕获组，即 more 标签之前的内容
   */
  const moreTagMatch = processedContent.match(tagMoreRegex);

  /**
   * 步骤3：提取摘要内容
   *
   * 两种策略：
   * 1. 有 more 标签：使用标签之前的内容（moreTagMatch[1]）
   * 2. 无 more 标签：截取前 genDescriptionCount 个字符，并添加 "..."
   *
   * 为什么添加省略号：
   * - 表示内容被截断，提示用户有更多内容
   * - 符合文本摘要的常见展示方式
   */
  let short = moreTagMatch
    ? moreTagMatch[1] // 使用 more 标签之前的内容
    : processedContent.substring(0, SITE.genDescriptionCount) + " ..."; // 截取前 N 个字符

  /**
   * 步骤4：移除 Markdown 语法
   *
   * 遍历所有替换规则，逐个应用：
   * - for...in 循环遍历对象的键（规则名称）
   * - 解构获取正则表达式和替换字符串
   * - String.replace 全局替换所有匹配项（正则带有 /g 标志）
   *
   * 执行顺序：
   * - 按照 regexReplacers 对象中定义的顺序执行
   * - 这个顺序很重要，例如应该先处理代码块，再处理行内代码
   */
  for (const patternKey in regexReplacers) {
    const [pattern, replacement] = regexReplacers[patternKey];
    short = short.replace(pattern, replacement);
  }

  /**
   * 步骤5：返回清理后的描述
   *
   * 此时 short 变量包含：
   * - 无 Markdown 语法的纯文本
   * - 适当长度的摘要（由 more 标签或字符数限制决定）
   * - 可选的省略号（无 more 标签时）
   */
  return short;
};

export default getDescription;
