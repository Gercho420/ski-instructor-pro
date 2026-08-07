import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { appRouter } from "../routers";
import path from "path";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Handler de tRPC
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Servir archivos subidos (fotos de la galería). Requiere un Volume de Railway
// montado en UPLOADS_DIR para que las fotos no se pierdan en cada redeploy.
const uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// robots.txt y sitemap.xml se generan acá (no como archivos estáticos) para
// poder usar el dominio real desde la misma variable de entorno VITE_SITE_URL
// que ya usa el frontend, sin duplicar el valor en un archivo aparte.
const SUPPORTED_LANGS = ["es", "en", "pt"] as const;
function getSiteUrl(): string {
  return (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
}

app.get("/robots.txt", (_req, res) => {
  const siteUrl = getSiteUrl();
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    // Sin dominio configurado todavía: devolvemos un sitemap vacío en vez de
    // uno con URLs rotas.
    res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    return;
  }

  const urls = SUPPORTED_LANGS.map(
    (l) => `  <url>
    <loc>${siteUrl}/${l}/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${siteUrl}/es/" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/" />
    <xhtml:link rel="alternate" hreflang="pt" href="${siteUrl}/pt/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/es/" />
  </url>`
  ).join("\n");

  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`
  );
});

// Servir frontend en producción
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// La raíz "/" redirige al idioma preferido del visitante según la cabecera
// Accept-Language que manda el navegador, con español como default si no
// hay match o no hay cabecera. Usamos 302 (no 301) a propósito: al depender
// de una cabecera que puede variar, un redirect "permanente" cacheado por el
// navegador podría pegarle para siempre el idioma de la primera visita.
// Esto no afecta el rastreo de buscadores: cada versión de idioma sigue
// siendo accesible de forma directa y estable en /es/, /en/, /pt/ (así están
// listadas en el sitemap con sus hreflang), que es lo que Google/bots de IA
// realmente indexan.
function detectPreferredLang(acceptLanguageHeader: string | undefined): (typeof SUPPORTED_LANGS)[number] {
  if (!acceptLanguageHeader) return "es";
  const parsed = acceptLanguageHeader
    .split(",")
    .map((part) => {
      const [rawLang, qPart] = part.trim().split(";q=");
      const q = qPart ? parseFloat(qPart) : 1;
      return { primary: rawLang.split("-")[0].toLowerCase(), q: isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { primary } of parsed) {
    if ((SUPPORTED_LANGS as readonly string[]).includes(primary)) {
      return primary as (typeof SUPPORTED_LANGS)[number];
    }
  }
  return "es";
}

app.get("/", (req, res) => {
  const lang = detectPreferredLang(req.headers["accept-language"]);
  res.set("Vary", "Accept-Language");
  res.redirect(302, `/${lang}/`);
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Escuchar en el puerto dinámico de Railway
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${port}`);
});
