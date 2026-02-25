/**
 * 按钮位置计算工具
 *
 * @fileoverview 统一管理固定按钮（BackButton、BackToTop）的位置计算逻辑
 *
 * 核心逻辑：
 * - 计算 site-frame 容器右侧的可用空间
 * - 如果空间足够，将按钮放在容器外部（距离容器边缘 16px）
 * - 如果空间不够，将按钮固定在视口右侧（距离边缘 1rem）
 *
 * 依赖关系：
 * - 被 BackButton.astro 和 BackToTop.astro 共享使用
 * - 避免重复代码，统一位置计算算法
 */

/**
 * 更新按钮的水平位置
 *
 * 算法说明：
 * 1. 获取 site-frame 容器的位置信息
 * 2. 计算容器右侧到视口右边缘的距离（rightOffset）
 * 3. 判断是否有足够空间放置按钮：
 *    - 需要的空间 = 按钮宽度 + 32px（左右各 16px 的安全间距）
 *    - 如果 rightOffset < 需要的空间，说明空间不够
 * 4. 根据空间情况设置按钮位置：
 *    - 空间不够：固定在视口右侧 1rem
 *    - 空间够：放在容器外部，距离容器边缘 16px
 *
 * @param buttonId - 按钮元素的 ID
 *
 * @example
 * // 在 BackButton 中使用
 * updateButtonPosition("back-button");
 *
 * @example
 * // 在 BackToTop 中使用
 * updateButtonPosition("back-to-top");
 */
export function updateButtonPosition(buttonId: string): void {
  const btn = document.getElementById(buttonId);
  const frame = document.getElementById("site-frame");

  // 如果按钮或容器不存在，直接返回
  if (!btn || !frame) return;

  // 获取容器的位置信息
  const frameRect = frame.getBoundingClientRect();

  // 计算容器右侧到视口右边缘的距离
  const rightOffset = window.innerWidth - frameRect.right;

  // 获取按钮的宽度
  const btnWidth = btn.offsetWidth;

  // 判断空间是否足够（需要按钮宽度 + 32px 的安全间距）
  if (rightOffset < btnWidth + 32) {
    // 空间不够，固定在视口右侧
    btn.style.right = "1rem";
  } else {
    // 空间够，放在容器外部，距离容器边缘 16px
    btn.style.right = `${rightOffset - btnWidth - 16}px`;
  }
}
