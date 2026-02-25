/**
 * 搜索页初始化：加载 Pagefind UI、从 URL 读 q、自动触发搜索、同步 URL/sessionStorage
 */

function initSearch(): void {
  const pageFindSearch = document.querySelector("#pagefind-search") as HTMLElement | null;
  if (!pageFindSearch) return;

  const params = new URLSearchParams(window.location.search);
  const onIdle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));

  onIdle(async () => {
    // @ts-expect-error — Missing types for @pagefind/default-ui package.
    const { PagefindUI } = await import("@pagefind/default-ui");

    if (import.meta.env.DEV) {
      pageFindSearch.innerHTML = `
            <div class="bg-muted/75 rounded p-4 space-y-4 mb-4">
              <p><strong>DEV mode Warning! </strong>You need to build the project at least once to see the search results during development.</p>
              <code class="block bg-black text-white px-2 py-1 rounded">pnpm run build</code>
            </div>
          `;
    }

    const search = new PagefindUI({
      element: "#pagefind-search",
      showSubResults: true,
      showImages: false,
      processResult(result: { url: string; sub_results?: Array<{ url: string }> }) {
        const cleanUrl = (url: string) =>
          url
            .replace(/\.html$/, "")
            .replace(/\.html[?#]/, (match: string) => match.substring(5));
        result.url = cleanUrl(result.url);
        if (result.sub_results?.length) {
          result.sub_results.forEach((sub) => {
            sub.url = cleanUrl(sub.url);
          });
        }
        return result;
      },
      processTerm(term: string) {
        const trimmed = term.trim();
        if (!trimmed) return term;
        params.set("q", term);
        history.replaceState(history.state, "", "?" + params.toString());
        const backUrl = pageFindSearch?.dataset?.backurl;
        sessionStorage.setItem("backUrl", (backUrl ?? "") + "?" + params.toString());
        if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
          return `"${trimmed}"`;
        }
        return term;
      },
    });

    const query = params.get("q");
    if (query) search.triggerSearch(query);

    const searchInput = document.querySelector(".pagefind-ui__search-input");
    const clearButton = document.querySelector(".pagefind-ui__search-clear");
    const resetSearchParam = (e: Event) => {
      if ((e.target as HTMLInputElement)?.value.trim() === "") {
        history.replaceState(history.state, "", window.location.pathname);
      }
    };
    searchInput?.addEventListener("input", resetSearchParam);
    clearButton?.addEventListener("click", resetSearchParam);
  });
}

document.addEventListener("astro:after-swap", () => {
  const pagefindSearch = document.querySelector("#pagefind-search");
  if (pagefindSearch?.querySelector("form")) return;
  initSearch();
});
initSearch();
