(function () {
  function getHlsModule() {
    return Promise.resolve(window.Hls || null);
  }

  function safePlay(video, cover, state) {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        state.started = false;
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  function initPlayer(wrapper) {
    var video = wrapper.querySelector("video");
    var cover = wrapper.querySelector("[data-play-trigger]");
    var source = video ? video.getAttribute("data-source") : "";
    var state = {
      started: false,
      hls: null
    };

    if (!video || !source) {
      return;
    }

    function start() {
      if (state.started) {
        safePlay(video, cover, state);
        return;
      }

      state.started = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }

      getHlsModule().then(function (Hls) {
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          state.hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          state.hls.loadSource(source);
          state.hls.attachMedia(video);
          state.hls.on(Hls.Events.MANIFEST_PARSED, function () {
            safePlay(video, cover, state);
          });
          state.hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal || !state.hls) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              state.hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              state.hls.recoverMediaError();
            } else {
              state.hls.destroy();
              state.hls = null;
            }
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          safePlay(video, cover, state);
          return;
        }

        video.src = source;
        safePlay(video, cover, state);
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!state.started) {
        start();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
})();
