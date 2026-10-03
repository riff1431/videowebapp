"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { PlayTubeSwitch } from "./PlayTubeSwitch";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";

interface PaymentSettingsClientProps {
  initialConfig: Record<string, string>;
}

export function PaymentSettingsClient({ initialConfig }: PaymentSettingsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [, startTransition] = useTransition();

  const updateSetting = (key: string, val: string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    startTransition(async () => {
      await saveSingleSettingAction(key, val);
    });
  };

  const handleToggle = (key: string, currentVal: string, onVal = "on", offVal = "off") => {
    const isCurrentlyOn = currentVal === onVal || currentVal === "1";
    const nextVal = isCurrentlyOn ? offVal : onVal;
    updateSetting(key, nextVal);
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Payment Configuration
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Settings</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Payment Configuration</span>
        </nav>
      </div>

      {/* Info notice matching screenshot */}
      <div className="w-full bg-[#d9edf7] dark:bg-[#1a384c] border border-[#bce8f1] dark:border-[#22506d] text-[#31708f] dark:text-[#8ac9eb] px-4 py-3 rounded-md text-xs">
        <strong>Info:</strong> For more information on how to setup payment gateways, please visit our <a href="https://docs.playtubescript.com" target="_blank" rel="noreferrer" className="underline font-semibold">documentation</a> page.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN                                                               */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* Card: Withdrawal Settings */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
              Withdrawal Settings
            </h6>

            <div className="bg-[#d9edf7] dark:bg-[#1a384c] border border-[#bce8f1] dark:border-[#22506d] text-[#31708f] dark:text-[#8ac9eb] px-3.5 py-2.5 rounded text-xs mb-5">
              Users can send withdrawal requests via any of these methods
            </div>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Bank Transfer */}
              <div className="pt-0 flex items-center justify-between">
                <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                  Bank Transfer
                </span>
                <PlayTubeSwitch
                  name="bank_withdrawal"
                  checked={config["bank_withdrawal"] === "on" || config["bank_withdrawal"] === "1"}
                  onChange={() => handleToggle("bank_withdrawal", config["bank_withdrawal"] || "off")}
                />
              </div>

              {/* Paypal */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                  Paypal
                </span>
                <PlayTubeSwitch
                  name="paypal_withdrawal"
                  checked={config["paypal_withdrawal"] === "on" || config["paypal_withdrawal"] === "1" || !config["paypal_withdrawal"]}
                  onChange={() => handleToggle("paypal_withdrawal", config["paypal_withdrawal"] ?? "on")}
                />
              </div>

              {/* Skrill */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                  Skrill
                </span>
                <PlayTubeSwitch
                  name="skrill_withdrawal"
                  checked={config["skrill_withdrawal"] === "on" || config["skrill_withdrawal"] === "1"}
                  onChange={() => handleToggle("skrill_withdrawal", config["skrill_withdrawal"] || "off")}
                />
              </div>

              {/* Custom Method */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                  Custom Method
                </span>
                <PlayTubeSwitch
                  name="custom_withdrawal"
                  checked={config["custom_withdrawal"] === "on" || config["custom_withdrawal"] === "1"}
                  onChange={() => handleToggle("custom_withdrawal", config["custom_withdrawal"] || "off")}
                />
              </div>

              {/* Minimum withdrawal request */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">
                  Minimum withdrawal request
                </label>
                <input
                  type="text"
                  value={config["m_withdrawal"] ?? "50"}
                  onChange={(e) => updateSetting("m_withdrawal", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Minimum withdrawal the users can request
                </span>
              </div>
            </div>
          </div>

          {/* Card: Payment Settings (PayPal) */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Payment Settings
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* PayPal Payment Method Toggle */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    PayPal Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Enable PayPal to receive payments from ads and pro packages.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="paypal"
                  checked={config["paypal"] === "on" || config["paypal"] === "yes"}
                  onChange={() => handleToggle("paypal", config["paypal"] || "off", "yes", "no")}
                />
              </div>

              {/* PayPal Currency */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  PayPal Currency
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Set your PayPal currency, this will be used only on PayPal.
                </p>
                <select
                  value={config["paypal_currency"] ?? "USD"}
                  onChange={(e) => updateSetting("paypal_currency", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              {/* PayPal Mode */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  PayPal Mode
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Choose the mode your application is using, for testing use the SandBox mode.
                </p>
                <select
                  value={config["paypal_mode"] ?? "sandbox"}
                  onChange={(e) => updateSetting("paypal_mode", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="sandbox">SandBox</option>
                  <option value="live">Live</option>
                </select>
              </div>

              {/* PayPal Client ID */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  PayPal Client ID
                </label>
                <input
                  type="text"
                  value={config["paypal_id"] ?? ""}
                  onChange={(e) => updateSetting("paypal_id", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Set your PayPal application ID.
                </span>
              </div>

              {/* PayPal Secret Key */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  PayPal Secret Key
                </label>
                <input
                  type="password"
                  value={config["paypal_secret"] ?? ""}
                  onChange={(e) => updateSetting("paypal_secret", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Set your PayPal application secret key.
                </span>
              </div>
            </div>
          </div>

          {/* Card: Configure Stripe (Credit Cards) Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure Stripe (Credit Cards) Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Stripe Payment Method */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Stripe Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Enable Stripe to receive payments by credit cards.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="stripe_payment"
                  checked={config["stripe_payment"] === "on" || config["stripe_payment"] === "yes"}
                  onChange={() => handleToggle("stripe_payment", config["stripe_payment"] || "off", "yes", "no")}
                />
              </div>

              {/* Stripe Currency */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Stripe Currency
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Set your Stripe currency, this will be used only on Stripe.
                </p>
                <select
                  value={config["stripe_currency"] ?? "USD"}
                  onChange={(e) => updateSetting("stripe_currency", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              {/* Stripe API Secret Key */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Stripe API Secret Key
                </label>
                <input
                  type="password"
                  value={config["stripe_secret"] ?? ""}
                  onChange={(e) => updateSetting("stripe_secret", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your Stripe secret key that starts with sk_
                </span>
              </div>

              {/* Stripe Publishable Key */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  value={config["stripe_publishable"] ?? ""}
                  onChange={(e) => updateSetting("stripe_publishable", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your Stripe publishable key that starts with pk_
                </span>
              </div>
            </div>
          </div>

          {/* Card: Configure PayStack (Credit Cards) Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure PayStack (Credit Cards) Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Paystack Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Get paid by Paystack payment provider.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="paystack_payment"
                  checked={config["paystack_payment"] === "on" || config["paystack_payment"] === "yes"}
                  onChange={() => handleToggle("paystack_payment", config["paystack_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={config["paystack_secret_key"] ?? ""}
                  onChange={(e) => updateSetting("paystack_secret_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your paystack account secret key.
                </span>
              </div>
            </div>
          </div>

          {/* Card: Configure CashFree (Credit Cards) Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure CashFree (Credit Cards) Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    CashFree Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Enable CashFree to receive payments by credit cards.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="cashfree_payment"
                  checked={config["cashfree_payment"] === "on" || config["cashfree_payment"] === "yes"}
                  onChange={() => handleToggle("cashfree_payment", config["cashfree_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  CashFree Mode
                </label>
                <select
                  value={config["cashfree_mode"] ?? "sandbox"}
                  onChange={(e) => updateSetting("cashfree_mode", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="sandbox">SandBox</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Client Id</label>
                <input
                  type="text"
                  value={config["cashfree_client_id"] ?? ""}
                  onChange={(e) => updateSetting("cashfree_client_id", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Client Secret</label>
                <input
                  type="password"
                  value={config["cashfree_secret_key"] ?? ""}
                  onChange={(e) => updateSetting("cashfree_secret_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: Configure PaySera Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure PaySera Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Paysera Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Get paid by PaySera payment provider.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="paysera_payment"
                  checked={config["paysera_payment"] === "on" || config["paysera_payment"] === "yes"}
                  onChange={() => handleToggle("paysera_payment", config["paysera_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Project Id</label>
                <input
                  type="text"
                  value={config["paysera_project_id"] ?? ""}
                  onChange={(e) => updateSetting("paysera_project_id", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Account Password</label>
                <input
                  type="password"
                  value={config["paysera_password"] ?? ""}
                  onChange={(e) => updateSetting("paysera_password", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN                                                              */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* Card: Configure 2Checkout (Credit Cards) Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure 2Checkout (Credit Cards) Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    2Checkout Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Enable 2Checkout to receive payments by credit cards.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="checkout_payment"
                  checked={config["checkout_payment"] === "on" || config["checkout_payment"] === "yes"}
                  onChange={() => handleToggle("checkout_payment", config["checkout_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">2Checkout Mode</label>
                <select
                  value={config["checkout_mode"] ?? "sandbox"}
                  onChange={(e) => updateSetting("checkout_mode", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="sandbox">SandBox</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">2Checkout Currency</label>
                <select
                  value={config["2checkout_currency"] ?? "USD"}
                  onChange={(e) => updateSetting("2checkout_currency", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Seller ID</label>
                <input
                  type="text"
                  value={config["checkout_seller_id"] ?? ""}
                  onChange={(e) => updateSetting("checkout_seller_id", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Publishable Key</label>
                <input
                  type="text"
                  value={config["checkout_publishable_key"] ?? ""}
                  onChange={(e) => updateSetting("checkout_publishable_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Private Key</label>
                <input
                  type="password"
                  value={config["checkout_private_key"] ?? ""}
                  onChange={(e) => updateSetting("checkout_private_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: Configure Local Bank Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure Local Bank Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Bank Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Get paid by bank transfers.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="bank_payment"
                  checked={config["bank_payment"] === "on" || config["bank_payment"] === "yes"}
                  onChange={() => handleToggle("bank_payment", config["bank_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">Bank Description</label>
                <textarea
                  rows={4}
                  value={config["bank_description"] ?? ""}
                  onChange={(e) => updateSetting("bank_description", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Set your IBAN, SWIFT code from the code above.
                </span>
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">Bank transfer note</label>
                <textarea
                  rows={3}
                  value={config["bank_transfer_note"] ?? "In order to confirm the bank transfer, you will need to upload a receipt or take a screenshot of your transfer within 1 day from your payment date."}
                  onChange={(e) => updateSetting("bank_transfer_note", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your note to the customer after he submits the payment.
                </span>
              </div>
            </div>
          </div>

          {/* Card: Configure RazorPay Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure RazorPay (Credit Cards) Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    RazorPay Payment Method
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Get paid by RazorPay payment provider.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="razorpay_payment"
                  checked={config["razorpay_payment"] === "on" || config["razorpay_payment"] === "yes"}
                  onChange={() => handleToggle("razorpay_payment", config["razorpay_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Application ID</label>
                <input
                  type="text"
                  value={config["razorpay_key"] ?? ""}
                  onChange={(e) => updateSetting("razorpay_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Application Secret</label>
                <input
                  type="password"
                  value={config["razorpay_secret"] ?? ""}
                  onChange={(e) => updateSetting("razorpay_secret", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: Configure Iyzipay Payment Method */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Configure Iyzipay Payment Method
            </h6>

            <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <span className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Iyzipay Payment Method
                  </span>
                </div>
                <PlayTubeSwitch
                  name="iyzipay_payment"
                  checked={config["iyzipay_payment"] === "on" || config["iyzipay_payment"] === "yes"}
                  onChange={() => handleToggle("iyzipay_payment", config["iyzipay_payment"] || "off", "yes", "no")}
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Iyzipay Mode</label>
                <select
                  value={config["iyzipay_mode"] ?? "sandbox"}
                  onChange={(e) => updateSetting("iyzipay_mode", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="sandbox">SandBox</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Iyzipay Key</label>
                <input
                  type="text"
                  value={config["iyzipay_key"] ?? ""}
                  onChange={(e) => updateSetting("iyzipay_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Iyzipay Secret Key</label>
                <input
                  type="password"
                  value={config["iyzipay_secret_key"] ?? ""}
                  onChange={(e) => updateSetting("iyzipay_secret_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
