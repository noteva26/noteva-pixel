import { useEffect, useState } from "react";
import { getNoteva } from "@/hooks/useNoteva";
import { useTranslation } from "@/lib/i18n";
import PluginSlot from "./PluginSlot";

export default function Footer() {
  const { t } = useTranslation();
  const [footer, setFooter] = useState("");
  const [siteName, setSiteName] = useState("Noteva");

  useEffect(() => {
    const cfg = (window as any).__SITE_CONFIG__;
    if (cfg) {
      setFooter(cfg.site_footer || "");
      setSiteName(cfg.site_name || "Noteva");
    }
    const load = async () => {
      const N = getNoteva();
      if (!N) { setTimeout(load, 50); return; }
      try {
        const info = await N.site.getInfo();
        setFooter(info.footer || "");
        setSiteName(info.name || "Noteva");
      } catch {}
    };
    load();
  }, []);

  const defaultFooter = `© ${new Date().getFullYear()} ${siteName}. ${t("footer.allRightsReserved")}`;

  return (
    <footer className="border-t-[3px] border-pixel-border bg-pixel-surface mt-auto">
      <PluginSlot name="footer_before" />
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        {footer ? (
          <div className="text-pixel-muted text-xs" dangerouslySetInnerHTML={{ __html: footer }} />
        ) : (
          <p className="text-pixel-muted text-xs">{defaultFooter}</p>
        )}
      </div>
      <PluginSlot name="footer_after" />
    </footer>
  );
}
