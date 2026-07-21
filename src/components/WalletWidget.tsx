import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatPiastres } from "@/lib/money";
import { cn } from "@/lib/utils";

const WalletWidget = ({ to = "/dashboard/wallet" }: { to?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await (supabase as any)
        .from("wallets")
        .select("balance_piastres")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      setBalance(data?.balance_piastres ?? 0);
      setLoading(false);
    };
    load();

    // Realtime updates when balance changes
    let channel: any = null;
    if (user) {
      channel = (supabase as any).channel(`wallet-widget-${user.id}-${Date.now()}`);
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const next = payload?.new?.balance_piastres;
          if (typeof next === "number") setBalance(next);
        }
      );
      channel.subscribe();
    }

    return () => {
      active = false;
      if (channel) (supabase as any).removeChannel(channel);
    };
  }, [user?.id]);

  if (!user) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      title="محفظتي"
      className={cn(
        "group relative flex items-center gap-2 rounded-full border border-border/60 bg-card/70 hover:bg-accent transition-colors px-3 py-1.5 h-9"
      )}
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
        <WalletIcon className="w-3.5 h-3.5" />
      </span>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] text-muted-foreground hidden sm:block">الرصيد</span>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="l"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs font-bold"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
            </motion.span>
          ) : (
            <motion.span
              key={balance ?? 0}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-xs font-extrabold text-foreground tabular-nums"
            >
              {formatPiastres(balance ?? 0)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default WalletWidget;
