// Storage local en disco, pensado para correr en Railway con un Volume montado.
// Las fotos se guardan en UPLOADS_DIR y se sirven via express.static en /uploads/*
// (ver server/_core/index.ts). IMPORTANTE: sin un Volume de Railway montado en
// UPLOADS_DIR, los archivos se pierden en cada redeploy (el filesystem del
// contenedor es efimero).

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), "uploads");

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const filePath = path.join(UPLOADS_DIR, key);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const buffer =
    typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);

  await fs.writeFile(filePath, buffer);

  return { key, url: `/uploads/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/uploads/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  // No hay URLs firmadas con storage local: el archivo se sirve directo y publico.
  const key = normalizeKey(relKey);
  return `/uploads/${key}`;
}

export async function storageDelete(relKey: string): Promise<void> {
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOADS_DIR, key);
  await fs.unlink(filePath).catch(() => {
    // Si el archivo ya no existe, no pasa nada.
  });
}
