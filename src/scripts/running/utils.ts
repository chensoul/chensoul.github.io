/**
 * Running 页面工具函数
 */

export function fmtDuration(d: string): string {
  const hourMatch = d.match(/(\d+)小时/);
  const minMatch = d.match(/(\d+)分钟/);
  const h = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const m = minMatch ? parseInt(minMatch[1], 10) : 0;
  if (h > 0 && m > 0) return `${h}h${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function getPaceClass(paceStr: string | undefined): string {
  if (!paceStr || paceStr === "-") return "";
  const m = paceStr.match(/(\d+)'(\d+)"/);
  const sec = m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 360;
  return sec < 345 ? "fast" : sec < 375 ? "medium" : "slow";
}
