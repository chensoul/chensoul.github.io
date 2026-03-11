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

  const imgTag = imgSrc
    ? `<img src="${imgSrc.replace(/"/g, "&quot;")}" alt="" class="feeds-card-avatar" width="40" height="40" ${onerror ? `onerror="${onerror.replace(/"/g, "&quot;")}"` : ""} />`
    : "";

  const titleLink =
    link && link !== "#"
      ? `<a href="${link.replace(/"/g, "&quot;")}" class="feeds-card-title" target="_blank" rel="noopener noreferrer">${title}</a>`
      : `<span class="feeds-card-title">${title}</span>`;

  return `
<li class="feeds-card-wrapper">
  <div class="feeds-card">
    ${imgTag ? `<span class="feeds-card-avatar-wrap">${imgTag}</span>` : ""}
    <span class="feeds-card-content">
      ${titleLink}
      <span class="feeds-card-meta">${metaText}</span>
    </span>
  </div>
</li>`;
}

export async function initFeeds(
  siteTimezone,
  fallbackOgImageGlobal,
  initialItemCount,
  itemsPerPage,
  dataSourceUrl
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
      d.dataSourceUrl
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
