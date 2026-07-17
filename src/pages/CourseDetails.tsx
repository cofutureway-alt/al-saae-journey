import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Layers,
  Lock,
  PlayCircle,
  ChevronDown,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSignedThumbnail } from "@/hooks/use-signed-thumbnail";
import { useCourseProgress } from "@/hooks/use-my-progress";
import { EightPointStar } from "@/components/IslamicPatterns";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stage_id: string | null;
  stage_name: string | null;
  status: "draft" | "published";
}

interface LessonLite {
  id: string;
  unit_id: string;
  title: string;
  position: number;
}

interface UnitWithLessons {
  id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: LessonLite[];
}

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    // Fetch course (RLS: published visible to all, admin sees all)
    const { data: cData, error: cErr } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, stage_id, status, stages(name)")
      .eq("id", id)
      .maybeSingle();

    if (cErr || !cData) {
      setCourse(null);
      setLoading(false);
      return;
    }
    setCourse({
      id: cData.id,
      title: cData.title,
      description: cData.description,
      thumbnail_url: cData.thumbnail_url,
      stage_id: cData.stage_id,
      stage_name: (cData as any).stages?.name ?? null,
      status: cData.status,
    });

    // Units
    const { data: uData } = await supabase
      .from("units")
      .select("id, title, description, position")
      .eq("course_id", id)
      .order("position");

    const unitList = (uData ?? []) as UnitWithLessons[];
    const unitIds = unitList.map((u) => u.id);

    let lessons: LessonLite[] = [];
    if (unitIds.length) {
      // Admins can read the full lessons table; everyone else uses the public view
      if (isAdmin) {
        const { data } = await supabase
          .from("lessons")
          .select("id, unit_id, title, position")
          .in("unit_id", unitIds)
          .order("position");
        lessons = (data as LessonLite[]) ?? [];
      } else {
        const { data } = await supabase
          .from("lessons_public")
          .select("id, unit_id, title, position")
          .in("unit_id", unitIds)
          .order("position");
        lessons = (data as LessonLite[]) ?? [];
      }
    }

    setUnits(
      unitList.map((u) => ({
        ...u,
        lessons: lessons.filter((l) => l.unit_id === u.id),
      })),
    );

    // Enrollment status
    if (user) {
      const { data: e } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setEnrolled(!!e);
    } else {
      setEnrolled(false);
    }

    setLoading(false);
  }, [id, user, isAdmin]);

  useEffect(() => {
    if (!authLoading) load();
  }, [load, authLoading]);

  const totalLessons = units.reduce((acc, u) => acc + u.lessons.length, 0);
  const unlocked = enrolled || isAdmin;
  const { data: progressData } = useCourseProgress(enrolled ? id : undefined);
  const progress = enrolled ? (progressData?.percent ?? 0) : null;
  const completedIds = progressData?.completedLessonIds ?? new Set<string>();

  const handleEnroll = async () => {
    if (!id) return;
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }
    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: id });
      if (error) {
        // 23505 unique violation → already enrolled
        if ((error as any).code === "23505") {
          setEnrolled(true);
          toast.success("أنت مسجّل بالفعل في هذه الدورة");
          return;
        }
        throw error;
      }
      setEnrolled(true);
      toast.success("تم التسجيل في الدورة بنجاح");
    } catch (e: any) {
      toast.error(e?.message || "تعذّر التسجيل، حاول مجددًا");
    } finally {
      setEnrolling(false);
    }
  };

  const startCourse = () => {
    const all = units.flatMap((u) => u.lessons);
    if (!all.length) {
      toast.info("لم يتم إضافة دروس بعد");
      return;
    }
    const next = all.find((l) => !completedIds.has(l.id)) ?? all[0];
    navigate(`/courses/${id}/learn/${next.id}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-16 container mx-auto px-4 space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-16 container mx-auto px-4">
          <div className="max-w-lg mx-auto rounded-2xl border-2 border-dashed border-border p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">الدورة غير متوفرة</h1>
            <p className="text-muted-foreground mb-6">
              لم يتم العثور على هذه الدورة أو أنها لم تُنشر بعد.
            </p>
            <Button asChild>
              <Link to="/courses">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة إلى الدورات
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <CourseHero
          course={course}
          unitsCount={units.length}
          lessonsCount={totalLessons}
        />

        <div className="container mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Curriculum */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">المنهج الدراسي</h2>
              <div className="text-sm text-muted-foreground">
                {units.length} وحدات · {totalLessons} دروس
              </div>
            </div>

            {units.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
                لم يتم إضافة محتوى بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {units.map((u, i) => (
                  <UnitAccordion
                    key={u.id}
                    unit={u}
                    index={i}
                    open={!!openUnits[u.id]}
                    onToggle={() =>
                      setOpenUnits((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                    }
                    unlocked={unlocked}
                    courseId={course.id}
                    completedIds={completedIds}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar CTA */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <EnrollCard
              enrolled={enrolled}
              isAdmin={isAdmin}
              enrolling={enrolling}
              onEnroll={handleEnroll}
              onStart={startCourse}
              progress={progress}
            />

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>وصول مدى الحياة بعد التسجيل</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{totalLessons} درس تعليمي</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-primary" />
                <span>{units.length} وحدة تعليمية</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ---------------- Hero ----------------
const CourseHero = ({
  course,
  unitsCount,
  lessonsCount,
}: {
  course: Course;
  unitsCount: number;
  lessonsCount: number;
}) => {
  const thumb = useSignedThumbnail(course.thumbnail_url);
  return (
    <section className="relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="relative aspect-[21/9] md:aspect-[3/1] bg-accent">
            {thumb ? (
              <img
                src={thumb}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <BookOpen className="w-16 h-16 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-background/40" />
            <EightPointStar
              size={90}
              className="absolute top-6 left-6 text-primary-foreground/40 opacity-60"
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {course.stage_name && (
                <Badge className="bg-primary text-primary-foreground border-0">
                  {course.stage_name}
                </Badge>
              )}
              {course.status === "draft" && (
                <Badge variant="secondary">مسودة (معاينة إدارية)</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-5 mt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                {unitsCount} وحدات
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {lessonsCount} دروس
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ---------------- Enroll card ----------------
const EnrollCard = ({
  enrolled,
  isAdmin,
  enrolling,
  onEnroll,
  onStart,
  progress,
}: {
  enrolled: boolean;
  isAdmin: boolean;
  enrolling: boolean;
  onEnroll: () => void;
  onStart: () => void;
  progress: number | null;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">مجانًا</span>
          <span className="text-xs text-muted-foreground">
            (قد تُضاف باقات مدفوعة لاحقًا)
          </span>
        </div>

        {isAdmin ? (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-primary mt-0.5" />
            <span>لديك صلاحية إدارية — كامل الوصول للدورة.</span>
          </div>
        ) : enrolled ? (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <span>أنت مسجّل في هذه الدورة.</span>
          </div>
        ) : (
          <div className="rounded-lg bg-accent p-3 text-sm flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5" />
            <span>سجّل مجانًا لفتح كامل الدروس والملفات.</span>
          </div>
        )}

        {enrolled && typeof progress === "number" && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>تقدّمك</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {isAdmin || enrolled ? (
          <Button
            onClick={onStart}
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20"
          >
            <PlayCircle className="w-5 h-5 ml-2" />
            {isAdmin && !enrolled
              ? "بدء المعاينة"
              : progress && progress > 0
                ? "متابعة التعلّم"
                : "بدء الدورة"}
          </Button>
        ) : (
          <Button
            onClick={onEnroll}
            disabled={enrolling}
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20"
          >
            {enrolling && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            سجّل مجانًا
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// ---------------- Unit accordion ----------------
const UnitAccordion = ({
  unit,
  index,
  open,
  onToggle,
  unlocked,
  courseId,
  completedIds,
}: {
  unit: UnitWithLessons;
  index: number;
  open: boolean;
  onToggle: () => void;
  unlocked: boolean;
  courseId: string;
  completedIds: Set<string>;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-right hover:bg-accent/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground">{unit.title}</div>
          <div className="text-xs text-muted-foreground">
            {unit.lessons.length} دروس
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 space-y-1.5 border-t border-border pt-3">
              {unit.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">
                  لا توجد دروس في هذه الوحدة بعد.
                </p>
              ) : (
                unit.lessons.map((l, i) => (
                  <LessonRow
                    key={l.id}
                    lesson={l}
                    index={i}
                    unlocked={unlocked}
                    courseId={courseId}
                    completed={completedIds.has(l.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LessonRow = ({
  lesson,
  index,
  unlocked,
  courseId,
  completed,
}: {
  lesson: LessonLite;
  index: number;
  unlocked: boolean;
  courseId: string;
  completed?: boolean;
}) => {
  const content = (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg transition-colors ${
        unlocked
          ? "hover:bg-accent cursor-pointer"
          : "opacity-70 cursor-not-allowed"
      }`}
    >
      <span className="w-7 text-center text-xs font-semibold text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
          completed
            ? "bg-emerald-500 text-white"
            : "bg-primary/10 text-primary"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : unlocked ? (
          <PlayCircle className="w-4 h-4" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-sm font-medium truncate">
        {lesson.title}
      </div>
      {!unlocked && (
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          مقفول
        </span>
      )}
    </div>
  );

  if (!unlocked) return content;
  return (
    <Link to={`/courses/${courseId}/learn/${lesson.id}`} className="block">
      {content}
    </Link>
  );
};

export default CourseDetails;
