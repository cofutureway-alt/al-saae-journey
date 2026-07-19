import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Focus,
  GraduationCap,
  IdCard,
  ListChecks,
  Loader2,
  Phone,
  QrCode,
  Search,
  ShieldAlert,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classifyGroups, LEVEL_META, type GroupClassification } from "@/lib/weak-analysis";

interface EnrolledCourseRow {
  course_id: string;
  course_title: string | null;
  stage_name: string | null;
  subject_name: string | null;
  enrolled_at: string | null;
}

interface QuizAttemptRow {
  attempt_id: string;
  quiz_title: string | null;
  course_title: string | null;
  subject_name: string | null;
  stage_name: string | null;
  attempt_number: number | null;
  status: string | null;
  percentage: number | null;
  passed: boolean | null;
  submitted_at: string | null;
}

interface Snapshot {
  found: true;
  full_name?: string | null;
  avatar_url?: string | null;
  student_id?: string | null;
  stage_name?: string | null;
  phone_number?: string | null;
  enrolled_courses_count?: number;
  enrolled_courses?: EnrolledCourseRow[];
  quiz_attempts?: QuizAttemptRow[];
  quiz_stats?: {
    total_attempts: number;
    unique_quizzes: number;
    passed: number;
    failed: number;
    graded_total: number;
  };
  weak_data?: {
    quizzes: any[];
    attempts: any[];
  };
  weak_flags?: {
    subjects: boolean;
    courses: boolean;
  };
}

export default function PublicStudentSnapshot() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!qrToken) {
        setStatus("notfound");
        return;
      }
      const { data, error } = await (supabase as any).rpc("get_student_qr_snapshot", {
        _token: qrToken,
      });
      if (!alive) return;
      if (error) {
        setStatus("error");
        return;
      }
      if (!data) {
        setStatus("notfound");
        return;
      }
      setSnap(data as Snapshot);
      setStatus("ok");
    })();
    return () => {
      alive = false;
    };
  }, [qrToken]);

  const weakSubjects: GroupClassification[] = useMemo(() => {
    if (!snap?.weak_data || !snap?.weak_flags?.subjects) return [];
    return classifyGroups(
      snap.weak_data.quizzes as any,
      snap.weak_data.attempts as any,
      "subject_id",
      (_k, q) => (q as any).subject_name ?? "بدون مادة",
    );
  }, [snap]);

  const weakCourses: GroupClassification[] = useMemo(() => {
    if (!snap?.weak_data || !snap?.weak_flags?.courses) return [];
    return classifyGroups(
      snap.weak_data.quizzes as any,
      snap.weak_data.attempts as any,
      "course_id",
      (_k, q) => (q as any).course_title ?? "بدون كورس",
    );
  }, [snap]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "notfound" || status === "error" || !snap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center space-y-4"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black">الرمز غير صحيح أو منتهي الصلاحية</h1>
            <p className="text-sm text-muted-foreground mt-2">
              قد يكون الرمز قد تم إبطاله من قِبَل الإدارة. اطلب من الطالب رمزًا محدّثًا.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const initials =
    snap.full_name?.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() ||
    "ط";

  const qs = snap.quiz_stats;
  const passRate =
    qs && qs.graded_total > 0 ? Math.round((qs.passed / qs.graded_total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header ribbon */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent border-b border-border">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-2 text-xs text-muted-foreground relative">
          <QrCode className="w-4 h-4 text-primary" />
          صفحة إحصائيات الطالب — عرض للقراءة فقط
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12 -mt-2 space-y-5">
        {/* Identity card */}
        <motion.section
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            {snap.avatar_url !== undefined && (
              <Avatar className="w-24 h-24 border-4 border-primary/20 shrink-0">
                <AvatarImage src={snap.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0 space-y-2">
              {snap.full_name !== undefined && (
                <h1 className="text-2xl md:text-3xl font-black leading-tight">
                  {snap.full_name || "بدون اسم"}
                </h1>
              )}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {snap.student_id !== undefined && (
                  <Badge variant="secondary" className="gap-1.5">
                    <IdCard className="w-3.5 h-3.5" />
                    <span className="font-mono">{snap.student_id ?? "—"}</span>
                  </Badge>
                )}
                {snap.stage_name !== undefined && snap.stage_name && (
                  <Badge variant="outline" className="gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {snap.stage_name}
                  </Badge>
                )}
                {snap.phone_number !== undefined && snap.phone_number && (
                  <Badge variant="outline" className="gap-1.5" dir="ltr">
                    <Phone className="w-3.5 h-3.5" />
                    {snap.phone_number}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Enrollment count */}
        {snap.enrolled_courses_count !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-primary">
                {snap.enrolled_courses_count}
              </div>
              <div className="text-xs text-muted-foreground">دورة مسجّل بها</div>
            </div>
          </motion.div>
        )}

        {/* Quiz stats */}
        {qs && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <ClipboardList className="w-4 h-4" />
              إحصائيات الاختبارات
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile icon={ClipboardList} label="إجمالي المحاولات" value={qs.total_attempts} tone="neutral" />
              <StatTile icon={Trophy} label="ناجحة" value={qs.passed} tone="success" />
              <StatTile icon={XCircle} label="راسبة" value={qs.failed} tone="danger" />
              <StatTile icon={User} label="نسبة النجاح" value={`${passRate}%`} tone="primary" />
            </div>
          </motion.section>
        )}

        {/* Weak areas */}
        {(snap.weak_flags?.subjects || snap.weak_flags?.courses) && (
          <div className="grid md:grid-cols-2 gap-4">
            {snap.weak_flags?.subjects && (
              <WeakBlock
                title="نقاط الضعف بالمواد"
                icon={AlertTriangle}
                iconClass="text-red-500"
                items={weakSubjects}
              />
            )}
            {snap.weak_flags?.courses && (
              <WeakBlock
                title="نقاط الضعف بالكورسات"
                icon={Focus}
                iconClass="text-amber-500"
                items={weakCourses}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const StatTile = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "neutral" | "success" | "danger" | "primary";
}) => {
  const map: Record<string, string> = {
    neutral: "bg-muted/40 text-foreground",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    primary: "bg-primary/10 text-primary",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`rounded-2xl border border-border p-4 ${map[tone]}`}
    >
      <Icon className="w-4 h-4 mb-1.5 opacity-80" />
      <div className="text-2xl font-black tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  );
};

const WeakBlock = ({
  title,
  icon: Icon,
  iconClass,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  items: GroupClassification[];
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card p-5"
  >
    <h3 className="font-black mb-3 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      {title}
    </h3>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground">لا توجد بيانات كافية بعد.</p>
    ) : (
      <div className="space-y-2">
        {items.map((g) => (
          <div
            key={g.key}
            className="flex items-center justify-between rounded-xl bg-muted/40 p-3"
          >
            <div className="min-w-0">
              <div className="font-semibold truncate">{g.label}</div>
              <div className="text-xs text-muted-foreground">
                نجح {g.passed_count} من {g.certified_count}
              </div>
            </div>
            <Badge variant="outline" className={LEVEL_META[g.level].className}>
              {LEVEL_META[g.level].label}
            </Badge>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);
