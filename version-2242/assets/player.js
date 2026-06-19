(function () {
    var video = document.querySelector('[data-movie-player]');
    var playButton = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');

    if (!video) {
        return;
    }

    var hlsSource = video.getAttribute('data-hls');
    var fallbackSource = video.getAttribute('data-fallback');
    var initialized = false;

    function setStatus(text) {
        if (status) {
            status.textContent = text;
        }
    }

    function initializePlayer() {
        if (initialized) {
            return Promise.resolve();
        }
        initialized = true;

        if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsSource;
            setStatus('HLS 播放源已绑定');
        } else if (hlsSource && window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(hlsSource);
            hls.attachMedia(video);
            setStatus('HLS 播放源已初始化');
        } else if (fallbackSource) {
            video.src = fallbackSource;
            setStatus('本地预览播放源已加载');
        }

        return video.load ? Promise.resolve() : Promise.resolve();
    }

    function startPlayback() {
        initializePlayer().then(function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise
                    .then(function () {
                        setStatus('正在播放');
                    })
                    .catch(function () {
                        setStatus('请点击播放器上的播放按钮继续');
                    });
            }
        });
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
        setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
        setStatus('已暂停');
    });
})();
