/**
 * 目录（TOC）初始化：加载 tocbot，绑定到 .js-toc / .js-toc-content
 * View Transitions 后滚动到顶部，并在新页面有 TOC 时重新初始化
 */

interface TocbotApi {
  init(options: {
    tocSelector: string;
    contentSelector: string;
    headingSelector: string;
    hasInnerContainers: boolean;
    scrollSmoothDuration: number;
    scrollSmoothOffset: number;
  }): void;
}

function getTocbot(): TocbotApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { tocbot?: TocbotApi }).tocbot;
}

const SCROLL_SMOOTH_OFFSET = 0;

function initTocbot(): void {
  const tocbot = getTocbot();
  if (!tocbot) return;
  tocbot.init({
    tocSelector: ".js-toc",
    contentSelector: ".js-toc-content",
    headingSelector: "h2, h3, h4",
    hasInnerContainers: true,
    scrollSmoothDuration: 300,
    scrollSmoothOffset: SCROLL_SMOOTH_OFFSET,
  });
}

function tryLoadAndInitTocbot(): void {
  if (!document.getElementById("toc-container")) return;
  if (getTocbot()) {
    initTocbot();
  } else {
    const script = document.createElement("script");
    script.src = "/tocbot/tocbot.min.js";
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.onload = initTocbot;
    document.body.appendChild(script);
  }
}

tryLoadAndInitTocbot();

document.addEventListener("astro:after-swap", () => {
  window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  tryLoadAndInitTocbot();
});
