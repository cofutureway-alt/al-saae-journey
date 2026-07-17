import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  Upload,
  X,
  AlertTriangle,
  Layers,
  BookMarked,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSignedThumbnail } from "@/hooks/use-signed-thumbnail";

const schema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا").max(120),
  description: z.string().trim().max(1000).optional(),
  stage_id: z.string().uuid("اختر مرحلة"),
  subject_id: z.string().uuid("اختر مادة دراسية"),
});
type FormValues = z.infer<typeof schema>;

const MAX_MB = 3;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

interface Stage {
  id: string;
  name: string;
}
interface Subject {
  id: string;
  name: string;
}

const CourseInfoEditor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [stages, setStages] = useState<Stage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [existingThumb, setExistingThumb] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const existingSigned = useSignedThumbnail(existingThumb);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", stage_id: "", subject_id: "" },
  });
  const stageVal = watch("stage_id");
  const subjectVal = watch("subject_id");

  useEffect(() => {
    supabase
      .from("stages")
      .select("id, name")
      .order("name")
      .then(({ data }) => setStages((data as Stage[]) ?? []));

    (supabase as any)
      .from("subjects")
      .select("id, name")
      .order("name")
      .then(({ data }: any) => setSubjects((data as Subject[]) ?? []));

    if (isEdit) {
      supabase
        .from("courses")
        .select("*")
        .eq("id", id!)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            toast.error("لم يتم العثور على الدورة");
            navigate("/admin/courses");
            return;
          }
          reset({
            title: data.title,
            description: data.description ?? "",
            stage_id: data.stage_id ?? "",
            subject_id: (data as any).subject_id ?? "",
          });
          setExistingThumb(data.thumbnail_url);
          setLoading(false);
        });
    }
  }, [id, isEdit, navigate, reset]);

  const displayPreview = useMemo(() => {
    if (preview) return preview;
    if (isEdit && existingSigned) return existingSigned;
    return null;
  }, [preview, isEdit, existingSigned]);

  const handleFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      toast.error("صيغة غير مدعومة");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`الحجم يجب أن يكون أقل من ${MAX_MB}MB`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      let thumbPath = existingThumb;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `courses/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("thumbnails")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        if (existingThumb) {
          await supabase.storage.from("thumbnails").remove([existingThumb]);
        }
        thumbPath = path;
      }

      if (isEdit) {
        const { error } = await (supabase as any)
          .from("courses")
          .update({
            title: values.title,
            description: values.description || null,
            stage_id: values.stage_id,
            subject_id: values.subject_id,
            thumbnail_url: thumbPath,
          })
          .eq("id", id!);
        if (error) throw error;
        toast.success("تم تحديث الدورة");
        navigate(`/admin/courses/${id}/builder`);
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { data, error } = await (supabase as any)
          .from("courses")
          .insert({
            title: values.title,
            description: values.description || null,
            stage_id: values.stage_id,
            subject_id: values.subject_id,
            thumbnail_url: thumbPath,
            status: "draft",
            created_by: userRes.user?.id ?? null,
          })
          .select("id")
          .single();
        if (error) throw error;
        toast.success("تم إنشاء الدورة — أضف الوحدات الآن");
        navigate(`/admin/courses/${data!.id}/builder`);
      }
    } catch (e: any) {
      toast.error(e?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى الدورات
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {isEdit ? "تعديل بيانات الدورة" : "دورة جديدة"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEdit
            ? "قم بتحديث المعلومات الأساسية للدورة."
            : "الخطوة 1 من 2 — بيانات الدورة. ستنتقل بعدها لبناء المحتوى."}
        </p>
      </motion.div>

      {stages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 mb-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-foreground">لا توجد مراحل بعد</div>
            <p className="text-sm text-muted-foreground">
              يجب إنشاء مرحلة واحدة على الأقل قبل إنشاء دورة.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/stages">
              <Layers className="w-4 h-4 ml-2" />
              إدارة المراحل
            </Link>
          </Button>
        </motion.div>
      )}

      {subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 mb-6 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-foreground">لا توجد مواد دراسية بعد</div>
            <p className="text-sm text-muted-foreground">
              يجب إنشاء مادة دراسية واحدة على الأقل أولاً.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/subjects">
              <BookMarked className="w-4 h-4 ml-2" />
              إدارة المواد
            </Link>
          </Button>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 md:p-8"
      >
        <div className="space-y-2">
          <Label htmlFor="title">عنوان الدورة</Label>
          <Input id="title" placeholder="مثال: أساسيات الرياضيات" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">وصف الدورة</Label>
          <Textarea id="description" rows={4} placeholder="نبذة عن الدورة" {...register("description")} />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>المرحلة الدراسية</Label>
            <Select
              value={stageVal}
              onValueChange={(v) => setValue("stage_id", v, { shouldValidate: true })}
              disabled={stages.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المرحلة" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stage_id && (
              <p className="text-xs text-destructive">{errors.stage_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>المادة الدراسية</Label>
            <Select
              value={subjectVal}
              onValueChange={(v) => setValue("subject_id", v, { shouldValidate: true })}
              disabled={subjects.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject_id && (
              <p className="text-xs text-destructive">{errors.subject_id.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>الصورة المصغّرة</Label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="relative overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors cursor-pointer aspect-video bg-accent/40 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {displayPreview ? (
                <motion.div
                  key="p"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <img src={displayPreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 left-2 bg-background/90 hover:bg-background text-foreground rounded-full p-1.5 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="e"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">اسحب صورة أو انقر للرفع</p>
                  <p className="text-xs">PNG / JPG / WEBP — حتى {MAX_MB}MB</p>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED.join(",")}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/courses")}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={submitting || stages.length === 0 || subjects.length === 0}>
            {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            {isEdit ? "حفظ التغييرات" : "التالي: بناء المحتوى"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default CourseInfoEditor;
