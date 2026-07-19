import { useMemo, useState } from "react";
import type { Canvas } from "fabric";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FEATURED_FONTS, GOOGLE_FONTS, loadFont } from "@/lib/card-fonts";
import { cardCanvasHelpers } from "./CardCanvas";

interface Props {
  canvas: Canvas | null;
  obj: any;
  onChange: () => void;
}

export function TextProperties({ canvas, obj, onChange }: Props) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      GOOGLE_FONTS.filter((f) =>
        f.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  const applyFont = async (f: string) => {
    if (!canvas) return;
    await cardCanvasHelpers.setFontFamily(canvas, obj, f);
    onChange();
  };

  const patch = (p: Record<string, any>) => {
    if (!canvas) return;
    cardCanvasHelpers.setTextProp(canvas, obj, p);
    onChange();
  };

  const family = obj.fontFamily ?? "Tajawal";
  const fill = obj.fill ?? "#000000";
  const align = obj.textAlign ?? "right";
  const isBold = String(obj.fontWeight ?? "").toString() === "bold" || obj.fontWeight === 700;
  const isItalic = obj.fontStyle === "italic";

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">الخط</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between mt-1.5"
              type="button"
            >
              <span style={{ fontFamily: family }} className="truncate">{family}</span>
              <Type className="w-4 h-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2">
            <Input
              placeholder="ابحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 h-8"
            />
            <div className="max-h-64 overflow-y-auto space-y-0.5">
              <div className="text-[10px] uppercase text-muted-foreground px-2 pt-1">مميزة</div>
              {FEATURED_FONTS.map((f) => (
                <FontRow key={f} f={f} active={family === f} onPick={applyFont} onHover={loadFont} />
              ))}
              <div className="text-[10px] uppercase text-muted-foreground px-2 pt-2">جميع الخطوط</div>
              {filtered
                .filter((f) => !FEATURED_FONTS.includes(f as any))
                .map((f) => (
                  <FontRow key={f} f={f} active={family === f} onPick={applyFont} onHover={loadFont} />
                ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">الحجم</Label>
          <Input
            type="number"
            min={8}
            max={400}
            value={Math.round(obj.fontSize ?? 48)}
            onChange={(e) => patch({ fontSize: Number(e.target.value) || 48 })}
            className="mt-1.5 h-9"
          />
        </div>
        <div>
          <Label className="text-xs">اللون</Label>
          <div className="flex items-center gap-1.5 mt-1.5">
            <input
              type="color"
              value={fill}
              onChange={(e) => patch({ fill: e.target.value })}
              className="w-9 h-9 rounded-md border border-border cursor-pointer bg-transparent"
            />
            <Input
              value={fill}
              onChange={(e) => patch({ fill: e.target.value })}
              className="h-9 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={isBold ? "default" : "outline"}
          onClick={() => patch({ fontWeight: isBold ? "normal" : "bold" })}
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isItalic ? "default" : "outline"}
          onClick={() => patch({ fontStyle: isItalic ? "normal" : "italic" })}
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          size="sm"
          variant={align === "right" ? "default" : "outline"}
          onClick={() => patch({ textAlign: "right" })}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={align === "center" ? "default" : "outline"}
          onClick={() => patch({ textAlign: "center" })}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={align === "left" ? "default" : "outline"}
          onClick={() => patch({ textAlign: "left" })}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function FontRow({
  f,
  active,
  onPick,
  onHover,
}: {
  f: string;
  active: boolean;
  onPick: (f: string) => void;
  onHover: (f: string) => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(f)}
      onClick={() => onPick(f)}
      className={`w-full text-right px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors ${
        active ? "bg-primary/10 text-primary font-bold" : ""
      }`}
      style={{ fontFamily: f }}
    >
      {f}
    </button>
  );
}
