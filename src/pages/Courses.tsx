import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/CourseCard";
import { usePublicCourses } from "@/hooks/use-public-courses";
import { useMyProgressMap } from "@/hooks/use-my-progress";
import { supabase } from "@/integrations/supabase/client";
import { EightPointStar } from "@/components/IslamicPatterns";

interface Named {
  id: string;
  name: string;
}

const Courses = () => {
  const courses = usePublicCourses();
  const progressMap = useMyProgressMap();
  const [stages, setStages] = useState<Named[]>([]);
  const [subjects, setSubjects] = useState<Named[]>([]);
  const [query, setQuery] = useState("");
  const [stageId, setStageId] = useState<string | "all">("all");
  const [subjectId, setSubjectId] = useState<string | "all">("all");

  useEffect(() => {
    supabase
      .from("stages")
      .select("id, name")
      .order("name")
      .then(({ data }) => setStages((data as Named[]) ?? []));
    (supabase as any)
      .from("subjects")
      .select("id, name")
      .order("name")
      .then(({ data }: any) => setSubjects((data as Named[]) ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (!courses) return null;
    return courses.filter((c) => {
      if (stageId !== "all" && c.stage_id !== stageId) return false;
      if (subjectId !== "all" && c.subject_id !== subjectId) return false;
      if (query && !c.title.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [courses, query, stageId, subjectId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16 relative overflow-hidden">
        <EightPointStar
          size={80}
          className="absolute top-24 left-8 text-primary/5 animate-spin-slow pointer-events-none"
        />
        <EightPointStar
          size={50}
          className="absolute top-64 right-6 text-primary/5 animate-float pointer-events-none"
        />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              كل الدورات
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              استكشف جميع الدورات المنشورة على المنصة وابدأ رحلتك التعليمية مجانًا.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 space-y-4"
          >
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن دورة..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10 h-11"
              />
            </div>

            {stages.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">المراحل</div>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    layoutId="stage-chip-active"
                    active={stageId === "all"}
                    onClick={() => setStageId("all")}
                    label="جميع المراحل"
                  />
                  {stages.map((s) => (
                    <Chip
                      key={s.id}
                      layoutId="stage-chip-active"
                      active={stageId === s.id}
                      onClick={() => setStageId(s.id)}
                      label={s.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {subjects.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">المواد الدراسية</div>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    layoutId="subject-chip-active"
                    active={subjectId === "all"}
                    onClick={() => setSubjectId("all")}
                    label="جميع المواد"
                  />
                  {subjects.map((s) => (
                    <Chip
                      key={s.id}
                      layoutId="subject-chip-active"
                      active={subjectId === s.id}
                      onClick={() => setSubjectId(s.id)}
                      label={s.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {courses === null ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <Skeleton className="h-44 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => (
                  <CourseCard key={c.id} course={c} index={i} progress={progressMap[c.id]} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center max-w-lg mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {courses.length === 0
                  ? "لا توجد دورات منشورة بعد"
                  : "لا توجد نتائج مطابقة"}
              </h2>
              <p className="text-muted-foreground">
                {courses.length === 0
                  ? "سنضيف الدورات قريبًا. تابعنا للاطلاع على الجديد."
                  : "جرّب كلمات بحث أخرى أو غيّر المرحلة أو المادة."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Chip = ({
  active,
  onClick,
  label,
  layoutId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  layoutId: string;
}) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
      active
        ? "text-primary-foreground"
        : "text-foreground hover:bg-accent border border-border"
    }`}
  >
    {active && (
      <motion.span
        layoutId={layoutId}
        className="absolute inset-0 rounded-full bg-primary -z-10"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
    {label}
  </button>
);

export default Courses;
