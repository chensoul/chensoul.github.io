/**
 * 主题切换（参考 astro-paper 实现）
 * @see https://github.com/satnaing/astro-paper/blob/main/src/scripts/theme.ts
 */

declare global {
  interface Window {
    theme?: {
      themeValue: string;
      setPreference?: () => void;
      reflectPreference?: () => void;
      getTheme?: () => string;
      setTheme?: (val: string) => void;
    };
  }
}

const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

const initialColorScheme = "";

function getPreferTheme(): string {
  const currentTheme = localStorage.getItem(THEME);
  if (currentTheme === DARK || currentTheme === LIGHT) return currentTheme;
  if (initialColorScheme) return initialColorScheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
}

let themeValue = window.theme?.themeValue ?? getPreferTheme();

function setPreference(): void {
  localStorage.setItem(THEME, themeValue);
  reflectPreference();
}

function reflectPreference(): void {
  if (window.theme) window.theme.themeValue = themeValue;
  document.firstElementChild?.setAttribute("data-theme", themeValue);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);
  const body = document.body;
  if (body) {
    const bgColor = window.getComputedStyle(body).backgroundColor;
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", bgColor);
  }
}

if (window.theme) {
  window.theme.setPreference = setPreference;
  window.theme.reflectPreference = reflectPreference;
} else {
  window.theme = {
    themeValue,
    setPreference,
    reflectPreference,
    getTheme: () => themeValue,
    setTheme: (val: string) => {
      themeValue = val;
    },
  };
}

reflectPreference();

function setThemeFeature(): void {
  reflectPreference();
  const existingBtn = document.querySelector("#theme-btn");
  if (existingBtn && (existingBtn as HTMLElement & { _themeClickHandler?: () => void })._themeClickHandler) {
    existingBtn.removeEventListener("click", (existingBtn as HTMLElement & { _themeClickHandler?: () => void })._themeClickHandler!);
  }
  const themeClickHandler = () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    window.theme?.setTheme?.(themeValue);
    setPreference();
  };
  const themeBtn = document.querySelector("#theme-btn");
  if (themeBtn) {
    (themeBtn as HTMLElement & { _themeClickHandler?: () => void })._themeClickHandler = themeClickHandler;
    themeBtn.addEventListener("click", themeClickHandler);
  }
}

setThemeFeature();
document.addEventListener("astro:after-swap", setThemeFeature);

document.addEventListener("astro:before-swap", (event) => {
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme) {
    event.newDocument.documentElement.setAttribute("data-theme", theme);
  }
  const bgColor = document.querySelector("meta[name='theme-color']")?.getAttribute("content");
  if (bgColor) {
    event.newDocument.querySelector("meta[name='theme-color']")?.setAttribute("content", bgColor);
  }
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches: isDark }) => {
  themeValue = isDark ? DARK : LIGHT;
  window.theme?.setTheme?.(themeValue);
  setPreference();
});
