import { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Rect,
  Circle,
  Ellipse,
  Triangle,
  Polygon,
  Line,
  Path,
  Textbox,
  FabricImage,
} from "fabric";
import { loadFont, preloadFontsFromJson } from "@/lib/card-fonts";

export const CARD_WIDTH = 1011;
export const CARD_HEIGHT = 638;

export interface CardCanvasHandle {
  canvas: Canvas | null;
}

interface Props {
  initialJson?: any;
  onReady?: (canvas: Canvas) => void;
  onSelectionChange?: (obj: any | null) => void;
  className?: string;
}

/**
 * A responsive wrapper for a Fabric.js canvas locked to the 1011×638 CR80 card size.
 * The DOM canvas stays at true resolution; CSS scaling handles fit-to-viewport,
 * so all stored coordinates remain in the real design space.
 */
export function CardCanvas({ initialJson, onReady, onSelectionChange, className }: Props) {
  const elRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!elRef.current) return;
    const c = new Canvas(elRef.current, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = c;

    const notify = () => {
      const active = c.getActiveObject();
      onSelectionChange?.(active ?? null);
    };
    c.on("selection:created", notify);
    c.on("selection:updated", notify);
    c.on("selection:cleared", () => onSelectionChange?.(null));

    (async () => {
      if (initialJson && Object.keys(initialJson).length > 0) {
        try {
          await c.loadFromJSON(initialJson);
          c.requestRenderAll();
        } catch (e) {
          console.error("Fabric load failed", e);
        }
      }
      onReady?.(c);
    })();

    return () => {
      c.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit-to-container scaling
  useEffect(() => {
    const compute = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const s = Math.min(1, w / CARD_WIDTH);
      setScale(s);
    };
    compute();
    const obs = new ResizeObserver(compute);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <div
        style={{
          width: CARD_WIDTH * scale,
          height: CARD_HEIGHT * scale,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="shadow-2xl rounded-xl overflow-hidden bg-white"
        >
          <canvas ref={elRef} width={CARD_WIDTH} height={CARD_HEIGHT} />
        </div>
      </div>
    </div>
  );
}

// Helpers exposed for the builder toolbar
export const cardCanvasHelpers = {
  addRect(c: Canvas) {
    const r = new Rect({
      left: CARD_WIDTH / 2 - 100,
      top: CARD_HEIGHT / 2 - 60,
      width: 200,
      height: 120,
      fill: "#3b82f6",
      rx: 8,
      ry: 8,
    });
    c.add(r);
    c.setActiveObject(r);
    c.requestRenderAll();
  },
  addCircle(c: Canvas) {
    const cir = new Circle({
      left: CARD_WIDTH / 2 - 60,
      top: CARD_HEIGHT / 2 - 60,
      radius: 60,
      fill: "#f59e0b",
    });
    c.add(cir);
    c.setActiveObject(cir);
    c.requestRenderAll();
  },
  bringForward(c: Canvas) {
    const a = c.getActiveObject();
    if (a) {
      c.bringObjectForward(a);
      c.requestRenderAll();
    }
  },
  sendBackwards(c: Canvas) {
    const a = c.getActiveObject();
    if (a) {
      c.sendObjectBackwards(a);
      c.requestRenderAll();
    }
  },
  bringToFront(c: Canvas) {
    const a = c.getActiveObject();
    if (a) {
      c.bringObjectToFront(a);
      c.requestRenderAll();
    }
  },
  sendToBack(c: Canvas) {
    const a = c.getActiveObject();
    if (a) {
      c.sendObjectToBack(a);
      c.requestRenderAll();
    }
  },
  deleteActive(c: Canvas) {
    const a = c.getActiveObject();
    if (a) {
      c.remove(a);
      c.discardActiveObject();
      c.requestRenderAll();
    }
  },
  setBackgroundColor(c: Canvas, color: string) {
    c.backgroundColor = color;
    c.backgroundImage = undefined;
    c.requestRenderAll();
  },
  async setBackgroundImage(c: Canvas, url: string) {
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: CARD_WIDTH / (img.width ?? CARD_WIDTH),
        scaleY: CARD_HEIGHT / (img.height ?? CARD_HEIGHT),
      });
      c.backgroundImage = img;
      c.requestRenderAll();
    } catch (e) {
      console.error("bg image load failed", e);
      throw e;
    }
  },
};

/**
 * Renders a stored fabric JSON to a data URL for use as a static preview thumbnail.
 */
export async function renderCardToDataURL(json: any): Promise<string> {
  const el = document.createElement("canvas");
  el.width = CARD_WIDTH;
  el.height = CARD_HEIGHT;
  const c = new Canvas(el, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#ffffff",
  });
  try {
    if (json && Object.keys(json).length > 0) {
      await c.loadFromJSON(json);
    }
    c.renderAll();
    const url = c.toDataURL({ format: "png", multiplier: 0.5 });
    return url;
  } finally {
    c.dispose();
  }
}
