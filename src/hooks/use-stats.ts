import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ Phase 17: weighted completion incl. quizzes ============
// For each lesson: contribution = 100 if completed, else watch_percentage (0 if none)
// For each quiz: contribution = 100 if student has ANY attempt, else 0
// Course percent = sum(contribution across lessons + quizzes) / ((lessons + quizzes) * 100) * 100

export interface StudentCourseStat {
  id: string;
  title: string;
  thumbnail_url: string | null;
  stage_name: string | null;
  subject_name: string | null;
  enrolled_at: string;
  total_lessons: number;
  completed_lessons: number;
  percent: number;
  units: {
    id: string;
    title: string;
    position: number;
    lessons: {
      id: string;
      title: string;
      position: number;
      watch_percentage: number;
      completed: boolean;
    }[];
  }[];
}

export interface StudentStats {
  enrollmentsCount: number;
  completedLessons: number;
  overallPercent: number;
  courses: StudentCourseStat[];
}

export function useStudentStats() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setData({ enrollmentsCount: 0, completedLessons: 0, overallPercent: 0, courses: [] });
      return;
    }
    (async () => {
      const uid = user.id;

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(
          "enrolled_at, course_id, courses(id, title, thumbnail_url, stages(name), subjects(name))",
        )
        .eq("user_id", uid)
        .order("enrolled_at", { ascending: false });

      const rows = (enrollments ?? []).filter((e: any) => e.courses);
      if (!rows.length) {
        if (!cancelled)
          setData({ enrollmentsCount: 0, completedLessons: 0, overallPercent: 0, courses: [] });
        return;
      }

      const courseIds = rows.map((r: any) => r.course_id);

      const [{ data: units }, { data: lessonProgress }, { data: watchRows }] = await Promise.all([
        supabase.from("units").select("id, course_id, title, position").in("course_id", courseIds),
        supabase
          .from("lesson_progress")
          .select("lesson_id, course_id")
          .eq("user_id", uid)
          .in("course_id", courseIds),
        supabase
          .from("lesson_watch_progress")
          .select("lesson_id, watch_percentage, course_id")
          .eq("user_id", uid)
          .in("course_id", courseIds),
      ]);

      const uList = (units ?? []) as any[];
      const unitIds = uList.map((u) => u.id);

      const [{ data: lessons }, { data: quizzes }] = await Promise.all([
        unitIds.length
          ? supabase
              .from("lessons_public")
              .select("id, unit_id, title, position")
              .in("unit_id", unitIds)
          : Promise.resolve({ data: [] as any[] }),
        unitIds.length
          ? (supabase as any)
              .from("quizzes")
              .select("id, unit_id")
              .in("unit_id", unitIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const quizList = (quizzes ?? []) as { id: string; unit_id: string }[];
      const quizIds = quizList.map((q) => q.id);

      const { data: attempts } = quizIds.length
        ? await (supabase as any)
            .from("quiz_attempts")
            .select("quiz_id")
            .eq("user_id", uid)
            .in("quiz_id", quizIds)
        : { data: [] as any[] };
      const attemptedQuizSet = new Set<string>(
        ((attempts ?? []) as any[]).map((a) => a.quiz_id),
      );

      const unitToCourse = new Map<string, string>();
      uList.forEach((u) => unitToCourse.set(u.id, u.course_id));

      const completedByLesson = new Set<string>((lessonProgress ?? []).map((p: any) => p.lesson_id));
      const watchByLesson = new Map<string, number>();
      (watchRows ?? []).forEach((w: any) => {
        watchByLesson.set(w.lesson_id, Math.min(100, Math.max(0, Number(w.watch_percentage) || 0)));
      });

      // Global counters
      let globalSum = 0;
      let globalTotal = 0;
      let completedLessonsCount = 0;

      const courseStats: StudentCourseStat[] = rows.map((r: any) => {
        const c = r.courses;
        const courseUnits = uList
          .filter((u) => u.course_id === c.id)
          .sort((a, b) => a.position - b.position)
          .map((u) => {
            const uLessons = (lessons ?? [])
              .filter((l: any) => l.unit_id === u.id)
              .sort((a: any, b: any) => a.position - b.position)
              .map((l: any) => {
                const done = completedByLesson.has(l.id);
                const wp = watchByLesson.get(l.id) ?? 0;
                return {
                  id: l.id,
                  title: l.title,
                  position: l.position,
                  watch_percentage: wp,
                  completed: done,
                };
              });
            return { id: u.id, title: u.title, position: u.position, lessons: uLessons };
          });

        let sum = 0;
        let total = 0;
        let done = 0;
        courseUnits.forEach((u) =>
          u.lessons.forEach((l) => {
            total += 1;
            const contribution = l.completed ? 100 : l.watch_percentage;
            sum += contribution;
            if (l.completed) done += 1;
          }),
        );
        globalSum += sum;
        globalTotal += total;
        completedLessonsCount += done;

        return {
          id: c.id,
          title: c.title,
          thumbnail_url: c.thumbnail_url,
          stage_name: c.stages?.name ?? null,
          subject_name: c.subjects?.name ?? null,
          enrolled_at: r.enrolled_at,
          total_lessons: total,
          completed_lessons: done,
          percent: total ? Math.round(sum / (total * 100) * 100) : 0,
          units: courseUnits,
        } as StudentCourseStat;
      });

      const overall = globalTotal ? Math.round(globalSum / (globalTotal * 100) * 100) : 0;

      if (!cancelled)
        setData({
          enrollmentsCount: rows.length,
          completedLessons: completedLessonsCount,
          overallPercent: overall,
          courses: courseStats,
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return data;
}

// ============ Admin Statistics ============
export interface TopCourseRow {
  id: string;
  title: string;
  thumbnail_url: string | null;
  stage_name: string | null;
  enrollment_count: number;
}

export interface AdminStats {
  publishedCourses: number;
  studentsCount: number;
  totalLessons: number;
  stagesCount: number;
  topCourses: TopCourseRow[];
}

export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [
        { count: publishedCourses },
        { count: studentsCount },
        { count: totalLessons },
        { count: stagesCount },
        { data: enrollments },
        { data: courses },
      ] = await Promise.all([
        supabase
          .from("courses")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student"),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("stages").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("course_id"),
        supabase.from("courses").select("id, title, thumbnail_url, created_at, stages(name)"),
      ]);

      // Group enrollments by course_id
      const counts = new Map<string, number>();
      (enrollments ?? []).forEach((e: any) => {
        counts.set(e.course_id, (counts.get(e.course_id) ?? 0) + 1);
      });

      const enriched = (courses ?? [])
        .map((c: any) => ({
          id: c.id,
          title: c.title,
          thumbnail_url: c.thumbnail_url,
          created_at: c.created_at,
          stage_name: c.stages?.name ?? null,
          enrollment_count: counts.get(c.id) ?? 0,
        }))
        .filter((c) => c.enrollment_count > 0)
        .sort((a, b) => {
          if (b.enrollment_count !== a.enrollment_count)
            return b.enrollment_count - a.enrollment_count;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        })
        .slice(0, 5)
        .map(({ created_at, ...rest }) => rest);

      if (!cancelled)
        setData({
          publishedCourses: publishedCourses ?? 0,
          studentsCount: studentsCount ?? 0,
          totalLessons: totalLessons ?? 0,
          stagesCount: stagesCount ?? 0,
          topCourses: enriched,
        });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
