/**
 * 文章描述生成用正则：more 标签与 Markdown 语法清理规则
 * 供 getDescription 使用
 */

/** 匹配 `<!-- more -->` 之前的内容，捕获组 $1 为摘要 */
export const tagMoreRegex = /^(.*?)<!--\s*more\s*-->/s;

/**
 * Markdown 语法替换规则：[规则名, [正则, 替换串]]
 * 按顺序应用，用于从正文中剥离语法得到纯文本
 */
export const regexReplacers: Record<string, [RegExp, string]> = {
  header: [/#{1,6} (.*?)/g, "$1 "],
  star: [/\*{1,3}(.*?)\*{1,3}/g, "$1"],
  underscore: [/_{1,3}(.*?)_{1,3}/g, "$1"],
  strikeout: [/~~~[\s\S]*?~~~/g, ""],
  horizontalRule: [/^(-{3,}|\*{3,})$/gm, ""],
  quote: [/> (.*?)/g, "$1"],
  codeInline: [/`(.*?)`/g, "$1"],
  codeBlock: [/```[\s\S]*?```/g, ""],
  latexInline: [/\$(.*?)\$/g, ""],
  latexBlock: [/\$\$[\s\S]*?\$\$/g, ""],
  image1: [/!\[(.*?)\]\((.*?)\)/g, ""],
  image2: [/!\[(.*?)\]\[(.*?)\]/g, ""],
  link1: [/\[(.*?)\]\((.*?)\)/g, "$1 "],
  link2: [/\[(.*?)\]\[(.*?)\]/g, "$1 "],
  linkRef: [/\[(.*?)\]: (.*?)/g, ""],
};
