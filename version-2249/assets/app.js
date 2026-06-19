(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var links = document.querySelector("[data-nav-links]");
    if (button && links) {
      button.addEventListener("click", function () {
        links.classList.toggle("is-open");
        document.body.classList.toggle("is-menu-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(active - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
        });
      }
      setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    var searchInput = document.getElementById("movieSearch");
    var categoryFilter = document.getElementById("categoryFilter");
    var yearFilter = document.getElementById("yearFilter");
    var regionFilter = document.getElementById("regionFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    function applyFilters() {
      var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var category = categoryFilter ? categoryFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var region = regionFilter ? regionFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var sameCategory = !category || card.getAttribute("data-category") === category;
        var sameYear = !year || card.getAttribute("data-year") === year;
        var sameRegion = !region || card.getAttribute("data-region") === region;
        var sameText = !term || text.indexOf(term) !== -1;
        var show = sameCategory && sameYear && sameRegion && sameText;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      var empty = document.querySelector("[data-empty]");
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [searchInput, categoryFilter, yearFilter, regionFilter].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilters);
        el.addEventListener("change", applyFilters);
      }
    });

    if (cards.length) {
      applyFilters();
    }
  });
})();

function initMoviePlayer(url, videoId, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video) {
    return;
  }

  var started = false;
  var hls = null;

  function loadVideo() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function playVideo() {
    loadVideo();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!started) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
