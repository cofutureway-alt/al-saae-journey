import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stage_id: string | null;
  stage_name: string | null;
  units_count: number;
  lessons_count: number;
  created_at: string;
}

export function usePublicCourses(limit?: number) {
  const [courses, setCourses] = useState<PublicCourse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase
        .from("courses")
        .select(
          "id, title, description, thumbnail_url, stage_id, created_at, stages(name), units(id)",
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

      const unitIds: string[] = (data ?? []).flatMap((c: any) =>
        (c.units ?? []).map((u: any) => u.id),
      );

      let lessonCounts: Record<string, number> = {};
      if (unitIds.length) {
        const { data: lessons } = await supabase
          .from("lessons_public")
          .select("unit_id")
          .in("unit_id", unitIds);
        (lessons ?? []).forEach((l: any) => {
          lessonCounts[l.unit_id] = (lessonCounts[l.unit_id] ?? 0) + 1;
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
          units_count: c.units?.length ?? 0,
          lessons_count: (c.units ?? []).reduce(
            (acc: number, u: any) => acc + (lessonCounts[u.id] ?? 0),
            0,
          ),
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
