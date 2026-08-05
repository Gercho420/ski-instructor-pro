import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { appRouter } from "../routers";
import { ENV } from "./env";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Servir cliente en producción
if (ENV.isProd) {
  const publicPath = path.resolve(__dirname, "../public");
  app.use(express.static(publicPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

const port = ENV.port || 5000;
app.listen(port, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${port}`);
});
