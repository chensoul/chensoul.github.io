/**
 * 日期时间工具
 *
 * 按指定时区取日期部分，避免 Date#getFullYear/getMonth/getDate 使用运行环境时区导致日差一天。
 */

/**
 * 在指定时区下取日期的年、月、日
 *
 * 用于文章 URL 路径和显示日期，保证与 frontmatter 中的 date（如 2026-02-26 07:00:00+08:00）的“日历日期”一致。
 *
 * @param date - 已解析的 Date 对象
 * @param timezone - IANA 时区，如 "Asia/Shanghai"
 * @returns { year, month, day } 补零后的字符串
 */
export function getDatePartsInTimezone(
  date: Date,
  timezone: string
): { year: string; month: string; day: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}
