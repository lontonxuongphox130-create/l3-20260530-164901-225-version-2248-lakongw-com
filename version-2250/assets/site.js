(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      var rail = document.getElementById(targetId);
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;

      if (rail) {
        rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-filter-text]');
    var region = root.querySelector('[data-filter-region]');
    var year = root.querySelector('[data-filter-year]');
    var type = root.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var empty = root.querySelector('[data-empty-state]');

    function value(node) {
      return node ? String(node.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = value(input);
      var regionValue = value(region);
      var yearValue = value(year);
      var typeValue = value(type);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || String(card.getAttribute('data-region') || '').toLowerCase() === regionValue;
        var matchYear = !yearValue || String(card.getAttribute('data-year') || '').toLowerCase() === yearValue;
        var matchType = !typeValue || String(card.getAttribute('data-type') || '').toLowerCase() === typeValue;
        var show = matchKeyword && matchRegion && matchYear && matchType;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    apply();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.play-cover');
    var stream = player.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function attachStream() {
      if (!video || !stream || started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function play() {
      attachStream();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
