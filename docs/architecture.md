# Architecture

## Data model

```
User ──< Subscription >── Plan
           │
           ├──< Invoice
           └──< UsageRecord
```

- A `User` can have many `Subscription`s over their lifetime (subscribe, cancel, resubscribe), but only **one ACTIVE at a time** (enforced in `lib/subscriptions.ts`, not the database schema — see Trade-offs below).
- Each `Subscription` belongs to one `Plan` and accumulates `Invoice`s (one per billing period, idempotent) and `UsageRecord`s (one per logged usage event).
- Full field-level detail lives in `prisma/schema.prisma`, which is the single source of truth — this doc describes *why*, the schema describes *what*.

## Auth & authorization

- Sessions are JWT-based (Auth.js / NextAuth v5), stored in an httpOnly, Secure cookie.
- Passwords are hashed with Argon2id — never stored or logged in plaintext.
- Role (`ADMIN` / `CUSTOMER`) is baked into the JWT at login and re-verified **server-side on every write** — the client's claimed role is never trusted. See the `session?.user?.role !== "ADMIN"` check repeated in every admin-only API route.
- `middleware.ts` runs on every request to `/admin/*` and `/customer/*`, checking the role before the page even renders, and distinguishes "not logged in" (→ `/login`) from "logged in, wrong role" (→ `/forbidden`).
- **Edge/Node split**: `middleware.ts` runs in Next.js's lightweight Edge runtime, which cannot execute the native Argon2 module. So auth config is split into `lib/auth.config.ts` (Edge-safe: session/JWT callbacks only) and `lib/auth.ts` (full config with the password-checking Credentials provider, used only in real Node.js routes/server components).

## Billing engine

`lib/billing.ts` runs two idempotent operations, meant to be triggered together by `/api/billing/run` on a schedule:
1. **Generate due invoices** — any `ACTIVE` subscription whose `currentPeriodEnd` has passed gets billed for that period, then either renews (period rolls forward) or, if the customer already asked to cancel, ends for good.
2. **Process overdue subscriptions** — unpaid invoices push their subscription to `PAST_DUE` after 3 days, `CANCELLED` after 14 days.

Idempotency is enforced at the database level via `@@unique([subscriptionId, periodStart])` on `Invoice` — even if the cron job retries or double-fires, a duplicate invoice physically cannot be created.

## Non-obvious decisions & trade-offs

| Decision | Why | Trade-off accepted |
|---|---|---|
| Payments are fully simulated (admin manually marks invoices paid/failed) | Real Stripe integration wasn't achievable inside the 10-day scope alongside everything else | No real money moves; this is explicitly a stretch goal, not core |
| Email verification is stubbed (console log, auto-verified in dev) | Same timebox reasoning | Isolated behind one function (`lib/email.ts`) so swapping in a real provider later is a one-file change |
| "One active subscription per user" is enforced in application code, not a database constraint | Prisma doesn't portably support partial unique indexes ("unique only where status = ACTIVE") across all database providers | A theoretical race condition exists between two simultaneous subscribe requests; acceptable at this scale, would need a DB-level advisory lock or partial index at higher scale |
| Churn rate is an approximation (`active now + cancelled this month`, standing in for "active at month start") | True churn needs daily historical snapshots, which weren't in scope | Accurate unless subscriptions were also newly created in the same month — documented clearly in `lib/dashboard.ts` rather than presented as precise |
| Money stored as integer cents, never floating-point dollars | Floating-point arithmetic on money causes real rounding bugs | Every dollar amount needs a `/100` or `*100` conversion at the UI boundary — a small, consistent tax worth paying |
| Rate limiting is in-memory (`lib/rate-limit.ts`), not Redis | No extra infrastructure needed for a single-instance trial deploy | Doesn't scale correctly across multiple serverless instances — flagged in the file itself as a v2 upgrade (swap for Upstash Redis, same function signature) |

## Request flow example: a customer subscribes

1. Customer clicks "Subscribe" on `/customer` → `SubscribeButton` client component
2. `POST /api/subscriptions` with `{ planId }`
3. Route checks `auth()` for a valid session (401 if none)
4. Zod validates the request shape (400 if invalid)
5. `lib/subscriptions.ts`'s `createSubscription()` checks the plan exists and isn't archived, checks no other ACTIVE subscription exists for this user, then creates the row
6. Response triggers `router.refresh()`, which re-runs the server component and shows the new subscription — no full page reload, no client-side state duplication of server data
