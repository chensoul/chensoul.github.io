(function(){
  function setupLazyList(opts){
    var sentinelId = opts && opts.sentinelId; 
    var itemSelector = opts && opts.itemSelector; 
    var artalk = opts && opts.artalk; 
    var c = sentinelId ? document.getElementById(sentinelId) : null; 
    if(!c || !itemSelector) return; 
    var observerKey = "__lazyObserver_"+sentinelId; 
    if(window[observerKey]){ try{ window[observerKey].disconnect(); }catch{} window[observerKey]=null; }
    var init = typeof opts.init === 'number' ? opts.init : Number(c.dataset.init||0); 
    var chunk = typeof opts.chunk === 'number' ? opts.chunk : Number(c.dataset.chunk||1); 
    var items = Array.from(document.querySelectorAll(itemSelector)); 
    var shown = items.filter(function(el){ return !el.classList.contains('hidden'); }).length || init; 
    function reveal(){
      var next = items.slice(shown, shown + chunk); 
      next.forEach(function(el){ el.classList.remove('hidden'); }); 
      if(artalk && artalk.enabled){
        var batchCls = "artalk-count-batch-"+Date.now(); 
        next.forEach(function(el){ 
          if(!el.querySelector('.artalk-comment-count')){ 
            var anchor = el.querySelector(artalk.anchorSelector || 'a[href]'); 
            if(!anchor) return; 
            var wrap = artalk.wrapperSelector ? el.querySelector(artalk.wrapperSelector) : null; 
            var span = document.createElement('span'); 
            span.className = 'artalk-comment-count '+batchCls+' absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full text-xs font-medium shadow-sm'; 
            span.setAttribute('style','width:30px;height:16px;background-color:var(--comment-badge-bg);color:var(--color-background)'); 
            span.setAttribute('data-page-key', anchor.getAttribute('href') || ''); 
            (wrap || el).appendChild(span); 
          }
        }); 
        var cfg = (typeof window !== 'undefined' && window.__artalkConfig) || {}; 
        var server = artalk.server || cfg.server; 
        var site = artalk.site || cfg.site; 
        if(typeof window !== 'undefined' && typeof window.Artalk !== 'undefined' && server && site){ 
          try{ window.Artalk.loadCountWidget({ server: server, site: site, countEl: '.'+batchCls, statPageKeyAttr: 'data-page-key' }); }catch{}
        }
        next.forEach(function(el){ var badge = el.querySelector('.'+batchCls); if(badge) badge.classList.remove(batchCls); }); 
      }
      shown += next.length; 
      if(shown >= items.length && window[observerKey]) window[observerKey].disconnect(); 
    }
    window[observerKey] = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting) reveal(); }); }, { rootMargin: '200px' }); 
    window[observerKey].observe(c); 
  }
  window.setupLazyList = setupLazyList;
})();
