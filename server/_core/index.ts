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

// Servir frontend en producción
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Escuchar en el puerto dinámico de Railway
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${port}`);
});
