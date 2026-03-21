/**
 * 订阅条目的日期显示：与 feeds.js 的 getDisplayDate 逻辑一致，供订阅卡片服务端渲染使用。
 */

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 今年内返回相对时间（中文），否则返回 YYYY-MM-DD。
 */
export function formatFeedDate(
  value: string | number | null | undefined
): string {
  if (value == null || value === "") return "日期未知";
  const d = new Date(value);
  if (Number.isNaN(d.getTime()))
    return typeof value === "string" ? value : "日期未知";
  const now = new Date();
  if (d.getFullYear() !== now.getFullYear()) return formatDateYYYYMMDD(d);
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return formatDateYYYYMMDD(d);
  if (diffMs < 60 * 1000) return "刚刚";
  if (diffMs < 60 * 60 * 1000)
    return `${Math.floor(diffMs / (60 * 1000))} 分钟前`;
  if (diffMs < 24 * 60 * 60 * 1000)
    return `${Math.floor(diffMs / (60 * 60 * 1000))} 小时前`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return "昨天";
  }
  return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))} 天前`;
}
