import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet as WalletIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatPiastres } from "@/lib/money";
import { cn } from "@/lib/utils";

interface Gateway {
  id: string;
  gateway_key: string;
  display_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  courseId: string;
  courseTitle: string;
  amountPiastres: number;
  onPurchased?: () => void;
}

export default function PurchaseCourseModal({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  amountPiastres,
  onPurchased,
}: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gateways, setGateways] = useState<Gateway[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    | { type: "success"; newBalance: number; reference: string }
    | { type: "error"; message: string; insufficient?: boolean }
    | null
  >(null);

  // Load gateways + balance whenever opened
  useEffect(() => {
    if (!open) return;
    setResult(null);
    setSelected(null);
    setLoading(true);
    (async () => {
      const [{ data: gws }, { data: wal }] = await Promise.all([
        (supabase as any)
          .from("payment_gateways")
          .select("id, gateway_key, display_name")
          .eq("is_enabled", true)
          .order("created_at"),
        user
          ? (supabase as any)
              .from("wallets")
              .select("balance_piastres")
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      const list = (gws ?? []) as Gateway[];
      setGateways(list);
      setWalletBalance(wal?.balance_piastres ?? 0);
      if (list.length === 1) setSelected(list[0].id);
      setLoading(false);
    })();
  }, [open, user]);

  const selectedGateway = gateways?.find((g) => g.id === selected) ?? null;
  const isWallet = selectedGateway?.gateway_key === "wallet";
  const insufficient = isWallet && walletBalance !== null && walletBalance < amountPiastres;
  const balanceAfter = isWallet && walletBalance !== null ? walletBalance - amountPiastres : null;

  const handleConfirm = async () => {
    if (!selectedGateway || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any).rpc("purchase_course", {
        p_course_id: courseId,
      });
      if (error) throw error;
      if (data?.success) {
        setResult({
          type: "success",
          newBalance: data.new_balance_piastres ?? 0,
          reference: data.reference_number ?? "",
        });
        onPurchased?.();
      } else {
        setResult({
          type: "error",
          message: data?.failure_reason ?? "تعذّر إتمام عملية الشراء",
          insufficient: data?.failure_reason === "رصيد غير كافٍ",
        });
      }
    } catch (e: any) {
      setResult({ type: "error", message: e?.message ?? "حدث خطأ غير متوقع" });
    } finally {
      setSubmitting(false);
    }
  };

  const goToCourse = () => {
    onOpenChange(false);
    // Small delay so the modal closes cleanly before the redirect
    setTimeout(() => navigate(`/courses/${courseId}`), 50);
  };

  const gatewayIconFor = (key: string) => {
    if (key === "wallet") return WalletIcon;
    return WalletIcon;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {result?.type === "success" ? "تم الشراء بنجاح" : "اختر طريقة الدفع"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1 truncate">{courseTitle}</p>
        </div>

        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {result?.type === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="text-center space-y-4 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.05, stiffness: 320, damping: 18 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <div>
                  <div className="text-lg font-bold">تم تفعيل الدورة على حسابك</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    الرصيد الجديد: {formatPiastres(result.newBalance)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded bg-accent">
                    {result.reference}
                  </div>
                </div>
                <Button size="lg" className="w-full font-bold" onClick={goToCourse}>
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  ابدأ الدورة الآن
                </Button>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </motion.div>
            ) : (gateways?.length ?? 0) === 0 ? (
              <motion.div
                key="none"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-dashed border-border p-8 text-center"
              >
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">لا توجد طريقة دفع متاحة حالياً</div>
                <p className="text-sm text-muted-foreground mt-1">
                  يرجى المحاولة لاحقًا أو التواصل مع الإدارة.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="pick"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Gateway options */}
                <div className="space-y-2">
                  {gateways!.map((g) => {
                    const Icon = gatewayIconFor(g.gateway_key);
                    const isSel = g.id === selected;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelected(g.id)}
                        className={cn(
                          "w-full text-right p-4 rounded-xl border-2 transition-all flex items-center gap-3 hover:bg-accent/40",
                          isSel
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-border",
                        )}
                      >
                        <div
                          className={cn(
                            "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
                            isSel ? "bg-primary text-primary-foreground" : "bg-accent text-primary",
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{g.display_name}</div>
                          {g.gateway_key === "wallet" && walletBalance !== null && (
                            <div className="text-xs text-muted-foreground">
                              الرصيد الحالي: {formatPiastres(walletBalance)}
                            </div>
                          )}
                        </div>
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                            isSel ? "border-primary bg-primary" : "border-muted-foreground/40",
                          )}
                        >
                          {isSel && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Summary panel */}
                {isWallet && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <div className="p-4 space-y-2 text-sm">
                      <Row label="سعر الدورة" value={formatPiastres(amountPiastres)} strong />
                      <div className="border-t border-border" />
                      <Row
                        label="الرصيد قبل الشراء"
                        value={formatPiastres(walletBalance ?? 0)}
                      />
                      <Row
                        label="الرصيد بعد الشراء"
                        value={formatPiastres(balanceAfter ?? 0)}
                        highlight={insufficient ? "danger" : "ok"}
                      />
                    </div>
                    {insufficient && (
                      <div className="px-4 py-3 bg-rose-500/10 border-t border-rose-500/20 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-rose-700 dark:text-rose-300">
                            رصيد غير كافٍ
                          </div>
                          <button
                            onClick={() => {
                              onOpenChange(false);
                              setTimeout(() => navigate("/dashboard/wallet"), 50);
                            }}
                            className="text-xs underline text-rose-700 dark:text-rose-300 mt-0.5"
                          >
                            اذهب إلى المحفظة لشحن الرصيد
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Error banner */}
                {result?.type === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-rose-700 dark:text-rose-300">
                        {result.message}
                      </div>
                      {result.insufficient && (
                        <button
                          onClick={() => {
                            onOpenChange(false);
                            setTimeout(() => navigate("/dashboard/wallet"), 50);
                          }}
                          className="text-xs underline text-rose-700 dark:text-rose-300 mt-0.5"
                        >
                          اذهب إلى المحفظة لشحن الرصيد
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Trust footer */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  عملية آمنة — يتم الخصم لمرة واحدة وتفعيل الدورة فورًا.
                </div>

                <Button
                  size="lg"
                  className="w-full font-bold shadow-lg shadow-primary/20"
                  disabled={!selected || submitting || (isWallet && insufficient)}
                  onClick={handleConfirm}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 ml-2" />
                  )}
                  تأكيد الشراء
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  strong,
  highlight,
}: {
  label: string;
  value: string;
  strong?: boolean;
  highlight?: "ok" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          strong && "font-bold text-base",
          highlight === "danger" && "text-rose-600 dark:text-rose-400 font-bold",
          highlight === "ok" && "text-emerald-600 dark:text-emerald-400 font-bold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
