import { useI18n } from "@/i18n/I18nContext";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

type ServiceItem = {
  id?: string | number;
  title?: string;
  description?: string;
  price?: string;
  features?: string[];
};

export default function Services() {
  const { t } = useI18n();
  const { data: servicesData, isLoading } = trpc.config.getByCategory.useQuery({ category: "services" });

  const services = Array.isArray(servicesData)
    ? servicesData
    : Array.isArray((servicesData as any)?.items)
    ? (servicesData as any).items
    : [];

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
        ) : services.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="corner-bracket p-8 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[oklch(0.30_0.05_295)] mb-3">Clases Particulares</h3>
                <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed mb-6">
                  Instrucción personalizada adaptada a tu nivel, desde principiantes hasta avanzados perfeccionando técnica en pista y fuera de pista.
                </p>
              </div>
              <span className="text-xs font-sans tracking-wider uppercase text-[oklch(0.55_0.08_295)] font-medium">Personalizado</span>
            </div>

            <div className="corner-bracket p-8 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[oklch(0.30_0.05_295)] mb-3">Clínicas en Grupo</h3>
                <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed mb-6">
                  Mejora tu confianza y estilo compartiendo la experiencia en grupos reducidos con objetivos dinámicos y divertidos.
                </p>
              </div>
              <span className="text-xs font-sans tracking-wider uppercase text-[oklch(0.55_0.08_295)] font-medium">Divertido</span>
            </div>

            <div className="corner-bracket p-8 bg-[oklch(0.97_0.012_300/0.5)] backdrop-blur-sm rounded-lg border border-[oklch(0.90_0.02_300/0.3)] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[oklch(0.30_0.05_295)] mb-3">Guía Off-Piste</h3>
                <p className="text-sm font-sans font-light text-[oklch(0.45_0.04_295)] leading-relaxed mb-6">
                  Descubre los mejores rincones de nieve virgen priorizando la seguridad, lectura del terreno y técnica en powder.
                </p>
              </div>
              <span className="text-xs font-sans tracking-wider uppercase text-[oklch(0.55_0.08_295)] font-medium">Aventura</span>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service: ServiceItem, index: number) => (
              <div
                key={service.id || index}
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
