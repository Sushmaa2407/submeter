// ============================================================
// FULL auth configuration — used by API routes and server
// components (which run in the real Node.js runtime, so
// argon2's native code is allowed here).
//
// This file takes the shared edge-safe settings from
// auth.config.ts and adds the one thing Edge can't handle:
// the Credentials provider, which checks passwords with argon2.
// ============================================================
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "@node-rs/argon2";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        // 1. Validate shape — reject junk before touching the database.
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 2. Rate-limit by email, so 5 wrong guesses locks THAT
        //    account's login attempts for 15 minutes.
        const rateLimitKey = `login:${email}`;
        const { allowed } = checkRateLimit(rateLimitKey);
        if (!allowed) {
          throw new Error("TooManyAttempts");
        }

        // 3. Look the user up. Same generic failure whether the
        //    email doesn't exist OR the password is wrong — never
        //    reveal which one, or you help attackers enumerate emails.
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordIsValid = await verify(user.passwordHash, password);
        if (!passwordIsValid) return null;

        // 4. Success — clear the rate-limit counter for next time.
        resetRateLimit(rateLimitKey);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
