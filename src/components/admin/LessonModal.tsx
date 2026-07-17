import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Trash2,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  File as FileIcon,
  Youtube,
  Play,
  Film,
  Info,
  Paperclip,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { parseVideoUrl, type VideoProvider } from "@/lib/video";

export interface LessonRecord {
  id: string;
  title: string;
  description: string | null;
  video_provider: VideoProvider | null;
  video_url: string | null;
  unit_id: string;
  position: number;
}

interface FileRow {
  id: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  file_url: string;
}

const schema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا").max(160),
  description: z.string().trim().max(1000).optional(),
});
type FormValues = z.infer<typeof schema>;

const providers: {
  key: VideoProvider;
  label: string;
  icon: typeof Youtube;
  placeholder: string;
}[] = [
  { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/watch?v=..." },
  { key: "bunny", label: "Bunny", icon: Play, placeholder: "https://iframe.mediadelivery.net/embed/…/…" },
  { key: "vimeo", label: "Vimeo", icon: Film, placeholder: "https://vimeo.com/…" },
];

const fileIcon = (type?: string | null) => {
  if (!type) return FileIcon;
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
    return FileArchive;
  if (type.includes("pdf") || type.includes("text") || type.includes("word"))
    return FileText;
  return FileIcon;
};

const formatSize = (bytes?: number | null) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unitId: string;
  lesson: LessonRecord | null;
  nextPosition: number;
  onSaved: () => void;
}

const LessonModal = ({ open, onOpenChange, unitId, lesson, nextPosition, onSaved }: Props) => {
  const isEdit = !!lesson;
  const [tab, setTab] = useState<"details" | "files">("details");
  const [provider, setProvider] = useState<VideoProvider>("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedLessonId, setSavedLessonId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });

  const activeLessonId = savedLessonId ?? lesson?.id ?? null;

  useEffect(() => {
    if (!open) return;
    setTab("details");
    setSavedLessonId(null);
    reset({
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
    });
    setProvider(lesson?.video_provider ?? "youtube");
    setVideoUrl(lesson?.video_url ?? "");
    setVideoError(null);
    setThumbnail(null);
    setFiles([]);
    if (lesson?.video_url && lesson?.video_provider) {
      const parsed = parseVideoUrl(lesson.video_provider, lesson.video_url);
      if ("thumbnail" in parsed && parsed.thumbnail) setThumbnail(parsed.thumbnail);
    }
  }, [open, lesson, reset]);

  // Load lesson files when we have a lesson id
  useEffect(() => {
    if (!activeLessonId || !open) return;
    supabase
      .from("lesson_files")
      .select("*")
      .eq("lesson_id", activeLessonId)
      .order("created_at")
      .then(({ data }) => setFiles((data as FileRow[]) ?? []));
  }, [activeLessonId, open]);

  const handleProviderChange = (p: VideoProvider) => {
    setProvider(p);
    setVideoUrl("");
    setVideoError(null);
    setThumbnail(null);
  };

  const handleUrlBlur = () => {
    if (!videoUrl.trim()) {
      setVideoError(null);
      setThumbnail(null);
      return;
    }
    const parsed = parseVideoUrl(provider, videoUrl);
    if ("error" in parsed) {
      setVideoError(parsed.error);
      setThumbnail(null);
    } else {
      setVideoError(null);
      setThumbnail(parsed.thumbnail ?? null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Video link is required — every lesson must have exactly one video source
    if (!videoUrl.trim()) {
      setVideoError("رابط الفيديو مطلوب — كل درس يجب أن يحتوي على فيديو واحد");
      setTab("details");
      return;
    }
    const parsed = parseVideoUrl(provider, videoUrl);
    if ("error" in parsed) {
      setVideoError(parsed.error);
      setTab("details");
      return;
    }
    const finalUrl: string | null = parsed.url;
    const finalProvider: VideoProvider | null = parsed.provider;

    setSubmitting(true);
    try {
      if (isEdit || savedLessonId) {
        const idToUpdate = savedLessonId ?? lesson!.id;
        const { error } = await supabase
          .from("lessons")
          .update({
            title: values.title,
            description: values.description || null,
            video_provider: finalProvider,
            video_url: finalUrl,
          })
          .eq("id", idToUpdate);
        if (error) throw error;
        toast.success("تم حفظ الدرس");
        onSaved();
      } else {
        const { data, error } = await supabase
          .from("lessons")
          .insert({
            unit_id: unitId,
            title: values.title,
            description: values.description || null,
            video_provider: finalProvider,
            video_url: finalUrl,
            position: nextPosition,
          })
          .select("id")
          .single();
        if (error) throw error;
        setSavedLessonId(data!.id);
        toast.success("تم إنشاء الدرس — يمكنك رفع الملفات الآن");
        setTab("files");
        onSaved();
      }
    } catch (e: any) {
      toast.error(e?.message || "تعذّر حفظ الدرس");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (fs: FileList | null) => {
    if (!fs || !activeLessonId) return;
    setUploading(true);
    try {
      for (const f of Array.from(fs)) {
        const path = `${activeLessonId}/${crypto.randomUUID()}-${f.name}`;
        const { error: upErr } = await supabase.storage
          .from("lesson-files")
          .upload(path, f, { contentType: f.type });
        if (upErr) throw upErr;
        const { data: row, error } = await supabase
          .from("lesson_files")
          .insert({
            lesson_id: activeLessonId,
            file_name: f.name,
            file_size: f.size,
            file_type: f.type || null,
            file_url: path,
          })
          .select("*")
          .single();
        if (error) throw error;
        setFiles((prev) => [...prev, row as FileRow]);
      }
      toast.success("تم رفع الملفات");
    } catch (e: any) {
      toast.error(e?.message || "تعذّر رفع الملف");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteFile = async (row: FileRow) => {
    try {
      await supabase.storage.from("lesson-files").remove([row.file_url]);
      await supabase.from("lesson_files").delete().eq("id", row.id);
      setFiles((prev) => prev.filter((f) => f.id !== row.id));
    } catch (e: any) {
      toast.error(e?.message || "تعذّر الحذف");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" dir="rtl">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle>{isEdit ? "تعديل الدرس" : "درس جديد"}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="details" className="gap-2">
                <Info className="w-4 h-4" />
                تفاصيل الدرس
              </TabsTrigger>
              <TabsTrigger value="files" disabled={!activeLessonId} className="gap-2">
                <Paperclip className="w-4 h-4" />
                الملفات{files.length ? ` (${files.length})` : ""}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="mt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ltitle">عنوان الدرس</Label>
                <Input id="ltitle" {...register("title")} placeholder="مثال: مقدمة في الجبر" />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ldesc">الوصف</Label>
                <Textarea id="ldesc" rows={3} {...register("description")} />
              </div>

              <div className="space-y-2">
                <Label>مصدر الفيديو</Label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                  {providers.map((p) => {
                    const Icon = p.icon;
                    const active = provider === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleProviderChange(p.key)}
                        className={`relative flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="lesson-provider-active"
                            className="absolute inset-0 bg-background rounded-md shadow-sm"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                        <Icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vurl">رابط الفيديو <span className="text-destructive">*</span></Label>
                <Input
                  id="vurl"
                  dir="ltr"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  placeholder={providers.find((p) => p.key === provider)?.placeholder}
                />
                {videoError && (
                  <p className="text-xs text-destructive">{videoError}</p>
                )}
                <AnimatePresence>
                  {thumbnail && !videoError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-muted">
                        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  {isEdit || savedLessonId ? "حفظ الدرس" : "حفظ ومتابعة إلى الملفات"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <div className="p-6 space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleUpload(e.dataTransfer.files);
                }}
                className="rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors cursor-pointer p-8 text-center bg-accent/30"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جارٍ الرفع...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">اسحب الملفات أو انقر للرفع</p>
                    <p className="text-xs">أي نوع من الملفات — يدعم رفع عدة ملفات دفعة واحدة</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {files.map((f) => {
                    const Icon = fileIcon(f.file_type);
                    return (
                      <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
                      >
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{f.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatSize(f.file_size)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFile(f)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {files.length === 0 && !uploading && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    لا توجد ملفات مرفقة بعد.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border/60">
                <Button onClick={() => onOpenChange(false)}>تم</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LessonModal;
