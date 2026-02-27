/**
 * 主题脚本：持久化用户选择、同步 data-theme、适配 Astro view transitions
 * - 与 Layout 内联脚本配合，提供 window.theme API
 * - astro:before-swap 时设置新文档背景，避免暗色下闪白
 */

declare global {
  interface Window {
    theme?: ThemeAPI;
  }
}

export type ThemeAPI = {
  themeValue: string;
  setPreference: () => void;
  reflectPreference: () => void;
  getTheme: () => string;
  setTheme: (val: string) => void;
};

const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";
const INITIAL_COLOR_SCHEME = ""; // 空则跟随系统

const SELECTORS = {
  themeBtn: "#theme-btn",
  themeColorMeta: "meta[name='theme-color']",
} as const;

const THEME_BG: Record<string, string> = {
  [DARK]: "#302e2c",
  [LIGHT]: "#f9f8f6",
};

function getPreferTheme(): string {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  if (INITIAL_COLOR_SCHEME) return INITIAL_COLOR_SCHEME;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
}

let themeValue = window.theme?.themeValue ?? getPreferTheme();

function setPreference(): void {
  localStorage.setItem(THEME_KEY, themeValue);
  reflectPreference();
}

function reflectPreference(): void {
  document.firstElementChild?.setAttribute("data-theme", themeValue);
  document.querySelector(SELECTORS.themeBtn)?.setAttribute("aria-label", themeValue);
  const bgColor = document.body && window.getComputedStyle(document.body).backgroundColor;
  if (bgColor) {
    document.querySelector(SELECTORS.themeColorMeta)?.setAttribute("content", bgColor);
  }
}

function createThemeAPI(): ThemeAPI {
  return {
    get themeValue() {
      return themeValue;
    },
    set themeValue(val: string) {
      themeValue = val;
    },
    setPreference,
    reflectPreference,
    getTheme: () => themeValue,
    setTheme: (val: string) => {
      themeValue = val;
    },
  };
}

function ensureThemeAPI(): void {
  const api = window.theme ?? createThemeAPI();
  if (window.theme?.themeValue !== undefined) themeValue = window.theme.themeValue;
  api.themeValue = themeValue;
  api.setPreference = setPreference;
  api.reflectPreference = reflectPreference;
  api.getTheme = () => themeValue;
  api.setTheme = (val: string) => {
    themeValue = val;
  };
  window.theme = api;
}

function setupThemeButton(): void {
  ensureThemeAPI();
  reflectPreference();
  document.querySelector(SELECTORS.themeBtn)?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  });
}

function onBeforeSwap(event: { newDocument: Document }): void {
  const newDoc = event.newDocument;
  const theme =
    document.documentElement.getAttribute("data-theme") ||
    (localStorage.getItem(THEME_KEY) === DARK ? DARK : LIGHT);
  const bg = THEME_BG[theme] ?? THEME_BG[LIGHT];
  newDoc.documentElement.setAttribute("data-theme", theme);
  newDoc.documentElement.style.backgroundColor = bg;
  if (newDoc.body) newDoc.body.style.backgroundColor = bg;
  const metaContent = document.querySelector(SELECTORS.themeColorMeta)?.getAttribute("content");
  if (metaContent) {
    newDoc.querySelector(SELECTORS.themeColorMeta)?.setAttribute("content", metaContent);
  }
}

// 初始化
ensureThemeAPI();
reflectPreference();
setupThemeButton();

document.addEventListener("astro:after-swap", setupThemeButton);
document.addEventListener("astro:before-swap", (e) => onBeforeSwap(e as { newDocument: Document }));

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches: isDark }) => {
  ensureThemeAPI();
  themeValue = isDark ? DARK : LIGHT;
  window.theme?.setTheme(themeValue);
  setPreference();
});

export {};
