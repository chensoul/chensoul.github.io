import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

/** 与 src/styles/base.css 中 @import 的 @fontsource/noto-sans-sc 一致，OG 图与站点同字体 */
const require = createRequire(import.meta.url);
const notoSansScDir = path.dirname(require.resolve('@fontsource/noto-sans-sc/package.json'));
/** Satori 不支持 WOFF2（会报 Unsupported OpenType signature wOF2），使用 .woff */
const fontFiles = {
  regular: path.join(notoSansScDir, 'files', 'noto-sans-sc-chinese-simplified-400-normal.woff'),
  bold: path.join(notoSansScDir, 'files', 'noto-sans-sc-chinese-simplified-700-normal.woff'),
};

const avatarDir = path.join(process.cwd(), 'public/images');

/** Satori 仅可靠支持 PNG 的 data URL，WebP 需先转为 PNG。结果缓存，仅执行一次。 */
let avatarDataUrlPromise: Promise<string | null> | null = null;
async function getAvatarDataUrl(): Promise<string | null> {
  if (avatarDataUrlPromise != null) return avatarDataUrlPromise;
  avatarDataUrlPromise = (async () => {
    const pngPath = path.join(avatarDir, 'avatar.png');
    const webpPath = path.join(avatarDir, 'avatar.webp');
    try {
      const pngBuf = await fs.readFile(pngPath);
      return `data:image/png;base64,${pngBuf.toString('base64')}`;
    } catch {
      // 无 avatar.png，尝试 avatar.webp 并转为 PNG
    }
    try {
      const webpBuf = await fs.readFile(webpPath);
      const pngBuf = await sharp(webpBuf).png().toBuffer();
      return `data:image/png;base64,${pngBuf.toString('base64')}`;
    } catch {
      // 无头像或转换失败则不显示
    }
    return null;
  })();
  return avatarDataUrlPromise;
}

/** 从本地 @fontsource/noto-sans-sc 读取字体，无需访问 Google（避免翻墙） */
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

interface OgImageOptions {
  title: string;
  date: Date;
  siteTitle?: string;
}

export async function generateOgImage({
  title,
  date,
}: OgImageOptions): Promise<Buffer> {
  const [fonts, avatarDataUrl] = await Promise.all([
    getFonts(),
    getAvatarDataUrl(),
  ]);
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '60px',
          fontFamily: 'Noto Sans SC',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '50px',
                alignItems: 'center',
                gap: '50px',
              },
              children: [
                ...(avatarDataUrl
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          },
                          children: [
                            {
                              type: 'img',
                              props: {
                                src: avatarDataUrl,
                                width: 160,
                                height: 160,
                                style: {
                                  borderRadius: '80px',
                                  border: '4px solid rgba(96,165,250,0.6)',
                                },
                              },
                            },
                          ],
                        },
                      },
                    ]
                  : []),
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      flex: 1,
                      minWidth: 0,
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '46px',
                            fontWeight: 700,
                            color: '#f8fafc',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                          children: title,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            marginTop: '24px',
                            fontSize: '24px',
                            color: '#60a5fa',
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
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans SC',
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Noto Sans SC',
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}