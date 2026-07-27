import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { MessageCircle } from "lucide-react";

export default function Hero() {
  const { t, lang } = useI18n();
  const { data: textsConfig } = trpc.config.getByCategory.useQuery({ category: `texts_${lang}` });
  const { data: contactConfig } = trpc.config.getByCategory.useQuery({ category: "contact" });

  const waNumber = useMemo(() => {
    if (!contactConfig) return "34600000000";
    const entry = contactConfig.find(c => c.configKey === "whatsapp");
    const number = entry?.configValue || "+34 600 000 000";
    return number.replace(/[^0-9]/g, "");
  }, [contactConfig]);

  const heroTexts = useMemo(() => {
    if (!textsConfig) return {
      tagline: t("hero.tagline"),
      title: t("hero.title"),
      subtitle: t("hero.subtitle"),
    };
    const map: Record<string, string> = {};
    textsConfig.forEach(c => { map[c.configKey] = c.configValue; });
    return {
      tagline: map.hero_tagline || t("hero.tagline"),
      title: map.hero_title || t("hero.title"),
      subtitle: map.hero_subtitle || t("hero.subtitle"),
    };
  }, [textsConfig, t, lang]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/manus-storage/hero-ski_c1cd739e.jpg"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.98_0.015_300/0.5)] via-[oklch(0.98_0.015_300/0.3)] to-[oklch(0.98_0.015_300/0.8)]" />
      </div>
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.85_0.06_295/0.15)] blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.88_0.04_350/0.12)] blur-3xl animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[oklch(0.88_0.05_160/0.10)] blur-3xl animate-pulse" style={{ animationDuration: "12s", animationDelay: "4s" }} />
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl text-center px-4 relative z-10">
        <div className="fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)] mb-6">
            {heroTexts.tagline}
          </p>
        </div>

        <h1 className="fade-in-up font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-tight text-[oklch(0.30_0.05_295)] mb-8 max-w-3xl mx-auto" style={{ animationDelay: "0.3s" }}>
          {heroTexts.title}
        </h1>

        <p className="fade-in-up text-lg md:text-xl font-sans font-light tracking-wide text-[oklch(0.45_0.04_295)] max-w-2xl mx-auto mb-12 leading-relaxed" style={{ animationDelay: "0.5s" }}>
          {heroTexts.subtitle}
        </p>

        <div className="fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "0.7s" }}>
          <Button
            asChild
            className="rounded-full bg-[oklch(0.55_0.08_295)] hover:bg-[oklch(0.50_0.09_295)] text-[oklch(0.98_0.01_300)] font-sans text-sm tracking-wider px-8 py-3 transition-all duration-200 active:scale-95 shadow-lg shadow-[oklch(0.55_0.08_295/0.2)]"
          >
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("hero.cta")}
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full font-sans text-sm tracking-wider px-8 py-3 text-[oklch(0.40_0.04_295)] hover:text-[oklch(0.55_0.08_295)] hover:bg-transparent border border-[oklch(0.70_0.04_295/0.3)] transition-all duration-200"
          >
            <a href="/#services">{t("hero.ctaSecondary")}</a>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-6 h-6 text-[oklch(0.50_0.04_295/0.5)] animate-bounce" style={{ animationDuration: "2s" }} />
      </div>
    </section>
  );
}
