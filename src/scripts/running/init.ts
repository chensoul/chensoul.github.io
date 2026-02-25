/**
 * Running 页面初始化：拉取数据、绑定弹窗与加载更多
 */
import type { RunListItem, RunDetail } from "./types";
import { DOM_IDS, RUN_CARD_CLASS } from "./constants";
import { buildModalHtml } from "./modalHtml";
import { createRunCardHtml } from "./runCardHtml";
import { setupPeriodTabs } from "./periodTabs";

export async function initRunningPage(): Promise<void> {
  const runList = document.getElementById(DOM_IDS.runList) as HTMLElement | null;
  if (!runList || runList.dataset.runningInited === "true") return;
  runList.dataset.runningInited = "true";

  setupPeriodTabs(document.getElementById(DOM_IDS.periodTabNav));

  const modal = document.getElementById(DOM_IDS.runDetailModal);
  const modalBody = document.getElementById(DOM_IDS.modalBody);
  const modalClose = document.getElementById(DOM_IDS.modalClose);
  const modalOverlay = document.getElementById(DOM_IDS.modalOverlay);
  const loadMoreBtn = document.getElementById(DOM_IDS.loadMoreBtn);

  let allRuns: RunListItem[] = [];
  try {
    const url = runList.dataset.runningJson || "/data/running.json";
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { runs?: RunListItem[] };
      allRuns = data.runs ?? [];
    }
  } catch {
    allRuns = [];
  }

  const hrZoneLabels = JSON.parse(runList.dataset.hrZoneLabels ?? "{}") as Record<number, string>;
  let isExpanded = false;

  function openModal(run: RunDetail): void {
    if (!modal || !modalBody) return;
    modalBody.innerHTML = buildModalHtml(run, hrZoneLabels);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  function closeModal(): void {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
  }

  runList.addEventListener("click", (e: Event) => {
    const card = (e.target as HTMLElement).closest(".run-card");
    if (!card) return;
    const runJson = card.getAttribute("data-run");
    if (runJson) {
      try {
        openModal(JSON.parse(runJson) as RunDetail);
      } catch {
        // ignore invalid run JSON
      }
    }
  });

  modalClose?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
  });

  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener("click", () => {
    if (!isExpanded) {
      allRuns.slice(10).forEach((run, idx) => {
        const card = document.createElement("div");
        card.className = RUN_CARD_CLASS;
        card.dataset.runIndex = String(10 + idx);
        card.dataset.run = JSON.stringify(run);
        card.innerHTML = createRunCardHtml(run, hrZoneLabels);
        runList.appendChild(card);
      });
      loadMoreBtn.innerHTML =
        '<span>收起</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(180deg)"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      isExpanded = true;
    } else {
      runList.querySelectorAll(".run-card").forEach((card, i) => {
        if (i >= 10) card.remove();
      });
      loadMoreBtn.innerHTML =
        '<span>更多</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      isExpanded = false;
      runList.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

export function boot(): void {
  initRunningPage();
}
