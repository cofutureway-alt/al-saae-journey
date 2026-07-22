import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Clock,
  ArrowRight,
  Wallet as WalletIcon,
  HandCoins,
  CreditCard,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatPiastres, parseEgpToPiastres } from "@/lib/money";
import { cn } from "@/lib/utils";
import ManualPaymentForm from "@/components/payments/ManualPaymentForm";
import {
  ManualPaymentMethod,
  listEnabledManualMethods,
  submitManualWalletTopup,
} from "@/lib/manual-payment-api";
import { initiateKashierPayment } from "@/lib/kashier-api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentBalance: number;
  onSubmitted?: () => void;
}

type GatewayKey = "manual" | "kashier";

export default function WalletTopupModal({ open, onOpenChange, currentBalance, onSubmitted }: Props) {
  const [step, setStep] = useState<"amount" | "gateway" | "pay" | "done">("amount");
  const [amountInput, setAmountInput] = useState("");
  const [amountPiastres, setAmountPiastres] = useState<number | null>(null);
  const [maxBalance, setMaxBalance] = useState<number>(200000);
  const [methods, setMethods] = useState<ManualPaymentMethod[]>([]);
  const [manualEnabled, setManualEnabled] = useState(false);
  const [kashierEnabled, setKashierEnabled] = useState(false);
  const [gateway, setGateway] = useState<GatewayKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep("amount");
    setAmountInput("");
    setAmountPiastres(null);
    setGateway(null);
    setError(null);
    setReference(null);
    setLoading(true);
    (async () => {
      const [{ data: cfg }, { data: gws }, ms] = await Promise.all([
        (supabase as any).from("wallet_gateway_settings").select("max_wallet_balance_piastres").eq("id", 1).maybeSingle(),
        (supabase as any).from("payment_gateways").select("gateway_key, is_enabled").in("gateway_key", ["manual", "kashier"]),
        listEnabledManualMethods().catch(() => []),
      ]);
      setMaxBalance(cfg?.max_wallet_balance_piastres ?? 200000);
      const list = (gws ?? []) as Array<{ gateway_key: string; is_enabled: boolean }>;
      setManualEnabled(!!list.find((g) => g.gateway_key === "manual")?.is_enabled);
      setKashierEnabled(!!list.find((g) => g.gateway_key === "kashier")?.is_enabled);
      setMethods(ms);
      setLoading(false);
    })();
  }, [open]);

  const nextFromAmount = () => {
    const p = parseEgpToPiastres(amountInput);
    if (p === null || p <= 0) {
      setError("أدخل قيمة صحيحة");
      return;
    }
    if (currentBalance + p > maxBalance) {
      setError(`المبلغ سيتجاوز الحد الأقصى للرصيد (${(maxBalance / 100).toFixed(0)} ج.م)`);
      return;
    }
    const manualAvailable = manualEnabled && methods.length > 0;
    if (!manualAvailable && !kashierEnabled) {
      setError("لا توجد بوابة دفع خارجية متاحة حاليًا. جرّب استخدام كارت الشحن.");
      return;
    }
    setError(null);
    setAmountPiastres(p);
    // If only one gateway is available, skip the picker.
    if (manualAvailable && !kashierEnabled) {
      setGateway("manual");
      setStep("pay");
    } else if (!manualAvailable && kashierEnabled) {
      setGateway("kashier");
      setStep("pay");
    } else {
      setStep("gateway");
    }
  };

  const handleManualSubmit = async (args: { methodId: string; senderNumber: string; proofPath: string }) => {
    if (!amountPiastres) return;
    const data = await submitManualWalletTopup({
      amountPiastres,
      methodId: args.methodId,
      senderNumber: args.senderNumber,
      proofPath: args.proofPath,
    });
    setReference(data?.reference_number ?? "");
    setStep("done");
    onSubmitted?.();
  };

  const handleKashierConfirm = async () => {
    if (!amountPiastres || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await initiateKashierPayment({
        purpose: "wallet_topup",
        topupAmountPiastres: amountPiastres,
      });
      window.location.assign(res.redirect_url);
    } catch (e: any) {
      setError(e?.message ?? "تعذّر بدء عملية الدفع");
      setSubmitting(false);
    }
  };

  const manualAvailable = manualEnabled && methods.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">شحن المحفظة عبر بوابة دفع</DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === "amount" && (
                <motion.div key="amount" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="rounded-xl bg-accent/40 border border-border p-4 flex items-center gap-3">
                    <WalletIcon className="w-6 h-6 text-primary" />
                    <div className="text-sm">
                      <div className="text-muted-foreground">رصيدك الحالي</div>
                      <div className="font-bold text-lg">{formatPiastres(currentBalance)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topup-amount" className="text-sm font-bold">المبلغ المطلوب شحنه (بالجنيه)</Label>
                    <Input
                      id="topup-amount"
                      inputMode="numeric"
                      dir="ltr"
                      value={amountInput}
                      onChange={(e) => { setAmountInput(e.target.value); setError(null); }}
                      className="h-12 text-lg font-mono"
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      الحد الأقصى لرصيد المحفظة: {(maxBalance / 100).toFixed(0)} ج.م
                    </p>
                  </div>
                  {error && (
                    <div className="text-sm flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}
                  <Button size="lg" className="w-full font-bold" onClick={nextFromAmount}>
                    متابعة إلى الدفع
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </motion.div>
              )}

              {step === "gateway" && amountPiastres && (
                <motion.div key="gateway" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm text-center">
                    المبلغ المطلوب شحنه: <span className="font-bold">{formatPiastres(amountPiastres)}</span>
                  </div>
                  <div className="text-sm font-bold">اختر طريقة الدفع</div>
                  {kashierEnabled && (
                    <button
                      type="button"
                      onClick={() => { setGateway("kashier"); setStep("pay"); }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-right hover:border-primary hover:bg-primary/5 transition-colors",
                      )}
                    >
                      <CreditCard className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <div className="font-bold">الدفع الإلكتروني (Kashier)</div>
                        <div className="text-xs text-muted-foreground">بطاقة بنكية أو محفظة إلكترونية — تفعيل فوري</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  {manualAvailable && (
                    <button
                      type="button"
                      onClick={() => { setGateway("manual"); setStep("pay"); }}
                      className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-right hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <HandCoins className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <div className="font-bold">تحويل يدوي (Vodafone Cash / InstaPay)</div>
                        <div className="text-xs text-muted-foreground">تحويل + رفع إثبات، ثم مراجعة إدارية</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep("amount")}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                  >
                    تعديل المبلغ
                  </button>
                </motion.div>
              )}

              {step === "pay" && amountPiastres && gateway === "manual" && (
                <motion.div key="pay-manual" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm text-center">
                    المبلغ المطلوب شحنه: <span className="font-bold">{formatPiastres(amountPiastres)}</span>
                  </div>
                  <ManualPaymentForm
                    methods={methods}
                    onSubmit={handleManualSubmit}
                    submitLabel="إرسال طلب الشحن"
                  />
                  <button
                    type="button"
                    onClick={() => setStep(kashierEnabled && manualAvailable ? "gateway" : "amount")}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                  >
                    رجوع
                  </button>
                </motion.div>
              )}

              {step === "pay" && amountPiastres && gateway === "kashier" && (
                <motion.div key="pay-kashier" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <CreditCard className="w-4 h-4 text-primary" />
                      الدفع الإلكتروني عبر Kashier
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      سيتم تحويلك إلى صفحة Kashier الآمنة لإتمام الدفع، ثم العودة تلقائيًا وإضافة الرصيد إلى محفظتك.
                    </p>
                    <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                      <span className="text-muted-foreground">المبلغ</span>
                      <span className="font-bold text-base">{formatPiastres(amountPiastres)}</span>
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    تحويل آمن — سيتم إتمام الدفع على صفحة Kashier ثم العودة تلقائيًا.
                  </div>
                  <Button
                    size="lg"
                    className="w-full font-bold shadow-lg shadow-primary/20"
                    disabled={submitting}
                    onClick={handleKashierConfirm}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 ml-2" />
                    )}
                    المتابعة إلى Kashier
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep(manualAvailable ? "gateway" : "amount")}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                    disabled={submitting}
                  >
                    رجوع
                  </button>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">تم إرسال طلب الشحن</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      سيتم إضافة الرصيد بعد مراجعة الطلب.
                    </div>
                    {reference && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded bg-accent">
                        {reference}
                      </div>
                    )}
                  </div>
                  <Button size="lg" className="w-full" onClick={() => onOpenChange(false)}>
                    إغلاق
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
