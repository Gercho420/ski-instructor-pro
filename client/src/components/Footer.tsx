import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useMemo } from "react";
import ShareButtons from "@/components/ShareButtons";

export default function Footer() {
  const { t, lang } = useI18n();
  const [location] = useLocation();
  const { data: textsConfig } = trpc.config.getByCategory.useQuery({ category: `texts_${lang}` });

  const footerTagline = useMemo(() => {
    if (!textsConfig) return t("footer.tagline");
    const map: Record<string, string> = {};
    textsConfig.forEach(c => { map[c.configKey] = c.configValue; });
    return map.footer_tagline || t("footer.tagline");
  }, [textsConfig, t, lang]);

  if (location === "/admin") return null;

  return (
    <footer className="relative mt-20 border-t border-[oklch(0.90_0.02_300/0.5)] py-12 px-4">
      <div className="container mx-auto max-w-5xl flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-serif text-3xl tracking-wide text-[oklch(0.35_0.05_295)]">
            Ski<span className="italic">Pro</span>
          </span>
          <p className="text-sm font-sans font-light tracking-wide text-[oklch(0.50_0.03_295)] max-w-md">
            {footerTagline}
          </p>
        </div>

        {/* Share buttons */}
        <ShareButtons />

        <div className="flex items-center gap-6 text-xs font-sans font-light tracking-widest uppercase text-[oklch(0.50_0.03_295)]">
          <a href={`/${lang}/#services`} className="hover:text-[oklch(0.55_0.08_295)] transition-colors">{t("nav.services")}</a>
          <a href={`/${lang}/#gallery`} className="hover:text-[oklch(0.55_0.08_295)] transition-colors">{t("nav.gallery")}</a>
          <a href={`/${lang}/#reviews`} className="hover:text-[oklch(0.55_0.08_295)] transition-colors">{t("nav.reviews")}</a>
          <a href={`/${lang}/#contact`} className="hover:text-[oklch(0.55_0.08_295)] transition-colors">{t("nav.contact")}</a>
        </div>

        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.06_295/0.3)] to-transparent" />

        <p className="text-xs font-sans font-light tracking-wide text-[oklch(0.50_0.03_295)]">
          © {new Date().getFullYear()} SkiPro. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
