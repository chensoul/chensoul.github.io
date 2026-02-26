/**
 * 将目录下的非 WebP 图片（jpg/png）转为 WebP 格式
 * 使用 sharp，输出同名的 .webp 文件；默认会删除原图以节省空间。
 *
 * 用法：node scripts/convert-to-webp.mjs [目录] [--keep]
 * 默认目录：public/images
 * --keep：保留原图，不删除
 */

import { readdir, stat, unlink } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const defaultDir = join(root, "public", "images");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const keepOriginal = process.argv.includes("--keep");
const dir = args[0] ? join(root, args[0]) : defaultDir;

const NON_WEBP_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const WEBP_QUALITY = 82;

async function listNonWebpImages(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dirPath, e.name);
    if (e.isDirectory()) {
      files.push(...(await listNonWebpImages(full)));
    } else if (NON_WEBP_EXTS.has(extname(e.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function convertToWebp(filePath) {
  const ext = extname(filePath).toLowerCase();
  const webpPath = filePath.slice(0, -ext.length) + ".webp";
  const before = (await stat(filePath)).size;

  let pipeline = sharp(filePath);
  const meta = await pipeline.metadata();
  if (meta.width > 1920 || meta.height > 1920) {
    pipeline = pipeline.resize(1920, 1920, { fit: "inside", withoutEnlargement: true });
  }
  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(webpPath);
  const after = (await stat(webpPath)).size;

  if (!keepOriginal) {
    await unlink(filePath);
  }

  const pct = before ? (((before - after) / before) * 100).toFixed(1) : 0;
  const action = keepOriginal ? "→" : "→ (已删原图)";
  console.log(`${filePath.replace(root, "")} ${(before / 1024).toFixed(1)}KB ${action} ${webpPath.replace(root, "")} ${(after / 1024).toFixed(1)}KB (-${pct}%)`);
}

async function main() {
  const files = await listNonWebpImages(dir);
  if (files.length === 0) {
    console.log("未找到 jpg/png 文件：", dir.replace(root, "") || "public/images");
    return;
  }
  console.log(
    "转为 WebP：",
    files.length,
    "个文件，目录：",
    dir.replace(root, "") || "public/images",
    keepOriginal ? "(保留原图)" : "(转换后删除原图)"
  );
  for (const f of files) {
    try {
      await convertToWebp(f);
    } catch (err) {
      console.error("Error:", f, err.message);
    }
  }
}

main();
