(function () {
    var video = document.getElementById("movie-video");
    var configNode = document.getElementById("player-config");
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".player-trigger"));
    var cover = document.querySelector(".player-cover");
    var started = false;
    var hls = null;

    function readConfig() {
        if (!configNode) {
            return null;
        }
        try {
            return JSON.parse(configNode.textContent || "{}");
        } catch (error) {
            return null;
        }
    }

    function startPlayer(event) {
        if (event) {
            event.preventDefault();
        }
        if (!video || started) {
            if (video) {
                video.play().catch(function () {});
            }
            return;
        }
        var config = readConfig();
        if (!config || !config.src) {
            return;
        }
        started = true;
        if (cover) {
            cover.classList.add("is-hidden");
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(config.src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (name, data) {
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
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = config.src;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
        } else {
            video.src = config.src;
            video.play().catch(function () {});
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener("click", startPlayer);
    });

    if (video) {
        video.addEventListener("click", function () {
            if (!started) {
                startPlayer();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
