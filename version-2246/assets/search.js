(function () {
    var input = document.getElementById("global-search-input");
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    var source = typeof MOVIE_SEARCH_INDEX !== "undefined" ? MOVIE_SEARCH_INDEX : [];

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"quality-badge\">HD</span>" +
            "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<a class=\"movie-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
            "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</p>" +
            "<p class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function render(query) {
        if (!results || !status) {
            return;
        }
        var keyword = String(query || "").trim().toLowerCase();
        var list = source.filter(function (movie) {
            if (!keyword) {
                return false;
            }
            return [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);
        if (!keyword) {
            results.innerHTML = "";
            status.textContent = "输入关键词后查看匹配剧集";
            return;
        }
        if (!list.length) {
            results.innerHTML = "";
            status.textContent = "暂未找到匹配剧集";
            return;
        }
        results.innerHTML = list.map(card).join("");
        status.textContent = "已为你匹配相关剧集";
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
        input.value = query;
        input.addEventListener("input", function () {
            render(input.value);
        });
    }
    render(query);
})();
