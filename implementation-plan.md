# Implementation Plan: Dynamic API-Driven Localization & Anti-Hardcoding

## 1. Overview & Objectives
Convert all user-facing content across the website from hardcoded strings to an API/DB-driven localization system. All UI labels, buttons, navigation items, placeholders, and feedback messages will use dynamic keys matching the PlayTube language schema, supporting multi-language switching (English, Arabic, French, Spanish, Russian, German, etc.) and runtime edits from the Admin Panel.

---

## 2. Architecture & Data Model

### 2.1 Database Schema (`src/db/schema/index.ts`)
- **`languages`**:
  - `id`: serial PK
  - `name`: string (e.g. `"english"`, `"arabic"`)
  - `displayName`: string (e.g. `"English"`, `"Arabic"`)
  - `iso`: string (e.g. `"en"`, `"ar"`, `"es"`)
  - `direction`: string (`"ltr"` | `"rtl"`)
  - `status`: string (`"active"` | `"disabled"`)
  - `isDefault`: boolean
- **`language_translations`**:
  - `id`: serial PK
  - `key`: varchar(255) (e.g. `"home"`, `"subscriptions"`, `"upload"`, `"login"`)
  - `lang`: varchar(50) (e.g. `"english"`, `"arabic"`)
  - `value`: text (the translated string)
  - Compound unique index on `(key, lang)` for O(1) lookups.

### 2.2 Data Extraction & Seeding (`scripts/seed-languages.ts`)
- Parse the SQL dump in `existing-videowebsite/Script/playtube.sql` (table `langs`).
- Extract all language keys (over 1,000+ standard PlayTube keys).
- Insert active languages into `languages` table.
- Populate `language_translations` table in batch for English, Arabic, Spanish, French, German, Russian, etc.

---

## 3. Translation Delivery & Runtime System

### 3.1 API Route (`/api/v1/translations`)
- **Endpoint**: `GET /api/v1/translations?lang=[lang]`
- Returns the key-value dictionary for the requested language with caching headers (`stale-while-revalidate`).
- Fallback gracefully to `english` if a key is missing in the chosen language.

### 3.2 Provider & Hooks (`src/providers/language-provider.tsx` & `src/hooks/use-translation.ts`)
- **`LanguageProvider`**:
  - Wraps the public layout.
  - Reads active language from cookies (defaulting to site default language or `english`).
  - Pre-hydrates the translation dictionary for the active language.
  - Exposes `currentLang`, `setLanguage(lang)`, `isRtl`, and `t(key, fallback)`.
- **`t(key, fallback)` helper**:
  - Looks up key in dictionary: `dict[key] ?? fallback ?? key`.
  - Supports string interpolation: `t('views_count', '{count} views', { count: 120 })`.

### 3.3 Server Component Helper (`src/lib/translations/server.ts`)
- For async React Server Components:
  - Fetches the active language dictionary based on incoming request cookies and returns `getTranslations(lang)`.

---

## 4. Admin Management: `/admin/manage-languages` & `/admin/edit-lang`

### 4.1 `/admin/manage-languages` Updates
- Update the **Edit** action button on each language row to navigate to `/admin/edit-lang?id=[languageName]` (e.g. `/admin/edit-lang?id=english`, `/admin/edit-lang?id=arabic`).

### 4.2 New Route: `/admin/edit-lang/page.tsx` & Client (`Manage & Edit Languages`)
- **Matches UI in screenshots**:
  - Breadcrumb: `Admin Panel > Languages > Manage & Edit Languages`
  - **Edit Language ISO card**: Input for `iso` code with save capability.
  - **Manage & Edit Languages card**:
    - Keyword search filter input + **Search** button (`?query=...`).
    - Table displaying:
      - `ID` (row counter)
      - `KEY NAME` (e.g. `login`, `search_keyword`, `register`, `home`, `upload`)
      - `VALUE` (the translated string in this language)
      - `ACTION`: **EDIT** button
    - **Edit Modal**:
      - Clicking **EDIT** opens a modal with a textarea for the value.
      - **SAVE CHANGES** saves via Server Action / API and updates the row dynamically.
    - Pagination controls (`Showing X out of Y`, `< 1 2 >`).

---

## 5. Phased Migration of Hardcoded Public UI

### Phase 1: Header, Navigation & Sidebar
- **Header**: Search placeholder, Upload button, Notifications, User dropdown menu (My Channel, Studio, Settings, Logout), Sign in button.
- **Sidebar**: Home, Trending, Subscriptions, Library, History, Your Videos, Watch Later, Liked Videos, Explore categories, Settings, Help.
- **Footer / Language Switcher**: Language selector dropdown, theme switcher, copyright, links.

### Phase 2: Watch Page & Video Player
- Video player tooltips and controls (play, pause, volume, quality, theater mode, fullscreen).
- Video details section (views, publish date, likes/dislikes, share, share modal, save, subscribe/subscribed button, bell icon).
- Comments section: comment input placeholder, "Comment" button, sort dropdown (Top comments, Newest first), reply buttons, pin labels.
- Up Next / Related videos sidebar headers and action buttons.

### Phase 3: Auth & Account Pages
- Login / Register modals and pages:
  - Form labels (Username/Email, Password, Confirm Password).
  - Validation messages.
  - Social login buttons, "Forgot password?", "Don't have an account?".
- Settings pages (General, Profile, Password, Verification, Monetization).

### Phase 4: Channel & Explore Pages
- Channel header tabs (Videos, Playlists, Channels, About).
- Subscribe buttons, subscriber count formatting.
- Empty states ("No videos found", "No comments yet").
- Search & Trending filters and headers.

---

## 6. Verification & Testing Checklist
- [x] Clicking **Edit** in `/admin/manage-languages` opens `/admin/edit-lang?id=[language]`.
- [x] `/admin/edit-lang` displays language keys and values with search and pagination matching screenshots.
- [x] Editing a language key value in `/admin/edit-lang` saves successfully to the database.
- [x] Modified language value immediately updates on the user-facing website for that language.
- [x] Language switching smoothly updates all visible text without full page breakages.
- [x] RTL layout correctly applies when Arabic, Urdu, Persian, or Hebrew is selected.
- [x] Missing key fallback safely displays the fallback text or key rather than crashing or showing blank text.
- [x] Zero TypeScript errors (`npm run typecheck` / `npx tsc --noEmit`).
