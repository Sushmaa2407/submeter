// ============================================================
// EDGE-SAFE auth config.
//
// This file contains ONLY the parts of our auth setup that are
// safe to run in the lightweight Edge runtime (middleware.ts):
// session strategy, pages, and the jwt/session callbacks.
//
// It deliberately does NOT include the Credentials provider,
// because that needs @node-rs/argon2 — a native Rust module that
// Edge can't run. Middleware never actually needs to verify a
// password; it just needs to read the role already baked into
// the signed cookie from a previous, real login.
// ============================================================
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [], // intentionally empty here — see lib/auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
      }
      return session;
    },
  },
};
