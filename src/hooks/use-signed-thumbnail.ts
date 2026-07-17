import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, { url: string; expires: number }>();

export const useSignedThumbnail = (path: string | null | undefined) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    const cached = cache.get(path);
    if (cached && cached.expires > Date.now()) {
      setUrl(cached.url);
      return;
    }
    supabase.storage
      .from("thumbnails")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.signedUrl) {
          cache.set(path, {
            url: data.signedUrl,
            expires: Date.now() + 55 * 60 * 1000,
          });
          setUrl(data.signedUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
};
