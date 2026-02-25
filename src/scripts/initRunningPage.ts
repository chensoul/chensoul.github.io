/**
 * Running 页面客户端入口：周期切换、列表展开、详情弹窗
 * 逻辑封装在 @/scripts/running 各模块
 */
import { boot } from "@/scripts/running/init";

document.addEventListener("astro:page-load", boot);
document.addEventListener("astro:after-swap", boot);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
