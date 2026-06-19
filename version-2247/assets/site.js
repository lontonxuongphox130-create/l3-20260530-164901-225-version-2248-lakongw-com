(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var input = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var empty = document.querySelector('[data-empty-result]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var keyword = normalize(input && input.value);
      var year = normalize(yearFilter && yearFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var matchKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
        var matchType = !type || normalize(card.getAttribute('data-type')) === type;
        var shouldShow = matchKeyword && matchYear && matchRegion && matchType;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, yearFilter, regionFilter, typeFilter].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    var video = document.getElementById('movie-video');
    var overlay = document.querySelector('[data-play-overlay]');
    var hlsInstance = null;

    function attachVideo() {
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }
      if (video.getAttribute('data-loaded') === 'true') {
        video.play().catch(function () {});
        return;
      }
      video.setAttribute('data-loaded', 'true');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = source;
            video.play().catch(function () {});
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    function playFromOverlay() {
      if (overlay) {
        overlay.hidden = true;
      }
      attachVideo();
    }

    if (overlay) {
      overlay.addEventListener('click', playFromOverlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          attachVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.hidden = true;
        }
      });
    }
  });
})();
