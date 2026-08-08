import { useI18n } from "@/i18n/I18nContext";
import { translations } from "@/i18n/translations";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_DEFS, getServiceContent } from "@shared/const";

function toConfigMap(rows: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  if (Array.isArray(rows)) {
    rows.forEach((c: any) => {
      map[c.configKey] = c.configValue;
    });
  }
  return map;
}

export default function Services() {
  const { t, lang } = useI18n();
  // Config específica del idioma actual (lo que carga el admin por pestaña
  // de idioma). Fallback a la categoría legacy "services" (pre-fix, sin
  // idioma) para no perder contenido cargado antes de este cambio.
  const { data: servicesData, isLoading } = trpc.config.getByCategory.useQuery({
    category: `services_${lang}`,
  });
  const { data: legacyServicesData } = trpc.config.getByCategory.useQuery({ category: "services" });

  const configMap = toConfigMap(servicesData);
  const legacyConfigMap = toConfigMap(legacyServicesData);
  // A diferencia de t(), esto devuelve undefined si falta la key en vez del
  // string de la key — es lo que necesita getServiceContent para su cadena
  // de fallback (DB por idioma > DB legacy > traducción > default en código).
  const translate = (key: string) => translations[lang]?.[key] ?? translations.es[key];

  const services = SERVICE_DEFS.map((s) => {
    const content = getServiceContent(s, configMap, legacyConfigMap, translate);
    return { id: s.key, ...content };
  });

  return (
    <section id="services" className="relative py-24 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-sans font-light tracking-[0.3em] uppercase text-[oklch(0.50_0.04_295)] mb-4">
            {t("services.subtitle") || "Servicios"}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.30_0.05_295)]">
            {t("services.title") || "Clases y Experiencias"}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.06_295/0.4)] to-transparent mx-auto mt-6" />
        </div>

        {/* Services grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="corner-bracket p-8 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)] flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-serif text-2xl text-[oklch(0.30_0.05_295)] mb-3">{service.title}</h3>
                  <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>
                {service.price && (
                  <span className="text-xs font-sans tracking-wider uppercase text-[oklch(0.55_0.08_295)] font-medium">{service.price}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
