export const COOKIE_NAME = "session";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const UNAUTHED_ERR_MSG = "You must be logged in to access this resource.";
export const NOT_ADMIN_ERR_MSG = "You must be an admin to access this resource.";

// Fixed set of pricing/services cards. Each entry maps to three config rows
// in the "services" category: service_<key>_title, service_<key>_desc, service_<key>_price.
export const SERVICE_DEFS = [
  {
    key: "beginners",
    label: "PRINCIPIANTES",
    defaultTitle: "Principiantes",
    defaultDesc: "Aprende los fundamentos del ski en un entorno seguro y controlado.",
  },
  {
    key: "intermediate",
    label: "INTERMEDIO",
    defaultTitle: "Intermedio",
    defaultDesc: "Perfecciona tu técnica y gana confianza en pista.",
  },
  {
    key: "advanced",
    label: "AVANZADO",
    defaultTitle: "Avanzado",
    defaultDesc: "Domina pistas negras, fuera de pista y técnica.",
  },
  {
    key: "private",
    label: "CLASES PRIVADAS",
    defaultTitle: "Clases Privadas",
    defaultDesc: "Atención totalmente personalizada 1 a 1. Adaptada a tus objetivos.",
  },
  {
    key: "group",
    label: "CLASES GRUPALES",
    defaultTitle: "Clases Grupales",
    defaultDesc: "Aprende en grupo con un máximo de 6 personas.",
  },
  {
    key: "kids",
    label: "CLASES PARA NIÑOS",
    defaultTitle: "Clases para Niños",
    defaultDesc: "Clases divertidas y seguras pensadas para los más chicos.",
  },
] as const;
