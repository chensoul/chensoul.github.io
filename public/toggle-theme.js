// 主题切换系
// 1. 支持基于时间的自动主题切换（夜间自动切换到深色主题）
// 2. 支持用户手动设置主题（当天有效，次日重新启用自动切换）
// 3. 支持系统主题偏好检测
// 4. 完整的错误处理和调试功能
// 5. 首帧前同步主题（本脚本在 head 内同步加载时立即执行），避免刷新/切换时闪白

(function applyThemeBeforeFirstPaint() {
  try {
    var t = localStorage.getItem("theme");
    if (t === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      var s = document.createElement("style");
      s.textContent =
        "html { background-color: #f9f8f6 !important; } body { background-color: #ebe8e4 !important; }";
      document.head.appendChild(s);
    } else if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (_) {}
})();

const primaryColorScheme = "";

// 自动切换时间配置 (24小时制)
const DARK_START_HOUR = 19; // 晚上 19 点开始
const DARK_END_HOUR = 7; // 早上 7 点结束

// 调试模式配置
const DEBUG_THEME = false;

const __memoryStore = new Map();

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return __memoryStore.get(key) ?? null;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    __memoryStore.set(key, value);
  }
}
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    __memoryStore.delete(key);
  }
}
function normalizeTheme(v) {
  return v === "dark" ? "dark" : v === "light" ? "light" : null;
}
// =======================================================================

function debugLog(message, ...args) {
  if (DEBUG_THEME) {
    console.log(`[Theme Debug] ${message}`, ...args);
  }
}

function handleThemeError(error, context) {
  console.error(`[Theme Error] ${context}:`, error);
  try {
    reflectPreference();
  } catch (e) {
    console.error("[Theme Error] 无法恢复主题状态:", e);
  }
}

let autoThemeTimer = null; // 自动主题检查定时器
let systemThemeListener = null; // 系统主题变化监听器
let systemThemeMql = null; // 重要 BUG 修复：缓存同一 MediaQueryList 实例

function getCurrentThemeFromStorage() {
  return normalizeTheme(safeGet("theme"));
}

function getUserManuallySetTheme() {
  return safeGet("userSetTheme") === "true";
}

function getUserSetThemeDate() {
  return safeGet("userSetThemeDate");
}

function shouldUseDarkThemeByTime() {
  try {
    const now = new Date();
    const shanghaiTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    const hour = shanghaiTime.getHours();
    return hour >= DARK_START_HOUR || hour < DARK_END_HOUR;
  } catch (error) {
    console.warn("时区转换失败，使用本地时间:", error);
    const now = new Date();
    const hour = now.getHours();
    return hour >= DARK_START_HOUR || hour < DARK_END_HOUR;
  }
}

function getTodayDateString() {
  try {
    const now = new Date();
    const shanghaiTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
    );
    return (
      shanghaiTime.getFullYear() +
      "-" +
      String(shanghaiTime.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(shanghaiTime.getDate()).padStart(2, "0")
    );
  } catch (error) {
    console.warn("时区转换失败，使用本地时间:", error);
    const today = new Date();
    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }
}

function isUserPreferenceValidToday() {
  if (!getUserManuallySetTheme()) return false;

  const today = getTodayDateString();
  const setDate = getUserSetThemeDate();

  if (setDate !== today) {
    safeRemove("userSetTheme");
    safeRemove("userSetThemeDate");
    return false;
  }

  return true;
}

function getPreferTheme() {
  try {
    const currentTheme = getCurrentThemeFromStorage();

    debugLog("获取主题偏好", {
      currentTheme,
      isValidToday: isUserPreferenceValidToday(),
      shouldUseDark: shouldUseDarkThemeByTime(),
      primaryScheme: primaryColorScheme,
    });

    if (isUserPreferenceValidToday() && currentTheme) {
      debugLog("使用用户手动设置:", currentTheme);
      return currentTheme;
    }

    if (shouldUseDarkThemeByTime()) {
      debugLog("使用时间自动切换: dark");
      return "dark";
    }

    if (primaryColorScheme) {
      debugLog("使用主题方案设置:", primaryColorScheme);
      return primaryColorScheme;
    }

    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const systemTheme = systemDark ? "dark" : "light";
    debugLog("使用系统偏好:", systemTheme);
    return systemTheme;
  } catch (error) {
    handleThemeError(error, "getPreferTheme");
    return "light";
  }
}

let themeValue = getPreferTheme();

function setPreference(userManualSet = false) {
  try {
    safeSet("theme", themeValue);
    if (userManualSet) {
      safeSet("userSetTheme", "true");
      safeSet("userSetThemeDate", getTodayDateString());
      debugLog("用户手动设置主题", {
        theme: themeValue,
        date: getTodayDateString(),
      });
    } else {
      debugLog("自动设置主题", { theme: themeValue });
    }

    reflectPreference();
  } catch (error) {
    handleThemeError(error, "setPreference");
  }
}

function reflectPreference() {
  document.firstElementChild.setAttribute("data-theme", themeValue);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);
  const body = document.body;
  if (body) {
    const computedStyles = window.getComputedStyle(body);
    const bgColor = computedStyles.backgroundColor;
    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
}

function cleanupAutoTheme() {
  if (autoThemeTimer) {
    clearInterval(autoThemeTimer);
    autoThemeTimer = null;
  }

  if (systemThemeMql && systemThemeListener) {
    if (typeof systemThemeMql.removeEventListener === "function") {
      systemThemeMql.removeEventListener("change", systemThemeListener);
    } else {
      const legacy = /** @type {any} */ (systemThemeMql);
      if (typeof legacy.removeListener === "function") {
        legacy.removeListener(systemThemeListener);
      }
    }
    systemThemeListener = null;
    systemThemeMql = null;
  }
}

function setupAutoTheme() {
  cleanupAutoTheme();

  if (!isUserPreferenceValidToday()) {
    const autoThemeChecker = () => {
      themeValue = getPreferTheme();
      reflectPreference();
    };

    autoThemeChecker();

    autoThemeTimer = setInterval(autoThemeChecker, 60000);

    systemThemeMql = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeListener = ({ matches: isDark }) => {
      if (!isUserPreferenceValidToday() && !shouldUseDarkThemeByTime()) {
        themeValue = isDark ? "dark" : "light";
        setPreference(false);
      }
    };

    if (typeof systemThemeMql.addEventListener === "function") {
      systemThemeMql.addEventListener("change", systemThemeListener);
    } else {
      const legacy = /** @type {any} */ (systemThemeMql);
      if (typeof legacy.addListener === "function") {
        legacy.addListener(systemThemeListener);
      }
    }
  }
}

reflectPreference();

window.onload = () => {
  function setThemeFeature() {
    reflectPreference();

    const existingBtn = document.querySelector("#theme-btn");
    if (existingBtn && existingBtn._themeClickHandler) {
      existingBtn.removeEventListener("click", existingBtn._themeClickHandler);
    }

    const themeClickHandler = () => {
      // 检查 View Transitions 支持和减弱动画设置
      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        themeValue = themeValue === "light" ? "dark" : "light";
        setPreference(true);
        setupAutoTheme();
        return;
      }

      const transition = document.startViewTransition(() => {
        themeValue = themeValue === "light" ? "dark" : "light";
        setPreference(true);
        setupAutoTheme();
      });

      transition.ready.then(() => {
        const clipPath = [
          "inset(0 0 100% 0)", // 从上往下，初始状态底部被完全裁剪
          "inset(0 0 0 0)", // 结束状态完全显示
        ];

        // 注入临时样式以禁用默认动画
        const style = document.createElement("style");
        style.innerHTML = `
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation: none;
            mix-blend-mode: normal;
          }
        `;
        document.head.appendChild(style);

        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 1000,
            easing: "ease-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );

        transition.finished.finally(() => {
          style.remove();
        });
      });
    };

    const themeBtn = document.querySelector("#theme-btn");
    if (themeBtn) {
      themeBtn._themeClickHandler = themeClickHandler;
      themeBtn.addEventListener("click", themeClickHandler);
    }
  }

  setThemeFeature();

  document.addEventListener("astro:after-swap", setThemeFeature);

  document.addEventListener("astro:before-swap", event => {
    const bgColor = document
      .querySelector("meta[name='theme-color']")
      ?.getAttribute("content");

    event.newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  });

  setupAutoTheme();
};

function __formatRelativeTime(date) {
  const now = Date.now();
  let diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 0) diff = 0;
  if (diff < 60) return "几秒前";
  const m = Math.floor(diff / 60);
  if (m < 2) return "1分钟前";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 2) return "1 小时前";
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 2) return "1 天前";
  if (d < 30) return `${d} 天前`;
  const mo = Math.floor(d / 30);
  if (mo < 2) return "1 个月前";
  if (mo < 12) return `${mo} 个月前`;
  const y = Math.floor(d / 365);
  if (y < 2) return "1 年前";
  return `${y} 年前`;
}

let __relativeTimer = null;
let __relativeObserver = null;

function __updateRelativeTimes() {
  const nodes = document.querySelectorAll("time[datetime]");
  nodes.forEach(el => {
    if (el.getAttribute("data-date-format") === "absolute") return;
    const dt = el.getAttribute("datetime");
    if (!dt) return;
    const date = new Date(dt);
    if (isNaN(date.getTime())) return;
    el.textContent = __formatRelativeTime(date);
  });
}

function __setupRelativeObserver() {
  if (typeof MutationObserver === "undefined") return;
  if (__relativeObserver) __relativeObserver.disconnect();
  __relativeObserver = new MutationObserver(mutations => {
    let shouldUpdate = false;
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const el = /** @type {Element} */ (node);
            if (el.matches && el.matches("time[datetime]")) shouldUpdate = true;
            if (el.querySelector && el.querySelector("time[datetime]"))
              shouldUpdate = true;
          }
        });
      }
    }
    if (shouldUpdate) __updateRelativeTimes();
  });
  __relativeObserver.observe(document.body, { childList: true, subtree: true });
}

function __startRelativeTimer() {
  if (__relativeTimer) clearInterval(__relativeTimer);
  __updateRelativeTimes();
  __relativeTimer = setInterval(__updateRelativeTimes, 60000);
}

function setupRelativeTime() {
  __startRelativeTimer();
  __setupRelativeObserver();
}

document.addEventListener("DOMContentLoaded", setupRelativeTime);
document.addEventListener("astro:page-load", setupRelativeTime);
document.addEventListener("astro:after-swap", setupRelativeTime);
