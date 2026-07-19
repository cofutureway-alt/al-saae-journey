import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Loader2, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { renderCardToDataURL } from "@/components/admin/cards/CardCanvas";

interface Tpl {
  id: string;
  name: string;
  is_default: boolean;
  front_design: any;
  back_design: any;
  updated_at: string;
}

const AdminCards = () => {
  const [tpl, setTpl] = useState<Tpl | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("card_templates")
        .select("*")
        .eq("is_default", true)
        .maybeSingle();
      if (error) toast.error("تعذّر تحميل التصميم");
      setTpl(data as Tpl | null);
      setLoading(false);
      if (data?.front_design) {
        try {
          const url = await renderCardToDataURL(data.front_design);
          setPreview(url);
        } catch (e) {
          console.error(e);
        }
      }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black">كروت الطلاب</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            صمّم كارت الطالب — التصميم الافتراضي يُستخدم لجميع الطلاب.
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="rounded-2xl border border-border/60 bg-card p-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !tpl ? (
        <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
          لم يتم إعداد أي تصميم افتراضي بعد.
        </div>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/60 bg-card p-6 md:p-8"
        >
          <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                معاينة الوجه الأمامي
              </div>
              <div className="aspect-[1011/638] w-full rounded-2xl border border-border overflow-hidden bg-muted/30">
                {preview ? (
                  <img
                    src={preview}
                    alt="معاينة الكارت"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    لا توجد معاينة بعد
                  </div>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                المقاس الحقيقي: 1011 × 638 بيكسل (85.6mm × 54mm عند 300 DPI — CR80).
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">اسم التصميم</div>
                <div className="rounded-xl border border-border bg-background p-3 font-bold">
                  {tpl.name}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">
                  التصميم الافتراضي
                </span>
              </div>
              <Link to={`/admin/cards/${tpl.id}/edit`}>
                <Button className="w-full gap-2">
                  <Pencil className="w-4 h-4" />
                  تعديل التصميم
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                إدارة تصميمات متعددة وتصدير PDF ستتوفّر لاحقًا. حاليًا يمكن تعديل التصميم
                الافتراضي فقط.
              </p>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default AdminCards;
