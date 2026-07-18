import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { listUnitQuizzes } from "@/lib/quiz-api";

/**
 * A generic content item that can be a lesson, a quiz, or (in the future)
 * another type such as an assignment. All new types must slot in here — the
 * sidebar, routing, and completion aggregation consume this normalized shape.
 */
export type ContentItemType = "lesson" | "quiz";

export interface ContentItem {
  id: string;
  type: ContentItemType;
  unitId: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  routePath: string;
  // Extras used by the sidebar for type-specific badges/hints.
  extra?: {
    durationMinutes?: number;
  };
}

export interface ContentUnit {
  id: string;
  title: string;
  position: number;
  items: ContentItem[];
}

export interface UnitContentBundle {
  units: ContentUnit[];
  allItems: ContentItem[];
  totalCount: number;
  completedCount: number;
  percent: number;
}

/**
 * Build the canonical route to a content item within a course.
 * Single pattern used across the whole app.
 */
export function contentRoute(
  courseId: string,
  type: ContentItemType,
  id: string,
): string {
  return `/courses/${courseId}/learn/${type}/${id}`;
}

/**
 * Load the merged, ordered list of content items for an entire course
 * (all units), together with per-item completion status for the current user.
 *
 * Completion rules (Phase 17):
 *  - lesson: has a `lesson_progress` row
 *  - quiz: has ANY `quiz_attempts` row (any status — first attempt marks done)
 */
export function useCourseContent(courseId: string | undefined) {
  const { user } = useAuth();
  const [data, setData] = useState<UnitContentBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!courseId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: unitRows } = await supabase
      .from("units")
      .select("id, title, position")
      .eq("course_id", courseId)
      .order("position");
    const uList = (unitRows ?? []) as { id: string; title: string; position: number }[];
    const unitIds = uList.map((u) => u.id);

    // Lessons + quizzes for these units, in parallel.
    const [lessonsRes, quizzesArrays] = await Promise.all([
      unitIds.length
        ? supabase
            .from("lessons_public")
            .select("id, unit_id, title, position")
            .in("unit_id", unitIds)
        : Promise.resolve({ data: [] as any[] }),
      unitIds.length
        ? Promise.all(unitIds.map((uid) => listUnitQuizzes(uid).catch(() => [])))
        : Promise.resolve([] as any[]),
    ]);

    const lessons = (lessonsRes.data ?? []) as {
      id: string;
      unit_id: string;
      title: string;
      position: number;
    }[];

    const quizzesByUnit = new Map<string, any[]>();
    const allQuizIds: string[] = [];
    unitIds.forEach((uid, i) => {
      const list = (quizzesArrays[i] ?? []) as any[];
      quizzesByUnit.set(uid, list);
      list.forEach((q) => allQuizIds.push(q.id));
    });

    // Completion lookups
    let completedLessonIds = new Set<string>();
    let attemptedQuizIds = new Set<string>();
    if (user) {
      const [{ data: prog }, attemptsRes] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("course_id", courseId)
          .eq("user_id", user.id),
        allQuizIds.length
          ? (supabase as any)
              .from("quiz_attempts")
              .select("quiz_id")
              .eq("user_id", user.id)
              .in("quiz_id", allQuizIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      completedLessonIds = new Set((prog ?? []).map((p: any) => p.lesson_id));
      attemptedQuizIds = new Set(
        ((attemptsRes.data ?? []) as any[]).map((a) => a.quiz_id),
      );
    }

    const units: ContentUnit[] = uList.map((u) => {
      const uLessons: ContentItem[] = lessons
        .filter((l) => l.unit_id === u.id)
        .map((l) => ({
          id: l.id,
          type: "lesson" as const,
          unitId: u.id,
          title: l.title,
          orderIndex: l.position,
          isCompleted: completedLessonIds.has(l.id),
          routePath: contentRoute(courseId, "lesson", l.id),
        }));
      const uQuizzes: ContentItem[] = (quizzesByUnit.get(u.id) ?? []).map((q: any) => ({
        id: q.id,
        type: "quiz" as const,
        unitId: u.id,
        title: q.title,
        orderIndex: q.order_index,
        isCompleted: attemptedQuizIds.has(q.id),
        routePath: contentRoute(courseId, "quiz", q.id),
        extra: { durationMinutes: q.duration_minutes },
      }));
      const items = [...uLessons, ...uQuizzes].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
      return { id: u.id, title: u.title, position: u.position, items };
    });

    const allItems = units.flatMap((u) => u.items);
    const totalCount = allItems.length;
    const completedCount = allItems.filter((it) => it.isCompleted).length;
    const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    setData({ units, allItems, totalCount, completedCount, percent });
    setLoading(false);
  }, [courseId, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, reload: load };
}
