# Phase 1 Test Discovery: Architecture & Data Access Analysis

**Generated Date:** 2026-10-03  
**Target Application:** PlayTube Next.js Migration (Huipper Standard)  
**Stack Assessment:** Next.js 16 App Router, TypeScript, Better Auth, Drizzle ORM + PostgreSQL (`pg`), Supabase Storage adapter

---

## 1. Data Access Architecture

### Architectural Reality vs Stated Stack
While the prompt mentions a "Next.js + Supabase rewrite" and requests tests for "Supabase RLS policies, tables, storage buckets, and DB functions from supabase/migrations":
1. **Database Layer:** The application uses **Drizzle ORM** connected directly to PostgreSQL via standard connection pooling (`DATABASE_URL` pointing to AWS PostgreSQL pooler hosted on Supabase, or local PostgreSQL). 
2. **Data Mutations & Queries:**
   - **Queries (Reads):** Server Components load data directly via `@/db` (Drizzle ORM) or via `@/services/video.service.ts`.
   - **Mutations (Writes):** Interactivity and forms use **Next.js Server Actions** (`"use server"` in `src/modules/*/*.actions.ts`).
   - **Auth:** Powered by **Better Auth** (`better-auth`) with the Drizzle PostgreSQL adapter (`src/lib/auth/auth.ts`) mounted at `/api/auth/[...all]`.
   - **API Routes:** Only 5 explicit HTTP route handlers exist:
     - `/api/auth/[...all]` (Better Auth handler: login, register, session, switch-account, etc.)
     - `/api/v1/translations` (Public dynamic multi-language translation dictionary)
     - `/api/admin/import/youtube` (Admin video search & import)
     - `/api/admin/import/dailymotion` (Admin video search & import)
     - `/api/admin/import/twitch` (Admin video search & import)
   - **Supabase Client Usage:** The frontend components (`UploadVideoClient.tsx`, `CreatePostClient.tsx`) use `uploadToSupabaseStorage` via `@supabase/supabase-js` purely as an S3/Blob storage client for uploading video and thumbnail files into storage buckets (`playtube-videos`, `playtube-uploads`, `playtube-photos`).
3. **Database Migration / RLS Notice:**
   - There are **no files in `supabase/migrations`** in this repository. All database definitions reside in `src/db/schema/index.ts` and `src/db/migrations/0000_wakeful_sumo.sql` managed by Drizzle Kit.
   - Row-Level Security (RLS) is not defined at the Supabase PostgreSQL level because application authorization is enforced at the service / Server Action layer (e.g. Better Auth session checks, `isAdmin`, and `userId` scoping in Drizzle queries).

---

## 2. Inventory of API Route Handlers (`src/app/api/**/route.ts`)

| Route Handler | Methods | Purpose | Auth Required | Data Source |
|---|---|---|---|---|
| `/api/auth/[...all]` | `GET`, `POST` | Better Auth handlers (register, sign-in, session, password reset) | Config-dependent | Drizzle ORM (`users`, `sessions`, `accounts`, `verifications`) |
| `/api/v1/translations` | `GET` | Dynamic multi-language dictionary | No (Public) | Drizzle ORM (`languages`, `language_translations`) |
| `/api/admin/import/youtube` | `GET` | YouTube search & video metadata import | Admin (config key) | Google YouTube Data API v3 / `site_config` |
| `/api/admin/import/dailymotion` | `GET` | Dailymotion search & video import | Admin | Dailymotion API |
| `/api/admin/import/twitch` | `GET` | Twitch stream search & video import | Admin | Twitch Helix API / `site_config` |

---

## 3. Inventory of Pages, Data Sources & Auth Requirements

Total Pages Detected in `src/app`: **125 pages**

### Public & User Pages

| Page Route | Relative Path | Data Source | Auth Required |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Service Layer (`getFeaturedVideos`, `getCategories`) -> Drizzle ORM | No |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Server Actions (`password.actions.ts`) + Better Auth | No |
| `/login` | `src/app/(auth)/login/page.tsx` | Better Auth Client (`signIn.email`, `signIn.username`) | No |
| `/register` | `src/app/(auth)/register/page.tsx` | Better Auth Client (`signUp.email`) | No |
| `/reset-password` | `src/app/(auth)/reset-password/page.tsx` | Server Actions (`password.actions.ts`) | No |
| `/ads` | `src/app/(public)/ads/page.tsx` | Drizzle ORM (`user_ads`) + Server Actions | Yes |
| `/ads/create` | `src/app/(public)/ads/create/page.tsx` | Server Actions (`ads.actions.ts`) | Yes |
| `/articles` | `src/app/(public)/articles/page.tsx` | Drizzle ORM (`articles`) | No |
| `/articles/read/[id]` | `src/app/(public)/articles/read/[id]/page.tsx` | Drizzle ORM (`articles`, `article_comments`) + Server Actions | No (Read) / Yes (Comment) |
| `/channel/[username]` | `src/app/(public)/channel/[username]/page.tsx` | Drizzle ORM (`users`, `videos`, `subscriptions`) + Server Actions | No |
| `/contact-us` | `src/app/(public)/contact-us/page.tsx` | Server Actions (`contact.actions.ts`) | No |
| `/create-article` | `src/app/(public)/create-article/page.tsx` | Server Actions (`article.actions.ts`) | Yes |
| `/create-post` | `src/app/(public)/create-post/page.tsx` | Supabase Storage + Server Actions (`activity.actions.ts`) | Yes |
| `/create_article` | `src/app/(public)/create_article/page.tsx` | Server Actions (`article.actions.ts`) | Yes |
| `/create_post` | `src/app/(public)/create_post/page.tsx` | Supabase Storage + Server Actions (`activity.actions.ts`) | Yes |
| `/dashboard` | `src/app/(public)/dashboard/page.tsx` | Drizzle ORM (`videos`, `views`, `likes_dislikes`, `users`) | Yes |
| `/edit-video/[id]` | `src/app/(public)/edit-video/[id]/page.tsx` | Drizzle ORM (`videos`, `categories`) + Server Actions | Yes |
| `/go-pro` | `src/app/(public)/go-pro/page.tsx` | Drizzle ORM (`manage_pro`, `users`) + Server Actions | Yes |
| `/help` | `src/app/(public)/help/page.tsx` | Drizzle ORM (`faqs`) | No |
| `/help/faqs` | `src/app/(public)/help/faqs/page.tsx` | Drizzle ORM (`faqs`) | No |
| `/history` | `src/app/(public)/history/page.tsx` | Drizzle ORM (`watch_history`, `videos`) + Server Actions | Yes |
| `/import-video` | `src/app/(public)/import-video/page.tsx` | Server Actions (`video.actions.ts`) | Yes |
| `/liked-videos` | `src/app/(public)/liked-videos/page.tsx` | Drizzle ORM (`likes_dislikes`, `videos`) | Yes |
| `/manage-videos` | `src/app/(public)/manage-videos/page.tsx` | Drizzle ORM (`videos`) + Server Actions | Yes |
| `/messages` | `src/app/(public)/messages/page.tsx` | Drizzle ORM (`messages`, `users`) + Server Actions | Yes |
| `/movies` | `src/app/(public)/movies/page.tsx` | Drizzle ORM (`videos`, `movie_categories`) | No |
| `/my-articles` | `src/app/(public)/my-articles/page.tsx` | Drizzle ORM (`articles`) + Server Actions | Yes |
| `/my_articles` | `src/app/(public)/my_articles/page.tsx` | Drizzle ORM (`articles`) + Server Actions | Yes |
| `/paid-videos` | `src/app/(public)/paid-videos/page.tsx` | Drizzle ORM (`videos`, `transactions`) | Yes |
| `/popular-channels` | `src/app/(public)/popular-channels/page.tsx` | Drizzle ORM (`users`, `subscriptions`) | No |
| `/saved-videos` | `src/app/(public)/saved-videos/page.tsx` | Drizzle ORM (`watch_later`, `videos`) | Yes |
| `/search` | `src/app/(public)/search/page.tsx` | Drizzle ORM (`videos`, `users`) | No |
| `/settings` | `src/app/(public)/settings/page.tsx` | Drizzle ORM (`users`, `custom_profile_fields`) + Server Actions | Yes |
| `/settings/[tab]` | `src/app/(public)/settings/[tab]/page.tsx` | Drizzle ORM (`users`) + Server Actions | Yes |
| `/shorts` | `src/app/(public)/shorts/page.tsx` | Drizzle ORM (`videos`, `users`) | No |
| `/site-pages/[pageName]` | `src/app/(public)/site-pages/[pageName]/page.tsx` | Drizzle ORM (`custom_pages`) | No |
| `/stock-videos` | `src/app/(public)/stock-videos/page.tsx` | Drizzle ORM (`videos`) | No |
| `/subscriptions` | `src/app/(public)/subscriptions/page.tsx` | Drizzle ORM (`subscriptions`, `videos`) | Yes |
| `/switch-account` | `src/app/(public)/switch-account/page.tsx` | Better Auth multiSession + Server Actions | Yes |
| `/terms/[type]` | `src/app/(public)/terms/[type]/page.tsx` | Drizzle ORM (`terms_pages`, `site_config`) | No |
| `/upload-video` | `src/app/(public)/upload-video/page.tsx` | Supabase Storage + Server Actions (`video.actions.ts`) | Yes |
| `/videos/latest` | `src/app/(public)/videos/latest/page.tsx` | Drizzle ORM (`videos`, `users`) | No |
| `/videos/top` | `src/app/(public)/videos/top/page.tsx` | Drizzle ORM (`videos`, `users`, `views`) | No |
| `/videos/trending` | `src/app/(public)/videos/trending/page.tsx` | Drizzle ORM (`videos`, `users`, `views`) | No |
| `/wallet` | `src/app/(public)/wallet/page.tsx` | Drizzle ORM (`users`, `transactions`) + Server Actions | Yes |
| `/watch/[videoId]` | `src/app/(public)/watch/[videoId]/page.tsx` | Service Layer + Drizzle ORM (`videos`, `comments`, `likes_dislikes`) + Server Actions | No (Watch) / Yes (Interact) |

### Admin Panel Pages (`src/app/admin/*`)
All 79 admin sub-pages enforce admin role checks via Better Auth session verification and read/write to Drizzle ORM tables:

- `/admin` (Overview statistics dashboard: `videos`, `users`, `comments`, `views`, `transactions`)
- `/admin/add-language`, `/admin/languages`, `/admin/edit-lang`, `/admin/manage-languages` (`languages`, `language_keys`, `language_translations`)
- `/admin/add-new-custom-page`, `/admin/edit-custom-page`, `/admin/manage-custom-pages`, `/admin/manage-pages`, `/admin/pages` (`custom_pages`)
- `/admin/ads`, `/admin/ads-settings`, `/admin/manage-user-ads`, `/admin/manage-video-ads`, `/admin/manage-website-ads`, `/admin/create-video-ad` (`user_ads`, `video_ads`, `website_ads`, `site_config`)
- `/admin/affiliates-settings`, `/admin/api-settings`, `/admin/cronjob-settings`, `/admin/email-settings`, `/admin/ffmpeg`, `/admin/live`, `/admin/payment-settings`, `/admin/pro-settings`, `/admin/prosys-settings`, `/admin/seo`, `/admin/settings`, `/admin/site-settings`, `/admin/social-login`, `/admin/video-settings` (`site_config`)
- `/admin/articles`, `/admin/create-article`, `/admin/edit-article`, `/admin/manage-articles` (`articles`, `categories`)
- `/admin/auto-delete`, `/admin/clean-videos` (`videos`, `views`)
- `/admin/auto_subscribe` (`subscriptions`, `users`)
- `/admin/backup` (System backup tools)
- `/admin/ban-users` (`banned_ips`, `users`)
- `/admin/bank-receipts` (`bank_receipts`, `users`)
- `/admin/categories`, `/admin/manage_categories`, `/admin/manage_sub_categories` (`categories`, `sub_categories`)
- `/admin/change-site-desgin`, `/admin/custom-design`, `/admin/manage-themes`, `/admin/themes` (`site_config`)
- `/admin/copy_report`, `/admin/manage-video-reports`, `/admin/reports` (`reports`, `copyright_reports`)
- `/admin/earnings`, `/admin/payments`, `/admin/payment-requests` (`payment_requests`, `transactions`)
- `/admin/edit-terms-pages` (`terms_pages`)
- `/admin/import-from-dailymotion`, `/admin/import-from-twitch`, `/admin/import-from-youtube` (Import API routes + `videos`)
- `/admin/manage-activities` (`activities`)
- `/admin/manage-announcements`, `/admin/mass-notifications` (`announcements`, `notifications`)
- `/admin/manage-comments` (`comments`, `comment_replies`)
- `/admin/manage-currencies` (`currencies`)
- `/admin/manage-faqs` (`faqs`)
- `/admin/manage-invitation`, `/admin/manage-invitation-keys` (`admin_invitations`, `invitation_links`)
- `/admin/manage-movies-category`, `/admin/movies`, `/admin/movies-categories` (`movie_categories`, `videos`)
- `/admin/manage-profile-fields`, `/admin/manage-profile-fields/create` (`custom_profile_fields`)
- `/admin/manage-users`, `/admin/users` (`users`)
- `/admin/manage-videos`, `/admin/videos` (`videos`)
- `/admin/monitization-requests` (`monetization_requests`)
- `/admin/newsletters` (`users`)
- `/admin/sitemap` (Dynamic XML sitemap generator)
- `/admin/system-status` (Node / server runtime metrics)
- `/admin/verification-requests` (`verification_requests`)

---

## 4. Supabase Database & Storage Resources

### A. Database Tables (Defined in Drizzle Schema)
All 45 database tables:
1. `users`
2. `sessions`
3. `accounts`
4. `verifications`
5. `categories`
6. `sub_categories`
7. `videos`
8. `views`
9. `likes_dislikes`
10. `comments`
11. `comment_replies`
12. `subscriptions`
13. `playlists`
14. `playlist_videos`
15. `watch_history`
16. `watch_later`
17. `articles`
18. `article_comments`
19. `transactions`
20. `messages`
21. `activities`
22. `announcements`
23. `site_config`
24. `bank_receipts`
25. `video_ads`
26. `website_ads`
27. `user_ads`
28. `payment_requests`
29. `currencies`
30. `languages`
31. `language_keys`
32. `language_translations`
33. `custom_profile_fields`
34. `verification_requests`
35. `monetization_requests`
36. `movie_categories`
37. `manage_pro`
38. `pro_payments`
39. `custom_pages`
40. `faqs`
41. `terms_pages`
42. `reports`
43. `copyright_reports`
44. `banned_ips`
45. `admin_invitations`
46. `invitation_links`

### B. Storage Buckets (Referenced in code)
- `playtube-videos` (used in video upload)
- `playtube-uploads` (used for thumbnails and attachments)
- `playtube-photos` (used for post images and avatars)

### C. RLS & Stored Procedures Status
- **RLS Policies:** Since the project uses Drizzle ORM directly against PostgreSQL and does not use Supabase Database Client for user queries, PostgreSQL tables do not have Supabase RLS policies enabled by default in migrations.
- **DB Functions / RPCs:** None present in migrations; database operations execute via SQL queries compiled by Drizzle.

---

## 5. Non-API-Driven & Static Audit Findings

| Category | File | Line | Finding | Severity |
|---|---|---|---|---|
| **Fallback Mock Data** | `src/app/api/admin/import/youtube/route.ts` | 74-84 | Returns 8 mock items if YouTube API key is missing | Medium |
| **Fallback Mock Data** | `src/app/api/admin/import/dailymotion/route.ts` | 51-61 | Returns mock items if Dailymotion API fetch fails | Medium |
| **Fallback Mock Data** | `src/app/api/admin/import/twitch/route.ts` | 34-44 | Returns mock items for Twitch stream previews | Medium |
| **Mock Chart Data** | `src/app/(public)/dashboard/DashboardClient.tsx` | 330 | Uses mock hours curve chart | Low |
| **Mock Online Status** | `src/components/admin/ManageUsersClient.tsx` | 53 | Mocked online status indicator | Low |
| **Hardcoded Supabase URL** | `src/lib/storage/supabase.ts` | 6 | Fallback `https://olhrhkbhfpwcsqxturko.supabase.co` | High |
| **Hardcoded Supabase Key** | `src/lib/storage/supabase.ts` | 11 | Fallback anon JWT token hardcoded | High |
| **Hardcoded Localhost** | `src/db/index.ts` | 38 | Fallback connection string `postgres://playtube:playtubepassword@localhost:5432/playtube` | Low (dev default) |
| **Hardcoded Localhost** | `src/modules/admin/sitemap.actions.ts` | 27 | Fallback URL `http://localhost:3000` | Low |
| **Hardcoded Localhost** | `src/app/admin/sitemap/page.tsx` | 11 | Default input value `http://localhost:3000/sitemap-main.xml` | Low |
| **PHP-era Reference** | `src/components/admin/FfmpegClient.tsx` | 603 | Reference to `cronjob.php` in UI instructions | Low |
| **External Share URL** | `src/app/(public)/articles/read/[id]/page.tsx` | 176 | `facebook.com/sharer.php` (Standard Facebook share URL) | Clean |

---

## 6. Recommendations & Path for Phases 2 - 4

1. **Local Supabase Environment vs PostgreSQL:**
   - Docker is available (`Docker version 29.8.0`).
   - The CLI `supabase` is runnable via `npx supabase`.
   - Running `npx supabase start` provides local PostgreSQL (port 54322) and local Supabase Storage (port 54321), giving exact local isolation.
2. **Testing Architecture:**
   - **API & Server Action Tests:** Test the route handlers (`/api/v1/translations`, `/api/auth/*`, `/api/admin/import/*`) and Server Actions (`video.actions.ts`, `settings.actions.ts`, etc.) with Vitest.
   - **Database / Authorization Tests:** Test data isolation (anon vs owner vs other user permissions) directly via the Drizzle data layer and Better Auth session scopes.
   - **E2E & Marker Tests:** Playwright tests for user flows, marker injection, and validating that pages fetch live data without console errors.
   - **Static Audit:** Automated Vitest check forbidding unapproved mock arrays, hardcoded keys, and invalid `.php` scripts.
