import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import type { Canvas } from "fabric";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpToLine,
  ArrowDown,
  ArrowDownToLine,
  Circle as CircleIcon,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Palette,
  Save,
  Square,
  Trash2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardCanvas,
  cardCanvasHelpers,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "@/components/admin/cards/CardCanvas";

const CardBuilder = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<Canvas | null>(null);
  const bgFileRef = useRef<HTMLInputElement | null>(null);

  const [tplName, setTplName] = useState("");
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgColor, setBgColor] = useState("#0f172a");
  const [selected, setSelected] = useState<any | null>(null);
  const [selInfo, setSelInfo] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    (async () => {
      if (!templateId) return;
      const { data, error } = await (supabase as any)
        .from("card_templates")
        .select("*")
        .eq("id", templateId)
        .maybeSingle();
      if (error) {
        toast.error("تعذّر تحميل التصميم");
        return;
      }
      if (!data) {
        toast.error("التصميم غير موجود");
        navigate("/admin/cards");
        return;
      }
      setTplName(data.name);
      setDesign(data.front_design ?? {});
      if (data.front_design?.background && typeof data.front_design.background === "string") {
        setBgColor(data.front_design.background);
      }
      setLoading(false);
    })();
  }, [templateId, navigate]);

  const onSelectionChange = (obj: any | null) => {
    setSelected(obj);
    if (obj) {
      setSelInfo({
        left: Math.round(obj.left ?? 0),
        top: Math.round(obj.top ?? 0),
        width: Math.round((obj.width ?? 0) * (obj.scaleX ?? 1)),
        height: Math.round((obj.height ?? 0) * (obj.scaleY ?? 1)),
      });
    } else {
      setSelInfo(null);
    }
  };

  // Refresh readout while user modifies
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const handler = () => onSelectionChange(c.getActiveObject() ?? null);
    c.on("object:modified", handler);
    c.on("object:scaling", handler);
    c.on("object:moving", handler);
    return () => {
      c.off("object:modified", handler);
      c.off("object:scaling", handler);
      c.off("object:moving", handler);
    };
  }, [design]);

  const handleUploadBg = async (file: File) => {
    if (!templateId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("الحجم الأقصى 5 ميجابايت");
      return;
    }
    setUploadingBg(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${templateId}/bg-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("card-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("card-assets")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr || !signed?.signedUrl) throw signErr ?? new Error("no url");
      const c = canvasRef.current;
      if (c) await cardCanvasHelpers.setBackgroundImage(c, signed.signedUrl);
      toast.success("تم تعيين خلفية الصورة");
    } catch (e: any) {
      toast.error(e?.message ?? "تعذّر الرفع");
    } finally {
      setUploadingBg(false);
    }
  };

  const save = async () => {
    const c = canvasRef.current;
    if (!c || !templateId) return;
    setSaving(true);
    try {
      const json = c.toJSON();
      const { error } = await (supabase as any)
        .from("card_templates")
        .update({ front_design: json })
        .eq("id", templateId);
      if (error) throw error;
      toast.success("تم حفظ التصميم");
    } catch (e: any) {
      toast.error(e?.message ?? "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" onClick={() => navigate("/admin/cards")} className="gap-2">
          <ArrowRight className="w-4 h-4" /> رجوع
        </Button>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">تعديل كارت</div>
          <div className="font-black text-lg truncate">{tplName}</div>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ
        </Button>
      </div>

      {isSmall && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 p-3 flex items-center gap-2 text-sm">
          <Monitor className="w-4 h-4 shrink-0" />
          يفضل استخدام شاشة أكبر لتصميم الكروت — يظل التحرير متاحًا لكن قد يكون غير مريح على
          الأجهزة الصغيرة.
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-muted/20 p-4 md:p-6 min-h-[400px] flex items-center"
        >
          <div className="w-full">
            <CardCanvas
              initialJson={design}
              onReady={(c) => (canvasRef.current = c)}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Panel icon={<Palette className="w-4 h-4" />} title="الخلفية">
            <div>
              <Label className="text-xs">لون الخلفية</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBgColor(v);
                    const c = canvasRef.current;
                    if (c) cardCanvasHelpers.setBackgroundColor(c, v);
                  }}
                  className="w-12 h-10 rounded-md border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    const c = canvasRef.current;
                    if (c) cardCanvasHelpers.setBackgroundColor(c, e.target.value);
                  }}
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <input
                ref={bgFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadBg(f);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                onClick={() => bgFileRef.current?.click()}
                disabled={uploadingBg}
                className="w-full gap-2"
              >
                {uploadingBg ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                رفع صورة خلفية
              </Button>
            </div>
          </Panel>

          <Panel icon={<Square className="w-4 h-4" />} title="عناصر أساسية">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => canvasRef.current && cardCanvasHelpers.addRect(canvasRef.current)}
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                مستطيل
              </Button>
              <Button
                variant="secondary"
                onClick={() => canvasRef.current && cardCanvasHelpers.addCircle(canvasRef.current)}
                className="gap-2"
              >
                <CircleIcon className="w-4 h-4" />
                دائرة
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              مكتبة العناصر الكاملة (نص، QR، صور، حقول بيانات…) ستضاف في المراحل القادمة.
            </p>
          </Panel>

          <Panel icon={<Info className="w-4 h-4" />} title="خصائص العنصر المحدد">
            {selected && selInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Field label="X" value={`${selInfo.left}px`} />
                  <Field label="Y" value={`${selInfo.top}px`} />
                  <Field label="العرض" value={`${selInfo.width}px`} />
                  <Field label="الارتفاع" value={`${selInfo.height}px`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      canvasRef.current && cardCanvasHelpers.bringToFront(canvasRef.current)
                    }
                    className="gap-1.5"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                    للأمام
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      canvasRef.current && cardCanvasHelpers.bringForward(canvasRef.current)
                    }
                    className="gap-1.5"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    مستوى أعلى
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      canvasRef.current && cardCanvasHelpers.sendBackwards(canvasRef.current)
                    }
                    className="gap-1.5"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    مستوى أدنى
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      canvasRef.current && cardCanvasHelpers.sendToBack(canvasRef.current)
                    }
                    className="gap-1.5"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    للخلف
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    canvasRef.current && cardCanvasHelpers.deleteActive(canvasRef.current)
                  }
                  className="w-full gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف العنصر
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                اختر عنصرًا على الكارت لعرض خصائصه.
              </p>
            )}
          </Panel>

          <div className="rounded-xl border border-border bg-card p-3 text-[11px] text-muted-foreground flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            الأبعاد الحقيقية: {CARD_WIDTH} × {CARD_HEIGHT} بيكسل
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

const Panel = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card p-4 space-y-3"
  >
    <div className="flex items-center gap-2 font-bold">
      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </span>
      {title}
    </div>
    <div className="space-y-3">{children}</div>
  </motion.section>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md bg-muted/50 px-2 py-1.5">
    <div className="text-[10px] text-muted-foreground">{label}</div>
    <div className="font-mono font-semibold">{value}</div>
  </div>
);

export default CardBuilder;
