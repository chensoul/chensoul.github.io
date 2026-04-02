#!/usr/bin/env node
/**
 * 删除 content/translation 中 slug 重复的文章。
 * 保留规则：若有非 draft，保留其中 date 最新的一篇；若全部为 draft，保留 date 最新的一篇。
 * （等价于优先删掉 draft 且日期更早的副本。）
 *
 * 用法: node scripts/dedupe-translation-by-slug.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSLATION_DIR = path.join(__dirname, "..", "content", "translation");
const dryRun = process.argv.includes("--dry-run");

function collectMdFiles(dir) {
  const out = [];
  function walk(d) {
    for (const name of fs.readdirSync(d, { withFileTypes: true })) {
      if (name.name.startsWith("_")) continue;
      const p = path.join(d, name.name);
      if (name.isDirectory()) walk(p);
      else if (name.name.endsWith(".md") || name.name.endsWith(".mdx")) out.push(p);
    }
  }
  walk(dir);
  return out;
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const block = m[1];
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const kv = trimmed.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === "true") data[key] = true;
    else if (val === "false") data[key] = false;
    else data[key] = val;
  }
  return data;
}

function parseDate(d) {
  if (!d) return new Date(0);
  const s = String(d).replace(" ", "T");
  const t = Date.parse(s);
  return Number.isNaN(t) ? new Date(0) : new Date(t);
}

function pickKeeper(entries) {
  // entries: { path, slug, draft, date }
  const published = entries.filter(e => e.draft !== true);
  const pool = published.length > 0 ? published : entries;
  let best = pool[0];
  for (const e of pool) {
    if (e.date.getTime() > best.date.getTime()) best = e;
  }
  return best;
}

const files = collectMdFiles(TRANSLATION_DIR);
const bySlug = new Map();

for (const filePath of files) {
  const raw = fs.readFileSync(filePath, "utf8");
  const fm = parseFrontmatter(raw);
  if (!fm || !fm.slug || String(fm.slug).trim() === "") continue;
  const slug = String(fm.slug).trim();
  const draft = fm.draft === true;
  const date = parseDate(fm.date);
  const list = bySlug.get(slug) ?? [];
  list.push({ path: filePath, slug, draft, date });
  bySlug.set(slug, list);
}

const toDelete = [];
for (const [slug, entries] of bySlug) {
  if (entries.length < 2) continue;
  const keeper = pickKeeper(entries);
  for (const e of entries) {
    if (e.path !== keeper.path) toDelete.push({ ...e, slug, keeper: keeper.path });
  }
}

toDelete.sort((a, b) => a.path.localeCompare(b.path));

console.log(
  `Duplicate slugs: ${[...bySlug].filter(([, e]) => e.length > 1).length} groups`
);
console.log(`Files to delete: ${toDelete.length}`);
if (dryRun) console.log("(dry-run, no files removed)\n");

for (const d of toDelete) {
  const rel = path.relative(path.join(__dirname, ".."), d.path);
  console.log(`DELETE ${rel}`);
  console.log(`  slug=${d.slug} draft=${d.draft} date=${d.date.toISOString()}`);
  if (!dryRun) fs.unlinkSync(d.path);
}

if (toDelete.length === 0) {
  console.log("No duplicate slugs found.");
  process.exit(0);
}

if (dryRun) {
  console.log("\nRun without --dry-run to delete these files.");
  process.exit(0);
}

console.log("\nDone.");
