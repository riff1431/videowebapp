# Default Theme Redesign — Phase 0 Architecture & Design System Proposal

> **Target Theme:** `default` (`src/app/themes/default`)  
> **Source Baseline & Reference:** Reference Mockup + `youplay` theme contract  
> **Status:** Phase 0 Review / Pending User Feedback  

---

## 1. Overview & Core Philosophy

This proposal establishes a strict, tokenized design system for the **Default** theme of PlayTube, adhering to the provided reference mockup, user selections, and the non-negotiable architectural rules from `AGENTS.md` and `docs/theme-contract.md`.

### Core Architectural Decisions & User Preferences
- **AppShell Layout (Approved):** **Option A** — Floating Panel Canvas with Collapsible Sidebar, Pill Search, and Home Hero Greeting.
- **Typography (Approved):** **Outfit** (Google Font loaded via `next/font/google` in `layout.tsx`).
- **Dark Mode Direction (Approved):** **OLED Pitch Black** (`#000000` canvas, `#0d0d0d` floating panel, `#161616` cards, `#ff3333` brand red accent).
- **Rule Enforcement:** Zero changes to shared code (`src/modules`, `src/lib`, `src/db`, `src/app/api`, `src/app/admin`, or other themes). 100% route coverage parity with `themes/youplay`. Zero hardcoded colors/radii in page files.

---

## 2. Token Specification (`theme.css`)

All tokens are defined exclusively in `src/app/themes/default/theme.css` scoped under `[data-theme="default"]` for light mode and `[data-theme="default"].dark, html.dark[data-theme="default"]` for dark mode.

### Semantic Color Tokens

| Token Name | Light Mode Value | Dark Mode Value (OLED Pitch Black) | WCAG AA Contrast / Intended Role |
|---|---|---|---|
| `--default-canvas` | `#eceef1` | `#000000` | Outer viewport background behind floating panel |
| `--default-panel` | `#ffffff` | `#0d0d0d` | Floating rounded panel surface |
| `--default-panel-shadow` | `0 10px 40px -10px rgba(0,0,0,0.06)` | `0 10px 40px -10px rgba(0,0,0,0.85)` | Elevation shadow around floating panel |
| `--default-card` | `transparent` | `transparent` | Video & short cards (no border, transparent by default) |
| `--default-card-hover` | `rgba(0, 0, 0, 0.04)` | `rgba(255, 255, 255, 0.05)` | Card background revealed only on hover |
| `--default-card-border` | `transparent` | `transparent` | Video & short cards borderless |
| `--default-text` | `#0f1419` | `#ffffff` | Primary text and headlines (14:1+ ratio) |
| `--default-muted` | `#657280` | `#909090` | Subtitles, metadata, dates, view counters (5.2:1+ ratio) |
| `--default-brand-red` | `#ef233c` | `#ff3333` | Active icons, unread notification dots, play progress |
| `--default-search-bg` | `#f0f2f5` | `#1a1a1a` | Header search bar background fill |
| `--default-search-border` | `transparent` | `#2b2b2b` | Search bar border |
| `--default-pill-active-bg` | `#ffffff` | `#262626` | Active sidebar nav pill background |
| `--default-pill-active-text` | `#0f1419` | `#ffffff` | Active sidebar nav pill text label |
| `--default-pill-active-shadow` | `0 2px 8px rgba(0,0,0,0.08)` | `0 2px 8px rgba(0,0,0,0.5)` | Soft shadow under active navigation pill |

### Geometry & Scale Tokens
- `--radius-panel`: `32px` (Outer floating panel corner radius)
- `--radius-media`: `22px` (Video thumbnail card border radius)
- `--radius-short`: `16px` (Shorts vertical card border radius)
- `--radius-pill`: `9999px` (Pill search, badges, filters, duration tags)
- `--radius-button`: `12px` (Action buttons, dropdown items, dialog boxes)
- `--font-body`: `var(--font-outfit), sans-serif`
- `--font-heading`: `var(--font-outfit), sans-serif`

### Backward-Compatibility Token Aliases
To ensure shared components and automated drift tests pass without exception:
```css
--background: var(--default-panel);
--foreground: var(--default-text);
--bg: var(--default-canvas);
--surface: var(--default-panel);
--text: var(--default-text);
--muted: var(--default-muted);
--primary: var(--default-brand-red);
--border: var(--default-card-border);
--radius: 16px;
--search-bg: var(--default-search-bg);
--search-border: var(--default-search-border);
--card-bg: var(--default-card);
--card-border: var(--default-card-border);
```

---

## 3. Layout Wireframes (ASCII)

### Desktop AppShell (≥ 1024px)
Exact sidebar navigation links from current PlayTube:
```
+---------------------------------------------------------------------------------------------------+
|  CANVAS (--default-canvas: #eceef1 / #000000)                                                     |
|                                                                                                   |
|  [>] PlayTube        +-- FLOATING PANEL (--default-panel, radius: 32px, shadow-soft) ------------+ |
|                      |  [PANEL HEADER]                                                           | |
|  [GROUP 1]           |  (Q) [   Search videos, creators, topics...      ]  (Cam) (Bell*) (Avatar)| |
|  [>] Home (Active)   |---------------------------------------------------------------------------| |
|  (H) History (auth)  |  [HOME HERO GREETING]                                                     | |
|  ($) Purchases (auth)|  "Hey Helen, Have a good day! 👋"                                         | |
|  (P) Articles        |  [All] [Music] [Gaming] [Tech] [News] [Sports] [Travel]                   | |
|  ------------------- |                                                                           | |
|  [DISCOVERY]         |  Recommended                                                  View More > | |
|  (V) Latest videos   |  +-------------+  +-------------+  +-------------+  +-------------+       | |
|  (T) Trending        |  |  THUMBNAIL  |  |  THUMBNAIL  |  |  THUMBNAIL  |  |  THUMBNAIL  |       | |
|  (B) Top videos      |  |  rad: 22px  |  |  rad: 22px  |  |  rad: 22px  |  |  rad: 22px  |       | |
|  (M) Movies          |  |       [4:37]|  |       [4:37]|  |       [4:37]|  |       [4:37]|       | |
|  (S) Stock Videos    |  +-------------+  +-------------+  +-------------+  +-------------+       | |
|  (*) Popular Channels|  Video Title Here  Video Title Here  Video Title Here  Video Title Here    | |
|  (#) Shorts          |  Channel * 1.2M    Channel * 5.6M    Channel * 15k     Channel * 2M        | |
|  ------------------- |  [Card: bg transparent, no border. On hover: bg reveals with radius]     | |
|  EXPLORE MORE        |                                                                           | |
|  (?) Help            |  ⚡ Shorts                                                                 | |
|  ------------------- |  +-+ +-+ +-+ +-+ +-+ +-+ +-+ (7 vertical 9:16 cards with "New" badge)      | |
|  Refund • FAQs •     |  [Shorts card: bg transparent, no border. On hover: subtle card bg]       | |
|  Terms • Privacy •   +---------------------------------------------------------------------------+ |
|  About • Contact •   |                                                                             |
|  Developers • Lang   |                                                                             |
|  (c) 2026 {{name}}   |                                                                             |
+---------------------------------------------------------------------------------------------------+
```

### Mobile AppShell (< 768px)
```
+---------------------------------------+
| PlayTube (Logo)     (Q) (Bell*) (User)|
+---------------------------------------+
| "Hey Helen, Have a good day! 👋"      |
| [All] [Music] [Gaming] [Tech]...      |
+---------------------------------------+
| Recommended                           |
| +-----------------------------------+ |
| |        THUMBNAIL (rad: 20px)      | |
| |                             [4:37]| |
| +-----------------------------------+ |
| (Avatar) Video Title Goes Here        |
|          Channel Name * 1.2M views    |
+---------------------------------------+
| ⚡ Shorts (Horizontal Swipe Rail)     |
| [Card 1] [Card 2] [Card 3]            |
+---------------------------------------+
| [BOTTOM TAB BAR]                      |
| [>] Home   (T) Trending   (+)  (Art)  |
+---------------------------------------+
```

---

## 4. Theme-Local Component Catalog

All components reside within `src/app/themes/default/components/` and accept variant props (no arbitrary utility overrides).

### Card Hover & Transparent Background Specification (User Request #1)
- **Default State:** Video & Shorts cards have `bg-transparent` with **zero borders** (`border-0` / `border-transparent`).
- **Hover State:** Smooth transition to `--default-card-hover` (`rgba(0,0,0,0.04)` light / `rgba(255,255,255,0.05)` dark) with padding/rounding preserved, giving a clean floating feel without visual clutter.

### Sidebar Link Order & Structure Specification (User Request #2)
The sidebar strictly follows the current PlayTube structure:
1. **Primary Group:**
   - `Home` (`/`)
   - `History` (`/history` — logged-in users)
   - `Purchases` (`/paid-videos` — logged-in users)
   - `Articles` (`/articles`)
2. **Discovery Group:**
   - `Latest videos` (`/videos/latest`)
   - `Trending` (`/videos/trending`)
   - `Top videos` (`/videos/top`)
   - `Movies` (`/movies`)
   - `Stock Videos` (`/stock-videos`)
   - `Popular Channels` (`/popular-channels`)
   - `Shorts` (`/shorts`)
3. **Explore More Group:**
   - `Help` (`/contact-us`)
4. **Footer Links & Copyright:**
   - `Refund Policy` (`/terms/refund`), `FAQs` (`/faqs`), `Terms of use` (`/terms/terms`), `Privacy Policy` (`/terms/privacy`), `About us` (`/terms/about`), `Contact us` (`/contact-us`), `Developers` (`/developers`), `Language` (`/language`).
   - Dynamic Copyright: `Copyright © {{DATE}} {{CONFIG name}}. All rights reserved.`
2. **`media/`**:
   - `VideoCard.tsx`: Thumbnail (22px radius), duration pill, title, channel avatar, view/time meta.
   - `ShortCard.tsx`: 9:16 vertical card with "New" badge and view count.
   - `ChannelCard.tsx`: Round avatar, subscriber count, and active subscribe button.
   - `ArticleCard.tsx` / `MovieCard.tsx`: Formatted media cards adhering to theme tokens.
3. **`patterns/`**:
   - `GreetingHero.tsx`: "Hey {name}, Have a good day! 👋" banner greeting.
   - `SectionHeader.tsx`: Section label with "View More >" action.
   - `DataState.tsx`: Unified Loading Skeleton, Empty State, and Error states.
   - `FilterPills.tsx`: Category filter pills.

---

## 5. Route Inventory & Contract Map (46 Routes)

| # | Route URL | Target Default Theme File | Status |
|---|---|---|---|
| 1 | `/` | `src/app/themes/default/page.tsx` | Pending Build |
| 2 | `/watch/[videoId]` | `src/app/themes/default/watch/[videoId]/page.tsx` | Pending Build |
| 3 | `/videos/trending` | `src/app/themes/default/videos/trending/page.tsx` | Pending Build |
| 4 | `/videos/latest` | `src/app/themes/default/videos/latest/page.tsx` | Pending Build |
| 5 | `/videos/top` | `src/app/themes/default/videos/top/page.tsx` | Pending Build |
| 6 | `/shorts` | `src/app/themes/default/shorts/page.tsx` | Pending Build |
| 7 | `/movies` | `src/app/themes/default/movies/page.tsx` | Pending Build |
| 8 | `/articles` | `src/app/themes/default/articles/page.tsx` | Pending Build |
| 9 | `/articles/read/[id]` | `src/app/themes/default/articles/read/[id]/page.tsx` | Pending Build |
| 10 | `/search` | `src/app/themes/default/search/page.tsx` | Pending Build |
| 11 | `/channel/[username]` | `src/app/themes/default/channel/[username]/page.tsx` | Pending Build |
| 12 | `/@username` | Next.js rewrite to `/channel/[username]` | Supported |
| 13 | `/subscriptions` | `src/app/themes/default/subscriptions/page.tsx` | Pending Build |
| 14 | `/popular-channels` | `src/app/themes/default/popular-channels/page.tsx` | Pending Build |
| 15 | `/history` | `src/app/themes/default/history/page.tsx` | Pending Build |
| 16 | `/liked-videos` | `src/app/themes/default/liked-videos/page.tsx` | Pending Build |
| 17 | `/saved-videos` | `src/app/themes/default/saved-videos/page.tsx` | Pending Build |
| 18 | `/paid-videos` | `src/app/themes/default/paid-videos/page.tsx` | Pending Build |
| 19 | `/stock-videos` | `src/app/themes/default/stock-videos/page.tsx` | Pending Build |
| 20 | `/dashboard` | `src/app/themes/default/dashboard/page.tsx` | Pending Build |
| 21 | `/upload-video` | `src/app/themes/default/upload-video/page.tsx` | Pending Build |
| 22 | `/import-video` | `src/app/themes/default/import-video/page.tsx` | Pending Build |
| 23 | `/manage-videos` | `src/app/themes/default/manage-videos/page.tsx` | Pending Build |
| 24 | `/edit-video/[id]` | `src/app/themes/default/edit-video/[id]/page.tsx` | Pending Build |
| 25 | `/create-post` | `src/app/themes/default/create-post/page.tsx` | Pending Build |
| 26 | `/create-article` | `src/app/themes/default/create-article/page.tsx` | Pending Build |
| 27 | `/my-articles` | `src/app/themes/default/my-articles/page.tsx` | Pending Build |
| 28 | `/messages` | `src/app/themes/default/messages/page.tsx` | Pending Build |
| 29 | `/settings` | `src/app/themes/default/settings/page.tsx` | Pending Build |
| 30 | `/wallet` | `src/app/themes/default/wallet/page.tsx` | Pending Build |
| 31 | `/go-pro` | `src/app/themes/default/go-pro/page.tsx` | Pending Build |
| 32 | `/ads` | `src/app/themes/default/ads/page.tsx` | Pending Build |
| 33 | `/ads/create` | `src/app/themes/default/ads/create/page.tsx` | Pending Build |
| 34 | `/switch-account` | `src/app/themes/default/switch-account/page.tsx` | Pending Build |
| 35 | `/contact-us` | `src/app/themes/default/contact-us/page.tsx` | Pending Build |
| 36 | `/terms` | `src/app/themes/default/terms/page.tsx` | Pending Build |
| 37 | `/site-pages/[page]` | `src/app/themes/default/site-pages/[page]/page.tsx` | Pending Build |
| 38 | `/help` | `src/app/themes/default/help/page.tsx` | Pending Build |
| 39 | `/(auth)/login` | `src/app/themes/default/(auth)/login/page.tsx` | Pending Build |
| 40 | `/(auth)/register` | `src/app/themes/default/(auth)/register/page.tsx` | Pending Build |
| 41 | `/(auth)/forgot-password` | `src/app/themes/default/(auth)/forgot-password/page.tsx` | Pending Build |
| 42 | `/(auth)/reset-password` | `src/app/themes/default/(auth)/reset-password/page.tsx` | Pending Build |
| 43 | `/create_post` (alias) | `src/app/themes/default/create_post/page.tsx` | Pending Build |
| 44 | `/create_article` (alias) | `src/app/themes/default/create_article/page.tsx` | Pending Build |
| 45 | `/my_articles` (alias) | `src/app/themes/default/my_articles/page.tsx` | Pending Build |
| 46 | `/videos` (category root) | `src/app/themes/default/videos/page.tsx` | Pending Build |

---

## 6. Controls Omission Audit (Zero Dead Controls)

In accordance with Rule 4:
- **Omitted:** 3-dots kebab menu on Shorts rail header (no backing shared action or query exists).
- **Omitted:** Hardcoded placeholder footer links. All footer links map directly to existing site-pages or contact/terms routes.
- **Omitted:** Mock statistics or fake counters. Every number rendered binds to database entities.

---

## Comments & Review Feedback

*Please leave your comments or adjustments directly in this document or in chat, and confirm when ready to proceed to Phase 1 (Build).*
