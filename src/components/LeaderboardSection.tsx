import { Trophy, Medal, Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

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

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy size={22} className="text-gold" />;
  if (rank === 2) return <Medal size={22} className="text-silver" />;
  if (rank === 3) return <Medal size={22} className="text-bronze" />;
  return <Star size={16} className="text-muted-foreground" />;
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gold/10 border-gold/30";
  if (rank === 2) return "bg-silver/10 border-silver/30";
  if (rank === 3) return "bg-bronze/10 border-bronze/30";
  return "border-border";
};

const LeaderboardSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="leaderboard" className="py-24">
      <div className="container mx-auto px-4 max-w-2xl" ref={ref}>
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          لوحة المتصدرين
        </h2>
        <p className={`text-muted-foreground text-center mb-12 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          أفضل الطلاب أداءً هذا الشهر
        </p>
        <div className="space-y-3">
          {students.map((s, i) => {
            const rank = i + 1;
            return (
              <div
                key={s.name}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 hover:shadow-md ${getRankStyle(rank)} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: `${200 + i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                  {rank <= 3 ? getRankIcon(rank) : rank}
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
