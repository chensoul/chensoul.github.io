/**
 * 年度进度条：计算全年进度、动画、悬停/点击交互，astro:after-swap 时无动画更新
 */

const ANIMATION_DURATION = 1200;
const LABEL_HIDE_DELAY = 2000;
const HOVER_HIDE_DELAY = 1000;

type YearProgressEls = {
  container: HTMLElement;
  fill: HTMLElement;
  label: HTMLElement;
  cover: HTMLElement;
  popup: HTMLElement;
};

function calcProgress(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return Math.min(1, Math.max(0, (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())));
}

function getElements(): {
  container: HTMLElement | null;
  fill: HTMLElement | null;
  label: HTMLElement | null;
  cover: HTMLElement | null;
  popup: HTMLElement | null;
} {
  return {
    container: document.getElementById("year-progress"),
    fill: document.getElementById("year-progress-fill"),
    label: document.getElementById("year-progress-label"),
    cover: document.getElementById("year-progress-cover"),
    popup: document.getElementById("year-progress-popup"),
  };
}

function show(el: HTMLElement | null): void {
  if (!el) return;
  el.classList.add("duration-300", "opacity-100");
}
function hide(el: HTMLElement | null): void {
  if (!el) return;
  el.classList.remove("duration-300", "opacity-100");
}

function positionLabel(els: YearProgressEls, progress: number): void {
  const cw = els.container.getBoundingClientRect().width;
  const lw = els.label.getBoundingClientRect().width || 0;
  const pw = els.popup.getBoundingClientRect().width || 0;
  const gap = 3;
  els.label.style.left = Math.min(cw * progress + gap, cw - lw) + "px";
  els.cover.style.left = els.label.style.left;
  els.cover.style.width = lw + "px";
  els.popup.style.left = Math.min(cw * progress + gap, cw - pw) + "px";
}

function setProgress(els: YearProgressEls, progress: number): void {
  const text = (progress * 100).toFixed(1) + "%";
  els.fill.style.width = text;
  els.label.textContent = text;
  els.container.setAttribute("title", text);
  positionLabel(els, progress);
}

function animateProgress(els: YearProgressEls, target: number, onComplete?: () => void): void {
  const startTs = performance.now();
  function step(ts: number): void {
    const t = Math.min(1, (ts - startTs) / ANIMATION_DURATION);
    const current = target * t;
    els.fill.style.width = (current * 100).toFixed(3) + "%";
    els.label.textContent = (current * 100).toFixed(1) + "%";
    positionLabel(els, current);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      setProgress(els, target);
      onComplete?.();
    }
  }
  requestAnimationFrame(step);
}

let popupHideTimer: ReturnType<typeof setTimeout> | null = null;

function bindEvents(els: YearProgressEls, getProgress: () => number): void {
  if (els.container.dataset.bound) return;
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  els.container.addEventListener("mouseenter", () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    show(els.label);
    show(els.cover);
    positionLabel(els, getProgress());
  });

  els.container.addEventListener("mouseleave", () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      hide(els.label);
      hide(els.cover);
    }, HOVER_HIDE_DELAY);
  });

  els.container.addEventListener("click", () => {
    const now = new Date();
    const end = new Date(now.getFullYear() + 1, 0, 1);
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    els.popup.textContent = `今年还剩下${daysLeft}天，要珍惜时间哦 😁`;
    show(els.popup);
    positionLabel(els, getProgress());
    if (popupHideTimer) clearTimeout(popupHideTimer);
    popupHideTimer = setTimeout(() => hide(els.popup), LABEL_HIDE_DELAY);
  });

  els.container.dataset.bound = "1";
}

function init(): void {
  const raw = getElements();
  if (!raw.container || !raw.fill || !raw.label || !raw.cover || !raw.popup) return;
  const els: YearProgressEls = raw as YearProgressEls;

  const target = calcProgress();
  let currentProgress = 0;

  show(els.label);
  show(els.cover);

  animateProgress(els, target, () => {
    currentProgress = target;
    setTimeout(() => {
      hide(els.label);
      hide(els.cover);
    }, LABEL_HIDE_DELAY);
  });

  const startTs = performance.now();
  const progressInterval = setInterval(() => {
    const t = Math.min(1, (performance.now() - startTs) / ANIMATION_DURATION);
    currentProgress = target * t;
    if (t >= 1) clearInterval(progressInterval);
  }, 16);

  bindEvents(els, () => currentProgress || target);
}

function update(): void {
  const raw = getElements();
  if (!raw.container || !raw.fill || !raw.label || !raw.cover || !raw.popup) return;
  const els: YearProgressEls = raw as YearProgressEls;
  const target = calcProgress();
  setProgress(els, target);
  bindEvents(els, () => target);
}

init();
document.addEventListener("astro:after-swap", update);
