import { COOKIE_NAME, ONE_YEAR_MS, UNAUTHED_ERR_MSG } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import bcrypt from "bcryptjs";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const BCRYPT_ROUNDS = 12;

function getSessionSecret() {
  if (!ENV.cookieSecret || ENV.cookieSecret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a random string of at least 32 characters."
    );
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: number): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

async function verifySessionToken(
  token: string | undefined | null
): Promise<{ userId: number } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    const { userId } = payload as Record<string, unknown>;
    if (typeof userId !== "number") return null;
    return { userId };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined) {
  if (!cookieHeader) return new Map<string, string>();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const user = await db.getUserByEmail(email.trim().toLowerCase());

  // Constant-shape response whether the user exists or not, to avoid
  // leaking which emails are registered via timing/response differences.
  const hash = user?.passwordHash ?? "$2a$12$invalidsaltinvalidsaltinvalidsO";
  const passwordOk = await verifyPassword(password, hash);

  if (!user || !passwordOk) {
    throw ForbiddenError("Invalid email or password");
  }

  await db.touchLastSignedIn(user.id);
  const token = await createSessionToken(user.id);
  return { user, token };
}

export async function authenticateRequest(req: Request): Promise<User> {
  const cookies = parseCookies(req.headers.cookie);
  let sessionToken = cookies.get(COOKIE_NAME);

  if (!sessionToken) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.slice(7);
    }
  }

  const session = await verifySessionToken(sessionToken);
  if (!session) {
    throw ForbiddenError(UNAUTHED_ERR_MSG);
  }

  const user = await db.getUserById(session.userId);
  if (!user) {
    throw ForbiddenError(UNAUTHED_ERR_MSG);
  }

  return user;
}
