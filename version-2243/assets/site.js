
(function () {
  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function qsa(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function setActiveNav() {
    var path = location.pathname.replace(/\/+/g, '/');
    qsa('[data-nav-link]').forEach(function (a) {
      var target = a.getAttribute('href');
      if (!target) return;
      var targetPath = target;
      try {
        targetPath = new URL(target, location.href).pathname.replace(/\/+/g, '/');
      } catch (err) {}
      if (path === targetPath || path.endsWith(targetPath) || (targetPath.endsWith('/index.html') && /(^|\/)index\.html$/.test(path))) {
        a.classList.add('active');
      }
    });
  }

  function bindMenu() {
    var btn = qs('[data-menu-button]');
    var links = qs('[data-mobile-links]');
    if (!btn || !links) return;
    btn.addEventListener('click', function () {
      var open = links.getAttribute('data-open') === 'true';
      links.setAttribute('data-open', String(!open));
      links.style.display = open ? 'none' : 'grid';
    });
  }

  function bindHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) return;
    var slides = qsa('[data-hero-slide]', slider);
    var triggers = qsa('[data-hero-trigger]');
    if (!slides.length) return;

    var active = 0;
    function show(i) {
      active = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === active);
      });
      triggers.forEach(function (btn, idx) {
        btn.classList.toggle('active', idx === active);
      });
    }

    triggers.forEach(function (btn, idx) {
      btn.addEventListener('click', function () { show(idx); });
    });

    show(0);
    window.setInterval(function () {
      show(active + 1);
    }, 6000);
  }

  function bindSearchPage() {
    var input = qs('[data-search-input]');
    var category = qs('[data-category-filter]');
    var year = qs('[data-year-filter]');
    var results = qs('[data-search-results]');
    if (!input || !results || !window.MOVIE_CATALOG) return;

    var initialQuery = new URLSearchParams(location.search).get('q') || '';
    input.value = initialQuery;

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="results-empty">没有找到匹配的影片，请换一个关键词试试。</div>';
        return;
      }
      results.innerHTML = items.map(function (movie) {
        return [
          '<a class="movie-card" href="movie/' + movie.id + '.html">',
          '<img src="' + movie.poster + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
          '<div class="movie-body">',
          '<h3 class="movie-title">' + movie.title + '</h3>',
          '<div class="movie-info">',
          '<span class="movie-badge">' + movie.year + '</span>',
          '<span class="movie-badge">' + movie.region + '</span>',
          '<span class="movie-badge">' + movie.type + '</span>',
          '</div>',
          '</div>',
          '</a>'
        ].join('');
      }).join('');
    }

    function filter() {
      var q = (input.value || '').trim().toLowerCase();
      var cat = category ? category.value : '';
      var y = year ? year.value : '';

      var items = window.MOVIE_CATALOG.filter(function (movie) {
        var hay = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line, movie.summary].join(' ').toLowerCase();
        var ok = !q || hay.indexOf(q) !== -1;
        if (ok && cat) ok = movie.category_slug === cat;
        if (ok && y) ok = movie.year === y;
        return ok;
      });

      render(items.slice(0, 240));
    }

    input.addEventListener('input', filter);
    if (category) category.addEventListener('change', filter);
    if (year) year.addEventListener('change', filter);
    filter();
  }

  function initPlayer(video) {
    if (!video) return;
    var mp4 = video.getAttribute('data-mp4') || '';
    var hls = video.getAttribute('data-hls') || '';

    function setMp4() {
      if (mp4) {
        video.src = mp4;
        video.load();
      }
    }

    if (hls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hls;
      return;
    }

    if (hls && window.Hls && typeof window.Hls.isSupported === 'function' && window.Hls.isSupported()) {
      try {
        var hlsInstance = new window.Hls();
        hlsInstance.loadSource(hls);
        hlsInstance.attachMedia(video);
        video._hlsInstance = hlsInstance;
        return;
      } catch (err) {
        setMp4();
        return;
      }
    }

    setMp4();
  }

  function bindPlayerPage() {
    var video = qs('[data-video-player]');
    if (!video) return;
    initPlayer(video);
    var switchButtons = qsa('[data-play-source]');
    switchButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = btn.getAttribute('data-play-source');
        if (type === 'hls') {
          var hls = video.getAttribute('data-hls') || '';
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hls;
            video.load();
          } else if (window.Hls && typeof window.Hls.isSupported === 'function' && window.Hls.isSupported()) {
            initPlayer(video);
          } else {
            alert('当前浏览器不支持 HLS，已保留 MP4 备用线路。');
          }
        } else {
          video.src = video.getAttribute('data-mp4') || '';
          video.load();
        }
        video.play().catch(function(){});
      });
    });
  }

  setActiveNav();
  bindMenu();
  bindHeroSlider();
  bindSearchPage();
  bindPlayerPage();
})();
