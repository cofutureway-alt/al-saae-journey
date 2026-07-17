import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  File as FileIcon,
  FileImage,
  FileText,
  Layers,
  ListChecks,
  Loader2,
  Lock,
  Menu,
  PlayCircle,
  Presentation,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoProvider } from "@/lib/video";
import LessonVideoPlayer from "@/components/lesson/LessonVideoPlayer";
import CircularProgress from "@/components/lesson/CircularProgress";
import { usePlayerSettings } from "@/hooks/use-player-settings";
import FileViewer, { type ViewerFile } from "@/components/lesson/FileViewer";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  unit_id: string;
  position: number;
  video_provider: VideoProvider | null;
  video_url: string | null;
}

interface CurriculumLesson {
  id: string;
  title: string;
  position: number;
  unit_id: string;
}

interface CurriculumUnit {
  id: string;
  title: string;
  position: number;
  lessons: CurriculumLesson[];
}

interface CourseLite {
  id: string;
  title: string;
}

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [course, setCourse] = useState<CourseLite | null>(null);
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [files, setFiles] = useState<ViewerFile[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewerFile, setViewerFile] = useState<ViewerFile | null>(null);
  const [watchPct, setWatchPct] = useState(0);
  const { settings: playerSettings } = usePlayerSettings();

  const load = useCallback(async () => {
    if (!courseId || !lessonId) return;
    setLoading(true);

    // Course + enrollment check
    const { data: cData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", courseId)
      .maybeSingle();

    if (!cData) {
      setCourse(null);
      setLoading(false);
      return;
    }
    setCourse(cData as CourseLite);

    let isEnrolled = false;
    if (user) {
      const { data: e } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();
      isEnrolled = !!e;
    }
    setEnrolled(isEnrolled);

    if (!isEnrolled && !isAdmin) {
      toast.error("يجب التسجيل في الدورة أولًا");
      navigate(`/courses/${courseId}`, { replace: true });
      return;
    }

    // Curriculum (enrolled/admin can read full lessons)
    const { data: unitsData } = await supabase
      .from("units")
      .select("id, title, position")
      .eq("course_id", courseId)
      .order("position");
    const uList = (unitsData ?? []) as { id: string; title: string; position: number }[];
    const unitIds = uList.map((u) => u.id);

    let lessons: CurriculumLesson[] = [];
    if (unitIds.length) {
      const { data: lData } = await supabase
        .from("lessons")
        .select("id, unit_id, title, position")
        .in("unit_id", unitIds)
        .order("position");
      lessons = (lData as CurriculumLesson[]) ?? [];
    }

    setUnits(
      uList.map((u) => ({
        ...u,
        lessons: lessons.filter((l) => l.unit_id === u.id),
      })),
    );

    // Current lesson (full row, includes video_url)
    const { data: lRow } = await supabase
      .from("lessons")
      .select("id, unit_id, title, description, position, video_provider, video_url")
      .eq("id", lessonId)
      .maybeSingle();
    setLesson((lRow as Lesson) ?? null);

    // Files
    const { data: fData } = await (supabase as any)
      .from("lesson_files")
      .select("id, file_name, file_type, file_url, allow_download, download_limit")
      .eq("lesson_id", lessonId)
      .order("created_at");
    setFiles((fData ?? []) as ViewerFile[]);

    // Progress
    if (user) {
      const { data: pData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("course_id", courseId)
        .eq("user_id", user.id);
      setCompletedIds(new Set((pData ?? []).map((p: any) => p.lesson_id)));
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, user?.id, isAdmin, navigate]);

  useEffect(() => {
    if (!authLoading) load();
  }, [load, authLoading]);

  const orderedLessons: CurriculumLesson[] = useMemo(
    () => units.flatMap((u) => u.lessons),
    [units],
  );
  const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;
  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : undefined;

  const totalLessons = orderedLessons.length;
  const completedCount = completedIds.size;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = lesson ? completedIds.has(lesson.id) : false;

  const gateActive = playerSettings.completion_gate_enabled && !isAdmin;
  const requiredPct = playerSettings.completion_required_percentage;
  const completeLocked = gateActive && !isCompleted && watchPct < requiredPct;

  const toggleComplete = async () => {
    if (!user || !lesson || !courseId) return;
    if (isCompleted) {
      // Students cannot un-complete a lesson from the lesson page.
      // (Admin-side unmarking will be introduced in a future phase.)
      return;
    }
    if (completeLocked) {
      toast.error(`يجب مشاهدة ${requiredPct}% من الفيديو قبل إتمام الدرس (شاهدت ${watchPct}%)`);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("lesson_progress")
        .insert({ user_id: user.id, lesson_id: lesson.id, course_id: courseId });
      if (error && (error as any).code !== "23505") throw error;
      setCompletedIds((s) => new Set(s).add(lesson.id));
      toast.success("أحسنت! تم إنجاز الدرس");
    } catch (e: any) {
      toast.error(e?.message || "تعذّر حفظ التقدّم");
    } finally {
      setSaving(false);
    }
  };

  const openViewer = (row: ViewerFile) => {
    setViewerFile(row);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <h1 className="text-xl font-bold mb-2">الدرس غير متاح</h1>
          <p className="text-muted-foreground mb-6">
            الدرس أو الدورة غير موجودة أو ليس لديك صلاحية.
          </p>
          <Button asChild>
            <Link to="/courses">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة إلى الدورات
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/85 backdrop-blur-md flex items-center gap-3 px-3 md:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="gap-1"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="hidden sm:inline">للدورة</span>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground truncate">{course.title}</div>
          <div className="text-sm font-bold truncate">{lesson.title}</div>
        </div>
        <div className="hidden md:flex items-center gap-3 min-w-[200px]">
          <Progress value={percent} className="h-1.5 flex-1" />
          <span className="text-xs font-bold tabular-nums">{percent}%</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Main content */}
        <main className="p-3 md:p-6 space-y-5 min-w-0">
          <LessonVideoPlayer
            lessonId={lesson.id}
            courseId={courseId!}
            title={lesson.title}
            provider={lesson.video_provider}
            videoUrl={lesson.video_url}
            settings={isAdmin ? { ...playerSettings, completion_gate_enabled: false } : playerSettings}
            onProgress={setWatchPct}
            paused={!!viewerFile}
          />

          {percent === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 md:p-6 flex items-center gap-4"
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shrink-0"
              >
                <Sparkles className="w-7 h-7" />
              </motion.div>
              <div>
                <div className="font-bold text-lg">مبارك! أكملت الدورة بالكامل</div>
                <div className="text-sm text-muted-foreground">
                  أتممت جميع الدروس. يمكنك مراجعة أي درس متى شئت.
                </div>
              </div>
            </motion.div>
          )}

          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex items-center gap-3">
                <CircularProgress value={watchPct} size={52} label="نسبة المشاهدة" />
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold">{lesson.title}</h1>
                  <div className="text-xs text-muted-foreground mt-1">
                    الدرس {currentIndex + 1} من {totalLessons}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.div whileTap={{ scale: 0.96 }}>
                  <Button
                    onClick={toggleComplete}
                    disabled={saving || isCompleted}
                    variant={isCompleted ? "outline" : "default"}
                    title={
                      isCompleted
                        ? "تم إنجاز الدرس — لا يمكن التراجع عن الإنجاز"
                        : completeLocked
                          ? `مطلوب مشاهدة ${requiredPct}% (شاهدت ${watchPct}%)`
                          : undefined
                    }
                    className={`gap-2 font-bold ${
                      isCompleted
                        ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                        : completeLocked
                          ? "opacity-60"
                          : ""
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : completeLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <ListChecks className="w-4 h-4" />
                    )}
                    {isCompleted
                      ? "تم الإنجاز"
                      : completeLocked
                        ? `${watchPct}% / ${requiredPct}%`
                        : "إنجاز الدرس"}
                  </Button>
                </motion.div>
                {nextLesson && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      navigate(`/courses/${courseId}/learn/${nextLesson.id}`)
                    }
                    className="gap-1 font-bold"
                  >
                    الدرس التالي
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="files" className="w-full">
              <TabsList className="grid grid-cols-2 max-w-sm">
                <TabsTrigger value="files" className="gap-2">
                  <FileText className="w-4 h-4" />
                  الملفات ({files.length})
                </TabsTrigger>
                <TabsTrigger value="description" className="gap-2">
                  <Layers className="w-4 h-4" />
                  الوصف
                </TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="pt-4">
                {files.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto opacity-40 mb-2" />
                    لا توجد ملفات لهذا الدرس.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {files.map((f, i) => (
                        <motion.button
                          key={f.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => openViewer(f)}
                          whileHover={{ y: -2 }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all text-right"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FileTypeIcon type={f.file_type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">
                              {f.file_name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{f.file_type?.split("/")[1]?.toUpperCase() || "ملف"}</span>
                              {!f.allow_download && (
                                <>
                                  <span className="opacity-40">·</span>
                                  <span className="inline-flex items-center gap-1 text-destructive">
                                    <Lock className="w-3 h-3" />
                                    عرض فقط
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
                            <Eye className="w-4 h-4" />
                            عرض
                          </div>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="description" className="pt-4">
                {lesson.description ? (
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                    {lesson.description}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
                    لا يوجد وصف لهذا الدرس.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              disabled={!prevLesson}
              onClick={() =>
                prevLesson &&
                navigate(`/courses/${courseId}/learn/${prevLesson.id}`)
              }
              className="gap-1"
            >
              <ArrowRight className="w-4 h-4" />
              الدرس السابق
            </Button>
            <Button
              variant="ghost"
              disabled={!nextLesson}
              onClick={() =>
                nextLesson &&
                navigate(`/courses/${courseId}/learn/${nextLesson.id}`)
              }
              className="gap-1"
            >
              الدرس التالي
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </main>

        {/* Desktop curriculum */}
        <aside className="hidden lg:block border-r border-border bg-card/40">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <CurriculumPanel
              course={course}
              units={units}
              currentLessonId={lesson.id}
              completedIds={completedIds}
              percent={percent}
              completedCount={completedCount}
              totalLessons={totalLessons}
              courseId={courseId!}
            />
          </div>
        </aside>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-card border-l border-border shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-card">
                <div className="font-bold">المنهج</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CurriculumPanel
                course={course}
                units={units}
                currentLessonId={lesson.id}
                completedIds={completedIds}
                percent={percent}
                completedCount={completedCount}
                totalLessons={totalLessons}
                courseId={courseId!}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


// ---------- Curriculum panel ----------
const CurriculumPanel = ({
  course,
  units,
  currentLessonId,
  completedIds,
  percent,
  completedCount,
  totalLessons,
  courseId,
  onNavigate,
}: {
  course: CourseLite;
  units: CurriculumUnit[];
  currentLessonId: string;
  completedIds: Set<string>;
  percent: number;
  completedCount: number;
  totalLessons: number;
  courseId: string;
  onNavigate?: () => void;
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="text-xs text-muted-foreground mb-1">الدورة</div>
        <div className="font-bold text-sm mb-3 line-clamp-2">{course.title}</div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">التقدّم</span>
          <span className="font-bold tabular-nums">
            {completedCount}/{totalLessons} · {percent}%
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      <div className="space-y-3">
        {units.map((u, ui) => (
          <div key={u.id} className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span className="w-6 h-6 rounded bg-primary/10 text-primary inline-flex items-center justify-center text-[10px]">
                {ui + 1}
              </span>
              <span className="truncate">{u.title}</span>
            </div>
            {u.lessons.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground">
                لا توجد دروس
              </div>
            ) : (
              u.lessons.map((l) => {
                const isCurrent = l.id === currentLessonId;
                const isDone = completedIds.has(l.id);
                return (
                  <Link
                    key={l.id}
                    to={`/courses/${courseId}/learn/${l.id}`}
                    onClick={onNavigate}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-accent text-foreground/80"
                    }`}
                  >
                    {isCurrent && (
                      <motion.span
                        layoutId="lesson-active-indicator"
                        className="absolute inset-y-1 right-0 w-1 rounded-full bg-primary"
                      />
                    )}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <PlayCircle className="w-4 h-4" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                    <span className="flex-1 min-w-0 truncate font-medium">
                      {l.title}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Helpers ----------
const FileTypeIcon = ({ type }: { type: string | null }) => {
  const t = (type || "").toLowerCase();
  if (t.startsWith("image/")) return <FileImage className="w-4 h-4" />;
  if (t.startsWith("video/")) return <FileVideo className="w-4 h-4" />;
  if (t.startsWith("audio/")) return <FileAudio className="w-4 h-4" />;
  if (t.includes("zip") || t.includes("rar") || t.includes("7z"))
    return <FileArchive className="w-4 h-4" />;
  if (t.includes("pdf") || t.includes("text") || t.includes("word"))
    return <FileText className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
};

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

export default LessonPage;
