import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("pixel-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (t) => {
    set({ theme: t });
    localStorage.setItem("pixel-theme", t);
    applyTheme(t);
  },
  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));

// Init on load
if (typeof window !== "undefined") {
  const init = getInitial();
  useThemeStore.setState({ theme: init });
  applyTheme(init);
}
