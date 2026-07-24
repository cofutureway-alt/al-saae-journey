import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  bookId: string;
  bookType: "digital" | "physical";
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  fullWidth?: boolean;
}

export default function AddToCartButton({
  bookId,
  bookType,
  size = "default",
  variant = "default",
  className,
  fullWidth,
}: Props) {
  const { addToCart, items } = useCart();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inCart = items.some((i) => i.book_id === bookId);
  const isDigitalInCart = inCart && bookType === "digital";

  const handle = async () => {
    if (isDigitalInCart) return;
    setLoading(true);
    const ok = await addToCart(bookId, bookType);
    setLoading(false);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      disabled={loading || isDigitalInCart}
      onClick={handle}
      className={`${fullWidth ? "w-full" : ""} ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> جاري الإضافة…
          </motion.span>
        ) : done ? (
          <motion.span key="d" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Check className="w-4 h-4" /> تمت الإضافة
          </motion.span>
        ) : isDigitalInCart ? (
          <motion.span key="in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Check className="w-4 h-4" /> في السلة
          </motion.span>
        ) : (
          <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> إضافة للسلة
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
