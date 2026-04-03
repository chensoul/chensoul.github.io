/**
 * 图片处理（sharp），仅遍历 public/images 下子目录。
 * 不处理 .svg / .ico（仍不碰矢量与 ico）。
 *
 * 对 jpg/png：EXIF 自动旋转、任一边大于 1920 则等比缩小（inside、不放大），再输出同名 .webp。
 * 单次 sharp 流水线。默认删原图，可用 --keep 保留。
 *
 * 用法：
 *   node scripts/convert-to-webp.mjs [public/images 下的相对路径] [--keep]
 * 默认目录：public/images；若传入路径超出该目录则退出。
 */

import { readdir, stat, unlink } from "fs/promises";
import { join, extname, resolve, sep } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const imagesRoot = resolve(root, "public", "images");

const argv = process.argv.slice(2);
const keepOriginal = argv.includes("--keep");
const args = argv.filter((a) => !a.startsWith("--"));

function resolveDirUnderImages(userArg) {
  const target = userArg ? resolve(root, userArg) : imagesRoot;
  if (target !== imagesRoot) {
    const prefix = imagesRoot.endsWith(sep) ? imagesRoot : imagesRoot + sep;
    if (!target.startsWith(prefix)) {
      console.error("仅允许 public/images 下的路径，收到:", userArg);
      process.exit(1);
    }
  }
  return target;
}

const dir = resolveDirUnderImages(args[0]);

/** 永不转为 webp（即使日后扩展输入格式也不处理矢量与 ico） */
const SKIP_WEBP_EXTS = new Set([".svg", ".ico"]);

const NON_WEBP_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const WEBP_QUALITY = 82;
const WEBP_EFFORT = 6;
const WEBP_OPTIONS = { quality: WEBP_QUALITY, effort: WEBP_EFFORT };
const MAX_EDGE = 1920;

/**
 * EXIF 自动旋转后，若任一边大于 MAX_EDGE 则缩小（inside、不放大）。
 */
async function preparePipeline(filePath) {
  let pipeline = sharp(filePath).rotate();
  const meta = await pipeline.metadata();
  if (meta.width > MAX_EDGE || meta.height > MAX_EDGE) {
    pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  return pipeline;
}

async function walkImages(dirPath, extSet) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dirPath, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkImages(full, extSet)));
    } else {
      const ext = extname(e.name).toLowerCase();
      if (extSet.has(ext) && !SKIP_WEBP_EXTS.has(ext)) {
        files.push(full);
      }
    }
  }
  return files;
}

async function convertToWebp(filePath) {
  const ext = extname(filePath).toLowerCase();
  const webpPath = filePath.slice(0, -ext.length) + ".webp";
  const before = (await stat(filePath)).size;

  const pipeline = await preparePipeline(filePath);
  await pipeline.webp(WEBP_OPTIONS).toFile(webpPath);
  const after = (await stat(webpPath)).size;

  if (!keepOriginal) {
    await unlink(filePath);
  }

  const pct = before ? (((before - after) / before) * 100).toFixed(1) : 0;
  const action = keepOriginal ? "→" : "→ (已删原图)";
  console.log(
    `${filePath.replace(root, "")} ${(before / 1024).toFixed(1)}KB ${action} ${webpPath.replace(root, "")} ${(after / 1024).toFixed(1)}KB (-${pct}%)`
  );
}

async function main() {
  const files = await walkImages(dir, NON_WEBP_EXTS);
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
