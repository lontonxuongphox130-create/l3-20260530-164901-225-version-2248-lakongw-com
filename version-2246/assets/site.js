(function () {
    var ready = function (callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    };

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");
        if (menuToggle && mobilePanel) {
            menuToggle.addEventListener("click", function () {
                var open = mobilePanel.classList.toggle("is-open");
                menuToggle.setAttribute("aria-expanded", String(open));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function startTimer() {
            if (!slides.length) {
                return;
            }
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide") || 0));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".js-card-filter"));
        filterInputs.forEach(function (input) {
            var scope = input.closest("section") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
            var empty = scope.querySelector(".no-results");
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            });
        });
    });
})();
