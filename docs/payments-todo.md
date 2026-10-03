# Payment Gateways Integration & Requirements Specification

## 1. Overview
PlayTube supports user wallet top-up, creator monetization payout requests, and Pro membership packages. The platform provides configuration switches in the Admin Panel (`/admin/payment-settings`) for:
- **PayPal** (`paypal_payment`, `paypal_mode`, `paypal_id`, `paypal_secret`)
- **Stripe** (`stripe_payment`, `stripe_id`, `stripe_secret`)
- **Bank Transfer & Receipts** (`bank_payment`, `bank_description`, `bank_transfer_note`)
- **Paysera, CoinPayments, 2Checkout, Cashfree, Iyzipay, SecurionPay**

## 2. Currently Supported & Active Flows
1. **Wallet Internal Transfers & Deductions:**
   - Real-time balance transfer (`transferBalanceToWalletAction`, `transferWalletToBalanceAction`).
   - Upgrading to PRO (`upgradeToProAction`) directly via wallet balance deduction.
2. **Bank Transfer / Deposit Receipt System:**
   - Supported via `/admin/bank-receipts`. Users submit offline receipts, and administrators review, verify, and credit user wallets with automatic notification dispatch.
3. **Pending Full Gateway API Implementations:**
   - Stripe Checkout / PaymentIntent Webhook
   - PayPal REST SDK v2 Webhook
   - Crypto CoinPayments IPN

## 3. Production Gateway Requirements & Next Steps
- **Stripe:** Install `@stripe/stripe-js` and `stripe`. Create API route `/api/payments/stripe/checkout-session` and `/api/payments/stripe/webhook` validating event signatures and crediting user wallet upon `checkout.session.completed`.
- **PayPal:** Create `/api/payments/paypal/create-order` and `/api/payments/paypal/capture-order` validating client authorizations.
- **Admin Configuration Coupling:** Gateways set to "off" in `/admin/payment-settings` are cleanly hidden from user selection to prevent mock or broken transactions.
