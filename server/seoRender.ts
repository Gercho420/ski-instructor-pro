// Genera, para cada idioma real (/es/, /en/, /pt/), una versión del index.html
// con el <title>/meta description/canonical/hreflang y el JSON-LD ya
// horneados con datos reales de la base (reseñas, precios de servicios).
//
// Por qué esto vive en el servidor y no en SeoHead.tsx (client-side):
// los bots de búsqueda por IA (GPTBot, ClaudeBot, PerplexityBot) no ejecutan
// JavaScript, así que cualquier cosa que solo inyecte React después del
// mount es invisible para ellos. Lo que manda acá es el HTML que devuelve
// el servidor en la primera respuesta.

import { getApprovedReviews, getConfigByCategory, getGalleryPhotos } from "./db";
import { translations, LANGS, type Lang } from "../client/src/i18n/translations";
import { SERVICE_DEFS, getServiceContent } from "../shared/const";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function configMapFrom(rows: { configKey: string; configValue: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.configKey] = r.configValue; });
  return map;
}

async function buildServices(lang: Lang) {
  // services_<lang>: config cargada por el admin específicamente para este
  // idioma. "services" (sin sufijo): categoría legacy de antes de que
  // existiera este fix, se usa solo como fallback para no perder contenido
  // ya cargado. Ver comentario de getServiceContent en shared/const.ts.
  const [langRows, legacyRows] = await Promise.all([
    getConfigByCategory(`services_${lang}`),
    getConfigByCategory("services"),
  ]);
  const langMap = configMapFrom(langRows);
  const legacyMap = configMapFrom(legacyRows);
  const translate = (key: string) => translations[lang]?.[key] ?? translations.es[key];

  return SERVICE_DEFS.map((s) => {
    const content = getServiceContent(s, langMap, legacyMap, translate);
    return {
      name: content.title,
      description: content.description,
      // Precio en texto libre (ver nota arriba): no hay forma confiable de saber
      // qué moneda usó el admin al tipearlo, así que no lo mandamos como
      // "price"/"priceCurrency" estructurado — solo como texto descriptivo.
      priceText: content.price,
    };
  });
}

async function buildReviewsBlock() {
  const reviews = await getApprovedReviews();
  if (reviews.length === 0) return null; // nunca inventamos rating sin reseñas reales

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };

  // Tope de 20 reseñas en el JSON-LD: son datos reales, pero un payload
  // gigante no suma más SEO y sí pesa más la respuesta.
  const review = reviews.slice(0, 20).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.authorName },
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    reviewBody: r.comment,
  }));

  return { aggregateRating, review };
}

async function buildImages(siteUrl: string) {
  const images = [`${siteUrl}/hero-ski_c1cd739e.jpg`];
  try {
    const photos = await getGalleryPhotos();
    photos.slice(0, 8).forEach((p) => {
      const url = p.imageUrl.startsWith("http") ? p.imageUrl : `${siteUrl}${p.imageUrl}`;
      images.push(url);
    });
  } catch {
    // Sin galería todavía (o error puntual de DB): seguimos solo con el hero.
  }
  return images;
}

async function buildContact() {
  const rows = await getConfigByCategory("contact");
  const map = configMapFrom(rows);
  return {
    whatsapp: map.whatsapp || "",
    email: map.email || "",
    instagram: map.instagram || "",
  };
}

export async function renderSeoHtml(lang: Lang, template: string, siteUrl: string): Promise<string> {
  const t = (key: string) => translations[lang]?.[key] ?? translations.es[key] ?? key;
  const title = t("seo.title");
  const description = t("seo.description");
  const canonicalUrl = `${siteUrl}/${lang}/`;

  const [services, reviewsBlock, images, contact] = await Promise.all([
    buildServices(lang),
    buildReviewsBlock(),
    buildImages(siteUrl),
    buildContact(),
  ]);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: "SkiPro",
    description,
    url: canonicalUrl,
    image: images,
    inLanguage: lang,
    priceRange: "$$",
    areaServed: [
      {
        "@type": "City",
        name: "San Carlos de Bariloche",
        containedInPlace: { "@type": "Country", name: "Argentina" },
      },
      {
        "@type": "AdministrativeArea",
        name: "Andorra",
        containedInPlace: { "@type": "Country", name: "Andorra" },
      },
    ],
    sameAs: contact.instagram ? [`https://instagram.com/${contact.instagram.replace(/^@/, "")}`] : undefined,
    ...(contact.whatsapp ? { telephone: contact.whatsapp } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Clases de Ski",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, description: s.description },
        ...(s.priceText ? { description: s.priceText } : {}),
      })),
    },
    ...(reviewsBlock ?? {}),
  };

  // Limpieza: JSON.stringify ya omite claves con valor undefined, no hace
  // falta filtrarlas a mano.
  const jsonLdString = JSON.stringify(jsonLd);

  let html = template;

  // NOTA: usamos funciones de reemplazo (() => valor) en vez de pasar el
  // string directo como segundo argumento de .replace(). Si se pasa un
  // string, JS interpreta patrones especiales dentro de él (ej. "$$" se
  // convierte en un solo "$", "$&", "$1", etc. también son especiales) —
  // y title/description/precios/reseñas reales pueden perfectamente
  // contener un "$". Con una función de reemplazo, el valor devuelto se
  // inserta siempre tal cual, sin interpretar nada.
  const replaceWith = (value: string) => () => value;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, replaceWith(`<title>${escapeHtml(title)}</title>`));

  // Meta description (name="description")
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    replaceWith(`<meta name="description" content="${escapeHtml(description)}" />`)
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    replaceWith(`<link rel="canonical" href="${canonicalUrl}" />`)
  );

  // Open Graph / Twitter (mismos valores, ya se resuelven con %VITE_SITE_URL%
  // en el resto del build; acá pisamos título/descripción/url puntuales)
  html = html
    .replace(/<meta property="og:title" content=".*?" \/>/, replaceWith(`<meta property="og:title" content="${escapeHtml(title)}" />`))
    .replace(/<meta property="og:description" content=".*?" \/>/, replaceWith(`<meta property="og:description" content="${escapeHtml(description)}" />`))
    .replace(/<meta property="og:url" content=".*?" \/>/, replaceWith(`<meta property="og:url" content="${canonicalUrl}" />`))
    .replace(/<meta name="twitter:title" content=".*?" \/>/, replaceWith(`<meta name="twitter:title" content="${escapeHtml(title)}" />`))
    .replace(/<meta name="twitter:description" content=".*?" \/>/, replaceWith(`<meta name="twitter:description" content="${escapeHtml(description)}" />`))
    .replace(/<meta name="twitter:url" content=".*?" \/>/, replaceWith(`<meta name="twitter:url" content="${canonicalUrl}" />`));

  // hreflang: agregamos las 3 versiones + x-default justo antes de </head>
  const hreflangTags = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${siteUrl}/${l}/" />`).join("\n    ");
  const hreflangBlock = `    ${hreflangTags}\n    <link rel="alternate" hreflang="x-default" href="${siteUrl}/es/" />\n  </head>`;
  html = html.replace(/<\/head>/, replaceWith(hreflangBlock));

  // JSON-LD: reemplazamos el bloque estático por el que acabamos de armar con datos reales
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    replaceWith(`<script type="application/ld+json">${jsonLdString}</script>`)
  );

  // <html lang="..."> real para este idioma
  html = html.replace(/<html lang="[a-z]+"/, replaceWith(`<html lang="${lang}"`));

  return html;
}
