# Theme Contract — PlayTube Multi-Theme Architecture Standard

> **Document Version:** 1.0.0  
> **Status:** Release Standard & Drift-Protected  
> **Target Framework:** Next.js 16 (App Router) + TypeScript + Drizzle ORM + Better Auth + PostgreSQL + Tailwind CSS 4  
> **Machine-Readable Pair:** [`docs/theme-contract.json`](file:///c:/New%20folder/videowebsite/docs/theme-contract.json)  
> **Translation Keys Catalog:** [`docs/theme-i18n-keys.json`](file:///c:/New%20folder/videowebsite/docs/theme-i18n-keys.json)  

---

## 1. Overview and rules

### Multi-Theme Routing Architecture
In this modernized PlayTube Next.js rewrite, the public and authentication user interfaces are fully decoupled into isolated, theme-specific folders under [`src/app/themes/<id>`](file:///c:/New%20folder/videowebsite/src/app/themes/). Multiple themes live side by side, allowing administrators to dynamically switch themes from the admin dashboard with instant cutover and zero build redeployment.

- **Folder Layout**:
  - Each theme resides in [`src/app/themes/<id>/`](file:///c:/New%20folder/videowebsite/src/app/themes/).
  - A theme package MUST provide:
    - `theme.css`: Scoped stylesheet defining all design tokens and component overrides under `[data-theme="<id>"]`.
    - `layout.tsx`: Theme-specific root wrapper injecting typography fonts and wrapping children inside `<SiteShell themeId="<id>">`.
    - All 46 public and auth route implementations (e.g. `page.tsx`, `watch/[videoId]/page.tsx`, `(auth)/login/page.tsx`).
- **Proxy Rewrite Engine ([`src/proxy.ts`](file:///c:/New%20folder/videowebsite/src/proxy.ts))**:
  - Next.js edge middleware intercepts incoming public requests before page routing.
  - Rewrites clean client-facing URLs (e.g. `/watch/123`) internally to `/themes/<themeId>/watch/123`.
  - External visitors **never** see or access `/themes/...` directly in the URL bar: direct GET requests to `/themes/*` immediately return a **404 Not Found** response (enforced at `src/proxy.ts:120`).
  - Sets internal verification headers: `x-playtube-internal-theme-rewrite: 1` and `x-playtube-theme: <themeId>`.
- **Fallback Theme Mechanism**:
  - The fallback theme is strictly locked to **`youplay`** (`FALLBACK_THEME_ID = "youplay"` in [`src/lib/themes.ts:7`](file:///c:/New%20folder/videowebsite/src/lib/themes.ts)).
  - If an active theme is missing an implemented route or file, `themeHasRoute()` checks the pre-generated manifest ([`src/config/theme-manifest.json`](file:///c:/New%20folder/videowebsite/src/config/theme-manifest.json)). If the active theme does not implement the route, the proxy gracefully falls back to `youplay` for that individual route without raising an error.
- **Theme Registry ([`src/lib/themes.ts`](file:///c:/New%20folder/videowebsite/src/lib/themes.ts))**:
  - Themes are allow-listed in `THEME_REGISTRY`.
  - Theme IDs must strictly match lowercase alphanumeric characters and hyphens: `^[a-z0-9-]+$`. Directory traversals (e.g. `../admin`), uppercase letters, dots, and slashes are rejected.
  - `getActiveThemeId()` checks:
    1. `FORCE_THEME` environment variable override (if present and valid).
    2. In-memory TTL cache (5-second TTL).
    3. PostgreSQL `siteConfig.active_theme` setting (fallback to legacy `siteConfig.theme`).
    4. Registry allow-list and folder existence on disk.
    5. Falls back to `youplay` if invalid or unregistered.
- **Live Theme Preview**:
  - Authenticated administrators can preview any registered theme without changing the live site for regular visitors by visiting clean URLs with query parameter `?preview_theme=<id>`.
  - Sets an encrypted, signed HTTP cookie `playtube_theme_preview` valid for 1 hour.
  - `SiteShell` renders a sticky top warning bar indicating the active preview state with an **Exit Preview** action (`/?preview_theme=exit`).
- **FORCE_THEME Environment Variable**:
  - For staging environments, automated CI, or container deployments, setting `FORCE_THEME=<id>` forces all traffic to that theme, bypassing database lookups.
- **Admin and API Unthemed Guarantee**:
  - Administrative routes ([`src/app/admin/**`](file:///c:/New%20folder/videowebsite/src/app/admin/)) and API endpoints ([`src/app/api/**`](file:///c:/New%20folder/videowebsite/src/app/api/)) are **never** themed.
  - `src/proxy.ts` explicitly skips paths starting with `/admin`, `/api`, `/_next`, static files, and uploads.
  - Admin panel enforces its own dedicated styling (PlayTube Gogi theme tokens).

---

### Hard Rules for Theme Code
Developers and AI agents creating new themes must adhere strictly to the following architectural rules:
1. **UI and Composition Only**: Theme files must focus exclusively on presentation, layouts, and component composition. Do NOT write custom raw database queries or direct SQL calls inside theme components. Always use shared server actions, queries, and services.
2. **No Direct `authClient` or `better-auth` Imports**: Never import `authClient` or `better-auth` inside [`src/app/themes/**`](file:///c:/New%20folder/videowebsite/src/app/themes/). Use shared authentication hooks ([`@/modules/auth/hooks`](file:///c:/New%20folder/videowebsite/src/modules/auth/hooks.ts)) such as `useLogin`, `useRegister`, `useForgotPassword`, and `useResetPassword`. This is strictly validated by static architectural tests.
3. **No Ad-Hoc Fetch Calls**: Do not make unstructured `fetch()` calls to arbitrary custom endpoints. Use defined Server Actions or standard API modules.
4. **No Cross-Theme Imports**: Never import code, styles, or assets from another theme (e.g. `import ... from "@/app/themes/youplay/..."` inside another theme is forbidden).
5. **No Modifications to Shared Code**: Never modify files in [`src/components/layout/`](file:///c:/New%20folder/videowebsite/src/components/layout/), [`src/modules/`](file:///c:/New%20folder/videowebsite/src/modules/), or [`src/db/`](file:///c:/New%20folder/videowebsite/src/db/) to satisfy theme styling.
6. **Strict CSS Scoping**: Every rule in `theme.css` must be scoped under `[data-theme="<id>"]`. Global un-scoped element rules are forbidden and rejected by automated drift tests.
7. **No Dead Anchor Links**: Never use `href="#"` or `href="javascript:void(0)"`. Always provide valid Next.js routes or interactive buttons with explicit click handlers.
8. **No Fake / Hardcoded Data**: Do not render dummy placeholder strings or hardcoded mock counters. Always bind to entity properties returned by data queries.
9. **No Hardcoded Brand Text**: Never hardcode "PlayTube" into user-facing text strings. Use `{SITE_TITLE}` tokens or dynamic config values from `siteConfig`.

---

## 2. Creating a theme

### Exact CLI Commands
To scaffold a new theme with 100% route coverage from the baseline:
```bash
# 1. Generate new theme folder and manifest
npm run theme:new -- <id> "<Theme Name>"

# Example:
npm run theme:new -- emerald "Emerald Edition"

# 2. Preview the new theme in browser (Admin required)
# Navigate to: http://localhost:3000/?preview_theme=emerald

# 3. Activate the new theme across the site
# Go to Admin Panel -> Design -> Themes -> Click "Activate" on Emerald Edition
# Or execute via SQL: UPDATE config SET value = 'emerald' WHERE name = 'active_theme';

# 4. Run drift and static verification checks
npm run theme:contract:check
npm run test:static
```

### New Theme File Checklist
Every new theme must contain:
- [ ] `src/app/themes/<id>/theme.css`: Scoped stylesheet with all 25 tokens under `[data-theme="<id>"]`.
- [ ] `src/app/themes/<id>/layout.tsx`: Layout setting `<SiteShell themeId="<id>">`.
- [ ] Public routes (42 routes): Homepage, video watch, channel, search, articles, movies, shorts, etc.
- [ ] Auth routes (4 routes): `(auth)/login`, `(auth)/register`, `(auth)/forgot-password`, `(auth)/reset-password`.
- [ ] Manifest registration in [`src/config/theme-manifest.json`](file:///c:/New%20folder/videowebsite/src/config/theme-manifest.json).
- [ ] Registry entry in [`src/lib/themes.ts`](file:///c:/New%20folder/videowebsite/src/lib/themes.ts) with metadata (name, version, author, description, preview thumbnail).
- [ ] Preview thumbnail image in [`public/themes/<id>.png`](file:///c:/New%20folder/videowebsite/public/themes/).

---

## 3. Route contract (46 Routes)

Each public and authentication route is documented below with its exact runtime requirements, data queries, hooks, and site configuration bindings.

### /
- **URL Pattern**: `/`
- **File Path**: `src/app/themes/youplay/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `getCategories`, `getFeaturedVideos`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `HomeClient`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /ads
- **URL Pattern**: `/ads`
- **File Path**: `src/app/themes/youplay/ads/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `eq`
- **Server Actions Called**: `getUserAdsAction`
- **Hooks Used**: None
- **Shared Components Rendered**: `AdsClient`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /ads/create
- **URL Pattern**: `/ads/create`
- **File Path**: `src/app/themes/youplay/ads/create/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fads%2Fcreate`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `CreateAdClient`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /articles
- **URL Pattern**: `/articles`
- **File Path**: `src/app/themes/youplay/articles/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `asc`, `db`, `desc`, `eq`, `ilike`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `BookOpen`, `Link`, `Newspaper`, `React`, `Search`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /articles/read/[id]
- **URL Pattern**: `/articles/read/[id]`
- **File Path**: `src/app/themes/youplay/articles/read/[id]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `id` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `db`, `desc`, `eq`
- **Server Actions Called**: `postArticleCommentAction`
- **Hooks Used**: None
- **Shared Components Rendered**: `ArrowLeft`, `Calendar`, `Eye`, `Link`, `MessageSquare`, `React`, `Send`, `Share2`, `User`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /channel/[username]
- **URL Pattern**: `/channel/[username]`
- **File Path**: `src/app/themes/youplay/channel/[username]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `username` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `count`, `db`, `desc`, `eq`, `getPublicImageUrl`, `getServerTranslations`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `Calendar`, `ChannelSubscribeButton`, `CheckCircle2`, `Eye`, `Heart`, `Info`, `Link`, `List`, `Megaphone`, `MessageCircle`, `React`, `Share2`, `Sparkles`, `ThumbsUp`, `Video`, `VideoCard`, `VideoOff`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /contact-us
- **URL Pattern**: `/contact-us`
- **File Path**: `src/app/themes/youplay/contact-us/page.tsx`
- **Component Architecture**: Client Component (`"use client"`)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: `submitContactAction`
- **Hooks Used**: `useState`
- **Shared Components Rendered**: `AlertCircle`, `CheckCircle2`, `Loader2`, `Mail`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /create_article
- **URL Pattern**: `/create_article`
- **File Path**: `src/app/themes/youplay/create_article/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fcreate_article`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /create_post
- **URL Pattern**: `/create_post`
- **File Path**: `src/app/themes/youplay/create_post/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fcreate_post`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `CreatePostClient`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /create-article
- **URL Pattern**: `/create-article`
- **File Path**: `src/app/themes/youplay/create-article/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fcreate-article`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `asc`, `db`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `CreateArticleClient`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /create-post
- **URL Pattern**: `/create-post`
- **File Path**: `src/app/themes/youplay/create-post/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fcreate-post`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /dashboard
- **URL Pattern**: `/dashboard`
- **File Path**: `src/app/themes/youplay/dashboard/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fdashboard`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `count`, `db`, `desc`, `eq`, `sql`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `DashboardClient`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /edit-video/[id]
- **URL Pattern**: `/edit-video/[id]`
- **File Path**: `src/app/themes/youplay/edit-video/[id]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fedit-video%2F%5Bid%5D`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `id` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `asc`, `db`, `eq`
- **Server Actions Called**: `updateVideoAction`
- **Hooks Used**: None
- **Shared Components Rendered**: `AlertCircle`, `ArrowLeft`, `CheckCircle2`, `Edit3`, `Film`, `Link`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /forgot-password
- **URL Pattern**: `/forgot-password`
- **File Path**: `src/app/themes/youplay/(auth)/forgot-password/page.tsx`
- **Component Architecture**: Client Component (`"use client"`)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: `useForgotPassword`, `useTranslation`
- **Shared Components Rendered**: `AlertCircle`, `CheckCircle2`, `KeyRound`, `Link`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /go-pro
- **URL Pattern**: `/go-pro`
- **File Path**: `src/app/themes/youplay/go-pro/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `asc`, `db`, `eq`
- **Server Actions Called**: `upgradeToProAction`
- **Hooks Used**: None
- **Shared Components Rendered**: `Check`, `CheckCircle2`, `Crown`, `Link`, `React`, `Shield`, `Sparkles`, `UploadCloud`, `Zap`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /help
- **URL Pattern**: `/help`
- **File Path**: `src/app/themes/youplay/help/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /help/faqs
- **URL Pattern**: `/help/faqs`
- **File Path**: `src/app/themes/youplay/help/faqs/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /history
- **URL Pattern**: `/history`
- **File Path**: `src/app/themes/youplay/history/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fhistory`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `HistoryClient`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /import-video
- **URL Pattern**: `/import-video`
- **File Path**: `src/app/themes/youplay/import-video/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fimport-video`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `asc`, `db`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `ImportVideoClient`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /liked-videos
- **URL Pattern**: `/liked-videos`
- **File Path**: `src/app/themes/youplay/liked-videos/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fliked-videos`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`, `ThumbsUp`, `VideoCard`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /login
- **URL Pattern**: `/login`
- **File Path**: `src/app/themes/youplay/(auth)/login/page.tsx`
- **Component Architecture**: Client Component (`"use client"`)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: `useLogin`, `useTranslation`
- **Shared Components Rendered**: `AlertCircle`, `Link`, `Loader2`, `React`, `Suspense`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /manage-videos
- **URL Pattern**: `/manage-videos`
- **File Path**: `src/app/themes/youplay/manage-videos/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fmanage-videos`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /messages
- **URL Pattern**: `/messages`
- **File Path**: `src/app/themes/youplay/messages/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fmessages`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `db`, `desc`, `eq`, `ne`, `or`
- **Server Actions Called**: `clearChatAction`, `sendMessageAction`
- **Hooks Used**: None
- **Shared Components Rendered**: `CheckCheck`, `Clock`, `Link`, `MessageSquare`, `React`, `Search`, `Send`, `Trash2`, `User`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /movies
- **URL Pattern**: `/movies`
- **File Path**: `src/app/themes/youplay/movies/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `db`, `desc`, `eq`, `getSeoMetadata`, `gte`, `ilike`, `or`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `Film`, `Filter`, `Link`, `Play`, `React`, `Search`, `Star`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /my_articles
- **URL Pattern**: `/my_articles`
- **File Path**: `src/app/themes/youplay/my_articles/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fmy_articles`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `count`, `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `MyArticlesClient`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /my-articles
- **URL Pattern**: `/my-articles`
- **File Path**: `src/app/themes/youplay/my-articles/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fmy-articles`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /paid-videos
- **URL Pattern**: `/paid-videos`
- **File Path**: `src/app/themes/youplay/paid-videos/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fpaid-videos`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `PaidVideosClient`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /popular-channels
- **URL Pattern**: `/popular-channels`
- **File Path**: `src/app/themes/youplay/popular-channels/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `eq`, `getSiteConfig`, `sql`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `ChannelCard`, `ChannelItem`, `PopularChannelsHero`, `React`, `VideoOff`
- **Feature Toggles / siteConfig Keys**: `popular_channels`
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /register
- **URL Pattern**: `/register`
- **File Path**: `src/app/themes/youplay/(auth)/register/page.tsx`
- **Component Architecture**: Client Component (`"use client"`)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `getPublicImageUrl`
- **Server Actions Called**: None
- **Hooks Used**: `useRegister`, `useTheme`, `useTranslation`
- **Shared Components Rendered**: `AlertCircle`, `Link`, `React`, `Ticket`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /reset-password
- **URL Pattern**: `/reset-password`
- **File Path**: `src/app/themes/youplay/(auth)/reset-password/page.tsx`
- **Component Architecture**: Client Component (`"use client"`)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: `useResetPassword`, `useTranslation`
- **Shared Components Rendered**: `AlertCircle`, `CheckCircle2`, `Link`, `Lock`, `React`, `Suspense`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /saved-videos
- **URL Pattern**: `/saved-videos`
- **File Path**: `src/app/themes/youplay/saved-videos/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fsaved-videos`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: None
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /search
- **URL Pattern**: `/search`
- **File Path**: `src/app/themes/youplay/search/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `db`, `desc`, `eq`, `ilike`, `or`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `Link`, `React`, `Search`, `VideoCard`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /settings
- **URL Pattern**: `/settings`
- **File Path**: `src/app/themes/youplay/settings/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fsettings`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: None
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /settings/[tab]
- **URL Pattern**: `/settings/[tab]`
- **File Path**: `src/app/themes/youplay/settings/[tab]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fsettings%2F%5Btab%5D`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `tab` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `asc`, `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`, `SettingsClient`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /shorts
- **URL Pattern**: `/shorts`
- **File Path**: `src/app/themes/youplay/shorts/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `Link`, `Play`, `Plus`, `React`, `ShortsIcon`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /site-pages/[pageName]
- **URL Pattern**: `/site-pages/[pageName]`
- **File Path**: `src/app/themes/youplay/site-pages/[pageName]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `pageName` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `ArrowLeft`, `FileText`, `Link`, `React`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /stock-videos
- **URL Pattern**: `/stock-videos`
- **File Path**: `src/app/themes/youplay/stock-videos/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`, `or`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`, `StockVideoItem`, `StockVideosClient`, `Suspense`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /subscriptions
- **URL Pattern**: `/subscriptions`
- **File Path**: `src/app/themes/youplay/subscriptions/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fsubscriptions`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `List`, `React`, `VideoCard`, `VideoOff`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /switch-account
- **URL Pattern**: `/switch-account`
- **File Path**: `src/app/themes/youplay/switch-account/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fswitch-account`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `getSiteConfig`
- **Server Actions Called**: `getSwitchedAccountsAction`
- **Hooks Used**: None
- **Shared Components Rendered**: `SwitchAccountModal`
- **Feature Toggles / siteConfig Keys**: `switch_account`
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /terms/[type]
- **URL Pattern**: `/terms/[type]`
- **File Path**: `src/app/themes/youplay/terms/[type]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `type` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `ArrowLeft`, `FileText`, `HelpCircle`, `Info`, `Link`, `React`, `RefreshCw`, `Shield`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /upload-video
- **URL Pattern**: `/upload-video`
- **File Path**: `src/app/themes/youplay/upload-video/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fupload-video`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `getUserUploadLimit`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `UploadVideoClient`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /videos/latest
- **URL Pattern**: `/videos/latest`
- **File Path**: `src/app/themes/youplay/videos/latest/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`, `getServerTranslations`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`, `Video`, `VideoCard`, `VideoOff`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /videos/top
- **URL Pattern**: `/videos/top`
- **File Path**: `src/app/themes/youplay/videos/top/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `db`, `desc`, `eq`, `getServerTranslations`, `gte`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `BarChart2`, `Calendar`, `Link`, `React`, `Video`, `VideoCard`, `VideoOff`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /videos/trending
- **URL Pattern**: `/videos/trending`
- **File Path**: `src/app/themes/youplay/videos/trending/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`, `getServerTranslations`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`, `Video`, `VideoCard`, `VideoOff`
- **Feature Toggles / siteConfig Keys**: None
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /wallet
- **URL Pattern**: `/wallet`
- **File Path**: `src/app/themes/youplay/wallet/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Required (Redirects unauthenticated visitors to `/login?redirect=%2Fwallet`)
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: None
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `db`, `desc`, `eq`, `getSiteConfig`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `React`, `WalletClient`
- **Feature Toggles / siteConfig Keys**: `bank_payment`, `paypal_payment`, `stripe_payment`
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

### /watch/[videoId]
- **URL Pattern**: `/watch/[videoId]`
- **File Path**: `src/app/themes/youplay/watch/[videoId]/page.tsx`
- **Component Architecture**: Server Component (Async RSC)
- **Auth Requirement**: Public / None
- **Route Coverage**: **REQUIRED**
- **Route Parameters (params)**: `videoId` (string)
- **Query Search Parameters (searchParams)**: None
- **Data Queries**: `and`, `count`, `db`, `desc`, `eq`, `getFeaturedVideos`, `getPublicImageUrl`, `getSeoMetadata`, `getServerTranslations`, `getSiteConfig`, `getVideoByVideoId`
- **Server Actions Called**: None
- **Hooks Used**: None
- **Shared Components Rendered**: `CheckCircle2`, `Link`, `React`, `VideoActionButtons`, `VideoCard`, `VideoComments`
- **Feature Toggles / siteConfig Keys**: `autoplay_system`, `comments_default_num`
- **Ad Slots Rendered**: None
- **Required UI States**: Loading skeleton, empty state container, interactive error fallback
- **SEO / Metadata**: Derived from `getSeoMetadata()` or `generateMetadata` with dynamic fallback title/description

---

## 4. Shared building blocks catalog

Themes compose existing headless modules, server actions, queries, and layout components. Themes MUST NOT reinvent logic or state synchronization.

### Layout & Shell Components
- **`SiteShell`** ([`@/components/layout/SiteShell`](file:///c:/New%20folder/videowebsite/src/components/layout/SiteShell.tsx)):
  - *Purpose*: Renders `data-theme="<id>"`, Sticky Header, collapsible Sidebar rail, Admin Theme Preview Exit banner, and main content container.
  - *Props*: `{ themeId: string; children: React.ReactNode }`
- **`Header`** ([`@/components/layout/Navigation`](file:///c:/New%20folder/videowebsite/src/components/layout/Navigation.tsx)):
  - *Purpose*: Main navigation bar with logo rendering, mobile toggle, live search input, language selector, Create button, notifications, and user account menu.
  - *Props*: `{ onToggleSidebar: () => void }`
- **`Sidebar`** ([`@/components/layout/Navigation`](file:///c:/New%20folder/videowebsite/src/components/layout/Navigation.tsx)):
  - *Purpose*: Left navigation menu supporting both full drawer and collapsed mini-rail modes with tooltips and active route indicators.
  - *Props*: `{ isOpen: boolean; isCollapsed?: boolean }`
- **`NotificationBell`** ([`@/components/layout/NotificationBell`](file:///c:/New%20folder/videowebsite/src/components/layout/NotificationBell.tsx)):
  - *Purpose*: Real-time notification badge and interactive dropdown with automatic mark-as-read triggers.
  - *Props*: None (self-contained state & polling).
- **`CustomDesignInjector`** ([`@/components/theme/CustomDesignInjector`](file:///c:/New%20folder/videowebsite/src/components/theme/CustomDesignInjector.tsx)):
  - *Purpose*: Server component injecting administrator custom CSS (`header_css`), header JS (`header_js`), and footer JS (`footer_js`) into `<head>`.
  - *Props*: None (queries DB).

### Video & Discovery Components
- **`VideoCard`** ([`@/components/common/VideoCard`](file:///c:/New%20folder/videowebsite/src/components/common/VideoCard.tsx)):
  - *Purpose*: Reusable video item card with thumbnail, duration badge, view count, relative date, creator avatar, and verified badge.
  - *Props*: `VideoCardProps`
- **`VideoActionButtons`** ([`@/components/common/VideoActionButtons`](file:///c:/New%20folder/videowebsite/src/components/common/VideoActionButtons.tsx)):
  - *Purpose*: Interactive like/dislike buttons, watch-later toggle, share modal, and report actions.
  - *Props*: `{ videoId: number; initialLikes: number; initialDislikes: number; userVote: number | null; isSaved: boolean }`
- **`VideoComments`** ([`@/components/common/VideoComments`](file:///c:/New%20folder/videowebsite/src/components/common/VideoComments.tsx)):
  - *Purpose*: Comments section with post input, pagination, replies, and like/dislike comment voting.
  - *Props*: `{ videoId: number; initialComments: any[]; totalComments: number }`
- **`ChannelSubscribeButton`** ([`@/components/channels/ChannelSubscribeButton`](file:///c:/New%20folder/videowebsite/src/components/channels/ChannelSubscribeButton.tsx)):
  - *Purpose*: Channel subscription toggle button with optimistic updates and subscriber counter.
  - *Props*: `{ channelId: number; initialIsSubscribed: boolean; subscriberCount: number }`
- **`ChannelCard`** ([`@/components/channels/ChannelCard`](file:///c:/New%20folder/videowebsite/src/components/channels/ChannelCard.tsx)):
  - *Purpose*: Creator card displaying avatar, banner, subscriber count, and subscribe action for lists and popular channels.
  - *Props*: `{ channel: any }`
- **`PopularChannelsHero`** ([`@/components/channels/PopularChannelsHero`](file:///c:/New%20folder/videowebsite/src/components/channels/PopularChannelsHero.tsx)):
  - *Purpose*: Hero carousel for featured channels.
  - *Props*: `{ channels: any[] }`

### Authentication & Account Hooks
- **`useLogin`** ([`@/modules/auth/hooks`](file:///c:/New%20folder/videowebsite/src/modules/auth/hooks.ts)):
  - *Purpose*: Manages sign-in form state, validation, email vs username resolution, Better Auth submission, and redirect sanitization.
- **`useRegister`** ([`@/modules/auth/hooks`](file:///c:/New%20folder/videowebsite/src/modules/auth/hooks.ts)):
  - *Purpose*: Manages account creation, password confirmation, gender selection, terms agreement, invitation code enforcement, and siteConfig status checks.
- **`useForgotPassword`** ([`@/modules/auth/hooks`](file:///c:/New%20folder/videowebsite/src/modules/auth/hooks.ts)):
  - *Purpose*: Handles password reset request dispatching and success messages.
- **`useResetPassword`** ([`@/modules/auth/hooks`](file:///c:/New%20folder/videowebsite/src/modules/auth/hooks.ts)):
  - *Purpose*: Handles token-based password reset completion and redirection to login.

### Candidates to Extract from YouPlay
The following client components currently reside inside `src/app/themes/youplay/` and are candidates to extract into shared modules ([`@/components/...`](file:///c:/New%20folder/videowebsite/src/components/)) in future refactorings (do not extract now):
- `SettingsClient.tsx` (1,362 lines): Comprehensive multi-tab profile and account settings manager.
- `DashboardClient.tsx` (1,474 lines): Creator analytics studio with video management and comment moderation.
- `UploadVideoClient.tsx` (577 lines): File uploader with chunking, progress bar, policy validation, and category dropdowns.
- `WalletClient.tsx` (521 lines): Balance display, deposits, and fund transfer modals.
- `CreateArticleClient.tsx` (1,289 lines): Rich text article editor and publishing form.
- `CreateAdClient.tsx` (321 lines): User advertisement campaign creator.
- `HistoryClient.tsx` (241 lines): Watch history viewer with clear-all action.

---

## 5. Token contract

### CSS Custom Properties
Themes declare design tokens inside their `theme.css` under `[data-theme="<id>"]`.

<!-- AUTO:start tokens -->
| Variable Name | Required | Purpose | Light Value | Dark Value |
|---|---|---|---|---|
| `--brand` | **Yes** | Primary brand accent color | `#04abf2` | `#04abf2` |
| `--brand-hover` | **Yes** | Hover state for primary brand accent | `#039be5` | `#039be5` |
| `--brand-rgb` | **Yes** | RGB triplet for alpha transparency calculations | `4, 171, 242` | `4, 171, 242` |
| `--bg` | **Yes** | Global viewport background color | `#f9f9f9` | `#121212` |
| `--surface` | **Yes** | Container and elevated surface background | `#ffffff` | `#212121` |
| `--text` | **Yes** | Base typography color | `#222222` | `#f1f1f1` |
| `--muted` | **Yes** | Secondary/subtle typography color | `#666666` | `#999999` |
| `--border` | **Yes** | Structural card and divider borders | `#e5e7eb` | `#262626` |
| `--radius` | **Yes** | Base border radius for buttons and cards | `8px` | `8px` |
| `--font-body` | **Yes** | Body font family variable | `var(--font-body, 'Lato', sans-serif)` | `var(--font-body, 'Lato', sans-serif)` |
| `--font-heading` | **Yes** | Heading typography font family | `var(--font-heading, 'Roboto', sans-serif)` | `var(--font-heading, 'Roboto', sans-serif)` |
| `--primary` | **Yes** | Primary accent color (used across 35+ components) | `#04abf2` | `#04abf2` |
| `--primary-hover` | **Yes** | Primary button hover state | `#039be5` | `#039be5` |
| `--primary-rgb` | **Yes** | Primary RGB triplet | `4, 171, 242` | `4, 171, 242` |
| `--accent-yellow` | No | Night-mode toggle icon and featured badges | `#fad657` | `#fad657` |
| `--accent-red` | No | Alerts, unread notifications, live badges | `#f44336` | `#f44336` |
| `--background` | **Yes** | Next.js App body background variable | `#f9f9f9` | `#121212` |
| `--foreground` | **Yes** | Next.js App body text variable | `#222222` | `#f1f1f1` |
| `--header-bg` | **Yes** | Sticky navigation header background | `#ffffff` | `#181818` |
| `--sidebar-bg` | **Yes** | Left navigation sidebar background | `#ffffff` | `#121212` |
| `--card-bg` | **Yes** | Video card and content container background | `#ffffff` | `#212121` |
| `--card-border` | **Yes** | Card border separator color | `#e9e9e9` | `#2a2a2a` |
| `--card-shadow` | No | Card depth and dropdown drop shadow | `0 1px 3px rgba(0, 0, 0, 0.06)` | `0 1px 4px rgba(0, 0, 0, 0.4)` |
| `--search-bg` | **Yes** | Header search input background | `#f1f2f4` | `#202020` |
| `--search-border` | **Yes** | Header search input border | `#dcdfe4` | `#333333` |
<!-- AUTO:end tokens -->

### Night-Mode Mechanism
- **Dark Mode Activation**: Triggered by adding the `.dark` class to `document.documentElement` (`html.dark`).
- **Administrative Control**: The administrator configures `night_mode` in Admin -> Change Site Design:
  - `"both"`: Toggleable by user; defaults to light mode.
  - `"night_default"`: Toggleable by user; defaults to dark mode.
  - `"night"`: Forced dark mode (toggle button hidden in user menu).
  - `"light"`: Forced light mode (toggle button hidden in user menu).
- **Client Persistence**: `localStorage.getItem("playtube_theme")` saves the visitor's choice when toggleable.

### Tailwind CSS 4 Configuration
Themes are integrated using Tailwind CSS v4 CSS-first configuration:
- In [`src/app/globals.css`](file:///c:/New%20folder/videowebsite/src/app/globals.css):
  - `@source "../themes";` guarantees all class names used across any theme directory are scanned and compiled into the production stylesheet.
  - `@custom-variant dark (&:where(.dark, .dark *));` provides class-based dark styling matching PlayTube's runtime.

---

## 6. Shell and global concerns every theme must render

### Automatic (Handled by SiteShell & RootLayout)
Themes DO NOT need to re-implement the following concerns; they are rendered globally by [`RootLayout`](file:///c:/New%20folder/videowebsite/src/app/layout.tsx) and [`SiteShell`](file:///c:/New%20folder/videowebsite/src/components/layout/SiteShell.tsx):
- `data-theme="<id>"` attribute injection on root container.
- Admin Theme Preview exit banner (`playtube_theme_preview` cookie detection).
- Top sticky `Header` with search form, mobile hamburger, create menu, language menu, and user menu.
- Collapsible left `Sidebar` and mobile navigation drawer.
- Banned IP enforcement (intercepted by `src/proxy.ts` with 403 Forbidden).
- Admin custom scripts injection (`<CustomDesignInjector />` in `<head>`).
- SEO metadata base fallbacks (via `generateMetadata`).

### Theme-Specific Concerns (Rendered Inside Theme Pages)
Each theme is responsible for rendering:
- **Website Ad Slots**:
  - `header`: Displayed at the top of page content under the header.
  - `footer`: Displayed at the bottom of public page layouts.
  - `watch_sidebar`: Displayed in the right-hand column of the watch page above related videos.
  - `watch_comments`: Displayed between video player and comments container.
- **Page Headings & Action Bars**: Page titles, breadcrumbs, search result counters, and category tabs.
- **Interactive Forms & Views**: Upload dropzones, studio tables, wallet balance counters, profile tabs.

---

## 7. Configuration and feature toggles

The table below lists every `siteConfig` key affecting user-facing views, its values, the setting source, and required theme response:

| Key | Type / Allowed Values | Admin Screen | Reading Components / Routes | Theme Behavior Required |
|---|---|---|---|---|
| `active_theme` | `string` (e.g. `"youplay"`, `"default"`) | Admin -> Themes | `src/lib/themes.ts`, `src/proxy.ts` | Determines which theme folder serves public and auth routes. |
| `night_mode` | `"both" | "night_default" | "night" | "light"` | Admin -> Site Design | `ThemeProvider.tsx`, `Navigation.tsx` | Hides mode switch button if forced light/dark; sets initial html class. |
| `user_registration` | `"on" | "off"` | Admin -> General Settings | `registration.actions.ts`, `/register` | If `"off"`, registration requires an invite code or shows disabled alert. |
| `invite_links_system` | `"on" | "off"` | Admin -> General Settings | `registration.actions.ts`, `/register` | If `"on"`, shows mandatory invitation code input field on registration form. |
| `who_can_upload` | `"all" | "pro" | "admin"` | Admin -> Upload Settings | `upload-policy.ts`, `/upload-video` | If restricted, prevents non-eligible users from uploading with an upgrade banner. |
| `upload_system` | `"on" | "off"` | Admin -> Upload Settings | `upload-policy.ts`, `/upload-video` | If `"off"`, disables video uploads globally. |
| `max_upload` | `string` (bytes limit) | Admin -> Upload Settings | `upload-policy.ts`, `/upload-video` | Displays max file size limit in uploader dropzone. |
| `max_video_duration`| `string` (seconds) | Admin -> Upload Settings | `upload-policy.ts`, `/upload-video` | Enforces max video duration for free accounts. |
| `autoplay_system` | `"on" | "off"` | Admin -> Video Settings | `/watch/[videoId]` | Sets `autoPlay` attribute on HTML5 `<video>` element. |
| `comments_default_num`| `string` (e.g. `"20"`, `"50"`) | Admin -> Video Settings | `/watch/[videoId]`, `video.actions.ts` | Limits the initial comment batch size loaded per video. |
| `popular_channels` | `"on" | "off"` | Admin -> Site Features | `/popular-channels` | If disabled, redirects or shows feature unavailable banner. |
| `switch_account` | `"on" | "off"` | Admin -> Site Features | `/switch-account`, `Navigation.tsx` | If `"off"`, hides "Switch Account" from user dropdown menu. |
| `point_level_system`| `"on" | "1" | "off"` | Admin -> Points Settings | `points.service.ts`, `Navigation.tsx` | Displays points balance in user menu and awards points for engagement. |
| `paypal_payment` | `"on" | "off"` | Admin -> Payment Settings | `/wallet` | Enables PayPal checkout gateway option in wallet deposit modal. |
| `stripe_payment` | `"on" | "off"` | Admin -> Payment Settings | `/wallet` | Enables Stripe credit card payment in wallet deposit modal. |
| `bank_payment` | `"on" | "off"` | Admin -> Payment Settings | `/wallet` | Enables bank transfer receipt upload tab in wallet view. |
| `seo` | `JSON string` | Admin -> SEO Settings | `src/lib/config/seo.ts` | Injects page-specific meta titles, descriptions, and keywords. |

---

## 8. i18n

### Translation Engine
- **Server-Side**: Uses `getServerTranslations()` in [`src/lib/translations/server.ts`](file:///c:/New%20folder/videowebsite/src/lib/translations/server.ts). Reads `playtube_lang` cookie, falls back to `english`, loads dictionary from PostgreSQL table `language_translations`, and returns helper `t(key, fallback, params)`.
- **Client-Side**: Uses `useTranslation()` hook from [`src/providers/language-provider.tsx`](file:///c:/New%20folder/videowebsite/src/providers/language-provider.tsx). Provides `t(key, fallback, params)`, `currentLang`, `languages`, `isRtl`, and `setLanguage(lang)`.
- **Direction / RTL Handling**: `RootLayout` sets `dir="rtl"` and `lang="<iso>"` automatically on the `<html>` element based on the selected language's `direction` column.
- **Interpolation**: The `t()` function supports mustache templates: `t("welcome_user", "Welcome {name}", { name: "Alex" })`.
- **Translation Keys Catalog**: All 103 user-facing translation keys are exported in [`docs/theme-i18n-keys.json`](file:///c:/New%20folder/videowebsite/docs/theme-i18n-keys.json).
- **Rules for Adding Keys**:
  - Never introduce hardcoded user strings without a translation key.
  - Always provide a meaningful English fallback as the second parameter: `t("key_name", "English Default")`.

---

## 9. Data and domain reference

### Core Entities & Field Signatures
- **Video (`videos` table)**:
  - `id` (number), `videoId` (string, unique slug), `userId` (number), `title` (string), `description` (string), `thumbnail` (string), `videoLocation` (string), `videoType` (string: mp4/youtube), `duration` (string: "04:15"), `views` (number), `categoryId` (string), `privacy` (number: 0=public, 1=private, 2=unlisted), `isApproved` (boolean), `featured` (boolean), `price` (number).
- **Channel / User (`users` table)**:
  - `id` (number), `username` (string), `name` (string), `avatar` (string), `cover` (string), `verified` (boolean), `isPro` (boolean), `wallet` (number), `balance` (number), `points` (number), `about` (string).
- **Comment (`comments` table)**:
  - `id` (number), `userId` (number), `videoId` (number), `text` (string), `likes` (number), `dislikes` (number), `createdAt` (Date), `user` (relation).
- **Playlist (`playlists` table)**:
  - `id` (number), `listId` (string), `name` (string), `description` (string), `privacy` (number: 0=public, 1=private), `createdAt` (Date).
- **Article (`articles` table)**:
  - `id` (number), `title` (string), `description` (string), `text` (string), `category` (string), `image` (string), `views` (number), `shared` (number), `createdAt` (Date).
- **Pro Package (`manage_pro` table)**:
  - `id` (number), `type` (string, e.g. "Pro"), `price` (number), `color` (string hex), `featuredVideos` (number), `verifiedBadge` (number: 0 or 1), `maxUpload` (string bytes), `discount` (number percentage).

### Display Rules & Formatting
- **Counts**: Numbers >= 1,000 should format with metric suffixes (e.g. `1.2K`, `1.5M`) or locale string (`1,200`).
- **Duration**: Displayed in standard format `mm:ss` or `hh:mm:ss` with semi-transparent dark badge overlay.
- **Relative Dates**: Formatted as `X hours ago`, `X days ago`, or `MMM DD, YYYY`.
- **Badges**:
  - Verified Channel: Render `<CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current" />`.
  - Pro Channel: Render `<Crown className="w-3.5 h-3.5 text-amber-500" />`.

---

## 10. Required UI states and patterns

- **Loading States**: Display pulse skeleton loaders matching the exact aspect ratio of the underlying content (e.g. 16:9 for video thumbnails, circular skeletons for avatars).
- **Empty States**: Render informative illustrations with friendly action prompts (e.g. "No videos found", "Your watch history is empty") rather than blank containers.
- **Error States**: Display clear retry triggers and message alerts without crashing the parent layout.
- **Form Validation**: Display immediate red validation text beneath offending inputs; disable submit button during loading transitions (`isSubmitting` / `useTransition`).
- **Pagination & Infinite Scroll**: Pages using query-based pagination listen to `?page_id=<number>` or `?page=<number>` (e.g. `/my_articles?page_id=2`).
- **Image Domains**: All dynamic user media is served through [`getPublicImageUrl(pathOrUrl)`](file:///c:/New%20folder/videowebsite/src/lib/storage/image-url.ts), supporting local filesystem uploads, external URLs, and Supabase storage buckets.

---

## 11. Known gaps in YouPlay (Do not copy)

When building new themes, do **NOT** reproduce the following legacy defects documented in [`docs/dead-ui-report.md`](file:///c:/New%20folder/videowebsite/docs/dead-ui-report.md):
1. **Unbound Batch Buttons**: Legacy templates contained moderation buttons with dummy `onClick={() => {}}` handlers. In new themes, ensure all action triggers call verified server actions.
2. **Static Pagination Controls**: Some legacy client views rendered disabled decorative "Previous" and "Next" buttons without query parameter bindings. New themes must wire pagination to `useRouter` or query searchParams.
3. **Hardcoded Brand Strings**: Legacy views occasionally inlined "PlayTube" directly instead of reading dynamic metadata. New themes must use `{SITE_TITLE}` interpolation.
4. **Header Notification Bell**: The original navigation bell had no attached drawer. The modern shared `NotificationBell` is now fully wired with live notification polling; do not replace it with an inert button.

---

## 12. Testing and acceptance checklist for a new theme

Before considering a new theme release-ready, every item in this checklist must pass:

```markdown
### New Theme Acceptance Checklist

- [ ] 1. Folder Structure & Scoping
  - [ ] Theme folder created at `src/app/themes/<id>`
  - [ ] `theme.css` scopes all selectors under `[data-theme="<id>"]`
  - [ ] No un-scoped CSS rules or leaking global styles
  - [ ] `layout.tsx` correctly sets `<SiteShell themeId="<id>">`

- [ ] 2. Route Parity (46/46 Routes)
  - [ ] All 46 public and authentication routes implemented
  - [ ] Route manifest generated (`npm run prebuild`)
  - [ ] Zero missing routes reported by contract check

- [ ] 3. Architectural Rules Compliance
  - [ ] No direct `authClient` or `better-auth` imports in theme code
  - [ ] No imports from another theme directory
  - [ ] No raw SQL / database queries in client components
  - [ ] No dead anchors (`href="#"`) or unhandled buttons

- [ ] 4. Automated Verification Commands
  - [ ] `npm run theme:contract:check` passes with 0 errors
  - [ ] `npm run test:static` passes all 17 static tests
  - [ ] `npm run build` succeeds with zero TypeScript / lint errors

- [ ] 5. Visual & Responsive QA
  - [ ] Verified at Desktop (1280px+), Tablet (768px), and Mobile (375px)
  - [ ] Verified in both Light Mode and Dark Mode
  - [ ] Language switching verified with RTL layout support (Arabic)
  - [ ] Live Theme Preview tested via `?preview_theme=<id>`
```

---

## 13. Starter prompt

Copy and paste this prompt to instruct an AI coding agent to implement a brand-new theme from scratch using this contract:

```markdown
You are an expert Next.js 16 and Tailwind CSS engineer. Your task is to build a brand-new theme for the PlayTube platform following the strict rules in docs/theme-contract.md and docs/theme-contract.json.

Design Brief:
- Theme ID: [THEME_ID] (e.g., "cyberpunk")
- Theme Name: [THEME_NAME] (e.g., "Cyberpunk Neon")
- Primary Brand Color: [BRAND_COLOR] (e.g., "#00ffcc")
- Design Aesthetic: [AESTHETIC_DESCRIPTION] (e.g., "High-tech futuristic dark aesthetic with neon glowing borders, monospace metrics, and sleek glassy cards")

Instructions:
1. Run `npm run theme:new -- [THEME_ID] "[THEME_NAME]"` to scaffold the directory structure.
2. Customize `src/app/themes/[THEME_ID]/theme.css` ensuring all 25 tokens in docs/theme-contract.json are defined and strictly scoped under `[data-theme="[THEME_ID]"]`.
3. Implement the unique visual styling across the 46 routes documented in Section 3 of docs/theme-contract.md.
4. DO NOT modify shared components in src/components/, modules in src/modules/, or database files in src/db/.
5. DO NOT import authClient or better-auth directly into theme files; use the shared hooks from @/modules/auth/hooks.
6. Run `npm run theme:contract:check` and `npm run test:static` to verify zero contract drift.
7. If anything in the contract is ambiguous or missing, STOP and ask me instead of inventing behavior.
```

---

## 14. Open questions

The following architectural observations were noted during the code inspection:
1. **Duplicate Article & Post Routes**: The codebase contains both hyphenated and underscore route variants (`/my-articles` re-exporting `/my_articles`, and `/create-article` re-exporting `/create_article`). New themes must retain both aliases for legacy PlayTube URL compatibility.
2. **Help Route Redirections**: `/help` redirects immediately to `/contact-us`, and `/help/faqs` redirects to `/terms/faqs`. These route stubs must be preserved to prevent 404 errors from external bookmarks.
3. **Internal vs Shared Client Components**: Large interactive components such as `SettingsClient.tsx` (1,362 lines) and `DashboardClient.tsx` (1,474 lines) currently live inside the theme folder. In a future milestone, extracting their state logic into headless hooks would reduce duplication across themes.
