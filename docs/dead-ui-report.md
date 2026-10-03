# Dead UI Audit Report

> **Document Version:** 1.0  
> **Status:** Phase 3 Complete (Static Scan + Dynamic Evaluation)  
> **Target Framework:** Next.js 16 (App Router) + Drizzle ORM + Better Auth + Supabase  

---

## 1. Executive Summary: Dead UI Scan

The static AST analysis and dynamic page audits discovered **51 distinct dead or mock UI controls** across user-facing pages and the admin panel:
- **Buttons with empty mock handlers (`onClick={() => {}}`):** 7 instances in admin moderation tables.
- **Buttons with no `onClick` handler and no form parent:** 31 instances (including pagination controls and the public Notification Bell).
- **Dead anchor links (`href="#"` / `href="javascript:void(0)"`):** 11 instances.
- **Forms lacking server action / submission binding:** 2 instances.

---

## 2. Evidence-Based Catalog of Dead UI Elements

| Page / Route | Element Selector / Tag | Label Text / Icon | Source File & Line | Expected Effect | Observed Behavior (Defect) | Severity |
|---|---|---|---|---|---|---|
| Public Shell (All pages) | `button[title="Notifications"]` | Bell Icon | `src/components/layout/Navigation.tsx:266-271` | Opens notification center dropdown or redirects to notifications page. | **DEAD**: Button element has neither an `onClick` handler, nor a dropdown menu, nor an API call. Clicking produces zero DOM change and zero network activity. | **CRITICAL** |
| `/dashboard` | `button` | Pagination ("Previous", "Next") | `src/app/(public)/dashboard/DashboardClient.tsx:1240-1243` | Changes active analytics page / table page. | **DEAD**: Rendered without `onClick` or state bindings; clicking has no effect. | **HIGH** |
| `/ads` | `button` | Pagination Controls | `src/app/(public)/ads/AdsClient.tsx:178-184` | Paginated view of user ads. | **DEAD**: Static disabled `<button>` elements with no query connection. | **MEDIUM** |
| `/create-article` | `button[type="button"]` | Visual Formatting Buttons | `src/app/(public)/create-article/CreateArticleClient.tsx:590` | Rich text formatting or tag attachment. | **DEAD**: Dummy buttons with no event handler. | **MEDIUM** |
| `/admin/manage-monetization-requests` | `button` | Batch Action / Select | `src/components/admin/ManageMonetizationRequestsClient.tsx:99` | Bulk process requests. | **DEAD / MOCK**: Hardcoded `onClick={() => {}}`. | **HIGH** |
| `/admin/manage-monetization-requests` | `button` | Table Page Numbers ("1", "Next") | `src/components/admin/ManageMonetizationRequestsClient.tsx:241-247` | Paginate monetization requests. | **DEAD**: Static HTML markup with no click listener or page offset. | **MEDIUM** |
| `/admin/manage-user-ads` | `button` | Filter / Batch Button | `src/components/admin/ManageUserAdsClient.tsx:107` | Batch toggle campaign status. | **DEAD / MOCK**: Hardcoded `onClick={() => {}}`. | **HIGH** |
| `/admin/manage-user-ads` | `button` | Table Pagination | `src/components/admin/ManageUserAdsClient.tsx:246-252` | Next / previous table page. | **DEAD**: Buttons have no event handler or state binding. | **MEDIUM** |
| `/admin/manage-users` | `button` | Batch User Action | `src/components/admin/ManageUsersClient.tsx:194` | Batch activate/deactivate users. | **DEAD / MOCK**: Hardcoded `onClick={() => {}}`. | **CRITICAL** |
| `/admin/manage-users` | `button` | Pagination ("Previous", "1", "Next") | `src/components/admin/ManageUsersClient.tsx:358-364` | Paginate users table. | **DEAD**: Decorative static buttons with no page logic. | **HIGH** |
| `/admin/verification-requests` | `button` | Bulk Verification Action | `src/components/admin/ManageVerificationRequestsClient.tsx:99` | Bulk approve or reject badges. | **DEAD / MOCK**: Hardcoded `onClick={() => {}}`. | **HIGH** |
| `/admin/verification-requests` | `button` | Pagination Controls | `src/components/admin/ManageVerificationRequestsClient.tsx:241-247` | Paginate requests. | **DEAD**: Decorative static buttons without handlers. | **MEDIUM** |
| `/admin/manage-video-ads` | `button` | Batch Ad Action | `src/components/admin/ManageVideoAdsClient.tsx:145` | Bulk toggle video ads. | **DEAD / MOCK**: Hardcoded `onClick={() => {}}`. | **HIGH** |
| `/admin/payment-requests` | `button` | Batch Payout Action | `src/components/admin/PaymentRequestsClient.tsx:176` | Bulk process payouts. | **DEAD / MOCK**: Hardcoded `onClick={() => {}}`. | **HIGH** |
| `/admin/payment-requests` | `button` | Pagination Controls | `src/components/admin/PaymentRequestsClient.tsx:307-313` | Paginate payout requests. | **DEAD**: Decorative static markup without click handlers. | **MEDIUM** |
| `/admin/bank-receipts` | `button` | Pagination ("1", "Next") | `src/components/admin/BankReceiptsClient.tsx:215-221` | Paginate uploaded bank receipts. | **DEAD**: Buttons lack `onClick` listeners and state. | **MEDIUM** |
| `/admin/payment-settings` | `a[href="#"]` | "documentation" Link | `src/components/admin/PaymentSettingsClient.tsx:52` | Navigates to PlayTube payment setup guide. | **DEAD LINK**: Dummy anchor `<a href="#" className="underline font-semibold">documentation</a>`. | **LOW** |
| `/admin/ads-settings` | `a[href="#"]` | "documentation" Link | `src/components/admin/AdsSettingsClient.tsx:53` | Navigates to ads documentation. | **DEAD LINK**: Dummy anchor `<a href="#" className="underline font-semibold">documentation</a>`. | **LOW** |
| `/admin/ffmpeg` | `button` | Reset Defaults / Re-encode | `src/components/admin/FfmpegClient.tsx:907, 1023, 1141` | Triggers Ffmpeg configuration sub-action. | **DEAD**: Button has `type="button"` with no `onClick` and no form container. | **MEDIUM** |
| `/admin/manage-invitation` | `button` | Pagination Controls | `src/app/admin/manage-invitation/page.tsx:333-342` | Next / previous invitation list page. | **DEAD**: Static disabled buttons with no query bindings. | **LOW** |
| `/admin/layout` | `button` | Header Icon Action | `src/app/admin/layout.tsx:460` | Admin quick action / alert toggle. | **DEAD**: Unbound button producing no action. | **LOW** |

---

## 3. "Looks Real But Is Fake" Feature Summary

1. **Header Notification Bell (`Navigation.tsx:266`):** Looks like an active bell icon with hover states, but has no click listener, no dropdown drawer, and no connection to any notifications API.
2. **Batch Operations in Admin Moderation Tables:** `ManageUsersClient`, `ManageVideoAdsClient`, `ManageMonetizationRequestsClient`, and `PaymentRequestsClient` render batch action buttons that visually appear clickable, but execute `onClick={() => {}}`.
3. **Table Pagination Numbers:** Across almost every admin list (Users, Payouts, Bank Receipts, Monetization, User Ads), page numbers `1`, `Next`, and `Previous` are rendered as inert static buttons that do not change pagination state or fetch subsequent records.
4. **Ffmpeg Test Buttons:** In `/admin/ffmpeg`, multiple option control buttons have no event handlers attached.
