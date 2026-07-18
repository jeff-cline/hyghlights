# Beyond Limits Bootcamp — Foundation (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an isolated Next.js membership platform for beyondlimitsbootcamp.com with the public bootcamp marketing site, email/password auth, five membership tiers, a God admin console (user management, create God/Admin, impersonation), an activity dashboard, and two seeded God accounts forced to change their password on first login.

**Architecture:** Next.js 15 App Router (TS) with route-group separation of `(marketing)`, `(auth)`, `(member)`, and `(admin)`. Auth via NextAuth credentials → JWT session carrying `userId` + `role`. Data in Postgres via Prisma. Middleware enforces auth + role + force-password-change. Every meaningful action writes an `ActivityLog` row that powers the admin dashboard. Impersonation is a signed field added to the God's own session (never a real login as the target).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, NextAuth v4, Prisma, PostgreSQL, bcryptjs, zod, vitest.

## Global Constraints

- **Total isolation:** work ONLY inside `~/Desktop/bootcamp`. Never touch `~/Desktop/Kastle` or any other project. Own repo (`git@github.com:jeff-cline/bootcamp.git`), own Vercel project, own database.
- **No plaintext secrets committed.** `.env*` is gitignored. bcrypt hashes only; the temp password comes from env `SEED_TEMP_PASSWORD` (`TEMP!234` locally), never hardcoded.
- **Roles enum (exact):** `GOD`, `EXECUTIVE`, `PREMIUM`, `SECRET`, `CORPORATE`. Add `ADMIN` for manager accounts that manage users/content but are not God. Final enum: `GOD`, `ADMIN`, `EXECUTIVE`, `PREMIUM`, `SECRET`, `CORPORATE`.
- **Seeded God accounts:** `jeff.cline@me.com` and `krystalore@thecrewscoach.com`, both `mustChangePassword=true`.
- **Node 20+, Next 15, React 19.** Commit frequently. Every task ends green (typecheck/tests/build as noted).
- **Deferred (NOT in this plan):** live video/VOD, GHL checkout, coupons, affiliate/shop, chat, CRM, community, habit tracker. Leave clean seams, build none of it.

---

## File Structure

```
~/Desktop/bootcamp/
  prisma/schema.prisma            # User, ActivityLog, Role enum
  prisma/seed.ts                  # seed two God accounts
  src/lib/db.ts                   # Prisma singleton
  src/lib/password.ts             # hash() / verify() (bcrypt)
  src/lib/auth.ts                 # NextAuth options (credentials, jwt/session callbacks)
  src/lib/activity.ts             # logActivity(userId, action, detail?)
  src/lib/roles.ts               # Role constants, tier ordering, isAdminRole()
  src/lib/session.ts              # server helpers: getSession(), requireRole()
  src/middleware.ts               # auth + force-password-change + admin gate
  src/app/api/auth/[...nextauth]/route.ts
  src/app/api/account/change-password/route.ts
  src/app/api/admin/users/route.ts          # GET list, POST create
  src/app/api/admin/users/[id]/route.ts     # PATCH update, DELETE deactivate
  src/app/api/admin/impersonate/route.ts    # POST start, DELETE stop
  src/app/(auth)/login/page.tsx
  src/app/(auth)/change-password/page.tsx
  src/app/(member)/dashboard/page.tsx       # member shell (gated)
  src/app/(admin)/admin/page.tsx            # admin home / activity dashboard
  src/app/(admin)/admin/users/page.tsx      # user management UI
  src/app/(marketing)/page.tsx              # bootcamp homepage (ported)
  src/app/(marketing)/_sections/*           # ported bootcamp sections
  src/components/ImpersonationBanner.tsx
  src/components/layout/{Header,Footer}.tsx
  tests/password.test.ts
  tests/roles.test.ts
  tests/impersonation.test.ts
```

Route groups keep responsibilities isolated: marketing is public; `(member)`/`(admin)` are gated by middleware.

---

### Task 1: Scaffold the Next.js app

**Files:** Create the app skeleton (package.json, tsconfig, tailwind, `src/app/layout.tsx`, `src/app/(marketing)/page.tsx` placeholder).

- [ ] **Step 1:** In `~/Desktop/bootcamp`, scaffold (keeps the existing `docs/`, `.gitignore`, `README.md`):
```bash
cd ~/Desktop/bootcamp
npx create-next-app@latest . --ts --tailwind --app --src-dir --eslint --import-alias "@/*" --no-turbopack --use-npm
```
Answer "yes" to proceed in a non-empty dir if prompted.
- [ ] **Step 2:** Add libs:
```bash
npm i next-auth@^4 @prisma/client bcryptjs zod
npm i -D prisma vitest @types/bcryptjs
```
- [ ] **Step 3:** Replace `src/app/page.tsx` location: create `src/app/(marketing)/page.tsx` returning `<main><h1>Beyond Limits Bootcamp</h1></main>`; delete the default `src/app/page.tsx`.
- [ ] **Step 4:** Add `"test": "vitest run"` to package.json scripts. Add `vitest.config.ts` with `test: { environment: 'node' }`.
- [ ] **Step 5:** Verify: `npm run dev` serves `/` with the heading; `npx tsc --noEmit` passes.
- [ ] **Step 6:** Commit: `git add -A && git commit -m "feat: scaffold Next.js app"`

**Verify:** dev server shows the heading at `localhost:3000`.

---

### Task 2: Prisma schema, client, and database

**Files:** Create `prisma/schema.prisma`, `src/lib/db.ts`. Requires the user's `DATABASE_URL` in `.env`.

**Interfaces produced:** `prisma` client from `@/lib/db`; models `User`, `ActivityLog`; enum `Role`.

- [ ] **Step 1:** Create `.env` (gitignored) with `DATABASE_URL="<Jeff's Neon Postgres URL>"` and `NEXTAUTH_SECRET="<random>"` (`openssl rand -base64 32`) and `NEXTAUTH_URL="http://localhost:3000"` and `SEED_TEMP_PASSWORD="TEMP!234"`.
- [ ] **Step 2:** Write `prisma/schema.prisma`:
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { GOD ADMIN EXECUTIVE PREMIUM SECRET CORPORATE }

model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String?
  passwordHash       String
  role               Role     @default(EXECUTIVE)
  isActive           Boolean  @default(true)
  mustChangePassword Boolean  @default(false)
  createdAt          DateTime @default(now())
  lastLoginAt        DateTime?
  activity           ActivityLog[]
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action    String
  detail    String?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}
```
- [ ] **Step 3:** Create `src/lib/db.ts`:
```ts
import { PrismaClient } from '@prisma/client'
const g = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = g.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') g.prisma = prisma
```
- [ ] **Step 4:** Run: `npx prisma migrate dev --name init` then `npx prisma generate`. Expected: migration applied, client generated.
- [ ] **Step 5:** Commit: `git add prisma src/lib/db.ts && git commit -m "feat: prisma schema + client (User, ActivityLog, Role)"`

**Verify:** `npx prisma studio` shows empty `User`/`ActivityLog` tables.

---

### Task 3: Password + roles utilities (TDD)

**Files:** Create `src/lib/password.ts`, `src/lib/roles.ts`, `tests/password.test.ts`, `tests/roles.test.ts`.

**Interfaces produced:** `hashPassword(pw: string): Promise<string>`, `verifyPassword(pw: string, hash: string): Promise<boolean>`; `ROLES` array, `isAdminRole(role): boolean` (true for `GOD`|`ADMIN`), `TIER_LABEL: Record<Role,string>`.

- [ ] **Step 1:** Write `tests/password.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'
describe('password', () => {
  it('hashes and verifies', async () => {
    const h = await hashPassword('TEMP!234')
    expect(h).not.toBe('TEMP!234')
    expect(await verifyPassword('TEMP!234', h)).toBe(true)
    expect(await verifyPassword('wrong', h)).toBe(false)
  })
})
```
- [ ] **Step 2:** Run `npm test` → FAILS (module not found).
- [ ] **Step 3:** Write `src/lib/password.ts`:
```ts
import bcrypt from 'bcryptjs'
export const hashPassword = (pw: string) => bcrypt.hash(pw, 12)
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash)
```
- [ ] **Step 4:** Write `src/lib/roles.ts`:
```ts
import type { Role } from '@prisma/client'
export const ROLES: Role[] = ['GOD','ADMIN','EXECUTIVE','PREMIUM','SECRET','CORPORATE']
export const isAdminRole = (r: Role) => r === 'GOD' || r === 'ADMIN'
export const isGod = (r: Role) => r === 'GOD'
export const TIER_LABEL: Record<Role,string> = {
  GOD:'God', ADMIN:'Admin', EXECUTIVE:'Executive', PREMIUM:'Premium', SECRET:'Secret', CORPORATE:'Corporate',
}
```
- [ ] **Step 5:** Write `tests/roles.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isAdminRole, isGod } from '@/lib/roles'
describe('roles', () => {
  it('admin roles', () => { expect(isAdminRole('GOD')).toBe(true); expect(isAdminRole('PREMIUM')).toBe(false) })
  it('god', () => { expect(isGod('GOD')).toBe(true); expect(isGod('ADMIN')).toBe(false) })
})
```
- [ ] **Step 6:** Run `npm test` → PASS. Commit: `git commit -am "feat: password + roles utils (tested)"`

---

### Task 4: NextAuth credentials + session with role

**Files:** Create `src/lib/auth.ts`, `src/lib/session.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/activity.ts`, `types/next-auth.d.ts`.

**Interfaces produced:** `authOptions`; `getSession()` (server); `requireRole(roles: Role[])`; `logActivity(userId, action, detail?)`.

- [ ] **Step 1:** `src/lib/activity.ts`:
```ts
import { prisma } from '@/lib/db'
export const logActivity = (userId: string, action: string, detail?: string) =>
  prisma.activityLog.create({ data: { userId, action, detail } }).catch(() => null)
```
- [ ] **Step 2:** `src/lib/auth.ts`:
```ts
import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { logActivity } from '@/lib/activity'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c?.password) return null
        const u = await prisma.user.findUnique({ where: { email: String(c.email).toLowerCase() } })
        if (!u || !u.isActive) return null
        if (!(await verifyPassword(String(c.password), u.passwordHash))) return null
        await prisma.user.update({ where: { id: u.id }, data: { lastLoginAt: new Date() } })
        await logActivity(u.id, 'LOGIN')
        return { id: u.id, email: u.email, name: u.name ?? undefined, role: u.role, mustChangePassword: u.mustChangePassword }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.uid = (user as any).id; token.role = (user as any).role; token.mcp = (user as any).mustChangePassword }
      return token
    },
    async session({ session, token }) {
      (session as any).userId = token.uid; (session as any).role = token.role; (session as any).mustChangePassword = token.mcp
      (session as any).impersonating = token.impersonating ?? null
      return session
    },
  },
}
```
- [ ] **Step 3:** `types/next-auth.d.ts` augment `Session`/`JWT` with `userId`, `role`, `mustChangePassword`, `impersonating`. (Declare module `next-auth` and `next-auth/jwt`.)
- [ ] **Step 4:** `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```
- [ ] **Step 5:** `src/lib/session.ts`:
```ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export const getSession = () => getServerSession(authOptions)
```
- [ ] **Step 6:** Wrap the app in a `SessionProvider` client component in `src/app/layout.tsx`.
- [ ] **Step 7:** Verify `npx tsc --noEmit` passes. Commit: `git commit -am "feat: NextAuth credentials + role session + activity log"`

---

### Task 5: Seed the two God accounts

**Files:** Create `prisma/seed.ts`; add `prisma.seed` config + `db:seed` script.

- [ ] **Step 1:** `prisma/seed.ts`:
```ts
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'
const prisma = new PrismaClient()
const temp = process.env.SEED_TEMP_PASSWORD
async function main() {
  if (!temp) throw new Error('SEED_TEMP_PASSWORD not set')
  const hash = await hashPassword(temp)
  for (const email of ['jeff.cline@me.com', 'krystalore@thecrewscoach.com']) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, role: 'GOD', passwordHash: hash, mustChangePassword: true, name: email.split('@')[0] },
    })
  }
  console.log('Seeded 2 GOD accounts (must change password on first login)')
}
main().finally(() => prisma.$disconnect())
```
- [ ] **Step 2:** package.json: `"prisma": { "seed": "tsx prisma/seed.ts" }`; `npm i -D tsx`; add script `"db:seed": "DOTENV_CONFIG_PATH=.env tsx -r dotenv/config prisma/seed.ts"` (`npm i -D dotenv`).
- [ ] **Step 3:** Run `npm run db:seed`. Expected: "Seeded 2 GOD accounts".
- [ ] **Step 4:** Verify in `npx prisma studio`: both users exist, `role=GOD`, `mustChangePassword=true`, `passwordHash` is a bcrypt string (not `TEMP!234`).
- [ ] **Step 5:** Commit: `git commit -am "feat: seed two God accounts (hashed temp pw, force change)"`

---

### Task 6: Login page + middleware gate + force-password-change

**Files:** Create `src/middleware.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/change-password/page.tsx`, `src/app/api/account/change-password/route.ts`.

**Interfaces consumed:** `authOptions`, `getSession`, `hashPassword`, `verifyPassword`, `logActivity`.

- [ ] **Step 1:** `src/middleware.ts` (protect `(member)` + `(admin)`; force change-password; keep marketing public):
```ts
export { default } from 'next-auth/middleware'
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*', '/change-password'] }
```
Then extend with a wrapper that, if `token.mcp === true` and path !== `/change-password`, redirects to `/change-password`; and if path starts `/admin` and `!isAdminRole(token.role)`, redirects to `/dashboard`. (Use `withAuth` from `next-auth/middleware` with an `authorized`/callback.)
- [ ] **Step 2:** `src/app/(auth)/login/page.tsx`: client form (email, password) calling `signIn('credentials', { email, password, callbackUrl: '/dashboard' })`; on error show "Invalid email or password."
- [ ] **Step 3:** `src/app/api/account/change-password/route.ts` (POST): auth required; body `{ currentPassword?, newPassword }` validated with zod (min 10 chars); if `mustChangePassword` is false require `currentPassword` to verify; hash new, set `passwordHash`, `mustChangePassword=false`; `logActivity(uid,'PASSWORD_CHANGED')`.
- [ ] **Step 4:** `src/app/(auth)/change-password/page.tsx`: form posting to that route; on success redirect to `/dashboard`.
- [ ] **Step 5:** Verify manually: seed → `npm run dev` → log in as `jeff.cline@me.com` / `TEMP!234` → forced to `/change-password` → set new pw → land on `/dashboard`. Logging out and back in with the new pw works; old pw fails.
- [ ] **Step 6:** Commit: `git commit -am "feat: login, route guards, force-change-password flow"`

---

### Task 7: Impersonation (TDD for the token logic) + banner

**Files:** Create `src/lib/impersonation.ts`, `tests/impersonation.test.ts`, `src/app/api/admin/impersonate/route.ts`, `src/components/ImpersonationBanner.tsx`. Modify `src/lib/auth.ts` jwt callback to carry `impersonating`.

**Interfaces produced:** session field `impersonating: { userId, email, role } | null`; effective-role helper `effectiveRole(session)`.

- [ ] **Step 1:** `tests/impersonation.test.ts`: test `effectiveRole` returns the impersonated role when impersonating, else the real role.
```ts
import { describe, it, expect } from 'vitest'
import { effectiveRole } from '@/lib/impersonation'
describe('impersonation', () => {
  it('uses impersonated role when set', () => {
    expect(effectiveRole({ role:'GOD', impersonating:{ role:'PREMIUM' } } as any)).toBe('PREMIUM')
    expect(effectiveRole({ role:'GOD', impersonating:null } as any)).toBe('GOD')
  })
})
```
- [ ] **Step 2:** Run `npm test` → FAIL. Write `src/lib/impersonation.ts` with `effectiveRole(s)`. Run → PASS.
- [ ] **Step 3:** `POST /api/admin/impersonate` (GOD only): body `{ userId }`; look up target; set `impersonating` on the JWT via a NextAuth session update (`unstable_update`/`jwt` trigger) — store `{ userId, email, role }`; `logActivity(godId,'IMPERSONATE_START', targetEmail)`. `DELETE` clears it; `logActivity(godId,'IMPERSONATE_STOP')`.
- [ ] **Step 4:** Update `authOptions.callbacks.jwt` to accept `trigger==='update'` and merge `session.impersonating`.
- [ ] **Step 5:** `ImpersonationBanner.tsx`: if `session.impersonating`, render a fixed top banner "Viewing as {email} ({role}) — Exit" that calls `DELETE /api/admin/impersonate` then refreshes. Render it in the member/admin layouts.
- [ ] **Step 6:** Verify: as God, open a user, click "View as", confirm banner + that member views reflect the impersonated tier; Exit restores God. `ActivityLog` has IMPERSONATE_START/STOP.
- [ ] **Step 7:** Commit: `git commit -am "feat: impersonation (view-as) with banner + activity logging"`

---

### Task 8: Admin user management API + UI

**Files:** Create `src/app/api/admin/users/route.ts`, `src/app/api/admin/users/[id]/route.ts`, `src/app/(admin)/admin/users/page.tsx`. Uses `requireRole(['GOD','ADMIN'])`.

**Interfaces produced:** REST — `GET /api/admin/users` → `User[]` (no hashes); `POST` create `{ email, name, role, tempPassword }` (hash it, set `mustChangePassword=true`); `PATCH /api/admin/users/[id]` update `{ name?, role?, isActive? }` (only GOD may set role `GOD`/`ADMIN`); `DELETE` sets `isActive=false`.

- [ ] **Step 1:** Implement the two API route files with zod validation and role guards (ADMIN cannot create/edit GOD or ADMIN; only GOD can). Every mutation `logActivity`.
- [ ] **Step 2:** `admin/users/page.tsx` (server component fetches list) + a client table: create-user modal (email, name, role select from `ROLES`, temp password), inline role dropdown, activate/deactivate, "View as" button (calls impersonate API).
- [ ] **Step 3:** Verify: as God create an EXECUTIVE user with a temp pw → log in as them (forced change) → confirm tier shown; change their role to PREMIUM from admin; deactivate → they can't log in.
- [ ] **Step 4:** Commit: `git commit -am "feat: admin user management (CRUD, roles, create God/Admin)"`

---

### Task 9: Activity dashboard (admin home)

**Files:** Create `src/app/(admin)/admin/page.tsx`, `src/app/api/admin/activity/route.ts`.

- [ ] **Step 1:** `GET /api/admin/activity?userId=&limit=` returns recent `ActivityLog` joined with user email, newest first (default 100).
- [ ] **Step 2:** `admin/page.tsx`: KPI row (total users, active, per-tier counts) + a timestamped/datestamped activity feed (user email · action · detail · date-time), filter by user.
- [ ] **Step 3:** Verify: logins, password changes, impersonation, and user edits all appear with timestamps.
- [ ] **Step 4:** Commit: `git commit -am "feat: admin activity dashboard (who's doing what, timestamped)"`

---

### Task 10: Member area shell (gated)

**Files:** Create `src/app/(member)/dashboard/page.tsx`, `(member)/layout.tsx`.

- [ ] **Step 1:** Member layout: renders `ImpersonationBanner` + a simple member nav; server-guards via `getSession()` (redirect to `/login` if none).
- [ ] **Step 2:** `dashboard/page.tsx`: greet by name, show tier badge (`TIER_LABEL[effectiveRole]`), and placeholder cards "Your Videos (coming soon)" and "Community (coming soon)".
- [ ] **Step 3:** Verify: logged-out `/dashboard` redirects to `/login`; logged-in shows the correct tier (and the impersonated tier when a God is viewing-as).
- [ ] **Step 4:** Commit: `git commit -am "feat: gated member dashboard shell"`

---

### Task 11: Marketing site — port the Beyond Limits Bootcamp pages

**Files:** Create `src/app/(marketing)/page.tsx`, `src/app/(marketing)/_sections/*`, `src/components/layout/{Header,Footer}.tsx`, copy needed images into `public/images/`.

- [ ] **Step 1:** Copy the bootcamp page content/sections from Krystalore `~/Desktop/Kastle/app/bootcamp/page.tsx` as the starting point (hero "Train Like Your Life Depends on It. Because It Does.", 34-Minute Method, Strong-isn't-a-look, What We (Don't) Believe, You'll Build, expert feature, Beyond Limits vs Traditional comparison, Who This Is (Not) For, No Matter What Standard, Choose Your Plan pricing, CTAs, orange-glow headings). Copy referenced images (`bootcamp/*`, `krystalore/speaker-event-ros.jpg`) into this repo's `public/images/`. **Copy only — never import across repos.**
- [ ] **Step 2:** Build a lightweight `Header` (logo + Login / Join buttons → `/login`) and `Footer` for this standalone brand.
- [ ] **Step 3:** Point pricing "Select Plan"/CTAs at a placeholder `/join` (GHL wiring is Phase 3) — for now `/join` → `/login` or a "checkout coming soon" note.
- [ ] **Step 4:** Verify: `/` renders the full premium page; Login button reaches `/login`; `npx tsc --noEmit` + `npm run build` pass.
- [ ] **Step 5:** Commit: `git commit -am "feat: Beyond Limits Bootcamp marketing site (ported)"`

---

### Task 12: Production readiness + deploy docs

**Files:** Update `README.md`, add `.env.example`, verify build.

- [ ] **Step 1:** `.env.example` documenting `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SEED_TEMP_PASSWORD` (no real values).
- [ ] **Step 2:** README: local setup (install, `.env`, `prisma migrate deploy`, `db:seed`, `dev`) + deploy steps (Vercel import repo, set env vars, add domain, DNS `76.76.21.21` / `cname.vercel-dns.com`, run seed once).
- [ ] **Step 3:** Run `npm run build` → passes. Commit + push: `git push origin main`.
- [ ] **Step 4:** Handoff note: Jeff creates the Vercel project, sets env (incl. `SEED_TEMP_PASSWORD`), adds the domain + DNS; run migrate + seed against prod DB once.

---

## Self-Review

- **Spec coverage:** marketing site (T11), auth/login (T4,T6), 5 tiers + ADMIN (T2,T3), admin console + create God/Admin (T8), impersonation (T7), activity dashboard (T9), seeded God accounts + force-change (T5,T6), member shell (T10), isolation (Global Constraints + T1), deploy/DB provisioning (T2,T12). All spec sections map to a task.
- **Placeholders:** none — deferred phases are explicitly out of scope, not "TODO".
- **Type consistency:** `Role` enum, `effectiveRole`, `isAdminRole`, `logActivity`, `authOptions` names are consistent across tasks.
- **Prereq gate:** Tasks 2, 5, 12 need Jeff's `DATABASE_URL` (Neon). Tasks 1, 3, 4, 7 (logic/tests) can proceed before the DB exists.
