export function updateButtonPosition(buttonId: string): void {
  const btn = document.getElementById(buttonId);
  const frame = document.getElementById("main-content");

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
