export const COOKIE_NAME = "session";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const UNAUTHED_ERR_MSG = "You must be logged in to access this resource.";
export const NOT_ADMIN_ERR_MSG = "You must be an admin to access this resource.";

// Fixed set of pricing/services cards.
//
// Contenido por idioma: cada servicio tiene 3 fuentes posibles, en orden de
// prioridad (ver getServiceContent en este mismo archivo):
//   1. Config de admin específica del idioma: categoría `services_<lang>`,
//      claves service_<key>_title / _desc / _price.
//   2. Config legacy (pre-fix de traducción): categoría "services", mismas
//      claves sin sufijo de idioma. Se lee solo como fallback para no perder
//      contenido cargado antes de que existieran las categorías por idioma.
//   3. Traducciones por defecto en client/src/i18n/translations.ts, bajo
//      `services.<i18nKey>.title` / `.desc` / `.price`.
//
// i18nKey mapea la key interna (plural, "beginners") a la key usada en
// translations.ts (singular, "beginner") — son distintas por historia.
export const SERVICE_DEFS = [
  {
    key: "beginners",
    i18nKey: "beginner",
    label: "PRINCIPIANTES",
    defaultTitle: "Principiantes",
    defaultDesc: "Aprende los fundamentos del ski en un entorno seguro y controlado.",
  },
  {
    key: "intermediate",
    i18nKey: "intermediate",
    label: "INTERMEDIO",
    defaultTitle: "Intermedio",
    defaultDesc: "Perfecciona tu técnica y gana confianza en pista.",
  },
  {
    key: "advanced",
    i18nKey: "advanced",
    label: "AVANZADO",
    defaultTitle: "Avanzado",
    defaultDesc: "Domina pistas negras, fuera de pista y técnica.",
  },
  {
    key: "private",
    i18nKey: "private",
    label: "CLASES PRIVADAS",
    defaultTitle: "Clases Privadas",
    defaultDesc: "Atención totalmente personalizada 1 a 1. Adaptada a tus objetivos.",
  },
  {
    key: "group",
    i18nKey: "group",
    label: "CLASES GRUPALES",
    defaultTitle: "Clases Grupales",
    defaultDesc: "Aprende en grupo con un máximo de 6 personas.",
  },
  {
    key: "kids",
    i18nKey: "kids",
    label: "CLASES PARA NIÑOS",
    defaultTitle: "Clases para Niños",
    defaultDesc: "Clases divertidas y seguras pensadas para los más chicos.",
  },
] as const;

// Resuelve título/descripción/precio de un servicio para un idioma dado,
// aplicando la prioridad documentada arriba. `langConfigMap` son las config
// rows de la categoría `services_<lang>`; `legacyConfigMap` son las de la
// categoría legacy "services" (puede venir vacío/undefined).
export function getServiceContent(
  s: (typeof SERVICE_DEFS)[number],
  langConfigMap: Record<string, string>,
  legacyConfigMap: Record<string, string> | undefined,
  translate: (key: string) => string | undefined
) {
  const pick = (field: "title" | "desc" | "price", fallback: string) => {
    const perLangKey = `service_${s.key}_${field}`;
    if (langConfigMap[perLangKey]) return langConfigMap[perLangKey];
    if (legacyConfigMap?.[perLangKey]) return legacyConfigMap[perLangKey];
    return translate(`services.${s.i18nKey}.${field}`) || fallback;
  };
  return {
    title: pick("title", s.defaultTitle),
    description: pick("desc", s.defaultDesc),
    price: pick("price", ""),
  };
}
