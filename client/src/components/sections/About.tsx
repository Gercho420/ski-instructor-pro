import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function About() {
  const { t, lang } = useI18n();
  const { data: textsConfig } = trpc.config.getByCategory.useQuery({ category: `texts_${lang}` });

  const aboutText = useMemo(() => {
    // Blindaje estricto: aseguramos que textsConfig sea un array antes de usar .find()
    const configArray = Array.isArray(textsConfig)
      ? textsConfig
      : Array.isArray((textsConfig as any)?.items)
      ? (textsConfig as any).items
      : [];

    if (configArray.length === 0) return t("about.text");
    const entry = configArray.find((c: any) => c.configKey === "about_text");
    return entry?.configValue || t("about.text");
  }, [textsConfig, t, lang]);

  return (
    <section className="relative py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
          {/* Label */}
          <div className="vertical-line">
            <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)]">
              {t("about.title")}
            </p>
          </div>

          {/* Content */}
          <div className="corner-bracket p-6 md:p-8">
            <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-[oklch(0.35_0.05_295)] tracking-wide">
              {aboutText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
