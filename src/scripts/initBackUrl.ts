/**
 * 将 #main-content 的 data-backurl 存到 sessionStorage，供返回按钮使用
 */
document.addEventListener("astro:page-load", () => {
  const mainContent = document.querySelector("#main-content") as HTMLElement | null;
  const backUrl = mainContent?.dataset?.backurl;
  if (backUrl) {
    sessionStorage.setItem("backUrl", backUrl);
  }
});
