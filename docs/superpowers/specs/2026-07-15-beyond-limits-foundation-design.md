# Beyond Limits Bootcamp — Platform Foundation (Phase 1) Design

**Domain:** beyondlimitsbootcamp.com
**Repo:** github.com/jeff-cline/bootcamp · **Local:** ~/Desktop/bootcamp
**Date:** 2026-07-15
**Status:** Draft for review

---

## 1. Goal

Stand up a **new, fully isolated** membership platform for a fitness / emotional / somatic
performance coach focused on executives and entrepreneurs — starting with the foundation that
everything else builds on. Later phases add video, monetization, and community.

This document covers **Phase 1 (Foundation) only.**

### Non-goals for Phase 1 (deferred to later phases)
- **Phase 2 — Members & Video:** gated live stream + saved VOD library (StreamYard → members-only).
- **Phase 3 — Monetization:** GoHighLevel checkout + membership gating, coupon manager, affiliate `/shop`, white-label landers.
- **Phase 4 — Engagement:** chat→email, CRM, community (groups/chat/gamification), habit tracker (34-min method + meal planning), broadcast/text.

Each later phase gets its own spec → plan → build cycle.

## 2. Isolation guarantees (hard requirement)

This project must never affect Krystalore or any other site:
- Separate local folder (`~/Desktop/bootcamp`), separate `node_modules`, `.env`, git repo.
- Separate GitHub repo (`jeff-cline/bootcamp`).
- Separate Vercel project (own build, env vars, domain).
- Separate Postgres database (own `DATABASE_URL`) — never connects to Krystalore's DB.
- Shared third-party keys (uploadthing, Zapmail) are **not** used in Phase 1. When introduced
  later, this site gets its own uploadthing app/namespace so storage never mixes.

## 3. Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS · **NextAuth** (credentials) ·
**Prisma** ORM · **PostgreSQL** · bcrypt for password hashing. (Mirrors the Krystalore "core"
patterns so it's familiar and fully owned.)

## 4. Data model (Phase 1)

```
enum Role { GOD, EXECUTIVE, PREMIUM, SECRET, CORPORATE }

User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  passwordHash      String
  role              Role     @default(EXECUTIVE)
  isActive          Boolean  @default(true)
  mustChangePassword Boolean @default(false)
  createdAt         DateTime @default(now())
  lastLoginAt       DateTime?
}

ActivityLog {           // powers the "who's doing what" dashboard
  id        String   @id @default(cuid())
  userId    String
  action    String   // e.g. LOGIN, PASSWORD_CHANGED, IMPERSONATE_START, PAGE_VIEW
  detail    String?
  createdAt DateTime @default(now())   // timestamped + datestamped
}
```

## 5. Authentication

- **Email + password** login (NextAuth credentials provider).
- Session carries `userId` + `role`.
- **Force-change-password:** if `mustChangePassword` is true, the user is redirected to a
  "set a new password" screen and cannot access anything else until they do. On success the
  flag clears and it's logged to `ActivityLog`.
- All logins recorded to `ActivityLog` with timestamp; `lastLoginAt` updated.

### Seeded God accounts
A seed script creates two `GOD` users:
- `jeff.cline@me.com`
- `krystalore@thecrewscoach.com`

Both are seeded with `mustChangePassword = true` and an initial temp password read from an
env var (`SEED_TEMP_PASSWORD`, value `TEMP!234` supplied locally/at deploy — **never committed**).
Only the bcrypt **hash** is stored. Both must set a new password on first login.

## 6. Admin console (GOD only)

- **Users:** list, create, edit, assign any `Role`, activate/deactivate.
- **Create additional GOD and ADMIN accounts** (ADMIN = manage users/content but not other Gods).
- **Impersonation ("View as"):** a God can impersonate any user to see exactly what that
  tier sees. A persistent banner shows "Viewing as <user> — Exit" to return to the God session.
  Impersonation start/stop is logged to `ActivityLog`.
- **Activity dashboard:** timestamped/datestamped feed of logins and actions, filterable by user.

## 7. Member area (Phase 1 shell)

Logged-in users land on a member dashboard showing their name + tier and placeholder cards for
"Your Videos" and "Community" (wired up in later phases). Non-authenticated visitors are
redirected to login — the member area is never visible when logged out.

## 8. Marketing site (public)

The **Beyond Limits Bootcamp** brand pages — ported from the Krystalore `/bootcamp` build as
the starting point (hero "Train Like Your Life Depends on It. Because It Does.", the 34-Minute
Method, Strong-isn't-a-look, What We (Don't) Believe, You'll Build, expert feature, Beyond
Limits vs Traditional comparison, Who This Is (Not) For, The No Matter What Standard,
Choose Your Plan pricing, CTAs). Public homepage with **Login** / **Join** entry points.

## 9. Security notes
- No plaintext passwords anywhere in the repo. bcrypt hashes only.
- All secrets (`DATABASE_URL`, `NEXTAUTH_SECRET`, `SEED_TEMP_PASSWORD`) via env — `.env*`
  gitignored; production values live in Vercel env only.
- `TEMP!234` treated as burned (was shared in chat); forced reset on first login mitigates it.

## 10. What the user (Jeff) provides
- A Postgres `DATABASE_URL` (own DB — e.g. Neon free tier) — isolated from Krystalore.
- The Vercel project (import `jeff-cline/bootcamp`).
- DNS: apex A record → `76.76.21.21`, `www` → CNAME `cname.vercel-dns.com`.

## 11. Success criteria (Phase 1 done)
- Public bootcamp marketing site is live and isolated.
- Both God accounts can log in, are forced to change their password, and land in the admin console.
- A God can create users of any tier, create other God/Admin accounts, and impersonate any user.
- The activity dashboard shows timestamped logins/actions.
- Logged-out visitors cannot reach the member area.
- Nothing in Krystalore or any other site/deploy is affected.
