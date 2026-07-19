import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MyCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stage_name: string | null;
  enrolled_at: string;
  units_count: number;
  lessons_count: number;
  completed_count: number;
  percent: number;
}

export function useMyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<MyCourse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setCourses([]);
      return;
    }
    (async () => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(
          "enrolled_at, course_id, courses(id, title, description, thumbnail_url, stages(name))",
        )
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      const rows = (enrollments ?? []).filter((e: any) => e.courses);
      const courseIds = rows.map((e: any) => e.course_id);
      if (!courseIds.length) {
        if (!cancelled) setCourses([]);
        return;
      }

      const { data: units } = await supabase
        .from("units")
        .select("id, course_id")
        .in("course_id", courseIds);

      const unitToCourse: Record<string, string> = {};
      const unitIds: string[] = [];
      (units ?? []).forEach((u: any) => {
        unitToCourse[u.id] = u.course_id;
        unitIds.push(u.id);
      });

      const unitsCount: Record<string, number> = {};
      (units ?? []).forEach((u: any) => {
        unitsCount[u.course_id] = (unitsCount[u.course_id] ?? 0) + 1;
      });

      const lessonsCount: Record<string, number> = {};
      const quizzesCount: Record<string, number> = {};
      const quizToCourse: Record<string, string> = {};
      if (unitIds.length) {
        const { data: lessons } = await supabase
          .from("lessons_public")
          .select("unit_id")
          .in("unit_id", unitIds);
        (lessons ?? []).forEach((l: any) => {
          const cId = unitToCourse[l.unit_id];
          if (cId) lessonsCount[cId] = (lessonsCount[cId] ?? 0) + 1;
        });

        const { data: quizzes } = await (supabase as any)
          .from("quizzes")
          .select("id, unit_id")
          .in("unit_id", unitIds);
        (quizzes ?? []).forEach((q: any) => {
          const cId = unitToCourse[q.unit_id];
          if (cId) {
            quizzesCount[cId] = (quizzesCount[cId] ?? 0) + 1;
            quizToCourse[q.id] = cId;
          }
        });
      }

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("course_id")
        .eq("user_id", user.id)
        .in("course_id", courseIds);

      const doneLessons: Record<string, number> = {};
      (progress ?? []).forEach((p: any) => {
        doneLessons[p.course_id] = (doneLessons[p.course_id] ?? 0) + 1;
      });

      const doneQuizzes: Record<string, Set<string>> = {};
      const allQuizIds = Object.keys(quizToCourse);
      if (allQuizIds.length) {
        const { data: attempts } = await (supabase as any)
          .from("quiz_attempts")
          .select("quiz_id")
          .eq("user_id", user.id)
          .in("quiz_id", allQuizIds);
        (attempts ?? []).forEach((a: any) => {
          const cId = quizToCourse[a.quiz_id];
          if (!cId) return;
          if (!doneQuizzes[cId]) doneQuizzes[cId] = new Set();
          doneQuizzes[cId].add(a.quiz_id);
        });
      }

      if (cancelled) return;
      setCourses(
        rows.map((e: any) => {
          const c = e.courses;
          const totalLessons = lessonsCount[c.id] ?? 0;
          const totalQuizzes = quizzesCount[c.id] ?? 0;
          const total = totalLessons + totalQuizzes;
          const completed =
            (doneLessons[c.id] ?? 0) + (doneQuizzes[c.id]?.size ?? 0);
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail_url: c.thumbnail_url,
            stage_name: c.stages?.name ?? null,
            enrolled_at: e.enrolled_at,
            units_count: unitsCount[c.id] ?? 0,
            lessons_count: total,
            completed_count: completed,
            percent: total ? Math.round((completed / total) * 100) : 0,
          } as MyCourse;
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return courses;
}
