import { useEffect, useMemo, useRef, useState } from "react";
// @ts-expect-error – plyr ships CJS with a default export at runtime
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { motion } from "framer-motion";
import { AlertCircle, PlayCircle, X } from "lucide-react";
import { parseVideoUrl, type VideoProvider } from "@/lib/video";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchTracker } from "@/hooks/use-watch-tracker";
import Watermark, { type WatermarkConfig } from "./Watermark";

interface Props {
  lessonId: string;
  courseId: string;
  title: string;
  provider: VideoProvider | null;
  videoUrl: string | null;
  onProgress?: (pct: number) => void;
  watermark?: Partial<WatermarkConfig>;
}

/**
 * Unified lesson video player.
 * - YouTube / Vimeo: Plyr native embed providers with custom controls.
 * - Bunny Stream: wrapped iframe (Plyr html5 needs a direct .m3u8/.mp4 which
 *   is not derivable from the stored embed URL without a Bunny API call).
 *
 * All three render inside the same shell so the watermark + progress overlay
 * treatment is consistent.
 */
export const LessonVideoPlayer = ({
  lessonId,
  courseId,
  title,
  provider,
  videoUrl,
  onProgress,
  watermark,
}: Props) => {
  const { user, profile } = useAuth();
  const parsed = useMemo(() => {
    if (!provider || !videoUrl) return null;
    const p = parseVideoUrl(provider, videoUrl);
    if ("error" in p) return null;
    return p;
  }, [provider, videoUrl]);

  const isBunny = parsed?.provider === "bunny";
  const videoRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const tracker = useWatchTracker({ userId: user?.id, lessonId, courseId });
  const [ytNoticeDismissed, setYtNoticeDismissed] = useState(false);

  // Expose progress callback
  useEffect(() => {
    if (onProgress) tracker.onProgress(onProgress);
  }, [onProgress, tracker]);

  // Setup Plyr for YT / Vimeo
  useEffect(() => {
    if (!parsed || isBunny || !videoRef.current) return;

    // Build the <div data-plyr-provider ...> element
    const el = document.createElement("div");
    el.setAttribute("data-plyr-provider", parsed.provider);
    el.setAttribute("data-plyr-embed-id", parsed.id);
    videoRef.current.innerHTML = "";
    videoRef.current.appendChild(el);

    const player = new Plyr(el, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["quality", "speed"],
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
      // Resume
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
      tracker.setPosition(player.currentTime || 0);
    };

    player.on("ready", onReady);
    player.on("loadedmetadata", onLoaded);
    player.on("play", onPlay);
    player.on("pause", onPause);
    player.on("ended", onEnded);
    player.on("seeked", onSeeked);

    // Periodic save every 8s
    const saveTimer = window.setInterval(() => tracker.flush(), 8000);

    const onVisibility = () => {
      if (document.hidden) {
        stopTicking();
        tracker.flush();
      } else if (!player.paused) {
        startTicking();
      }
    };
    const onBeforeUnload = () => {
      tracker.flush({ keepalive: true });
    };

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

  // Bunny: still track via periodic save on unmount (no time events available).
  useEffect(() => {
    if (!isBunny) return;
    const onUnload = () => tracker.flush({ keepalive: true });
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      tracker.flush();
    };
  }, [isBunny, tracker]);

  const watermarkText =
    watermark?.text ??
    profile?.full_name ??
    user?.email ??
    "";

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
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-lg"
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
          color={watermark?.color}
          opacity={watermark?.opacity}
          speedSeconds={watermark?.speedSeconds}
          fontSize={watermark?.fontSize}
        />
      </div>

      {parsed.provider === "youtube" && !ytNoticeDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200 p-3 text-sm"
          dir="rtl"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            بسبب قيود منصة يوتيوب، لا يمكن التحكم الكامل في جودة الفيديو أو منع
            التقديم على مقاطع اليوتيوب.
          </div>
          <button
            onClick={() => setYtNoticeDismissed(true)}
            className="p-1 rounded hover:bg-amber-500/20 transition-colors shrink-0"
            aria-label="إخفاء"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default LessonVideoPlayer;
