import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wallet as WalletIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPiastres, parseEgpToPiastres, piastresToEgpNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import StrongConfirmDialog from "@/components/admin/StrongConfirmDialog";

interface Gateway {
  id: string;
  gateway_key: string;
  display_name: string;
  is_enabled: boolean;
}

interface Settings {
  id: number;
  max_wallet_balance_piastres: number;
}

export default function AdminPaymentGateways() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxEgpInput, setMaxEgpInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: gws }, { data: cfg }] = await Promise.all([
      (supabase as any)
        .from("payment_gateways")
        .select("id, gateway_key, display_name, is_enabled")
        .order("created_at"),
      (supabase as any)
        .from("wallet_gateway_settings")
        .select("id, max_wallet_balance_piastres")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    setGateways((gws ?? []) as Gateway[]);
    setSettings(cfg as Settings | null);
    if (cfg) setMaxEgpInput(piastresToEgpNumber(cfg.max_wallet_balance_piastres));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleGateway = async (g: Gateway, next: boolean) => {
    setTogglingId(g.id);
    const { error } = await (supabase as any)
      .from("payment_gateways")
      .update({ is_enabled: next })
      .eq("id", g.id);
    setTogglingId(null);
    if (error) {
      toast.error(error.message ?? "تعذّر تحديث حالة البوابة");
      return;
    }
    setGateways((prev) => prev.map((x) => (x.id === g.id ? { ...x, is_enabled: next } : x)));
    toast.success(next ? "تم تفعيل البوابة" : "تم إيقاف البوابة — لن يتمكن الطلاب من الشراء عبرها.");
  };

  const saveMax = async () => {
    const piastres = parseEgpToPiastres(maxEgpInput);
    if (piastres === null || piastres <= 0) {
      toast.error("أدخل قيمة صحيحة أكبر من صفر");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("wallet_gateway_settings")
      .update({ max_wallet_balance_piastres: piastres })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error(error.message ?? "تعذّر حفظ الإعداد");
      return;
    }
    setSettings((prev) => (prev ? { ...prev, max_wallet_balance_piastres: piastres } : prev));
    toast.success("تم حفظ الحد الأقصى للرصيد");
  };

  const performReset = async () => {
    const { data, error } = await (supabase as any).rpc("admin_reset_all_wallets");
    if (error) {
      throw new Error(error.message ?? "تعذّر تنفيذ عملية التصفير");
    }
    const count = data?.success_count ?? 0;
    const totalPiastres = Number(data?.total_piastres_removed ?? 0);
    toast.success(
      `تم تصفير ${count} محفظة. إجمالي المبلغ الذي تم صرفه من النظام: ${formatPiastres(totalPiastres)}`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">إدارة بوابات الدفع</h1>
          <p className="text-sm text-muted-foreground">
            التحكم في طرق الدفع المتاحة للطلاب وإعدادات المحفظة الإلكترونية.
          </p>
        </div>
      </motion.div>

      {/* Gateways list */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold">طرق الدفع</h2>
          <p className="text-xs text-muted-foreground mt-1">
            إيقاف بوابة يمنع أي عمليات شراء جديدة عبرها فقط، ولا يمس أرصدة الطلاب.
          </p>
        </div>
        <div className="divide-y divide-border">
          {gateways.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 flex items-center gap-4"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  g.is_enabled ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground",
                )}
              >
                <WalletIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{g.display_name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{g.gateway_key}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-1 rounded",
                    g.is_enabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  )}
                >
                  {g.is_enabled ? "مفعّلة" : "موقوفة"}
                </span>
                <Switch
                  checked={g.is_enabled}
                  disabled={togglingId === g.id}
                  onCheckedChange={(v) => toggleGateway(g, v)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Wallet gateway settings */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold">إعدادات بوابة المحفظة</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              يُطبَّق الحد الأقصى على كل عمليات الشحن (الكروت والإجراءات الإدارية).
            </p>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-balance" className="text-sm font-semibold">
              الحد الأقصى لرصيد المحفظة (بالجنيه)
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="max-balance"
                type="number"
                min={1}
                step="1"
                value={maxEgpInput}
                onChange={(e) => setMaxEgpInput(e.target.value)}
                className="max-w-xs font-mono"
                dir="ltr"
              />
              <Button onClick={saveMax} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                حفظ
              </Button>
            </div>
            {settings && (
              <p className="text-xs text-muted-foreground">
                القيمة الحالية:{" "}
                <span className="font-semibold text-foreground">
                  {formatPiastres(settings.max_wallet_balance_piastres)}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-rose-700 dark:text-rose-300">تصفير كل المحافظ</div>
                <p className="text-sm text-foreground/80 mt-1">
                  إجراء لا رجعة فيه: يُعيد رصيد كل المحافظ إلى صفر ويسجّل عملية {""}
                  <span className="font-mono text-xs bg-rose-500/10 px-1 rounded">admin_reset</span>{" "}
                  في سجل كل محفظة متأثرة. الحسابات المحظورة مستثناة تلقائيًا.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => setResetOpen(true)}
            >
              <ShieldAlert className="w-4 h-4 ml-2" />
              تصفير كل المحافظ
            </Button>
          </div>
        </div>
      </section>

      <StrongConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="تصفير كل المحافظ"
        confirmLabel="تنفيذ التصفير"
        destructive
        description={
          <>
            <p>
              سيتم تعيين رصيد كل محفظة (باستثناء الحسابات المحظورة) إلى{" "}
              <span className="font-bold">صفر</span>.
            </p>
            <p>سيتم تسجيل حركة في السجل لكل محفظة متأثرة لأغراض التدقيق.</p>
            <p className="text-rose-600 dark:text-rose-400 font-semibold">
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </>
        }
        onConfirm={performReset}
      />
    </div>
  );
}

// ------------------------------------------------------------
// Strong-confirm dialog (Phase 35 pattern, self-contained here)
// ------------------------------------------------------------
function StrongConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmWord = "تأكيد",
  destructive,
  onConfirm,
  confirmLabel = "تنفيذ",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmWord?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
}) {
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open) {
      setTyped("");
      setLoading(false);
    }
  }, [open]);
  const matches = typed.trim() === confirmWord;
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center",
                destructive
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-primary/10 text-primary",
              )}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
              {description}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <Label className="text-xs text-muted-foreground">
            للتأكيد اكتب كلمة <span className="font-bold text-foreground">{confirmWord}</span> بالأسفل:
          </Label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmWord}
            className="text-center font-bold tracking-widest"
            autoFocus
            dir="rtl"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!matches || loading}
            onClick={async () => {
              try {
                setLoading(true);
                await onConfirm();
                onOpenChange(false);
              } catch (e: any) {
                toast.error(e?.message ?? "فشل تنفيذ العملية");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
