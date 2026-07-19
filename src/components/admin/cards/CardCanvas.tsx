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
          await preloadFontsFromJson(initialJson);
          await c.loadFromJSON(initialJson);
          // loadFromJSON can override canvas dimensions — force back to card size
          c.setDimensions({ width: CARD_WIDTH, height: CARD_HEIGHT });
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

const CX = CARD_WIDTH / 2;
const CY = CARD_HEIGHT / 2;
const DEFAULT_FILL = "#3b82f6";

function center(obj: any, w: number, h: number) {
  obj.set({ left: CX - w / 2, top: CY - h / 2 });
}

function place(c: Canvas, obj: any) {
  c.add(obj);
  c.setActiveObject(obj);
  c.requestRenderAll();
}

function polyPoints(sides: number, radius: number, startAngle = -Math.PI / 2) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const a = startAngle + (i * 2 * Math.PI) / sides;
    pts.push({ x: radius + radius * Math.cos(a), y: radius + radius * Math.sin(a) });
  }
  return pts;
}

function starPoints(points: number, outer: number, inner: number) {
  const pts: { x: number; y: number }[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + i * step;
    pts.push({ x: outer + r * Math.cos(a), y: outer + r * Math.sin(a) });
  }
  return pts;
}

// Helpers exposed for the builder toolbar
export const cardCanvasHelpers = {
  addRect(c: Canvas) {
    const w = 200, h = 120;
    const r = new Rect({ width: w, height: h, fill: DEFAULT_FILL });
    center(r, w, h);
    place(c, r);
  },
  addRoundedRect(c: Canvas) {
    const w = 220, h = 130;
    const r = new Rect({ width: w, height: h, rx: 20, ry: 20, fill: DEFAULT_FILL });
    center(r, w, h);
    place(c, r);
  },
  addSquare(c: Canvas) {
    const s = 150;
    const r = new Rect({ width: s, height: s, fill: DEFAULT_FILL });
    center(r, s, s);
    place(c, r);
  },
  addCircle(c: Canvas) {
    const rad = 70;
    const cir = new Circle({ radius: rad, fill: "#f59e0b" });
    center(cir, rad * 2, rad * 2);
    place(c, cir);
  },
  addEllipse(c: Canvas) {
    const rx = 100, ry = 60;
    const e = new Ellipse({ rx, ry, fill: DEFAULT_FILL });
    center(e, rx * 2, ry * 2);
    place(c, e);
  },
  addTriangle(c: Canvas) {
    const w = 150, h = 140;
    const t = new Triangle({ width: w, height: h, fill: DEFAULT_FILL });
    center(t, w, h);
    place(c, t);
  },
  addRightTriangle(c: Canvas) {
    const s = 150;
    const p = new Polygon(
      [{ x: 0, y: 0 }, { x: 0, y: s }, { x: s, y: s }],
      { fill: DEFAULT_FILL },
    );
    center(p, s, s);
    place(c, p);
  },
  addDiamond(c: Canvas) {
    const s = 150;
    const p = new Polygon(
      [{ x: s / 2, y: 0 }, { x: s, y: s / 2 }, { x: s / 2, y: s }, { x: 0, y: s / 2 }],
      { fill: DEFAULT_FILL },
    );
    center(p, s, s);
    place(c, p);
  },
  addPentagon(c: Canvas) {
    const r = 80;
    const p = new Polygon(polyPoints(5, r), { fill: DEFAULT_FILL });
    center(p, r * 2, r * 2);
    place(c, p);
  },
  addHexagon(c: Canvas) {
    const r = 80;
    const p = new Polygon(polyPoints(6, r, 0), { fill: DEFAULT_FILL });
    center(p, r * 2, r * 2);
    place(c, p);
  },
  addStar(c: Canvas) {
    const outer = 80, inner = 34;
    const p = new Polygon(starPoints(5, outer, inner), { fill: "#f59e0b" });
    center(p, outer * 2, outer * 2);
    place(c, p);
  },
  addHeart(c: Canvas) {
    const path = new Path(
      "M 75,30 A 20,20 0,0,1 115,30 A 20,20 0,0,1 155,30 Q 155,80 115,120 Q 75,80 75,30 Z",
      { fill: "#ef4444" },
    );
    center(path, 160, 130);
    place(c, path);
  },
  addLine(c: Canvas) {
    const l = new Line([0, 0, 220, 0], { stroke: "#111827", strokeWidth: 4 });
    center(l, 220, 4);
    place(c, l);
  },
  addDashedLine(c: Canvas) {
    const l = new Line([0, 0, 220, 0], {
      stroke: "#111827",
      strokeWidth: 4,
      strokeDashArray: [12, 8],
    });
    center(l, 220, 4);
    place(c, l);
  },
  addArrow(c: Canvas) {
    const p = new Path(
      "M 0,20 L 160,20 L 160,5 L 200,30 L 160,55 L 160,40 L 0,40 Z",
      { fill: DEFAULT_FILL },
    );
    center(p, 200, 60);
    place(c, p);
  },
  addDoubleArrow(c: Canvas) {
    const p = new Path(
      "M 40,5 L 0,30 L 40,55 L 40,40 L 200,40 L 200,55 L 240,30 L 200,5 L 200,20 L 40,20 Z",
      { fill: DEFAULT_FILL },
    );
    center(p, 240, 60);
    place(c, p);
  },
  addChevron(c: Canvas) {
    const p = new Path(
      "M 0,0 L 140,0 L 200,50 L 140,100 L 0,100 L 60,50 Z",
      { fill: DEFAULT_FILL },
    );
    center(p, 200, 100);
    place(c, p);
  },
  addRing(c: Canvas) {
    const p = new Path(
      "M 80,0 A 80,80 0 1,0 80,160 A 80,80 0 1,0 80,0 Z M 80,40 A 40,40 0 1,1 80,120 A 40,40 0 1,1 80,40 Z",
      { fill: DEFAULT_FILL, fillRule: "evenodd" as any },
    );
    center(p, 160, 160);
    place(c, p);
  },
  addSpeechBubble(c: Canvas) {
    const p = new Path(
      "M 20,0 L 200,0 Q 220,0 220,20 L 220,90 Q 220,110 200,110 L 90,110 L 60,140 L 70,110 L 20,110 Q 0,110 0,90 L 0,20 Q 0,0 20,0 Z",
      { fill: DEFAULT_FILL },
    );
    center(p, 220, 140);
    place(c, p);
  },
  addRibbon(c: Canvas) {
    const p = new Path(
      "M 0,0 L 240,0 L 240,120 L 200,90 L 160,120 L 120,90 L 80,120 L 40,90 L 0,120 Z",
      { fill: "#ef4444" },
    );
    center(p, 240, 120);
    place(c, p);
  },
  addText(c: Canvas, opts?: { fontFamily?: string }) {
    const family = opts?.fontFamily ?? "Tajawal";
    const t = new Textbox("نص جديد", {
      width: 420,
      fontSize: 48,
      fontFamily: family,
      fill: "#0f172a",
      textAlign: "right",
      direction: "rtl" as any,
    });
    center(t, 420, 60);
    place(c, t);
  },
  async setFontFamily(c: Canvas, obj: any, family: string) {
    await loadFont(family);
    obj.set({ fontFamily: family });
    obj.initDimensions?.();
    c.requestRenderAll();
  },
  setObjectFill(c: Canvas, obj: any, color: string) {
    obj.set({ fill: color });
    c.requestRenderAll();
  },
  setObjectStroke(c: Canvas, obj: any, color: string) {
    obj.set({ stroke: color });
    c.requestRenderAll();
  },
  setTextProp(c: Canvas, obj: any, patch: Record<string, any>) {
    obj.set(patch);
    obj.initDimensions?.();
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
    // Remove any existing background image object
    const objs = c.getObjects().filter((o: any) => o.__isBg);
    objs.forEach((o) => c.remove(o));
    c.backgroundImage = undefined;
    c.backgroundColor = color;
    c.renderAll();
  },
  async setBackgroundImage(c: Canvas, url: string) {
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const iw = img.width || CARD_WIDTH;
      const ih = img.height || CARD_HEIGHT;
      // Cover fit
      const scale = Math.max(CARD_WIDTH / iw, CARD_HEIGHT / ih);
      const w = iw * scale;
      const h = ih * scale;
      img.set({
        left: (CARD_WIDTH - w) / 2,
        top: (CARD_HEIGHT - h) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      (img as any).__isBg = true;
      // Remove old background objects
      const oldBg = c.getObjects().filter((o: any) => o.__isBg);
      oldBg.forEach((o) => c.remove(o));
      c.backgroundImage = undefined;
      c.add(img);
      c.sendObjectToBack(img);
      c.renderAll();
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
      await preloadFontsFromJson(json);
      await c.loadFromJSON(json);
    }
    c.renderAll();
    const url = c.toDataURL({ format: "png", multiplier: 0.5 });
    return url;
  } finally {
    c.dispose();
  }
}
