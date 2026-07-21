import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
  Layers,
  FileText,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSignedThumbnail } from "@/hooks/use-signed-thumbnail";

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: "draft" | "published";
  stage_id: string | null;
  created_at: string;
  stage_name: string | null;
  units_count: number;
  lessons_count: number;
  quizzes_count: number;
  assignments_count: number;
  questions_count: number;
}

interface StageOpt {
  id: string;
  name: string;
}

const CourseThumb = ({ path }: { path: string | null }) => {
  const url = useSignedThumbnail(path);
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-primary/10 via-accent/40 to-primary/5 overflow-hidden">
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <BookOpen className="w-10 h-10 opacity-40" />
        </div>
      )}
    </div>
  );
};

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRow[] | null>(null);
  const [stages, setStages] = useState<StageOpt[]>([]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<CourseRow | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    const [{ data: cRows, error }, { data: sRows }] = await Promise.all([
      supabase
        .from("courses")
        .select(
          "id, title, description, thumbnail_url, status, stage_id, created_at, stages(name), units(id, lessons(id))",
        )
        .order("created_at", { ascending: false }),
      supabase.from("stages").select("id, name").order("name"),
    ]);

    if (error) {
      toast.error("تعذّر تحميل الدورات");
      setCourses([]);
      return;
    }
    setStages((sRows as StageOpt[]) ?? []);

    const courseIds = (cRows ?? []).map((c: any) => c.id);
    const quizzesByCourse: Record<string, number> = {};
    const questionsByCourse: Record<string, number> = {};
    if (courseIds.length) {
      const { data: quizzes } = await (supabase as any)
        .from("quizzes")
        .select("id, course_id")
        .in("course_id", courseIds);
      const quizToCourse: Record<string, string> = {};
      (quizzes ?? []).forEach((q: any) => {
        quizToCourse[q.id] = q.course_id;
        quizzesByCourse[q.course_id] = (quizzesByCourse[q.course_id] ?? 0) + 1;
      });
      const quizIds = Object.keys(quizToCourse);
      if (quizIds.length) {
        const { data: questions } = await (supabase as any)
          .from("quiz_questions")
          .select("quiz_id")
          .in("quiz_id", quizIds);
        (questions ?? []).forEach((qq: any) => {
          const cId = quizToCourse[qq.quiz_id];
          if (cId) questionsByCourse[cId] = (questionsByCourse[cId] ?? 0) + 1;
        });
      }
    }

    setCourses(
      (cRows ?? []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        thumbnail_url: c.thumbnail_url,
        status: c.status,
        stage_id: c.stage_id,
        created_at: c.created_at,
        stage_name: c.stages?.name ?? null,
        units_count: c.units?.length ?? 0,
        lessons_count:
          c.units?.reduce(
            (acc: number, u: any) => acc + (u.lessons?.length ?? 0),
            0,
          ) ?? 0,
        quizzes_count: quizzesByCourse[c.id] ?? 0,
        questions_count: questionsByCourse[c.id] ?? 0,
      })),
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!courses) return null;
    return courses.filter((c) => {
      if (query && !c.title.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (stageFilter !== "all" && c.stage_id !== stageFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    });
  }, [courses, query, stageFilter, statusFilter]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    try {
      if (deleting.thumbnail_url) {
        await supabase.storage.from("thumbnails").remove([deleting.thumbnail_url]);
      }
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", deleting.id);
      if (error) throw error;
      toast.success("تم حذف الدورة");
      setDeleting(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "تعذّر حذف الدورة");
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">الدورات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الدورات وبناء المحتوى التعليمي.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/courses/new")}
          size="lg"
          className="shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 ml-2" />
          دورة جديدة
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
      >
        <div className="relative md:col-span-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن دورة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger>
            <SelectValue placeholder="كل المراحل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المراحل</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="published">منشورة</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {courses === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, type: "spring", damping: 22 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all"
              >
                <CourseThumb path={c.thumbnail_url} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={c.status === "published" ? "default" : "secondary"}
                      className={
                        c.status === "published"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }
                    >
                      {c.status === "published" ? "منشورة" : "مسودة"}
                    </Badge>
                    {c.stage_name && (
                      <span className="text-xs text-muted-foreground">
                        {c.stage_name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {c.description || "بدون وصف"}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {c.units_count} وحدات
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {c.lessons_count} دروس
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {c.quizzes_count} اختبار
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {c.questions_count} سؤال
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/60">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link to={`/admin/courses/${c.id}/builder`}>
                        <Pencil className="w-4 h-4 ml-2" />
                        تعديل
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(c)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-dashed border-border/70 bg-card/40 p-12 md:p-20 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
            <Sparkles className="w-3 h-3" />
            ابدأ رحلتك التعليمية
          </div>
          <h2 className="text-2xl font-bold mb-2">لا توجد دورات بعد</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            أنشئ أول دورة، ثم أضف الوحدات والدروس والملفات لبناء منهج كامل.
          </p>
          <Button size="lg" onClick={() => navigate("/admin/courses/new")}>
            <Plus className="w-4 h-4 ml-2" />
            إنشاء دورة جديدة
          </Button>
        </motion.div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          لا توجد نتائج مطابقة.
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              حذف الدورة
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف "{deleting?.title}" وجميع وحداتها ودروسها وملفاتها نهائيًا.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCourses;
