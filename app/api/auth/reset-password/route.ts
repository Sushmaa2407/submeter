import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { resetPassword, PasswordResetError } from "@/lib/password-reset";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ message: "Password updated. You can log in now." });
  } catch (err) {
    if (err instanceof PasswordResetError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
