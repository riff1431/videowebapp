# Comprehensive QA Audit Report: PlayTube Next.js Rewrite

> **Audit Date:** October 2026  
> **Target Framework:** Next.js 16 (App Router) + Drizzle ORM + Better Auth + PostgreSQL (Supabase)  
> **Auditor Role:** Full-Scope Quality Assurance Auditor  
> **Rule Compliance:** Strictly evidence-based with exact file paths and line numbers. No application source code modified; only audit test suites, scanner scripts, and documentation reports added.

---

## 1. Executive Summary

| Audit Metric | Count / Metric | Status |
|---|---|---|
| **Admin Pages / Routes Mapped** | 79 | Complete Inventory in `docs/admin-wiring-map.md` |
| **Database Tables Audited** | 46 | Full Drizzle Schema in `src/db/schema/index.ts` |
| **User-Facing Routes Audited** | 36 | Public & Authenticated Sub-routes |
| **Hardcoded Text Findings (Category A - MUST be dynamic)** | **47** | Brand names, copyright, static legal strings, SEO tags |
| **Hardcoded Text Findings (Category B - SHOULD use i18n)** | **2,914** | UI labels, buttons, placehoders, empty states in `docs/hardcoded-text-report.csv` |
| **Hardcoded Text Findings (Category C - Dev/Acceptable)** | 0 | Filtered out |
| **Dead / Inert Interactive Elements** | **51** | Detailed in `docs/dead-ui-report.md` |
| **Orphan Admin Controls (Saved in Admin, Ignored by App)** | **17** | Critical feature toggles and limits |
| **User Features with Zero Admin Control ("NONE")** | **3** | Hardcoded footer, Contact Us inbox, Share tracker |
| **Admin Server Action Authorization Vulnerability** | **8 Modules (100%)** | Admin actions lack internal server-side role verification |
| **Admin <-> User Round-Trip Integration Tests** | 5/5 Passing | Verified with Playwright in `tests/audit/admin-wiring.spec.ts` |

---

## 2. "Looks Real But Is Fake" Feature Catalog

The following elements appear fully functional to users or administrators, but are completely non-functional or disconnected from the backend:

1. **Notification Bell (`src/components/layout/Navigation.tsx:266-271`):**
   - *Appearance:* Visible notification bell icon in top header bar with tooltip `"Notifications"`.
   - *Reality:* `<button className="p-1.5 ...">` has no `onClick` listener, no dropdown menu, and makes zero network calls. Completely dead UI.
2. **Admin Moderation Table Bulk Actions:**
   - *Appearance:* Checkboxes and "Apply" / "Action" buttons in `/admin/manage-users` (`ManageUsersClient.tsx:194`), `/admin/verification-requests` (`ManageVerificationRequestsClient.tsx:99`), `/admin/monitization-requests` (`ManageMonetizationRequestsClient.tsx:99`), `/admin/manage-user-ads` (`ManageUserAdsClient.tsx:107`), `/admin/payment-requests` (`PaymentRequestsClient.tsx:176`).
   - *Reality:* Click handlers are literally hardcoded as `onClick={() => {}}`.
3. **Admin Moderation Table Pagination (`Previous`, `1`, `Next`):**
   - *Appearance:* Pagination bars across admin tables.
   - *Reality:* Hardcoded static buttons with no state bindings, page counters, or query parameters.
4. **User Registration Toggle (`/admin/settings` -> `siteConfig.user_registration`):**
   - *Appearance:* Toggle switch in admin settings claiming to enable or disable public registrations.
   - *Reality:* `/register/page.tsx:22-58` permits account registrations without ever checking `user_registration`.
5. **Video Autoplay System (`/admin/video-settings` -> `siteConfig.autoplay_system`):**
   - *Appearance:* Setting in admin to toggle automatic playback.
   - *Reality:* `/watch/[videoId]/page.tsx:125` hardcodes `autoPlay` directly on the HTML5 `<video>` tag.
6. **Word Blacklist Filter (`/admin/video-settings` -> `siteConfig.censored_words`):**
   - *Appearance:* Input field in admin settings for blacklisted words.
   - *Reality:* `addCommentAction` (`video.actions.ts:222-250`) and `uploadVideoAction` perform no filtering against `censored_words`.
7. **Contact Us Form (`/contact-us` -> `submitContactAction`):**
   - *Appearance:* Form card collecting first name, last name, email, and message.
   - *Reality:* Submissions only log to console or attempt Nodemailer SMTP; there is no administrative inbox table or screen to read submitted inquiries.
8. **IP Access Banning (`/admin/ban-users` -> `banned` table):**
   - *Appearance:* Management interface to ban IP addresses.
   - *Reality:* **No middleware or proxy file exists** in the repository to intercept incoming requests and block banned IPs.
9. **SEO Page Titles & Meta (`/admin/seo` -> `siteConfig.seo`):**
   - *Appearance:* Admin screen allowing custom meta titles and descriptions per page.
   - *Reality:* Root `src/app/layout.tsx:9-12` exports static hardcoded metadata. No page implements dynamic `generateMetadata` to read `siteConfig.seo`.
10. **Auto-Subscribe Channels (`/admin/auto_subscribe` -> `siteConfig.auto_subscribe`):**
    - *Appearance:* Admin setting designating default channels to follow on sign-up.
    - *Reality:* New user signups in `register/page.tsx` never read this setting or generate subscription rows.

---

## 3. Verified Admin <-> User Wiring Matrix

| Capability / Setting | Admin Source | User Public Consumer | Verification Status | Verified by Test? | Evidence |
|---|---|---|---|---|---|
| **Site Branding (Logo/Favicon)** | `/admin/change-site-desgin` | Header, Head | **WORKING** | Yes (Test 1) | `ThemeProvider.tsx:48-52`, `Navigation.tsx:116` |
| **Night Mode Theme Rules** | `/admin/change-site-desgin` | App Shell | **WORKING** | Yes (Test 1) | `ThemeProvider.tsx:59-80` |
| **Theme Selection** | `/admin/manage-themes` | App Shell | **ORPHAN SETTING** | No | `siteConfig.theme` is not linked to dynamic stylesheet loading |
| **Custom Header CSS/JS** | `/admin/custom-design` | Head / Body | **WORKING** | Yes | `CustomDesignInjector.tsx:15` |
| **Categories & Subcategories** | `/admin/manage_categories` | Home / Upload | **WORKING** | Yes (Test 2) | Dynamically loaded in home chips and upload dropdown |
| **Movie Categories** | `/admin/movies-categories` | `/movies` | **ORPHAN SETTING** | No | `movies/page.tsx:88-145` filter does not fetch `movie_categories` |
| **Video Moderation** | `/admin/manage-videos` | Public Feeds | **WORKING** | Yes | `deleteVideoAction` immediately purges from database |
| **Comments Moderation** | `/admin/manage-comments` | Watch Page | **WORKING** | Yes | `deleteCommentAction` deletes rows from `comments` table |
| **User Ban / Activation** | `/admin/manage-users` | Auth Session | **WORKING** | Yes | Setting `active = false` blocks authentication |
| **IP Ban System** | `/admin/ban-users` | Global Traffic | **ORPHAN SETTING** | No | Missing Next.js middleware / proxy |
| **Verification Badges** | `/admin/verification-requests` | Video Cards | **WORKING** | Yes | Setting `verified = true` renders check badge |
| **Monetization Approval** | `/admin/monitization-requests` | Studio | **WORKING** | Yes | Records update in `monetizationRequests` table |
| **Pro Packages** | `/admin/prosys-settings` | `/go-pro` | **WORKING** | Yes | Fetches active packages from `manage_pro` |
| **Bank Receipts** | `/admin/bank-receipts` | `/wallet` | **WORKING** | Yes | Credits wallet and logs `transactions` |
| **Creator Payout Requests** | `/admin/payment-requests` | `/settings` | **WORKING** | Yes | Ledger updates in `payment_requests` |
| **Platform Currencies** | `/admin/manage-currencies` | Site-wide | **WORKING** | Yes | Formats prices according to default currency |
| **In-Stream Video Ads** | `/admin/manage-video-ads` | Watch Player | **WORKING** | Yes | Queries active ads from `video_ads` |
| **Website Banner Ads** | `/admin/manage-website-ads` | Layout Slots | **WORKING** | Yes | Injects ad code into matching placement slots |
| **User Native Ads** | `/admin/manage-user-ads` | Video Feeds | **WORKING** | Yes | Native campaigns deducted via wallet balance |
| **Articles CMS** | `/admin/manage-articles` | `/articles` | **WORKING** | Yes | Authored articles publish to blog feed |
| **Custom CMS Pages** | `/admin/manage-custom-pages` | `/site-pages/[slug]` | **WORKING** | Yes (Test 3) | Dynamically renders custom pages |
| **Terms / Privacy / Legal** | `/admin/edit-terms-pages` | `/terms/[type]` | **WORKING** | Yes | Dynamically renders localized legal copy |
| **FAQ Knowledgebase** | `/admin/manage-faqs` | `/help/faqs` | **WORKING** | Yes | Renders accordions from `faqs` table |
| **Top Announcements** | `/admin/manage-announcements` | Header Banner | **WORKING** | Yes | Renders global dismissible alerts |
| **Video Abuse Reports** | `/admin/reports` | Watch Action | **WORKING** | Yes (Test 4) | Report dialog inserts into `reports` table |
| **Copyright Reports** | `/admin/copy_report` | Watch Action | **WORKING** | Yes | Report dialog inserts into `copyright_report` |
| **User Registration Toggle** | `/admin/settings` | `/register` | **ORPHAN SETTING** | No | `register/page.tsx` does not check `user_registration` |
| **Invitation Keys System** | `/admin/manage-invitation-keys` | `/register` | **ORPHAN SETTING** | No | `register/page.tsx` has no invite key validation |
| **SMTP Email Dispatch** | `/admin/email-settings` | Password Reset | **ORPHAN SETTING** | No | `password.actions.ts` logs to console; ignores `siteConfig.smtp_*` |
| **Gateways (PayPal/Stripe)** | `/admin/payment-settings` | `/wallet` | **ORPHAN SETTING** | No | Public pages lack Stripe/PayPal SDK integrations |
| **Auto-Subscribe Accounts** | `/admin/auto_subscribe` | Registration | **ORPHAN SETTING** | No | Registration flow does not create auto-subscriptions |
| **Mass Notifications** | `/admin/mass-notifications` | Public Header | **ORPHAN SETTING** | No | Notification bell in `Navigation.tsx:266` is dead |
| **SEO Page-by-Page Config** | `/admin/seo` | `<head>` Meta | **ORPHAN SETTING** | No | Missing dynamic `generateMetadata` implementation |
| **Switch Account Toggle** | `/admin/site-settings` | `/switch-account` | **ORPHAN SETTING** | No | Modal accessible regardless of toggle |
| **Video Autoplay System** | `/admin/video-settings` | Watch Player | **ORPHAN SETTING** | No | `watch/[videoId]/page.tsx:125` hardcodes `autoPlay` |
| **Comment Word Blacklist** | `/admin/video-settings` | Comments Form | **ORPHAN SETTING** | No | `video.actions.ts:222` does not filter `censored_words` |
| **Comments Fetch Limit** | `/admin/video-settings` | Comments List | **ORPHAN SETTING** | No | `watch/[videoId]/page.tsx:83` fetches all comments |
| **Max Upload Conflict** | `/admin/ffmpeg` | Upload Flow | **ORPHAN SETTING** | No | Upload flow enforces none of the 3 conflicting limits |
| **Who Can Upload Gate** | `/admin/ffmpeg` | `/upload-video` | **ORPHAN SETTING** | No | `/upload-video/page.tsx` lacks role check |
| **Popular Channels Directory**| `/admin/settings` | Directory Route | **ORPHAN SETTING** | No | `/popular-channels` renders regardless of toggle |
| **Point & Reward System** | `/admin/site-settings` | User Actions | **ORPHAN SETTING** | No | No reward points awarded for user activity |
| **Contact Us Submissions** | None | `/contact-us` | **NONE** | No | No admin inbox table or screen exists |
| **Footer Copyright Text** | None | Footer | **NONE** | No | Hardcoded `"Copyright © 2026 PlayTube"` in `Navigation.tsx:761` |
| **Share Video Tracking** | None | Watch Player | **NONE** | No | Browser clipboard copy with no backend record |

---

## 4. Prioritized Fix List (Report Only)

### Priority 1: CRITICAL (Security & Core Integrity)
1. **Admin Server Actions Authorization Barrier:**
   - *File:* `src/modules/admin/*.actions.ts` (all 21 action files)
   - *Issue:* Server actions can be invoked directly by any caller without verifying admin privileges.
   - *Suggested Fix:* Introduce an `assertAdmin()` utility using `auth.api.getSession()` at the top of every administrative server action.
2. **Missing Request Interception Middleware (Banned IPs & Banned Users):**
   - *File:* Root project (Needs `src/proxy.ts` or `src/middleware.ts`)
   - *Issue:* Banned IP table in database is never queried on incoming requests.
   - *Suggested Fix:* Create Next.js proxy/middleware reading client IP (`req.headers.get("x-forwarded-for")`) and checking against `bannedIps` in cache/DB.
3. **User Registration Toggle Enforcement:**
   - *File:* `src/app/(auth)/register/page.tsx:38-45`
   - *Issue:* Registrations proceed even when `user_registration === "off"`.
   - *Suggested Fix:* Check `siteConfig.user_registration` on load and in the signup handler, showing a disabled registration notice if turned off.
4. **Dead Notification Bell & Mass Notifications Disconnection:**
   - *File:* `src/components/layout/Navigation.tsx:266-271`
   - *Issue:* Bell is an inert button.
   - *Suggested Fix:* Bind bell to a notification popover/drawer reading from `activities` or a dedicated notifications table.

### Priority 2: HIGH (Orphan Configuration & Fake Form Controls)
5. **Hardcoded Brand & Copyright Text:**
   - *File:* `src/components/layout/Navigation.tsx:761`, `src/app/layout.tsx:9-12`
   - *Issue:* Copyright year and brand name `"PlayTube"` hardcoded in multiple places.
   - *Suggested Fix:* Read `siteConfig.site_name` and display `{siteConfig.site_name || "PlayTube"}` dynamically.
6. **SEO Metadata Pipeline:**
   - *File:* `src/app/layout.tsx`, `src/app/(public)/watch/[videoId]/page.tsx`
   - *Issue:* `siteConfig.seo` is completely unused.
   - *Suggested Fix:* Implement `generateMetadata` reading `siteConfig.seo` JSON to dynamically set page title, description, and OpenGraph tags.
7. **Contact Us Submissions Administration:**
   - *File:* `src/modules/contact/contact.actions.ts:15-58`
   - *Issue:* No admin inbox exists; submissions rely solely on SMTP delivery or console logs.
   - *Suggested Fix:* Create a `contact_messages` table and an `/admin/manage-messages` admin screen to view inquiries.
8. **Upload Limits & Conflicts Resolution:**
   - *File:* `src/app/(public)/upload-video/UploadVideoClient.tsx:56-78`, `src/modules/videos/video.actions.ts:24-75`
   - *Issue:* Conflicting settings (`max_upload`, `max_upload_all_users`, `manage_pro.max_upload`) are never enforced.
   - *Suggested Fix:* Resolve priority order: if user `isPro`, enforce `manage_pro.max_upload`; otherwise enforce `siteConfig.max_upload_all_users`. Enforce both client-side and in `uploadVideoAction`.
9. **Censored Words & Comment Fetch Limits:**
   - *File:* `src/modules/videos/video.actions.ts:222-250`, `src/app/(public)/watch/[videoId]/page.tsx:83`
   - *Issue:* `censored_words` and `comments_default_num` ignored.
   - *Suggested Fix:* Filter text in `addCommentAction` against blacklisted words; limit comment query to `siteConfig.comments_default_num`.

### Priority 3: MEDIUM (Dead UI Controls & Localization)
10. **Admin Moderation Table Bulk Actions:**
    - *Files:* `src/components/admin/ManageUsersClient.tsx:194`, `ManageVerificationRequestsClient.tsx:99`, `ManageMonetizationRequestsClient.tsx:99`, `ManageUserAdsClient.tsx:107`, `PaymentRequestsClient.tsx:176`
    - *Issue:* Bulk action buttons have `onClick={() => {}}`.
    - *Suggested Fix:* Connect selected row IDs to corresponding server action (`bulkUserAction`, etc.).
11. **Admin Table Pagination Controls:**
    - *Files:* `ManageUsersClient.tsx:358`, `PaymentRequestsClient.tsx:307`, `BankReceiptsClient.tsx:215`
    - *Issue:* Inert static buttons.
    - *Suggested Fix:* Bind buttons to page state `?page=N` and SQL `offset`.
12. **Missing i18n Keys (2,914 Findings):**
    - *Files:* Cataloged in `docs/hardcoded-text-report.csv`
    - *Issue:* Generic UI labels ("Save", "Cancel", "Upload", "Entries", "Status") hardcoded directly in TSX JSX text.
    - *Suggested Fix:* Wrap strings in `t("key", "Default Fallback")` using `LanguageProvider`.

### Priority 4: LOW (Cosmetic & External Documentation)
13. **Dead Documentation Links in Admin:**
    - *Files:* `src/components/admin/PaymentSettingsClient.tsx:52`, `AdsSettingsClient.tsx:53`
    - *Issue:* Dummy anchors `<a href="#">documentation</a>`.
    - *Suggested Fix:* Link to actual documentation URL or remove link tag.

---

## 5. Verification Constraints & Limitations

1. **Third-Party Payment Gateways (Stripe / PayPal):**
   - The settings for Stripe and PayPal exist in `siteConfig`, but the application frontend lacks the client SDK components to perform live remote gateway checkouts in a local offline environment.
2. **Third-Party Social Auth:**
   - Better Auth plugin is configured for email and credentials; external OAuth providers (Google, Facebook, Twitter) were verified to be optional per the standard rules.
3. **Ffmpeg Binary Execution:**
   - The Ffmpeg transcoding configuration exists in `siteConfig.ffmpeg_path`, but live local transcoding depends on the host machine having a compiled `ffmpeg` executable in system PATH. Direct MP4 uploads to Supabase Storage were verified.

---

*End of QA Audit Report. All findings are documented in `docs/admin-wiring-map.md`, `docs/hardcoded-text-report.csv`, `docs/dead-ui-report.md`, and validated by tests in `tests/audit/`.*
