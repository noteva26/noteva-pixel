import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InlineLoader } from "@/components/PixelLoader";
import { useTranslation } from "@/lib/i18n";
import { getNoteva, getArticleUrl } from "@/hooks/useNoteva";

interface Article {
  id: number; slug: string; title: string;
  published_at?: string; publishedAt?: string; created_at?: string; createdAt?: string;
}
interface ArchiveGroup { year: number; months: { month: number; articles: Article[] }[] }

export default function ArchivesPage() {
  const { t } = useTranslation();
  const [archives, setArchives] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("nav.archive");
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const r = await N.articles.list({ pageSize: 100 });
        setArchives(group(r.articles || []));
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const getDate = (a: Article) => a.published_at || a.publishedAt || a.created_at || a.createdAt || "";

  const group = (articles: Article[]): ArchiveGroup[] => {
    const m = new Map<number, Map<number, Article[]>>();
    articles.forEach((a) => {
      const d = new Date(getDate(a));
      const y = d.getFullYear(), mo = d.getMonth() + 1;
      if (!m.has(y)) m.set(y, new Map());
      if (!m.get(y)!.has(mo)) m.get(y)!.set(mo, []);
      m.get(y)!.get(mo)!.push(a);
    });
    return Array.from(m.keys()).sort((a, b) => b - a).map(y => ({
      year: y,
      months: Array.from(m.get(y)!.keys()).sort((a, b) => b - a).map(mo => ({
        month: mo, articles: m.get(y)!.get(mo)!,
      })),
    }));
  };

  const total = archives.reduce((s, y) => s + y.months.reduce((s2, mo) => s2 + mo.articles.length, 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="pixel-card p-4 mb-6 animate-fade-in">
            <h1 className="font-pixel text-xs text-pixel-primary">◆ {t("nav.archive").toUpperCase()}</h1>
            <p className="text-pixel-muted text-xs mt-1">{t("article.totalArticles")}: {total}</p>
          </div>

          {loading ? <InlineLoader /> : archives.length === 0 ? (
            <div className="pixel-card p-8 text-center animate-fade-in">
              <p className="font-pixel text-xs text-pixel-muted">{t("article.noArticles")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {archives.map((yg, yi) => (
                <div key={yg.year} className="pixel-animate-in" style={{ animationDelay: `${yi * 80}ms` }}>
                  <h2 className="font-pixel text-sm text-pixel-secondary mb-3 sticky top-14 bg-pixel-bg py-2 z-10 border-b-2 border-dashed border-pixel-dark">
                    ▸ {yg.year}
                  </h2>
                  {yg.months.map((mg) => (
                    <div key={mg.month} className="mb-4 ml-4">
                      <h3 className="font-pixel text-[10px] text-pixel-muted mb-2">{mg.month}月</h3>
                      <div className="space-y-1 ml-2 border-l-[3px] border-pixel-border pl-4">
                        {mg.articles.map((a) => (
                          <Link key={a.id} to={getArticleUrl(a)}
                            className="flex items-center gap-2 py-1.5 text-pixel-text hover:text-pixel-primary group">
                            <span className="text-pixel-dark text-xs font-pixel text-[8px] w-6">{new Date(getDate(a)).getDate()}日</span>
                            <span className="text-sm group-hover:text-pixel-primary">{">"} {a.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
