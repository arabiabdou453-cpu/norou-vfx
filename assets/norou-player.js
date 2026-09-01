(() => {
  "use strict";

  const videos = [
    { id: "_j9ewTMvYvk", title: "Custom VSL for My Client" },
    { id: "doOU2AIX2r4", title: "Video Production and Brand Visual" },
    { id: "KnavSFeuBNI", title: "1 January 2026" },
    { id: "tSyr8gRAS7Y", title: "Premium Project for AltHue" },
    { id: "-BWhYYHI5Wk", title: "Premium 3D Viral Style for Cutflow Agency" },
    { id: "lejcLUhH5IA", title: "Project for Gusto Product" }
  ];
  const videoById = new Map(videos.map((video) => [video.id, video]));
  const iframeSelector = [
    "iframe[data-norou-video-id]",
    'iframe[src*="youtube.com/embed/"]',
    'iframe[src*="youtube-nocookie.com/embed/"]'
  ].join(",");

  let activePlayer = null;

  const closeActivePlayer = (restoreFocus = true) => {
    if (!activePlayer) return;
    const { card, trigger } = activePlayer;
    card.classList.remove("is-playing");
    activePlayer.layer.remove();
    activePlayer = null;
    if (restoreFocus && trigger.isConnected) trigger.focus();
  };

  const openInlinePlayer = (video, card, trigger) => {
    closeActivePlayer(false);

    const layer = document.createElement("div");
    layer.className = "norou-inline-player";

    const toolbar = document.createElement("div");
    toolbar.className = "norou-inline-player__toolbar";

    const title = document.createElement("strong");
    title.className = "norou-inline-player__title";
    title.textContent = video.title;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "norou-inline-player__close";
    close.setAttribute("aria-label", `Close ${video.title}`);
    close.textContent = "×";
    toolbar.append(title, close);

    const frameHost = document.createElement("div");
    frameHost.className = "norou-inline-player__frame";

    const iframe = document.createElement("iframe");
    iframe.dataset.norouPlayerActive = "true";
    iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&controls=1&fs=1&playsinline=1&rel=0`;
    iframe.title = video.title;
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "eager";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    frameHost.append(iframe);
    layer.append(toolbar, frameHost);

    activePlayer = { card, trigger, layer };
    card.classList.add("is-playing");
    card.append(layer);
  };

  const createVideoCard = (video) => {
    const card = document.createElement("div");
    card.className = "norou-video-card";
    card.dataset.videoId = video.id;
    card.style.backgroundImage = `url("https://i.ytimg.com/vi/${video.id}/hqdefault.jpg")`;

    const shade = document.createElement("span");
    shade.className = "norou-video-card__shade";
    shade.setAttribute("aria-hidden", "true");

    const cardTitle = document.createElement("span");
    cardTitle.className = "norou-video-card__title";
    cardTitle.textContent = video.title;

    const play = document.createElement("button");
    play.type = "button";
    play.className = "norou-video-card__play";
    play.setAttribute("aria-label", `Play ${video.title}`);
    const playGlyph = document.createElement("span");
    playGlyph.setAttribute("aria-hidden", "true");
    playGlyph.textContent = "▶";
    play.append(playGlyph);

    const hint = document.createElement("span");
    hint.className = "norou-video-card__hint";
    hint.textContent = "Play video";

    card.append(shade, cardTitle, play, hint);
    return card;
  };

  const readVideoId = (iframe) => {
    const storedId = iframe.dataset.norouVideoId;
    if (storedId && videoById.has(storedId)) return storedId;
    const match = iframe.src.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/);
    return match && videoById.has(match[1]) ? match[1] : null;
  };

  const prepareIframe = (iframe) => {
    if (!(iframe instanceof HTMLIFrameElement)) return;
    if (iframe.dataset.norouPlayerActive === "true") return;
    const videoId = readVideoId(iframe);
    if (!videoId) return;

    iframe.dataset.norouVideoId = videoId;
    if (iframe.getAttribute("src") !== "about:blank") iframe.setAttribute("src", "about:blank");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;

    const slot = iframe.parentElement?.parentElement;
    if (!slot) return;
    slot.classList.add("norou-video-slot");
    slot.dataset.norouVideoId = videoId;

    const existingCard = Array.from(slot.children).find(
      (child) => child instanceof HTMLElement && child.classList.contains("norou-video-card")
    );
    if (!existingCard) slot.append(createVideoCard(videoById.get(videoId)));
  };

  const prepareVideos = (root = document) => {
    if (root instanceof HTMLIFrameElement && root.matches(iframeSelector)) prepareIframe(root);
    root.querySelectorAll?.(iframeSelector).forEach(prepareIframe);
  };

  const activatePlayerControl = (event) => {
    if (!(event.target instanceof Element)) return;

    const close = event.target.closest(".norou-inline-player__close");
    if (close instanceof HTMLButtonElement) {
      event.preventDefault();
      event.stopPropagation();
      closeActivePlayer(true);
      return;
    }

    const play = event.target.closest(".norou-video-card__play");
    if (!(play instanceof HTMLButtonElement)) return;
    const card = play.closest(".norou-video-card");
    const video = card ? videoById.get(card.dataset.videoId || "") : null;
    if (!(card instanceof HTMLElement) || !video) return;
    event.preventDefault();
    event.stopPropagation();
    openInlinePlayer(video, card, play);
  };

  document.addEventListener("pointerup", (event) => {
    activatePlayerControl(event);
  }, true);

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest(".norou-video-card__play, .norou-inline-player__close")) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener("keydown", (event) => {
    if (!event.repeat && (event.key === "Enter" || event.key === " ")) {
      activatePlayerControl(event);
      return;
    }
    if (event.key === "Escape" && !document.fullscreenElement) closeActivePlayer(true);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) closeActivePlayer(false);
  });
  window.addEventListener("pagehide", () => closeActivePlayer(false));

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) prepareVideos(node);
      });
    });
  });

  const initialize = () => {
    prepareVideos();
    observer.observe(document.body, { childList: true, subtree: true });
  };

  window.addEventListener("load", initialize, { once: true });
})();
