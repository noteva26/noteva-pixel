import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { getNoteva } from "@/hooks/useNoteva";

interface ResolvedCategory {
  id: string;
  label: string;
  icon: string;
  emojis: Record<string, string>;
}

export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<ResolvedCategory[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load categories from SDK when picker opens
  useEffect(() => {
    if (!open) return;
    const load = () => {
      const N = getNoteva();
      if (N?.emoji) {
        setCategories(N.emoji.getCategories());
      } else {
        setTimeout(load, 50);
      }
    };
    load();
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Parse Twemoji via SDK
  useEffect(() => {
    if (!open) return;
    const N = getNoteva();
    if (gridRef.current && N?.emoji) {
      N.emoji.parse(gridRef.current, { attributes: () => ({ style: "width:18px;height:18px" }) });
    }
  }, [open, tab, search]);

  useEffect(() => {
    if (!open) return;
    const N = getNoteva();
    if (sidebarRef.current && N?.emoji) {
      N.emoji.parse(sidebarRef.current, { attributes: () => ({ style: "width:16px;height:16px" }) });
    }
  }, [open]);

  // Search
  const searchResults = useMemo(() => {
    if (!search.trim() || categories.length === 0) return null;
    const q = search.toLowerCase();
    const results: { code: string; emoji: string }[] = [];
    for (const cat of categories) {
      for (const [code, emoji] of Object.entries(cat.emojis)) {
        if (code.includes(q)) results.push({ code, emoji });
        if (results.length >= 64) break;
      }
      if (results.length >= 64) break;
    }
    return results;
  }, [search, categories]);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)} className="pixel-btn-ghost text-sm" title="Emoji">
        😊
      </button>
      {open && (
        <div className="pixel-dropdown bottom-full mb-1 right-0 w-72 p-0">
          {categories.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-pixel-muted">Loading...</div>
          ) : (
            <>
              {/* Search */}
              <div className="px-1.5 pt-1.5 pb-1">
                <input
                  type="text"
                  placeholder="🔍"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pixel-input w-full text-xs py-1"
                  autoFocus
                />
              </div>
              <div className="flex" style={{ height: 160 }}>
                {/* Category sidebar */}
                <div ref={sidebarRef} className="flex flex-col w-8 border-r-[2px] border-pixel-border py-0.5 items-center overflow-y-auto gap-0.5">
                  {categories.map((cat, i) => (
                    <button key={cat.id} onClick={() => { setTab(i); setSearch(""); }}
                      title={cat.label}
                      className={`w-7 h-7 flex items-center justify-center text-sm ${tab === i && !search ? "bg-pixel-surface" : "hover:bg-pixel-bg"}`}>
                      {cat.icon}
                    </button>
                  ))}
                </div>
                {/* Emoji grid */}
                <div ref={gridRef} className="flex-1 overflow-y-auto px-1.5 py-1">
                  {searchResults ? (
                    <>
                      <div className="grid grid-cols-8 gap-0.5">
                        {searchResults.map(({ code, emoji }) => (
                          <button key={code} onClick={() => { onSelect(emoji); setOpen(false); }}
                            title={`:${code}:`}
                            className="w-7 h-7 flex items-center justify-center text-sm hover:bg-pixel-surface">
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {searchResults.length === 0 && (
                        <div className="text-xs text-pixel-muted text-center py-6">😶</div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] text-pixel-muted px-0.5 mb-0.5">{categories[tab]?.label}</div>
                      <div className="grid grid-cols-8 gap-0.5">
                        {categories[tab] && Object.entries(categories[tab].emojis).map(([code, emoji]) => (
                          <button key={code} onClick={() => { onSelect(emoji); setOpen(false); }}
                            title={`:${code}:`}
                            className="w-7 h-7 flex items-center justify-center text-sm hover:bg-pixel-surface">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
