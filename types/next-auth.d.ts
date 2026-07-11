// ============================================================
// Auth.js ships generic types (session.user only has name/email/
// image by default). This file "teaches" TypeScript that OUR
// session.user also always has `id` and `role`, so every file
// that reads `session.user.role` gets autocomplete + safety
// instead of a red squiggly line or a silent `any`.
// ============================================================
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "CUSTOMER";
  }
}
