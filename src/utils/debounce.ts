/**
 * 防抖工具函数
 *
 * @fileoverview 提供防抖和节流功能，优化高频事件处理
 *
 * 核心概念：
 * - 防抖（Debounce）：事件触发后等待 N 毫秒，如果期间再次触发则重新计时
 * - 节流（Throttle）：事件触发后 N 毫秒内只执行一次
 *
 * 使用场景：
 * - 防抖：搜索框输入、窗口 resize、表单验证
 * - 节流：滚动事件、鼠标移动、按钮点击
 *
 * 依赖关系：
 * - 被需要优化性能的组件调用（如 BackToTop、BackButton）
 */

/**
 * 防抖函数
 *
 * 工作原理：
 * 1. 函数被调用时，设置一个定时器
 * 2. 如果在定时器到期前再次调用，取消之前的定时器并重新设置
 * 3. 只有当定时器到期后，才真正执行函数
 *
 * @param func - 需要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * // 搜索框输入防抖
 * const handleSearch = debounce((value: string) => {
 *   console.log('搜索:', value);
 * }, 300);
 *
 * input.addEventListener('input', (e) => {
 *   handleSearch(e.target.value);
 * });
 *
 * @example
 * // 窗口 resize 防抖
 * const handleResize = debounce(() => {
 *   console.log('窗口大小:', window.innerWidth);
 * }, 150);
 *
 * window.addEventListener('resize', handleResize);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    // 清除之前的定时器
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    // 设置新的定时器
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * 节流函数
 *
 * 工作原理：
 * 1. 第一次调用立即执行
 * 2. 在 wait 时间内的后续调用会被忽略
 * 3. wait 时间过后，下一次调用会再次执行
 *
 * @param func - 需要节流的函数
 * @param wait - 等待时间（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * // 滚动事件节流
 * const handleScroll = throttle(() => {
 *   console.log('滚动位置:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 *
 * @example
 * // 按钮点击节流（防止重复提交）
 * const handleSubmit = throttle(() => {
 *   console.log('提交表单');
 * }, 1000);
 *
 * button.addEventListener('click', handleSubmit);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();

    // 如果距离上次执行已经超过 wait 时间，则执行函数
    if (now - lastTime >= wait) {
      func(...args);
      lastTime = now;
    }
  };
}

/**
 * 带立即执行选项的防抖函数
 *
 * @param func - 需要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否立即执行（true: 第一次调用立即执行，false: 等待后执行）
 * @returns 防抖后的函数
 *
 * @example
 * // 立即执行的防抖（第一次点击立即响应，后续点击需要等待）
 * const handleClick = debounceImmediate(() => {
 *   console.log('按钮被点击');
 * }, 1000, true);
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const callNow = immediate && timeout === null;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    }, wait);

    if (callNow) {
      func(...args);
    }
  };
}
