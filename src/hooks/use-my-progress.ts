import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CourseProgress {
  courseId: string;
  completed: number; // completed lessons + passed quizzes
  total: number; // total lessons + total quizzes
  percent: number;
  completedLessonIds: Set<string>;
  passedQuizIds: Set<string>;
  totalLessons: number;
  totalQuizzes: number;
}

/**
 * Load progress for a single course. Progress now includes quizzes:
 * a quiz counts as "done" when the student has at least one attempt with passed=true.
 */
export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const [data, setData] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!courseId || !user) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: units } = await supabase
      .from("units")
      .select("id")
      .eq("course_id", courseId);
    const unitIds = (units ?? []).map((u: any) => u.id);

    let totalLessons = 0;
    let quizIds: string[] = [];
    if (unitIds.length) {
      const { count } = await supabase
        .from("lessons_public")
        .select("id", { count: "exact", head: true })
        .in("unit_id", unitIds);
      totalLessons = count ?? 0;

      const { data: qz } = await (supabase as any)
        .from("quizzes")
        .select("id")
        .in("unit_id", unitIds);
      quizIds = (qz ?? []).map((q: any) => q.id);
    }

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("course_id", courseId)
      .eq("user_id", user.id);
    const completedIds = new Set<string>((progress ?? []).map((p: any) => p.lesson_id));

    const passedQuizIds = new Set<string>();
    if (quizIds.length) {
      const { data: attempts } = await (supabase as any)
        .from("quiz_attempts")
        .select("quiz_id, passed")
        .eq("user_id", user.id)
        .eq("passed", true)
        .in("quiz_id", quizIds);
      (attempts ?? []).forEach((a: any) => passedQuizIds.add(a.quiz_id));
    }

    const total = totalLessons + quizIds.length;
    const completed = completedIds.size + passedQuizIds.size;
    setData({
      courseId,
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
      completedLessonIds: completedIds,
      passedQuizIds,
      totalLessons,
      totalQuizzes: quizIds.length,
    });
    setLoading(false);
  }, [courseId, user]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, reload: load };
}

/**
 * Map of courseId -> percent for the courses the current user is enrolled in.
 * Includes quizzes in the calculation.
 */
export function useMyProgressMap() {
  const { user } = useAuth();
  const [map, setMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setMap({});
      return;
    }
    (async () => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);
      const courseIds = (enrollments ?? []).map((e: any) => e.course_id);
      if (!courseIds.length) {
        if (!cancelled) setMap({});
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

      const lessonTotals: Record<string, number> = {};
      const quizTotals: Record<string, number> = {};
      const quizToCourse: Record<string, string> = {};

      if (unitIds.length) {
        const { data: lessons } = await supabase
          .from("lessons_public")
          .select("unit_id")
          .in("unit_id", unitIds);
        (lessons ?? []).forEach((l: any) => {
          const cId = unitToCourse[l.unit_id];
          if (cId) lessonTotals[cId] = (lessonTotals[cId] ?? 0) + 1;
        });

        const { data: quizzes } = await (supabase as any)
          .from("quizzes")
          .select("id, unit_id")
          .in("unit_id", unitIds);
        (quizzes ?? []).forEach((q: any) => {
          const cId = unitToCourse[q.unit_id];
          if (cId) {
            quizTotals[cId] = (quizTotals[cId] ?? 0) + 1;
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

      const donePassedQuizzes: Record<string, Set<string>> = {};
      const quizIds = Object.keys(quizToCourse);
      if (quizIds.length) {
        const { data: attempts } = await (supabase as any)
          .from("quiz_attempts")
          .select("quiz_id, passed")
          .eq("user_id", user.id)
          .eq("passed", true)
          .in("quiz_id", quizIds);
        (attempts ?? []).forEach((a: any) => {
          const cId = quizToCourse[a.quiz_id];
          if (!cId) return;
          if (!donePassedQuizzes[cId]) donePassedQuizzes[cId] = new Set();
          donePassedQuizzes[cId].add(a.quiz_id);
        });
      }

      const result: Record<string, number> = {};
      courseIds.forEach((id) => {
        const t = (lessonTotals[id] ?? 0) + (quizTotals[id] ?? 0);
        const d = (doneLessons[id] ?? 0) + (donePassedQuizzes[id]?.size ?? 0);
        result[id] = t ? Math.round((d / t) * 100) : 0;
      });
      if (!cancelled) setMap(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return map;
}
