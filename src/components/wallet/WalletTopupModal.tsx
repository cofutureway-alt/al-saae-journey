import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Clock, ArrowRight, Wallet as WalletIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatPiastres, parseEgpToPiastres } from "@/lib/money";
import ManualPaymentForm from "@/components/payments/ManualPaymentForm";
import {
  ManualPaymentMethod,
  listEnabledManualMethods,
  submitManualWalletTopup,
} from "@/lib/manual-payment-api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentBalance: number;
  onSubmitted?: () => void;
}

export default function WalletTopupModal({ open, onOpenChange, currentBalance, onSubmitted }: Props) {
  const [step, setStep] = useState<"amount" | "pay" | "done">("amount");
  const [amountInput, setAmountInput] = useState("");
  const [amountPiastres, setAmountPiastres] = useState<number | null>(null);
  const [maxBalance, setMaxBalance] = useState<number>(200000);
  const [methods, setMethods] = useState<ManualPaymentMethod[]>([]);
  const [manualGatewayEnabled, setManualGatewayEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep("amount");
    setAmountInput("");
    setAmountPiastres(null);
    setError(null);
    setReference(null);
    setLoading(true);
    (async () => {
      const [{ data: cfg }, { data: gw }, ms] = await Promise.all([
        (supabase as any).from("wallet_gateway_settings").select("max_wallet_balance_piastres").eq("id", 1).maybeSingle(),
        (supabase as any).from("payment_gateways").select("is_enabled").eq("gateway_key", "manual").maybeSingle(),
        listEnabledManualMethods().catch(() => []),
      ]);
      setMaxBalance(cfg?.max_wallet_balance_piastres ?? 200000);
      setManualGatewayEnabled(!!gw?.is_enabled);
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
    if (!manualGatewayEnabled || methods.length === 0) {
      setError("لا توجد بوابة دفع خارجية متاحة حاليًا. جرّب استخدام كارت الشحن.");
      return;
    }
    setError(null);
    setAmountPiastres(p);
    setStep("pay");
  };

  const handleSubmit = async (args: { methodId: string; senderNumber: string; proofPath: string }) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

              {step === "pay" && amountPiastres && (
                <motion.div key="pay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm text-center">
                    المبلغ المطلوب شحنه: <span className="font-bold">{formatPiastres(amountPiastres)}</span>
                  </div>
                  <ManualPaymentForm
                    methods={methods}
                    onSubmit={handleSubmit}
                    submitLabel="إرسال طلب الشحن"
                  />
                  <button
                    type="button"
                    onClick={() => setStep("amount")}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                  >
                    تعديل المبلغ
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
