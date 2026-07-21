import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Wallet,
  DollarSign,
  Receipt,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStats } from "@/hooks/use-stats";
import { StatCard } from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSignedThumbnail } from "@/hooks/use-signed-thumbnail";
import { formatPiastres } from "@/lib/money";

type TabKey = "content" | "academic" | "financial";

const AdminStatistics = () => {
  const stats = useAdminStats();
  const [tab, setTab] = useState<TabKey>("content");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">الإحصائيات</h1>
        <p className="text-muted-foreground mt-2">
          نظرة عامة على المحتوى والأداء الأكاديمي والحالة المالية للمنصة.
        </p>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-6">
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
          <TabsList className="inline-flex w-auto min-w-full md:min-w-0 md:w-auto gap-1 bg-muted/60 p-1 rounded-2xl">
            <TabsTrigger
              value="content"
              className="rounded-xl px-4 md:px-6 py-2.5 text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="rounded-xl px-4 md:px-6 py-2.5 text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4" />
              الأداء الأكاديمي
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-xl px-4 md:px-6 py-2.5 text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Wallet className="w-4 h-4" />
              المالية
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent key="content" value="content" forceMount={false as any}>
            <TabPane keyName="content" active={tab === "content"}>
              <ContentTab stats={stats} />
            </TabPane>
          </TabsContent>

          <TabsContent key="academic" value="academic" forceMount={false as any}>
            <TabPane keyName="academic" active={tab === "academic"}>
              <AcademicTab stats={stats} />
            </TabPane>
          </TabsContent>

          <TabsContent key="financial" value="financial" forceMount={false as any}>
            <TabPane keyName="financial" active={tab === "financial"}>
              <FinancialTab stats={stats} />
            </TabPane>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

const TabPane = ({
  keyName,
  active,
  children,
}: {
  keyName: string;
  active: boolean;
  children: React.ReactNode;
}) => {
  if (!active) return null;
  return (
    <motion.div
      key={keyName}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {children}
    </motion.div>
  );
};

/* ------------------------------ Content Tab ------------------------------ */

const ContentTab = ({ stats }: { stats: ReturnType<typeof useAdminStats> }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard label="الكورسات المنشورة" value={stats.publishedCourses} icon={BookOpen} accent="primary" delay={0} />
      <StatCard label="عدد الطلاب" value={stats.studentsCount} icon={Users} accent="emerald" delay={0.05} />
      <StatCard label="إجمالي الدروس" value={stats.totalLessons} icon={ListChecks} accent="violet" delay={0.1} />
      <StatCard label="عدد المراحل الدراسية" value={stats.stagesCount} icon={Layers} accent="amber" delay={0.15} />
      <StatCard label="إجمالي الاختبارات" value={stats.totalQuizzes} icon={ClipboardList} accent="primary" delay={0.2} />
      <StatCard label="إجمالي الأسئلة" value={stats.totalQuestions} icon={HelpCircle} accent="emerald" delay={0.25} />
      <StatCard label="إجمالي الواجبات" value={stats.totalAssignments} icon={FileText} accent="violet" delay={0.3} />
    </div>
  );
};

/* ------------------------------ Academic Tab ------------------------------ */

const AcademicTab = ({ stats }: { stats: ReturnType<typeof useAdminStats> }) => {
  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
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
      </div>

      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="font-bold mb-1">المزيد من إحصائيات الأداء الأكاديمي قريباً</div>
        <div className="text-sm text-muted-foreground">
          سيتم إضافة تحليلات أعمق للأداء الأكاديمي في التحديث القادم.
        </div>
      </div>
    </>
  );
};

/* ------------------------------ Financial Tab ----------------------------- */

const FinancialTab = ({ stats }: { stats: ReturnType<typeof useAdminStats> }) => {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: pays }, { data: wal }] = await Promise.all([
        (supabase as any)
          .from("payment_transactions")
          .select("amount_piastres, status")
          .eq("status", "success"),
        (supabase as any).from("wallets").select("balance_piastres"),
      ]);
      if (cancelled) return;
      const rev = ((pays ?? []) as { amount_piastres: number }[]).reduce(
        (s, r) => s + (r.amount_piastres || 0),
        0,
      );
      const bal = ((wal ?? []) as { balance_piastres: number }[]).reduce(
        (s, w) => s + (w.balance_piastres || 0),
        0,
      );
      setTotalRevenue(rev);
      setTotalBalance(bal);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FinancialPreviewCard
          label="إجمالي الإيرادات"
          value={totalRevenue}
          icon={DollarSign}
          tone="emerald"
        />
        <FinancialPreviewCard
          label="إجمالي أرصدة الطلاب"
          value={totalBalance}
          icon={Wallet}
          tone="primary"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Link
          to="/admin/billing"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-5 md:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base md:text-lg">عرض صفحة الفوترة الكاملة</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                كل المعاملات، الفلاتر، الرسوم البيانية والفواتير القابلة للطباعة
              </div>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform shrink-0" />
        </Link>
      </motion.div>

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
                          <div className="font-semibold text-foreground line-clamp-1">{c.title}</div>
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
                      <div className="text-[11px] text-muted-foreground mt-0.5">{c.stage_name}</div>
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
    </>
  );
};

const FinancialPreviewCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "emerald";
}) => {
  const toneCls =
    tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "bg-primary/10 text-primary";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${toneCls}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground font-semibold mb-1">{label}</div>
        {value === null ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          <div className="text-2xl md:text-3xl font-black tabular-nums">
            {formatPiastres(value)}
          </div>
        )}
      </div>
    </motion.div>
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
