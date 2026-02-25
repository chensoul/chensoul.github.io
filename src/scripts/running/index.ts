/**
 * Running 页面客户端逻辑：类型、常量、工具、HTML 构建、周期 Tab、初始化
 */

/* ---------- 类型 ---------- */
export interface RunListItem {
  date: string;
  distance: number;
  duration: string;
  pace: string;
  hr_zone?: number;
  activity_type?: string;
  workout_name?: string;
  route?: string;
  vdot?: number;
  training_load?: number;
  [key: string]: unknown;
}

export interface RunDetail extends RunListItem {
  total_duration?: string;
  heart_rate?: number;
  max_heart_rate?: number;
  cadence?: number;
  stride_length?: number;
  calories?: number;
  elevation_gain?: number;
  avg_power?: number;
  max_power?: number;
  segments?: Array<{
    km?: number;
    pace?: string;
    gap?: string;
    heart_rate?: number;
    hr_zone?: number;
    cadence?: number;
    avg_cadence?: number;
  }>;
  laps?: Array<{
    distance?: number;
    pace?: string;
    cadence?: number;
    power?: number;
    heart_rate?: number;
    hr_zone?: number;
  }>;
}

/* ---------- 常量 ---------- */
const DOM_IDS = {
  runList: "runList",
  periodTabNav: "periodTabNav",
  loadMoreBtn: "loadMoreBtn",
  runDetailModal: "runDetailModal",
  modalBody: "modalBody",
  modalClose: "modalClose",
  modalOverlay: "modalOverlay",
} as const;

const DETAIL_ICONS: Record<string, string> = {
  distance:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  duration:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pace: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  heartRate:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  cadence:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v12"/><path d="M2 18h20"/></svg>',
  stride:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18l-6-16-4 8-4-8-6 16z"/></svg>',
  power:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>',
  calories:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4-4 8-7.5 8-12a8 8 0 0 0-16 0c0 4.5 4 8 8 12z"/><path d="M12 8v4"/><path d="M10 10h4"/></svg>',
  elevation:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  vdot: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>',
  load: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  location:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
};

const RUN_CARD_CLASS =
  "run-card run-card cursor-pointer rounded-lg border border-[var(--border)] p-4 shadow-sm transition-all hover:border-[var(--accent)] hover:shadow-md";

/* ---------- 工具 ---------- */
function fmtDuration(d: string): string {
  const hourMatch = d.match(/(\d+)小时/);
  const minMatch = d.match(/(\d+)分钟/);
  const h = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const m = minMatch ? parseInt(minMatch[1], 10) : 0;
  if (h > 0 && m > 0) return `${h}h${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getPaceClass(paceStr: string | undefined): string {
  if (!paceStr || paceStr === "-") return "";
  const m = paceStr.match(/(\d+)'(\d+)"/);
  const sec = m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 360;
  return sec < 345 ? "fast" : sec < 375 ? "medium" : "slow";
}

/* ---------- 详情弹窗 HTML ---------- */
function buildDetailStats(run: RunDetail): Array<{ icon: string; label: string; value: string }> {
  return [
    { icon: DETAIL_ICONS.distance, label: "距离", value: `${run.distance} km` },
    { icon: DETAIL_ICONS.duration, label: "移动时间", value: fmtDuration(run.duration) },
    { icon: DETAIL_ICONS.duration, label: "总时间", value: fmtDuration(run.total_duration ?? run.duration) },
    { icon: DETAIL_ICONS.pace, label: "配速", value: `${run.pace} /km` },
    {
      icon: DETAIL_ICONS.heartRate,
      label: "平均心率",
      value: run.heart_rate != null && run.heart_rate > 0 ? `${Math.round(run.heart_rate)} bpm` : "-",
    },
    {
      icon: DETAIL_ICONS.heartRate,
      label: "最大心率",
      value: run.max_heart_rate != null && run.max_heart_rate > 0 ? `${Math.round(run.max_heart_rate)} bpm` : "-",
    },
    {
      icon: DETAIL_ICONS.stride,
      label: "步幅",
      value: run.stride_length != null && run.stride_length > 0 ? `${run.stride_length.toFixed(2)} m` : "-",
    },
    { icon: DETAIL_ICONS.power, label: "平均功率", value: `${Math.round(run.avg_power ?? 0)} w` },
    { icon: DETAIL_ICONS.power, label: "最大功率", value: `${Math.round(run.max_power ?? 0)} w` },
    {
      icon: DETAIL_ICONS.calories,
      label: "热量消耗",
      value: run.calories != null && run.calories > 0 ? `${Math.round(run.calories)} kcal` : "-",
    },
    {
      icon: DETAIL_ICONS.elevation,
      label: "累计爬升",
      value: run.elevation_gain != null && run.elevation_gain > 0 ? `${Math.round(run.elevation_gain)} m` : "-",
    },
    {
      icon: DETAIL_ICONS.load,
      label: "训练负荷",
      value: run.training_load != null && run.training_load > 0 ? String(run.training_load) : "-",
    },
  ];
}

function buildSegmentsHtml(run: RunDetail, hrZoneLabels: Record<number, string>): string {
  const segs = run.segments;
  if (!segs?.length) return "";
  const rows = segs
    .map((seg, idx) => {
      const z = seg?.hr_zone != null ? (hrZoneLabels[seg.hr_zone]?.split(" ")[0] ?? "") : "";
      const paceClass = getPaceClass(seg?.pace);
      const paceCell = seg?.pace
        ? paceClass
          ? `<span class="segment-pace-tag pace-${paceClass}">${seg.pace}</span>`
          : `<span class="segment-pace-tag">${seg.pace}</span>`
        : "-";
      const hasHr = seg?.heart_rate != null && Number(seg.heart_rate) > 0;
      const hrCell = hasHr
        ? seg?.hr_zone != null && seg.hr_zone > 0
          ? `<span class="hr-zone-tag zone-${seg.hr_zone}">${seg.heart_rate} ${z}</span>`
          : `<span class="hr-zone-tag">${seg.heart_rate}</span>`
        : "-";
      const segCadence = seg?.cadence ?? (seg as { avg_cadence?: number }).avg_cadence;
      const cadenceNum =
        typeof segCadence === "number" ? segCadence : typeof segCadence === "string" ? parseFloat(segCadence) : NaN;
      const cadenceCell = Number.isFinite(cadenceNum) && cadenceNum >= 0 ? Math.round(cadenceNum) : "-";
      return `<tr class="border-b border-[var(--border)] hover:bg-[var(--muted)]/20"><td class="p-2">${seg?.km ?? idx + 1}</td><td class="p-2 text-xs">${paceCell}</td><td class="p-2">${seg?.gap ?? seg?.pace ?? "-"}</td><td class="p-2">${cadenceCell}</td><td class="p-2 text-xs">${hrCell}</td></tr>`;
    })
    .join("");
  return `<div class="detail-section mt-6"><h4 class="section-subtitle mb-1 text-[0.9375rem] font-semibold text-[var(--foreground)]">分段数据</h4><div class="segments-table-wrapper overflow-x-auto rounded-lg border border-[var(--border)]"><table class="segments-table w-full border-collapse text-[13px]"><thead><tr class="border-b border-[var(--border)] bg-[var(--muted)]/30"><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">公里</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">配速</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">GAP</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">步频</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">心率</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function buildModalHtml(run: RunDetail, hrZoneLabels: Record<number, string>): string {
  const zone = run.hr_zone ?? 0;
  const hrBadge =
    zone > 0
      ? `<span class="detail-hr-zone hr-zone-tag zone-${zone} rounded px-2 py-0.5 text-xs font-semibold">${hrZoneLabels[zone]}</span>`
      : "";
  const detailStats = buildDetailStats(run);
  const statsGrid = detailStats
    .map(
      (s) =>
        `<div class="detail-stat-item flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2.5 text-[13px]"><span class="detail-stat-icon flex h-4 w-4 flex-shrink-0 items-center justify-center">${s.icon}</span><span class="detail-stat-label text-[var(--foreground)]/70">${s.label}</span><span class="detail-stat-value font-semibold text-[var(--foreground)]">${s.value}</span></div>`
    )
    .join("");
  const segmentsHtml = buildSegmentsHtml(run, hrZoneLabels);
  const routeHtml = run.route?.trim()
    ? `<span class="detail-route flex items-center gap-1.5 text-xs text-[var(--foreground)]/80"><span class="detail-route-icon inline-flex h-4 w-4 flex-shrink-0 items-center justify-center">${DETAIL_ICONS.location}</span>${run.route.trim()}</span>`
    : "";
  return `
    <div class="detail-header border-b border-[var(--border)] pb-4">
      <h3 class="detail-title text-lg font-semibold text-[var(--foreground)]">${run.workout_name || "跑步"}</h3>
      <div class="detail-meta mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span class="detail-date text-[var(--foreground)]">${run.date}</span>
        ${hrBadge}
        <span class="detail-type rounded border border-[var(--border)] bg-[var(--muted)]/30 px-2 py-0.5 text-xs text-[var(--foreground)]">${run.activity_type || "户外跑步"}</span>
        ${routeHtml}
      </div>
    </div>
    <div class="detail-stats-grid mt-6 grid grid-cols-3 gap-3">
      ${statsGrid}
    </div>
    ${segmentsHtml}
  `;
}

/* ---------- 列表卡片 HTML（加载更多用） ---------- */
function createRunCardHtml(run: RunListItem, hrZoneLabels: Record<number, string>): string {
  const zone = run.hr_zone ?? 0;
  const hrBadge =
    zone > 0
      ? `<span class="hr-zone-badge hr-zone-tag zone-${zone} inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold">${hrZoneLabels[zone]}</span>`
      : "";
  const workoutExtra =
    run.route?.trim() || run.workout_name
      ? ` <span class="workout-name">· ${run.route?.trim() || run.workout_name || ""}</span>`
      : "";
  const loadStat =
    (run.training_load ?? 0) > 0
      ? `<div class="stat load-stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold">${run.training_load ?? 0}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">负荷</span></div>`
      : "";
  return `
    <div class="run-main flex flex-1 flex-col gap-1.5">
      <div class="run-header flex flex-wrap items-center gap-2.5">
        <time class="run-date text-sm font-medium text-[var(--foreground)]">${run.date.split(" ")[0]}</time>
        ${hrBadge}
      </div>
      <span class="run-type text-[13px] text-[var(--foreground)]/80">${run.activity_type || "户外跑步"}${workoutExtra}</span>
    </div>
    <div class="run-stats flex gap-5">
      <div class="stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold text-[var(--foreground)]">${run.distance}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">km</span></div>
      <div class="stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold text-[var(--foreground)]">${fmtDuration(run.duration)}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">时长</span></div>
      <div class="stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold text-[var(--foreground)]">${run.pace}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">配速</span></div>
      <div class="stat vdot-stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold">${run.vdot ?? "-"}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">VDOT</span></div>
      ${loadStat}
    </div>
  `;
}

/* ---------- 周期 Tab ---------- */
function setupPeriodTabs(container: Element | null): void {
  if (!container) return;
  container.addEventListener("click", (e: Event) => {
    const btn = (e.target as HTMLElement)?.closest?.(".period-tab-btn") as HTMLElement | null;
    if (!btn?.dataset?.period) return;
    const period = btn.dataset.period;
    document.querySelectorAll(".period-tab-btn").forEach((b) => {
      b.classList.remove("border-[var(--accent)]", "text-[var(--accent)]");
      b.classList.add("border-transparent", "text-[var(--foreground)]/70");
    });
    btn.classList.add("border-[var(--accent)]", "text-[var(--accent)]");
    btn.classList.remove("border-transparent", "text-[var(--foreground)]/70");
    document.querySelectorAll(".period-panel").forEach((panel) => {
      const el = panel as HTMLElement;
      el.classList.add("hidden");
      if (el.dataset?.panel === period) el.classList.remove("hidden");
    });
  });
}

/* ---------- 初始化 ---------- */
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
        // ignore
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
