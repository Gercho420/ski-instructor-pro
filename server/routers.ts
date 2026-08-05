import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { loginWithPassword } from "./auth";
import * as db from "./db";
import * as storage from "./storage";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 365,
};

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin role required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { user, token } = await loginWithPassword(input.email, input.password);
      ctx.res.cookie(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { ...SESSION_COOKIE_OPTIONS, maxAge: -1 });
    return { success: true };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    const { id, email, name, role } = ctx.user;
    return { id, email, name, role };
  }),
});

export const galleryRouter = router({
  list: publicProcedure.query(async () => {
    return db.getGalleryPhotos();
  }),

  upload: adminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        contentType: z.string(),
        title: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const { key, url } = await storage.storagePut(
        `gallery/${Date.now()}-${input.fileName}`,
        buffer,
        input.contentType
      );
      return db.createGalleryPhoto({
        title: input.title || input.fileName,
        imageUrl: url,
        storageKey: key,
        category: input.category || null,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteGalleryPhoto(input.id);
      return { success: true };
    }),
});

export const reviewsRouter = router({
  listApproved: publicProcedure.query(async () => {
    return db.getApprovedReviews();
  }),

  create: publicProcedure
    .input(
      z.object({
        authorName: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(1),
        lang: z.string().default("es"),
      })
    )
    .mutation(async ({ input }) => {
      const review = await db.createReview(input);
      await notifyOwner({
        title: "Nueva reseña para revisar",
        content: `${input.authorName} ha dejado una reseña de ${input.rating} estrellas: "${input.comment}"`,
      });
      return review;
    }),

  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateReviewStatus(input.id, "approved");
      return { success: true };
    }),
});

export const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1),
        lang: z.string().default("es"),
      })
    )
    .mutation(async ({ input }) => {
      await db.createContactMessage(input);
      await notifyOwner({
        title: "Nuevo mensaje de contacto",
        content: `De: ${input.name} (${input.email})\nMensaje: ${input.message}`,
      });
      return { success: true };
    }),

  listAll: adminProcedure.query(async () => {
    return db.getAllContactMessages();
  }),
});

export const configRouter = router({
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return db.getConfigByCategory(input.category);
    }),

  save: adminProcedure
    .input(
      z.object({
        category: z.string(),
        items: z.array(
          z.object({
            configKey: z.string(),
            configValue: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await db.upsertConfigs(input.category, input.items);
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  gallery: galleryRouter,
  reviews: reviewsRouter,
  contact: contactRouter,
  config: configRouter,
});

export type AppRouter = typeof appRouter;
