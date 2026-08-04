import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createSessionToken, loginWithPassword } from "../_core/auth";

const isProd = process.env.NODE_ENV === "production";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 365,
};

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
