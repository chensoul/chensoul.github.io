interface Window {
theme?: {
  themeValue: string;
  setPreference: () => void;
  reflectPreference: () => void;
  getTheme: () => string;
  setTheme: (val: string) => void;
};
}

// Constants
const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

// Initial color scheme
// Can be "light", "dark", or empty string for system's prefers-color-scheme
const initialColorScheme = "";

function getPreferTheme(): string {
  // get theme data from local storage (user's explicit choice)
  const currentTheme = localStorage.getItem(THEME);
  if (currentTheme) return currentTheme;

  // return initial color scheme if it is set (site default)
  if (initialColorScheme) return initialColorScheme;

  // return user device's prefer color scheme (system fallback)
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// Use existing theme value from inline script if available, otherwise detect
let themeValue = window.theme?.themeValue ?? getPreferTheme();

function setPreference(): void {
  localStorage.setItem(THEME, themeValue);
  reflectPreference();
}

function reflectPreference(): void {
  document.firstElementChild?.setAttribute("data-theme", themeValue);

  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

  // Get a reference to the body element
  const body = document.body;

  // Check if the body element exists before using getComputedStyle
  if (body) {
    // Get the computed styles for the body element
    const computedStyles = window.getComputedStyle(body);

    // Get the background color property
    const bgColor = computedStyles.backgroundColor;

    // Set the background color in <meta theme-color ... />
    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
}

function ensureThemeAPI(): void {
  if (window.theme) {
    if (window.theme.themeValue !== undefined) themeValue = window.theme.themeValue;
    window.theme.themeValue = themeValue;
    window.theme.setPreference = setPreference;
    window.theme.reflectPreference = reflectPreference;
    window.theme.getTheme = () => themeValue;
    window.theme.setTheme = (val: string) => {
      themeValue = val;
    };
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
}

ensureThemeAPI();

// Ensure theme is reflected (in case body wasn't ready when inline script ran)
reflectPreference();

function setThemeFeature(): void {
  ensureThemeAPI(); // 每次 after-swap 或点击前确保 API 完整（防止被内联脚本覆盖）
  reflectPreference();

  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  });
}

// Set up theme features after page load
setThemeFeature();

// Runs on view transitions navigation
document.addEventListener("astro:after-swap", setThemeFeature);

// 与 variables.css 一致，用于 swap 前立即设置新文档背景，避免暗色下闪白
const THEME_BG = { dark: "#302e2c", light: "#f9f8f6" } as const;

document.addEventListener("astro:before-swap", event => {
  const astroEvent = event;
  const newDoc = astroEvent.newDocument;

  const theme =
    document.documentElement.getAttribute("data-theme") ||
    (localStorage.getItem(THEME) === DARK ? DARK : LIGHT);
  const bg = THEME_BG[theme === DARK ? "dark" : "light"];

  newDoc.documentElement.setAttribute("data-theme", theme);
  newDoc.documentElement.style.backgroundColor = bg;
  if (newDoc.body) newDoc.body.style.backgroundColor = bg;

  const bgColor = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (bgColor) {
    newDoc
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
});

// sync with system changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    ensureThemeAPI();
    themeValue = isDark ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  });