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
      icon: <Crown className="text-gold w-6 h-6 md:w-8 md:h-8" />,
      border: "border-gold/50",
      bg: "bg-gold/10",
      shadow: "shadow-[0_0_20px_-5px_hsl(var(--gold)/0.3)]",
      isFirst: true,
      order: "order-2",
      delay: "200ms",
      badge: "الأول",
      badgeBg: "bg-gold text-foreground",
    },
    2: {
      icon: <Medal className="text-silver w-5 h-5 md:w-7 md:h-7" />,
      border: "border-silver/50",
      bg: "bg-silver/10",
      shadow: "shadow-[0_0_15px_-5px_hsl(var(--silver)/0.3)]",
      isFirst: false,
      order: "order-1",
      delay: "100ms",
      badge: "الثاني",
      badgeBg: "bg-silver text-foreground",
    },
    3: {
      icon: <Medal className="text-bronze w-5 h-5 md:w-7 md:h-7" />,
      border: "border-bronze/50",
      bg: "bg-bronze/10",
      shadow: "shadow-[0_0_15px_-5px_hsl(var(--bronze)/0.3)]",
      isFirst: false,
      order: "order-3",
      delay: "300ms",
      badge: "الثالث",
      badgeBg: "bg-bronze text-foreground",
    },
  }[rank]!;

  return (
    <div
      className={`relative flex flex-col items-center gap-2 md:gap-4 p-3 md:p-8 rounded-2xl border-2 ${config.border} ${config.bg} ${config.shadow} ${config.order} transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${config.isFirst ? "md:scale-110 self-stretch" : "self-end"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: config.delay }}
    >
      {/* Rank badge */}
      <div className={`absolute -top-3 px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${config.badgeBg}`}>
        {config.badge}
      </div>
      {/* Avatar circle */}
      <div className="relative mt-2">
        <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center`}>
          {config.icon}
        </div>
        <div className="absolute -bottom-1 -right-1 opacity-30">
          <EightPointStar size={10} className="text-primary md:hidden" />
          <EightPointStar size={14} className="text-primary hidden md:block" />
        </div>
      </div>
      <h3 className="text-xs md:text-lg font-bold text-foreground text-center leading-tight">{student.name}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-base md:text-2xl font-extrabold text-primary">{student.score}</span>
        <span className="text-[9px] md:text-xs text-muted-foreground">نقطة</span>
      </div>
    </div>
  );
};

const LeaderboardSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="leaderboard" className="py-16 md:py-24 relative overflow-hidden">
      {/* Corner ornaments */}
      <EightPointStar size={50} className="absolute top-12 right-12 text-primary/5 animate-spin-slow" />
      <EightPointStar size={35} className="absolute bottom-12 left-12 text-primary/5 animate-spin-slow" style={{ animationDirection: "reverse" }} />

      <div className="container mx-auto px-4 max-w-4xl relative z-10" ref={ref}>
        <IslamicDivider className="mb-8" />
        <h2
          className={`text-2xl md:text-4xl font-bold text-center mb-2 md:mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          لوحة المتصدرين
        </h2>
        <p
          className={`text-sm md:text-base text-muted-foreground text-center mb-8 md:mb-12 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          أفضل الطلاب أداءً هذا الشهر
        </p>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-8 items-end px-2 md:px-0">
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
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-border transition-all duration-500 hover:shadow-md ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: `${400 + i * 80}ms` }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs md:text-sm shrink-0">
                  {rank}
                </div>
                <span className="flex-1 font-semibold text-xs md:text-sm">{s.name}</span>
                <span className="text-xs md:text-sm font-bold text-primary">{s.score}</span>
                <span className="text-[10px] md:text-xs text-muted-foreground">نقطة</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
