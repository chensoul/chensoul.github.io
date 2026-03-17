import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";

const avatarBase64 = fs
  .readFileSync(path.join(process.cwd(), "public/avatar.png"))
  .toString("base64");

async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+",
    },
  }).then(res => res.text());

  const match = css.match(/src:\s*url\((.+?)\)\s*format/);
  if (!match) throw new Error(`Failed to load font: ${family} ${weight}`);

  return fetch(match[1]).then(res => res.arrayBuffer());
}

let fontsPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null =
  null;

function getFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadGoogleFont("Noto Sans SC", 400),
      loadGoogleFont("Noto Sans SC", 700),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return fontsPromise;
}

interface OgImageOptions {
  title: string;
  date: Date;
  author?: string;
  siteTitle?: string;
}

export async function generateOgImage({
  title,
  date,
  author,
}: OgImageOptions): Promise<Buffer> {
  const fonts = await getFonts();
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
                [
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
                            src: `data:image/png;base64,${avatarBase64}`,
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
                ],
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
