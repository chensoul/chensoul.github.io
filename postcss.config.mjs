/**
 * 将依赖包 @font-face 中常见的 font-display: swap 改为 optional，
 * 减轻字体晚到时的布局抖动（较 swap 更稳；若需尽快显示 Web 字体可改回 swap 或去掉本插件）。
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
 */
export default {
  plugins: [
    function postcssFontDisplayOptionalOnSwap() {
      return {
        postcssPlugin: "font-display-optional-on-swap",
        Declaration(decl) {
          if (decl.prop !== "font-display") return;
          const v = decl.value?.trim().toLowerCase();
          if (v === "swap") decl.value = "optional";
        },
      };
    },
  ],
};
