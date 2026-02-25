/**
 * Running 详情弹窗 HTML 构建
 */
import type { RunDetail } from "./types";
import { DETAIL_ICONS } from "./constants";
import { fmtDuration, getPaceClass } from "./utils";

export function buildDetailStats(run: RunDetail): Array<{ icon: string; label: string; value: string }> {
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

function buildLapsHtml(run: RunDetail, hrZoneLabels: Record<number, string>): string {
  const laps = run.laps;
  if (!laps?.length) return "";
  const rows = laps
    .map((lap, idx) => {
      const z = lap?.hr_zone != null ? (hrZoneLabels[lap.hr_zone]?.split(" ")[0] ?? "") : "";
      return `<tr class="border-b border-[var(--border)] hover:bg-[var(--muted)]/20"><td class="p-2">${idx + 1}</td><td class="p-2">${lap?.distance != null ? lap.distance.toFixed(2) : "-"}</td><td class="p-2">${lap?.pace ?? "-"}</td><td class="p-2">${lap?.cadence ?? "-"}</td><td class="p-2">${lap?.power ?? "-"}</td><td class="p-2 text-xs">${lap?.heart_rate ?? "-"} ${z}</td></tr>`;
    })
    .join("");
  return `<div class="detail-section mt-6"><h4 class="section-subtitle mb-1 text-[0.9375rem] font-semibold text-[var(--foreground)]">记圈数据</h4><div class="overflow-x-auto rounded-lg border border-[var(--border)]"><table class="w-full border-collapse text-[13px]"><thead><tr class="border-b border-[var(--border)] bg-[var(--muted)]/30"><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">圈</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">距离(km)</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">配速</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">步频</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">功率</th><th class="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">心率</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

export function buildModalHtml(run: RunDetail, hrZoneLabels: Record<number, string>): string {
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
  const lapsHtml = buildLapsHtml(run, hrZoneLabels);
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
    ${lapsHtml}
  `;
}
