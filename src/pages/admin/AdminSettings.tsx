import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Settings2, PlaySquare, Sparkles, ChevronLeft, FormInput } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">
          إعدادات المنصة وسلوك مشغّل الفيديو.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link
            to="/admin/settings/video-player"
            className="group block h-full rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <PlaySquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">إعدادات مشغّل الفيديو</div>
                <p className="text-sm text-muted-foreground">
                  التحكم بالتقديم والسرعة، وشرط نسبة المشاهدة، والعلامة المائية.
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 md:p-14 text-center"
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Settings2 className="w-10 h-10 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            قريبًا
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">المزيد من الإعدادات قادم قريبًا</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            سنضيف قريبًا إعدادات إضافية للمنصة في إصدارات قادمة.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
