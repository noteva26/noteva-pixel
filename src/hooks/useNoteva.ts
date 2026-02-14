/**
 * Noteva SDK React Hook
 */
import { useState, useEffect, useCallback } from "react";

export function getNoteva() {
  if (typeof window !== "undefined" && window.Noteva) return window.Noteva;
  return null;
}

export function useNoteva() {
  const [ready, setReady] = useState(false);
  const [sdk, setSdk] = useState<typeof window.Noteva | null>(null);

  useEffect(() => {
    const checkReady = () => {
      const noteva = getNoteva();
      if (noteva) {
        noteva.ready().then(() => { setSdk(noteva); setReady(true); });
      } else {
        setTimeout(checkReady, 50);
      }
    };
    checkReady();
  }, []);

  return { ready, Noteva: sdk };
}

export function useSiteInfo() {
  const [info, setInfo] = useState<{ name: string; description: string; subtitle: string; logo: string; footer: string; permalinkStructure?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      const n = getNoteva();
      if (n) { n.site.getInfo().then(setInfo).catch(console.error).finally(() => setLoading(false)); }
      else { setTimeout(load, 50); }
    };
    load();
  }, []);

  return { info, loading };
}

export function getArticleUrl(article: { id: number | string; slug?: string }): string {
  const noteva = getNoteva();
  if (noteva?.site?.getArticleUrl) return noteva.site.getArticleUrl(article);
  return `/posts/${article.slug || article.id}`;
}

export default useNoteva;
