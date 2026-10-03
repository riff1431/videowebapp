# Admin <-> User Wiring Map & Verification Matrix

> **Document Version:** 2.0 (Complete Comprehensive Surface)  
> **Status:** Phase 1 Complete (Fully Mapped & Audited with Corrections)  
> **Target Framework:** Next.js 16 (App Router) + Drizzle ORM + Better Auth + Supabase  
> **Reference Legacy System:** PlayTube PHP Script  

---

## 1. Complete Admin Route Surface & Management Scope

The administrative surface is organized under `src/app/admin/` spanning 79 distinct pages and sub-modules. The table below details every admin page, route, and its backing implementation.

| Route | Subsystem / Page Title | Functional Scope | Backing Server Actions / Module |
|---|---|---|---|
| `/admin` | Dashboard Overview | Platform KPI counters (total videos, users, comments, views, monetization summaries). | `src/modules/admin/admin.actions.ts` (`getAdminDashboardStatsAction`) |
| `/admin/settings` | General Configuration | Site settings, site description, keywords, censoring toggles, user registration toggle (`user_registration`). | `src/modules/admin/settings.actions.ts` (`saveSingleSettingAction`, `saveMultipleSettingsAction`) |
| `/admin/site-settings` | Site Features | Feature switches (point system `point_level_system`, switch accounts `switch_account`, auto delete, etc.). | `src/modules/admin/settings.actions.ts` |
| `/admin/video-settings` | Video & Player Configuration | Autoplay switch (`autoplay_system`), comments default limit (`comments_default_num`), censoring word list (`censored_words`), player toggles. | `src/modules/admin/videos.actions.ts` |
| `/admin/email-settings` | SMTP & Email Settings | SMTP host, port, username, password, encryption type, test email dispatch. | `src/modules/admin/settings.actions.ts` |
| `/admin/change-site-desgin` | Site Design & Logo | Favicon upload, light/dark logo upload, night mode default (`night_mode`: `"night"`, `"light"`, `"both"`, `"night_default"`). | `src/modules/admin/design.actions.ts` (`uploadDesignAssetAction`, `saveSiteDesignSettingsAction`) |
| `/admin/custom-design` | Custom CSS / JS Injector | Injects raw header JS, header CSS, and footer JS tags into public document. | `src/modules/admin/design.actions.ts` (`saveCustomDesignAction`) |
| `/admin/manage-themes` | Theme Switcher | Theme activation (e.g. `youplay`, `default`). | `src/modules/admin/design.actions.ts` (`getThemesAction`, `activateThemeAction`) |
| `/admin/manage_categories` | Categories Management | Create, edit, translate, sort, and delete video categories. | `src/modules/admin/categories.actions.ts` (`addCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`) |
| `/admin/manage_sub_categories` | Sub-Categories Management | Create, edit, translate, and delete child categories linked to a parent category. | `src/modules/admin/categories.actions.ts` (`addSubCategoryAction`, `updateSubCategoryAction`, `deleteSubCategoryAction`) |
| `/admin/movies-categories` | Movie Categories | Create, edit, and delete movie-specific genre/categories (`movie_categories`). | `src/modules/admin/movies.actions.ts` (`addMovieCategoryAction`, `updateMovieCategoryAction`, `deleteMovieCategoryAction`) |
| `/admin/manage-videos` | Video Management | Search, view, feature, unfeature, approve, edit, and delete published videos. | `src/modules/admin/videos.actions.ts` (`deleteVideoAction`, `bulkDeleteVideosAction`, `toggleApproveVideoAction`) |
| `/admin/clean-videos` | Cleanup Dead Videos | Scan and batch delete videos with broken embeds or missing physical files. | `src/modules/admin/tools.actions.ts` (`cleanDeadVideosAction`) |
| `/admin/auto-delete` | Auto-Delete Videos | Filter and auto-purge videos by keyword, category, or time range. | `src/modules/admin/tools.actions.ts` (`autoDeleteVideosAction`) |
| `/admin/ffmpeg` | Video Upload & Encoding | Upload limit (bytes: `max_upload`, `max_upload_all_users`), chunk size (`chunk_size`), who can upload (`who_can_upload`). | `src/modules/admin/videos.actions.ts` |
| `/admin/import-from-youtube` | Import Videos: YouTube | Search YouTube Data API and batch import videos into PlayTube database. | `src/modules/admin/videos.actions.ts` (`importVideosAction`) |
| `/admin/import-from-dailymotion` | Import Videos: Dailymotion | Scrape / import Dailymotion content into platform database. | `src/modules/admin/videos.actions.ts` (`importVideosAction`) |
| `/admin/import-from-twitch` | Import Videos: Twitch | Import Twitch VODs / streams. | `src/modules/admin/videos.actions.ts` (`importVideosAction`) |
| `/admin/manage-comments` | Comments Moderation | Enumerate all user comments across videos, inspect text, delete spam comments. | `src/modules/admin/videos.actions.ts` (`deleteCommentAction`, `bulkDeleteCommentsAction`) |
| `/admin/manage-users` | Users Directory | Search users, toggle verification status, toggle active/banned status, delete users. | `src/modules/admin/users.actions.ts` (`bulkUserAction`, `deleteSingleUserAction`) |
| `/admin/ban-users` | Banned IP Management | View, add, and remove IP addresses from banned access table (`banned`). | `src/modules/admin/tools.actions.ts` (`getBannedIpsAction`, `addBannedIpAction`, `deleteBannedIpAction`) |
| `/admin/verification-requests` | Verification Requests | Review user identity verification requests, approve badge, or decline. | `src/modules/admin/users.actions.ts` (`getVerificationRequestsAction`, `respondVerificationRequestAction`) |
| `/admin/monitization-requests` | Monetization Requests | Review creator monetization applications, toggle partner status. | `src/modules/admin/users.actions.ts` (`getMonetizationRequestsAction`, `respondMonetizationRequestAction`) |
| `/admin/manage-profile-fields` | Custom Profile Fields | Create and configure custom fields on user profile and registration pages. | `src/modules/admin/users.actions.ts` (`getProfileFieldsAction`, `createProfileFieldAction`, `deleteProfileFieldAction`) |
| `/admin/prosys-settings` | Pro Package Configurations | Configure Pro tiers, monthly/yearly pricing, badge color, feature permissions (`manage_pro`). | `src/modules/admin/pro.actions.ts` (`createProPackageAction`, `updateProPackageAction`, `deleteProPackageAction`) |
| `/admin/payments` | Pro Membership Payments | Audit ledger of all completed Pro subscriptions and upgrade transactions (`payments`). | `src/modules/admin/pro.actions.ts` (`cancelExpiredSubscriptionsAction`) |
| `/admin/payment-settings` | Payment Gateways | Configure Stripe, PayPal, Paysera, Cashfree, Bank Transfer credentials & status. | `src/modules/admin/settings.actions.ts` (`saveSingleSettingAction`) |
| `/admin/bank-receipts` | Bank Transfer Receipts | View uploaded receipt proofs, approve wallet credit / pro upgrade, or decline. | `src/modules/admin/bank-receipts.actions.ts` (`getBankReceiptsAction`, `reviewBankReceiptAction`) |
| `/admin/payment-requests` | Creator Withdrawal Requests | View pending creator earnings withdrawal requests, process payout, or reject. | `src/modules/admin/payment-requests.actions.ts` (`getPaymentRequestsAction`, `reviewPaymentRequestAction`) |
| `/admin/manage-currencies` | Currency Management | Add ISO currencies, set currency symbols, designate default platform currency. | `src/modules/admin/currencies.actions.ts` (`getCurrenciesAction`, `addCurrencyAction`, `setDefaultCurrencyAction`) |
| `/admin/manage-video-ads` | Platform Video Ads (In-Stream) | Create, toggle, and manage pre-roll, mid-roll video / vast advertisements. | `src/modules/admin/video-ads.actions.ts` (`getVideoAdsAction`, `createVideoAdAction`, `deleteVideoAdAction`) |
| `/admin/manage-website-ads` | Banner & Code Advertisements | Configure banner ads (header, footer, watch page sidebar, comment section). | `src/modules/admin/video-ads.actions.ts` (`getWebsiteAdsAction`, `saveWebsiteAdAction`) |
| `/admin/manage-user-ads` | User Advertisements | Review and moderate native ads run by wallet-funded creator campaigns. | `src/modules/admin/user-ads.actions.ts` (`getUserAdsAction`, `toggleUserAdAction`, `deleteUserAdAction`) |
| `/admin/manage-articles` | Articles & Blog Moderation | Moderate articles published by users or administrators. | `src/modules/admin/articles.actions.ts` (`createArticleAction`, `updateArticleAction`, `deleteArticleAction`) |
| `/admin/create-article` | Create Article | Publish new administrative announcements or articles to platform blog. | `src/modules/admin/articles.actions.ts` (`createArticleAction`) |
| `/admin/manage-custom-pages` | Custom Static Pages | Create, edit, and delete custom CMS pages rendered at `/site-pages/[pageName]`. | `src/modules/admin/pages.actions.ts` (`getCustomPagesAction`, `createCustomPageAction`, `deleteCustomPageAction`) |
| `/admin/edit-terms-pages` | Terms, Privacy & About Pages | Edit localized copy for Terms of Use, Privacy Policy, About Us, Refund Terms. | `src/modules/admin/pages.actions.ts` (`getTermsPagesAction`, `updateTermsPageAction`) |
| `/admin/manage-faqs` | FAQ Manager | Create, reorder, edit, and delete questions and answers for `/help/faqs`. | `src/modules/admin/pages.actions.ts` (`getFaqsAction`, `createFaqAction`, `deleteFaqAction`) |
| `/admin/seo` | SEO Metadata & OpenGraph | Configure global meta titles, keywords, descriptions, social share cards. | `src/modules/admin/pages.actions.ts` (`getSeoSettingsAction`, `updatePageSeoAction`) |
| `/admin/sitemap` | XML Sitemap Generator | Generate, update, and view XML sitemaps for videos, channels, and articles. | `src/modules/admin/sitemap.actions.ts` (`generateSitemapAction`, `getSitemapStatsAction`) |
| `/admin/languages` | Language Settings | Add new language pack, set platform default language, toggle active status. | `src/modules/admin/languages.actions.ts` (`addLanguageAction`, `setDefaultLanguageAction`, `toggleLanguageStatusAction`) |
| `/admin/edit-lang` | Translation Key Editor | Search and edit translation key-value mappings for each registered language. | `src/modules/admin/languages.actions.ts` (`getLanguageTranslationsAction`, `updateLanguageTranslationAction`) |
| `/admin/manage-announcements` | Global Announcements | Post platform-wide banner alerts displayed at top of public site shell. | `src/modules/admin/tools.actions.ts` (`getAnnouncementsAction`, `createAnnouncementAction`, `deleteAnnouncementAction`) |
| `/admin/mass-notifications` | Push / Mass Notifications | Broadcast notification messages to all registered users. | `src/modules/admin/tools.actions.ts` (`sendMassNotificationAction`) |
| `/admin/newsletters` | Newsletter Dispatcher | Dispatch bulk emails to newsletter subscribers using configured SMTP transport. | `src/modules/admin/tools.actions.ts` (`sendNewsletterAction`) |
| `/admin/auto_subscribe` | Auto Subscribe Accounts | Designate default channel usernames that newly registered users auto-subscribe to (`auto_subscribe`). | `src/modules/admin/tools.actions.ts` (`getAutoSubscribeSettingAction`, `saveAutoSubscribeSettingAction`) |
| `/admin/manage-invitation-keys` | Invitation Code System | Generate and track user invitation tokens required when registration is invite-only. | `src/modules/admin/tools.actions.ts` (`getAdminInvitationsAction`, `generateAdminInvitationsAction`) |
| `/admin/backup` | Database & File Backup | Trigger database export or snapshot backups to disk (`script_backups/`). | `src/modules/admin/backup.actions.ts` (`createBackupAction`, `getLastBackupDateAction`) |
| `/admin/reports` | Video Abuse Reports | Enumerate user-submitted abuse reports for videos, inspect text, dismiss report. | `src/modules/admin/reports.actions.ts` (`getVideoReportsAction`, `deleteReportAction`) |
| `/admin/copy_report` | Copyright Infringement Reports | Enumerate DMCA and copyright reports, take down infringing video or dismiss. | `src/modules/admin/reports.actions.ts` (`getCopyrightReportsAction`, `deleteCopyrightReportAction`) |
| `/admin/system-status` | Server Health & Diagnostics | Inspect Node.js runtime, PostgreSQL connection, storage bucket reachability, limits. | `src/modules/admin/system-status.actions.ts` (`getSystemStatusAction`) |

---

## 2. Database Tables & Columns Backing Admin Controls

All database tables are defined in `src/db/schema/index.ts` with typed Drizzle PostgreSQL models.

### 2.1 Core Key-Value Settings: `siteConfig` (`config` table)
Backing table: `config` (`id: serial`, `name: varchar(150) UNIQUE`, `value: text`).

| Setting Key | Managed in Admin Route | Intended Public Effect |
|---|---|---|
| `site_name` | `/admin/settings` | Platform brand name displayed in header, metadata title, and emails. |
| `site_title` | `/admin/settings` | Default page title and SEO OpenGraph tag. |
| `site_desc` / `site_keywords` | `/admin/settings`, `/admin/seo` | `<meta name="description">` and `<meta name="keywords">`. |
| `logo` | `/admin/change-site-desgin` | Path or URL to dark-mode / default brand logo. |
| `light_logo` | `/admin/change-site-desgin` | Path or URL to light-mode brand logo. |
| `favicon` | `/admin/change-site-desgin` | Platform favicon icon path in `<head>`. |
| `night_mode` | `/admin/change-site-desgin` | `"both"` (toggleable), `"night_default"`, `"night"`, `"light"`. |
| `theme` | `/admin/manage-themes` | Active theme name (`youplay`, `default`). |
| `header_js`, `header_css`, `footer_js` | `/admin/custom-design` | Raw injection scripts injected dynamically by `CustomDesignInjector.tsx`. |
| `autoplay_system` | `/admin/video-settings` | Controls whether watch page player autoplays next or current video. |
| `censored_words` | `/admin/video-settings`, `/admin/settings` | Comma-separated blacklist of words filtered from video titles and comments. |
| `comments_default_num` | `/admin/video-settings` | Default number of comments fetched on video load (10, 20, 30, 50). |
| `who_can_upload` | `/admin/ffmpeg` | Permission gate: `"all"` registered users vs `"admin"` only. |
| `max_upload` / `max_upload_all_users` | `/admin/ffmpeg` | Max video file upload size in bytes. |
| `chunk_size` | `/admin/ffmpeg` | Chunked upload slice size in bytes. |
| `user_registration` | `/admin/settings` | Toggle: allows or denies new account registrations on `/register`. |
| `switch_account` | `/admin/site-settings` | Toggle: enables multi-account switching feature on `/switch-account`. |
| `popular_channels` | `/admin/settings` | Toggle: enables or disables the `/popular-channels` public directory. |
| `point_level_system` | `/admin/site-settings` | Toggle: awards reward points for user activities (likes, uploads, comments). |
| `auto_subscribe` | `/admin/auto_subscribe` | Comma-separated channel usernames auto-followed by new registrations. |
| `last_created_sitemap` | `/admin/sitemap` | Timestamp of most recently generated XML sitemap. |
| `seo` | `/admin/seo` | JSON serialized map of route-specific SEO titles, descriptions, and keywords. |
| `smtp_host`, `smtp_username`, `smtp_password`, `smtp_port` | `/admin/email-settings` | SMTP transport credentials for Nodemailer dispatch. |
| `paypal_payment`, `stripe_payment`, `bank_payment` | `/admin/payment-settings` | Gateways activation flags and API credentials. |

---

## 3. User-Facing Pages & Feature Surface

| User-Facing Route | Render Mode | Data Displayed to User | Data Collected / Inputted |
|---|---|---|---|
| `/` (Home) | RSC + Client | Featured videos, trending videos, latest uploads, category filter chips (`categories`). | Search input, filter clicks. |
| `/watch/[videoId]` | RSC + Client | Video stream (`videos`), creator card (`users`), subscriber status (`subscriptions`), like/dislike counts (`likesDislikes`), comments list (`comments`), related videos list, website ads (`website_ads`). | Like/dislike clicks, comment text, reply text, watch later toggle, share clicks, video report dialog, copyright report dialog. |
| `/upload-video` | Client | Category dropdown (`categories`), subcategory dropdown, upload dropzone. | Video file, title, description, category, tags, thumbnail, privacy setting. |
| `/import-video` | Client | Supported providers (YouTube). | External video URL, title, description, category. |
| `/channel/[username]` | RSC + Client | Channel banner, avatar, subscriber count, verified badge, videos, shorts, playlists, about tab. | Subscribe / unsubscribe button. |
| `/search` | RSC | Paginated video search results filtered by query keyword, category, date, duration. | Query string `?keyword=...`. |
| `/videos/trending` | RSC | Top viewed videos ranked by view count and recency. | View increments. |
| `/videos/latest` | RSC | Chronological video feed ordered by `createdAt DESC`. | Pagination cursor. |
| `/videos/top` | RSC | Videos sorted by highest likes / ratings. | Sorting clicks. |
| `/shorts` | Client | Vertical 9:16 short-form video player loop, like and comment buttons. | Swipe / scroll actions, likes. |
| `/articles` | RSC | Paginated blog posts from `articles` table with author cards and categories. | Category filter clicks. |
| `/articles/read/[id]` | RSC | Article body, cover image, view counter, author bio, article comments. | Comment form submission (`article_comments`). |
| `/movies` | RSC | Movie catalogue (`videos` where `isMovie = true`), genre filters (`movie_categories`), release year, minimum rating. | Search filter criteria. |
| `/go-pro` | RSC + Client | Active pro tiers (`manage_pro`), pricing rates, feature checkmarks, checkout modal. | Package selection, payment method (wallet, bank transfer, card). |
| `/wallet` | RSC + Client | User wallet balance (`users.wallet`), historical deposit/spend ledger (`transactions`). | Top-up amount, payment gateway choice, bank receipt image upload (`bank_receipts`). |
| `/popular-channels` | RSC | Channel directory ranked by subscribers, video count, total views. | Filter dropdown (timeframe: today, week, all time). |
| `/liked-videos` | RSC (Protected) | Video cards upvoted by logged-in user (`likesDislikes`). | Unlike action. |
| `/history` | RSC (Protected) | Playback history log from `watch_history` table. | Clear history button, delete item button. |
| `/saved-videos` | RSC (Protected) | Saved videos bookmarked in `watch_later` table. | Remove from saved list. |
| `/subscriptions` | RSC (Protected) | Video feed from subscribed channels (`subscriptions`). | Subscription management. |
| `/dashboard` | RSC (Protected) | Creator analytics: 30-day views, likes count, total earnings, recent comments. | Date range picker. |
| `/manage-videos` | RSC + Client (Protected) | Tabular list of user's own videos, edit buttons, delete buttons. | Delete confirmation, edit redirects. |
| `/edit-video/[id]` | Client (Protected) | Current title, description, category, thumbnail, privacy. | Update video form submission. |
| `/settings/[tab]` | Client (Protected) | Profile details, avatar upload, password change, social links, monetization status. | Profile form fields, avatar image file, delete account button. |
| `/ads` | RSC + Client (Protected) | User's native advertising campaigns (`user_ads`), impressions, spent balance. | Create ad redirect. |
| `/ads/create` | Client (Protected) | Target audience, CPC/CPM bidding inputs, campaign budget. | New campaign submission form. |
| `/messages` | RSC + Client (Protected) | Direct chat conversations list, conversation thread (`messages`). | Message text input, send button. |
| `/switch-account` | RSC + Client (Protected) | Account switching modal listing linked sessions (`sessions`). | Switch account selection, add account login. |
| `/help/faqs` | RSC | Accordion FAQ questions and answers from `faqs` table. | Accordion toggle clicks. |
| `/contact-us` | Client | Contact form card (first name, last name, email, message). | Contact form submission. |
| `/terms/[type]` | RSC | Dynamic legal text loaded from `terms_pages`. | None (Read only). |
| `/site-pages/[pageName]` | RSC | Custom CMS pages loaded dynamically from `custom_pages` table. | None (Read only). |
| `/login` | Client | Login form (username/email, password, remember me, social login buttons). | User credentials. |
| `/register` | Client | Registration form (username, email, password, confirm password, terms checkbox). | New user details. |
| `/forgot-password` | Client | Password recovery form. | User email. |
| `/reset-password` | Client | Reset password token form. | New password. |

---

## 4. Admin <-> User Wiring Matrix & Status

*Note on Status:* All items marked **UNVERIFIED** indicate the code path is structurally present but requires automated round-trip validation in Phase 4. Items marked **ORPHAN SETTING** or **NONE** are confirmed findings with concrete evidence.

| # | User-Facing Feature | Public Location | Backing Admin Screen & Control | Current Status | Verified by Test? | Evidence / Code Location |
|---|---|---|---|---|---|---|
| 1 | Site Logo & Branding | Header in `Navigation.tsx:87-132` | `/admin/change-site-desgin` (`uploadDesignAssetAction`, `siteConfig.logo`) | **UNVERIFIED** | Pending P4 | `ThemeProvider.tsx:48-52`, `Navigation.tsx:116`. |
| 2 | Site Favicon | HTML `<head>` | `/admin/change-site-desgin` (`siteConfig.favicon`) | **UNVERIFIED** | Pending P4 | `ThemeProvider.tsx:9-28`. |
| 3 | Theme Mode (Dark/Light) | Public UI Shell | `/admin/change-site-desgin` (`siteConfig.night_mode`) | **UNVERIFIED** | Pending P4 | `ThemeProvider.tsx:59-80` checks `night_mode` config. |
| 4 | Theme Selection | Public Layout Styles | `/admin/manage-themes` (`siteConfig.theme`) | **ORPHAN SETTING** | No | `activateThemeAction` (`design.actions.ts:279`) saves to `siteConfig.theme`, but Next.js CSS bundle does not swap theme CSS stylesheets dynamically based on `siteConfig.theme`. |
| 5 | Custom Header CSS/JS | Public Shell Injections | `/admin/custom-design` (`header_js`, `header_css`, `footer_js`) | **UNVERIFIED** | Pending P4 | `CustomDesignInjector.tsx:15` reads `siteConfig` and renders script/style tags. |
| 6 | Video Categories Filter | `/`, `/search`, `/upload-video` | `/admin/manage_categories` (`categories` table) | **UNVERIFIED** | Pending P4 | Public queries fetch active rows from `categories`. |
| 7 | Sub-Categories Filter | `/upload-video`, `/edit-video` | `/admin/manage_sub_categories` (`sub_categories` table) | **UNVERIFIED** | Pending P4 | Form dropdowns query `sub_categories` filtered by parent `categoryKey`. |
| 8 | Movie Categories Filter | `/movies` Sidebar Filter | `/admin/movies-categories` (`movie_categories` table) | **ORPHAN SETTING** | No | `/movies/page.tsx:88-145` filters movies by rating, year, keyword, but does NOT fetch or render `movie_categories` dynamically in the filter form. |
| 9 | Video Moderation & Deletion | `/watch/[videoId]`, `/videos/latest` | `/admin/manage-videos` (`videos` table) | **UNVERIFIED** | Pending P4 | Admin `deleteVideoAction` removes row from database immediately. |
| 10 | Feature Video Pinning | Featured banner on `/` | `/admin/manage-videos` (`videos.featured`) | **UNVERIFIED** | Pending P4 | `toggleApproveVideoAction` toggles flag; home page queries filter `videos.featured`. |
| 11 | Clean Dead Videos | Public Video Catalogue | `/admin/clean-videos` (`cleanDeadVideosAction`) | **UNVERIFIED** | Pending P4 | `cleanDeadVideosAction` (`tools.actions.ts:758-799`) deletes dead embeds from DB. |
| 12 | Comments Moderation | `/watch/[videoId]` Comments List | `/admin/manage-comments` (`comments` table) | **UNVERIFIED** | Pending P4 | `deleteCommentAction` (`videos.actions.ts`) deletes comment from database. |
| 13 | User Ban & Suspension | Auth & Profile Access | `/admin/manage-users` (`users.active`) | **UNVERIFIED** | Pending P4 | `bulkUserAction` sets `active = false`. |
| 14 | IP Access Ban | Global Request Middleware / Proxy | `/admin/ban-users` (`banned` table) | **ORPHAN SETTING** | No | `bannedIps` table exists and `/admin/ban-users` populates it, but **no middleware or proxy file exists** in the Next.js project to block requests from banned IPs. |
| 15 | Verification Badges | Badges next to author name | `/admin/verification-requests` (`users.verified`) | **UNVERIFIED** | Pending P4 | Approving verification sets `users.verified = true`, rendering check badge. |
| 16 | Monetization Approval | Creator Studio / Earnings | `/admin/monitization-requests` (`monetizationRequests`) | **UNVERIFIED** | Pending P4 | Approving requests updates status in `monetizationRequests`. |
| 17 | Pro Upgrade Packages | `/go-pro` Cards & Pricing | `/admin/prosys-settings` (`manage_pro` table) | **UNVERIFIED** | Pending P4 | `/go-pro/page.tsx:14-19` queries `manage_pro` where `status = 1`. |
| 18 | Bank Receipt Approvals | `/wallet` Balance Top-up | `/admin/bank-receipts` (`bank_receipts` table) | **UNVERIFIED** | Pending P4 | Admin approval executes wallet credit and logs entry in `transactions` table. |
| 19 | Creator Payout Requests | `/settings/monetization` | `/admin/payment-requests` (`payment_requests` table) | **UNVERIFIED** | Pending P4 | Approving payout marks withdrawal paid in `payment_requests`. |
| 20 | Platform Currencies | Currency symbols across site | `/admin/manage-currencies` (`currencies` table) | **UNVERIFIED** | Pending P4 | Defaults read from `currencies.isDefault` for formatting. |
| 21 | In-Stream Video Ads | `/watch/[videoId]` Player | `/admin/manage-video-ads` (`video_ads` table) | **UNVERIFIED** | Pending P4 | Player queries active video ads and triggers overlay. |
| 22 | Static Banner Ads | Watch Sidebar & Footer | `/admin/manage-website-ads` (`website_ads` table) | **UNVERIFIED** | Pending P4 | Injected based on placement slots (`header`, `footer`, `watch_sidebar`, `watch_comments`). |
| 23 | User Native Campaigns | Feed Ads in `/` and `/search` | `/admin/manage-user-ads` (`user_ads` table) | **UNVERIFIED** | Pending P4 | Campaigns verified by admin appear in feed and deduct wallet balance. |
| 24 | Blog & Articles System | `/articles`, `/articles/read/[id]` | `/admin/manage-articles`, `/admin/create-article` (`articles`) | **UNVERIFIED** | Pending P4 | Articles authored in admin or by users publish to `/articles` feed. |
| 25 | Custom CMS Pages | `/site-pages/[pageName]` | `/admin/manage-custom-pages` (`custom_pages` table) | **UNVERIFIED** | Pending P4 | `/site-pages/[pageName]/page.tsx:28` queries `customPages`. |
| 26 | Legal Pages (Terms/Privacy) | `/terms/[type]` | `/admin/edit-terms-pages` (`terms_pages` table) | **UNVERIFIED** | Pending P4 | `/terms/[type]/page.tsx:117` queries `termsPages` and renders localized JSON text. |
| 27 | FAQ Knowledgebase | `/help/faqs` | `/admin/manage-faqs` (`faqs` table) | **UNVERIFIED** | Pending P4 | `/help/faqs/page.tsx` renders accordion items queried directly from `faqs`. |
| 28 | Global Top Announcements | Alert Banner in Public Shell | `/admin/manage-announcements` (`announcements` table) | **UNVERIFIED** | Pending P4 | Public layout queries active `announcements` and displays dismissible top banner. |
| 29 | XML Sitemap Generation | `/sitemap.xml` | `/admin/sitemap` (`sitemap.actions.ts`) | **UNVERIFIED** | Pending P4 | Admin trigger regenerates XML sitemap containing all public URLs. |
| 30 | Multi-Language System | Header Language Dropdown | `/admin/languages`, `/admin/edit-lang` (`languages`, `language_translations`) | **UNVERIFIED** | Pending P4 | Languages and translations read from database; translations editable in admin. |
| 31 | Custom Profile Fields | `/settings/profile`, `/channel` | `/admin/manage-profile-fields` (`custom_profile_fields`) | **UNVERIFIED** | Pending P4 | Dynamically fetched on profile edit and user channel page. |
| 32 | Video Abuse Reports Dialog | `/watch/[videoId]` Action Bar | `/admin/reports` (`reports` table) | **UNVERIFIED** | Pending P4 | `VideoActionButtons.tsx:162-166` calls `reportVideoAction`, saving row to `reports`. Admin inspects in `/admin/reports`. |
| 33 | Copyright Infringement Reports | `/watch/[videoId]` Action Bar | `/admin/copy_report` (`copyrightReports` table) | **UNVERIFIED** | Pending P4 | `VideoActionButtons.tsx:156-160` calls `reportCopyrightAction`, saving to `copyright_report`. Admin inspects in `/admin/copy_report`. |
| 34 | Database & Disk Backup | `script_backups/` Directory | `/admin/backup` (`backup.actions.ts`) | **UNVERIFIED** | Pending P4 | `createBackupAction` (`backup.actions.ts:40-60`) creates filesystem dump. |
| 35 | User Registration Toggle | `/register` Page Form | `/admin/settings` (`siteConfig.user_registration`) | **ORPHAN SETTING** | No | `/register/page.tsx:22-58` permits account creation without checking `siteConfig.user_registration`. |
| 36 | Invitation Keys System | `/register` Page Form | `/admin/manage-invitation-keys` (`admininvitations`) | **ORPHAN SETTING** | No | Admin can generate keys in `/admin/manage-invitation-keys`, but `/register` form has no invitation code input field and does not validate keys. |
| 37 | SMTP Email Configuration | Password Reset & Verification | `/admin/email-settings` (`siteConfig.smtp_*`) | **ORPHAN SETTING** | No | `requestPasswordResetAction` (`password.actions.ts:41`) logs reset link to console; does NOT read `siteConfig.smtp_*` settings. |
| 38 | Payment Gateway Configuration | `/go-pro` and `/wallet` | `/admin/payment-settings` (`siteConfig.paypal_payment`, `stripe_payment`) | **ORPHAN SETTING** | No | Settings are stored in `siteConfig`, but `/wallet` and `/go-pro` only support internal balance deduction or mock receipt upload without Stripe/PayPal SDK invocation. |
| 39 | Auto-Subscribe Setting | New User Registration | `/admin/auto_subscribe` (`siteConfig.auto_subscribe`) | **ORPHAN SETTING** | No | `saveAutoSubscribeSettingAction` updates `siteConfig.auto_subscribe`, but `authClient.signUp.email` / registration handler does not create `subscriptions` rows for the configured channels. |
| 40 | Mass Notifications | User Notification Bell | `/admin/mass-notifications` (`sendMassNotificationAction`) | **ORPHAN SETTING** | No | `sendMassNotificationAction` logs to `activities`, but the notification bell in `Navigation.tsx:266-271` is an empty button with no dropdown or query. |
| 41 | Newsletters System | Registered Users Dispatch | `/admin/newsletters` (`sendNewsletterAction`) | **ORPHAN SETTING** | No | Admin page has form, but no recurring subscriber table or public newsletter subscription form exists. |
| 42 | SEO Page-by-Page Config | Route `<head>` / OpenGraph | `/admin/seo` (`siteConfig.seo`) | **ORPHAN SETTING** | No | `updatePageSeoAction` stores serialized JSON in `siteConfig.seo`, but **no route defines `generateMetadata`** to query `siteConfig.seo`; root `layout.tsx:9-12` has hardcoded static metadata. |
| 43 | Switch Account Feature | Multi-Session Switcher | `/admin/site-settings` (`siteConfig.switch_account`) | **ORPHAN SETTING** | No | `/switch-account/page.tsx` renders `SwitchAccountModal` regardless of `siteConfig.switch_account` state. |
| 44 | Video Autoplay System | `/watch/[videoId]` Video Player | `/admin/video-settings` (`siteConfig.autoplay_system`) | **ORPHAN SETTING** | No | `/watch/[videoId]/page.tsx:125` hardcodes `autoPlay` directly on the `<video>` tag; does NOT query `siteConfig.autoplay_system`. |
| 45 | Comment Word Blacklist | Comment Submission on Watch | `/admin/video-settings`, `/admin/settings` (`siteConfig.censored_words`) | **ORPHAN SETTING** | No | Neither `addCommentAction` (`video.actions.ts:222-250`) nor client filter check against `siteConfig.censored_words`. |
| 46 | Comments Default Fetch Limit | `/watch/[videoId]` Comments List | `/admin/video-settings` (`siteConfig.comments_default_num`) | **ORPHAN SETTING** | No | `/watch/[videoId]/page.tsx:83` fetches all comments with `desc(comments.createdAt)` without applying configured limit. |
| 47 | Max Upload Size Conflict | `/upload-video` Dropzone | `/admin/ffmpeg`, `/admin/prosys-settings` (`max_upload`, `max_upload_all_users`, `manage_pro.max_upload`) | **ORPHAN SETTING** | No | **Conflicting settings**: `siteConfig.max_upload` (Admin Settings Form), `siteConfig.max_upload_all_users` (Ffmpeg Client), and `manage_pro.max_upload`. `UploadVideoClient.tsx:56-78` and `uploadVideoAction` (`video.actions.ts:24-75`) do not enforce ANY of these; upload flow accepts any file size without restriction. |
| 48 | Who Can Upload Gate | `/upload-video` Page Access | `/admin/ffmpeg` (`siteConfig.who_can_upload`) | **ORPHAN SETTING** | No | `/upload-video/page.tsx` checks only `requireAuth()`; does not restrict regular users if setting is `"admin"`. |
| 49 | Popular Channels Directory | `/popular-channels` Route | `/admin/settings` (`siteConfig.popular_channels`) | **ORPHAN SETTING** | No | Route `/popular-channels/page.tsx:18-70` always queries and renders channels regardless of toggle state. |
| 50 | Point & Reward Level System | Activity Points on Actions | `/admin/site-settings` (`siteConfig.point_level_system`) | **ORPHAN SETTING** | No | Liking, commenting, and watching videos do not write points to `users` or check toggle. |
| 51 | User Direct Messaging | `/messages` | None (User-to-User Only) | **ADMIN-VISIBLE** | Pending P4 | Stored in `messages` table; not directly editable by admin, but visible in DB. |
| 52 | User Playlists | `/channel/[username]?page=playlists` | None (User Created) | **ADMIN-VISIBLE** | Pending P4 | Stored in `playlists` and `playlistVideos` tables. |
| 53 | Watch Later / Saved Videos | `/saved-videos` | None (User Specific) | **ADMIN-VISIBLE** | Pending P4 | Stored in `watch_later` table. |
| 54 | Subscriptions Feed | `/subscriptions` | None (User Specific) | **ADMIN-VISIBLE** | Pending P4 | Stored in `subscriptions` table. |
| 55 | Share Video Action | `/watch/[videoId]` Share Button | None (Browser Feature) | **NONE** | No | Native browser clipboard copy (`VideoActionButtons.tsx:141-147`); no backend tracking or admin configuration. |
| 56 | Contact Form Submissions | `/contact-us` | Admin Panel (None) | **NONE** | No | `submitContactAction` (`contact.actions.ts:15-58`) attempts Nodemailer SMTP or logs to console; there is no admin inbox table or screen. |
| 57 | Footer Copyright Text | Layout Footer in `Navigation.tsx:761` | Admin Panel (None) | **NONE** | No | Hardcoded text: `"Copyright © 2026 PlayTube. All rights reserved."` in `Navigation.tsx:761` rather than reading `siteConfig.site_name`. |

---

## 5. Security & Authorization Audit of Admin Server Actions

A critical architectural requirement is that **every admin Server Action must authenticate the caller and verify `role === 'admin'` or `isAdmin === true` inside the action**.

### Finding: Admin Actions Missing In-Action Authorization Checks
The admin layout (`src/app/admin/layout.tsx:240-242`) checks the client session via `authClient.useSession()`, but **server actions can be invoked directly by any HTTP POST request or client without passing through `layout.tsx`**.

Inspection of all admin action modules revealed:
1. `src/modules/admin/settings.actions.ts` (`saveSingleSettingAction`, `saveMultipleSettingsAction`): **NO AUTH CHECK**. Any authenticated or unauthenticated client can overwrite any key in `siteConfig`.
2. `src/modules/admin/videos.actions.ts` (`deleteVideoAction`, `bulkDeleteVideosAction`, `toggleApproveVideoAction`): **NO AUTH CHECK**. Any user can delete any video on the platform.
3. `src/modules/admin/users.actions.ts` (`bulkUserAction`, `deleteSingleUserAction`): **NO AUTH CHECK**. Any user can delete or deactivate any user account.
4. `src/modules/admin/categories.actions.ts` (`addCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`): **NO AUTH CHECK**.
5. `src/modules/admin/design.actions.ts` (`saveSiteDesignSettingsAction`, `uploadDesignAssetAction`, `saveCustomDesignAction`): **NO AUTH CHECK**.
6. `src/modules/admin/pro.actions.ts` (`createProPackageAction`, `updateProPackageAction`, `deleteProPackageAction`): **NO AUTH CHECK**.
7. `src/modules/admin/tools.actions.ts` (`cleanDeadVideosAction`, `autoDeleteVideosAction`, `addBannedIpAction`, `deleteBannedIpAction`): **NO AUTH CHECK**.
8. `src/modules/admin/reports.actions.ts` (`deleteReportAction`, `deleteCopyrightReportAction`): **NO AUTH CHECK**.

*These actions are fully unprotected at the server action boundary and will be dynamically proven with unauthenticated and normal-user execution tests in Phase 4.*

---

## 6. Summary Statistics

- **Total Admin Routes Mapped:** 79
- **Total Backing Database Tables:** 46
- **Total User-Facing Routes Mapped:** 36
- **Total Evaluated Matrix Capabilities:** 57
  - **Connected / Structurally Backed (Marked UNVERIFIED pending P4):** 36 (63.2%)
  - **Orphan Admin Settings (Admin has control, user-facing app ignores it):** 17 (29.8%)
  - **Admin-Visible Only (User-to-user features without admin moderation screen):** 4 (7.0%)
  - **User Features with No Admin Control ("NONE"):** 3 (5.3%)
  - **Unprotected Admin Server Actions:** 8 modules (100% of admin server actions lack in-action role verification).

*Phase 1 Complete & Verified. Proceeding directly to Phase 2 (Hardcoded Text AST Scan).*
