
(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function wireSearch() {
    $$('[data-search-input]').forEach(input => {
      const targetSelector = input.getAttribute('data-search-target');
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) return;
      const emptyState = target.querySelector('[data-empty-state]');
      const cards = () => $$(target.getAttribute('data-filter-root') + ' [data-filter-item]', target);
      const apply = () => {
        const q = (input.value || '').trim().toLowerCase();
        let visible = 0;
        cards().forEach(card => {
          const hay = [
            card.dataset.title || '',
            card.dataset.genre || '',
            card.dataset.tags || '',
            card.dataset.year || '',
            card.dataset.region || '',
            card.dataset.type || ''
          ].join(' ').toLowerCase();
          const show = !q || hay.includes(q);
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (emptyState) emptyState.hidden = visible !== 0;
      };
      input.addEventListener('input', apply);
      apply();
    });
  }

  function wireHero() {
    $$('.hero-slider').forEach(slider => {
      const slides = $$('.hero-slide', slider);
      if (slides.length < 2) return;
      let index = 0;
      const dots = $$('.hero-dot', slider.parentElement);
      const set = (n) => {
        index = (n + slides.length) % slides.length;
        slides.forEach((s,i)=>s.classList.toggle('is-active', i===index));
        dots.forEach((d,i)=>d.classList.toggle('is-active', i===index));
      };
      const timer = setInterval(()=>set(index + 1), 5000);
      slider.addEventListener('mouseenter', ()=>clearInterval(timer), {once:true});
      dots.forEach((d,i)=>d.addEventListener('click', ()=>set(i)));
      set(0);
    });
  }

  function wirePlayer() {
    $$('[data-play-source]').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('[data-player-wrap]');
        if (!wrap) return;
        const video = wrap.querySelector('video');
        const url = btn.dataset.playSource;
        const label = wrap.querySelector('[data-player-status]');
        const poster = wrap.dataset.poster || '';
        const title = wrap.dataset.title || '影片';
        if (!video || !url) return;
        const useNative = !window.Hls || !window.Hls.isSupported || /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (window.__hlsInstance) {
          try { window.__hlsInstance.destroy(); } catch(e) {}
          window.__hlsInstance = null;
        }
        if (window.Hls && window.Hls.isSupported && !useNative) {
          const hls = new window.Hls({
            maxBufferLength: 30,
            liveSyncDurationCount: 3,
          });
          window.__hlsInstance = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(()=>{});
          });
          hls.on(window.Hls.Events.ERROR, (_, data) => {
            if (label) label.textContent = '播放出现波动，已切换备用线路提示。';
          });
        } else {
          video.src = url;
          video.play().catch(()=>{});
        }
        if (poster) video.setAttribute('poster', poster);
        if (label) label.textContent = '正在播放：' + title + ' · ' + btn.textContent.trim();
      });
    });
  }

  function wireToTop() {
    $$('.to-top').forEach(btn => btn.addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'})));
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireSearch();
    wireHero();
    wirePlayer();
    wireToTop();
  });
})();
