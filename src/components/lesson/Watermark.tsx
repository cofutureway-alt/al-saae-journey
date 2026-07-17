import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface WatermarkConfig {
  text: string;
  color?: string;
  opacity?: number;
  speedSeconds?: number;
  fontSize?: number;
}

/**
 * Animated watermark overlay. Slowly drifts around the video so it can't
 * simply be cropped or covered. Config is passed via props so the admin
 * settings page (next phase) can wire live values in without a rewrite.
 */
export const Watermark = ({
  text,
  color = "#ffffff",
  opacity = 0.35,
  speedSeconds = 22,
  fontSize = 14,
}: WatermarkConfig) => {
  const [pos, setPos] = useState({ x: 10, y: 10 });

  useEffect(() => {
    // Waypoints across the viewport in %
    const points = [
      { x: 8, y: 10 },
      { x: 72, y: 14 },
      { x: 80, y: 78 },
      { x: 12, y: 82 },
      { x: 50, y: 46 },
      { x: 70, y: 30 },
      { x: 18, y: 60 },
    ];
    let i = 0;
    setPos(points[0]);
    const step = () => {
      i = (i + 1) % points.length;
      setPos(points[i]);
    };
    const id = window.setInterval(step, speedSeconds * 1000);
    return () => window.clearInterval(id);
  }, [speedSeconds]);

  if (!text) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20 select-none">
      <motion.div
        animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        transition={{ duration: speedSeconds, ease: "easeInOut" }}
        className="absolute"
        style={{
          color,
          opacity,
          fontSize,
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          fontWeight: 600,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
          transform: "translate(-50%, -50%)",
        }}
      >
        {text}
      </motion.div>
    </div>
  );
};

export default Watermark;
