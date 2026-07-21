import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stage_id: string | null;
  stage_name: string | null;
  subject_id: string | null;
  subject_name: string | null;
  units_count: number;
  lessons_count: number;
  quizzes_count: number;
  assignments_count: number;
  questions_count: number;
  created_at: string;
}

export function usePublicCourses(limit?: number) {
  const [courses, setCourses] = useState<PublicCourse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = (supabase as any)
        .from("courses")
        .select(
          "id, title, description, thumbnail_url, stage_id, subject_id, created_at, stages(name), subjects(name), units(id)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        setCourses([]);
        return;
      }

      const courseIds = (data ?? []).map((c: any) => c.id);
      const unitIds: string[] = (data ?? []).flatMap((c: any) =>
        (c.units ?? []).map((u: any) => u.id),
      );

      const lessonCounts: Record<string, number> = {};
      if (unitIds.length) {
        const { data: lessons } = await supabase
          .from("lessons_public")
          .select("unit_id")
          .in("unit_id", unitIds);
        (lessons ?? []).forEach((l: any) => {
          lessonCounts[l.unit_id] = (lessonCounts[l.unit_id] ?? 0) + 1;
        });
      }

      // Quizzes + questions per course (batched)
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

      const assignmentsByCourse: Record<string, number> = {};
      if (courseIds.length) {
        const { data: assignments } = await (supabase as any)
          .from("assignments")
          .select("course_id")
          .in("course_id", courseIds);
        (assignments ?? []).forEach((a: any) => {
          assignmentsByCourse[a.course_id] = (assignmentsByCourse[a.course_id] ?? 0) + 1;
        });
      }

      if (cancelled) return;
      setCourses(
        (data ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          thumbnail_url: c.thumbnail_url,
          stage_id: c.stage_id,
          stage_name: c.stages?.name ?? null,
          subject_id: c.subject_id ?? null,
          subject_name: c.subjects?.name ?? null,
          units_count: c.units?.length ?? 0,
          lessons_count: (c.units ?? []).reduce(
            (acc: number, u: any) => acc + (lessonCounts[u.id] ?? 0),
            0,
          ),
          quizzes_count: quizzesByCourse[c.id] ?? 0,
          assignments_count: assignmentsByCourse[c.id] ?? 0,
          questions_count: questionsByCourse[c.id] ?? 0,
          created_at: c.created_at,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return courses;
}
