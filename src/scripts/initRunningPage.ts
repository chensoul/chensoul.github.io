/**
 * Running 页面客户端逻辑：周期切换、列表展开、详情弹窗
 */

interface RunListItem {
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

interface RunDetail {
  date: string;
  distance: number;
  duration: string;
  total_duration?: string;
  pace: string;
  hr_zone?: number;
  activity_type?: string;
  workout_name?: string;
  vdot?: number;
  training_load?: number;
  heart_rate?: number;
  max_heart_rate?: number;
  cadence?: number;
  stride_length?: number;
  calories?: number;
  elevation_gain?: number;
  avg_power?: number;
  max_power?: number;
  route?: string;
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

async function initRunningPage(): Promise<void> {
  const runList = document.getElementById("runList");
  if (!runList || runList.dataset.runningInited === "true") return;
  runList.dataset.runningInited = "true";

  const tabNav = document.getElementById("periodTabNav");
  if (tabNav) {
    tabNav.addEventListener("click", (e: Event) => {
      const target = (e.target as HTMLElement | null) ?? null;
      const btn = target?.closest?.(".period-tab-btn") as HTMLElement | null;
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

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const modal = document.getElementById("runDetailModal");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const modalOverlay = document.getElementById("modalOverlay");

  let allRuns: RunListItem[] = [];
  try {
    const url = runList.dataset.runningJson || "/data/running.json";
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { runs?: RunListItem[] };
      allRuns = data.runs || [];
    }
  } catch {
    allRuns = [];
  }
  const hrZoneLabelsData = JSON.parse(runList.dataset.hrZoneLabels || "{}") as Record<number, string>;
  let isExpanded = false;

  function fmtDuration(d: string): string {
    const hourMatch = d.match(/(\d+)小时/);
    const minMatch = d.match(/(\d+)分钟/);
    const h = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const m = minMatch ? parseInt(minMatch[1], 10) : 0;
    if (h > 0 && m > 0) return `${h}h${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  const detailIcons: Record<string, string> = {
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

  function openModal(run: RunDetail): void {
    if (!modal || !modalBody) return;
    const zone = run.hr_zone ?? 0;
    const hrBadge =
      zone > 0
        ? `<span class="detail-hr-zone hr-zone-tag zone-${zone} rounded px-2 py-0.5 text-xs font-semibold">${hrZoneLabelsData[zone]}</span>`
        : "";

    const detailStats: Array<{ icon: string; label: string; value: string }> = [
      { icon: detailIcons.distance, label: "距离", value: `${run.distance} km` },
      { icon: detailIcons.duration, label: "移动时间", value: fmtDuration(run.duration) },
      { icon: detailIcons.duration, label: "总时间", value: fmtDuration(run.total_duration ?? run.duration) },
      { icon: detailIcons.pace, label: "配速", value: `${run.pace} /km` },
      {
        icon: detailIcons.heartRate,
        label: "平均心率",
        value: run.heart_rate != null && run.heart_rate > 0 ? `${Math.round(run.heart_rate)} bpm` : "-",
      },
      {
        icon: detailIcons.heartRate,
        label: "最大心率",
        value: run.max_heart_rate != null && run.max_heart_rate > 0 ? `${Math.round(run.max_heart_rate)} bpm` : "-",
      },
      {
        icon: detailIcons.stride,
        label: "步幅",
        value: run.stride_length != null && run.stride_length > 0 ? `${run.stride_length.toFixed(2)} m` : "-",
      },
      { icon: detailIcons.power, label: "平均功率", value: `${Math.round(run.avg_power ?? 0)} w` },
      { icon: detailIcons.power, label: "最大功率", value: `${Math.round(run.max_power ?? 0)} w` },
      {
        icon: detailIcons.calories,
        label: "热量消耗",
        value: run.calories != null && run.calories > 0 ? `${Math.round(run.calories)} kcal` : "-",
      },
      {
        icon: detailIcons.elevation,
        label: "累计爬升",
        value: run.elevation_gain != null && run.elevation_gain > 0 ? `${Math.round(run.elevation_gain)} m` : "-",
      },
      {
        icon: detailIcons.load,
        label: "训练负荷",
        value: run.training_load != null && run.training_load > 0 ? String(run.training_load) : "-",
      },
    ];

    let segmentsHtml = "";
    if (run.segments && run.segments.length > 0) {
      const segs = run.segments;
      const getPaceClass = (paceStr: string | undefined): string => {
        if (!paceStr || paceStr === "-") return "";
        const m = paceStr.match(/(\d+)'(\d+)"/);
        const sec = m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 360;
        return sec < 345 ? "fast" : sec < 375 ? "medium" : "slow";
      };
      const rows = segs
        .map((seg, idx) => {
          const z = seg?.hr_zone != null ? (hrZoneLabelsData[seg.hr_zone]?.split(" ")[0] ?? "") : "";
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
      segmentsHtml = `<div class="detail-section mt-6"><h4 class="section-subtitle mb-3 text-[0.9375rem] font-semibold text-[var(--foreground)]">分段数据</h4><div class="segments-table-wrapper overflow-x-auto rounded-lg border border-[var(--border)]"><table class="segments-table w-full border-collapse text-[13px]"><thead><tr class="border-b border-[var(--border)] bg-[var(--muted)]/30"><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">公里</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">配速</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">GAP</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">步频</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">心率</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }

    let lapsHtml = "";
    if (run.laps && run.laps.length > 0) {
      const laps = run.laps;
      const rows = laps
        .map((lap, idx) => {
          const z = lap?.hr_zone != null ? (hrZoneLabelsData[lap.hr_zone]?.split(" ")[0] ?? "") : "";
          return `<tr class="border-b border-[var(--border)] hover:bg-[var(--muted)]/20"><td class="p-2">${idx + 1}</td><td class="p-2">${lap?.distance != null ? lap.distance.toFixed(2) : "-"}</td><td class="p-2">${lap?.pace ?? "-"}</td><td class="p-2">${lap?.cadence ?? "-"}</td><td class="p-2">${lap?.power ?? "-"}</td><td class="p-2 text-xs">${lap?.heart_rate ?? "-"} ${z}</td></tr>`;
        })
        .join("");
      lapsHtml = `<div class="detail-section mt-6"><h4 class="section-subtitle mb-3 text-[0.9375rem] font-semibold text-[var(--foreground)]">记圈数据</h4><div class="overflow-x-auto rounded-lg border border-[var(--border)]"><table class="w-full border-collapse text-[13px]"><thead><tr class="border-b border-[var(--border)] bg-[var(--muted)]/30"><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">圈</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">距离(km)</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">配速</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">步频</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">功率</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">心率</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }

    modalBody.innerHTML = `
        <div class="detail-header border-b border-[var(--border)] pb-4">
          <h3 class="detail-title text-lg font-semibold text-[var(--foreground)]">${run.workout_name || "跑步"}</h3>
          <div class="detail-meta mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span class="detail-date text-[var(--foreground)]">${run.date}</span>
            ${hrBadge}
            <span class="detail-type rounded border border-[var(--border)] bg-[var(--muted)]/30 px-2 py-0.5 text-xs text-[var(--foreground)]">${run.activity_type || "户外跑步"}</span>
            ${run.route?.trim() ? `<span class="detail-route flex items-center gap-1.5 text-xs text-[var(--foreground)]/80"><span class="detail-route-icon inline-flex h-4 w-4 flex-shrink-0 items-center justify-center">${detailIcons.location}</span>${run.route.trim()}</span>` : ""}
          </div>
        </div>
        <div class="detail-stats-grid mt-6 grid grid-cols-3 gap-3">
          ${detailStats.map((s) => `<div class="detail-stat-item flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2.5 text-[13px]"><span class="detail-stat-icon flex h-4 w-4 flex-shrink-0 items-center justify-center">${s.icon}</span><span class="detail-stat-label text-[var(--foreground)]/70">${s.label}</span><span class="detail-stat-value font-semibold text-[var(--foreground)]">${s.value}</span></div>`).join("")}
        </div>
        ${segmentsHtml}
        ${lapsHtml}
      `;
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
      allRuns.slice(10).forEach((run: RunListItem, idx: number) => {
        const card = document.createElement("div");
        card.className =
          "run-card run-card cursor-pointer rounded-lg border border-[var(--border)] p-4 shadow-sm transition-all hover:border-[var(--accent)] hover:shadow-md";
        card.dataset.runIndex = String(10 + idx);
        card.dataset.run = JSON.stringify(run);
        const zone = run.hr_zone ?? 0;
        const hrBadge =
          zone > 0
            ? `<span class="hr-zone-badge hr-zone-tag zone-${zone} inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold">${hrZoneLabelsData[zone]}</span>`
            : "";
        card.innerHTML = `
            <div class="run-main flex flex-1 flex-col gap-1.5">
              <div class="run-header flex flex-wrap items-center gap-2.5">
                <time class="run-date text-sm font-medium text-[var(--foreground)]">${run.date.split(" ")[0]}</time>
                ${hrBadge}
              </div>
              <span class="run-type text-[13px] text-[var(--foreground)]/80">${run.activity_type || "户外跑步"}${(run.route?.trim()) || run.workout_name ? ` <span class="workout-name">· ${(run.route?.trim()) || run.workout_name || ""}</span>` : ""}</span>
            </div>
            <div class="run-stats flex gap-5">
              <div class="stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold text-[var(--foreground)]">${run.distance}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">km</span></div>
              <div class="stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold text-[var(--foreground)]">${fmtDuration(run.duration)}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">时长</span></div>
              <div class="stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold text-[var(--foreground)]">${run.pace}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">配速</span></div>
              <div class="stat vdot-stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold">${run.vdot ?? "-"}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">VDOT</span></div>
              ${(run.training_load ?? 0) > 0 ? `<div class="stat load-stat flex flex-col gap-0.5"><span class="stat-value text-base font-semibold">${run.training_load ?? 0}</span><span class="stat-label text-[11px] uppercase tracking-wide text-[var(--foreground)]/70">负荷</span></div>` : ""}
            </div>
          `;
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

document.addEventListener("astro:page-load", () => initRunningPage());
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initRunningPage());
} else {
  initRunningPage();
}
