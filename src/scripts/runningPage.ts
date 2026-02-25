/**
 * 跑步页面客户端逻辑：周期 Tab、展开更多、详情弹窗
 */

export interface Segment {
  pace?: string;
  hr_zone?: number;
  km?: number;
  gap?: string;
  heart_rate?: number;
}

export interface RunRecord {
  hr_zone?: number;
  segments?: Segment[];
  date?: string;
  duration?: string;
  distance?: number;
  pace?: string;
  activity_type?: string;
  workout_name?: string;
  heart_rate?: number;
  max_heart_rate?: number;
  cadence?: number;
  stride_length?: number;
  avg_power?: number;
  max_power?: number;
  calories?: number;
  elevation_gain?: number;
  vdot?: number;
  training_load?: number;
  [key: string]: unknown;
}

type HrZoneMap = Record<number, string>;

const hrZoneLabels: HrZoneMap = {
  0: "",
  1: "Z1 恢复",
  2: "Z2 有氧",
  3: "Z3 节奏",
  4: "Z4 阈值",
  5: "Z5 最大",
};

const hrZoneColors: HrZoneMap = {
  0: "var(--text-secondary)",
  1: "#4ade80",
  2: "#60a5fa",
  3: "#fbbf24",
  4: "#fb923c",
  5: "#f87171",
};

function formatDuration(duration: string): string {
  const hourMatch = duration.match(/(\d+)小时/);
  const minMatch = duration.match(/(\d+)分钟/);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  if (hours > 0 && mins > 0) return `${hours}h${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

function paceToSeconds(paceStr: string): number {
  if (!paceStr || paceStr === "0'00\"") return 0;
  const match = paceStr.match(/(\d+)'(\d+)/);
  if (match) return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  return 0;
}

function getPaceBarWidth(paceStr: string, allPaces: string[] = []): number {
  const paceSeconds = paceToSeconds(paceStr);
  if (paceSeconds === 0) return 0;
  if (allPaces.length > 1) {
    const allSeconds = allPaces.map((p) => paceToSeconds(p)).filter((s) => s > 0);
    if (allSeconds.length > 1) {
      const minPace = Math.min(...allSeconds);
      const maxPace = Math.max(...allSeconds);
      const range = maxPace - minPace;
      if (range > 0) {
        const ratio = (maxPace - paceSeconds) / range;
        return Math.max(30, Math.min(100, 30 + ratio * 70));
      }
    }
  }
  const minSeconds = 240;
  const maxSeconds = 480;
  const ratio = (maxSeconds - paceSeconds) / (maxSeconds - minSeconds);
  return Math.max(20, Math.min(100, 20 + ratio * 80));
}

function getPaceBarClass(paceStr: string): string {
  const paceSeconds = paceToSeconds(paceStr);
  if (paceSeconds === 0) return "medium";
  if (paceSeconds < 330) return "fast";
  if (paceSeconds > 420) return "slow";
  return "medium";
}

export function initRunningPage(): void {
  const tabNav = document.getElementById("periodTabNav");
  if (tabNav) {
    tabNav.addEventListener("click", (e: Event) => {
      const btn = (e.target as HTMLElement | null)?.closest?.(".period-tab-btn");
      if (!btn) return;
      const period = (btn as HTMLElement).dataset.period;
      if (!period) return;
      document.querySelectorAll(".period-tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".period-panel").forEach((panel) => {
        panel.classList.remove("active");
        if ((panel as HTMLElement).dataset.panel === period) panel.classList.add("active");
      });
    });
  }

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const runList = document.getElementById("runList");
  if (loadMoreBtn && runList) {
    const listEl = runList as HTMLElement;
    const allRuns = JSON.parse(listEl.dataset.allRuns ?? "[]") as RunRecord[];
    let isExpanded = false;
    loadMoreBtn.addEventListener("click", () => {
      if (!isExpanded) {
        const remainingRuns = allRuns.slice(10);
        remainingRuns.forEach((run: RunRecord, idx: number) => {
          const runCard = document.createElement("div");
          runCard.className = "run-card";
          runCard.style.animation = "fadeIn 0.3s ease";
          runCard.dataset.runIndex = String(10 + idx);
          runCard.dataset.run = JSON.stringify(run);
          const z = run.hr_zone;
          const hrZoneBadge =
            z != null && z > 0
              ? `<span class="hr-zone-badge" style="background-color: ${hrZoneColors[z]}20; color: ${hrZoneColors[z]}; border: 1px solid ${hrZoneColors[z]}40;">${hrZoneLabels[z]}</span>`
              : "";
          const vdotStat = `<div class="stat vdot-stat"><span class="stat-value">${run.vdot ?? "-"}</span><span class="stat-label">VDOT</span></div>`;
          const loadStat =
            (run.training_load as number) > 0
              ? `<div class="stat load-stat"><span class="stat-value">${run.training_load}</span><span class="stat-label">负荷</span></div>`
              : "";
          const dateStr = typeof run.date === "string" ? run.date.split(" ")[0] : "";
          runCard.innerHTML = `
            <div class="run-main">
              <div class="run-header"><time class="run-date">${dateStr}</time>${hrZoneBadge}</div>
              <span class="run-type">${(run.activity_type as string) || "户外跑步"}${(run.workout_name as string) ? ` <span class="workout-name"> · ${run.workout_name}</span>` : ""}</span>
            </div>
            <div class="run-stats">
              <div class="stat"><span class="stat-value">${Number(run.distance).toFixed(1)}</span><span class="stat-label">km</span></div>
              <div class="stat"><span class="stat-value">${formatDuration((run.duration as string) ?? "")}</span><span class="stat-label">时长</span></div>
              <div class="stat"><span class="stat-value">${run.pace ?? ""}</span><span class="stat-label">配速</span></div>
              ${vdotStat}${loadStat}
            </div>
          `;
          runCard.addEventListener("click", () => openModal(run));
          runList.appendChild(runCard);
        });
        loadMoreBtn.innerHTML = `<span>收起</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        isExpanded = true;
      } else {
        const allCards = runList.querySelectorAll(".run-card");
        allCards.forEach((card, index) => {
          if (index >= 10) card.remove();
        });
        loadMoreBtn.innerHTML = `<span>更多</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        isExpanded = false;
        runList.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  const modal = document.getElementById("runDetailModal");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const modalOverlay = modal?.querySelector(".modal-overlay");

  function openModal(run: RunRecord): void {
    if (!modal || !modalBody) return;
    const hrZone = run.hr_zone;
    const hrZoneBadge =
      hrZone != null && hrZone > 0
        ? `<span class="detail-hr-zone" style="background-color: ${hrZoneColors[hrZone]}20; color: ${hrZoneColors[hrZone]}; border: 1px solid ${hrZoneColors[hrZone]}40;">${hrZoneLabels[hrZone]}</span>`
        : "";

    const icons: Record<string, string> = {
      distance: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
      duration: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      pace: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
      heartRate: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
      cadence: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"></circle><path d="M9 20l3-6 3 6"></path><path d="M6 8l6 2 6-2"></path><path d="M12 10V4"></path></svg>`,
      stride: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path><path d="M12 2v10"></path></svg>`,
      power: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
      calories: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
      elevation: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
      vdot: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
      load: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`,
    };

    const detailStats: { icon: string; label: string; value: string }[] = [];
    const dist = Number(run.distance);
    const dur = (run.duration as string) ?? "";
    detailStats.push({ icon: icons.distance, label: "距离", value: `${dist.toFixed(2)} km` });
    detailStats.push({ icon: icons.duration, label: "移动时间", value: formatDuration(dur) });
    detailStats.push({ icon: icons.duration, label: "总时间", value: formatDuration(dur) });
    detailStats.push({ icon: icons.pace, label: "配速", value: `${run.pace ?? ""} /km` });
    if (Number(run.heart_rate) > 0) detailStats.push({ icon: icons.heartRate, label: "平均心率", value: `${Math.round(Number(run.heart_rate))} bpm` });
    if (Number(run.max_heart_rate) > 0) detailStats.push({ icon: icons.heartRate, label: "最大心率", value: `${Math.round(Number(run.max_heart_rate))} bpm` });
    if (Number(run.cadence) > 0) detailStats.push({ icon: icons.cadence, label: "步频", value: `${Math.round(Number(run.cadence))} spm` });
    if (Number(run.stride_length) > 0) detailStats.push({ icon: icons.stride, label: "步幅", value: `${Number(run.stride_length).toFixed(2)} m` });
    if (Number(run.avg_power) > 0) detailStats.push({ icon: icons.power, label: "平均功率", value: `${Math.round(Number(run.avg_power))} w` });
    if (Number(run.max_power) > 0) detailStats.push({ icon: icons.power, label: "最大功率", value: `${Math.round(Number(run.max_power))} w` });
    if (Number(run.calories) > 0) detailStats.push({ icon: icons.calories, label: "热量消耗", value: `${Math.round(Number(run.calories))} kcal` });
    if (Number(run.elevation_gain) > 0) detailStats.push({ icon: icons.elevation, label: "累计爬升", value: `${Math.round(Number(run.elevation_gain))} m` });
    if (Number(run.vdot) > 0) detailStats.push({ icon: icons.vdot, label: "VDOT", value: Number(run.vdot).toFixed(1) });
    if (Number(run.training_load) > 0) detailStats.push({ icon: icons.load, label: "训练负荷", value: String(run.training_load) });

    let segmentsHtml = "";
    if (run.segments && run.segments.length > 0) {
      const allSegmentPaces = run.segments.map((s) => s.pace).filter((p): p is string => Boolean(p && p !== "0'00\""));
      const segmentRows = run.segments
        .map((seg: Segment, idx: number) => {
          const zoneClass = seg.hr_zone ? `zone-${seg.hr_zone}` : "";
          const zoneLabel = seg.hr_zone != null ? (hrZoneLabels[seg.hr_zone] ?? "").split(" ")[0] : "";
          const barWidth = getPaceBarWidth(seg.pace ?? "", allSegmentPaces);
          const barClass = getPaceBarClass(seg.pace ?? "");
          return `
          <tr>
            <td>${seg.km ?? idx + 1}</td>
            <td><div class="pace-bar"><div class="pace-bar-fill ${barClass}" style="width: ${barWidth}%"></div><span>${seg.pace ?? ""}</span></div></td>
            <td>${seg.gap ?? seg.pace ?? ""}</td>
            <td><span class="hr-zone-tag ${zoneClass}">${seg.heart_rate ?? "-"} ${zoneLabel}</span></td>
          </tr>
        `;
        })
        .join("");
      segmentsHtml = `
        <div class="detail-section">
          <h4 class="section-subtitle">分段数据</h4>
          <div class="segments-table-wrapper">
            <table class="segments-table">
              <thead><tr><th>公里</th><th>配速</th><th>GAP</th><th>心率</th></tr></thead>
              <tbody>${segmentRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = `
      <div class="detail-header">
        <h3 class="detail-title">${(run.workout_name as string) || "跑步"}</h3>
        <div class="detail-meta">
          <span class="detail-date">${(run.date as string) ?? ""}</span>
          ${hrZoneBadge}
          <span class="detail-type">${(run.activity_type as string) || "户外跑步"}</span>
        </div>
      </div>
      <div class="detail-stats-grid">
        ${detailStats.map((stat) => `<div class="detail-stat-item"><span class="detail-stat-icon">${stat.icon}</span><span class="detail-stat-label">${stat.label}</span><span class="detail-stat-value">${stat.value}</span></div>`).join("")}
      </div>
      ${segmentsHtml}
    `;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal(): void {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".run-card").forEach((card) => {
    card.addEventListener("click", () => {
      const runData = (card as HTMLElement).dataset.run;
      if (runData) openModal(JSON.parse(runData) as RunRecord);
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
