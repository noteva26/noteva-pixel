import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getNoteva } from "@/hooks/useNoteva";
import { useTranslation } from "@/lib/i18n";
import { useThemeStore } from "@/lib/theme";
import PluginSlot from "./PluginSlot";

interface NavItem {
  id: number;
  parent_id?: number | null;
  title?: string;
  name?: string;
  nav_type?: string;
  target?: string;
  url?: string;
  open_new_tab?: boolean;
  children?: NavItem[];
}

const BUILTIN_PATHS: Record<string, string> = {
  home: "/", archives: "/archives", categories: "/categories", tags: "/tags",
};

// builtin 导航项的 i18n key 映射
const BUILTIN_I18N: Record<string, string> = {
  home: "nav.home", archives: "nav.archive", categories: "nav.categories", tags: "nav.tags",
};

export default function Header() {
  const { t, locale, setLocale, locales } = useTranslation();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [siteName, setSiteName] = useState("NOTEVA");
  const [siteLogo, setSiteLogo] = useState("");
  const [nav, setNav] = useState<NavItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const info = await N.site.getInfo();
        setSiteName(info.name || "NOTEVA");
        setSiteLogo(info.logo || "");
        const navItems = await N.site.getNav();
        setNav((navItems || []).map(convertNav));
        const u = await N.user.check();
        setUser(u);
        setAuthChecked(true);
      } catch { setAuthChecked(true); }
    };
    load();
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const convertNav = (item: any): NavItem => ({
    id: item.id, parent_id: item.parent_id ?? null,
    title: item.title || item.name, name: item.name || item.title,
    nav_type: item.nav_type, target: item.target || item.url, url: item.url || item.target,
    open_new_tab: item.open_new_tab ?? (item.target === "_blank"),
    children: item.children?.map(convertNav),
  });

  const getNavHref = (item: NavItem): string | null => {
    const url = item.target || item.url || "";
    if (item.nav_type === "builtin" && !url) return null;
    switch (item.nav_type) {
      case "builtin": return BUILTIN_PATHS[url] || "/";
      case "page": return `/${url}`;
      case "external": return url;
      default: return url || "/";
    }
  };

  const isActive = (href: string) => location.pathname === href;

  /** 获取导航项显示文案：优先用户自定义标题，未自定义时走 i18n */
  const getNavTitle = (item: NavItem): string => {
    const customTitle = item.title || item.name || "";
    if (item.nav_type === "builtin") {
      const url = item.target || item.url || "";
      const i18nKey = BUILTIN_I18N[url];
      if (i18nKey && (!customTitle || customTitle === url)) return t(i18nKey);
    }
    return customTitle;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    const N = getNoteva();
    if (!N) return;
    try { await N.user.logout(); setUser(null); setUserOpen(false); } catch {}
  };

  const defaultNav = useMemo(() => [
    { href: "/", label: t("nav.home") },
    { href: "/archives", label: t("nav.archive") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/tags", label: t("nav.tags") },
  ], [t]);

  const renderNavLink = (item: NavItem) => {
    const href = getNavHref(item);
    if (!href) return null;
    const active = isActive(href);
    if (item.nav_type === "external") {
      return (
        <a key={item.id} href={href} target={item.open_new_tab ? "_blank" : "_self"} rel={item.open_new_tab ? "noopener noreferrer" : undefined}
          className={`font-pixel text-[10px] px-3 py-1.5 border-2 ${active ? "bg-pixel-primary border-pixel-primary text-white" : "border-transparent text-pixel-muted hover:bg-pixel-surface hover:border-pixel-border hover:text-pixel-text"}`}>
          {getNavTitle(item)}
        </a>
      );
    }
    return (
      <Link key={item.id} to={href}
        className={`font-pixel text-[10px] px-3 py-1.5 border-2 ${active ? "bg-pixel-primary border-pixel-primary text-white" : "border-transparent text-pixel-muted hover:bg-pixel-surface hover:border-pixel-border hover:text-pixel-text"}`}>
        {getNavTitle(item)}
      </Link>
    );
  };

  // Nav item with children (dropdown)
  const NavWithChildren = ({ item }: { item: NavItem }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
      <div ref={ref} className="relative">
        <button onClick={() => setOpen(!open)}
          className="font-pixel text-[10px] px-3 py-1.5 border-2 border-transparent text-pixel-muted hover:bg-pixel-surface hover:border-pixel-border hover:text-pixel-text flex items-center gap-1">
          {getNavTitle(item)} <span className="text-[8px]">▼</span>
        </button>
        {open && (
          <div className="pixel-dropdown top-full left-0 mt-1">
            {item.children!.map((child) => {
              const href = getNavHref(child);
              if (!href) return null;
              if (child.nav_type === "external") {
                return <a key={child.id} href={href} target={child.open_new_tab ? "_blank" : "_self"} className="pixel-dropdown-item font-pixel text-[10px]" onClick={() => setOpen(false)}>{getNavTitle(child)}</a>;
              }
              return <Link key={child.id} to={href} className="pixel-dropdown-item font-pixel text-[10px]" onClick={() => setOpen(false)}>{getNavTitle(child)}</Link>;
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-pixel-surface border-b-[3px] border-pixel-border">
      <PluginSlot name="header_before" />
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="w-7 h-7 border-2 border-pixel-border" style={{ imageRendering: "pixelated" }} />
          ) : (
            <span className="text-pixel-accent text-lg animate-float">◆</span>
          )}
          <span className="font-pixel text-[11px] text-pixel-primary group-hover:text-pixel-secondary hidden sm:inline">
            {siteName.toUpperCase()}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {nav.length > 0
            ? nav.filter(i => !i.parent_id).map((item) =>
                item.children && item.children.length > 0
                  ? <NavWithChildren key={item.id} item={item} />
                  : renderNavLink(item)
              )
            : defaultNav.map((item) => (
                <Link key={item.href} to={item.href}
                  className={`font-pixel text-[10px] px-3 py-1.5 border-2 ${isActive(item.href) ? "bg-pixel-primary border-pixel-primary text-white" : "border-transparent text-pixel-muted hover:bg-pixel-surface hover:border-pixel-border hover:text-pixel-text"}`}>
                  {item.label}
                </Link>
              ))
          }
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Search toggle */}
          <div className="relative" ref={searchRef as any}>
            <button onClick={() => setSearchOpen(!searchOpen)} className="pixel-btn-ghost text-[10px]" title={t("common.search")}>
              ⌕
            </button>
            {searchOpen && (
              <form onSubmit={handleSearch} className="pixel-dropdown right-0 top-full mt-1 p-2 min-w-[240px]">
                <div className="flex gap-1">
                  <input
                    type="text" autoFocus
                    className="pixel-input flex-1 text-xs py-1"
                    placeholder={t("common.search") + "..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="pixel-btn text-[8px] py-1 px-2">GO</button>
                </div>
              </form>
            )}
          </div>

          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(!langOpen)} className="pixel-btn-ghost text-[10px]" title="Language">
              {locale === "zh-CN" ? "中" : locale === "zh-TW" ? "繁" : "EN"}
            </button>
            {langOpen && (
              <div className="pixel-dropdown right-0 top-full mt-1">
                {locales.map((loc) => (
                  <button key={loc.code}
                    onClick={() => { setLocale(loc.code); setLangOpen(false); }}
                    className={`pixel-dropdown-item font-pixel text-[10px] ${locale === loc.code ? "text-pixel-primary bg-pixel-surface" : ""}`}>
                    {locale === loc.code ? "▸ " : "  "}{loc.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="pixel-btn-ghost text-[10px]" title={theme === "dark" ? t("theme.light") : t("theme.dark")}>
            {theme === "dark" ? "☀" : "☾"}
          </button>

          {/* User menu */}
          {authChecked && user?.role === "admin" && (
            <div className="relative" ref={userRef}>
              <button onClick={() => setUserOpen(!userOpen)} className="pixel-btn-ghost flex items-center gap-1.5">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-5 h-5 border-2 border-pixel-border" />
                ) : (
                  <span className="w-5 h-5 bg-pixel-primary text-white text-[8px] font-pixel flex items-center justify-center border-2 border-pixel-border">
                    {(user.display_name || user.username)?.[0]?.toUpperCase()}
                  </span>
                )}
                <span className="font-pixel text-[8px] text-pixel-muted hidden md:inline">
                  {user.display_name || user.username}
                </span>
              </button>
              {userOpen && (
                <div className="pixel-dropdown right-0 top-full mt-1">
                  <a href="/manage" className="pixel-dropdown-item font-pixel text-[10px]">
                    ⚙ {t("nav.manage")}
                  </a>
                  <button onClick={handleLogout} className="pixel-dropdown-item font-pixel text-[10px] text-pixel-danger">
                    ✕ {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden pixel-btn-ghost text-[10px]">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="lg:hidden border-t-[3px] border-dashed border-pixel-border bg-pixel-surface animate-slide-up">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 py-2 border-b border-pixel-dark">
            <div className="flex gap-1">
              <input type="text" className="pixel-input flex-1 text-xs py-1" placeholder={t("common.search") + "..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" className="pixel-btn text-[8px] py-1 px-2">GO</button>
            </div>
          </form>
          {nav.length > 0
            ? nav.filter(i => !i.parent_id).map((item) => {
                const href = getNavHref(item);
                if (item.children && item.children.length > 0) {
                  return (
                    <div key={item.id}>
                      {href && (
                        <Link to={href} className="block font-pixel text-[10px] px-6 py-3 border-b border-pixel-dark text-pixel-muted hover:bg-pixel-bg hover:text-pixel-text" onClick={() => setMenuOpen(false)}>
                          ▸ {getNavTitle(item)}
                        </Link>
                      )}
                      {item.children.map((child) => {
                        const ch = getNavHref(child);
                        if (!ch) return null;
                        return (
                          <Link key={child.id} to={ch} className="block font-pixel text-[10px] px-10 py-2 border-b border-pixel-dark text-pixel-dark hover:bg-pixel-bg hover:text-pixel-text" onClick={() => setMenuOpen(false)}>
                            └ {getNavTitle(child)}
                          </Link>
                        );
                      })}
                    </div>
                  );
                }
                if (!href) return null;
                return (
                  <Link key={item.id} to={href}
                    className={`block font-pixel text-[10px] px-6 py-3 border-b border-pixel-dark ${isActive(href) ? "bg-pixel-primary text-white" : "text-pixel-muted hover:bg-pixel-bg hover:text-pixel-text"}`}
                    onClick={() => setMenuOpen(false)}>
                    ▸ {getNavTitle(item)}
                  </Link>
                );
              })
            : defaultNav.map((item) => (
                <Link key={item.href} to={item.href}
                  className={`block font-pixel text-[10px] px-6 py-3 border-b border-pixel-dark ${isActive(item.href) ? "bg-pixel-primary text-white" : "text-pixel-muted hover:bg-pixel-bg hover:text-pixel-text"}`}
                  onClick={() => setMenuOpen(false)}>
                  ▸ {item.label}
                </Link>
              ))
          }
        </nav>
      )}
      <PluginSlot name="header_after" />
    </header>
  );
}
