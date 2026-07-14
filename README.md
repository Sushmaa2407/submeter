# SubMeter

> Subscription billing platform with usage tracking, automated invoicing, and MRR/churn analytics for growing SaaS businesses.

**Live demo →** https://submeter-taupe.vercel.app/

## Features

- Email/password auth with role-based access (admin vs customer), rate-limited login
- Admin: create and archive subscription plans
- Customer: browse plans, subscribe, cancel (access continues until period end)
- Automated recurring billing — invoices generated on a schedule, idempotent against retries
- Simulated payment confirmation (mark invoices paid/failed) with automatic past-due/cancellation grace periods
- Usage tracking against plan limits, with near-limit warnings (warn, never block)
- Admin dashboard: MRR, active subscriber count, churn rate, revenue-over-time and plan-distribution charts

## Tech Stack

Next.js (App Router) · TypeScript (strict) · PostgreSQL (Prisma) · Tailwind CSS v4 · Auth.js · Zod · Recharts · Vercel

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/submeter && cd submeter
npm install
cp .env.example .env   # then fill in DATABASE_URL, AUTH_SECRET, CRON_SECRET
npx prisma migrate dev --name init
npx prisma generate
npx tsx prisma/seed.ts
npm run dev             # http://localhost:3000
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | demo1234 |
| Customer | demo@demo.com | demo1234 |

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (pooled connection recommended — see docs/architecture.md) |
| `AUTH_SECRET` | Session signing secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Public app URL, used for links and OG images |
| `CRON_SECRET` | Shared secret the billing cron job sends to authenticate itself |

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the data model diagram, how auth/authorization work, and the non-obvious decisions made under the 10-day timebox.

## Testing

```bash
npm run test       # unit tests
npm run test:e2e   # playwright end-to-end tests
```

_(Test suite is a stretch goal for this build — see Roadmap below.)_

## Roadmap

- [x] Auth, roles, subscriptions, billing, usage, dashboard
- [ ] Real email delivery (currently stubbed — see `lib/email.ts`)
- [ ] Real Stripe integration (currently simulated payments)
- [ ] Automated test suite

## Built With Claude

This project's planning and implementation were built collaboratively with Claude, following a spec-first workflow (see `plan.md`) — schema and types locked before feature code, one milestone per day, every generated diff reviewed before accepting.

## Credit

Built for the [Digital Heroes](https://github.com/) Full Stack Developer Trial.

## License

MIT — see [LICENSE](LICENSE).
