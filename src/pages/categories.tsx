import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InlineLoader } from "@/components/PixelLoader";
import { useTranslation } from "@/lib/i18n";
import { getNoteva, getArticleUrl } from "@/hooks/useNoteva";

interface Category { id: number; name: string; slug: string; description?: string }
interface Article {
  id: number; slug: string; title: string; content: string;
  published_at?: string; publishedAt?: string; created_at?: string; createdAt?: string;
  view_count?: number; viewCount?: number; like_count?: number; likeCount?: number;
  is_pinned?: boolean; isPinned?: boolean;
  tags?: { id: number; name: string; slug: string }[];
}

export default function CategoriesPage() {
  const { t, locale } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedSlug = searchParams.get("c") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("nav.categories");
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const cats = await N.categories.list();
        setCategories(cats);
        if (selectedSlug) {
          const cat = cats.find((c: Category) => c.slug === selectedSlug);
          setSelectedCat(cat || null);
          if (cat) {
            const r = await N.articles.list({ pageSize: 100, category: selectedSlug });
            setArticles(r.articles || []);
            document.title = cat.name;
          }
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [selectedSlug]);

  const getDateLocale = () => locale === "en" ? "en-US" : locale === "zh-TW" ? "zh-TW" : "zh-CN";
  const getDate = (a: Article) => a.published_at || a.publishedAt || a.created_at || a.createdAt || "";
  const views = (a: Article) => a.view_count ?? a.viewCount ?? 0;
  const likes = (a: Article) => a.like_count ?? a.likeCount ?? 0;
  const pinned = (a: Article) => a.is_pinned || a.isPinned;

  if (selectedSlug && selectedCat) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Link to="/categories" className="font-pixel text-[10px] text-pixel-muted hover:text-pixel-primary mb-4 inline-block">
              ◀ {t("common.back")}
            </Link>
            <div className="pixel-card p-4 mb-6 animate-fade-in">
              <h1 className="font-pixel text-xs text-pixel-primary">◆ {selectedCat.name}</h1>
              {selectedCat.description && <p className="text-pixel-muted text-xs mt-1">{selectedCat.description}</p>}
              <p className="text-pixel-dark text-xs mt-1">{t("article.totalArticles")}: {articles.length}</p>
            </div>
            <div className="space-y-3">
              {loading ? <InlineLoader /> : articles.length === 0 ? (
                <div className="pixel-card p-6 text-center"><p className="font-pixel text-xs text-pixel-muted">{t("article.noArticles")}</p></div>
              ) : articles.map((a, i) => (
                <div key={a.id} className="pixel-card p-3 group pixel-animate-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pinned(a) && <span className="pixel-badge bg-pixel-danger text-white text-[8px]">{t("article.pinned")}</span>}
                    <Link to={getArticleUrl(a)} className="font-pixel text-[10px] text-pixel-text group-hover:text-pixel-primary">
                      {">"} {a.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 font-pixel text-[8px] text-pixel-dark">
                    <span>{new Date(getDate(a)).toLocaleDateString(getDateLocale())}</span>
                    <span>♥ {likes(a)}</span>
                    <span>◉ {views(a)}</span>
                  </div>
                  {a.tags && a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {a.tags.slice(0, 3).map((tag) => (
                        <Link key={tag.id} to={`/tags?t=${tag.slug}`} className="pixel-badge bg-pixel-surface text-pixel-muted hover:text-pixel-primary text-[8px]">
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="pixel-card p-4 mb-6 animate-fade-in">
            <h1 className="font-pixel text-xs text-pixel-primary">◆ {t("nav.categories").toUpperCase()}</h1>
            <p className="text-pixel-muted text-xs mt-1">{t("category.totalCategories")}: {categories.length}</p>
          </div>
          {loading ? (
            <InlineLoader />
          ) : categories.length === 0 ? (
            <div className="pixel-card p-8 text-center"><p className="font-pixel text-xs text-pixel-muted">{t("category.noCategories")}</p></div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((cat, i) => (
                <Link key={cat.id} to={`/categories?c=${cat.slug}`}
                  className="pixel-card p-4 group pixel-animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-pixel-secondary text-lg group-hover:animate-bounce8">▸</span>
                    <div>
                      <h2 className="font-pixel text-[10px] text-pixel-text group-hover:text-pixel-primary">{cat.name}</h2>
                      {cat.description && <p className="text-pixel-muted text-xs mt-0.5 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
