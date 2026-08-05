import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as storage from "./storage";
import { notifyOwner } from "./_core/notification";

vi.mock("./db");
vi.mock("./storage");
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    email: "admin@test.com",
    passwordHash: "hash",
    name: "Admin",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    email: "user@test.com",
    passwordHash: "hash",
    name: "User",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("gallery", () => {
  it("list returns photos from database (public)", async () => {
    const mockPhotos = [
      { id: 1, title: "Photo 1", description: null, imageUrl: "/test.jpg", storageKey: "test.jpg", category: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(db.getGalleryPhotos).mockResolvedValue(mockPhotos);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.gallery.list();

    expect(result).toEqual(mockPhotos);
    expect(db.getGalleryPhotos).toHaveBeenCalledOnce();
  });

  it("upload requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.gallery.upload({ fileName: "test.jpg", fileBase64: "dGVzdA==", contentType: "image/jpeg" })
    ).rejects.toThrow();
  });

  it("upload succeeds for admin", async () => {
    vi.mocked(storage.storagePut).mockResolvedValue({ key: "test_abc.jpg", url: "/manus-storage/test_abc.jpg" });
    vi.mocked(db.createGalleryPhoto).mockResolvedValue({
      id: 1, title: "Test", description: null, imageUrl: "/manus-storage/test_abc.jpg",
      storageKey: "test_abc.jpg", category: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
    } as any);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.upload({
      fileName: "test.jpg",
      fileBase64: "dGVzdA==",
      contentType: "image/jpeg",
      title: "Test",
    });

    expect(result.title).toBe("Test");
    expect(storage.storagePut).toHaveBeenCalledOnce();
    expect(db.createGalleryPhoto).toHaveBeenCalledOnce();
  });

  it("delete requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.gallery.delete({ id: 1 })).rejects.toThrow();
  });

  it("delete succeeds for admin", async () => {
    vi.mocked(db.deleteGalleryPhoto).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});
