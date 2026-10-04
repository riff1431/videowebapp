# PlayTube (Next.js 16 + TypeScript + PostgreSQL)

A high-performance, self-hostable video sharing platform built with Next.js 16 App Router, TypeScript, PostgreSQL (via Drizzle ORM), Better Auth, and Tailwind CSS. This project replaces the legacy PHP/MySQL PlayTube stack with a modern full-stack TypeScript architecture while providing complete UI/UX fidelity and a multi-theme engine.

---

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Default Administrator Account](#default-administrator-account)
- [Theming System](#theming-system)
  - [How Theming Works](#how-theming-works)
  - [Theme Structure & Layout Isolation](#theme-structure--layout-isolation)
  - [Adding a New Theme](#adding-a-new-theme)
  - [Theme Contract & Drift Validation](#theme-contract--drift-validation)
  - [Theme Preview & Admin Management](#theme-preview--admin-management)
- [Available Scripts](#available-scripts)
- [Testing Suite](#testing-suite)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)

---

## Features

- **Full Video Platform**: Upload, playback (with `react-player` and native HTML5), streaming, transcoding, views tracking, likes/dislikes, comments, nested replies, watch later, playlists, and history.
- **Shorts Experience**: Dedicated vertical 9:16 short-form feed with infinite scrolling, randomized order, keyboard shortcuts, comments panel, and sound controls.
- **Channels & Community**: Custom channel handles (`/@username`), banner/avatar customization, subscriber leaderboard, activity stream, and articles/blog publishing.
- **Admin Control Panel**: 70+ management pages covering site settings, user roles, monetization, advertisements, categories, system health, and theme management.
- **Zero-Drift Multi-Theming**: URL-transparent theme switching engine (`default`, `youplay`, etc.) backed by contract validation and automated generators.
- **Security & Privacy**: Asserted admin actions, banned IP filtering, session-backed authentication via Better Auth, rate limiting, and content sanitization.

---

## Architecture & Tech Stack

| Layer | Standard |
|---|---|
| **Framework** | Next.js 16.x (App Router with Turbopack) |
| **Language** | TypeScript |
| **Runtime** | Node.js 24 LTS |
| **Database** | PostgreSQL 16+ |
| **ORM / Migrations** | Drizzle ORM (`drizzle-kit`, `pg`) |
| **Authentication** | Better Auth (database-backed sessions) |
| **Styling** | Tailwind CSS 4 + scoped theme stylesheets |
| **Icons** | Lucide React + React Icons |
| **Forms & Validation** | React Hook Form + Zod |
| **Video Playback** | React Player (`react-player`) |
| **Testing** | Vitest (API, static audits, theme contracts) + Playwright (E2E) |

---

## Prerequisites

- **Node.js**: v20+ or v24 LTS (recommended)
- **PostgreSQL**: PostgreSQL 16+ running locally or managed (e.g. Supabase, Neon, Railway)
- **Package Manager**: `npm`

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd videowebsite
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your database credentials:

```bash
cp .env.example .env
```

Ensure your `DATABASE_URL` is configured:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/playtube"
BETTER_AUTH_SECRET="your-secure-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database & Seed Data

Run the interactive setup or run push and seed:

```bash
# Push Drizzle schema to PostgreSQL
npm run db:push

# Seed categories, languages, site settings, demo channels, videos, and vertical shorts
npm run seed
```

Or run the full automated installer:

```bash
npm run setup
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Administrator Account

When seeded with default data, the administrative account is:

- **Username**: `admin`
- **Email**: `admin@playtube.local`
- **Password**: `admin`
- **Role**: `admin` (`isAdmin: true`)
- **Admin Panel URL**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Theming System

PlayTube features an enterprise multi-theme architecture that allows full layout and visual divergence without fragmenting URLs or requiring subdomains.

### How Theming Works

1. **Clean Public URLs**: End users access clean URLs like `/`, `/watch/videoId`, `/shorts`, `/channel/name`.
2. **Transparent Middleware Rewriting**:
   - The Next.js proxy/middleware ([`src/proxy.ts`](file:///c:/New%20folder/videowebsite/src/proxy.ts)) inspects incoming requests.
   - It checks the active theme (persisted in the database under `siteConfig.active_theme`, overridable by `FORCE_THEME` env or admin preview cookie).
   - The request is internally rewritten to `/themes/<activeTheme>/...`.
   - Direct public requests directly addressing `/themes/...` are blocked and return a 404 to ensure URL isolation.
3. **Route Fallback**:
   - If an active theme does not implement a specific optional route, the middleware falls back automatically to the fallback theme (`FALLBACK_THEME_ID = "youplay"`).
4. **CSS Scoping**:
   - Each theme wraps its markup in a root container with `data-theme="<themeId>"`.
   - Theme variables and styling are scoped inside `src/app/themes/<themeId>/theme.css` so styles never leak into other themes or the `/admin` dashboard.

### Theme Directory Structure

Themes reside under [`src/app/themes/<themeId>`](file:///c:/New%20folder/videowebsite/src/app/themes):

```
src/app/themes/
├── default/               # Default Theme
│   ├── components/        # Theme-specific components
│   ├── theme.css          # Theme CSS tokens & scoping ([data-theme="default"])
│   ├── layout.tsx         # Theme root shell layout
│   ├── page.tsx           # Homepage
│   ├── watch/[videoId]/   # Watch page
│   ├── shorts/            # Shorts vertical video feed
│   └── ...                # Other public routes
└── youplay/               # YouPlay Theme (and fallback baseline)
    ├── components/
    ├── theme.css
    ├── layout.tsx
    └── ...
```

---

### Adding a New Theme

A dedicated CLI script scaffolds new themes with zero manual boilerplate:

```bash
npm run theme:new -- <theme-id> "<Theme Name>"
```

#### Example:
```bash
npm run theme:new -- darktube "Dark Tube"
```

#### What the generator does automatically:
1. Validates the theme ID (`a-z0-9-` format).
2. Clones the baseline template into `src/app/themes/<theme-id>`.
3. Scopes `theme.css` to `[data-theme="<theme-id>"]`.
4. Updates `layout.tsx` with the new theme ID and shell markers.
5. Registers the theme in [`src/lib/themes.ts`](file:///c:/New%20folder/videowebsite/src/lib/themes.ts).
6. Regenerates the route manifest in [`src/config/theme-manifest.json`](file:///c:/New%20folder/videowebsite/src/config/theme-manifest.json).

---

### Theme Contract & Drift Validation

To ensure no theme silently breaks or drops required pages/controllers during development or releases, PlayTube uses strict **Theme Contracts**:

- **Contract Generator**: Scans the baseline theme and generates route signatures and requirements into [`src/config/theme-contract.json`](file:///c:/New%20folder/videowebsite/src/config/theme-contract.json).
  ```bash
  npm run theme:contract:generate
  ```
- **Contract Checker**: Compares all registered themes against the contract to guarantee zero drift.
  ```bash
  npm run theme:contract:check
  ```
- **Pre-build Hook**: Running `npm run build` or `npm run dev` automatically runs the manifest generator and contract verification checks before building.

---

### Theme Preview & Admin Management

Administrators can preview and switch themes in real-time without affecting active visitors:

1. **Admin Theme Manager**:
   - Navigate to `/admin/manage-themes` or `/admin/change-site-desgin`.
   - Click **Activate** to switch the site-wide active theme.
2. **Instant Preview URL**:
   - Append `?preview_theme=<theme-id>` to any page URL as an admin (e.g. `http://localhost:3000/?preview_theme=youplay`).
   - The middleware sets a secure preview session cookie so you can navigate the entire site in that theme.
   - To exit preview mode: visit `?preview_theme=exit`.
3. **Environment Override**:
   - For continuous integration or staging testing, set `FORCE_THEME=<theme-id>` in your environment.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack (runs `predev` manifest generator first). |
| `npm run build` | Builds the production Next.js application after verifying theme manifests and contracts. |
| `npm run start` | Starts the production Next.js server. |
| `npm run lint` | Runs ESLint across the codebase. |
| `npm run theme:new -- <id> "<Name>"` | Scaffolds a new theme, configures CSS scoping, registers metadata, and updates manifests. |
| `npm run theme:contract:check` | Verifies all themes against route contracts to detect drift or missing pages. |
| `npm run theme:contract:generate`| Updates the theme contract definition based on existing themes. |
| `npm run seed` | Seeds default admin, test users, categories, tags, regular videos, and vertical shorts. |
| `npm run db:push` | Pushes Drizzle ORM schema changes directly to the PostgreSQL database. |
| `npm run db:generate` | Generates SQL migrations from schema definitions. |
| `npm run db:reset` | Resets and truncates database tables. |
| `npm run setup` | Runs the setup wizard for database connection and admin bootstrapping. |
| `npm run cron` | Runs scheduled background jobs (views aggregation, cache cleanup, cleanups). |

---

## Testing Suite

All tests can be executed individually or together:

### Static Analysis & Architecture Audits
Tests security boundaries, admin assertion guards, route parity, and theme contracts:
```bash
npm run test:static
```

### API & Service Tests
Runs Vitest against server actions and API route handlers:
```bash
npm run test:api
```

### Row-Level Security & Auth Tests
Verifies Better Auth permissions and data isolation:
```bash
npm run test:rls
```

### End-to-End (E2E) Browser Tests
Executes Playwright browser test workflows:
```bash
npm run test:e2e
```

### Run All Tests
```bash
npm test
```

---

## Environment Configuration

Key configuration parameters in `.env`:

```env
# Application Settings
NEXT_PUBLIC_APP_NAME="PlayTube"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="postgres://postgres:postgres@localhost:5432/playtube"

# Better Auth
BETTER_AUTH_SECRET="random-secure-string"
BETTER_AUTH_URL="http://localhost:3000"

# Theme Overrides (Optional)
# FORCE_THEME="default"

# Mail (SMTP)
MAIL_HOST="smtp.example.com"
MAIL_PORT="587"
MAIL_USERNAME=""
MAIL_PASSWORD=""
MAIL_FROM_ADDRESS="no-reply@playtube.local"

# Storage
STORAGE_DRIVER="local" # "local" or "s3"
S3_ENDPOINT=""
S3_REGION=""
S3_BUCKET=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
```

---

## Deployment

The application runs seamlessly across all major Node.js deployment environments:

### VPS (Ubuntu / Nginx / PM2)
```bash
git clone <repo>
npm install
npm run setup
npm run build
pm2 start npm --name "playtube" -- start
```

### Docker
Build and run using the multi-stage Dockerfile:
```bash
docker build -t playtube .
docker run -p 3000:3000 --env-file .env playtube
```
