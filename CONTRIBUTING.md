# Contributing

## Local setup

See the Quick Start section in [README.md](README.md).

## Branch naming

`feat/short-description`, `fix/short-description`, `docs/short-description`

## Commit style

This project follows [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add usage tracking to customer dashboard
fix: prevent duplicate invoices on cron retry
docs: add architecture decision for churn approximation
```

## Before opening a PR

```bash
npm run lint
npm run build
npm run test
```
All three must pass. CI runs the same checks on every push.

## Opening a PR

Describe **what changed and why** — the reviewer's speed is capped by how fast they can reconstruct your intent, not by how much code there is to read.
