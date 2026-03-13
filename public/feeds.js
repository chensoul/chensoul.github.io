/**
 * 订阅 / Feeds 页客户端逻辑
 *
 * 从 dataSourceUrl 拉取 JSON（格式：{ items: [{ title, link, published, blog_name?, avatar? }] }），
 * 渲染列表并支持滚动加载更多。参考 astro-lhasa + rss-lhasa。
 */

function escapeHtml(s) {
  if (typeof s !== "string") return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

/** 将日期格式化为 YYYY-MM-DD */
function formatDateYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 今年内返回相对时间（中文），否则返回 YYYY-MM-DD */
function getDisplayDate(value) {
  if (value == null || value === "") return "日期未知";
  const d = new Date(value);
  if (Number.isNaN(d.getTime()))
    return typeof value === "string" ? value : "日期未知";
  const now = new Date();
  if (d.getFullYear() !== now.getFullYear()) {
    return formatDateYYYYMMDD(d);
  }
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return formatDateYYYYMMDD(d);
  if (diffMs < 60 * 1000) return "刚刚";
  if (diffMs < 60 * 60 * 1000)
    return Math.floor(diffMs / (60 * 1000)) + " 分钟前";
  if (diffMs < 24 * 60 * 60 * 1000)
    return Math.floor(diffMs / (60 * 60 * 1000)) + " 小时前";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return "昨天";
  }
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + " 天前";
}

function createFeedCardHTML(item, fallbackOgImage) {
  const title = escapeHtml(item.title || "无标题");
  const link = item.link || "#";
  const published =
    typeof item.published === "string" || typeof item.published === "number"
      ? getDisplayDate(item.published)
      : "日期未知";
  const blogName =
    typeof item.blog_name === "string" ? escapeHtml(item.blog_name.trim()) : "";
  const category =
    typeof item.category === "string" ? escapeHtml(item.category.trim()) : "";
  let imgSrc = (item.avatar && item.avatar.trim()) || fallbackOgImage || "";
  if (imgSrc && !/^https?:\/\//i.test(imgSrc) && !imgSrc.startsWith("//")) {
    const base = typeof location !== "undefined" ? location.origin : "";
    imgSrc = base + (imgSrc.startsWith("/") ? imgSrc : "/" + imgSrc);
  }
  const fallbackSrc = fallbackOgImage
    ? fallbackOgImage.replace(/'/g, "\\'")
    : "";
  let onerror = "";
  if (fallbackOgImage) {
    const svgFallback =
      imgSrc && imgSrc.endsWith("/favicon.ico")
        ? imgSrc.replace(/\/favicon\.ico$/, "/favicon.svg").replace(/'/g, "\\'")
        : "";
    if (svgFallback) {
      onerror = `this.onerror=null;this.src='${svgFallback}';this.onerror=function(){this.onerror=null;this.src='${fallbackSrc}';};`;
    } else {
      onerror = `this.onerror=null;this.src='${fallbackSrc}';`;
    }
  }

  const metaParts = [published];
  if (blogName) metaParts.push(blogName);
  if (category) metaParts.push(category);
  const metaText = metaParts.join(" · ");

  const avatarBlock = imgSrc
    ? `<div class="h-[40px] w-[40px] shrink-0 overflow-hidden rounded-md"><img src="${imgSrc.replace(/"/g, "&quot;")}" alt="" class="block h-full w-full object-cover" width="40" height="40" ${onerror ? `onerror="${onerror.replace(/"/g, "&quot;")}"` : ""} /></div>`
    : "";

  const titleBlock =
    link && link !== "#"
      ? `<div class="text-accent min-w-0 text-lg font-medium underline-offset-4"><h3 class="!m-0 truncate overflow-hidden whitespace-nowrap min-w-0"><a href="${link.replace(/"/g, "&quot;")}" class="text-sm font-medium hover:underline focus-visible:no-underline focus-visible:underline-offset-0" target="_blank" rel="noopener noreferrer">${title}</a></h3></div>`
      : `<div class="text-accent min-w-0 text-lg font-medium underline-offset-4"><h3 class="!m-0 truncate overflow-hidden whitespace-nowrap min-w-0"><span class="text-sm font-medium">${title}</span></h3></div>`;

  return `
<li class="feeds-card-wrapper mb-4">
  <div class="relative block">
    <div class="feeds-card flex items-center gap-3">
      ${avatarBlock}
      <div class="min-w-0 flex-1">
        ${titleBlock}
        <div class="feeds-card-meta mt-1 opacity-80 text-[var(--text-secondary)] text-sm">${metaText}</div>
      </div>
    </div>
  </div>
</li>`;
}

export async function initFeeds(
  _siteTimezone,
  fallbackOgImageGlobal,
  initialItemCount,
  itemsPerPage,
  dataSourceUrl,
  hasInitialItems,
  items
) {
  const feedsListElement = document.getElementById("feeds-list");
  const loadMoreTrigger = document.getElementById("load-more-trigger");
  const loadingContainer = document.getElementById("feeds-loading");
  const errorContainer = document.getElementById("feeds-error");
  const noContentContainer = document.getElementById("feeds-no-content");

  if (
    !feedsListElement ||
    !loadingContainer ||
    !errorContainer ||
    !noContentContainer
  ) {
    return;
  }

  let allFeeds = [];
  let currentIndex = 0;
  let observer;

  if (hasInitialItems && Array.isArray(items) && items.length > 0) {
    allFeeds = items;
    currentIndex = initialItemCount;
    loadingContainer.classList.add("hidden");
    if (loadMoreTrigger && allFeeds.length > initialItemCount) {
      loadMoreTrigger.style.display = "flex";
      observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) loadMoreItems(itemsPerPage);
        },
        { threshold: 0.1 }
      );
      observer.observe(loadMoreTrigger);
    } else if (loadMoreTrigger) {
      loadMoreTrigger.style.display = "none";
    }
    return;
  }

  async function fetchFeeds() {
    if (!dataSourceUrl || !dataSourceUrl.trim()) {
      loadingContainer.classList.add("hidden");
      errorContainer.classList.remove("hidden");
      if (loadMoreTrigger) loadMoreTrigger.style.display = "none";
      return;
    }
    try {
      const response = await fetch(dataSourceUrl);
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const data = await response.json();
      allFeeds = Array.isArray(data.items) ? data.items : [];
      loadingContainer.classList.add("hidden");

      if (allFeeds.length === 0) {
        noContentContainer.classList.remove("hidden");
        if (loadMoreTrigger) loadMoreTrigger.style.display = "none";
        return;
      }

      loadMoreItems(initialItemCount);

      if (loadMoreTrigger && allFeeds.length > initialItemCount) {
        loadMoreTrigger.style.display = "flex";
        observer = new IntersectionObserver(
          entries => {
            if (entries[0].isIntersecting) loadMoreItems(itemsPerPage);
          },
          { threshold: 0.1 }
        );
        observer.observe(loadMoreTrigger);
      } else if (loadMoreTrigger) {
        loadMoreTrigger.style.display = "none";
      }
    } catch {
      loadingContainer.classList.add("hidden");
      errorContainer.classList.remove("hidden");
      if (loadMoreTrigger) loadMoreTrigger.style.display = "none";
    }
  }

  function loadMoreItems(count) {
    if (!feedsListElement) return;
    const itemsToLoad = allFeeds.slice(currentIndex, currentIndex + count);

    if (itemsToLoad.length === 0) {
      if (loadMoreTrigger) loadMoreTrigger.style.display = "none";
      if (observer) observer.disconnect();
      return;
    }

    let html = "";
    itemsToLoad.forEach(item => {
      html += createFeedCardHTML(item, fallbackOgImageGlobal);
    });
    feedsListElement.insertAdjacentHTML("beforeend", html);
    currentIndex += itemsToLoad.length;

    if (currentIndex >= allFeeds.length) {
      if (loadMoreTrigger) loadMoreTrigger.style.display = "none";
      if (observer) observer.disconnect();
    }
  }

  await fetchFeeds();
}

function run() {
  const dataElement = document.getElementById("feeds-data-json-container");
  if (!dataElement || !dataElement.dataset.json) return;
  try {
    const d = JSON.parse(dataElement.dataset.json);
    initFeeds(
      d.siteTimezone,
      d.fallbackOgImage,
      d.initialItemCount,
      d.itemsPerPage,
      d.dataSourceUrl,
      d.hasInitialItems === true,
      d.items || []
    );
  } catch {
    const loadingContainer = document.getElementById("feeds-loading");
    const errorContainer = document.getElementById("feeds-error");
    if (loadingContainer) loadingContainer.classList.add("hidden");
    if (errorContainer) errorContainer.classList.remove("hidden");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run);
} else {
  run();
}
document.addEventListener("astro:page-load", run);
