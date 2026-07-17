import { motion } from "framer-motion";
import { BarChart3, Sparkles } from "lucide-react";

const StudentStatistics = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border-2 border-dashed border-border p-10 md:p-16 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary/5"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-primary/5"
        />

        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="mx-auto inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6"
          >
            <BarChart3 className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            إحصائياتك قادمة قريبًا
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            نعمل على لوحة إحصائيات ثريّة تعرض تقدّمك، ساعات دراستك، ومعدل إنجازك
            الأسبوعي. ترقّبها في إصدار قادم.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            قيد التطوير
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentStatistics;
