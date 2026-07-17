import { motion } from "framer-motion";
import { BarChart3, Sparkles } from "lucide-react";

const AdminStatistics = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">الإحصائيات</h1>
        <p className="text-muted-foreground mt-2">
          نظرة عامة على أداء المنصة والطلاب.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/30 p-10 md:p-16 text-center"
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

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            قريبًا
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            لوحة إحصائيات ذكية قيد الإعداد
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            سنوفر قريبًا مؤشرات مفصلة عن عدد الطلاب، معدلات إكمال الدورات، ونشاط
            المنصة في إصدار قادم.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminStatistics;
