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

// La raíz "/" siempre redirige al idioma por defecto (español, mercado
// principal del negocio). Es un default fijo, no detectado por
// Accept-Language/geo: eso mantiene la respuesta consistente y cacheable
// para buscadores (evita mostrarle contenido distinto a Googlebot según
// cabeceras, lo cual puede leerse como cloaking).
app.get("/", (_req, res) => {
  res.redirect(301, "/es/");
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Escuchar en el puerto dinámico de Railway
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${port}`);
});
