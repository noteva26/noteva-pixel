import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InlineLoader } from "@/components/PixelLoader";
import { useTranslation } from "@/lib/i18n";
import { getNoteva, getArticleUrl } from "@/hooks/useNoteva";

interface Tag { id: number; name: string; slug: string }
interface Article {
  id: number; slug: string; title: string;
  published_at?: string; publishedAt?: string; created_at?: string; createdAt?: string;
  view_count?: number; viewCount?: number; like_count?: number; likeCount?: number;
  is_pinned?: boolean; isPinned?: boolean;
  category?: { id: number; name: string; slug: string };
}

export default function TagsPage() {
  const { t, locale } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedSlug = searchParams.get("t") || "";
  const [tags, setTags] = useState<Tag[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t("nav.tags");
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const tagList = await N.tags.list();
        setTags(tagList);
        if (selectedSlug) {
          const tag = tagList.find((t: Tag) => t.slug === selectedSlug);
          setSelectedTag(tag || null);
          if (tag) {
            const r = await N.articles.list({ pageSize: 100, tag: selectedSlug });
            setArticles(r.articles || []);
            document.title = `#${tag.name}`;
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

  if (selectedSlug && selectedTag) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Link to="/tags" className="font-pixel text-[10px] text-pixel-muted hover:text-pixel-primary mb-4 inline-block">
              ◀ {t("common.back")}
            </Link>
            <div className="pixel-card p-4 mb-6 animate-fade-in">
              <h1 className="font-pixel text-xs text-pixel-primary">◆ #{selectedTag.name}</h1>
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
                    {a.category && (
                      <Link to={`/categories?c=${a.category.slug}`} className="text-pixel-info hover:text-pixel-primary">
                        [{a.category.name}]
                      </Link>
                    )}
                  </div>
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
            <h1 className="font-pixel text-xs text-pixel-primary">◆ {t("nav.tags").toUpperCase()}</h1>
            <p className="text-pixel-muted text-xs mt-1">{t("tag.totalTags")}: {tags.length}</p>
          </div>
          {loading ? (
            <InlineLoader />
          ) : tags.length === 0 ? (
            <div className="pixel-card p-8 text-center"><p className="font-pixel text-xs text-pixel-muted">{t("tag.noTags")}</p></div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Link key={tag.id} to={`/tags?t=${tag.slug}`}
                  className="pixel-badge bg-pixel-card text-pixel-muted hover:bg-pixel-surface hover:text-pixel-primary text-[10px] font-pixel pixel-animate-in"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  #{tag.name}
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
