/**
 * 压缩 public/images 下的图片（jpg/png/webp）
 * 使用 sharp，输出覆盖原文件，请先备份或提交前运行。
 *
 * 用法：node scripts/compress-images.mjs [目录]
 * 默认目录：public/images
 */
/* eslint-disable no-console -- CLI 脚本需输出到控制台 */

import { readdir, stat } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const defaultDir = join(root, "public", "images");
const dir = process.argv[2] ? join(root, process.argv[2]) : defaultDir;

const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const JPG_OPTIONS = { mozjpeg: true, quality: 82 };
const PNG_OPTIONS = { compressionLevel: 9 };
const WEBP_OPTIONS = { quality: 82 };

async function listImages(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dirPath, e.name);
    if (e.isDirectory()) {
      files.push(...(await listImages(full)));
    } else if (EXTS.has(extname(e.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function compress(filePath) {
  const ext = extname(filePath).toLowerCase();
  const before = (await stat(filePath)).size;
  let pipeline = sharp(filePath);
  const meta = await pipeline.metadata();
  if (meta.width > 1920 || meta.height > 1920) {
    pipeline = pipeline.resize(1920, 1920, { fit: "inside", withoutEnlargement: true });
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg(JPG_OPTIONS).toFile(filePath + ".tmp");
  } else if (ext === ".png") {
    await pipeline.png(PNG_OPTIONS).toFile(filePath + ".tmp");
  } else if (ext === ".webp") {
    await pipeline.webp(WEBP_OPTIONS).toFile(filePath + ".tmp");
  } else {
    return;
  }
  const after = (await stat(filePath + ".tmp")).size;
  const { rename, unlink } = await import("fs/promises");
  if (after < before) {
    await rename(filePath + ".tmp", filePath);
    const pct = (((before - after) / before) * 100).toFixed(1);
    console.log(`${filePath.replace(root, "")} ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB (-${pct}%)`);
  } else {
    await unlink(filePath + ".tmp");
    console.log(`${filePath.replace(root, "")} ${(before / 1024).toFixed(1)}KB (跳过，压缩后更大)`);
  }
}

async function main() {
  const files = await listImages(dir);
  if (files.length === 0) {
    console.log("No jpg/png/webp files in", dir.replace(root, "") || "public/images");
    return;
  }
  console.log("Compressing", files.length, "file(s) in", dir.replace(root, "") || "public/images");
  for (const f of files) {
    try {
      await compress(f);
    } catch (err) {
      console.error("Error:", f, err.message);
    }
  }
}

main();
