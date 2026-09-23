# PlayTube Migration Manifest (Single Source of Truth)

Governed by [AGENT.md](file:///c:/New%20folder/videowebsite/AGENT.md) Section 0 (*Completeness requirement — no silent partial migrations*).  
All 71 PlayTube public/user source controllers, 79 admin controllers, 57 AJAX endpoints, and database tables are cataloged here.

Status values: `Not started` | `In progress` | `Built` | `Verified`

---

## 1. Public Discovery & Media Routes (PlayTube `sources/`)

| # | PlayTube Source | Target Next.js Route | Status | Notes & UI/UX Parity Spec |
|---|---|---|:---:|---|
| 1 | `sources/home/content.php` | `/` | **Verified** | Category pills, featured video grid, hover preview, hero banner, PlayTube `#04abf2` branding. |
| 2 | `sources/videos/content.php?page=trending` | `/videos/trending` | **Verified** | Most viewed videos, time-filter ready, cards with view counts & creator info. |
| 3 | `sources/videos/content.php?page=latest` | `/videos/latest` | **Verified** | Reverse chronological feed of public uploads with duration badges. |
| 4 | `sources/videos/content.php?page=top` | `/videos/top` | **Verified** | All-time highest rated/viewed videos. |
| 5 | `sources/shorts/content.php` | `/shorts` | **Verified** | 9:16 vertical short-form video cards with view counts and creator badge. |
| 6 | `sources/saved-videos/content.php` | `/saved-videos` | **Verified** | User Watch Later queue, query from `watch_later` table. |
| 7 | `sources/search/content.php` | `/search` | **Verified** | Search results with live keyword, category pill filtering, results count. |
| 8 | `sources/watch/content.php` | `/watch/[videoId]` | **Verified** | HTML5/embed player, description, channel subscribe, likes/dislikes mutation, comment submission with DB persistence. |
| 9 | `sources/timeline/content.php` | `/channel/[username]` | **Verified** | `#yp_cover` banner, rounded avatar, verified badge, subscriber count, Videos/Playlists/About tabs. |
| 10 | `sources/subscriptions/content.php` | `/subscriptions` | **Verified** | Feed of uploads from followed channels. |
| 11 | `sources/history/content.php` | `/history` | **Verified** | Chronological watch history with single/bulk clear action. |
| 12 | `sources/liked-videos/content.php` | `/liked-videos` | **Verified** | Playlist of videos receiving thumbs-up. |
| 13 | `sources/contact/content.php` | `/contact-us` | **Verified** | Contact support form with user feedback confirmation. |
| 14 | `sources/terms/content.php` | `/terms/[type]` | **Verified** | Terms of Use, Privacy Policy, and About Us CMS views. |
| 15 | `sources/upload-video/content.php` | `/upload-video` | **Verified** | Drag & drop, title, description, category select, privacy, Shorts toggle, persists to PostgreSQL. |
| 16 | `sources/import-video/content.php` | `/import-video` | **Verified** | YouTube / Vimeo external link parser with auto thumbnail scraping and embed playback. |
| 17 | `sources/settings/content.php` | `/settings` | **Verified** | General profile, avatar & cover preview, password, and verification tab layout. |
| 18 | `sources/movies/content.php` | `/movies` | **Verified** | Movie rental catalog, star ratings, release year/rating search filters, HD badge. |
| 19 | `sources/articles/content.php` | `/articles` | **Verified** | Article/blog publishing feed with category filter, search, popular articles sidebar. |
| 20 | `sources/read/content.php` | `/articles/read/[id]` | **Verified** | Long-form article reader view with views count, author profile, comments, social sharing. |
| 21 | `sources/create_article/content.php` | `/create-article` | **Verified** | Rich-text publishing studio for blog posts with tags and thumbnail upload. |
| 22 | `sources/popular_channels/content.php`| `/popular-channels` | **Verified** | Channel leaderboard ranked by subscriber count and aggregate video views. |
| 23 | `sources/go_pro/content.php` | `/go-pro` | **Verified** | Pro membership packages (Star, Hot, Ultimate), perks comparison, wallet checkout. |
| 24 | `sources/wallet/content.php` | `/wallet` | **Verified** | Personal wallet top-up, creator earnings payout form, transaction ledger table. |
| 25 | `sources/messages/content.php` | `/messages` | **Verified** | Direct private user messaging view with search, conversation pane, active timestamps. |
| 26 | `sources/manage-videos/content.php` | `/manage-videos` | **Verified** | Creator studio video table with views, duration, privacy status, edit and delete triggers. |
| 27 | `sources/edit-video/content.php` | `/edit-video/[id]` | **Verified** | Video metadata editor, thumbnail re-uploader, category and privacy update form. |

---

## 2. Authentication Routes (PlayTube `sources/`)

| # | PlayTube Source | Target Next.js Route | Status | Notes & UI/UX Parity Spec |
|---|---|---|:---:|---|
| 28 | `sources/login/content.php` | `/login` | **Verified** | Better Auth email/username sign-in, redirect callback, `#04abf2` branding. |
| 29 | `sources/register/content.php` | `/register` | **Verified** | Better Auth sign-up with username, email, password, gender, and ToS acceptance. |
| 30 | `sources/forgot_password/content.php` | `/forgot-password` | **Not started** | Password reset request form via Nodemailer SMTP. |
| 31 | `sources/reset-password/content.php` | `/reset-password` | **Not started** | Password reset confirmation with emailed token validation. |

---

## 3. Admin Panel Controllers (PlayTube `admin-panel/pages/`)

| # | PlayTube Admin Page | Target Next.js Route | Status | Notes & UI/UX Parity Spec |
|---|---|---|:---:|---|
| 32 | `dashboard/content.html` | `/admin` | **Verified** | High-level metrics KPI cards (Total Users, Videos, Views). |
| 33 | `manage-videos/content.html` | `/admin/videos` | **Verified** | Video datatable with thumbnail preview, views count, and admin deletion action. |
| 34 | `manage-users/content.html` | `/admin/users` | **Verified** | User list with roles, email, verified badge status, and role escalation. |
| 35 | `manage_categories/content.html`| `/admin/categories` | **Verified** | Category management with CRUD actions and slug creation. |
| 36 | `verification-requests/content.html`| `/admin/verification-requests` | **Verified** | Creator identity review and verified badge granting/revocation. |
| 37 | `manage-video-reports/content.html` | `/admin/reports` | **Verified** | Flagged content moderation queue with direct video preview and takedown action. |
| 38 | `site-settings` & `general-settings` | `/admin/settings` | **Verified** | General site title, name, admin email, SEO keywords/description, registration toggle, validation, history system, and max upload limits persisting to PostgreSQL `config`. |
| 39 | `manage-website-ads/content.html`| `/admin/ads` | **Not started** | Preroll, header, and footer advertisement code injections. |
| 40 | `prosys-settings/content.html` | `/admin/pro-settings` | **Not started** | Pro subscription fee, duration, and feature access toggles. |
| 41 | `payment-settings/content.html`| `/admin/payment-settings` | **Not started** | PayPal, Stripe, and wallet withdrawal threshold configuration. |
| 42 | `email-settings/content.html` | `/admin/email-settings` | **Not started** | SMTP host, port, credentials, and from-address test utility. |
| 43 | `ffmpeg/content.html` | `/admin/ffmpeg` | **Not started** | FFmpeg binary path, 1080p/720p/480p transcode profile toggles. |

---

## 4. UI/UX Theming & Component Parity Checklist

| Component / Token | PlayTube Reference Spec | Next.js Implementation | Status |
|---|---|---|:---:|
| Primary Accent | `#04abf2` (vibrant cyan), hover `#039be5` | Configured in `globals.css` (`--primary`, `--primary-hover`) | **Verified** |
| Typography | `Lato, sans-serif` (body), `Roboto` (headings) | Google Fonts imported in `globals.css` | **Verified** |
| Body Daylight Bg | `#f0f2f5` | Configured on `body` in `globals.css` | **Verified** |
| Card Elevation | `0 1px 2px rgb(0 0 0 / 12%)`, border `#ebebeb` | Standardized in `VideoCard.tsx` and admin cards | **Verified** |
| Navigation Header | 56px height, 9-dot grid icon, pill search, Create dropdown | Implemented in `Navigation.tsx` | **Verified** |
| Navigation Sidebar | Collapsible drawer, Discover, My Library, Footer links | Implemented in `Navigation.tsx` | **Verified** |
| Channel Timeline | `#yp_cover` banner, rounded avatar, tabs | Implemented in `channel/[username]/page.tsx` | **Verified** |
| Video Action Bar | Subscribe button, like/dislike pills, share modal, save | Implemented in `VideoActionButtons.tsx` | **Verified** |

---

## 5. Database Schema & Migration Status

| Source MySQL Table | Drizzle Schema Object | Target Postgres Table | Status |
|---|---|---|:---:|
| `users` | `users` | `users` | **Verified** |
| `videos` | `videos` | `videos` | **Verified** |
| `categories` | `categories` | `categories` | **Verified** |
| `views` | `views` | `views` | **Verified** |
| `likes_dislikes` | `likesDislikes` | `likes_dislikes` | **Verified** |
| `comments` | `comments` | `comments` | **Verified** |
| `comment_replies` | `commentReplies` | `comment_replies` | **Verified** |
| `subscriptions` | `subscriptions` | `subscriptions` | **Verified** |
| `playlists` | `playlists` | `playlists` | **Verified** |
| `playlist_videos` | `playlistVideos` | `playlist_videos` | **Verified** |
| `watch_history` | `watchHistory` | `watch_history` | **Verified** |
| `watch_later` | `watchLater` | `watch_later` | **Verified** |
| `config` | `siteConfig` | `config` | **Verified** |
| `activities` | (Pending) | `activities` | **Not started** |
| `announcements` | (Pending) | `announcements` | **Not started** |
| `ads` | (Pending) | `ads` | **Not started** |

---

## 6. Background Jobs & Scheduled Tasks

| PlayTube Cron/Job | Purpose | Target Architecture | Status |
|---|---|---|:---:|
| Video Transcoding | Convert uploaded MP4 to multi-res (360p, 720p, 1080p) via FFmpeg | Node.js child_process / BullMQ worker | **Not started** |
| View Counts Flush | Aggregate temporary view logs into video view count totals | Next.js API / Scheduled cron | **Not started** |
| Auto-delete Cleanups | Purge unapproved or expired temporary media | Standalone maintenance script in `scripts/` | **Not started** |
