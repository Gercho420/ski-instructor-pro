import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import { getDb } from "./db";
import { users, type User } from "../drizzle/schema";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

export function comparePassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = scryptSync(password, salt, 64);

    if (keyBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    return false;
  }
}

export async function loginWithPassword(email: string, pass: string): Promise<User | null> {
  const db = await getDb();
  if (!db || !email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  
  if (!user || !user.passwordHash) return null;

  const isValid = comparePassword(pass, user.passwordHash);
  return isValid ? user : null;
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const email = authHeader.split(" ")[1];
  if (!email) return null;

  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  return user || null;
}
