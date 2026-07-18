import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Plus,
  GripVertical,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  Layers,
  PlayCircle,
  Info,
  Settings,
  ClipboardList,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import LessonModal, { type LessonRecord } from "@/components/admin/LessonModal";
import QuizWizard, { type QuizRecord } from "@/components/admin/QuizWizard";

// ---------- Types ----------
interface Course {
  id: string;
  title: string;
  status: "draft" | "published";
}

type ContentItem =
  | { kind: "lesson"; id: string; order: number; lesson: LessonRecord }
  | { kind: "quiz"; id: string; order: number; quiz: QuizRecord };

interface Unit {
  id: string;
  title: string;
  description: string | null;
  position: number;
  content: ContentItem[];
}

// ---------- Autosave indicator ----------
type SaveState = "idle" | "saving" | "saved";

// ---------- Unit modal ----------
const unitSchema = z.object({
  title: z.string().trim().min(2, "الاسم قصير جدًا").max(120),
  description: z.string().trim().max(500).optional(),
});
type UnitFormValues = z.infer<typeof unitSchema>;

const UnitModal = ({
  open,
  onOpenChange,
  unit,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unit: Unit | null;
  onSubmit: (values: UnitFormValues) => Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({ resolver: zodResolver(unitSchema) });

  useEffect(() => {
    if (open) reset({ title: unit?.title ?? "", description: unit?.description ?? "" });
  }, [open, unit, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{unit ? "تعديل الوحدة" : "وحدة جديدة"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            await onSubmit(v);
            onOpenChange(false);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>اسم الوحدة</Label>
            <Input placeholder="مثال: الوحدة الأولى" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea rows={3} {...register("description")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حفظ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Sortable lesson row ----------
const LessonItem = ({
  lesson,
  onEdit,
  onDelete,
  isOverlay,
}: {
  lesson: LessonRecord;
  onEdit: () => void;
  onDelete: () => void;
  isOverlay?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `lesson:${lesson.id}`, data: { type: "lesson", lesson } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background hover:border-primary/40 hover:bg-accent/40 transition-colors ${
        isOverlay ? "shadow-2xl border-primary/60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
        aria-label="اسحب لإعادة الترتيب"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <PlayCircle className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{lesson.title}</div>
      </div>
      {!isOverlay && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// ---------- Sortable unit card ----------
const UnitCard = ({
  unit,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: {
  unit: Unit;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (l: LessonRecord) => void;
  onDeleteLesson: (l: LessonRecord) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `unit:${unit.id}`, data: { type: "unit" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 p-4">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
          aria-label="اسحب لإعادة ترتيب الوحدة"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-right min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground truncate">{unit.title}</div>
            <div className="text-xs text-muted-foreground">
              {unit.lessons.length} دروس
            </div>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 ml-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-border/60 pt-3">
              <SortableContext
                items={unit.lessons.map((l) => `lesson:${l.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[8px]">
                  {unit.lessons.map((l) => (
                    <LessonItem
                      key={l.id}
                      lesson={l}
                      onEdit={() => onEditLesson(l)}
                      onDelete={() => onDeleteLesson(l)}
                    />
                  ))}
                  {unit.lessons.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-lg">
                      اسحب درسًا هنا أو أضف درسًا جديدًا
                    </div>
                  )}
                </div>
              </SortableContext>
              <Button variant="outline" size="sm" onClick={onAddLesson} className="w-full mt-2">
                <Plus className="w-4 h-4 ml-2" />
                إضافة درس
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Main ----------
const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonUnitId, setLessonUnitId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonRecord | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonRecord | null>(null);

  const [publishOpen, setPublishOpen] = useState(false);

  const [activeDrag, setActiveDrag] = useState<
    | { type: "unit"; unit: Unit }
    | { type: "lesson"; lesson: LessonRecord }
    | null
  >(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const markSaving = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setSaveState("saving");
    try {
      const r = await fn();
      setSaveState("saved");
      window.setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      return r;
    } catch (e: any) {
      setSaveState("idle");
      toast.error(e?.message || "فشل الحفظ");
      throw e;
    }
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    const { data: c, error: cErr } = await supabase
      .from("courses")
      .select("id, title, status")
      .eq("id", id)
      .maybeSingle();
    if (cErr || !c) {
      toast.error("لم يتم العثور على الدورة");
      navigate("/admin/courses");
      return;
    }
    setCourse(c as Course);

    const { data: u } = await supabase
      .from("units")
      .select("id, title, description, position, lessons(id, title, description, video_provider, video_url, unit_id, position)")
      .eq("course_id", id)
      .order("position");
    const mapped: Unit[] = (u ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      position: row.position,
      lessons: [...(row.lessons ?? [])].sort((a: any, b: any) => a.position - b.position),
    }));
    setUnits(mapped);
    // expand all by default
    setExpanded((prev) => {
      const next = { ...prev };
      mapped.forEach((u) => {
        if (!(u.id in next)) next[u.id] = true;
      });
      return next;
    });
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Unit CRUD ----
  const saveUnit = async (values: UnitFormValues) => {
    await markSaving(async () => {
      if (editingUnit) {
        const { error } = await supabase
          .from("units")
          .update({ title: values.title, description: values.description || null })
          .eq("id", editingUnit.id);
        if (error) throw error;
      } else {
        const position = units.length;
        const { error } = await supabase.from("units").insert({
          course_id: id!,
          title: values.title,
          description: values.description || null,
          position,
        });
        if (error) throw error;
      }
    });
    await load();
    setEditingUnit(null);
  };

  const deleteUnit = async () => {
    if (!deletingUnit) return;
    await markSaving(async () => {
      const { error } = await supabase.from("units").delete().eq("id", deletingUnit.id);
      if (error) throw error;
    });
    setDeletingUnit(null);
    load();
  };

  const deleteLesson = async () => {
    if (!deletingLesson) return;
    await markSaving(async () => {
      // Remove files from storage first
      const { data: files } = await supabase
        .from("lesson_files")
        .select("file_url")
        .eq("lesson_id", deletingLesson.id);
      if (files?.length) {
        await supabase.storage
          .from("lesson-files")
          .remove(files.map((f: any) => f.file_url));
      }
      const { error } = await supabase.from("lessons").delete().eq("id", deletingLesson.id);
      if (error) throw error;
    });
    setDeletingLesson(null);
    load();
  };

  // ---- Drag & drop ----
  const findUnitByLessonId = (lessonId: string) =>
    units.find((u) => u.lessons.some((l) => l.id === lessonId));

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as any;
    if (data?.type === "unit") {
      const unit = units.find((u) => `unit:${u.id}` === e.active.id);
      if (unit) setActiveDrag({ type: "unit", unit });
    } else if (data?.type === "lesson") {
      setActiveDrag({ type: "lesson", lesson: data.lesson });
    }
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeData = active.data.current as any;
    if (activeData?.type !== "lesson") return;

    const activeLessonId = String(active.id).replace("lesson:", "");
    const overId = String(over.id);
    const activeUnit = findUnitByLessonId(activeLessonId);
    if (!activeUnit) return;

    let targetUnitId: string | null = null;
    if (overId.startsWith("unit:")) {
      targetUnitId = overId.replace("unit:", "");
    } else if (overId.startsWith("lesson:")) {
      const overLessonId = overId.replace("lesson:", "");
      const overUnit = findUnitByLessonId(overLessonId);
      targetUnitId = overUnit?.id ?? null;
    }
    if (!targetUnitId || targetUnitId === activeUnit.id) return;

    setUnits((prev) => {
      const from = prev.find((u) => u.id === activeUnit.id);
      const to = prev.find((u) => u.id === targetUnitId);
      if (!from || !to) return prev;
      const lesson = from.lessons.find((l) => l.id === activeLessonId);
      if (!lesson) return prev;
      return prev.map((u) => {
        if (u.id === from.id)
          return { ...u, lessons: u.lessons.filter((l) => l.id !== activeLessonId) };
        if (u.id === to.id)
          return { ...u, lessons: [...u.lessons, { ...lesson, unit_id: to.id }] };
        return u;
      });
    });
  };

  const persistOrder = async (nextUnits: Unit[]) => {
    await markSaving(async () => {
      const ops: Promise<any>[] = [];
      nextUnits.forEach((u, i) => {
        ops.push(
          Promise.resolve(
            supabase.from("units").update({ position: i }).eq("id", u.id),
          ),
        );
        u.lessons.forEach((l, li) => {
          ops.push(
            Promise.resolve(
              supabase
                .from("lessons")
                .update({ position: li, unit_id: u.id })
                .eq("id", l.id),
            ),
          );
        });
      });
      const results = await Promise.all(ops);
      const err = results.find((r: any) => r.error)?.error;
      if (err) throw err;
    });
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const activeData = active.data.current as any;

    if (activeData?.type === "unit") {
      const oldIdx = units.findIndex((u) => `unit:${u.id}` === active.id);
      const newIdx = units.findIndex((u) => `unit:${u.id}` === over.id);
      if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return;
      const next = arrayMove(units, oldIdx, newIdx);
      setUnits(next);
      await persistOrder(next);
      return;
    }

    if (activeData?.type === "lesson") {
      const activeLessonId = String(active.id).replace("lesson:", "");
      const activeUnit = findUnitByLessonId(activeLessonId);
      if (!activeUnit) return;

      const overId = String(over.id);
      let next = [...units];

      if (overId.startsWith("lesson:")) {
        const overLessonId = overId.replace("lesson:", "");
        const overUnit = findUnitByLessonId(overLessonId);
        if (overUnit && overUnit.id === activeUnit.id) {
          const oldIdx = activeUnit.lessons.findIndex((l) => l.id === activeLessonId);
          const newIdx = activeUnit.lessons.findIndex((l) => l.id === overLessonId);
          if (oldIdx !== newIdx && oldIdx >= 0 && newIdx >= 0) {
            next = units.map((u) =>
              u.id === activeUnit.id
                ? { ...u, lessons: arrayMove(u.lessons, oldIdx, newIdx) }
                : u,
            );
            setUnits(next);
          }
        }
      }
      await persistOrder(next);
    }
  };

  // ---- Publish toggle ----
  const togglePublish = async () => {
    if (!course) return;
    const newStatus = course.status === "published" ? "draft" : "published";
    await markSaving(async () => {
      const { error } = await supabase
        .from("courses")
        .update({ status: newStatus })
        .eq("id", course.id);
      if (error) throw error;
    });
    setCourse({ ...course, status: newStatus });
    setPublishOpen(false);
    toast.success(newStatus === "published" ? "تم نشر الدورة" : "تم إرجاعها كمسودة");
  };

  const openAddLesson = (unitId: string) => {
    setLessonUnitId(unitId);
    setEditingLesson(null);
    setLessonModalOpen(true);
  };
  const openEditLesson = (lesson: LessonRecord) => {
    setLessonUnitId(lesson.unit_id);
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  };

  const nextLessonPosition = useMemo(() => {
    if (!lessonUnitId) return 0;
    const u = units.find((x) => x.id === lessonUnitId);
    return u?.lessons.length ?? 0;
  }, [units, lessonUnitId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى الدورات
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                {course.title}
              </h1>
              <Badge
                variant={course.status === "published" ? "default" : "secondary"}
                className={
                  course.status === "published"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0"
                    : "bg-muted text-muted-foreground border-0"
                }
              >
                {course.status === "published" ? "منشورة" : "مسودة"}
              </Badge>
              <SaveIndicator state={saveState} />
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              نظّم وحدات ودروس الدورة، والسحب لإعادة الترتيب.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
            >
              <Settings className="w-4 h-4 ml-2" />
              بيانات الدورة
            </Button>
            <Button
              onClick={() => setPublishOpen(true)}
              className={
                course.status === "published"
                  ? "bg-muted text-foreground hover:bg-muted/80"
                  : ""
              }
              variant={course.status === "published" ? "outline" : "default"}
            >
              {course.status === "published" ? "إرجاع كمسودة" : "نشر الدورة"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Add unit */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
          <Info className="w-4 h-4" />
          {units.length} وحدات
        </div>
        <Button
          onClick={() => {
            setEditingUnit(null);
            setUnitModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة وحدة
        </Button>
      </div>

      {units.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-dashed border-border/70 bg-card/40 p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">ابدأ ببناء المحتوى</h2>
          <p className="text-muted-foreground mb-5 max-w-md mx-auto">
            أضف الوحدة الأولى، ثم أضف دروسها وارفع الملفات المرفقة بها.
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditingUnit(null);
              setUnitModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" />
            أضف الوحدة الأولى
          </Button>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={units.map((u) => `unit:${u.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {units.map((u) => (
                <UnitCard
                  key={u.id}
                  unit={u}
                  expanded={!!expanded[u.id]}
                  onToggle={() =>
                    setExpanded((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                  }
                  onEdit={() => {
                    setEditingUnit(u);
                    setUnitModalOpen(true);
                  }}
                  onDelete={() => setDeletingUnit(u)}
                  onAddLesson={() => openAddLesson(u.id)}
                  onEditLesson={openEditLesson}
                  onDeleteLesson={setDeletingLesson}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeDrag?.type === "lesson" ? (
              <LessonItem
                lesson={activeDrag.lesson}
                onEdit={() => {}}
                onDelete={() => {}}
                isOverlay
              />
            ) : activeDrag?.type === "unit" ? (
              <div className="rounded-2xl border border-primary/60 bg-card p-4 shadow-2xl">
                <div className="font-bold">{activeDrag.unit.title}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modals */}
      <UnitModal
        open={unitModalOpen}
        onOpenChange={setUnitModalOpen}
        unit={editingUnit}
        onSubmit={saveUnit}
      />

      {lessonUnitId && (
        <LessonModal
          open={lessonModalOpen}
          onOpenChange={(v) => {
            setLessonModalOpen(v);
            if (!v) load();
          }}
          unitId={lessonUnitId}
          lesson={editingLesson}
          nextPosition={nextLessonPosition}
          onSaved={load}
        />
      )}

      {/* Delete unit */}
      <AlertDialog
        open={!!deletingUnit}
        onOpenChange={(v) => !v && setDeletingUnit(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الوحدة</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف "{deletingUnit?.title}" وجميع دروسها وملفاتها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteUnit();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete lesson */}
      <AlertDialog
        open={!!deletingLesson}
        onOpenChange={(v) => !v && setDeletingLesson(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الدرس</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف "{deletingLesson?.title}" وجميع ملفاته.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteLesson();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish confirm */}
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {course.status === "published" ? "إرجاع الدورة كمسودة" : "نشر الدورة"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {course.status === "published"
                ? "لن تظهر الدورة للطلاب حتى يتم نشرها مرة أخرى."
                : "ستصبح الدورة مرئية للطلاب على المنصة."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                togglePublish();
              }}
            >
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const SaveIndicator = ({ state }: { state: SaveState }) => (
  <AnimatePresence mode="wait">
    {state === "saving" && (
      <motion.span
        key="s"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        جارٍ الحفظ...
      </motion.span>
    )}
    {state === "saved" && (
      <motion.span
        key="d"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        تم حفظ التغييرات
      </motion.span>
    )}
  </AnimatePresence>
);

export default CourseBuilder;
