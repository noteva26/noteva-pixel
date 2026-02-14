import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import PluginSlot from "@/components/PluginSlot";
import { InlineLoader } from "@/components/PixelLoader";
import { useTranslation } from "@/lib/i18n";
import { getNoteva } from "@/hooks/useNoteva";

interface Article {
  id: number; slug: string; title: string; content: string;
  content_html?: string; html?: string;
  published_at?: string; publishedAt?: string; created_at?: string; createdAt?: string;
  view_count?: number; viewCount?: number;
  like_count?: number; likeCount?: number;
  comment_count?: number; commentCount?: number;
  category?: { id: number; name: string; slug: string };
  tags?: { id: number; name: string; slug: string }[];
}

export default function PostPage() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const slug = location.pathname.replace(/^\/posts\//, "").replace(/\/$/, "");

  const [article, setArticle] = useState<Article | null>(null);
  const [siteName, setSiteName] = useState("Noteva");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    const loadSite = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(loadSite, 50); return; }
      try { const info = await N.site.getInfo(); setSiteName(info.name || "Noteva"); } catch {}
    };
    loadSite();
  }, []);

  useEffect(() => {
    if (article) document.title = `${article.title} - ${siteName}`;
  }, [article, siteName]);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const data = await N.articles.get(slug);
        setArticle(data);
        setLikeCount((data as any).like_count ?? data.likeCount ?? 0);
        try { const lr = await N.api.get(`/like/check?target_type=article&target_id=${data.id}`); setIsLiked(lr.liked); } catch {}
        try { await N.api.post(`/view/${data.id}`); } catch {}
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const handleLike = async () => {
    if (!article) return;
    const N = getNoteva();
    if (!N) return;
    try {
      const r = await N.api.post("/like", { target_type: "article", target_id: article.id });
      setIsLiked(r.liked); setLikeCount(r.like_count);
      N.ui.toast(r.liked ? t("comment.liked") : t("comment.unliked"), "success");
    } catch { const N2 = getNoteva(); N2?.ui.toast(t("comment.likeFailed"), "error"); }
  };

  const getDateLocale = () => locale === "en" ? "en-US" : locale === "zh-TW" ? "zh-TW" : "zh-CN";
  const getDate = (a: Article) => a.published_at || a.publishedAt || a.created_at || a.createdAt || "";
  const getHtml = (a: Article) => a.content_html || a.html || "";
  const viewCount = (a: Article) => (a.view_count ?? a.viewCount ?? 0) + 1;
  const commentCount = (a: Article) => a.comment_count ?? a.commentCount ?? 0;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full"><InlineLoader /></main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
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
            <h1 className="font-pixel text-sm sm:text-base text-pixel-primary leading-relaxed mb-3">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-pixel text-[10px] text-pixel-dark">
              <span>{new Date(getDate(article)).toLocaleDateString(getDateLocale(), { year: "numeric", month: "long", day: "numeric" })}</span>
              {article.category && (
                <Link to={`/categories?c=${article.category.slug}`} className="text-pixel-info hover:text-pixel-primary">
                  [{article.category.name}]
                </Link>
              )}
              <span>◉ {viewCount(article)}</span>
              <span>◆ {commentCount(article)}</span>
            </div>
          </header>

          <div className="pixel-card p-5 md:p-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <PluginSlot name="article_content_top" />
            <div className="pixel-prose" dangerouslySetInnerHTML={{ __html: getHtml(article) }} />
            <PluginSlot name="article_content_bottom" />
          </div>

          <PluginSlot name="article_after_content" className="my-4" />

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-wrap gap-1">
              {article.tags?.map((tag) => (
                <Link key={tag.id} to={`/tags?t=${tag.slug}`}
                  className="pixel-badge bg-pixel-surface text-pixel-muted hover:text-pixel-primary text-[8px]">
                  #{tag.name}
                </Link>
              ))}
            </div>
            <button className={`pixel-btn text-[8px] ${isLiked ? "bg-pixel-danger" : "bg-pixel-dark"}`} onClick={handleLike}>
              {isLiked ? "♥" : "♡"} {likeCount}
            </button>
          </div>

          <Comments articleId={article.id} />
        </article>
      </main>
      <Footer />
    </div>
  );
}
