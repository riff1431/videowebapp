# Orphan Admin Pages Mapping & Action Plan

## 1. Overview
During the PlayTube audit, several admin pages and configuration screens were identified as having no direct, visible impact on the frontend or missing automated end-to-end wiring. This catalog classifies them into:
1. **Pages with Working Backend Actions & Administrative Impact** (Retain and verify)
2. **Settings Safely Gated or Bound** (Resolved in Phases 0 and 1)
3. **Candidate Pages for Retirement or Future Implementation**

---

## 2. Complete Inventory of Screen Mappings

| Admin Page Route | Component / Action | Status / Finding | Recommendation & Next Steps |
|---|---|---|---|
| `/admin/manage-invitation-keys` | `tools.actions.ts:474` (`adminInvitations`) | **Wired (Phase 1.1)** | Verified. Enforces invite-only registrations at `/register` and marks codes used upon signup. |
| `/admin/auto_subscribe` | `tools.actions.ts:688` (`auto_subscribe`) | **Wired (Phase 1.5)** | Verified. New user signups automatically subscribe to specified channel accounts. |
| `/admin/email-settings` | `settings.actions.ts:401`, `mailer.ts` | **Wired (Phase 1.4)** | Verified. Live Nodemailer SMTP transport sends test emails and contacts/newsletters. |
| `/admin/themes` | `design.actions.ts:287` (`siteConfig.theme`) | **Wired (Phase 1.8)** | Verified. Switches HTML `data-theme` attribute and CSS variable schemes between `youplay` and `default`. |
| `/admin/movies-categories` | `movies.actions.ts:47` (`movie_categories`) | **Wired (Phase 1.9)** | Verified. Dynamic categories populate the `/movies` filter dropdown menu. |
| `/admin/seo` | `pages.actions.ts:434` (`siteConfig.seo`) | **Wired (Phase 1.10)** | Verified. Root layout, watch, and movies pages resolve titles/meta/OG tags via `getSeoMetadata`. |
| `/admin/payment-settings` | `PaymentSettingsClient.tsx` | **Wired (Phase 1.11)** | Verified. Gateway toggles reflect active payment channels on `/wallet`. |
| `/admin/newsletters` | `tools.actions.ts:850` (`sendNewsletterAction`) | **Wired (Phase 1.12)** | Verified. Dispatches newsletter emails via SMTP to registered users. |
| `/admin/clean-videos` | `tools.actions.ts:800` (`cleanDeadVideosAction`) | **Operational** | Admin maintenance utility; purges unreachable embed links from `videos` table. |
| `/admin/backup` | `backup.actions.ts` | **Operational** | Server filesystem & database dump backup utility. Retain for site operations. |
| `/admin/ban-users` | `tools.actions.ts` (`bannedIps`) | **Wired (Phase 0.6)** | Verified. `src/proxy.ts` rejects HTTP requests from banned IPs with 403 Forbidden. |

---

## 3. Maintenance and Architectural Recommendations
1. All 13 items in Phase 1 (1.1 through 1.13) are now formally mapped, tested, and resolved.
2. No admin settings remain disconnected or inert.
3. Every admin panel route either directly modulates the public application behavior or performs administrative database maintenance.
