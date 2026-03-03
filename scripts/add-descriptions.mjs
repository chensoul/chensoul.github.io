/**
 * 为 content/posts 下缺少 description 的 md/mdx 文章在 frontmatter 中生成并写入 description
 *
 * 逻辑与 PostUtils.getDescription 一致：优先 <!-- more --> 前内容，否则前 N 行/字符，并剔除 Markdown 与图片语法。
 * 仅当 frontmatter 中不存在 description 或为空时才会写入，已有 description 的不改。
 *
 * 用法：node scripts/add-descriptions.mjs [--dry]
 * --dry：只打印将写入的 description，不写回文件
 */
/* eslint-disable no-console */

import { readFile, writeFile, readdir } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const postsDir = join(root, "content", "posts");

const GEN_DESCRIPTION_MAX_LINES = 3;
const GEN_DESCRIPTION_COUNT = 200;

const tagMoreRegex = /^(.*?)<!--\s*more\s*-->/s;

const regexReplacers = [
  [/#{1,6} (.*?)/g, "$1 "],
  [/\*{1,3}(.*?)\*{1,3}/g, "$1"],
  [/_{1,3}(.*?)_{1,3}/g, "$1"],
  [/~~~[\s\S]*?~~~/g, ""],
  [/^(-{3,}|\*{3,})$/gm, ""],
  [/> (.*?)/g, "$1"],
  [/`(.*?)`/g, "$1"],
  [/```[\s\S]*?```/g, ""],
  [/\$(.*?)\$/g, ""],
  [/\$\$[\s\S]*?\$\$/g, ""],
  [/!\[(.*?)\]\((.*?)\)/g, ""],
  [/!\[(.*?)\]\[(.*?)\]/g, ""],
  [/\[(.*?)\]\((.*?)\)/g, "$1 "],
  [/\[(.*?)\]\[(.*?)\]/g, "$1 "],
  [/\[(.*?)\]: (.*?)/g, ""],
];

function getDescription(markdownContent) {
  const lines = markdownContent.split(/\r?\n/).slice(0, GEN_DESCRIPTION_MAX_LINES);
  const processedContent = lines.join("");
  const moreTagMatch = processedContent.match(tagMoreRegex);
  let short = moreTagMatch
    ? moreTagMatch[1]
    : processedContent.substring(0, GEN_DESCRIPTION_COUNT) + " ...";

  for (const [pattern, replacement] of regexReplacers) {
    short = short.replace(pattern, replacement);
  }
  return short.replace(/\s+/g, " ").trim();
}

/** 解析 frontmatter 中是否已有 description 及其值（支持 description: "..." 或 description: '...' 或 description: ...） */
function getExistingDescription(frontmatterStr) {
  const lines = frontmatterStr.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^description\s*:\s*(.+)$/);
    if (!m) continue;
    const raw = m[1].trim();
    if (raw.startsWith('"') && raw.endsWith('"'))
      return raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    if (raw.startsWith("'") && raw.endsWith("'"))
      return raw.slice(1, -1).replace(/''/g, "'");
    return raw;
  }
  return null;
}

/** 在 frontmatter 末尾（最后一个 --- 前）插入 description 行 */
function insertDescription(frontmatterStr, description) {
  const escaped = description.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return frontmatterStr.trimEnd() + `\ndescription: "${escaped}"\n`;
}

async function collectMdFiles(dir, list = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith("_")) {
      await collectMdFiles(full, list);
    } else if (e.isFile() && (extname(e.name) === ".md" || extname(e.name) === ".mdx")) {
      list.push(full);
    }
  }
  return list;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const files = await collectMdFiles(postsDir);
  let added = 0;
  let skipped = 0;

  for (const filePath of files) {
    const raw = await readFile(filePath, "utf-8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
      console.warn(`[skip] no frontmatter: ${filePath.replace(root, "")}`);
      skipped++;
      continue;
    }
    const [, frontmatterStr, body] = match;
    const existing = getExistingDescription(frontmatterStr);
    if (existing != null && existing.trim() !== "") {
      skipped++;
      continue;
    }

    const description = getDescription(body);
    const newFrontmatter = insertDescription(frontmatterStr, description);
    const newContent = `---\n${newFrontmatter}---\n${body}`;

    if (dry) {
      console.log(`${filePath.replace(root, "")}\n  description: ${description.slice(0, 80)}${description.length > 80 ? "..." : ""}\n`);
      added++;
      continue;
    }

    await writeFile(filePath, newContent, "utf-8");
    console.log(`[ok] ${filePath.replace(root, "")}`);
    added++;
  }

  console.log(dry ? `[dry] would add description to ${added} files, skipped ${skipped}` : `Added description to ${added} files, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
