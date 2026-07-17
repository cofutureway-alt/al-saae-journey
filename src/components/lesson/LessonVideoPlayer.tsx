import { useEffect, useMemo, useRef, useState } from "react";
// @ts-expect-error – plyr ships CJS with a default export at runtime
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronsLeft, ChevronsRight, PlayCircle } from "lucide-react";
import { parseVideoUrl, type VideoProvider } from "@/lib/video";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchTracker } from "@/hooks/use-watch-tracker";
import Watermark from "./Watermark";
import { DEFAULT_PLAYER_SETTINGS, type VideoPlayerSettings } from "@/hooks/use-player-settings";

interface Props {
  lessonId: string;
  courseId: string;
  title: string;
  provider: VideoProvider | null;
  videoUrl: string | null;
  settings?: VideoPlayerSettings;
  onProgress?: (pct: number) => void;
}

export const LessonVideoPlayer = ({
  lessonId,
  courseId,
  title,
  provider,
  videoUrl,
  settings: settingsProp,
  onProgress,
}: Props) => {
  const settings = settingsProp ?? DEFAULT_PLAYER_SETTINGS;
  const { user, profile } = useAuth();
  const parsed = useMemo(() => {
    if (!provider || !videoUrl) return null;
    const p = parseVideoUrl(provider, videoUrl);
    if ("error" in p) return null;
    return p;
  }, [provider, videoUrl]);

  const isBunny = parsed?.provider === "bunny";
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const tracker = useWatchTracker({ userId: user?.id, lessonId, courseId });
  
  const [seekHint, setSeekHint] = useState<null | "forward" | "backward">(null);
  const [gateWarning, setGateWarning] = useState(false);
  const seekHintTimer = useRef<number | null>(null);
  const gateWarnTimer = useRef<number | null>(null);

  // Keep latest settings & tracker state accessible inside event handlers
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (onProgress) tracker.onProgress(onProgress);
  }, [onProgress, tracker]);

  const showSeekHint = (dir: "forward" | "backward") => {
    setSeekHint(dir);
    if (seekHintTimer.current) window.clearTimeout(seekHintTimer.current);
    seekHintTimer.current = window.setTimeout(() => setSeekHint(null), 550);
  };
  const showGateWarning = () => {
    setGateWarning(true);
    if (gateWarnTimer.current) window.clearTimeout(gateWarnTimer.current);
    gateWarnTimer.current = window.setTimeout(() => setGateWarning(false), 2200);
  };

  // Compute allowed seek ceiling given completion gate
  const gateCeiling = () => {
    const s = settingsRef.current;
    if (!s.completion_gate_enabled) return Infinity;
    // Furthest reached plus tiny epsilon so natural playback isn't blocked
    return tracker.stateRef.current.furthest + 1.5;
  };

  // Setup Plyr for YT / Vimeo
  useEffect(() => {
    if (!parsed || isBunny || !videoRef.current) return;

    const el = document.createElement("div");
    el.setAttribute("data-plyr-provider", parsed.provider);
    el.setAttribute("data-plyr-embed-id", parsed.id);
    videoRef.current.innerHTML = "";
    videoRef.current.appendChild(el);

    const speeds = settingsRef.current.speed_control_enabled
      ? [1, ...settingsRef.current.allowed_speeds].filter(
          (v, i, a) => a.indexOf(v) === i,
        )
      : [1];

    const controls = [
      "play-large",
      "play",
      "progress",
      "current-time",
      "duration",
      "mute",
      "volume",
      "pip",
      "airplay",
      "fullscreen",
    ];
    if (settingsRef.current.speed_control_enabled) controls.splice(-3, 0, "settings");

    const player = new Plyr(el, {
      controls,
      settings: settingsRef.current.speed_control_enabled ? ["quality", "speed"] : [],
      speed: { selected: 1, options: speeds },
      youtube: { noCookie: true, rel: 0, modestbranding: 1 },
      ratio: "16:9",
    });
    plyrRef.current = player;

    let tickTimer: number | null = null;
    const startTicking = () => {
      if (tickTimer) return;
      tickTimer = window.setInterval(() => {
        if (document.hidden) return;
        try {
          tracker.tick(player.currentTime || 0);
        } catch {
          /* noop */
        }
      }, 1000);
    };
    const stopTicking = () => {
      if (tickTimer) {
        window.clearInterval(tickTimer);
        tickTimer = null;
      }
    };

    const onReady = () => {
      const d = player.duration;
      if (d) tracker.setDuration(d);
      const last = tracker.stateRef.current.last;
      if (last > 2 && d && last < d - 3) {
        try {
          player.currentTime = last;
        } catch {
          /* noop */
        }
      }
    };
    const onLoaded = () => {
      if (player.duration) tracker.setDuration(player.duration);
    };
    const onPlay = () => startTicking();
    const onPause = () => {
      stopTicking();
      tracker.flush();
    };
    const onEnded = () => {
      stopTicking();
      tracker.flush();
    };
    const onSeeked = () => {
      // Enforce gate: snap back if user skipped past furthest
      const ceil = gateCeiling();
      const t = player.currentTime || 0;
      if (t > ceil) {
        try {
          player.currentTime = Math.max(0, tracker.stateRef.current.furthest);
        } catch {
          /* noop */
        }
        showGateWarning();
      }
      tracker.setPosition(player.currentTime || 0);
    };
    // Preemptive block during seeking too
    const onTimeUpdate = () => {
      const ceil = gateCeiling();
      const t = player.currentTime || 0;
      if (t > ceil + 0.5) {
        try {
          player.currentTime = Math.max(0, tracker.stateRef.current.furthest);
        } catch {
          /* noop */
        }
        showGateWarning();
      }
    };

    player.on("ready", onReady);
    player.on("loadedmetadata", onLoaded);
    player.on("play", onPlay);
    player.on("pause", onPause);
    player.on("ended", onEnded);
    player.on("seeked", onSeeked);
    player.on("timeupdate", onTimeUpdate);

    const saveTimer = window.setInterval(() => tracker.flush(), 8000);

    const onVisibility = () => {
      if (document.hidden) {
        stopTicking();
        tracker.flush();
      } else if (!player.paused) {
        startTicking();
      }
    };
    const onBeforeUnload = () => tracker.flush({ keepalive: true });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onBeforeUnload);

    return () => {
      stopTicking();
      window.clearInterval(saveTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onBeforeUnload);
      tracker.flush();
      try {
        player.destroy();
      } catch {
        /* noop */
      }
      plyrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.provider, parsed?.id, isBunny, lessonId]);

  // Double-tap seek gesture
  useEffect(() => {
    if (isBunny) return;
    if (!settings.double_tap_seek_enabled) return;
    const el = shellRef.current;
    if (!el) return;

    let lastTap = 0;
    let lastX = 0;
    const DBL_MS = 320;

    const handleTap = (clientX: number, target: EventTarget | null) => {
      // Ignore taps on the actual Plyr control bar so scrubbing/buttons still work
      if (target instanceof HTMLElement && target.closest(".plyr__controls, .plyr__control")) {
        return false;
      }
      const now = Date.now();
      if (now - lastTap < DBL_MS && Math.abs(clientX - lastX) < 60) {
        const rect = el.getBoundingClientRect();
        const isRight = clientX - rect.left > rect.width / 2;
        const player = plyrRef.current;
        if (!player) return false;
        const cur = player.currentTime || 0;
        const cfg = settingsRef.current;
        if (isRight) {
          let target = cur + cfg.seek_forward_seconds;
          const ceil = gateCeiling();
          if (target > ceil) {
            target = Math.max(cur, ceil);
            showGateWarning();
          }
          try {
            player.currentTime = target;
          } catch {
            /* noop */
          }
          showSeekHint("forward");
        } else {
          try {
            player.currentTime = Math.max(0, cur - cfg.seek_backward_seconds);
          } catch {
            /* noop */
          }
          showSeekHint("backward");
        }
        lastTap = 0;
        return true;
      }
      lastTap = now;
      lastX = clientX;
      return false;
    };

    const onClick = (e: MouseEvent) => {
      if (handleTap(e.clientX, e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("click", onClick, true);
    };
  }, [isBunny, settings.double_tap_seek_enabled, settings.seek_forward_seconds, settings.seek_backward_seconds]);

  // Bunny fallback flush
  useEffect(() => {
    if (!isBunny) return;
    const onUnload = () => tracker.flush({ keepalive: true });
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      tracker.flush();
    };
  }, [isBunny, tracker]);

  const watermarkText = (() => {
    const parts: string[] = [];
    if (settings.watermark_show_name && profile?.full_name) parts.push(profile.full_name);
    if (settings.watermark_show_email && user?.email) parts.push(user.email);
    return parts.join(" · ") || user?.email || "";
  })();

  if (!parsed) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-lg flex flex-col items-center justify-center text-muted-foreground gap-2">
        <PlayCircle className="w-14 h-14 opacity-30" />
        <div className="text-sm">لا يوجد فيديو صالح لهذا الدرس بعد.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={shellRef}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-lg select-none"
        dir="ltr"
      >
        {isBunny ? (
          <iframe
            src={parsed.url}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={title}
          />
        ) : (
          <div ref={videoRef} className="plyr-shell w-full h-full" />
        )}

        <Watermark
          text={watermarkText}
          color={settings.watermark_color}
          opacity={settings.watermark_opacity}
          speedSeconds={settings.watermark_speed_seconds}
        />

        {/* Double-tap seek visual */}
        <AnimatePresence>
          {seekHint && (
            <motion.div
              key={seekHint}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center gap-1 px-4 py-3 rounded-full bg-black/60 text-white text-sm font-bold ${
                seekHint === "forward" ? "right-8" : "left-8"
              }`}
            >
              {seekHint === "forward" ? (
                <>
                  <ChevronsRight className="w-5 h-5" />
                  {settings.seek_forward_seconds}s
                </>
              ) : (
                <>
                  {settings.seek_backward_seconds}s
                  <ChevronsLeft className="w-5 h-5" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gate warning overlay */}
        <AnimatePresence>
          {gateWarning && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              dir="rtl"
              className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 px-3 py-2 rounded-lg bg-black/75 text-white text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4" />
              لا يمكن تخطّي الفيديو قبل إتمام النسبة المطلوبة
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default LessonVideoPlayer;
