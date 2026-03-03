import { Trophy, Medal, Crown } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { IslamicDivider, EightPointStar } from "@/components/IslamicPatterns";

const students = [
  { name: "أحمد محمد", score: 980 },
  { name: "خالد عبدالله", score: 945 },
  { name: "يوسف إبراهيم", score: 920 },
  { name: "عمر سعيد", score: 890 },
  { name: "محمد علي", score: 870 },
  { name: "سلطان فهد", score: 850 },
  { name: "عبدالرحمن حسن", score: 830 },
  { name: "فيصل ناصر", score: 810 },
];

const TopThreeCard = ({
  student,
  rank,
  isVisible,
}: {
  student: { name: string; score: number };
  rank: number;
  isVisible: boolean;
}) => {
  const config = {
    1: {
      icon: <Crown size={32} className="text-gold" />,
      border: "border-gold/50",
      bg: "bg-gold/10",
      shadow: "shadow-[0_0_30px_-5px_hsl(var(--gold)/0.3)]",
      size: "md:scale-110",
      order: "order-2 md:order-2",
      delay: "200ms",
      badge: "الأول",
      badgeBg: "bg-gold text-foreground",
    },
    2: {
      icon: <Medal size={28} className="text-silver" />,
      border: "border-silver/50",
      bg: "bg-silver/10",
      shadow: "shadow-[0_0_20px_-5px_hsl(var(--silver)/0.3)]",
      size: "",
      order: "order-1 md:order-1",
      delay: "100ms",
      badge: "الثاني",
      badgeBg: "bg-silver text-foreground",
    },
    3: {
      icon: <Medal size={28} className="text-bronze" />,
      border: "border-bronze/50",
      bg: "bg-bronze/10",
      shadow: "shadow-[0_0_20px_-5px_hsl(var(--bronze)/0.3)]",
      size: "",
      order: "order-3 md:order-3",
      delay: "300ms",
      badge: "الثالث",
      badgeBg: "bg-bronze text-foreground",
    },
  }[rank]!;

  return (
    <div
      className={`relative flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl border-2 ${config.border} ${config.bg} ${config.shadow} ${config.size} ${config.order} transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: config.delay }}
    >
      {/* Islamic arch decoration at top */}
      <svg className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-10 text-primary/10" viewBox="0 0 100 60" fill="none">
        <path d="M5 60 L5 30 Q5 5 50 5 Q95 5 95 30 L95 60" stroke="currentColor" strokeWidth="2" />
      </svg>
      {/* Rank badge */}
      <div className={`absolute -top-3 px-4 py-1 rounded-full text-xs font-bold ${config.badgeBg}`}>
        {config.badge}
      </div>
      {/* Avatar circle with star ornament */}
      <div className="relative">
        <div className={`w-20 h-20 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center`}>
          {config.icon}
        </div>
        <div className="absolute -bottom-1 -right-1 opacity-30">
          <EightPointStar size={14} className="text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-primary">{student.score}</span>
        <span className="text-xs text-muted-foreground">نقطة</span>
      </div>
    </div>
  );
};

const LeaderboardSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="leaderboard" className="py-24 relative overflow-hidden">
      {/* Corner ornaments */}
      <EightPointStar size={50} className="absolute top-12 right-12 text-primary/5 animate-spin-slow" />
      <EightPointStar size={35} className="absolute bottom-12 left-12 text-primary/5 animate-spin-slow" style={{ animationDirection: "reverse" }} />

      <div className="container mx-auto px-4 max-w-4xl relative z-10" ref={ref}>
        <IslamicDivider className="mb-8" />
        <h2
          className={`text-3xl md:text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          لوحة المتصدرين
        </h2>
        <p
          className={`text-muted-foreground text-center mb-12 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          أفضل الطلاب أداءً هذا الشهر
        </p>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 items-end">
          {students.slice(0, 3).map((s, i) => (
            <TopThreeCard key={s.name} student={s} rank={i + 1} isVisible={isVisible} />
          ))}
        </div>

        {/* Rest of students */}
        <div className="space-y-3">
          {students.slice(3).map((s, i) => {
            const rank = i + 4;
            return (
              <div
                key={s.name}
                className={`flex items-center gap-4 p-4 rounded-xl border border-border transition-all duration-500 hover:shadow-md ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: `${400 + i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                  {rank}
                </div>
                <span className="flex-1 font-semibold text-sm">{s.name}</span>
                <span className="text-sm font-bold text-primary">{s.score}</span>
                <span className="text-xs text-muted-foreground">نقطة</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
