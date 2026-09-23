import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { CreditCard, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentSettingsPage() {
  const paymentKeys = [
    "paypal_payment",
    "paypal_mode",
    "paypal_id",
    "paypal_secret",
    "stripe_payment",
    "stripe_secret",
    "stripe_publishable",
    "min_withdrawal_amount",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, paymentKeys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  async function handleSave(formData: FormData) {
    "use server";
    await updateAdminSettingsAction(formData);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Payment & Gateway Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure PayPal, Stripe API keys, and creator withdrawal thresholds
          </p>
        </div>
      </div>

      <form action={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* PayPal Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
            PayPal Integration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                PayPal Gateway
              </label>
              <select
                name="paypal_payment"
                defaultValue={configObj.paypal_payment || "yes"}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              >
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Environment
              </label>
              <select
                name="paypal_mode"
                defaultValue={configObj.paypal_mode || "sandbox"}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                PayPal Client ID
              </label>
              <input
                type="text"
                name="paypal_id"
                defaultValue={configObj.paypal_id || ""}
                placeholder="AX..._client_id"
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                PayPal Secret Key
              </label>
              <input
                type="password"
                name="paypal_secret"
                defaultValue={configObj.paypal_secret || ""}
                placeholder="••••••••••••••••"
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Stripe Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
            Stripe Integration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Stripe Gateway
              </label>
              <select
                name="stripe_payment"
                defaultValue={configObj.stripe_payment || "yes"}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              >
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Minimum Withdrawal Threshold ($)
              </label>
              <input
                type="number"
                name="min_withdrawal_amount"
                defaultValue={configObj.min_withdrawal_amount || "50"}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Stripe Secret Key
              </label>
              <input
                type="password"
                name="stripe_secret"
                defaultValue={configObj.stripe_secret || ""}
                placeholder="sk_test_..."
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Payment Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
