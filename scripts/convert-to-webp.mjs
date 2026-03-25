/**
 * 图片处理（sharp），仅遍历 public/images 下子目录。
 * 不处理 .svg / .ico / .webp（转换模式只处理 jpg/png；压缩模式含 webp，仍不碰 svg/ico）。
 *
 * 1) 默认：将 jpg/png 转为同名 .webp（默认删原图，可用 --keep 保留）
 * 2) --compress：就地压缩 jpg/png/webp（仅当体积变小才覆盖）
 *
 * 用法：
 *   node scripts/convert-to-webp.mjs [public/images 下的相对路径] [--keep]
 *   node scripts/convert-to-webp.mjs [目录] --compress
 * 默认目录：public/images；若传入路径超出该目录则退出。
 */
/* eslint-disable no-console -- CLI 脚本需输出到控制台 */

import { readdir, stat, unlink, rename } from "fs/promises";
import { join, extname, resolve, sep } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const imagesRoot = resolve(root, "public", "images");

const argv = process.argv.slice(2);
const compressMode = argv.includes("--compress");
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

/** 永不转为/压缩为 webp（即使日后扩展输入格式也不处理矢量与 ico） */
const SKIP_WEBP_EXTS = new Set([".svg", ".ico"]);

const NON_WEBP_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const COMPRESS_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const WEBP_QUALITY = 82;
const JPG_OPTIONS = { mozjpeg: true, quality: 82 };
const PNG_OPTIONS = { compressionLevel: 9 };
const WEBP_OPTIONS = { quality: 82 };

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

  let pipeline = sharp(filePath);
  const meta = await pipeline.metadata();
  if (meta.width > 1920 || meta.height > 1920) {
    pipeline = pipeline.resize(1920, 1920, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(webpPath);
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

async function compressInPlace(filePath) {
  const ext = extname(filePath).toLowerCase();
  const before = (await stat(filePath)).size;
  let pipeline = sharp(filePath);
  const meta = await pipeline.metadata();
  if (meta.width > 1920 || meta.height > 1920) {
    pipeline = pipeline.resize(1920, 1920, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  const tmp = filePath + ".tmp";
  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg(JPG_OPTIONS).toFile(tmp);
  } else if (ext === ".png") {
    await pipeline.png(PNG_OPTIONS).toFile(tmp);
  } else if (ext === ".webp") {
    await pipeline.webp(WEBP_OPTIONS).toFile(tmp);
  } else {
    return;
  }
  const after = (await stat(tmp)).size;
  if (after < before) {
    await rename(tmp, filePath);
    const pct = (((before - after) / before) * 100).toFixed(1);
    console.log(
      `${filePath.replace(root, "")} ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB (-${pct}%)`
    );
  } else {
    await unlink(tmp);
    console.log(
      `${filePath.replace(root, "")} ${(before / 1024).toFixed(1)}KB (跳过，压缩后更大)`
    );
  }
}

async function mainConvert() {
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

async function mainCompress() {
  const files = await walkImages(dir, COMPRESS_EXTS);
  if (files.length === 0) {
    console.log(
      "No jpg/png/webp files in",
      dir.replace(root, "") || "public/images"
    );
    return;
  }
  console.log(
    "Compressing",
    files.length,
    "file(s) in",
    dir.replace(root, "") || "public/images"
  );
  for (const f of files) {
    try {
      await compressInPlace(f);
    } catch (err) {
      console.error("Error:", f, err.message);
    }
  }
}

async function main() {
  if (compressMode) {
    await mainCompress();
  } else {
    await mainConvert();
  }
}

main();
