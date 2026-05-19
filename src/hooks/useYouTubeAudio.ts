"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types (YT global is loaded at runtime, not bundled) ─────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: Record<string, unknown>,
      ) => any;
      PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const PLAYER_ELEMENT_ID = "yt-bg-audio-player";

// Module-level cache so multiple components share the same API load
let apiReadyPromise: Promise<void> | null = null;

function loadIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = IFRAME_API_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return apiReadyPromise;
}

/** Off-screen container that hosts the YouTube iframe. Hidden but kept in DOM
 *  so the audio track stays alive (display:none can pause WebAudio in some browsers). */
function ensureContainer(): HTMLElement {
  let el = document.getElementById(PLAYER_ELEMENT_ID);
  if (el) return el;
  el = document.createElement("div");
  el.id = PLAYER_ELEMENT_ID;
  Object.assign(el.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);
  return el;
}

export interface YouTubeAudioApi {
  /** True once the player instance has finished initialising */
  ready: boolean;
  /** True while audio is actively playing */
  playing: boolean;
  /** True between user click and YouTube buffering its first byte */
  loading: boolean;
  play: () => Promise<void>;
  pause: () => void;
  /** v is 0..1 (mapped to YouTube's 0..100) */
  setVolume: (v: number) => void;
}

/**
 * Background-music hook that plays a YouTube video as audio via the official
 * IFrame Player API. Auto-loops. Pauses on tab hidden, resumes on visible.
 */
export function useYouTubeAudio(videoId: string, initialVolume = 0.45): YouTubeAudioApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensurePlayer = useCallback(async () => {
    if (playerRef.current) return;
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      await loadIframeAPI();
      const container = ensureContainer();

      await new Promise<void>((resolve) => {
        if (!window.YT) {
          resolve();
          return;
        }
        const player = new window.YT.Player(container, {
          height: "1",
          width: "1",
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            // Built-in YouTube loop requires `playlist=<videoId>`
            loop: 1,
            playlist: videoId,
          },
          events: {
            onReady: () => {
              playerRef.current = player;
              try {
                player.setVolume(Math.round(Math.max(0, Math.min(1, initialVolume)) * 100));
              } catch {
                // setVolume may throw if called before fully ready in some edge browsers
              }
              setReady(true);
              resolve();
            },
            onStateChange: (event: { data: number }) => {
              const s = event.data;
              setPlaying(s === 1);
              setLoading(s === 3);
              // Failsafe loop in case YouTube's loop=1 misses (some videos)
              if (s === 0) {
                try {
                  player.playVideo();
                } catch {
                  /* noop */
                }
              }
            },
            onError: () => {
              setLoading(false);
              setPlaying(false);
            },
          },
        });
      });
    })();

    return initPromiseRef.current;
  }, [videoId, initialVolume]);

  const play = useCallback(async () => {
    setLoading(true);
    await ensurePlayer();
    try {
      playerRef.current?.playVideo();
    } catch {
      setLoading(false);
    }
  }, [ensurePlayer]);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* noop */
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    try {
      playerRef.current?.setVolume(Math.round(Math.max(0, Math.min(1, v)) * 100));
    } catch {
      /* noop */
    }
  }, []);

  // Pause on tab hidden, resume on visible (only if was playing)
  useEffect(() => {
    let wasPlaying = false;
    const handler = () => {
      if (!playerRef.current) return;
      if (document.visibilityState === "hidden") {
        wasPlaying = playing;
        if (playing) pause();
      } else if (wasPlaying) {
        try {
          playerRef.current.playVideo();
        } catch {
          /* noop */
        }
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [playing, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.stopVideo?.();
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, []);

  return { ready, playing, loading, play, pause, setVolume };
}
