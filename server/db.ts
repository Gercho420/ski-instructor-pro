import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  ContactMessage,
  contactMessages,
  GalleryPhoto,
  galleryPhotos,
  InsertContactMessage,
  InsertGalleryPhoto,
  InsertReview,
  InsertSiteConfig,
  InsertUser,
  Review,
  reviews,
  siteConfig,
  SiteConfig,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (!_db && dbUrl) {
    try {
      const pool = mysql.createPool(dbUrl);
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export { _db as db };

// ===== Users / Auth =====

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db || !email) return undefined;

  const normalizedEmail = email.trim().toLowerCase();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function touchLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function createAdminUser(email: string, passwordHash: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values({
    email: email.trim().toLowerCase(),
    passwordHash,
    name: name ?? null,
    role: "admin",
  });
}

// ===== Gallery Photos =====

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.sortOrder), desc(galleryPhotos.createdAt));
  return result;
}

export async function createGalleryPhoto(data: InsertGalleryPhoto): Promise<GalleryPhoto> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(galleryPhotos).values(data);
  const [row] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, result[0].insertId)).limit(1);
  return row;
}

export async function deleteGalleryPhoto(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

export async function updateGalleryPhoto(id: number, data: Partial<InsertGalleryPhoto>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id));
}

// ===== Reviews =====

export async function getApprovedReviews(): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(reviews).where(eq(reviews.approved, "approved")).orderBy(desc(reviews.createdAt));
  return result;
}

export async function getAllReviews(): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  return result;
}

export async function createReview(data: InsertReview): Promise<Review> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(data);
  const [row] = await db.select().from(reviews).where(eq(reviews.id, result[0].insertId)).limit(1);
  return row;
}

export async function updateReviewStatus(id: number, approved: "pending" | "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ approved }).where(eq(reviews.id, id));
}

export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(reviews).where(eq(reviews.id, id));
}

// ===== Contact Messages =====

export async function createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactMessages).values(data);
  const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, result[0].insertId)).limit(1);
  return row;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return result;
}

export async function markContactMessageRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ read: "read" }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

// ===== Site Config =====

export async function getConfigByCategory(category: string): Promise<SiteConfig[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(siteConfig).where(eq(siteConfig.category, category));
  return result;
}

export async function getAllConfig(): Promise<SiteConfig[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(siteConfig).orderBy(siteConfig.category);
  return result;
}

export async function getConfigValue(category: string, configKey: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(siteConfig)
    .where(and(eq(siteConfig.category, category), eq(siteConfig.configKey, configKey)))
    .limit(1);
  return result.length > 0 ? result[0].configValue : null;
}

export async function upsertConfig(category: string, configKey: string, configValue: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(siteConfig).values({ category, configKey, configValue }).onDuplicateKeyUpdate({
    set: { configValue },
  });
}

export async function upsertConfigs(items: { category: string; configKey: string; configValue: string }[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const item of items) {
    await db.insert(siteConfig).values({ category: item.category, configKey: item.configKey, configValue: item.configValue }).onDuplicateKeyUpdate({
      set: { configValue: item.configValue },
    });
  }
}
