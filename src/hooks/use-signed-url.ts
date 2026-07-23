import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, { url: string; expires: number }>();

export const useSignedUrl = (
  bucket: string,
  path: string | null | undefined,
  ttlSeconds = 3600,
) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    const key = `${bucket}::${path}`;
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      setUrl(cached.url);
      return;
    }
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, ttlSeconds)
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.signedUrl) {
          cache.set(key, {
            url: data.signedUrl,
            expires: Date.now() + Math.min(ttlSeconds - 60, 55 * 60) * 1000,
          });
          setUrl(data.signedUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bucket, path, ttlSeconds]);

  return url;
};
