// ============================================================
// Shared Zod validators.
// The browser form AND the API route both import from here,
// so a value that passes on the client always passes the exact
// same check on the server, and vice versa.
// ============================================================
import { z } from "zod";

// ---------- Auth ----------

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"), // bcrypt/argon2 practical cap
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- Plans ----------

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  priceCents: z.number().int().nonnegative("Price cannot be negative"),
  billingInterval: z.enum(["MONTHLY", "YEARLY"]),
  usageLimit: z.number().int().positive().nullable().optional(),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial().extend({
  isArchived: z.boolean().optional(),
});
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

// ---------- Subscriptions ----------

export const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
});
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
});
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

// ---------- Invoices ----------

export const markInvoiceStatusSchema = z.object({
  invoiceId: z.string().uuid(),
  status: z.enum(["PAID", "FAILED"]),
});
export type MarkInvoiceStatusInput = z.infer<typeof markInvoiceStatusSchema>;

// ---------- Usage ----------

export const logUsageSchema = z.object({
  subscriptionId: z.string().uuid(),
  // Reject zero/negative usage — logging "0 units used" is meaningless
  // and negative usage is either a bug or an attempted exploit.
  quantity: z.number().int().positive("Quantity must be a positive number"),
});
export type LogUsageInput = z.infer<typeof logUsageSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
