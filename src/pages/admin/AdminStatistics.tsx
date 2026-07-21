import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Layers,
  ListChecks,
  Trophy,
  TrendingUp,
  ArrowLeft,
  Users,
  ClipboardList,
  HelpCircle,
  FileText,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { useAdminStats } from "@/hooks/use-stats";
import { StatCard } from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSignedThumbnail } from "@/hooks/use-signed-thumbnail";

const AdminStatistics = () => {
  const stats = useAdminStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">الإحصائيات</h1>
        <p className="text-muted-foreground mt-2">
          نظرة عامة على أداء المنصة والدورات الأكثر تسجيلاً.
        </p>
      </motion.div>

      {/* Summary cards */}
      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="الكورسات المنشورة"
            value={stats.publishedCourses}
            icon={BookOpen}
            accent="primary"
            delay={0}
          />
          <StatCard
            label="عدد الطلاب"
            value={stats.studentsCount}
            icon={Users}
            accent="emerald"
            delay={0.05}
          />
          <StatCard
            label="إجمالي الدروس"
            value={stats.totalLessons}
            icon={ListChecks}
            accent="violet"
            delay={0.1}
          />
          <StatCard
            label="عدد المراحل الدراسية"
            value={stats.stagesCount}
            icon={Layers}
            accent="amber"
            delay={0.15}
          />
          <StatCard
            label="إجمالي الاختبارات"
            value={stats.totalQuizzes}
            icon={ClipboardList}
            accent="primary"
            delay={0.2}
          />
          <StatCard
            label="إجمالي الأسئلة"
            value={stats.totalQuestions}
            icon={HelpCircle}
            accent="emerald"
            delay={0.25}
          />
        </div>
      )}

      {/* Top courses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      >
        <div className="p-5 md:p-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">الأكثر تسجيلاً</h2>
              <p className="text-xs text-muted-foreground">أفضل 5 دورات من حيث عدد الطلاب</p>
            </div>
          </div>
          <Link
            to="/admin/courses"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            كل الدورات
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!stats ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : stats.topCourses.length === 0 ? (
          <EmptyTop />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60 bg-muted/30">
                  <tr>
                    <th className="text-right p-4 w-16">#</th>
                    <th className="text-right p-4">الدورة</th>
                    <th className="text-right p-4">المرحلة</th>
                    <th className="text-right p-4 w-40">عدد التسجيلات</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCourses.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      className="border-b border-border/40 hover:bg-accent/30 transition-colors"
                    >
                      <td className="p-4">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <TopThumb path={c.thumbnail_url} />
                          <div className="font-semibold text-foreground line-clamp-1">
                            {c.title}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {c.stage_name ? (
                          <Badge variant="secondary" className="font-medium">
                            {c.stage_name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-2 text-sm font-bold tabular-nums">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          {c.enrollment_count}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked list */}
            <div className="md:hidden divide-y divide-border/50">
              {stats.topCourses.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="p-4 flex items-center gap-3"
                >
                  <RankBadge rank={i + 1} />
                  <TopThumb path={c.thumbnail_url} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm line-clamp-1">{c.title}</div>
                    {c.stage_name && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {c.stage_name}
                      </div>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1 text-sm font-bold tabular-nums shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    {c.enrollment_count}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Most-failed quizzes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      >
        <div className="p-5 md:p-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">الاختبارات الأكثر رسوباً</h2>
              <p className="text-xs text-muted-foreground">
                ترتيب حسب عدد الطلاب الراسبين في نتيجتهم الرسمية
              </p>
            </div>
          </div>
        </div>

        {!stats ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : stats.mostFailedQuizzes.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-3">
              <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="font-bold mb-1">لا توجد حالات رسوب بعد</div>
            <div className="text-sm text-muted-foreground">جميع الطلاب اجتازوا اختباراتهم الرسمية.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60 bg-muted/30">
                <tr>
                  <th className="text-right p-4 w-12">#</th>
                  <th className="text-right p-4">الاختبار</th>
                  <th className="text-right p-4 hidden md:table-cell">الكورس</th>
                  <th className="text-right p-4 hidden lg:table-cell">المرحلة / المادة</th>
                  <th className="text-right p-4 w-24">الراسبون</th>
                  <th className="text-right p-4 w-32">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {stats.mostFailedQuizzes.map((q, i) => (
                  <tr key={q.quiz_id} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                    <td className="p-4 text-muted-foreground font-bold">{i + 1}</td>
                    <td className="p-4 font-semibold text-foreground">{q.quiz_title}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{q.course_title}</td>
                    <td className="p-4 hidden lg:table-cell text-xs text-muted-foreground">
                      {[q.stage_name, q.subject_name].filter(Boolean).join(" • ") || "—"}
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 text-destructive px-2.5 py-1 text-sm font-bold tabular-nums">
                        {q.failed_count}
                        <span className="text-xs opacity-70">/ {q.total_official}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/admin/quiz-attempts?quizId=${q.quiz_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          المحاولات <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/quiz-statistics/${q.quiz_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
                          title="تحليل الأسئلة"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const RankBadge = ({ rank }: { rank: number }) => {
  const styles: Record<number, string> = {
    1: "bg-amber-500 text-white",
    2: "bg-slate-400 text-white",
    3: "bg-amber-700 text-white",
  };
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
        styles[rank] || "bg-muted text-muted-foreground"
      }`}
    >
      {rank}
    </div>
  );
};

const TopThumb = ({ path }: { path: string | null }) => {
  const url = useSignedThumbnail(path);
  return (
    <div className="w-14 h-10 rounded-lg overflow-hidden bg-accent shrink-0 flex items-center justify-center">
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <BookOpen className="w-5 h-5 text-muted-foreground/50" />
      )}
    </div>
  );
};

const EmptyTop = () => (
  <div className="p-10 text-center">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
      <GraduationCap className="w-6 h-6 text-primary" />
    </div>
    <div className="font-bold mb-1">لا توجد تسجيلات بعد</div>
    <div className="text-sm text-muted-foreground">
      ستظهر هنا الدورات الأكثر شعبية عند تسجيل أول طالب.
    </div>
  </div>
);

export default AdminStatistics;
