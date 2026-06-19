function coverFallback(image) {
    var parent = image.parentElement;
    if (parent) {
        parent.classList.add('no-cover');
    }
    image.removeAttribute('src');
    image.style.display = 'none';
}

(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        var active = 0;
        var showSlide = function (index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide((active + 1) % slides.length);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var counter = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var shown = 0;

        cards.forEach(function (card) {
            var text = card.getAttribute('data-search') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var visible = matchedKeyword && matchedYear;
            card.classList.toggle('hidden-by-search', !visible);
            if (visible) {
                shown += 1;
            }
        });

        if (counter) {
            counter.textContent = '当前显示 ' + shown + ' 部';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }
    if (cards.length) {
        applyFilters();
    }
})();
