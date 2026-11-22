# IQ Anaesthesia Hub — Member Portal

A members-only portal that serves as a one-stop centre for the hub's Google Drive
library, with login and 6 / 12-month subscription countdowns.

**Current state: frontend demo build.** Accounts, memberships and Drive links are
stored in the browser's `localStorage` so every flow can be tried end to end.
The production backend (Cloudflare Workers + D1, with a protected Drive proxy so
raw share links stop working) drops in behind the same screens later.

## Demo accounts

| Email | Password | Shows |
| --- | --- | --- |
| `admin@iqahub.com` | `admin123` | Admin panel: members, plans, Drive links |
| `member@iqahub.com` | `member123` | Active membership, 6-month plan |
| `expiring@iqahub.com` | `expiring123` | "Expiring soon" warning state |
| `expired@iqahub.com` | `expired123` | Expired lock / renewal screen |

## Features

- Sign in / sign out, with an expired-or-revoked lock screen
- Dashboard with a live d/h/m/s countdown timer, days-left ring, start and expiry
  dates, and time-used progress
- Library: 6 collections × 19 items, live search, item detail panel
- Admin: add members (6/12-month plan), extend by 6 months, revoke / reinstate,
  remove; paste each item's Google Drive share link to activate it for members

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs dist/
```

## Deploy (GitHub → Cloudflare Pages)

1. Push this folder to a GitHub repository.
2. In Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset: **Vite** · Build command: `npm run build` · Output: `dist`.
4. Pages auto-deploys on every push to the default branch.
5. Custom domain: Pages project → Custom domains → add your domain
   (DNS is automatic if the domain is already on Cloudflare).

Routing uses hash-based URLs, so no extra SPA redirect config is needed.

## Roadmap to production

1. Cloudflare Worker + D1: real accounts, hashed passwords, server-side sessions.
2. Protected Drive proxy: Worker verifies the session and subscription before
   serving a file, so sharing a raw Drive link no longer bypasses the paywall.
3. Manual activation stays: admin confirms bank transfer, then sets the plan.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · lucide-react · sonner
