import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const AdminCourses = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">الدورات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة الدورات التعليمية على المنصة.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl border border-dashed border-border/70 bg-card/50 p-12 md:p-16 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">إدارة الدورات</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          سيتم تفعيل إنشاء وتحرير الدورات في المرحلة القادمة من التطوير.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminCourses;
