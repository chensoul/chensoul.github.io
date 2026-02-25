/**
 * Running 周期 Tab 切换（周/月/年/总）
 */
export function setupPeriodTabs(container: Element | null): void {
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
