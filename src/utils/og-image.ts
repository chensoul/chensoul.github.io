/**
 * OG 分享图生成
 *
 * @fileoverview 使用 Satori + Resvg 将文章标题、日期等渲染为 1200×630 PNG，供 og:image 使用
 *
 * 页面正文已改用系统中文字体；OG 图仍从本地 @fontsource/noto-sans-sc 读取中文字库，确保分享图文字稳定渲染。头像从 public/images/avatar.png 或 avatar.webp 读取，WebP 会转为 PNG 后以 data URL 嵌入。
 *
 * @see pages/og/[...slug].png.ts
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";
import path from "path";
import { createRequire } from "node:module";
import sharp from "sharp";

/** OG 图单独使用本地 Noto Sans SC 字体文件，避免依赖系统字库差异 */
const require = createRequire(import.meta.url);
const notoSansScDir = path.dirname(
  require.resolve("@fontsource/noto-sans-sc/package.json")
);
/** Satori 不支持 WOFF2（会报 Unsupported OpenType signature wOF2），使用 .woff */
const fontFiles = {
  regular: path.join(
    notoSansScDir,
    "files",
    "noto-sans-sc-chinese-simplified-400-normal.woff"
  ),
  bold: path.join(
    notoSansScDir,
    "files",
    "noto-sans-sc-chinese-simplified-700-normal.woff"
  ),
};

const avatarDir = path.join(process.cwd(), "public/images");

/** Satori 仅可靠支持 PNG 的 data URL，WebP 需先转为 PNG。结果缓存，仅执行一次。 */
let avatarDataUrlPromise: Promise<string | null> | null = null;
async function getAvatarDataUrl(): Promise<string | null> {
  if (avatarDataUrlPromise != null) return avatarDataUrlPromise;
  avatarDataUrlPromise = (async () => {
    const pngPath = path.join(avatarDir, "avatar.png");
    const webpPath = path.join(avatarDir, "avatar.webp");
    try {
      const pngBuf = await fs.readFile(pngPath);
      return `data:image/png;base64,${pngBuf.toString("base64")}`;
    } catch {
      // 无 avatar.png，尝试 avatar.webp 并转为 PNG
    }
    try {
      const webpBuf = await fs.readFile(webpPath);
      const pngBuf = await sharp(webpBuf).png().toBuffer();
      return `data:image/png;base64,${pngBuf.toString("base64")}`;
    } catch {
      // 无头像或转换失败则不显示
    }
    return null;
  })();
  return avatarDataUrlPromise;
}

/** 从本地 @fontsource/noto-sans-sc 读取字体，不依赖外部网络 */
function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return ab as ArrayBuffer;
}

let fontsPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null =
  null;

function getFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fs.readFile(fontFiles.regular),
      fs.readFile(fontFiles.bold),
    ]).then(([regular, bold]) => ({
      regular: bufferToArrayBuffer(regular),
      bold: bufferToArrayBuffer(bold),
    }));
  }
  return fontsPromise;
}

/** 生成 OG 图时的入参 */
interface OgImageOptions {
  title: string;
  date: Date;
  author?: string;
  siteTitle?: string;
}

/**
 * 根据标题和日期生成 1200×630 的 OG 图 PNG Buffer
 *
 * @param options.title - 文章标题
 * @param options.date - 发布日期（用于展示）
 * @param options.siteTitle - 可选站点名，当前未在布局中使用
 * @returns PNG 二进制
 */
export async function generateOgImage({
  title,
  date,
  author,
}: OgImageOptions): Promise<Buffer> {
  const [fonts, avatarDataUrl] = await Promise.all([
    getFonts(),
    getAvatarDataUrl(),
  ]);
  const dateStr = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
          padding: "60px",
          fontFamily: "Noto Sans SC",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(15,23,42,0.08)",
                padding: "50px",
                alignItems: "center",
                gap: "50px",
              },
              children: [
                ...(avatarDataUrl
                  ? [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          },
                          children: [
                            {
                              type: "img",
                              props: {
                                src: avatarDataUrl,
                                width: 160,
                                height: 160,
                                style: {
                                  borderRadius: "80px",
                                  border: "4px solid rgba(59,130,246,0.5)",
                                },
                              },
                            },
                          ],
                        },
                      },
                    ]
                  : []),
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      flex: 1,
                      minWidth: 0,
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "46px",
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                          children: title,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            marginTop: "24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          },
                          children: [
                            ...(author
                              ? [
                                  {
                                    type: "div",
                                    props: {
                                      style: {
                                        fontSize: "22px",
                                        color: "#475569",
                                        fontWeight: 400,
                                      },
                                      children: author,
                                    },
                                  },
                                ]
                              : []),
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "24px",
                                  color: "#2563eb",
                                  fontWeight: 400,
                                },
                                children: dateStr,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans SC",
          data: fonts.regular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Noto Sans SC",
          data: fonts.bold,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}
