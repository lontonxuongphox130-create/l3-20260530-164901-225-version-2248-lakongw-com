(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      toggle.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    each(document.querySelectorAll("[data-hero]"), function (hero) {
      var slides = hero.querySelectorAll("[data-hero-slide]");
      var dots = hero.querySelectorAll("[data-hero-dot]");
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;
      if (!slides.length) {
        return;
      }
      function show(index) {
        active = (index + slides.length) % slides.length;
        each(slides, function (slide, i) {
          slide.classList.toggle("active", i === active);
        });
        each(dots, function (dot, i) {
          dot.classList.toggle("active", i === active);
          dot.setAttribute("aria-current", i === active ? "true" : "false");
        });
      }
      function start() {
        stop();
        timer = setInterval(function () {
          show(active + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }
      each(dots, function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      if (slides.length > 1) {
        start();
      }
    });
  }

  function initFilters() {
    each(document.querySelectorAll("[data-filter-scope]"), function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var selects = scope.querySelectorAll("[data-filter-select]");
      var cards = scope.querySelectorAll("[data-title]");
      var empty = scope.querySelector("[data-empty]");
      function run() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var shown = 0;
        each(cards, function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var ok = !keyword || haystack.indexOf(keyword) !== -1;
          each(selects, function (select) {
            var key = select.getAttribute("data-filter-select");
            var value = select.value;
            if (value && card.getAttribute("data-" + key) !== value) {
              ok = false;
            }
          });
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }
      if (input) {
        input.addEventListener("input", run);
      }
      each(selects, function (select) {
        select.addEventListener("change", run);
      });
      run();
    });
  }

  function initPlayers() {
    each(document.querySelectorAll("[data-player]"), function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-player-cover]");
      var source = player.getAttribute("data-src");
      var started = false;
      var hls = null;
      if (!video || !source) {
        return;
      }
      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }
      function start() {
        if (started) {
          playVideo();
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add("hidden");
        }
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        }
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      player.addEventListener("click", function (event) {
        if (!started && event.target === player) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
