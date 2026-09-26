# AGENT.md — Huipper CodeCanyon JavaScript Tech Stack Standard

This file tells any coding agent (or new developer) how to build, extend, and ship
Huipper CodeCanyon products in the JavaScript / Node.js category. Follow it unless
the product has a clear, documented technical reason to deviate.

## 0. Migration Context — Source Project: PlayTube

This repo starts life as **PlayTube**, a PHP & MySQL video sharing platform. The
goal of this migration is to re-implement it fully on the Huipper standard stack
(Section 1), not to wrap or bridge the PHP app.

**Source stack (to be replaced):**

| Layer | PlayTube (source) | Target (Huipper standard) |
|---|---|---|
| Language/Runtime | PHP | TypeScript / Node.js 24 LTS |
| Framework | Plain PHP (no stated framework) | Next.js 16 App Router |
| Database | MySQL / MariaDB | PostgreSQL 16+ |
| Data access | Raw PHP + `mysqli` | Drizzle ORM + `pg` |
| Web server | Apache/Nginx or PHP built-in server | Next.js server (Node), Nginx + PM2 in prod |
| Auth | PlayTube's own PHP session/auth | Better Auth |
| File uploads | PHP filesystem handling | Storage abstraction (local / S3-compatible) |
| Frontend | Server-rendered PHP templates | React Server/Client Components + Tailwind + shadcn/ui |

### Completeness requirement — no silent partial migrations
Incomplete migrations (missing pages, missing routes, mismatched theming) are a
process failure, not an acceptable outcome. To prevent this:

1. **Build a full inventory before writing any code**, not as you go. Walk the
   entire PlayTube source and produce a manifest file (e.g.
   `documentation/migration-manifest.md`) listing, exhaustively:
   - Every route/page (public site, auth, user dashboard, admin panel — check PHP
     router/`.htaccess`/front controller and every file under the views/pages
     folders, not just the obvious ones).
   - Every distinct UI component/template partial and its states.
   - Every DB table and every PHP feature/module that reads or writes it.
   - Every background job, cron task, and scheduled/queued process.
   This manifest is the single source of truth for scope — the agent must not
   infer scope from memory or from "the main pages" alone.
2. **Track status per item, in that same file**, e.g. `Not started / In progress /
   Built / Verified`. Update it as work proceeds. Never mark an item "Verified"
   without checking it against Section 0's UI/UX parity requirement and Section 10's
   checklist.
3. **Never report the migration as complete while any manifest item is not
   `Verified`.** If a session or context runs out before everything is done, the
   agent must end by stating explicitly what remains outstanding (referencing the
   manifest), not imply completion.
4. **Route parity check is mandatory before sign-off.** Enumerate every route in
   the old PHP app and confirm a corresponding route exists and works in the new
   Next.js app (same URL structure where reasonable, or an explicit, documented
   redirect/rename). A route that silently doesn't exist in the new app is a
   migration bug, not an omission to raise later.
5. **Theming must be derived from the manifest's screenshots, not assumed.** If a
   page's colors/typography/spacing don't match the Section 0 UI/UX parity
   requirement, that page is not "Built" — it goes back to `In progress`.
6. **Prefer finishing fewer pages completely over starting many pages partially.**
   Work the manifest top to bottom (or by module) and fully complete + verify each
   item before moving to the next, rather than scaffolding everything shallowly.

### UI/UX parity requirement — non-negotiable
The migrated product's UI/UX must be **visually and behaviorally identical** to
the current PlayTube frontend. This is a backend/stack migration, not a redesign.

- **Treat PlayTube's rendered frontend as the design spec.** Before rebuilding a
  page, extract it from the existing PHP templates/views (and their compiled
  CSS/JS, e.g. under `public/`, `assets/`, `templates/`, or theme folders) — layout,
  spacing, colors, typography, breakpoints, icons, copy text, and component states
  (hover, active, disabled, empty, loading, error) all need to match.
- **Screenshot/record the current app** (desktop + mobile breakpoints, light/dark
  mode if it has one) for every page/flow before touching it, and use those as the
  literal reference when building the Next.js version. Diff the new page against
  the screenshot before marking it done.
- **Reproduce, don't reinterpret shadcn/ui defaults.** shadcn/ui + Tailwind is the
  *implementation* toolkit (Section 1), not a license to apply its default look.
  Theme Tailwind config / CSS variables and customize shadcn components (colors,
  radii, spacing, fonts, icon set) to match PlayTube's existing visual identity
  exactly, rather than shipping shadcn's stock styling.
- **Keep interaction behavior identical**: navigation structure, URL patterns
  where reasonable, form validation messages and triggers, modal/toast behavior,
  pagination/infinite-scroll behavior, video player controls and layout, and
  admin dashboard layout should all behave the same way a user already expects.
- **Any unavoidable visual deviation must be flagged, not silently introduced.**
  If something can't be reproduced 1:1 (e.g. a PHP templating quirk, a JS library
  swap), call it out explicitly to the user/reviewer rather than quietly shipping
  a different look.
- **Verify parity as part of the Section 10 checklist**: add a manual/visual
  side-by-side pass (old PlayTube page vs. new page) for every migrated screen
  before it's considered release-ready.

### Migration principles
1. **Rebuild, don't transpile.** Do not attempt to auto-convert PHP files line by
   line. Read PlayTube's PHP source and MySQL schema to understand *behavior and
   data model*, then re-implement that behavior idiomatically in the target stack
   (Server Components/Actions, Drizzle schema, services, etc.), per Sections 3–5.
2. **Schema first.** Reverse-engineer the existing MySQL schema (tables, columns,
   indexes, foreign keys) into a `db/schema/` Drizzle schema targeting PostgreSQL.
   Note and resolve MySQL → Postgres differences as they come up: `AUTO_INCREMENT`
   → `serial`/`identity`, `ENUM` columns → Postgres enums or check constraints,
   `TINYINT(1)` booleans → `boolean`, `DATETIME`/`TIMESTAMP` handling and timezone
   behavior, `utf8mb4` collation nuances, and MySQL-specific functions used in
   queries or triggers.
3. **Data migration path.** Plan a one-time ETL from the existing MySQL database
   into PostgreSQL (e.g. a `scripts/migrate-from-mysql.ts` script): connect to the
   source MySQL DB, read each table, transform rows to match the new Drizzle
   schema/types, and insert via Drizzle. Keep this script in `scripts/` alongside
   `setup.ts` and `seed.ts`, and make it idempotent/re-runnable where practical.
4. **Feature-by-feature parity map.** Before writing code, inventory PlayTube's
   features (user accounts, video upload/transcoding, channels, comments, likes,
   playlists, categories, search, admin panel, monetization/ads if present, etc.)
   and map each to a `src/modules/<feature>/` in the new structure (Section 4).
   Flag anything PHP-specific (e.g. a PHP video-processing library, a specific
   image library via `gd`) that needs a Node-compatible replacement (e.g.
   `fluent-ffmpeg`/`ffmpeg` for transcoding, `sharp` for image processing).
5. **Auth migration.** PlayTube almost certainly stores passwords with PHP's
   `password_hash` (bcrypt). Better Auth must be configured to verify against that
   existing hash format for migrated users' first login (or force a password reset
   flow) rather than assuming a fresh credential scheme.
6. **File storage migration.** Existing uploaded videos/thumbnails/avatars on the
   PHP server's filesystem should be moved into the new storage abstraction
   (Section 6) — copy into `local` storage for like-for-like VPS deployment, or
   upload into S3-compatible storage if the target deployment is Vercel/S3.
7. **No PHP runtime in the final product.** The delivered product should not
   require PHP, Apache/Nginx-for-PHP, or `mysqli` at runtime — those are strictly
   describing the *old* environment being replaced. The new project's runtime
   requirements are exactly Section 1 (Node.js 24 LTS, PostgreSQL, etc.).
8. **Cut over, verify, retire.** Stand up the new stack alongside the old one,
   migrate data, verify feature parity (use the Section 10 checklist plus manual
   comparison against PlayTube for core flows: register/login, upload/watch video,
   comment, admin moderation), then retire the PHP/MySQL deployment.

### Suggested migration workflow for the agent
1. Inventory PlayTube's PHP source: routes/pages, DB schema (`SHOW CREATE TABLE`
   per table or an existing `.sql` dump), auth logic, upload/storage logic, and any
   cron/background jobs.
2. Scaffold the new Next.js project per Sections 1 and 4.
3. Port the schema to `db/schema/` (Drizzle) and generate/apply migrations.
4. Rebuild features module by module (auth → users/profiles → video upload/playback
   → comments/likes → channels/playlists → admin dashboard → search), following the
   server-first and validation rules in Section 5.
5. Write `scripts/migrate-from-mysql.ts` to backfill data from the old database.
6. Wire up `npm run setup` (Section 8) so a fresh install of the *new* product no
   longer depends on PHP/MySQL at all — MySQL is only ever read from as a migration
   source, never as a runtime dependency of the shipped product.
7. Run the Section 10 quality checklist before considering any module done.

## 1. Locked Stack

| Layer | Standard |
|---|---|
| Framework | Next.js 16.x (App Router) |
| Language | TypeScript |
| Runtime | Node.js 24 LTS |
| Database | PostgreSQL 16+ |
| ORM | Drizzle ORM |
| DB Driver | pg |
| Authentication | Better Auth |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui + Radix UI |
| Icons | Lucide React |
| Validation | Zod |
| Forms | React Hook Form |
| Tables | TanStack Table |
| Charts | Recharts |
| Client State | Zustand (only when actually needed) |
| Animation | Motion |
| Email | Nodemailer + SMTP |
| Storage | Local + S3-compatible adapter |
| Testing | Vitest + Playwright |
| Package Manager | npm (for distributed packages) |

**Core architecture:** Next.js full-stack + TypeScript + PostgreSQL + Drizzle +
Better Auth. Keep the product self-hostable. Avoid mandatory vendor-specific services.

## 2. Why This Stack

- One full-stack codebase covers public pages, auth, user dashboard, admin
  dashboard, API routes, and SEO.
- PostgreSQL gives a solid relational base for users, roles, permissions, plans,
  subscriptions, products, orders, invoices, logs, analytics.
- Drizzle keeps the data layer lightweight, SQL-friendly, and portable across hosts.
- Better Auth keeps auth self-hosted — no forced Clerk / Firebase / Supabase Auth.
- Tailwind CSS 4 + shadcn/ui gives buyers editable source components, not a locked
  proprietary UI framework.
- Same source runs on localhost, Vercel, Dokploy, a plain VPS, or Docker.

## 3. Application Architecture

```
Next.js
 |
 +-- Public Website
 +-- Authentication
 +-- User Dashboard
 +-- Admin Dashboard
 +-- Server Components
 +-- Server Actions
 +-- Route Handlers / API
 |
 v
 Service Layer
 |
 v
 Drizzle ORM
 |
 v
 PostgreSQL
```

Do **not** add Express or NestJS to the default base project. Only introduce a
separate backend when the product needs a public API for multiple clients, mobile
apps, heavy WebSocket infrastructure, workers, or multiple frontends.

## 4. Project Structure

```
src/
+-- app/
|   +-- (public)/
|   +-- (auth)/
|   +-- (dashboard)/
|   +-- admin/
|   +-- api/
|
+-- modules/
|   +-- auth/
|   +-- users/
|   +-- roles/
|   +-- permissions/
|   +-- settings/
|   +-- notifications/
|   +-- uploads/
|
+-- components/
|   +-- ui/
|   +-- common/
|   +-- layout/
|   +-- forms/
|
+-- db/
|   +-- index.ts
|   +-- schema/
|   +-- migrations/
|   +-- seed/
|
+-- lib/
|   +-- auth/
|   +-- mail/
|   +-- storage/
|   +-- security/
|
+-- config/
+-- hooks/
+-- services/
+-- types/

scripts/
+-- setup.ts
+-- seed.ts
+-- create-admin.ts
+-- health-check.ts

tests/
+-- unit/
+-- e2e/

documentation/
public/
drizzle.config.ts
next.config.ts
package.json
.env.example
Dockerfile
README.md
```

## 5. Development Rules

### Server-first
- Prefer Server Components for initial data loading.
- Use Server Actions and services for internal application operations.
- Use client components only where interactivity actually requires them.
- Avoid unnecessary `"use client"` directives.
- Avoid database calls directly inside page components — keep business logic in
  modules/services.
- Reserve `/api/v1` routes for public integrations, webhooks, or functionality that
  truly needs an HTTP API.
- Use Zustand only for meaningful client-side global state.

### Validation flow
```
Form -> Zod validation -> Server Action / Route Handler -> Zod validation -> Service -> Database
```
Never rely only on browser-side validation.

### Database
- PostgreSQL 16 or newer.
- Use `DATABASE_URL` so the app connects to local Postgres or any managed provider.
- Keep migrations in source control.
- Provide production-safe seed scripts for default roles, permissions, settings,
  and the administrator account.
- Do not lock the codebase to Supabase, Neon, Railway, or any specific Postgres
  provider.

### Authentication
- Better Auth with database-backed sessions.
- Cover login, registration, logout, email verification, forgot password, reset
  password, and session management.
- Admin authentication and role-based authorization.
- Google/GitHub/other OAuth providers must be optional, not required.

## 6. Email and File Storage

### Email
Default delivery is SMTP via Nodemailer:
```
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
```
Brevo, SendGrid, Resend, Mailgun, or Amazon SES may be supported later, but none
should be mandatory.

### Storage
Use a storage abstraction so deployment isn't tied to one provider:
```
STORAGE_DRIVER=local
# Optional S3-compatible mode
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```
- Local storage → localhost, standard VPS, or Dokploy with a persistent volume.
- S3-compatible storage → Vercel, or customers who prefer object storage
  (AWS S3, Cloudflare R2, Wasabi, DigitalOcean Spaces, MinIO).

## 7. Deployment Support

| Environment | Supported | Database | Storage |
|---|---|---|---|
| Localhost | Yes | Local or remote PostgreSQL | Local |
| Vercel | Yes | Managed PostgreSQL | S3-compatible |
| Dokploy | Yes | Dokploy PostgreSQL or remote | Local volume or S3 |
| Ubuntu VPS | Yes | Local PostgreSQL | Local or S3 |
| Docker | Optional | PostgreSQL container or remote | Volume or S3 |

**Local development**
```bash
npm install
npm run setup
npm run dev
```

**Production**
```bash
npm install
npm run setup
npm run build
npm start
```

**Recommended VPS stack:** Ubuntu, Node.js 24 LTS, PostgreSQL, Nginx, PM2.

## 8. Customer Installer

Every product ships a single install command:
```bash
npm run setup
```

The setup process must:
1. Validate Node.js and required environment values.
2. Test the PostgreSQL connection.
3. Generate authentication/application secrets.
4. Run database migrations.
5. Seed default settings.
6. Create default roles and permissions.
7. Create the first administrator account.
8. Report clear installation errors and next steps.

It should prompt for / confirm:
```
Application URL:
Database URL:
Admin Name:
Admin Email:
Admin Password:
```
And report progress like:
```
[OK] Database connected
[OK] Migrations completed
[OK] Roles and permissions created
[OK] Administrator created
[OK] Installation completed
```

## 9. Environment Variables

```
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=

DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=

STORAGE_DRIVER=local
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

## 10. Testing and Release Quality

Use Vitest for unit/integration tests, Playwright for critical end-to-end flows.

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Release checklist — all must pass before shipping:
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No browser console errors
- [ ] No broken routes
- [ ] No unhandled promises
- [ ] No production warnings that affect the buyer
- [ ] Critical auth, admin, CRUD, payment, and setup flows tested where applicable

## 11. Optional Technologies

Add only when the product genuinely requires them:
- Redis
- BullMQ or other queue workers
- WebSockets
- Docker
- S3
- OAuth providers
- External payment gateways
- Separate API backend

## 12. Never Make These Mandatory

Do not bake these in as hard dependencies of the reusable base application
(fine to use when a specific product needs them):
- MongoDB
- Supabase
- Firebase
- Clerk
- Cloudinary
- Vercel
- Redis
- Docker
- Express
- NestJS
- Turborepo
- Microservices

## 13. Summary — Final Huipper Standard

**Locked baseline:**
Next.js 16 + TypeScript + Node.js 24 LTS + PostgreSQL + Drizzle ORM + Better Auth +
Tailwind CSS 4 + shadcn/ui + Radix UI + Lucide + Zod + React Hook Form +
TanStack Table + Recharts + Motion + SMTP + Local/S3 Storage.

**Main goal:** modern architecture, clean code, easy customization, straightforward
installation, no unnecessary vendor lock-in, and the ability to deploy the same
source code to Localhost, Vercel, Dokploy, Ubuntu VPS, or Docker.

---

### Agent behavior notes
When working in a repo governed by this standard, an agent should:
- Default to the stack in Section 1 for any new feature or scaffold, not to
  alternatives it may know well (e.g. Prisma, NextAuth, Mongo) unless explicitly
  told to deviate.
- Place new code under the module/service structure in Section 4 rather than
  inlining logic in route handlers or page components.
- Route all form input through the Zod → Server Action → Zod → Service → DB chain
  in Section 5.
- Keep any new integration (email, storage, OAuth, payments) optional and
  provider-agnostic per Sections 6 and 12.
- Update `.env.example` and the `npm run setup` script whenever new environment
  variables or install steps are introduced.
- Run the full checklist in Section 10 before considering a change release-ready.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
