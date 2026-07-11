# Changelog

All notable changes to this project are documented here, following [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Auth: signup, login, role-based sessions (admin/customer), rate-limited login
- Plans: admin CRUD, archive instead of delete
- Subscriptions: subscribe/cancel with one-active-at-a-time enforcement, access continues until period end after cancellation
- Billing: automated idempotent invoice generation, past-due/cancelled grace-period transitions, simulated payment confirmation
- Usage tracking: per-period usage against plan limits, near-limit warnings (warn, never block)
- Admin dashboard: MRR, active subscriber count, churn rate (approximate), revenue-over-time and plan-distribution charts
- Polish: loading skeletons, error boundaries, custom 404, full SEO metadata (OG image, sitemap, robots.txt, JSON-LD)

### Known limitations
- Payments are simulated, not connected to a real payment gateway
- Email verification is stubbed (logged, not sent)
- Churn rate is an approximation without historical daily snapshots
