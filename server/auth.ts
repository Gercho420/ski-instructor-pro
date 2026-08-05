import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import { db } from "./db";
import { users, type User } from "../drizzle/schema";

// Encripta la contraseña usando crypto nativo
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

// Compara la contraseña en texto plano con el hash
export function comparePassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}

// Autentica la petición buscando la sesión o headers
export async function authenticateRequest(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const email = authHeader.split(" ")[1];
  if (!email) return null;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user || null;
}
