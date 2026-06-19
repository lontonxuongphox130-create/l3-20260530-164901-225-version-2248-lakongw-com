(function () {
  var root = document.body ? document.body.getAttribute("data-root") || "" : "";
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var searchPanel = document.querySelector("[data-search-panel]");
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var data = window.MOVIE_SEARCH_DATA || [];

  function closeSearch() {
    if (searchPanel) {
      searchPanel.classList.remove("is-open");
      searchPanel.innerHTML = "";
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSearch(query) {
    if (!searchPanel) {
      return;
    }

    var keyword = normalize(query);
    if (!keyword) {
      closeSearch();
      return;
    }

    var matches = data.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 12);

    if (!matches.length) {
      searchPanel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      searchPanel.classList.add("is-open");
      return;
    }

    searchPanel.innerHTML = matches.map(function (item) {
      var href = root + item.url;
      var cover = root + item.cover;
      return [
        '<a class="search-result" href="' + escapeHtml(href) + '">',
        '<img src="' + escapeHtml(cover) + '" alt="' + escapeHtml(item.title) + '">',
        '<span>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>',
        '</span>',
        '</a>'
      ].join("");
    }).join("");
    searchPanel.classList.add("is-open");
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      renderSearch(input.value);
    });
    input.addEventListener("focus", function () {
      renderSearch(input.value);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearch();
    }
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    var insideInput = searchInputs.some(function (input) {
      return input === target;
    });
    if (searchPanel && !searchPanel.contains(target) && !insideInput) {
      closeSearch();
    }
  });

  var filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    var titleInput = filterPanel.querySelector("[data-filter-title]");
    var yearSelect = filterPanel.querySelector("[data-filter-year]");
    var typeSelect = filterPanel.querySelector("[data-filter-type]");
    var regionSelect = filterPanel.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-filter-empty]");

    function applyFilters() {
      var title = normalize(titleInput ? titleInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var cardTitle = normalize(card.getAttribute("data-title"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var matched = true;

        if (title && cardTitle.indexOf(title) === -1 && cardGenre.indexOf(title) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-hidden", visible !== 0);
      }
    }

    [titleInput, yearSelect, typeSelect, regionSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });
  }
})();
