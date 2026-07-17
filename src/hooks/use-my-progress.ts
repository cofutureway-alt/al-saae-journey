import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CourseProgress {
  courseId: string;
  completed: number;
  total: number;
  percent: number;
  completedLessonIds: Set<string>;
}

/**
 * Load progress for a single course (uses lessons_public for lesson count so
 * it works for enrolled students without over-fetching).
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

    // Total lessons in course via units join
    const { data: units } = await supabase
      .from("units")
      .select("id")
      .eq("course_id", courseId);
    const unitIds = (units ?? []).map((u: any) => u.id);
    let total = 0;
    if (unitIds.length) {
      const { count } = await supabase
        .from("lessons_public")
        .select("id", { count: "exact", head: true })
        .in("unit_id", unitIds);
      total = count ?? 0;
    }

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("course_id", courseId)
      .eq("user_id", user.id);
    const completedIds = new Set<string>((progress ?? []).map((p: any) => p.lesson_id));
    const completed = completedIds.size;
    setData({
      courseId,
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
      completedLessonIds: completedIds,
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
 * Used by course cards so guests / non-enrolled see nothing extra.
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

      const totals: Record<string, number> = {};
      if (unitIds.length) {
        const { data: lessons } = await supabase
          .from("lessons_public")
          .select("unit_id")
          .in("unit_id", unitIds);
        (lessons ?? []).forEach((l: any) => {
          const cId = unitToCourse[l.unit_id];
          if (cId) totals[cId] = (totals[cId] ?? 0) + 1;
        });
      }

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("course_id")
        .eq("user_id", user.id)
        .in("course_id", courseIds);
      const done: Record<string, number> = {};
      (progress ?? []).forEach((p: any) => {
        done[p.course_id] = (done[p.course_id] ?? 0) + 1;
      });

      const result: Record<string, number> = {};
      courseIds.forEach((id) => {
        const t = totals[id] ?? 0;
        const d = done[id] ?? 0;
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
