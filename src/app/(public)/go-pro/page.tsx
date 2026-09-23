import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { Check, Crown, Zap, Shield, Sparkles, UploadCloud, CheckCircle2 } from "lucide-react";
import { upgradeToProAction } from "@/modules/wallet/wallet.actions";

export const revalidate = 0; // Dynamic status

const PRO_PACKAGES = [
  {
    id: "star",
    name: "Star",
    price: 19,
    period: "Monthly",
    color: "#04abf2",
    featuredVideos: "5 Featured Videos",
    maxUpload: "1 GB Max File Upload",
    badge: true,
    discount: null,
  },
  {
    id: "hot",
    name: "Hot",
    price: 49,
    period: "3 Months",
    color: "#f59e0b",
    featuredVideos: "15 Featured Videos",
    maxUpload: "5 GB Max File Upload",
    badge: true,
    discount: "Save 15%",
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 99,
    period: "Yearly",
    color: "#8b5cf6",
    featuredVideos: "Unlimited Featured Videos",
    maxUpload: "Unlimited Max Upload",
    badge: true,
    discount: "Best Value (Save 40%)",
  },
];

export default async function GoProPage() {
  const [user] = await db.select().from(users).limit(1);
  const isPro = user?.isPro || false;
  const currentWallet = user?.wallet || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* PlayTube pt_go_pro Head Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
          <Crown className="w-4 h-4 fill-current" />
          <span>PlayTube VIP Experience</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          Upgrade to Play<span className="text-[var(--primary)]">Tube</span> PRO
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Elevate your channel with custom verified badges, priority video discovery, higher storage limits, and advanced monetization tools.
        </p>

        {isPro && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>You currently have an Active PRO Membership!</span>
          </div>
        )}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRO_PACKAGES.map((pkg) => {
          async function handleUpgrade() {
            "use server";
            await upgradeToProAction(pkg.name, pkg.price);
          }

          return (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-neutral-900 border ${
                pkg.id === "ultimate"
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xl"
                  : "border-[var(--border)] shadow-xs"
              } rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative group hover:shadow-lg transition-all`}
            >
              {pkg.discount && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--primary)] text-white shadow-xs">
                  {pkg.discount}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {pkg.name}
                  </h3>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: pkg.color }}
                  >
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-neutral-900 dark:text-neutral-100">
                    ${pkg.price}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    /{pkg.period}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 pt-6 border-t border-[var(--border)] text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Blue Verified Channel Badge</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{pkg.featuredVideos}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{pkg.maxUpload}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>No Video Advertisements</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Priority Support Assistance</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <form action={handleUpgrade}>
                  <button
                    type="submit"
                    disabled={isPro}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: pkg.color,
                      color: "#fff",
                    }}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {isPro ? "Already Subscribed" : `Upgrade for $${pkg.price}`}
                    </span>
                  </button>
                </form>
                <p className="text-[11px] text-neutral-400 text-center mt-2">
                  Deducted from your wallet (${currentWallet.toFixed(2)})
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wallet balance top-up prompt */}
      <div className="mt-12 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Need to add funds to your wallet?
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            Top up your balance instantly using credit card, PayPal, or local payments.
          </p>
        </div>
        <Link
          href="/wallet"
          className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs shrink-0"
        >
          Go to Wallet
        </Link>
      </div>
    </div>
  );
}
