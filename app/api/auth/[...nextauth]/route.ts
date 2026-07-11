// ============================================================
// POST /api/auth/* handler — all NextAuth routes
//
// This uses the handlers exported from lib/auth.ts, which is the
// full configuration (including password verification). See that
// file for more.
// ============================================================
import { handlers } from "@/lib/auth";

export const GET = handlers.GET;
export const POST = handlers.POST;
