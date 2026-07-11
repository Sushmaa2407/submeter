// ============================================================
// POST /api/auth/signup
//
// Auth.js handles LOGGING IN, but creating a brand-new account
// is our own responsibility. This route:
//   1. Validates the input (same Zod schema the frontend form uses)
//   2. Checks the email isn't already taken
//   3. Hashes the password (NEVER stores it plain)
//   4. Creates the user as role CUSTOMER (nobody can sign up as
//      admin through this public route — admins are created
//      directly in the database, on purpose)
//   5. "Sends" a verification email (the stub — see lib/email.ts)
// ============================================================
import { NextResponse } from "next/server";
import { hash } from "@node-rs/argon2";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    // .flatten() turns Zod's error tree into a simple field->message
    // map the frontend form can show next to the right input.
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Deliberately vague — don't confirm "this exact email has an
    // account" to a stranger; that's an information leak.
    return NextResponse.json(
      { error: "Could not create account with these details" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password);
  const verificationToken = randomUUID();

  const isDev = process.env.NODE_ENV !== "production";

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CUSTOMER",
      // Auto-verify in dev/demo so a reviewer isn't blocked by an
      // email they'll never receive — see plan.md Section 8.
      emailVerifiedAt: isDev ? new Date() : null,
    },
  });

  await sendVerificationEmail({ to: email, verificationToken });

  return NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 }
  );
}
