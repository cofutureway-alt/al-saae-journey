import { useCountUp } from "@/hooks/use-count-up";
import { BookOpen, Users, ClipboardCheck, GraduationCap } from "lucide-react";
import { IslamicDivider, EightPointStar } from "@/components/IslamicPatterns";

const stats = [
  { icon: Users, label: "طالب مسجل", value: 1250 },
  { icon: BookOpen, label: "درس متاح", value: 340 },
  { icon: ClipboardCheck, label: "اختبار مكتمل", value: 5600 },
  { icon: GraduationCap, label: "شهادة صادرة", value: 890 },
];

const StatItem = ({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) => {
  const { ref, count } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-3 p-6 relative">
      {/* Subtle ornament behind icon */}
      <div className="absolute top-4 opacity-[0.06]">
        <EightPointStar size={50} className="text-primary" />
      </div>
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center relative z-10">
        <Icon size={28} className="text-primary" />
      </div>
      <span className="text-3xl md:text-4xl font-extrabold text-foreground">{count.toLocaleString("ar-EG")}</span>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section id="stats" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' fill='none'%3E%3Cg stroke='%23000' stroke-width='0.4'%3E%3Cpolygon points='30,8 42,14 46,27 42,40 30,46 18,40 14,27 18,14'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <IslamicDivider className="mb-8" />
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">إحصائيات المنصة</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
