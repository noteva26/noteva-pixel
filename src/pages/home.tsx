import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InlineLoader } from "@/components/PixelLoader";
import { useTranslation } from "@/lib/i18n";
import { getNoteva, getArticleUrl } from "@/hooks/useNoteva";

interface Article {
  id: number; slug: string; title: string; content: string;
  published_at?: string; publishedAt?: string; created_at?: string; createdAt?: string;
  view_count?: number; viewCount?: number; like_count?: number; likeCount?: number;
  comment_count?: number; commentCount?: number;
  is_pinned?: boolean; isPinned?: boolean; thumbnail?: string;
  category?: { id: number; name: string; slug: string };
  tags?: { id: number; name: string; slug: string }[];
}

const PAGE_SIZE = 10;

function getExcerpt(content: string, max = 120): string {
  let t = content
    .replace(/\[([a-zA-Z0-9_-]+)(?:\s+[^\]]*)?]([\s\S]*?)\[\/\1]/g, "")
    .replace(/\[[a-zA-Z0-9_-]+(?:\s+[^\]]*)?\/]/g, "")
    .replace(/\[\/?\w+[^\]]*]/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/[*_~`#]+/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max) + "...";
}

function extractFirstImage(content: string): string | null {
  const m = content.match(/!\[.*?\]\((.*?)\)/);
  return m ? m[1] : null;
}

export default function HomePage() {
  const { t, locale } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState("NOTEVA");
  const [siteSubtitle, setSiteSubtitle] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const cfg = (window as any).__SITE_CONFIG__;
    if (cfg) {
      setSiteName(cfg.site_name || "NOTEVA");
      setSiteSubtitle(cfg.site_subtitle || cfg.site_description || "");
      document.title = cfg.site_name || "NOTEVA";
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const info = await N.site.getInfo();
        setSiteName(info.name || "NOTEVA");
        setSiteSubtitle(info.subtitle || info.description || "");
        document.title = info.name || "NOTEVA";
        const r = await N.articles.list({ page: currentPage, pageSize: PAGE_SIZE });
        setArticles(r.articles || []);
        setTotalPages(Math.max(1, Math.ceil((r.total || 0) / PAGE_SIZE)));
      } catch { setArticles([]); }
      finally { setLoading(false); }
    };
    load();
  }, [currentPage]);

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete("page"); else params.set("page", String(p));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  };

  const getDateLocale = () => locale === "en" ? "en-US" : locale === "zh-TW" ? "zh-TW" : "zh-CN";
  const getDate = (a: Article) => a.published_at || a.publishedAt || a.created_at || a.createdAt || "";
  const views = (a: Article) => a.view_count ?? a.viewCount ?? 0;
  const likes = (a: Article) => a.like_count ?? a.likeCount ?? 0;
  const cmts = (a: Article) => a.comment_count ?? a.commentCount ?? 0;
  const pinned = (a: Article) => a.is_pinned || a.isPinned;
  const getThumbnail = (a: Article) => a.thumbnail || extractFirstImage(a.content);

  // Search filter
  const filteredArticles = articles.filter((a) =>
    !searchQuery ||
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    a.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="pixel-card p-6 mb-8 text-center animate-fade-in">
            <h1 className="font-pixel text-base sm:text-lg text-pixel-primary mb-2 animate-float">
              ◆ {siteName.toUpperCase()} ◆
            </h1>
            {siteSubtitle && <p className="text-pixel-muted text-sm">{siteSubtitle}</p>}
            <div className="mt-3 flex justify-center gap-1.5">
              {["♥", "◆", "★", "◆", "♥"].map((c, i) => (
                <span key={i} className={`text-xs ${i === 2 ? "text-pixel-accent" : "text-pixel-secondary"}`}>{c}</span>
              ))}
            </div>
          </div>

          {/* Search indicator */}
          {searchQuery && (
            <div className="pixel-card p-3 mb-4 flex items-center justify-between">
              <span className="text-pixel-muted text-sm">
                {t("common.search")}: <span className="text-pixel-primary font-pixel text-[10px]">{searchQuery}</span>
              </span>
              <Link to="/" className="font-pixel text-[8px] text-pixel-info hover:text-pixel-primary">✕ {t("common.clear")}</Link>
            </div>
          )}

          {/* Article list */}
          <div className="space-y-4">
            {loading ? (
              <InlineLoader />
            ) : filteredArticles.length === 0 ? (
              <div className="pixel-card p-8 text-center animate-fade-in">
                <p className="font-pixel text-xs text-pixel-muted mb-2">
                  {searchQuery ? t("common.noData") : t("home.noPostsYet")}
                </p>
                <p className="text-pixel-dark text-sm">{searchQuery ? "" : t("home.noPostsYet")}</p>
              </div>
            ) : (
              filteredArticles.map((article, idx) => {
                const thumb = getThumbnail(article);
                return (
                  <div key={article.id} className="pixel-card p-4 group pixel-animate-in" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {pinned(article) && (
                            <span className="pixel-badge bg-pixel-danger text-white text-[8px]">{t("article.pinned")}</span>
                          )}
                          <Link to={getArticleUrl(article)}
                            className="font-pixel text-[11px] text-pixel-text group-hover:text-pixel-primary leading-relaxed">
                            {">"} {article.title}
                          </Link>
                        </div>

                        {/* Excerpt */}
                        <p className="text-pixel-muted text-sm line-clamp-2 mb-2">
                          {getExcerpt(article.content)}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-pixel text-pixel-dark">
                          <span>{new Date(getDate(article)).toLocaleDateString(getDateLocale())}</span>
                          <span>♥ {likes(article)}</span>
                          <span>◉ {views(article)}</span>
                          <span>◆ {cmts(article)}</span>
                          {article.category && (
                            <Link to={`/categories?c=${article.category.slug}`} className="text-pixel-info hover:text-pixel-primary">
                              [{article.category.name}]
                            </Link>
                          )}
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.slice(0, 4).map((tag) => (
                              <Link key={tag.id} to={`/tags?t=${tag.slug}`}
                                className="pixel-badge bg-pixel-surface text-pixel-muted hover:text-pixel-primary text-[8px]">
                                #{tag.name}
                              </Link>
                            ))}
                            {article.tags.length > 4 && (
                              <span className="pixel-badge bg-pixel-surface text-pixel-dark text-[8px]">+{article.tags.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail */}
                      {thumb && (
                        <Link to={getArticleUrl(article)} className="hidden sm:block shrink-0">
                          <div className="w-28 h-20 border-[3px] border-pixel-border overflow-hidden">
                            <img src={thumb} alt="" className="w-full h-full object-cover" style={{ imageRendering: "auto" }} />
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!loading && !searchQuery && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 animate-fade-in">
              <button className="pixel-btn text-[8px] disabled:opacity-30" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                ◀ {t("pagination.prev")}
              </button>
              <span className="font-pixel text-[10px] text-pixel-muted">
                {t("pagination.page").replace("{current}", String(currentPage)).replace("{total}", String(totalPages))}
              </span>
              <button className="pixel-btn text-[8px] disabled:opacity-30" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                {t("pagination.next")} ▶
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
