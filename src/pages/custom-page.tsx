import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InlineLoader } from "@/components/PixelLoader";
import { useTranslation } from "@/lib/i18n";
import { getNoteva } from "@/hooks/useNoteva";

interface Page {
  id: number; slug: string; title: string; content: string;
  content_html?: string; html?: string;
}

export default function CustomPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const r = await N.api.get(`/page/${slug}`);
        setPage(r.page);
        document.title = r.page.title;
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const getHtml = (p: Page) => p.content_html || p.html || "";

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full"><InlineLoader /></main>
        <Footer />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center w-full animate-fade-in">
          <p className="font-pixel text-2xl text-pixel-danger mb-2">404</p>
          <p className="font-pixel text-xs text-pixel-muted mb-6">{t("error.notFound")}</p>
          <p className="text-pixel-dark text-sm mb-6">{t("error.notFoundDesc")}</p>
          <button className="pixel-btn text-[8px]" onClick={() => navigate("/")}>◀ {t("error.backHome")}</button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-8">
          <button className="font-pixel text-[10px] text-pixel-muted hover:text-pixel-primary mb-6 inline-block" onClick={() => navigate(-1)}>
            ◀ {t("common.back")}
          </button>
          <header className="mb-6 animate-fade-in">
            <h1 className="font-pixel text-sm text-pixel-primary">{page.title}</h1>
          </header>
          <div className="pixel-card p-5 md:p-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="pixel-prose" dangerouslySetInnerHTML={{ __html: getHtml(page) }} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
