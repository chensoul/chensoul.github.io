/**
 * Running 列表卡片 HTML 构建（用于「加载更多」动态插入）
 */
import type { RunListItem } from "./types";
import { fmtDuration } from "./utils";

export function createRunCardHtml(run: RunListItem, hrZoneLabels: Record<number, string>): string {
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
