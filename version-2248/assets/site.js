(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var filterRoots = document.querySelectorAll('[data-filter-root]');
  filterRoots.forEach(function (root) {
    var input = root.querySelector('[data-search-input]');
    var year = root.querySelector('[data-year-filter]');
    var region = root.querySelector('[data-region-filter]');
    var type = root.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var empty = root.querySelector('[data-empty-state]');

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var ok = true;

        if (q && search.indexOf(q) === -1) ok = false;
        if (y && cardYear !== y) ok = false;
        if (r && cardRegion.indexOf(r) === -1) ok = false;
        if (t && cardType !== t) ok = false;

        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, year, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });
  });

  var players = document.querySelectorAll('[data-player]');
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    if (!video || !button) return;

    var src = video.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function setup() {
      if (ready || !src) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      setup();
      box.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      start();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime < 0.5 || video.ended) {
        box.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      box.classList.remove('is-playing');
    });

    setup();
  });
})();
