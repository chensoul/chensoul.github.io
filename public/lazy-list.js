(function () {
  function setupLazyList(opts) {
    var sentinelId = opts && opts.sentinelId;
    var itemSelector = opts && opts.itemSelector;
    var c = sentinelId ? document.getElementById(sentinelId) : null;
    if (!c || !itemSelector) return;
    var observerKey = "__lazyObserver_" + sentinelId;
    if (window[observerKey]) {
      try {
        window[observerKey].disconnect();
      } catch {}
      window[observerKey] = null;
    }
    var init =
      typeof opts.init === "number" ? opts.init : Number(c.dataset.init || 0);
    var chunk =
      typeof opts.chunk === "number"
        ? opts.chunk
        : Number(c.dataset.chunk || 1);
    var items = Array.from(document.querySelectorAll(itemSelector));
    var shown =
      items.filter(function (el) {
        return !el.classList.contains("hidden");
      }).length || init;
    function reveal() {
      var next = items.slice(shown, shown + chunk);
      next.forEach(function (el) {
        el.classList.remove("hidden");
      });
      shown += next.length;
      if (shown >= items.length && window[observerKey])
        window[observerKey].disconnect();
    }
    window[observerKey] = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) reveal();
        });
      },
      { rootMargin: "200px" }
    );
    window[observerKey].observe(c);
  }
  window.setupLazyList = setupLazyList;
})();
