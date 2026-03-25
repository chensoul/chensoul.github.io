/**
 * 文章路径、标签/分类 slug、remark `imageDir` 统一规则。
 * 独立模块，供 `postUtils` 与 `blogImages/remarkImages` 共用，避免两边复制或 remark 侧 import `postUtils`。
 */
import kebabcase from "lodash.kebabcase";

export function slugifyStr(str: string): string {
  let s = kebabcase(str);
  // kebab-case 会在数位边界插 hyphen：langchain4j → langchain-4-j、Log4j → log-4-j、LangChain4j → lang-chain-4-j
  s = s.replace(/([a-z]+)-chain-(\d+)-j(?=-|$)/g, "$1chain$2j");
  s = s.replace(/([a-z0-9]+)-(\d+)-j(?=-|$)/g, "$1$2j");
  return s;
}
