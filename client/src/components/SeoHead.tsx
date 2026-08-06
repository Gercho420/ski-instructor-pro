import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { LANGS, type Lang } from "@/i18n/translations";

// index.html trae valores estáticos en español para el primer render (antes de
// que React hidrate) — esto los sobreescribe en runtime según el idioma real
// de la URL (/es, /en, /pt) y agrega las etiquetas hreflang que le dicen a
// los buscadores qué versión de idioma mostrar a cada usuario.
//
// SITE_URL sale de VITE_SITE_URL (mismo valor que ya usa index.html vía
// %VITE_SITE_URL%). Cambiar el dominio real solo en esa variable de entorno.
const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");

function setMetaByName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkRel(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SeoHead() {
  const { lang, t } = useI18n();

  useEffect(() => {
    if (!SITE_URL) return; // sin dominio configurado todavía, no forzamos URLs rotas

    const path = `/${lang}/`;
    const canonicalUrl = `${SITE_URL}${path}`;
    const title = t("seo.title");
    const description = t("seo.description");

    document.title = title;
    setMetaByName("description", description);
    setLinkRel("canonical", canonicalUrl);

    setMetaByProperty("og:url", canonicalUrl);
    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setMetaByProperty(
      "og:locale",
      lang === "es" ? "es_AR" : lang === "en" ? "en_US" : "pt_BR"
    );

    setMetaByName("twitter:url", canonicalUrl);
    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);

    // hreflang: una etiqueta por cada idioma disponible + x-default.
    // x-default apunta a /es/ porque es el mercado principal del negocio.
    LANGS.forEach((l: Lang) => {
      setLinkRel("alternate", `${SITE_URL}/${l}/`, l);
    });
    setLinkRel("alternate", `${SITE_URL}/es/`, "x-default");
  }, [lang, t]);

  return null;
}
