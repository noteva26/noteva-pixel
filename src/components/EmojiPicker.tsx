import { useState, useRef, useEffect } from "react";

const EMOJI_GROUPS = [
  { label: "😀", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😋","😛","😜","🤪","😝","🤔","🤐","😐","😏","😒","🙄","😬","😌","😔","😴"] },
  { label: "👍", emojis: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","🤝","🙏","✌️","🤞","🤟","🤘","🤙","👋","🤚","✋","🖖","💪"] },
  { label: "❤️", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","💔","❣️","💕","💞","💓","💗","💖","💘","⭐","🌟","✨","⚡","🔥","💥","❄️","🌈","☀️","🌙","✅","❌","❓","❗","💯"] },
  { label: "🐶", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅","🦉","🐺","🐴","🦄","🐝","🦋"] },
  { label: "🍎", emojis: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🍑","🍍","🥝","🍔","🍟","🍕","🍜","🍣","🍦","🍰","☕","🍺"] },
];

export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)} className="pixel-btn-ghost text-sm" title="Emoji">
        😊
      </button>
      {open && (
        <div className="pixel-dropdown bottom-full mb-1 right-0 w-64 p-0">
          <div className="flex border-b-[2px] border-pixel-border">
            {EMOJI_GROUPS.map((g, i) => (
              <button key={i} onClick={() => setTab(i)}
                className={`flex-1 py-1.5 text-center text-sm ${tab === i ? "bg-pixel-surface" : "hover:bg-pixel-bg"}`}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="p-2 h-32 overflow-y-auto grid grid-cols-8 gap-0.5">
            {EMOJI_GROUPS[tab].emojis.map((e, i) => (
              <button key={i} onClick={() => { onSelect(e); setOpen(false); }}
                className="w-7 h-7 flex items-center justify-center text-sm hover:bg-pixel-surface">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
