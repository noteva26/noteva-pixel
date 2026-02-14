import { useState, useEffect } from "react";
import { getNoteva } from "@/hooks/useNoteva";
import { useTranslation } from "@/lib/i18n";
import PluginSlot from "./PluginSlot";
import EmojiPicker from "./EmojiPicker";
import { InlineLoader } from "./PixelLoader";

interface Comment {
  id: number;
  article_id: number;
  user_id: number | null;
  parent_id: number | null;
  nickname: string | null;
  email: string | null;
  content: string;
  status: string;
  created_at: string;
  avatar_url: string;
  like_count: number;
  is_liked: boolean;
  is_author?: boolean;
  replies?: Comment[];
}

export default function Comments({ articleId }: { articleId: number }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [form, setForm] = useState({ nickname: "", email: "", content: "" });

  useEffect(() => {
    const check = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(check, 50); return; }
      try {
        const u = await N.user.check();
        setUser(u); setIsAdmin(u?.role === "admin");
      } catch { setUser(null); }
    };
    check();
  }, []);

  useEffect(() => { loadComments(); }, [articleId]);

  const loadComments = async () => {
    const N = getNoteva();
    if (!N) { setTimeout(loadComments, 50); return; }
    try {
      const r = await N.api.get(`/comments/${articleId}`);
      setComments(r.comments || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (parentId?: number) => {
    if (!form.content.trim()) { alert(t("comment.contentRequired")); return; }
    if (!isAdmin && !form.nickname.trim()) { alert(t("comment.nicknameRequired")); return; }
    const N = getNoteva();
    if (!N) return;
    setSubmitting(true);
    try {
      const input: any = { article_id: articleId, content: form.content, parent_id: parentId };
      if (!isAdmin) { input.nickname = form.nickname; input.email = form.email; }
      await N.api.post("/comments", input);
      N.ui.toast(t("comment.submitSuccess"), "success");
      setForm({ nickname: "", email: "", content: "" });
      setReplyTo(null);
      loadComments();
      N.hooks.trigger("comment_after_create", { articleId, parentId });
      N.events.emit("comment:create", { articleId, parentId });
    } catch (err: any) {
      N.ui.toast(err?.data?.error || t("comment.submitFailed"), "error");
    } finally { setSubmitting(false); }
  };

  const handleLike = async (commentId: number) => {
    const N = getNoteva();
    if (!N) return;
    try {
      const r = await N.api.post("/like", { target_type: "comment", target_id: commentId });
      N.ui.toast(r.liked ? t("comment.liked") : t("comment.unliked"), "success");
      loadComments();
    } catch { const N2 = getNoteva(); N2?.ui.toast(t("comment.likeFailed"), "error"); }
  };

  const CommentForm = ({ parentId, onCancel }: { parentId?: number; onCancel?: () => void }) => (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          className="pixel-input w-full text-sm"
          rows={parentId ? 2 : 3}
          placeholder={parentId ? t("comment.replyPlaceholder") : t("comment.placeholder")}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
        />
        <div className="absolute bottom-1 right-1">
          <EmojiPicker onSelect={(emoji) => setForm((f) => ({ ...f, content: f.content + emoji }))} />
        </div>
      </div>
      {!isAdmin && (
        <div className="flex gap-2">
          <input className="pixel-input flex-1 text-xs" placeholder={t("comment.nickname") + " *"} value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} />
          <input className="pixel-input flex-1 text-xs" placeholder={t("comment.emailOptional")} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
      )}
      {isAdmin && <p className="text-xs text-pixel-muted">{t("comment.postingAsAdmin", { name: user?.display_name || user?.username })}</p>}
      <div className="flex gap-2">
        <button className="pixel-btn text-[8px]" onClick={() => handleSubmit(parentId)} disabled={submitting}>
          {submitting ? <><span className="pixel-spinner !w-3 !h-3 !border-2 mr-1" /> {t("common.sending")}</> : `▶ ${t("comment.submit")}`}
        </button>
        {onCancel && (
          <button className="pixel-btn-outline text-[8px]" onClick={onCancel}>{t("common.cancel")}</button>
        )}
      </div>
    </div>
  );

  const renderComment = (c: Comment, isReply = false) => (
    <div key={c.id} className={`${isReply ? "ml-6 mt-3" : "mt-4"} animate-fade-in`}>
      <div className="flex gap-3">
        <img
          src={c.avatar_url || "https://www.gravatar.com/avatar/?d=retro&s=40"}
          alt=""
          className="w-8 h-8 border-2 border-pixel-border shrink-0"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-pixel text-[10px] text-pixel-primary">{c.nickname || "???"}</span>
            {c.is_author && <span className="pixel-badge bg-pixel-accent text-white text-[8px]">{t("comment.authorTag")}</span>}
            <span className="text-pixel-dark text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-pixel-text mt-1 break-words">{c.content}</p>
          <div className="flex items-center gap-4 mt-1.5">
            <button onClick={() => handleLike(c.id)}
              className={`font-pixel text-[8px] ${c.is_liked ? "text-pixel-danger" : "text-pixel-dark"} hover:text-pixel-danger`}>
              {c.is_liked ? "♥" : "♡"} {c.like_count}
            </button>
            <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
              className="font-pixel text-[8px] text-pixel-dark hover:text-pixel-info">
              {t("comment.reply")}
            </button>
          </div>
          {replyTo === c.id && (
            <div className="mt-2">
              <CommentForm parentId={c.id} onCancel={() => setReplyTo(null)} />
            </div>
          )}
        </div>
      </div>
      {c.replies?.map((r) => renderComment(r, true))}
    </div>
  );

  return (
    <div className="pixel-card p-4 md:p-6 mt-8">
      <h3 className="font-pixel text-xs text-pixel-primary mb-4">
        ◆ {t("comment.title")} ({comments.length})
      </h3>

      <PluginSlot name="comment_form_before" />
      <CommentForm />
      <PluginSlot name="comment_form_after" />

      <div className="pixel-divider" />

      {loading ? (
        <InlineLoader />
      ) : comments.length === 0 ? (
        <p className="text-pixel-dark text-sm py-4">{t("comment.noComments")}</p>
      ) : (
        comments.map((c) => renderComment(c))
      )}
    </div>
  );
}
