# HANDOFF — Beyond Limits Bootcamp

You are taking over an in-progress build. Read this fully, then read the repo's
committed spec, plan, and progress ledger before doing anything.

## PROJECT
A premium performance/lifestyle brand + membership platform for a fitness/emotional/
somatic coach (Krystalore Crews) focused on executives & entrepreneurs.

## Locations (work ONLY here)
- Local:  `/Users/jeffcline/Desktop/bootcamp`  (git branch `feat/foundation`; prod branch `main`)
- GitHub: `github.com/jeff-cline/bootcamp`  (main + feat/foundation, synced)
- Vercel: project **bootcamp** under jeff-clines-projects (CLI authed as `jeffcline-1798`)
- LIVE:   https://beyondlimitsbootcamp.com  and  https://bootcamp-black-seven.vercel.app

## HARD ISOLATION RULE
Standalone project. You MAY **read** from `/Users/jeffcline/Desktop/Kastle` (the
"Krystalore core") to COPY code/patterns/components. You must NEVER write to, modify, or
delete anything under `/Users/jeffcline/Desktop/Kastle` or any other project. All writes
go under `/Users/jeffcline/Desktop/bootcamp` only. Reuse the core wherever it saves work.

## READ THESE FIRST (in the repo)
- Spec:   `docs/superpowers/specs/2026-07-15-beyond-limits-foundation-design.md`
- Plan:   `docs/superpowers/plans/2026-07-15-foundation.md`  (12 TDD tasks)
- Ledger: `.superpowers/sdd/progress.md`  (which tasks are DONE — do NOT redo them)

## STATE
**DONE and LIVE:**
- **Task 1** — Next.js 15 app scaffolded (App Router, TS, Tailwind, `src/`, `@/*` alias, vitest).
- **Task 11** — full premium marketing homepage ported from the Krystalore `/bootcamp` page
  (hero "Train Like Your Life Depends on It. Because It Does.", 34-Minute Method,
  Strong-isn't-a-look, What We (Don't) Believe, You'll Build, expert feature + "Secret
  Weapon", Beyond Limits vs Traditional comparison, Who This Is (Not) For, No Matter What
  Standard, Choose Your Plan pricing, orange-glow headings) with a standalone Header/Footer.
  Builds clean with NO database. Deployed to production.

**REMAINING (Phase 1 foundation — plan tasks 2,3,4,5,6,7,8,9,10,12)**, all blocked on a
database (below): Prisma schema (`User`, `ActivityLog`, roles `GOD/ADMIN/EXECUTIVE/PREMIUM/
SECRET/CORPORATE`) → seed two GOD accounts → NextAuth email/password login → force-change-
password → impersonation ("view as") → admin console (user CRUD, create God/Admin) →
activity dashboard (who's doing what, timestamped) → gated member area.

## THE ONE BLOCKER — get this from Jeff (the user)
You need a Postgres connection string. **Decision already made with Jeff:** reuse his
existing database SERVER (shared across his projects), but isolate this app in its OWN
schema — append `?schema=beyondlimits` to the connection string. Do NOT point at the same
tables as any other project (Prisma migrations would collide and could drop another site's
data). Put it in a gitignored `.env` (`DATABASE_URL`, plus `NEXTAUTH_SECRET` via
`openssl rand -base64 32`, `NEXTAUTH_URL`, `SEED_TEMP_PASSWORD`) and in Vercel env —
NEVER commit secrets. Ask Jeff to paste the `postgresql://…` string.

## GOD ACCOUNTS (seed these)
- `jeff.cline@me.com` and `krystalore@thecrewscoach.com`
- Temp password (env only, bcrypt-hashed, NEVER hardcoded): `SEED_TEMP_PASSWORD=TEMP!234`
- Both: role `GOD`, `mustChangePassword=true` (forced reset on first login). Treat `TEMP!234`
  as burned; the forced reset covers it.

## HOW TO DEPLOY (from the repo dir, already linked to Vercel)
- `npx vercel --prod`  (CLI authed as `jeffcline-1798`; deploys live).
- After adding Prisma, set `DATABASE_URL` in Vercel env, then run migrate + seed once
  against the prod DB.
- Optional: connect GitHub in the Vercel **bootcamp** project (Settings → Git) for
  push-to-deploy instead of CLI.

## METHODOLOGY
Execute the plan task-by-task with TDD and frequent commits (superpowers
subagent-driven-development or executing-plans). Each task ends green (tsc/tests/build).
Append completed tasks to the ledger. Do NOT break the live marketing site.

## FULL PRODUCT VISION (build phase by phase; only Phase 1 is spec'd in detail — write a
new spec+plan for each later phase before building it)
- **Phase 2 — Members & Video:** StreamYard live + saved VOD, gated so only approved,
  logged-in members see live/replays. StreamYard has no public API for private feeds —
  realistic path is StreamYard → custom RTMP → Mux or Cloudflare Stream (live + VOD),
  embedded gated player. On each saved video, admin sets title/description/timestamp/date.
  Multistream to members here + multiple Facebook accounts.
- **Phase 3 — Monetization:** GoHighLevel checkout (hosted checkout URLs + API key/webhook
  granting membership tiers) + drip campaigns; coupon manager; affiliate `/shop` (upload
  affiliate images/titles/text + CTA links); white-label brand-deal landers (doctors,
  massage therapists, etc.); white-label.
- **Phase 4 — Engagement:** chat that emails `krystalore@thecrewscoach.com`; built-in CRM
  (timestamped customer interactions, text updates/broadcast); community tab (groups, group
  chat, gamification — Facebook-for-fitness); habit tracker (the 34-Minute Method 2/30/2 +
  meal planning as a premium offer); groups/schedules/progress like Trainerize.
- **Admin throughout:** God can create more God/Admin accounts and impersonate every tier
  to see what they see.

## START HERE
Read the spec + plan + ledger, confirm the DB connection string with Jeff (isolated
`?schema=beyondlimits`), then resume the plan at the first task not marked complete in the
ledger. Do not re-run tasks the ledger already marks DONE.
