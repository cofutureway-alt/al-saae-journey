import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicBundle {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_paid: boolean;
  price_piastres: number | null;
  discount_price_piastres: number | null;
  discount_expires_at: string | null;
  courses_count: number;
  is_featured: boolean;
  created_at: string;
}

export function usePublicBundles(limit?: number, opts?: { featuredOnly?: boolean }) {
  const [bundles, setBundles] = useState<PublicBundle[] | null>(null);
  const featuredOnly = !!opts?.featuredOnly;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = (supabase as any)
        .from("bundles")
        .select(
          "id, title, description, cover_image_url, is_paid, price_piastres, discount_price_piastres, discount_expires_at, is_featured, featured_at, created_at, bundle_courses(course_id)",
        )
        .eq("status", "published");
      if (featuredOnly) {
        q = q.eq("is_featured", true).order("featured_at", { ascending: false, nullsFirst: false });
      } else {
        q = q.order("created_at", { ascending: false });
      }
      if (limit) q = q.limit(limit);

      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        setBundles([]);
        return;
      }
      setBundles(
        (data ?? []).map((b: any) => ({
          id: b.id,
          title: b.title,
          description: b.description ?? null,
          cover_image_url: b.cover_image_url ?? null,
          is_paid: !!b.is_paid,
          price_piastres: b.price_piastres ?? null,
          discount_price_piastres: b.discount_price_piastres ?? null,
          discount_expires_at: b.discount_expires_at ?? null,
          courses_count: (b.bundle_courses ?? []).length,
          is_featured: !!b.is_featured,
          created_at: b.created_at,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [limit, featuredOnly]);

  return bundles;
}
